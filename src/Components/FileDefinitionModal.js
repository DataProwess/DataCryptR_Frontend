import React from "react";
import Modal from "react-modal";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const FileDefinitionModal = ({
  isOpen,
  closeModal,
  columnData,
  renderColumnData,
  showPreview,
  modalWidth,
  modalHeight
 
}) => {

    const handleClose = () => {
        closeModal();
        // closePreviewModal(); // Close the preview modal and reset selections
      };
      const {width , height} = getViewportDimensions();
//  const     modalWidth = (width * 0.35).toFixed(2);
// const modalHeight = (height * 0.9).toFixed(2);
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
          className="relative bg-white flex flex-col justify-center items-center  rounded-lg shadow shadow-slate-500/30  transform -translate-x-1/2 transition-right-0.3s ease-in-out"
          style={{
            width: `${modalWidth}px`, // Use viewport width directly
            height: `${modalHeight}px`, // Use viewport height directly
            // boxSizing: 'border-box',
            // padding: '20px',
            marginLeft:`${marginleft}px`
          }}
        >
          {/* <div className="w-full flex justify-end fixed">
            <button
              className=" text-2xl font-semibold mt-3 mr-2 "
              onClick={closeModal}
            >
               <img
                    src={process.env.PUBLIC_URL + "/closefile.png"}
                    alt="close"
                    className="h-4 w-4"
                  />
            </button>
            {/* Add other navbar elements or links here */}
           {/* </div>  */}
          <div className="overflow-auto flex flex-col  justify-center items-center px-4" 
          style={{
            width: `${(modalWidth * 0.98).toFixed(2)}px`, // Use viewport width directly
            height: `${(modalHeight * 0.95).toFixed(2)}px`, // Use viewport height directly
            scrollbarWidth:"thin"
            
          }}
          >
     {showPreview && (
        <div className="w-full h-full flex justify-center items-center "
        >{renderColumnData(columnData)}</div>
      )}
      {!showPreview && <p>No ColumnData available</p>}
          </div>
        </div>
        </div>
            
          

      )
  return (
    
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Metadata Modal"
      overlayClassName="overlay-blur"
    // overlayClassName="backdrop-filter-none"
   
      // className="fixed left-[60%] transform -translate-x-1/2 bg-white 
      // w-[33%] h-[80%] overflow-y-auto overflow-x-auto mt-[80px] cursor-pointer rounded-md transition-right-0.3s 
      // ease-in-out shadow-top  "
      className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white 
                 w-[50%] md:w-[30%] lg:w-[35%] h-[80%] overflow-y-auto overflow-x-auto mt-[60px] 
                 cursor-pointer rounded-md transition-all duration-300 ease-in-out shadow-top"
      onAfterOpen={() => {
        // Focus on the radio button when the modal opens
        const tabularRadio = document.getElementById("tabular");
        if (tabularRadio) {
          tabularRadio.focus();
        }
      }}
    >
       <div className="w-full flex justify-end fixed">
        <button
          className="bg-background-100 text-2xl font-semibold mr-6 mt-2 "
          onClick={closeModal}
        >
          <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4 mt-2"
              />
        </button>
        {/* Add other navbar elements or links here */}
       </div> 
      {showPreview && (
        <div className="w-full h-full flex justify-center items-center "
        >{renderColumnData(columnData)}</div>
      )}
      {!showPreview && <p>No ColumnData available</p>}
    </Modal>
  );
};

export default FileDefinitionModal;
