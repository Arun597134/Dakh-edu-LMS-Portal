import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-12 border-t border-gray-800">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <HiOutlineAcademicCap className="text-primary-500 text-3xl" />
              <span className="text-2xl font-bold tracking-tight text-white">Dakh Edu</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Professional training and development platform designed to advance your technical career with real-world skills.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaLinkedin className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaTwitter className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaGithub className="text-xl" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-gray-400 hover:text-white transition-colors text-sm">All Courses</Link></li>
              <li><Link to="/courses?domain=Web" className="text-gray-400 hover:text-white transition-colors text-sm">Web Development</Link></li>
              <li><Link to="/courses?domain=AI/ML" className="text-gray-400 hover:text-white transition-colors text-sm">Artificial Intelligence</Link></li>
              <li><Link to="/courses?domain=Cloud" className="text-gray-400 hover:text-white transition-colors text-sm">Cloud Computing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Instructor Partnership</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Dakh Edu Inc. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Built for modern professionals</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
