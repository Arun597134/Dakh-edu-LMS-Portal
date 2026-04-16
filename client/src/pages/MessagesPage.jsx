import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getMyConversations } from '../services/endpoints';
import ChatModal from '../components/chat/ChatModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

const MessagesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = () => {
    setLoading(true);
    getMyConversations()
      .then(({ data }) => setConversations(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    fetchConversations(); // Refresh to get latest message
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <HiOutlineChatBubbleLeftRight className="text-3xl text-primary-600" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Messages</h1>
            <p className="text-gray-500 mt-1">Chat directly with {user.role === 'student' ? 'your instructors' : 'your students'} to clear doubts.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><LoadingSpinner text="Loading conversations..." /></div>
          ) : conversations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedChat(conv)}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg border border-primary-200">
                      {conv.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 border-b border-transparent hover:border-gray-900 transition-colors inline-block">{conv.otherUser.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{conv.courseId?.title}</p>
                      <p className={`text-sm max-w-md truncate ${!conv.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                    {!conv.isRead && (
                      <span className="w-3 h-3 bg-primary-500 rounded-full mt-2 block"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="p-16 text-center text-gray-500">
               <HiOutlineChatBubbleLeftRight className="text-6xl text-gray-300 mx-auto mb-4" />
               <p className="text-lg font-bold text-gray-700 mb-2">No messages yet</p>
               {user.role === 'student' ? (
                 <p className="text-sm">Go to any enrolled course to message the instructor.</p>
               ) : (
                 <p className="text-sm">When students ask questions, they will appear here.</p>
               )}
             </div>
          )}
        </div>
      </div>

      {selectedChat && (
        <ChatModal
          isOpen={true}
          onClose={handleCloseChat}
          courseId={selectedChat.courseId._id}
          receiverId={selectedChat.otherUser._id}
          receiverName={selectedChat.otherUser.name}
        />
      )}
    </div>
  );
};

export default MessagesPage;
