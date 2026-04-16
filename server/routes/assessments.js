import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get assessments (students get published for enrolled courses, instructors get their own)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'instructor') {
      const assessments = await Assessment.find({ instructorId: req.user._id }).populate('courseId', 'title domain');
      return res.json(assessments);
    } 
    // Student view - EXCLUSIVELY fetch assessments for courses they are actually enrolled in.
    const enrollments = await Enrollment.find({ student: req.user._id });
    const enrolledCourseIds = enrollments.map(e => e.course);

    const assessments = await Assessment.find({ 
      published: true,
      courseId: { $in: enrolledCourseIds }
    }).populate('courseId', 'title domain');
    
    res.json(assessments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create assessment (Instructor)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const assessment = await Assessment.create({
      ...req.body,
      instructorId: req.user._id
    });
    res.status(201).json(assessment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Generate Questions via Gemini AI
router.post('/generate', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { prompt, count, level } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY not configured on server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const aiPrompt = `Generate exactly ${count || 3} multiple choice questions about "${prompt}". 
The difficulty level should be ${level} out of 3 (1=Easy, 2=Medium, 3=Hard).
Return ONLY a valid JSON array. DO NOT return any markdown formatting or \`\`\`json code blocks. 
Each object in the array must strictly follow this exact JSON structure:
{
  "questionText": "the string question",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctOptionIndex": 0,
  "level": ${level}
}`;

    const result = await model.generateContent(aiPrompt);
    let text = result.response.text();
    text = text.replace(/```json/ig, '').replace(/```/g, '').trim();

    try {
      const parsedQuestions = JSON.parse(text);
      res.json(parsedQuestions);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", text);
      res.status(500).json({ message: 'Failed to process AI response. Please try again.' });
    }
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: err.message }); 
  }
});

// Update & Publish Assessment
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(assessment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single assessment
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    res.json(assessment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Submit attempt (Student)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Not found' });
    
    let score = 0;
    const { answers } = req.body; // array of indexes
    let wrongAnswersData = [];

    assessment.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        score += 1;
      } else {
        wrongAnswersData.push({
          questionIndex: idx,
          questionText: q.questionText,
          selectedOption: answers[idx] != null ? q.options[answers[idx]] : "Not Answered",
          correctOption: q.options[q.correctOptionIndex]
        });
      }
    });

    let feedbackString = "";
    if (wrongAnswersData.length > 0) {
      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });

          const prompt = `A student took an assessment and got some answers wrong. Provide encouraging, concise feedback for each wrong answer. Explain why the correct answer is right.
Here is the data (JSON format):
${JSON.stringify(wrongAnswersData)}
Output ONLY a JSON array of objects. Each object must have:
- "questionIndex": Number (matching the input)
- "explanation": String (Brief explanation of the correct answer)`;

          const resultAI = await model.generateContent(prompt);
          let text = resultAI.response.text();
          text = text.replace(/```json/ig, '').replace(/```/g, '').trim();
          
          JSON.parse(text); // Ensure valid JSON
          feedbackString = text;
        } catch (err) {
          console.error("Gemini feedback error:", err);
          feedbackString = JSON.stringify([{ explanation: "AI feedback failed to generate." }]);
        }
      } else {
        feedbackString = JSON.stringify([{ explanation: "AI feedback unavailable (No API Key)." }]);
      }
    }

    const attempt = await AssessmentAttempt.create({
      assessmentId: assessment._id,
      studentId: req.user._id,
      answers,
      score,
      maxScore: assessment.questions.length,
      feedback: feedbackString
    });

    res.json(attempt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get attempts for instructor visualization
router.get('/:id/attempts', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.find({ assessmentId: req.params.id }).populate('studentId', 'name email');
    res.json(attempts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
