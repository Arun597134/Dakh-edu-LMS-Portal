import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyEnrollments } from '../services/endpoints';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      getMyEnrollments()
        .then(({ data }) => setEnrollments(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Account Settings</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8 flex items-center gap-8 border-b border-gray-200 bg-gray-50">
            <div className="w-24 h-24 rounded border-4 border-white shadow-md bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-bold uppercase">
              {user.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <span className="inline-block mt-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-gray-900 text-white">
                {user.role} Account
              </span>
            </div>
          </div>

          <div className="p-8">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="text-gray-900 font-medium">{user.name}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="text-gray-900 font-medium">{user.email}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Role</label>
                <div className="text-gray-900 text-sm font-medium capitalize">{user.role}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                <div className="text-green-600 font-bold text-sm flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {user.role === 'student' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">My Enrolled Courses</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center p-4"><LoadingSpinner text="" /></div>
              ) : enrollments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enrollments.map((en) => (
                    <Link key={en._id} to={`/courses/${en.course._id}`} className="block p-4 border border-gray-200 rounded-md hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gray-200 rounded object-cover flex-shrink-0 flex items-center justify-center font-bold text-gray-400 text-xs">
                          {en.course.thumbnail ? <img src={en.course.thumbnail} alt="" className="w-full h-full rounded object-cover" /> : 'IMG'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{en.course.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{en.course.domain}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">You are not enrolled in any courses yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
