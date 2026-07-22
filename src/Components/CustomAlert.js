import React from 'react';
import ReactDOM from 'react-dom';

const CustomAlert = ({ message, onClose }) => {
  return ReactDOM.createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 text-sm rounded-lg shadow-md text-center w-full max-w-sm mx-auto top-0">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CustomAlert;
