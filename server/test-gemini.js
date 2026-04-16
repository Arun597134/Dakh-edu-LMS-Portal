import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('AIzaSyAjnrC4EBl75VGs3Ew-5T3Lkda8D0Ok52Y');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function run() {
  try {
    const res = await model.generateContent('Generate exactly 1 multiple choice questions about React');
    console.log('SUCCESS:', res.response.text());
  } catch(e) {
    console.error('FAILED_ERROR_MESSAGE:', e.message);
  }
}
run();
