import React from "react";
import Modal from "react-modal";
import "./AdminPanel/modal.css"

const AddUserGroupModal = ({
  isOpen,
  closeModal,
//   metadata,
renderAddUserGroup,
  showPreview,
 
}) => {
// eslint-disable-next-line
const handleClose = () => {
  closeModal();
};

if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Metadata Modal"
      overlayClassName="overlay-blur"
    // overlayClassName="backdrop-filter-none"
   
    // className="fixed top-0 left-[65%] transform -translate-x-1/2  bg-background-100 
    // z-100 w-[60%] h-[85%] overflow-y-auto cursor-pointer  mt-[100px]  shadow-lg overflow-x-hidden rounded-xl"
    // overlayClassName="overlay-blur"
    className="fixed bg-[#F0F4FB] rounded-lg shadow shadow-slate-500/30 
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
{/* <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="User Group Modal"
      // ✅ Fix 1: Ensure overlay covers the entire screen above ALL sidebars
      overlayClassName="fixed inset-0  z-[9999] flex justify-center items-center "
      
      // ✅ Fix 2: Center the modal panel and reset hardcoded offset positioning
      className="bg-[#F0F4FB] rounded-xl shadow-2xl border border-gray-200 
                 w-[75vw] max-w-[900px] h-[90vh] overflow-y-auto outline-none 
                 p-6 relative z-[10000] scrollbar-thin"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#a0a0a0 #f0f0f0",
      }}
    > */}
       
      {showPreview && (
        <div className="w-full h-[98%]"
        style={{scrollbarWidth:"thin"}}
        >{renderAddUserGroup()}</div>
        // <>
        // <div className="admin-data">
        //   <div className="user-modal flex flex-col items-center bg-green-400">

        //   </div>

        // </div>
        // </>
      )}
      {/* {!showPreview && <p>No metadata available</p>} */}
    </Modal>
  );
};

export default AddUserGroupModal;

