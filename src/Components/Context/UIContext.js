import React, { createContext, useContext, useState } from "react";
import { useChatbot } from "../ChatbotContext";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const { isOpen } = useChatbot();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedUserGroupDeletion, setSelectionUserGroupDeletion] =useState(null);
   const [showChatbot, setShowChatbot] = useState(false);

  const isDisabled = isOpen || selectedUserGroupDeletion;
  const isBlurred = isTimezoneModalOpen || showProfileModal || showChatbot  ;

  return (
    <UIContext.Provider
      value={{
        isTimezoneModalOpen,
        setIsTimezoneModalOpen,
        showProfileModal,
        setShowProfileModal,
        isPopupOpen,
        setIsPopupOpen,
        error,
        setError,
        isNoDataPopupOpen,
        setIsNoDataPopupOpen,
        setSelectedOption,
        selectedOption,
        isDisabled,
        isBlurred,
        selectedUserGroupDeletion,
        setSelectionUserGroupDeletion,
        isOpen,
        showChatbot,
        setShowChatbot
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
// export const useUI = () => {
//   const context = useContext(UIContext);

//   if (!context) {
//     console.error("UIContext is undefined");
//     return {}; // 🔥 prevent crash
//   }

//   return context;
// };
