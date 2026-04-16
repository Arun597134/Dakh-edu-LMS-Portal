import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../store/slices/authSlice';
import { HiOutlineAcademicCap, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`text-sm font-medium transition-colors hover:text-primary-600 ${
        isActive(path) ? 'text-primary-600 font-semibold' : 'text-gray-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <HiOutlineAcademicCap className="text-primary-600 text-2xl" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Dakh Edu
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLink('/courses', 'Courses')}
            {user?.role === 'student' && (
              <>
                {navLink('/my-courses', 'My Learning')}
                {navLink('/assessments', 'Exams/Tasks')}
              </>
            )}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <>
                {navLink('/manage-courses', 'Manage Content')}
                {navLink('/instructor/assessments', 'Manage Exams')}
              </>
            )}
            {user?.role === 'admin' && navLink('/admin/dashboard', 'Admin DB')}
            {user && navLink('/messages', 'Messages')}
            {user && navLink('/bookmarks', 'Bookmarks')}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </Link>
                <div className="h-5 w-px bg-gray-300"></div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 text-sm"
                >
                  Join for Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            {mobileOpen ? <HiOutlineX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 absolute w-full left-0 shadow-lg">
          <div className="px-4 py-4 flex flex-col space-y-4">
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Courses</Link>
            {user ? (
              <>
                {user.role === 'admin' && <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Admin Dashboard</Link>}
                {user.role === 'student' && (
                  <>
                    <Link to="/my-courses" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">My Learning</Link>
                    <Link to="/assessments" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Tasks & Exams</Link>
                  </>
                )}
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <>
                    <Link to="/manage-courses" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Manage Content</Link>
                    <Link to="/instructor/assessments" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Manage Exams</Link>
                  </>
                )}
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Messages</Link>
                <Link to="/bookmarks" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Bookmarks</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Profile ({user.name})</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-base font-medium text-red-600 text-left">Log out</button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-base font-medium text-gray-700">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Join for Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
