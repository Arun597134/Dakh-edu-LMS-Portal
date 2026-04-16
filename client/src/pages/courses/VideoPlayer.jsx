import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourse } from '../../store/slices/courseSlice';
import { saveProgress } from '../../store/slices/progressSlice';
import { getNotes, createNote, deleteNote, toggleBookmark, checkBookmark, getSessionProgress } from '../../services/endpoints';
import ReactPlayer from 'react-player';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineBookmark, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlinePlayCircle, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { FaBookmark, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * Normalizes any YouTube URL format into a canonical embeddable URL.
 * Handles: watch?v=, youtu.be/, /embed/, /shorts/, /live/, ?si= params, timestamps, playlists, and even raw IDs.
 */
const normalizeVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  let trimmed = url.trim();
  
  // If it's just an 11-char ID, treat as YouTube
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }

  // If no protocol, add https
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace('www.', '').toLowerCase();

    // If it's already a YouTube URL
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = null;

      if (host === 'youtu.be') {
        videoId = parsed.pathname.split('/').filter(Boolean)[0];
      } else if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2];
      } else if (parsed.pathname.startsWith('/v/')) {
        videoId = parsed.pathname.split('/')[2];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2];
      } else if (parsed.pathname.startsWith('/live/')) {
        videoId = parsed.pathname.split('/')[2];
      }

      if (videoId) {
        // Remove any extra path or query junk
        videoId = videoId.split(/[?&#]/)[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
    }
    
    // Return original if not YouTube or normalization failed
    return trimmed;
  } catch {
    return trimmed;
  }
};

