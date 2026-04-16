import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineUserGroup, HiOutlineAcademicCap } from 'react-icons/hi2';

const CourseCard = ({ course, enrolled }) => {
  const totalDuration = course.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  return (
    <Link to={`/courses/${course._id}`} className="card block h-full">
      <div className="relative aspect-video bg-gray-100 border-b border-gray-200 flex items-center justify-center">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <HiOutlineAcademicCap className="text-gray-400 text-5xl" />
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded">
          {course.domain}
        </div>
        {enrolled && (
          <div className="absolute top-3 right-3 bg-green-100 border border-green-200 text-green-800 text-xs font-bold px-2.5 py-1 rounded">
            Enrolled
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col h-[calc(100%-auto)] justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
          {course.instructor && (
            <p className="text-xs font-medium text-gray-500 mb-1">
              Lecturer: <span className="text-gray-900">{course.instructor.name}</span>
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1">
              <HiOutlineClock className="text-gray-400" />
              <span>{course.durationWeeks || 4} Weeks</span>
            </div>
            <div className="flex items-center gap-1">
              <HiOutlineAcademicCap className="text-gray-400" />
              <span>{course.sessions?.length || 0} Lectures</span>
            </div>
            <div className="flex items-center gap-1">
              <HiOutlineUserGroup className="text-gray-400" />
              <span>{course.enrollmentCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
