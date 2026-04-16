import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import API from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    
    setLoading(true);
    try {
      const res = await API.post('/auth/forgotpassword', { email });
      setSuccess(true);
      toast.success(res.data.message || 'Password reset link sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <HiOutlineAcademicCap className="text-primary-600 text-4xl" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dakh Edu</h2>
          </Link>
          <h3 className="mt-6 text-xl font-bold text-gray-900">Reset your password</h3>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>
        
        {success ? (
          <div className="mt-8 bg-green-50 text-green-800 p-4 rounded-md text-sm text-center border border-green-200 font-medium">
            A password reset link has been sent to your email address. Please check your inbox.
            <div className="mt-4">
              <Link to="/login" className="text-green-900 underline font-bold">Return to Login</Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="Ex: john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="font-medium text-sm text-primary-600 hover:text-primary-500">
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
