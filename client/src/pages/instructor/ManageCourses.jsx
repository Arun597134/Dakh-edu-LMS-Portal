import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses, addCourse, editCourse, removeCourse } from '../../store/slices/courseSlice';
import { createSession, updateSession, deleteSession } from '../../services/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const domains = ['Web Development', 'AI & Machine Learning', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Mobile App Development'];

const ManageCourses = () => {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [courseForm, setCourseForm] = useState({ title: '', description: '', domain: 'Web Development', thumbnail: '', durationWeeks: '4' });
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', videoUrl: '', notesUrl: '', duration: '' });

  useEffect(() => { dispatch(fetchCourses({ instructor: user?._id || user?.id })); }, [dispatch, user]);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) { await dispatch(editCourse({ id: editingCourse._id, courseData: courseForm })).unwrap(); toast.success('Course updated'); }
      else { await dispatch(addCourse(courseForm)).unwrap(); toast.success('Course created'); }
      setShowCourseModal(false);
    } catch (err) { toast.error(err || 'Failed to save course'); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return;
    try { await dispatch(removeCourse(id)).unwrap(); toast.success('Course deleted'); }
    catch (err) { toast.error(err || 'Delete failed'); }
  };

  const openEditCourse = (course) => { setEditingCourse(course); setCourseForm({ title: course.title, description: course.description, domain: course.domain, thumbnail: course.thumbnail || '', durationWeeks: course.durationWeeks?.toString() || '4' }); setShowCourseModal(true); };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) { await updateSession(selectedCourseId, editingSession._id, sessionForm); toast.success('Session updated'); }
      else { await createSession(selectedCourseId, { ...sessionForm, duration: Number(sessionForm.duration) }); toast.success('Session added'); }
      setShowSessionModal(false);
      dispatch(fetchCourses({ instructor: user?._id || user?.id }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save session'); }
  };

  const handleDeleteSession = async (courseId, sessionId) => {
    if (!window.confirm('Delete this session permanently?')) return;
    try { await deleteSession(courseId, sessionId); toast.success('Session deleted'); dispatch(fetchCourses({ instructor: user?._id || user?.id })); }
    catch { toast.error('Delete failed'); }
  };

  const openAddSession = (courseId) => { setSelectedCourseId(courseId); setEditingSession(null); setSessionForm({ title: '', description: '', videoUrl: '', notesUrl: '', duration: '' }); setShowSessionModal(true); };
  const openEditSession = (courseId, session) => { setSelectedCourseId(courseId); setEditingSession(session); setSessionForm({ title: session.title, description: session.description, videoUrl: session.videoUrl, notesUrl: session.notesUrl || '', duration: session.duration?.toString() || '' }); setShowSessionModal(true); };

  if (isLoading) return <LoadingSpinner text="Loading workspace..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-5xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Instructor Workspace</h1>
            <p className="text-gray-500 mt-1">Manage your course catalog and syllabus content.</p>
          </div>
          <button onClick={() => { setEditingCourse(null); setCourseForm({ title: '', description: '', domain: 'Web Development', thumbnail: '', durationWeeks: '4' }); setShowCourseModal(true); }} className="btn-primary gap-2">
            <HiPlus /> Create Course
          </button>
        </div>

        {courses.length > 0 ? (
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-200 px-2 py-1 rounded inline-block mb-3">{course.domain}</span>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
                    <p className="text-gray-600 text-sm max-w-3xl">{course.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => openEditCourse(course)} className="btn-secondary px-3 py-2 text-sm"><HiPencil /> Edit Details</button>
                    <button onClick={() => handleDeleteCourse(course._id)} className="btn-secondary px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-300 hover:border-red-200"><HiTrash /></button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Syllabus ({course.sessions?.length || 0} Lectures)</h3>
                    <button onClick={() => openAddSession(course._id)} className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1">
                      <HiPlus /> Add Lecture
                    </button>
                  </div>
                  
                  {course.sessions?.length > 0 ? (
                    <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {course.sessions.map((s, idx) => (
                        <div key={s._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-400 w-4">{idx + 1}.</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{s.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{s.duration} mins • {s.videoUrl}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditSession(course._id, s)} className="text-gray-500 hover:text-primary-600 p-2 border border-transparent hover:border-gray-300 rounded"><HiPencil /></button>
                            <button onClick={() => handleDeleteSession(course._id, s._id)} className="text-gray-500 hover:text-red-600 p-2 border border-transparent hover:border-gray-300 rounded"><HiTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-8 text-center">
                      <p className="text-sm text-gray-500">No lectures added to this course yet.</p>
                      <button onClick={() => openAddSession(course._id)} className="text-primary-600 hover:text-primary-800 text-sm font-semibold mt-2 inline-flex items-center gap-1"><HiPlus /> Add your first lecture</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Workspace is empty</h3>
            <p className="text-gray-500 mb-6">Start building your audience by creating your first professional course.</p>
            <button onClick={() => setShowCourseModal(true)} className="btn-primary">Create New Course</button>
          </div>
        )}
      </div>

      {/* Modals using generic clean overlay */}
      {(showCourseModal || showSessionModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {showCourseModal ? (editingCourse ? 'Edit Course Settings' : 'Create New Course') : (editingSession ? 'Edit Lecture' : 'Add New Lecture')}
              </h2>
              <button onClick={() => showCourseModal ? setShowCourseModal(false) : setShowSessionModal(false)} className="text-gray-500 hover:text-gray-900"><HiXMark className="text-xl" /></button>
            </div>
            
            <div className="p-6">
              {showCourseModal && (
                <form onSubmit={handleSaveCourse} className="space-y-5">
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Course Title</label><input type="text" required className="input-field" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-bold text-gray-900 mb-1">Category</label><select className="input-field cursor-pointer" value={courseForm.domain} onChange={e => setCourseForm({...courseForm, domain: e.target.value})}>{domains.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                     <div><label className="block text-sm font-bold text-gray-900 mb-1">Duration (Weeks)</label><input type="number" required min="1" max="52" className="input-field" value={courseForm.durationWeeks} onChange={e => setCourseForm({...courseForm, durationWeeks: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Description</label><textarea required rows={4} className="input-field resize-none" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Thumbnail URL</label><input type="url" className="input-field" value={courseForm.thumbnail} onChange={e => setCourseForm({...courseForm, thumbnail: e.target.value})} /></div>
                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-3"><button type="button" onClick={() => setShowCourseModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Course</button></div>
                </form>
              )}
              {showSessionModal && (
                <form onSubmit={handleSaveSession} className="space-y-5">
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Lecture Title</label><input type="text" required className="input-field" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Description</label><textarea required rows={3} className="input-field resize-none" value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Video Source URL</label><input type="url" required className="input-field" placeholder="https://..." value={sessionForm.videoUrl} onChange={e => setSessionForm({...sessionForm, videoUrl: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Notes/Resource URL (Optional)</label><input type="url" className="input-field" placeholder="https://drive.google.com/..." value={sessionForm.notesUrl} onChange={e => setSessionForm({...sessionForm, notesUrl: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Duration (minutes)</label><input type="number" required min="1" className="input-field" value={sessionForm.duration} onChange={e => setSessionForm({...sessionForm, duration: e.target.value})} /></div>
                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-3"><button type="button" onClick={() => setShowSessionModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Lecture</button></div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
