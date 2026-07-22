import React, { useEffect } from "react";
import Modal from "react-modal";

const MiscellaneousModal = ({ isOpen, closeModal, renderContent, showPreview }) => {
  useEffect(() => {
    const modalState = localStorage.getItem("modalState");
    if (modalState) {
      // closeModal();
    }
  }, []);

  const handleClose = () => {
    // localStorage.setItem("modalState", "closed");
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel="Metadata Modal"
      overlayClassName="overlay-blur"
      className={`fixed top-0 left-[64%] transform -translate-x-1/2 bg-white
        ${isOpen ? "shadow-md border border-none" : ""} 
        w-[60%] h-[70%] overflow-y-auto cursor-pointer mt-[153px] overflow-x-hidden rounded-xl`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#a0a0a0 #f0f0f0",
      }}
      onRequestClose={handleClose}
      shouldCloseOnOverlayClick={true}
    >
      
      {showPreview && (
        <div className="w-full h-[98%] outline-none" style={{ scrollbarWidth: "thin" }}>
          {renderContent()}
        </div>
      )}
    </Modal>
  );
};

export default MiscellaneousModal;