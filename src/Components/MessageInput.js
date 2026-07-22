
import React, { useState, useEffect } from "react";
import { API_URL } from "./ApiConfig";
import authService from "./auth";

const MessageInput = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [token,setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Fetch the token and set it in the state
    const fetchToken = async () => {
      try {
        const fetchedToken = await authService.getToken();
        const userGroup = await authService.getUserGroup();
        const dataObject = JSON.parse(fetchedToken);

        // Access the token property from the data object
        const token = dataObject.data.token;
        const email = dataObject.data.email;
        const permissions = dataObject.data.permissions;
     

        setUserEmail(email);
        setPermissions(permissions);
        setToken(token);
        setUserGroups(userGroup);
        setUserEmail(email);
      } catch (error) {
        console.error("Token error:", error);
      }
    };
    // Call the fetchToken function
    fetchToken();
  }, []);

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputText.trim() !== "") {
      // onSendMessage(inputText);
      sendMessage(inputText);
      setInputText("");
    }
  };

  const sendMessage = (message) => {
  // Just call onSendMessage - let the Chatbot component handle API calls
    onSendMessage({ text: message, sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) });
    setInputText("");
  };


  return (
    
    <div className="w-full h-10 flex justify-between space-x-8  items-center px-5 ">
      <div className="flex flex-row justify-between items-center w-full h-8 rounded shadow-top px-2">
        <input
          type="text"
          // className="flex-1 p-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          className="outline-none text-[13px] text-wrap w-64"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button
          // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          onClick={() => {
            if (inputText.trim() !== "") {
              // onSendMessage(inputText);
              // setInputText("");
              sendMessage(inputText);
              setInputText("");
            }
          }}
        >
          <img
            src={process.env.PUBLIC_URL + "/send-icon.jpeg"}
            alt="send"
            style={{
              width: "18px",
              height: "18px",
              outline: "none",
            }}
          />
        </button>
      </div>
      {/* <img
            src={process.env.PUBLIC_URL + "/attachment-icon.png"}
            alt="attach"
            style={{
              width: "14px",
              height: "14px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          /> */}
    </div>
  );
};

export default MessageInput;

// import React, { useState } from "react";

// const MessageInput = ({ onSendMessage }) => {
//   const [inputText, setInputText] = useState("");

//   const handleChange = (e) => {
//     setInputText(e.target.value);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && inputText.trim() !== "") {
//       sendMessage(inputText);
//     }
//   };

//   const sendMessage = async (message) => {
//     // Add the user's message to the chat
//     onSendMessage(message);
//     setInputText("");

//     try {
//       // Simulate network delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Generate a dummy response
//       const dummyResponse = {
//         text: "This is a dummy response from the server.",
//         sender: "server",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
//       };

//       // Add the dummy response from the server to the chat
//       onSendMessage(dummyResponse);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       // Optionally, you can add an error message to the chat
//       onSendMessage({
//         text: "Failed to send message. Please try again.",
//         sender: "server",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
//       });
//     }
//   };

//   return (
//     <div className="w-full h-10 flex justify-between items-center px-5">
//       <div className="flex flex-row w-full justify-between items-center  h-8 rounded shadow-top px-2">
//         <input
//           type="text"
//           className="outline-none text-[13px] text-wrap w-64"
//           placeholder="Type a message..."
//           value={inputText}
//           onChange={handleChange}
//           onKeyDown={handleKeyDown}
//         />
//         <button
//           onClick={() => {
//             if (inputText.trim() !== "") {
//               sendMessage({
//                 text: inputText,
//                 sender: "user",
//                 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
//               });
//             }
//           }}
//         >
//           <img
//             src={process.env.PUBLIC_URL + "/send-icon.png"}
//             alt="send"
//             style={{
//               width: "18px",
//               height: "18px",
//               outline: "none",
//             }}
//           />
//         </button>
//       </div>
//       <img
//         src={process.env.PUBLIC_URL + "/attachment-icon.png"}
//         alt="attach"
//         style={{
//           width: "14px",
//           height: "14px",
//           cursor: "pointer",
//           marginRight: "8px",
//         }}
//       />
//     </div>
//   );
// };

// export default MessageInput;

