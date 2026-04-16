import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrollments, getCourseProgress } from '../../services/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineBookOpen, HiOutlineCheckCircle } from 'react-icons/hi2';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getMyEnrollments();
        setEnrollments(data);
        const results = await Promise.all(data.map(async (e) => {
          try { const { data: p } = await getCourseProgress(e.course._id); return { id: e.course._id, p }; }
          catch { return { id: e.course._id, p: { completionPercentage: 0 } }; }
        }));
        const map = {};
        results.forEach(({ id, p }) => { map[id] = p; });
        setProgressMap(map);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your workspace..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Learning</h1>
          <p className="text-gray-500 mt-1">Resume your courses and track your progress.</p>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const pct = progressMap[course._id]?.completionPercentage || 0;
              return (
                <Link key={enrollment._id} to={`/courses/${course._id}`} className="card block h-full">
                  <div className="flex flex-col h-full p-6">
                    <div className="mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{course.domain}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700">{Math.round(pct)}% Complete</span>
                        {pct >= 100 && <span className="text-green-600 font-bold flex items-center gap-1"><HiOutlineCheckCircle /> Done</span>}
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-1">
                        <HiOutlineBookOpen className="text-gray-400" /> {course.sessions?.length || 0} Lectures Included
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">You aren't enrolled in any courses yet.</h3>
            <p className="text-gray-500 mb-6">Browse our catalog to find your next career step.</p>
            <Link to="/courses" className="btn-primary">Explore Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
