
// import React from 'react';

// const ChatMessage = ({ message }) => {
//   const { text, sender, time } = message;
//   const isUser = sender === 'user';

//   return (
//     <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
//       <div
//         className={`px-2 py-1 max-w-[70%] h-auto flex rounded-md shadow-top relative ${
//           isUser ? 'bg-loginbg text-white self-end' : 'bg-gray-200 self-start'
//         }`}
//         style={{
//           paddingBottom: '15px', // Add padding to create space for the time
//           paddingRight: '5px',
//           paddingLeft: '5px',
//           wordBreak: 'break-word', // Ensure long words are wrapped
//           whiteSpace: 'pre-wrap', // Ensure text breaks at whitespace
//           overflowWrap: 'break-word', // Ensure overflow is wrapped
//           position: 'relative', // Ensure positioning context for absolute positioning
//           minWidth: '50px', // Ensure the bubble has a minimum width to prevent wrapping issues
//         }}
//       >
//         <div className="flex flex-col w-auto h-auto">
//           <p className="text-xs break-words">{text}</p>
//           <div
//             className="absolute bottom-0 right-0 flex items-end"
//             style={{
//               marginBottom: '2px',
//               marginRight: '5px',
//               display: 'flex',
//               alignItems: 'center',
//             }}
//           >
//             <p
//               className={`text-[10px] ${isUser ? 'text-gray-300' : 'text-gray-500'}`}
//             >
//               {time}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;


import React from 'react';

const ChatMessage = ({ message, onOptionClick }) => {
  const { text, sender, time, options } = message;
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`px-6 py-3 max-w-[70%] h-auto flex rounded-lg shadow relative ${
          isUser ? 'bg-purpleshade1 text-white self-end' : 'bg-primary text-black self-start'
        }`}
        style={{
          paddingBottom: '15px', // Add padding to create space for the time
          paddingRight: '10px',
          paddingLeft: '10px',
          wordBreak: 'break-word', // Ensure long words are wrapped
          whiteSpace: 'pre-wrap', // Ensure text breaks at whitespace
          overflowWrap: 'break-word', // Ensure overflow is wrapped
          position: 'relative', // Ensure positioning context for absolute positioning
          minWidth: '50px', // Ensure the bubble has a minimum width to prevent wrapping issues
        }}
      >
        <div className="flex flex-col w-auto h-auto">
          <p className="text-xs break-words">{text}</p>

          {/* Display options if available */}
          {!isUser && options && options.length > 0 && (
            <div className="mt-3 space-y-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onOptionClick && onOptionClick(option)}
                  className="block w-full text-left px-3 py-2 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  style={{ color: '#6c757d' }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <div
            className="absolute bottom-0 right-0 flex items-end"
            style={{
              marginBottom: '2px',
              marginRight: '5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <p
              className={`text-[10px] ${isUser ? 'text-white' : 'text-black'}`}
            >
              {time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;







