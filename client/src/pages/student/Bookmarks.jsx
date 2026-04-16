import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookmarks } from '../../services/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineBookmark, HiOutlineClock, HiArrowRight } from 'react-icons/hi2';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks().then(({ data }) => setBookmarks(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading bookmarked lectures..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <HiOutlineBookmark className="text-primary-600" /> My Bookmarks
          </h1>
          <p className="text-gray-500 mt-1">Quickly resume your saved lectures.</p>
        </div>

        {bookmarks.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
            {bookmarks.map((b) => (
              <Link key={b._id} to={`/courses/${b.session?.courseId}/session/${b.session?._id}`} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{b.session?.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><HiOutlineClock /> {b.session?.duration} mins</span>
                    <span className="border-l border-gray-300 pl-4">From course: {b.courseTitle || 'Unknown Course'}</span>
                  </div>
                </div>
                <HiArrowRight className="text-gray-400 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bookmarks found</h3>
            <p className="text-gray-500 mb-6">You can bookmark lectures while watching them to save them here.</p>
            <Link to="/courses" className="btn-secondary">Go to Course Catalog</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
