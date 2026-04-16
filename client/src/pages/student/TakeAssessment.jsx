import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAssessment, submitAssessment } from '../../services/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getAssessment(id).then(({ data }) => {
      setAssessment(data);
      setAnswers(new Array(data.questions.length).fill(null));
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (qIndex, oIndex) => {
    const newAns = [...answers];
    newAns[qIndex] = oIndex;
    setAnswers(newAns);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) return alert('Please answer all questions!');
    setSubmitting(true);
    try {
      const { data } = await submitAssessment(id, { answers });
      setResult(data);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner text="Loading Assessment..." />;
  if (!assessment) return <div className="text-center py-20">Assessment not found.</div>;

  if (result) {
    const pass = (result.score / result.maxScore) >= 0.5;
    
    let parsedFeedback = [];
    if (result.feedback) {
      try { parsedFeedback = JSON.parse(result.feedback); } catch(e) { console.error("Failed to parse feedback"); }
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
        <div className="bg-white max-w-3xl w-full p-8 md:p-10 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold mb-6 ${pass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {result.score}/{result.maxScore}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Completed</h2>
            <p className="text-lg text-gray-600 mb-8">{pass ? 'Excellent work! You have passed this test.' : 'Review your performance and try again soon.'}</p>
          </div>

          {(result.score < result.maxScore) && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">📝</span> Review Incorrect Answers
              </h3>
              <div className="space-y-6">
                {assessment.questions.map((q, idx) => {
                  const isCorrect = result.answers[idx] === q.correctOptionIndex;
                  if (isCorrect) return null; // Show only wrong answers
                  
                  const fbObj = parsedFeedback.find(f => f.questionIndex === idx) || {};
                  
                  return (
                    <div key={idx} className="bg-red-50 border border-red-100 p-5 rounded-lg space-y-4">
                      <p className="font-semibold text-gray-800"><span className="text-red-500 mr-2">Q:</span> {q.questionText}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                        <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                          <p className="text-gray-500 font-medium mb-1">Your Answer:</p>
                          <p className="text-red-700 font-semibold">{result.answers[idx] != null ? q.options[result.answers[idx]] : 'Not Answered'}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-100 shadow-sm">
                          <p className="text-gray-500 font-medium mb-1">Correct Answer:</p>
                          <p className="text-green-700 font-semibold">{q.options[q.correctOptionIndex]}</p>
                        </div>
                      </div>

                      {fbObj.explanation && (
                        <div className="bg-white p-4 rounded-lg border border-primary-100 shadow-sm mt-4">
                          <p className="flex items-center text-primary-800 font-semibold mb-2 text-sm uppercase tracking-wider">
                            <span className="mr-2 text-lg">💡</span> AI Explanation
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed">{fbObj.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 text-center border-t border-gray-200 pt-8">
            <Link to="/profile" className="btn-primary inline-flex items-center px-8 py-3 text-lg transition-transform hover:scale-105">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-gray-400 text-sm mt-1">Please read each question carefully.</p>
          </div>
          
          <div className="p-6 space-y-10">
            {assessment.questions.map((q, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  <span className="text-primary-600 mr-2">{idx + 1}.</span> {q.questionText}
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[idx] === optIdx ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name={`q-${idx}`} className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500" checked={answers[idx] === optIdx} onChange={() => handleSelect(idx, optIdx)} />
                      <span className="ml-3 font-medium text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-8 py-3 text-lg">
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;
