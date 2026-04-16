import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => { if (user) navigate('/courses'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { toast.error('Please fill in all required fields'); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const { confirmPassword, ...data } = formData;
    dispatch(register(data));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <HiOutlineAcademicCap className="text-primary-600 text-4xl" />
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
          </p>
        </div>
        
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="input-field" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Work Email</label>
            <input type="email" required className="input-field" placeholder="john@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Account Type</label>
            <div className="flex rounded-md shadow-sm border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${formData.role === 'student' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-b-2 border-transparent'}`}
              >
                Learner
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${formData.role === 'instructor' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-b-2 border-transparent'}`}
              >
                Instructor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required className="input-field" placeholder="Must be at least 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input type="password" required className="input-field" placeholder="Retype password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 mt-4">
            {isLoading ? 'Creating Account...' : 'Agree & Create Account'}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
