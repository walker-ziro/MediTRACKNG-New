import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dashboardAPI } from '../utils/api';
import axios from 'axios';

const AIAssistant = ({ onClose }) => {
  const { darkMode } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Medical Assistant powered by Gemini AI. I have access to your MediTRACKNG platform and can help you with:\n\n• Patient management and analysis\n• Hospital operations insights\n• Emergency procedures\n• Appointment scheduling\n• Pharmacy and medication queries\n• Staff coordination\n• Laboratory services\n• Billing and accounts\n\nHow can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [platformContext, setPlatformContext] = useState(null);

  useEffect(() => {
    // Fetch platform context
    const fetchContext = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setPlatformContext(response.data);
      } catch (error) {
        console.error('Failed to fetch platform context:', error);
      }
    };
    fetchContext();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Build context-aware prompt
      const systemContext = `You are an AI Medical Assistant for MediTRACKNG, a comprehensive hospital management system. 

Current Platform Context:
- Today's Patients: ${platformContext?.todayPatients || 'Loading...'}
- Doctors Available: ${platformContext?.doctorsAvailable || 'Loading...'}
- Today's Appointments: ${platformContext?.appointments || 'Loading...'}
- Available Beds: ${platformContext?.bedsRooms?.beds || 'Loading...'}
- Available Rooms: ${platformContext?.bedsRooms?.rooms || 'Loading...'}

Platform Features:
1. Dashboard: Overview of hospital operations, statistics, and AI insights
2. Appointments: Schedule, manage, and track patient appointments
3. Emergency: Handle urgent cases with priority levels (Critical/High/Medium/Low)
4. Patients: Search by Health ID (MTN-XXXXXXXX format), manage demographics, medical history
5. Laboratory: Manage lab tests, results, and reports
6. Pharmacy: Track medication inventory, prescriptions, and stock alerts
7. Doctors: View schedules, availability, departments, and on-duty status
8. Staffs: Manage all hospital personnel and shifts
9. Bills & Payments: Handle billing, invoices, and payment processing
10. Accounts: Financial management and accounting
11. Settings: System configuration and preferences

User Query: ${userMessage}

Provide a helpful, specific response based on the MediTRACKNG platform features and current hospital data. If the user asks about specific features, guide them through the exact steps in the platform. Be concise but informative.`;

      // Call Gemini API directly from frontend
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDe68aq--eDG6BAA8zMLMEBer1iUp5XfcI`,
        {
          contents: [{
            parts: [{
              text: systemContext
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
        'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      // Fallback to intelligent keyword-based responses
      let fallbackResponse = '';
      const lowerInput = userMessage.toLowerCase();

      if (lowerInput.includes('patient')) {
        fallbackResponse = `In MediTRACKNG, you can manage patients through the Patients section:\n\n• Search by Health ID (MTN-XXXXXXXX format)\n• View complete demographics and medical history\n• Track medications and immunization records\n• Create new patient records\n\nCurrently, you have ${platformContext?.todayPatients || 0} patients registered today. What specific patient task do you need help with?`;
      } else if (lowerInput.includes('appointment')) {
        fallbackResponse = `For appointments in MediTRACKNG:\n\n1. Navigate to the Appointments section\n2. Click "New Appointment"\n3. Enter patient Health ID\n4. Select doctor and preferred time\n5. Confirm booking\n\nYou have ${platformContext?.appointments || 0} appointments scheduled for today. Need help with scheduling or rescheduling?`;
      } else if (lowerInput.includes('emergency')) {
        fallbackResponse = 'MediTRACKNG\'s Emergency section allows you to:\n\n• Register emergency cases quickly\n• Assign priority levels (Critical/High/Medium/Low)\n• Track patient status in real-time\n• Alert on-duty medical teams\n• View emergency statistics\n\nWould you like guidance on handling a specific emergency case?';
      } else if (lowerInput.includes('doctor') || lowerInput.includes('staff')) {
        fallbackResponse = `Staff Management in MediTRACKNG:\n\n• Doctors section: View ${platformContext?.doctorsAvailable || 0} available doctors, schedules, and specialties\n• Staffs section: Manage all hospital personnel\n• Track on-duty/on-leave status\n• Manage shifts and departments\n\nWhat staff-related task can I help you with?`;
      } else if (lowerInput.includes('pharmacy') || lowerInput.includes('medication')) {
        fallbackResponse = 'MediTRACKNG Pharmacy features:\n\n• Manage medication inventory\n• Track prescriptions and dispensing\n• Set low-stock alerts\n• View medication history per patient\n• Generate pharmacy reports\n\nDo you need help with a specific medication or inventory task?';
      } else if (lowerInput.includes('laboratory') || lowerInput.includes('lab test')) {
        fallbackResponse = 'Laboratory Management:\n\n• Order lab tests for patients\n• Track test status and results\n• Generate lab reports\n• Manage lab equipment and supplies\n• View historical test data\n\nWhat laboratory service do you need assistance with?';
      } else if (lowerInput.includes('bill') || lowerInput.includes('payment') || lowerInput.includes('account')) {
        fallbackResponse = 'Financial Management in MediTRACKNG:\n\n• Bills & Payments: Create invoices, process payments, track outstanding bills\n• Accounts: View financial reports, manage revenue and expenses\n• Generate financial statements\n\nWhich financial task would you like help with?';
      } else {
        fallbackResponse = `I'm here to help with MediTRACKNG operations. Currently:\n\n📊 Today's Stats:\n• ${platformContext?.todayPatients || 0} patients\n• ${platformContext?.appointments || 0} appointments\n• ${platformContext?.doctorsAvailable || 0} doctors available\n• ${platformContext?.bedsRooms?.beds || 0} beds available\n\nI can assist with any feature in the platform. What would you like to know about?`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Medical Assistant</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : darkMode
                    ? 'bg-gray-800 text-gray-200'
                    : 'bg-white text-gray-800'
                } shadow-sm`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className={`max-w-[80%] rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                  <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about hospital management..."
              disabled={loading}
              className={`flex-1 px-4 py-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200'
              } border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`px-6 py-2 ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Send
            </button>
          </div>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
