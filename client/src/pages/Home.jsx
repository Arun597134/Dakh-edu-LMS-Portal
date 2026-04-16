import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineBookOpen, HiOutlineChartBar, HiOutlineVideoCamera, HiOutlineCheckBadge } from 'react-icons/hi2';

const features = [
  { icon: <HiOutlineBookOpen className="text-2xl" />, title: 'Structured Curriculum', desc: 'Comprehensive paths designed by tech industry professionals.' },
  { icon: <HiOutlineChartBar className="text-2xl" />, title: 'Analytics & Tracking', desc: 'Monitor your progress and completion rates with precision.' },
  { icon: <HiOutlineVideoCamera className="text-2xl" />, title: 'High-Quality Video', desc: 'Clear, concise, and ad-free recorded sessions.' },
  { icon: <HiOutlineCheckBadge className="text-2xl" />, title: 'Verifiable Certificates', desc: 'Earn credentials that you can share with employers.' },
];

const domains = ['Web Development', 'AI & Machine Learning', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Mobile App Development'];

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="container-custom py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                Advance your engineering career
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                Gain access to professional-grade courses in modern web development, cloud architecture, and artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={user ? '/courses' : '/register'} className="btn-primary text-lg px-8 py-3 w-full sm:w-auto">
                  {user ? 'View Dashboard' : 'Join for Free'}
                </Link>
                <Link to="/courses" className="btn-secondary text-lg px-8 py-3 w-full sm:w-auto">
                  Browse Catalog
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Professional Hero Image Placeholder */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Students learning" 
                  className="w-full h-auto rounded-lg object-cover aspect-video"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-gray-200 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div><p className="text-4xl font-bold text-gray-900">500+</p><p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Courses</p></div>
            <div><p className="text-4xl font-bold text-gray-900">50k+</p><p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Learners</p></div>
            <div><p className="text-4xl font-bold text-gray-900">98%</p><p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Satisfaction</p></div>
            <div><p className="text-4xl font-bold text-gray-900">24/7</p><p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Access</p></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Structured learning experience</h2>
            <p className="text-gray-600">Everything you need to acquire new skills effectively, all in one professional platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-left">
                <div className="w-12 h-12 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Explore topics</h2>
              <p className="text-gray-600">Find specialized courses taught by verified industry experts.</p>
            </div>
            <Link to="/courses" className="text-primary-600 font-semibold hover:text-primary-800 transition-colors mt-4 md:mt-0 flex items-center gap-1">
              View all domains &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, idx) => (
              <Link key={idx} to={`/courses?domain=${encodeURIComponent(domain.split(' ')[0])}`} className="block border border-gray-200 rounded-lg p-6 hover:border-primary-500 hover:shadow-md transition-all group">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{domain}</h3>
                <p className="text-gray-500 text-sm mt-2">View courses &rarr;</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Ready to accelerate your career?</h2>
          <p className="text-gray-400 text-lg mb-8">Join the thousands of professionals updating their technical expertise with Dakh Edu today.</p>
          <Link to={user ? '/courses' : '/register'} className="btn-primary text-lg px-8 py-3 bg-primary-500 hover:bg-primary-600 border-none">
            Get Started Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