const VideoPlayer = () => {
  const { courseId, sessionId } = useParams();
  const dispatch = useDispatch();
  const { currentCourse: course } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const playerRef = useRef(null);

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState({ watchPercentage: 0, completed: false });
  const [tab, setTab] = useState('syllabus');
  const [videoError, setVideoError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [pip, setPip] = useState(false);

  const session = course?.sessions?.find((s) => s._id === sessionId);
  const sessionIndex = course?.sessions?.findIndex((s) => s._id === sessionId);

  // Normalize the video URL so ReactPlayer can handle it
  const normalizedUrl = useMemo(() => session ? normalizeVideoUrl(session.videoUrl) : '', [session]);

  useEffect(() => { if (!course || course._id !== courseId) dispatch(fetchCourse(courseId)); }, [dispatch, courseId, course]);

  useEffect(() => {
    // Reset video states when session changes
    setVideoError(false);
    setPlayerReady(false);
  }, [sessionId]);

  useEffect(() => {
    if (user && sessionId) {
      getNotes(sessionId).then(({ data }) => setNotes(data)).catch(() => {});
      checkBookmark(sessionId).then(({ data }) => setIsBookmarked(data.bookmarked)).catch(() => {});
      getSessionProgress(sessionId).then(({ data }) => setProgress(data)).catch(() => {});
    }
  }, [user, sessionId]);

  const handleProgress = useCallback((state) => {
    const percent = Math.round(state.played * 100);
    if (percent > (progress.watchPercentage || 0) && percent % 10 === 0) {
      dispatch(saveProgress({ sessionId, progressData: { watchPercentage: percent, completed: percent >= 90, courseId } }));
      setProgress((prev) => ({ ...prev, watchPercentage: percent, completed: percent >= 90 }));
    }
  }, [dispatch, sessionId, courseId, progress.watchPercentage]);

  const handleMarkComplete = () => {
    dispatch(saveProgress({ sessionId, progressData: { watchPercentage: 100, completed: true, courseId } }));
    setProgress({ watchPercentage: 100, completed: true });
    toast.success('Lecture completed.');
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    try {
      const { data } = await createNote(sessionId, { text: noteText, timestamp: Math.floor(currentTime) });
      setNotes((prev) => [data, ...prev]);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const handleDeleteNote = async (noteId) => {
    try { await deleteNote(noteId); setNotes((prev) => prev.filter((n) => n._id !== noteId)); toast.success('Note deleted'); }
    catch { toast.error('Failed to delete note'); }
  };

  const handleToggleBookmark = async () => {
    try { await toggleBookmark(sessionId); setIsBookmarked(!isBookmarked); toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmark added'); }
    catch { toast.error('Failed to toggle bookmark'); }
  };

  const seekToTimestamp = (seconds) => { if (playerRef.current) { playerRef.current.seekTo(seconds, 'seconds'); } };
  const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${m}:${s.toString().padStart(2, '0')}`; };

  const handleVideoError = () => {
    console.error('ReactPlayer failed to load URL:', normalizedUrl);
    setVideoError(true);
  };

  const handleVideoReady = () => {
    setPlayerReady(true);
    setVideoError(false);
  };

  const goToNextSession = () => {
    if (sessionIndex < course.sessions.length - 1) {
      const nextSessionId = course.sessions[sessionIndex + 1]._id;
      window.location.href = `/courses/${courseId}/session/${nextSessionId}`;
    }
  };

  const goToPrevSession = () => {
    if (sessionIndex > 0) {
      const prevSessionId = course.sessions[sessionIndex - 1]._id;
      window.location.href = `/courses/${courseId}/session/${prevSessionId}`;
    }
  };

  const toggleTheaterMode = () => setIsTheaterMode(!isTheaterMode);

  if (!course || !session) return <LoadingSpinner text="Loading player..." />;

  const progressPercent = progress.watchPercentage || 0;

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden ${isTheaterMode ? 'theater-mode' : ''}`}>
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* ─── Main Video Area ─── */}
        <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${isTheaterMode ? 'lg:w-full' : ''}`}>
          {/* Video Container */}
          <div className={`w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex justify-center items-center p-3 lg:p-5 transition-all duration-300 ${isTheaterMode ? 'bg-black lg:p-0' : ''}`}>
            <div className={`relative w-full aspect-video transition-all duration-300 ${isTheaterMode ? 'max-w-none h-[75vh]' : 'max-w-5xl rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5'}`}>
              {!videoError ? (
                <>
                  {!playerReady && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900 text-gray-400 gap-3">
                      <div className="w-10 h-10 border-3 border-gray-600 border-t-primary-400 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading video...</span>
                    </div>
                  )}
                  <ReactPlayer
                    ref={playerRef}
                    url={normalizedUrl}
                    width="100%"
                    height="100%"
                    pip={pip}
                    onEnablePIP={() => setPip(true)}
                    onDisablePIP={() => setPip(false)}
                    playing={false}
                    onProgress={handleProgress}
                    onError={handleVideoError}
                    onReady={handleVideoReady}
                    controls
                    config={{
                      youtube: {
                        playerVars: {
                          modestbranding: 1,
                          rel: 0,
                          origin: window.location.origin,
                          enablejsapi: 1,
                        },
                      },
                    }}
                  />
                </>
              ) : (
                /* Fallback when ReactPlayer fails */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <FaYoutube className="text-red-400 text-4xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Video couldn't load inline</h3>
                    <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                      The embedded player failed to load this video. You can watch it directly on the platform instead.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <a
                      href={normalizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-red-500/20"
                    >
                      <FaYoutube /> Watch on YouTube
                    </a>
                    <button
                      onClick={() => { setVideoError(false); setPlayerReady(false); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-sm transition-colors border border-white/10"
                    >
                      Retry Player
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Buttons Overlay */}
            <div className="w-full max-w-5xl mt-4 flex items-center justify-between px-2">
              <button 
                onClick={goToPrevSession} 
                disabled={sessionIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  sessionIndex === 0 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-95'
                }`}
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-center">
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Theater</div>
                   <button 
                     onClick={toggleTheaterMode}
                     className={`w-10 h-5 rounded-full relative cursor-pointer mt-1 transition-colors ${isTheaterMode ? 'bg-primary-600' : 'bg-gray-700'}`}
                   >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isTheaterMode ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>
                
                <div className="hidden sm:flex flex-col items-center">
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">PiP</div>
                   <button 
                     onClick={() => setPip(!pip)}
                     className={`w-10 h-5 rounded-full relative cursor-pointer mt-1 transition-colors ${pip ? 'bg-primary-600' : 'bg-gray-700'}`}
                   >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${pip ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>
              </div>

              <button 
                onClick={goToNextSession} 
                disabled={sessionIndex === course.sessions.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  sessionIndex === course.sessions.length - 1 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-500 active:scale-95 shadow-lg shadow-primary-900/20'
                }`}
              >
                Next {sessionIndex < course.sessions.length - 1 ? 'Lecture' : 'Course'} →
              </button>
            </div>
          </div>

          {/* ─── Video Info Section ─── */}
          <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
            {/* Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 pb-6 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-full">
                    Lecture {sessionIndex + 1}
                  </span>
                  {progress.completed && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <HiOutlineCheckCircle /> Completed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">{session.title}</h1>
                <p className="text-gray-500 text-sm max-w-3xl leading-relaxed">{session.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                {session.notesUrl && (
                  <a href={session.notesUrl} target="_blank" rel="noreferrer" className="btn-secondary gap-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300">
                    <HiOutlineDocumentText /> Notes
                  </a>
                )}
                <button onClick={handleToggleBookmark} className={`btn-secondary gap-2 text-sm transition-all duration-200 ${isBookmarked ? 'bg-secondary-50 text-secondary-700 border-secondary-300 shadow-sm' : 'hover:bg-gray-50'}`}>
                  {isBookmarked ? <FaBookmark className="text-secondary-500" /> : <HiOutlineBookmark />} {isBookmarked ? 'Saved' : 'Save'}
                </button>
                {!progress.completed && (
                  <button onClick={handleMarkComplete} className="btn-primary gap-2 text-sm">
                    <HiOutlineCheckCircle /> Mark Done
                  </button>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/60 border border-gray-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-700">Your Progress</span>
                <span className={`text-sm font-extrabold tabular-nums ${progressPercent >= 90 ? 'text-green-600' : 'text-primary-600'}`}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${progressPercent >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-gray-400 font-medium">0%</span>
                <span className="text-[11px] text-gray-400 font-medium">100%</span>
              </div>
            </div>
          </div>
        </div>

          {/* ─── Sidebar ─── */}
        <div className={`w-full lg:w-[380px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0 relative z-10 shadow-[-8px_0_24px_rgba(0,0,0,0.03)] transition-all duration-300 ${isTheaterMode ? 'lg:translate-x-full lg:w-0 overflow-hidden opacity-0 invisible' : ''}`}>
          {/* Tab Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { key: 'syllabus', label: 'Syllabus' },
              { key: 'notes', label: `Notes (${notes.length})` },
              { key: 'lectureNotes', label: 'Resources' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3.5 text-xs font-bold tracking-wide border-b-[3px] transition-all duration-200 ${
                  tab === t.key
                    ? 'border-primary-500 text-primary-700 bg-white'
                    : 'border-transparent text-gray-450 hover:text-gray-700 hover:bg-gray-100/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'syllabus' ? (
              <div className="divide-y divide-gray-100">
                {course.sessions?.map((s, idx) => {
                  const isActive = s._id === sessionId;
                  return (
                    <Link
                      key={s._id}
                      to={`/courses/${courseId}/session/${s._id}`}
                      className={`flex items-start gap-3.5 p-4 transition-all duration-150 group border-b border-gray-100 ${
                        isActive
                          ? 'bg-primary-50/70 border-l-[3px] border-l-primary-500 pl-[13px]'
                          : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-sm shadow-primary-200'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                        } transition-colors`}>
                          {idx + 1}
                        </div>
                        {/* Status dot if needed */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className={`text-sm font-bold leading-tight truncate transition-colors ${
                            isActive ? 'text-primary-900' : 'text-gray-800 group-hover:text-primary-700'
                          }`}>
                            {s.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                            <HiOutlinePlayCircle className="text-gray-300" /> {s.duration} min
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-extrabold text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded leading-none">NOW PLAYING</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : tab === 'notes' ? (
              <div className="p-5">
                <form onSubmit={handleAddNote} className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    New Note <span className="text-gray-400 font-normal">@ {formatTime(playerRef.current ? playerRef.current.getCurrentTime() : 0)}</span>
                  </label>
                  <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Jot down key points..." className="input-field mb-3 min-h-[90px] resize-none text-sm" />
                  <button type="submit" className="w-full btn-primary text-sm py-2.5 font-bold">Save Note</button>
                </form>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Saved Notes</h4>
                <div className="space-y-3">
                  {notes.length > 0 ? notes.map((note) => (
                    <div key={note._id} className="bg-gray-50 p-3.5 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <button onClick={() => seekToTimestamp(note.timestamp)} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-0.5 rounded-full cursor-pointer transition-colors flex items-center gap-1">
                          <HiOutlinePlayCircle className="text-sm" />
                          {formatTime(note.timestamp)}
                        </button>
                        <button onClick={() => handleDeleteNote(note._id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5"><HiOutlineTrash /></button>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3 opacity-30">📝</div>
                      <p className="text-sm text-gray-400 font-medium">No notes yet for this session.</p>
                      <p className="text-xs text-gray-300 mt-1">Start taking notes while watching!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 h-full flex flex-col">
                <h4 className="text-base font-bold text-gray-900 mb-1">Lecture Resources</h4>
                <p className="text-gray-400 text-xs mb-5">Materials provided by the instructor.</p>
                {session.notesUrl ? (
                  <div className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl p-8 shadow-sm flex-1 justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mb-5">
                      <HiOutlineDocumentText className="text-3xl text-primary-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4 text-center font-medium">Instructor notes are available for this session.</p>
                    <a href={session.notesUrl} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center gap-2">
                      <HiOutlineArrowTopRightOnSquare /> Open Notes
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-10">
                    <div className="text-5xl mb-4 opacity-20">📄</div>
                    <p className="text-sm text-gray-400 font-medium">No resources uploaded yet.</p>
                    <p className="text-xs text-gray-300 mt-1">Check back later for updates.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
