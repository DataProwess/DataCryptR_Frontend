import React from "react";
import Modal from "react-modal";
const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});
const MetaDataModal = ({
  isOpen,
  closeModal,
  metadata,
  renderMetadata,
  showPreview,
  metadatamodalWidth,
  metadatamodalHeight
 
}) => {

    const handleClose = () => {
        closeModal();
        // closePreviewModal(); // Close the preview modal and reset selections
      };
      const {width , height} = getViewportDimensions();
const modalWidth = (width * 0.35).toFixed(2);
const modalHeight = (height * 0.75).toFixed(2);
const marginleft = (width * 0.3).toFixed(2)
const timezoneHeight = (modalHeight * 0.8).toFixed(2)
const listHeight = (timezoneHeight * 0.9).toFixed(2);
const searchWidth = (modalWidth * 0.9).toFixed(2);
const searchHeight = (modalHeight * 0.09).toFixed(2);
const timezoneContainerWidth = (modalWidth * 0.9).toFixed(2);
const timezoneContainerHeight = (modalHeight * 0.7).toFixed(2);
const timelistWidth = (timezoneContainerHeight * 0.95).toFixed(2);
const timelistHeight = (timezoneContainerHeight * 0.9).toFixed(2);

      return(
        <div
    className={`fixed inset-0 z-[9999] flex items-center justify-center ${
      isOpen ? "block" : "hidden"
    }`}
  >
    {/* <div
      className="fixed inset-0 "
      onClick={handleClose}
    ></div> */}
    <div
      className="relative bg-white flex flex-col rounded-lg shadow shadow-slate-500/30 p-4 transform -translate-x-1/2 transition-right-0.3s ease-in-out"
      style={{
        width: `${metadatamodalWidth}px`, // Use viewport width directly
        height: `${metadatamodalHeight}px`, // Use viewport height directly
        // boxSizing: 'border-box',
        // padding: '20px',
        marginLeft:`${marginleft}px`
      }}
    >
      <div className="w-full flex justify-end fixed">
        <button
          className=" text-2xl font-semibold mr-6 "
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
      <div className=" flex flex-col justify-center items-center " 
      // style={{
      //   width: `${(modalWidth * 0.9).toFixed(2)}px`, // Use viewport width directly
      //   height: `${(modalHeight * 0.9).toFixed(2)}px`, // Use viewport height directly
      //   scrollbarWidth:"thin"
        
      // }}
      >
{showPreview && (
        <div className="w-full h-full flex justify-center items-center"
        style={{scrollbarWidth:"thin"}}
        >{renderMetadata(metadata)}</div>
      )}
      {!showPreview && <p>No metadata available</p>}
      </div>
    </div>
    </div>
        
      )
  // return (
  //   <Modal
  //     isOpen={isOpen}
  //     onRequestClose={handleClose}
  //     contentLabel="Metadata Modal"
  //     overlayClassName="overlay-blur"
  //   // overlayClassName="backdrop-filter-none"
   
  //     className="fixed left-[60%] transform -translate-x-1/2 bg-white border-1 border-solid border-ccc z-1000 
  //     w-[40%] h-[65%] overflow-y-auto mt-[60px] cursor-pointer rounded-md transition-right-0.3s ease-in-out shadow-top "
  //     onAfterOpen={() => {
  //       // Focus on the radio button when the modal opens
  //       const tabularRadio = document.getElementById("tabular");
  //       if (tabularRadio) {
  //         tabularRadio.focus();
  //       }
  //     }}
  //   >
      //  <div className="w-full flex justify-end fixed">
      //   <button
      //     className="bg-background-100 text-2xl font-semibold mr-6 mt-2 "
      //     onClick={closeModal}
      //   >
      //      <img
      //           src={process.env.PUBLIC_URL + "/closefile.png"}
      //           alt="close"
      //           className="h-4 w-4"
      //         />
      //   </button>
      //   {/* Add other navbar elements or links here */}
      //  </div>
      // {showPreview && (
      //   <div className="w-full h-full flex justify-center items-center p-8"
      //   style={{scrollbarWidth:"thin"}}
      //   >{renderMetadata(metadata)}</div>
      // )}
      // {!showPreview && <p>No metadata available</p>}
  //   </Modal>
  // );
};

export default MetaDataModal;
