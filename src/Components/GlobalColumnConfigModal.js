
import React from "react";
import Modal from "react-modal";

const GlobalColumnConfigModal = ({
  isOpen,
  closeModal,
  renderContent,
  showPreview,
  showUploadPopup,
  UploadPopup,
}) => {
  const handleClose = () => {
    closeModal();
  };

  return (
    <>
      <div className="relative">
        <Modal
          isOpen={isOpen}
          shouldCloseOnOverlayClick={true}
          contentLabel="Metadata Modal"
          overlayClassName="overlay-blur"
          // className={`fixed top-0 left-[64%] transform -translate-x-1/2 bg-white border-none w-[58%] 
          // h-[80%] overflow-y-auto cursor-pointer mt-[100px] shadow-top overflow-x-hidden rounded-xl 
         
          // `}
          // style={{
          //   scrollbarWidth: "thin",
          //   scrollbarColor: "#a0a0a0 #f0f0f0",
          //   // zIndex: 1000,  // z-index for the Modal
          // }}
          className={`fixed top-[55%] left-[65%] transform -translate-x-1/2 -translate-y-1/2 bg-white border-none 
            w-[90%] md:w-[70%] lg:w-[60%] h-[80%] overflow-y-auto cursor-pointer shadow-lg overflow-x-hidden rounded-xl`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#a0a0a0 #f0f0f0",
          }}
          onRequestClose={handleClose}
        >
          <div>
          <div className="w-full flex justify-end fixed">
        <button
          className="bg-background-100 text-2xl font-semibold mr-6 mt-2 "
          onClick={closeModal}
        >
           <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
        </button>
        {/* Add other navbar elements or links here */}
       </div>
            {showPreview && (
              <div className="w-full h-full" style={{ scrollbarWidth: "thin" }}>
                {renderContent()}
              </div>
            )}
          </div>
        </Modal>
      </div>
      {/* {showUploadPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-[1100]">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <UploadPopup />
          </div>
        </div>
      )} */}
    </>
  );
};

export default GlobalColumnConfigModal;


