import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCourse, getCourseProgress } from '../../services/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CertificatePage = () => {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && courseId) {
      Promise.all([getCourse(courseId), getCourseProgress(courseId)])
        .then(([courseRes, progRes]) => {
          setCourse(courseRes.data);
          setProgress(progRes.data);
        })
        .finally(() => setLoading(false));
    }
  }, [user, courseId]);

  if (loading) return <LoadingSpinner text="Generating Certificate..." />;
  if (!course || !progress) return <div className="text-center py-20">Data not found.</div>;

  if (progress.completionPercentage <= 75) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Not Available</h2>
        <p className="text-gray-600 mb-6">You must complete more than 75% of the course to generate a certificate.</p>
        <Link to={`/courses/${courseId}`} className="btn-primary">Return to Course</Link>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* Certificate container */}
        <div className="bg-white p-12 border-[20px] border-gray-900 rounded-sm shadow-2xl relative text-center">
          <div className="border-4 border-double border-gray-200 p-16 relative">
            <h1 className="text-5xl font-serif text-gray-900 mb-4">Certificate of Completion</h1>
            <p className="text-xl text-gray-500 uppercase tracking-widest font-semibold mb-12">Dakh Edu Platform</p>
            
            <p className="text-lg text-gray-700 italic mb-4">This hereby certifies that</p>
            <h2 className="text-4xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-8 inline-block px-12">
              {user.name}
            </h2>
            
            <p className="text-lg text-gray-700 mb-4">has successfully completed the course</p>
            <h3 className="text-3xl font-extrabold text-primary-600 mb-12">{course.title}</h3>
            
            <div className="flex justify-between items-end mt-16 px-12">
               <div className="text-left w-48">
                 <div className="border-b-2 border-gray-400 pb-2 mb-2 font-bold text-gray-900">{currentDate}</div>
                 <div className="text-sm text-gray-500 font-bold uppercase">Date</div>
               </div>
               
               <div className="w-32 h-32 rounded-full border-4 border-yellow-500 flex items-center justify-center -mb-8 bg-yellow-50 text-yellow-700 font-bold rotate-12 diploma-seal">
                 OFFICIAL<br/>CERTIFICATE
               </div>
               
               <div className="text-right w-48">
                 <div className="border-b-2 border-gray-400 pb-2 mb-2 font-bold text-gray-900 cursive text-xl">{course.instructor?.name || 'Instructor'}</div>
                 <div className="text-sm text-gray-500 font-bold uppercase">Course Instructor</div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 text-center flex justify-center gap-4 no-print">
          <button onClick={() => window.print()} className="btn-primary">Print / Save as PDF</button>
          <Link to={`/courses/${courseId}`} className="btn-secondary">Back to Course</Link>
        </div>
      </div>
      
      {/* Print CSS inline */}
      <style>{`
        @media print {
          body { visibility: hidden; }
          .no-print { display: none; }
          .max-w-5xl { width: 100%; max-width: none; }
          div[class*="min-h-screen"] { visibility: visible; position: absolute; left: 0; top: 0; right: 0; padding: 0; margin: 0; background: white; }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;
