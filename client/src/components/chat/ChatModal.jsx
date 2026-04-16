import { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, markMessagesRead } from '../../services/endpoints';
import { HiXMark, HiPaperAirplane } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ChatModal = ({ isOpen, onClose, courseId, receiverId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && courseId && receiverId) {
      setLoading(true);
      Promise.all([
        getMessages(courseId, receiverId),
        markMessagesRead(courseId, receiverId).catch(() => {})
      ])
        .then(([messagesRes]) => setMessages(messagesRes.data))
        .catch(() => toast.error('Failed to load messages'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, courseId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const { data } = await sendMessage({ courseId, receiverId, content: newMessage });
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[600px] max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 bg-gray-900 text-white rounded-t-xl flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Chat with {receiverName}</h3>
            <p className="text-xs text-gray-300">Course Instructor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <HiXMark className="text-xl" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No messages yet. Send a message to clarify your doubts!</div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.receiverId === receiverId; // If I'm sending to receiver, it's mine
              return (
                <div key={idx} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary-600 text-white self-end rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white rounded-b-xl flex gap-2">
          <input
            type="text"
            className="flex-1 input-field"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" disabled={!newMessage.trim()} className="btn-primary p-3 aspect-square flex items-center justify-center disabled:opacity-50">
            <HiPaperAirplane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
