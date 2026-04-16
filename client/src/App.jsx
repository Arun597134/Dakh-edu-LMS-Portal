import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import VideoPlayer from './pages/courses/VideoPlayer';
import MyCourses from './pages/student/MyCourses';
import Bookmarks from './pages/student/Bookmarks';
import ManageCourses from './pages/instructor/ManageCourses';
import Profile from './pages/Profile';
import StudentAssessments from './pages/student/StudentAssessments';
import TakeAssessment from './pages/student/TakeAssessment';
import ManageAssessments from './pages/instructor/ManageAssessments';
import AdminDashboard from './pages/admin/AdminDashboard';
import CertificatePage from './pages/student/CertificatePage';
import MessagesPage from './pages/MessagesPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          {/* Student Protected */}
          <Route
            path="/courses/:courseId/session/:sessionId"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute roles={['student']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentAssessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:id"
            element={
              <ProtectedRoute roles={['student']}>
                <TakeAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate/:courseId"
            element={
              <ProtectedRoute roles={['student']}>
                <CertificatePage />
              </ProtectedRoute>
            }
          />

          {/* Instructor / Admin Protected */}
          <Route
            path="/manage-courses"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/assessments"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <ManageAssessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile & Messages */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
