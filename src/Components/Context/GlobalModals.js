import TimezoneModal from "../NavBarOptions/TimeZoneModal";
import ProfileModal from "../NavBarOptions/ProfileModal";
import ErrorPopup from "../ErrorPopup";
import FolderNoDataPopup from "../FolderNoDataPopup";
import { useUI } from "./UIContext";
import Chatbot from "../Chatbot";
import { useAuth } from "../AuthContext";

const GlobalModals = () => {
    const {token,csrfToken,userEmail}=useAuth()
  const {
    isTimezoneModalOpen,
    setIsTimezoneModalOpen,
    showChatbot,
    setShowChatbot,
    showProfileModal,
    setShowProfileModal,
    isPopupOpen,
    setIsPopupOpen,
    error,
    isNoDataPopupOpen,
  } = useUI();

  const handleCloseAll = () => {
    setShowChatbot(false);
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    setIsPopupOpen(false);
   
  };

  return (
    <>
      <TimezoneModal
        isTimezoneModalOpen={isTimezoneModalOpen}
        setIsTimezoneModalOpen={setIsTimezoneModalOpen}
        token={token}
        csrfToken={csrfToken}
        userEmail={userEmail}
        // closePreviewModal={handleCloseAll}
      />
       {showChatbot && (
                <Chatbot
                  isOpen={showChatbot}
                  onClose={handleCloseAll} // Pass handleCloseChatbot to Chatbot
                />
              )}

      {showProfileModal && (
        <ProfileModal isOpen={showProfileModal} onClose={handleCloseAll} />
      )}

      {isPopupOpen && (
        <ErrorPopup isOpen={isPopupOpen} message={error} />
      )}

      <FolderNoDataPopup isOpen={isNoDataPopupOpen} />
    </>
  );
};

export default GlobalModals;