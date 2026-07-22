
import React, { useEffect } from "react";
import Modal from "react-modal";

const  FileShareModal = ({ isOpen,closeModal, renderContent, showPreview, }) => {
  useEffect(() => {
    const modalState = localStorage.getItem("modalState");
    if (modalState) {
    //   closeModal();
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
        w-[60%] h-[70%] overflow-y-auto cursor-pointer mt-[153px] overflow-x-hidden rounded-xl
        
       `}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#a0a0a0 #f0f0f0",
      }}
      onRequestClose={handleClose}
      shouldCloseOnOverlayClick={true}
    >
      {/* {showPreview && (
        <div className="w-full h-[98%] outline-none" style={{ scrollbarWidth: "thin" }}>
          {renderContent()}
        </div>
      )} */}
      <div className="w-full flex justify-end fixed">
        <button
          className="bg-background-100 text-2xl font-semibold mr-6 mt-8"
          onClick={closeModal}
        >
           <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4 mt-6"
              />
        </button>
        {/* Add other navbar elements or links here */}
       </div> 
       {showPreview && (
        <div
          className={`w-full h-[98%] outline-none `}
          style={{ scrollbarWidth: "thin" }}
        >
          {renderContent()}
        </div>
      )}
    </Modal>
  );
};

export default FileShareModal;



