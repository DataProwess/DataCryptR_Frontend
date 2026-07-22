import React from "react";
import Modal from "react-modal";

const EditUserModal = ({
  isOpen,
  closeModal,
//   metadata,
renderEditUserGroup,
editUserGroup,
  showPreview,
  availableItems,
  chosenItems,
  handleItemClick,
  handleChooseAll,
  handleRemoveAll,
 
}) => {
  const handleClose = () => {
    closeModal();
    // closePreviewModal(); // Close the preview modal and reset selections
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Metadata Modal"
      overlayClassName="overlay-blur"
    // overlayClassName="backdrop-filter-none"
   
//     className="fixed top-0 left-[65%] transform -translate-x-1/2  bg-background-100 
//     z-50 w-[60%] h-[87%] overflow-y-auto cursor-pointer  mt-[80px]  shadow-lg overflow-x-hidden rounded-xl"
// style={{
//   scrollbarWidth: "thin",
//   scrollbarColor: "#a0a0a0 #f0f0f0",
// }}

className="fixed bg-[#F0F4FB] rounded-lg shadow shadow-slate-500/30 transform
    overflow-y-auto cursor-pointer border-solid border-ccc z-1000 transition-right-0.3s ease-in-out addedit-user-dimensions scrollbar-thin"
style={{
  scrollbarWidth: "thin",
  scrollbarColor: "#a0a0a0 #f0f0f0",
}}


      onAfterOpen={() => {
        // Focus on the radio button when the modal opens
        const tabularRadio = document.getElementById("tabular");
        if (tabularRadio) {
          tabularRadio.focus();
        }
      }}
    >
      
      {/* {showPreview && ( */}
        <div className="w-full h-[98%]"
        style={{scrollbarWidth:"thin"}}
        >{renderEditUserGroup()}</div>
      {/* )} */}
      {/* {!showPreview && <p>No metadata available</p>} */}
    </Modal>
  );
};

export default EditUserModal;
