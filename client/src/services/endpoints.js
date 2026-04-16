import API from './api';

// ── Auth ──
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const getProfile = () => API.get('/auth/profile');

// ── Courses ──
export const getCourses = (params) => API.get('/courses', { params });
export const getCourse = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// ── Sessions ──
export const getSessionsByCourse = (courseId) => API.get(`/courses/${courseId}/sessions`);
export const getSession = (courseId, sessionId) => API.get(`/courses/${courseId}/sessions/${sessionId}`);
export const createSession = (courseId, data) => API.post(`/courses/${courseId}/sessions`, data);
export const updateSession = (courseId, sessionId, data) => API.put(`/courses/${courseId}/sessions/${sessionId}`, data);
export const deleteSession = (courseId, sessionId) => API.delete(`/courses/${courseId}/sessions/${sessionId}`);

// ── Enrollment ──
export const enrollInCourse = (courseId) => API.post(`/enrollments/${courseId}`);
export const getMyEnrollments = () => API.get('/enrollments/my');
export const checkEnrollment = (courseId) => API.get(`/enrollments/check/${courseId}`);

// ── Progress ──
export const updateProgress = (sessionId, data) => API.put(`/progress/${sessionId}`, data);
export const getCourseProgress = (courseId) => API.get(`/progress/course/${courseId}`);
export const getSessionProgress = (sessionId) => API.get(`/progress/session/${sessionId}`);

// ── Notes ──
export const getNotes = (sessionId) => API.get(`/notes/${sessionId}`);
export const createNote = (sessionId, data) => API.post(`/notes/${sessionId}`, data);
export const updateNote = (noteId, data) => API.put(`/notes/${noteId}`, data);
export const deleteNote = (noteId) => API.delete(`/notes/${noteId}`);

// ── Bookmarks ──
export const getBookmarks = () => API.get('/bookmarks');
export const toggleBookmark = (sessionId) => API.post(`/bookmarks/${sessionId}`);
export const checkBookmark = (sessionId) => API.get(`/bookmarks/check/${sessionId}`);

// ── Assessments & Tasks ──
export const getAssessments = () => API.get('/assessments');
export const getAssessment = (id) => API.get(`/assessments/${id}`);
export const createAssessment = (data) => API.post('/assessments', data);
export const updateAssessment = (id, data) => API.put(`/assessments/${id}`, data);
export const generateQuestionsAI = (data) => API.post('/assessments/generate', data);
export const submitAssessment = (id, data) => API.post(`/assessments/${id}/submit`, data);
export const getAssessmentAttempts = (id) => API.get(`/assessments/${id}/attempts`);

// ── Messages ──
export const getMessages = (courseId, userId) => API.get(`/messages/${courseId}/${userId}`);
export const getMyConversations = () => API.get('/messages/my/conversations');
export const sendMessage = (data) => API.post('/messages', data);
export const markMessagesRead = (courseId, userId) => API.put(`/messages/${courseId}/${userId}/read`);
