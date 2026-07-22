// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import Modal from "react-modal";
// import './Styles/custom.css'

// Modal.setAppElement("#root");
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Modal from "react-modal";
import './Styles/custom.css';
import { ChatbotProvider } from './Components/ChatbotContext';
import { ViewportProvider } from './Components/ViewportContext';
import { AuthProvider } from './Components/AuthContext';
import { UIProvider } from './Components/Context/UIContext';

Modal.setAppElement("#root");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
    <ChatbotProvider> {/* Wrap the app with ChatbotProvider */}
      <UIProvider>
      <App />
      </UIProvider>
    </ChatbotProvider>
    </AuthProvider>
  </React.StrictMode>
);


