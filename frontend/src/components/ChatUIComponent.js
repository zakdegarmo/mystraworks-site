import React, { useState, useEffect } from 'react';
import { sendMessageToGemini, saveMessageToFirestore, fetchConversationHistory } from '../utils/chatUtils';

const ChatUIComponent = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const conversationId = 'my-conversation'; // Placeholder conversation ID

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchConversationHistory(conversationId);
      setMessages(history);
    };
    loadHistory();
  }, [conversationId]);

  const handleSend = async (e) => {
      e.preventDefault(); // Prevent default form submission
    if (input.trim()) {
      const userMessage = {
        text: input,
        sender: 'user',
        timestamp: new Date() // Add timestamp
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');

      try {
        await saveMessageToFirestore(conversationId, userMessage);
        const aiResponse = await sendMessageToGemini(userMessage.text);
        const aiMessage = {
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date() // Add timestamp
        };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        await saveMessageToFirestore(conversationId, aiMessage);
      } catch (error) {
        console.error("Error sending message or saving to Firestore:", error);
        // Optionally add an error message to the chat
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 font-inter bg-gray-100 rounded-lg shadow-md border border-gray-300 clay-border">
      <div className="flex-grow overflow-y-auto mb-4 p-2 border border-gray-200 rounded-md bg-white">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // onKeyPress={(e) => {
          //   if (e.key === 'Enter') {
          //     handleSend();
          //   }
          // }} // Handle form submission with onSubmit instead

        />
        <button
          className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleSend}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatUIComponent;