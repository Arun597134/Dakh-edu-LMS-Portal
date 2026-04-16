import { useState, useEffect } from 'react';
import { getAssessments } from '../../services/endpoints';
import { Link } from 'react-router-dom';

const StudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  
  useEffect(() => {
    getAssessments().then(({ data }) => setAssessments(data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
         <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Assessments & Tasks</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {assessments.map(a => (
             <div key={a._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
               <h3 className="font-bold text-xl text-gray-900 mb-2">{a.title}</h3>
               <p className="text-sm text-gray-500 mb-6">{a.questions.length} Questions • Task / Internship Assessment</p>
               <Link to={`/assessments/${a._id}`} className="btn-primary w-full shadow-none border border-primary-600">Start Assessment</Link>
             </div>
           ))}
           {assessments.length === 0 && (
             <div className="col-span-2 text-center text-gray-500 py-12 border-2 border-dashed border-gray-300 rounded-lg">
               No assessments are currently active for you.
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default StudentAssessments;
