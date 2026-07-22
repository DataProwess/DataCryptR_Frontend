
import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import { useChatbot } from './ChatbotContext';
import { API_URL } from './ApiConfig';
import authService from './auth';

Modal.setAppElement('#root'); // Set the root element for accessibility

// const Chatbot = ({ onClose }) => {
//   const { messages, setMessages, isMinimized, isOpen,setIsMinimized, setIsOpen, handleSendMessage } = useChatbot();
const Chatbot = ({ onClose, isOpen }) => {
  const { messages, setMessages, isMinimized } = useChatbot();
  const [showChatbot, setShowChatbot] = useState(false);
  const messageEndRef = useRef(null);
  const { toggleChatbot } = useChatbot();

  // Override handleSendMessage to handle issue submissions
  const handleSendMessage = (newMessage) => {
    // Add the user message to the chat
    setMessages((prevMessages) => [...prevMessages, { ...newMessage, sender: 'user' }]);

    // Check if this is an issue description that should be sent to API
    const userText = newMessage.text;
    const isOptionClick = ["General Inquiry", "Raise an Issue", "Back to Main Menu",
      "How do I sync my storage account?", "How do I upload and download files?",
      "How do I manage user permissions?", "How do I check system status and logs?",
      "How do I configure file sharing?", "How do I organize files in folders?",
      "Back to General Inquiry"].includes(userText);

    if (!isOptionClick) {
      // This is a real issue description - send to API
      handleIssueSubmission(userText);
    }
  };

  // Handle option clicks from chatbot responses
  const handleOptionClick = (option) => {
    if (option === "General Inquiry") {
      // Show general inquiry response with specific questions
      const generalResponse = {
        text: "Here are the main features of DatacryptR. Click on any question to learn more:",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: [
          "How do I sync my storage account?",
          "How do I upload and download files?",
          "How do I manage user permissions?",
          "How do I check system status and logs?",
          "How do I configure file sharing?",
          "How do I organize files in folders?",
          "Back to Main Menu"
        ]
      };
      setMessages((prevMessages) => [...prevMessages, generalResponse]);
    } else if (option === "Raise an Issue") {
      // Show issue form
      const issueResponse = {
        text: "Please describe your issue in detail. I'll create a support ticket for you.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: []
      };
      setMessages((prevMessages) => [...prevMessages, issueResponse]);
    } else if (option === "How do I sync my storage account?") {
      const syncResponse = {
        text: "How to Sync Storage Account:\n\n1. Go to Admin Panel\n2. Find your storage account in the Storage Container section\n3. Click the Refresh button next to your account\n4. Wait for the sync to complete (you'll see a success message)\n5. Your files will be updated in the Explore page\n\nTip: Sync automatically updates your file list and folder structure.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["Back to General Inquiry", "Back to Main Menu"]
      };
      setMessages((prevMessages) => [...prevMessages, syncResponse]);
    } else if (option === "How do I upload and download files?") {
      const fileResponse = {
        text: "How to Upload/Download Files:\n\nUpload Files:\n1. Go to Explore page\n2. Navigate to the desired folder\n3. Click Upload button\n4. Select files from your computer\n5. Files will appear in the folder\n\nDownload Files:\n1. Go to Explore page\n2. Find the file you want to download\n3. Click the Download icon next to the file\n4. File will download to your computer\n\nTip: You can also preview files before downloading.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["Back to General Inquiry", "Back to Main Menu"]
      };
      setMessages((prevMessages) => [...prevMessages, fileResponse]);
    } else if (option === "How do I manage user permissions?") {
      const permissionResponse = {
        text: "How to Manage User Permissions:\n\n1. Go to Admin Panel\n2. Click on User Groups tab\n3. Create New Group:\n   • Click 'Add User Group'\n   • Enter group name and description\n   • Select permissions (read, write, admin)\n4. Add Users to Group:\n   • Select the group\n   • Click 'Add Users'\n   • Choose users from the list\n5. Edit Permissions:\n   • Click on existing group\n   • Modify permissions as needed\n\nTip: Users can belong to multiple groups with different permissions.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["Back to General Inquiry", "Back to Main Menu"]
      };
      setMessages((prevMessages) => [...prevMessages, permissionResponse]);
    } else if (option === "How do I check system status and logs?") {
      const logsResponse = {
        text: "How to Check System Status and Logs:\n\n1. Go to Logs page from the sidebar\n2. System Status:\n   • View overall system health\n   • Check storage account status\n   • Monitor task completion\n3. Error Logs:\n   • See recent error messages\n   • Check file processing issues\n   • Monitor sync failures\n4. Real-time Updates:\n   • Logs update automatically\n   • Use search to find specific errors\n\nTip: Check logs regularly to identify and resolve issues quickly.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["Back to General Inquiry", "Back to Main Menu"]
      };
      setMessages((prevMessages) => [...prevMessages, logsResponse]);
    } else if (option === "How do I configure file sharing?") {
      const sharingResponse = {
        text: "How to Configure File Sharing:\n\n1. Go to Admin Panel\n2. Click on File Share tab\n3. Create New Share:\n   • Click 'Add File Share'\n   • Enter share name and path\n   • Select storage account\n   • Choose access permissions\n4. Configure Access:\n   • Set read/write permissions\n   • Add user groups\n   • Set expiration dates\n5. Monitor Usage:\n   • View share statistics\n   • Check access logs\n\nTip: File shares can be temporary or permanent based on your needs.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["Back to General Inquiry", "Back to Main Menu"]
      };
      setMessages((prevMessages) => [...prevMessages, sharingResponse]);
    } else if (option === "How do I organize files in folders?") {
      const folderResponse = {
        text: "How to Organize Files in Folders:\n\n1. Go to Explore page\n2. Navigate Folders:\n   • Click on folder names to open them\n   • Use breadcrumb navigation\n   • Search for specific folders\n3. Create Structure:\n   • Folders are automatically created from storage\n   • Sync to update folder structure\n4. File Organization:\n   • Files appear in their respective folders\n   • Use search to find files quickly\n   • Sort by name, date, or size\n\nTip: Folder structure mirrors your storage account organization.",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["Back to General Inquiry", "Back to Main Menu"]
      };
      setMessages((prevMessages) => [...prevMessages, folderResponse]);
    } else if (option === "Back to General Inquiry") {
      // Return to general inquiry menu
      const generalInquiryResponse = {
        text: "Here are the main features of DatacryptR. Click on any question to learn more:",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: [
          "How do I sync my storage account?",
          "How do I upload and download files?",
          "How do I manage user permissions?",
          "How do I check system status and logs?",
          "How do I configure file sharing?",
          "How do I organize files in folders?",
          "Back to Main Menu"
        ]
      };
      setMessages((prevMessages) => [...prevMessages, generalInquiryResponse]);
    } else if (option === "Back to Main Menu") {
      // Return to main menu
      const mainMenuResponse = {
        text: "Hello! How can I help you today?",
        sender: "server",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        options: ["General Inquiry", "Raise an Issue"]
      };
      setMessages((prevMessages) => [...prevMessages, mainMenuResponse]);
    } else {
      // Check if this is a real issue description (not an option click)
      const isOptionClick = ["General Inquiry", "Raise an Issue", "Back to Main Menu",
        "How do I sync my storage account?", "How do I upload and download files?",
        "How do I manage user permissions?", "How do I check system status and logs?",
        "How do I configure file sharing?", "How do I organize files in folders?",
        "Back to General Inquiry"].includes(option);

      if (isOptionClick) {
        // Don't send option clicks to API
        return;
      }

      // This is a real issue description - send to API
      handleIssueSubmission(option);
    }
  };
  // Handle API call for issue submission
  const handleIssueSubmission = async (userText) => {
    try {
      // Get authentication tokens
      const token = authService.getTokenSync?.() || (await authService.getToken());
      if (!token) {
        throw new Error("No authentication token available");
      }

      const jwt = JSON.parse(token).data.token;

      // Get CSRF token from cookies
      const getCSRFToken = () => {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      };

      const csrfToken = getCSRFToken();

      // Only send to API if it's a real issue description
      console.log('Sending issue to chatbot API:', userText);

      const response = await fetch(`${API_URL}/api/chatbot/ask/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userText
        })
      });

      console.log('Chatbot API response status:', response.status);

      const data = await response.json();
      console.log('Chatbot API response data:', data);

      if (response.ok) {
        // Create server response for issue submission
        const serverResponse = {
          text: "Thank you for reporting this issue! A support ticket has been created and you'll receive a confirmation email shortly. We'll get back to you soon!",
          sender: "server",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          options: ["Back to Main Menu"]
        };

        setMessages((prevMessages) => [...prevMessages, serverResponse]);
      } else {
        // Error response
        const errorResponse = {
          text: data.error || "Sorry, there was an error processing your request. Please try again.",
          sender: "server",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        };
        setMessages((prevMessages) => [...prevMessages, errorResponse]);
      }

    } catch (error) {
      console.error("Error sending message:", error);

      // Handle specific error cases
      let errorMessage = "Sorry, I'm having trouble processing your request. Please try again.";

      if (error.message.includes("No authentication token")) {
        errorMessage = "Please log in to use the chatbot.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: errorMessage,
          sender: "server",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      ]);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  

  return (
    <>
      {!isMinimized && (
        <div>
          <Modal
            isOpen={isOpen}
            onRequestClose={onclose}
            contentLabel="Chatbot"
            overlayClassName="overlay-blur z-[1000]"
            className="fixed left-[84%] transform -translate-x-1/2 bg-white z-1000 
            outline-none w-[25%] h-[70%] cursor-pointer transition-right-0.3s ease-in-out rounded-lg py-4"
            style={{
              overlay: {
                border: 'none', // Remove overlay border
              },
              content: {
                border: 'none', // Remove content border
                boxShadow: '0px 5px 8px 0px #00000040'
              },
            }}
          >
            <div className='flex w-full h-[90%] flex-col'>
              <div className='w-full h-6 flex flex-row items-center space-x-2 px-4'>
                <img
                  src={process.env.PUBLIC_URL + "/dlogo.jpeg"}
                  alt="logo"
                  className="h-6 w-6"
                />
                <p className='font-semibold'> DatacryptR</p>
              </div>
              <hr className='w-full  bg-[#C0C0C0] mt-2 ' />
              <div className='py-2 w-full h-[90%]'>
                <div className="flex-1 w-full h-full overflow-y-auto px-3" style={{ display: 'flex', flexDirection: 'column-reverse', scrollbarWidth: "thin" }}>
                  <div className="space-y-4 flex flex-col mt-4 px-3">
                    {messages.map((message, index) => (
                      <ChatMessage
                        className="text-black"
                        key={index}
                        message={message}
                        isUser={message.sender === 'user'}
                        onOptionClick={handleOptionClick}
                      />
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-none p-2 w-full">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>

            <button
              className="absolute top-2 right-2 bg-background-100 text-2xl font-semibold"
              // onClick={handleClose}
              onClick={onClose}
            >
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4 mt-2"
              />
            </button>
          </Modal>
        </div>
      )}
    </>
  );
};

export default Chatbot;






