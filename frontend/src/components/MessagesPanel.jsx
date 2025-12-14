import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';

const MessagesPanel = ({ isOpen, onClose }) => {
  const { messages, markMessageAsRead, deleteMessage } = useApp();

  if (!isOpen) return null;

  const handleMessageClick = (message) => {
    markMessageAsRead(message._id || message.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-[9998]" onClick={onClose}></div>
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'} dark:bg-gray-800 shadow-2xl z-[9999] flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} dark:text-white`}>Messages</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'} dark:text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-500'} dark:text-gray-400`}>
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">No messages</p>
              <p className="text-sm">Your inbox is empty</p>
            </div>
          ) : (
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'} dark:divide-gray-700`}>
              {messages.map(message => (
                <div
                  key={message._id || message.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !message.read ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} rounded-full flex items-center justify-center font-semibold`}>
                      {(message.sender?.name || message.from)?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold truncate ${!message.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {message.sender?.name || message.from}
                          </h3>
                          <p className={`text-sm truncate ${!message.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {message.subject}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message._id || message.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} dark:text-gray-400 mt-1 truncate`}>{message.content || message.preview}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} dark:text-gray-500`}>
                          {new Date(message.createdAt).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit'
                          })}
                        </span>
                        {!message.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} dark:border-gray-700`}>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Compose Message
          </button>
        </div>
      </div>
    </>
  );
};

export default MessagesPanel;
