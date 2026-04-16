import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getCourses, generateQuestionsAI, createAssessment, getAssessments, getAssessmentAttempts } from '../../services/endpoints';
import { HiOutlineSparkles, HiOutlinePlus, HiOutlineCheck, HiOutlineChartBar, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ManageAssessments = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tracker State
  const [expandedAssessment, setExpandedAssessment] = useState(null);
  const [attemptsData, setAttemptsData] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // AI Generation Form State
  const [showGenForm, setShowGenForm] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [level, setLevel] = useState(1);
  const [count, setCount] = useState(3);
  
  // Generated Questions State
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchInstructorData();
  }, [user]);

  const fetchInstructorData = async () => {
    try {
      const { data: cData } = await getCourses({ instructor: user._id });
      setCourses(cData.courses || []);
      const { data: aData } = await getAssessments();
      setAssessments(aData);
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!courseId || !title || !prompt) return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const { data } = await generateQuestionsAI({ prompt, count: Number(count), level: Number(level) });
      setQuestions(data);
      toast.success('AI successfully generated questions!');
    } catch (err) {
      toast.error('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const handleUpdateOption = (qIndex, oIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[oIndex] = value;
    setQuestions(newQs);
  };

  const handlePublish = async () => {
    try {
      await createAssessment({
        title,
        courseId,
        questions,
        published: true
      });
      toast.success('Assessment Published Successfully!');
      setQuestions([]);
      setShowGenForm(false);
      setTitle(''); setPrompt('');
      fetchInstructorData();
    } catch (err) {
      toast.error('Failed to publish assessment');
    }
  };

  const handleViewTracker = async (id) => {
    if (expandedAssessment === id) {
      setExpandedAssessment(null);
      return;
    }
    setExpandedAssessment(id);
    setLoadingAttempts(true);
    try {
      const { data } = await getAssessmentAttempts(id);
      setAttemptsData(data);
    } catch (err) {
      toast.error("Failed to load performance data");
    } finally {
      setLoadingAttempts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-5xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Assessments</h1>
            <p className="text-gray-500 mt-1">Generate and manage smart assessments for your courses.</p>
          </div>
          <button onClick={() => setShowGenForm(!showGenForm)} className="btn-primary gap-2">
            <HiOutlineSparkles /> {showGenForm ? 'Cancel Creation' : 'New AI Assessment'}
          </button>
        </div>

        {showGenForm && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            {questions.length === 0 ? (
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Target Course</label>
                    <select required className="input-field cursor-pointer" value={courseId} onChange={e => setCourseId(e.target.value)}>
                      <option value="">Select a Course...</option>
                      {courses.map(c => <option key={c._id} value={c._id}>[{c.domain}] {c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Assessment Title</label>
                    <input type="text" required className="input-field" placeholder="e.g. React Basics Final Test" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">AI Generation Prompt</label>
                    <textarea required rows={3} className="input-field" placeholder="Describe what the questions should be about..." value={prompt} onChange={e => setPrompt(e.target.value)}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Difficulty Level</label>
                    <select className="input-field cursor-pointer" value={level} onChange={e => setLevel(e.target.value)}>
                      <option value="1">Level 1 - Easy</option>
                      <option value="2">Level 2 - Medium</option>
                      <option value="3">Level 3 - Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Number of Questions</label>
                    <input type="number" required min="1" max="50" className="input-field" value={count} onChange={e => setCount(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="submit" disabled={loading} className="btn-primary gap-2 bg-purple-600 hover:bg-purple-700">
                    <HiOutlineSparkles /> {loading ? 'Generating...' : 'Generate with Gemini AI'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><HiOutlineCheck className="text-green-500"/> Review Generated Questions</h3>
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Question {qIndex + 1}</label>
                        <input type="text" className="input-field font-semibold" value={q.questionText} onChange={e => handleUpdateQuestion(qIndex, 'questionText', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded">
                            <input 
                              type="radio" 
                              name={`correct-${qIndex}`} 
                              checked={q.correctOptionIndex === oIndex}
                              onChange={() => handleUpdateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                              className="w-4 h-4 text-green-600 cursor-pointer"
                            />
                            <input type="text" className="w-full text-sm border-none focus:outline-none focus:ring-0 p-0" value={opt} onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <button onClick={() => setQuestions([])} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200">Discard</button>
                  <button onClick={handlePublish} className="btn-primary">Publish Assessment to Students</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <HiOutlineChartBar className="text-primary-600" /> Assessment Tracker & Performance
            </h3>
          </div>
          {assessments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {assessments.map(a => (
                <div key={a._id} className="flex flex-col">
                  <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{a.title}</h4>
                      <p className="text-sm text-gray-500">{a.questions.length} Questions • Course: {a.courseId?.title}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        Active
                      </div>
                      <button 
                        onClick={() => handleViewTracker(a._id)}
                        className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1"
                      >
                        <HiOutlineChartBar /> {expandedAssessment === a._id ? 'Hide Tracker' : 'View Tracker'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Tracker Section */}
                  {expandedAssessment === a._id && (
                    <div className="bg-gray-50 border-t border-gray-100 p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                      <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-primary-600">📊</span> Student Performance Tracking
                      </h5>
                      {loadingAttempts ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Loading performance data...</div>
                      ) : attemptsData.length > 0 ? (
                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Student Name</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Score</th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {attemptsData.map(attempt => {
                                const passed = (attempt.score / attempt.maxScore) >= 0.5;
                                return (
                                  <tr key={attempt._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{attempt.studentId?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{attempt.studentId?.email || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap font-bold">
                                      {attempt.score} / {attempt.maxScore}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {passed ? 'Passed' : 'Failed'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white rounded border border-gray-200 text-gray-500">
                          <p>No attempts have been recorded for this assessment yet.</p>
                          <p className="text-xs mt-1">Students enrolled in this course will appear here once they complete the assessment.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No assessments created yet. Use the Gemini AI generator above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAssessments;
