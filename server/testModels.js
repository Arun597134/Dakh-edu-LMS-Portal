import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('AIzaSyAjnrC4EBl75VGs3Ew-5T3Lkda8D0Ok52Y');

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const res = await model.generateContent('Say exactly: Hello');
    console.log(`SUCCESS for ${modelName}:`, res.response.text().trim());
  } catch(e) {
    console.log(`FAILED for ${modelName}:`, e.message.split('\n')[0]);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-pro');
  await testModel('gemini-pro');
  await testModel('gemini-2.5-flash');
}
run();
