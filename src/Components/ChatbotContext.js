import React, { createContext, useContext, useState } from 'react';

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const initialMessages = [
    { text: " Hello! \n How can I help you today?", sender: "server", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), options: ["General Inquiry", "Raise an Issue"] }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, { ...newMessage, sender: 'user' }]);
  };

  const toggleChatbot = () => {
   
    setIsOpen((prev) => !prev);
  };

  return (
    <ChatbotContext.Provider value={{ messages, setMessages, isMinimized, setIsMinimized, isOpen, setIsOpen, handleSendMessage, toggleChatbot }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => useContext(ChatbotContext);
