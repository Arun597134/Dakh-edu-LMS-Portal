import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../../store/slices/courseSlice';
import CourseCard from '../../components/common/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiMagnifyingGlass, HiMiniXMark } from 'react-icons/hi2';

const domains = ['All', 'Web', 'AI/ML', 'DevOps', 'Mobile', 'Data Science', 'Cloud', 'Cybersecurity', 'Blockchain'];

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || 'All');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const dispatch = useDispatch();
  const { courses, totalPages, total, isLoading } = useSelector((state) => state.courses);

  useEffect(() => {
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (selectedDomain !== 'All') params.domain = selectedDomain;
    dispatch(fetchCourses(params));
    
    const urlParams = {};
    if (search) urlParams.search = search;
    if (selectedDomain !== 'All') urlParams.domain = selectedDomain;
    if (page > 1) urlParams.page = page;
    setSearchParams(urlParams);
  }, [dispatch, search, selectedDomain, page, setSearchParams]);

  const clearFilters = () => { setSearch(''); setSelectedDomain('All'); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Course Catalog</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar / Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Search</h3>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search courses..."
                  className="input-field pl-9"
                />
                {search && (
                  <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <HiMiniXMark />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="flex flex-col space-y-2">
                {domains.map((domain) => (
                  <label key={domain} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="domain"
                      value={domain}
                      checked={selectedDomain === domain}
                      onChange={() => { setSelectedDomain(domain); setPage(1); }}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className={`ml-3 text-sm transition-colors ${selectedDomain === domain ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {domain}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {(search || selectedDomain !== 'All') && (
              <button onClick={clearFilters} className="w-full btn-secondary text-sm">
                Clear all filters
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{total || 0}</span> results</p>
            </div>

            {isLoading ? (
              <LoadingSpinner text="Fetching courses..." />
            ) : courses.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {courses.map((course) => <CourseCard key={course._id} course={course} />)}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center border-t border-gray-200 pt-8 mt-8">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">Previous</button>
                      <span className="text-sm text-gray-600 px-4">Page {page} of {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
             <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
               <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
               <p className="text-gray-500 mb-6">We couldn't find any courses matching your criteria.</p>
               <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
             </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
