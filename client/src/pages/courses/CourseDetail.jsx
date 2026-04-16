import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourse } from '../../store/slices/courseSlice';
import { enrollInCourse, checkEnrollment, getCourseProgress } from '../../services/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineClock, HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineCheckCircle, HiArrowLeft, HiOutlineChatBubbleLeftEllipsis, HiOutlineAcademicCap } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import ChatModal from '../../components/chat/ChatModal';

const CourseDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCourse: course, isLoading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const canAccess = enrolled || (user && user.role !== 'student');

  useEffect(() => { dispatch(fetchCourse(id)); }, [dispatch, id]);
  useEffect(() => {
    if (user && course) { 
      checkEnrollment(course._id).then(({ data }) => setEnrolled(data.enrolled)).catch(() => {}); 
      if (user.role === 'student') {
        getCourseProgress(course._id).then(({ data }) => setCourseProgress(data.completionPercentage)).catch(() => {});
      }
    }
  }, [user, course]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try { await enrollInCourse(course._id); setEnrolled(true); toast.success('Successfully enrolled!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Enrollment failed'); }
    finally { setEnrolling(false); }
  };

  if (isLoading || !course) return <LoadingSpinner text="Loading course documentation..." />;

  const totalDuration = course.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Dark Header Banner */}
      <div className="bg-gray-900 text-white pt-8 pb-16">
        <div className="container-custom">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 font-medium">
            <HiArrowLeft /> Back to Catalog
          </Link>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 rounded border border-gray-700 text-xs font-bold uppercase tracking-wider mb-4">
                {course.domain}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-8 text-sm text-gray-400 font-medium">
                <div className="flex items-center gap-2 border border-gray-700 px-3 py-1.5 rounded bg-gray-800/50">
                  <HiOutlineClock className="text-gray-300" /> {course.durationWeeks || 4} Weeks
                </div>
                <div className="flex items-center gap-2 border border-gray-700 px-3 py-1.5 rounded bg-gray-800/50">
                  <HiOutlineBookOpen className="text-gray-300" /> {course.sessions?.length || 0} Lectures
                </div>
                <div className="flex items-center gap-2 border border-gray-700 px-3 py-1.5 rounded bg-gray-800/50">
                  <HiOutlineUserGroup className="text-gray-300" /> {course.enrollmentCount || 0} Learners
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom -mt-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">Course Syllabus</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {course.sessions?.length > 0 ? course.sessions.map((session, idx) => (
                  <div 
                    key={session._id} 
                    className={`p-6 ${canAccess ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                    onClick={() => canAccess && navigate(`/courses/${course._id}/session/${session._id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-base font-bold text-gray-900 flex items-center gap-3">
                         <span className="text-sm font-semibold text-gray-400 w-5">{idx + 1}.</span> 
                         {session.title}
                       </h3>
                       <span className="text-sm font-medium text-gray-500">{session.duration}m</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-8">{session.description}</p>
                  </div>
                )) : (
                  <p className="p-8 text-center text-gray-500 text-sm">Syllabus content is being updated.</p>
                )}
              </div>
            </div>
            
            {course.instructor && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                 <div className="flex justify-between items-center mb-4">
                   <h2 className="text-lg font-bold text-gray-900">About the Instructor</h2>
                   {enrolled && user?.role === 'student' && (
                     <button
                       onClick={() => setIsChatOpen(true)}
                       className="btn-secondary text-sm flex items-center gap-2 py-1.5"
                     >
                       <HiOutlineChatBubbleLeftEllipsis className="text-primary-600" /> Message Instructor
                     </button>
                   )}
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-bold border border-gray-300">
                      {course.instructor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{course.instructor.name}</p>
                      <p className="text-sm text-gray-500">Subject Matter Expert</p>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Sticky Enrollment Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 sticky top-24">
              {course.thumbnail && (
                <div className="mb-6 rounded overflow-hidden aspect-video border border-gray-200">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="mb-6">
                <p className="text-3xl font-extrabold text-gray-900 mb-1">Free</p>
                <p className="text-sm text-gray-500">Corporate-sponsored access</p>
              </div>

              {user?.role === 'student' || !user ? (
                enrolled ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm font-semibold flex flex-col gap-2">
                       <span className="flex items-center gap-2"><HiOutlineCheckCircle className="text-lg" /> You are enrolled in this course.</span>
                       <span className="text-xs text-green-700 font-medium opacity-90">Progress: {Math.round(courseProgress)}%</span>
                    </div>
                    
                    <button onClick={() => course.sessions?.length > 0 && navigate(`/courses/${course._id}/session/${course.sessions[0]._id}`)} className="w-full btn-primary text-base">
                      Access Course Material
                    </button>
                    
                    {courseProgress >= 75 && (
                      <Link to={`/certificate/${course._id}`} className="w-full btn-secondary text-base border-primary-500 text-primary-700 font-bold justify-center mt-2 flex items-center gap-2">
                        <HiOutlineAcademicCap className="text-xl" /> Generate Certificate
                      </Link>
                    )}
                  </div>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling} className="w-full btn-primary text-base bg-gray-900 hover:bg-gray-800">
                    {enrolling ? 'Processing...' : 'Enroll For Free'}
                  </button>
                )
              ) : (
                <div className="space-y-4 mt-4">
                  <div className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-3 rounded text-sm font-semibold text-center">
                    Instructor Preview Mode
                  </div>
                  <button onClick={() => course.sessions?.length > 0 && navigate(`/courses/${course._id}/session/${course.sessions[0]._id}`)} className="w-full btn-primary text-base">
                    Preview Course Material
                  </button>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Features included</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><HiOutlineCheckCircle className="text-green-500" /> Full lifetime access</li>
                  <li className="flex items-center gap-2"><HiOutlineCheckCircle className="text-green-500" /> Access on mobile and TV</li>
                  <li className="flex items-center gap-2"><HiOutlineCheckCircle className="text-green-500" /> Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      {course.instructor && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          courseId={course._id}
          receiverId={course.instructor._id}
          receiverName={course.instructor.name}
        />
      )}
    </div>
  );
};

export default CourseDetail;
