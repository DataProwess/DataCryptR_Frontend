// import React, { useState, useEffect } from 'react';
// import Modal from 'react-modal';
// import { API_URL } from './ApiConfig';
// import Jsontimezones from "./TimeZones";
// const getViewportDimensions = () => ({
//   width: window.innerWidth,
//   height: window.innerHeight,
// });

// const AddMaskingConfig = ({
//     closePreviewModal,
//     isAddMaskingConfigOpen

// }) => {
 
//   // const [isTimezoneModalOpen ,setIsTimezoneModalOpen]= useState(false)
 
 
  
// const {width , height} = getViewportDimensions();
// const modalWidth = (width * 0.28).toFixed(2);
// const modalHeight = (height * 0.8).toFixed(2);
// const marginleft = (width * 0.2).toFixed(2)
// const timezoneHeight = (modalHeight * 0.7).toFixed(2)
// const listHeight = (timezoneHeight * 0.9).toFixed(2);
// const searchWidth = (modalWidth * 0.9).toFixed(2);
// const searchHeight = (modalHeight * 0.09).toFixed(2);
// const timezoneContainerWidth = (modalWidth * 0.9).toFixed(2);
// const timezoneContainerHeight = (modalHeight * 0.7).toFixed(2);
// const timelistWidth = (timezoneContainerHeight * 0.95).toFixed(2);
// const timelistHeight = (timezoneContainerHeight * 0.9).toFixed(2);




// return(
//   <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${
//     isAddMaskingConfigOpen ? "block" : "hidden"
//   }`}>
    
//     <div
//       className="relative bg-white flex flex-col   shadow-md shadow-slate-500/30 rounded-lg  transform -translate-x-1/2 transition-right-0.3s ease-in-out"
//       style={{
//         width: `${modalWidth}px`, // Use viewport width directly
//         height: `${modalHeight}px`, // Use viewport height directly
//         // boxSizing: 'border-box',
//         // padding: '20px',
//         marginLeft:`${marginleft}px`
//       }}
//     >
//       <div className='flex flex-col  ' style={{width:`${modalWidth}px`, height:`${modalHeight * 0.12}px`}}>
//       <div className=" flex justify-between p-3 "style={{width:`${modalWidth}px`, height:`${((modalHeight * 0.15) * 0.7).toFixed(2)}px`}}>
//       <h2 className="text-base font-medium mb-2">Timezone</h2>
//         <button
//           className="bg-background-100 text-2xl font-semibold "
//           onClick={() => {
//             closePreviewModal();
            
//           }}
//         >
//           <img
//             src={process.env.PUBLIC_URL + "/closefile.png"}
//             alt="close"
//             className="h-4 w-4"
//           />
//         </button>
//       </div>
      

//       </div>
//       <div className=' flex justify-center px-6 items-center' style={{width:`${modalWidth}px`,height:`${searchHeight}px`}}>
//       <input
//           type="text"
//           className=" px-2 py-1 text-sm border font-normal rounded placeholder:text-sm "
//           placeholder="Selected Timezone"
//           value={""}
//           readOnly
//           style={{width:`${searchWidth}px`, height:`${(searchHeight * 0.7).toFixed(2)} `}}
//         />

//       </div>
//       <div className=' flex flex-col  items-center px-3' style={{width:`${modalWidth}px`, height:`${modalHeight * 0.75}px`}}>
//         <div className='  border rounded-lg item-center px-2 ' 
//         style={{width:`${(modalWidth * 0.9).toFixed(2)}px`, height:`${((modalHeight * 0.75) * 0.98).toFixed(2)}px`}}>
//           <div  className=' items-center mt-1 ' 
//           style={{width:`${(modalWidth * 0.85).toFixed(2)}px`, height:`${(((modalHeight * 0.75) * 0.98) * 0.1).toFixed(2)}px`}}>
//             <div className=" flex flex-row bg-white justify-between items-center px-3 border  rounded"
//             style={{width:`${(modalWidth * 0.85).toFixed(2)}px`, height:`${(((modalHeight * 0.75) * 0.98) * 0.08).toFixed(2)}px`}}>
//               <input
//             type="text"
//             className="focus:outline-none  placeholder:text-xs"
//             placeholder="Search Timezone"
//             value={""}
//             onChange={""}
//             style={{width:`${(modalWidth * 0.8).toFixed(2)}px`, height:`${(((modalHeight * 0.75) * 0.98) * 0.06).toFixed(2)}px`}}
//           />
//           <img
//             src={process.env.PUBLIC_URL + "/search_icon.png"}
//             alt="search"
//             className="w-4 h-4 ml-2"
//           />

//             </div>

//           </div>
//           <div className=' flex flex-col overflow-auto scrollbar-thin px-2 text-sm font-normal' 
//           style={{width:`${(modalWidth * 0.87).toFixed(2)}px`, height:`${((modalHeight * 0.65) * 0.98).toFixed(2)}px`}}>
            

//           </div>

//         </div>

//       </div>
//     </div>
    
//   </div>
// )



// };

// export default AddMaskingConfig;

// import React, { useState, useEffect } from 'react';
// import Modal from 'react-modal';
// import { API_URL } from './ApiConfig';
// import Jsontimezones from "./TimeZones";

// const getViewportDimensions = () => ({
//   width: window.innerWidth,
//   height: window.innerHeight,
// });

// const AddMaskingConfig = ({
//     closePreviewModal,
//     isAddMaskingConfigOpen
// }) => {
//     const { width, height } = getViewportDimensions();
//     const modalWidth = (width * 0.28).toFixed(2);
//     const modalHeight = (height * 0.8).toFixed(2);
//     const marginleft = (width * 0.2).toFixed(2);
//     const [showTextBoxes, setShowTextBoxes] = useState(false);
    
//     const handleCheckboxChange = () => {
//         setShowTextBoxes(prev => !prev);
//     };

//     return (
//         <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isAddMaskingConfigOpen ? "block" : "hidden"}`}>
//             <div
//                 className="relative bg-white flex flex-col shadow-md shadow-slate-500/30 rounded-lg"
//                 style={{
//                     width: `${modalWidth}px`,
//                     height: `${modalHeight}px`,
//                     marginLeft: `${marginleft}px`
//                 }}
//             >
//                 <div className='flex flex-col' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.12}px` }}>
//                     <div className="flex justify-between p-3" style={{ width: `${modalWidth}px`, height: `${((modalHeight * 0.15) * 0.7).toFixed(2)}px` }}>
//                         <h2 className="text-base font-medium mb-2">Timezone</h2>
//                         <button className="bg-background-100 text-2xl font-semibold" onClick={closePreviewModal}>
//                             <img src={process.env.PUBLIC_URL + "/closefile.png"} alt="close" className="h-4 w-4" />
//                         </button>
//                     </div>
//                 </div>

//                 <div className='flex justify-center px-6 items-center' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.09}px` }}>
//                     <input
//                         type="text"
//                         className="px-2 py-1 text-sm border font-normal rounded placeholder:text-sm"
//                         placeholder="Selected Timezone"
//                         value={""}
//                         readOnly
//                         style={{ width: `${(modalWidth * 0.9).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
//                     />
//                 </div>

//                 <div className='flex flex-col items-center px-3' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.75}px` }}>
//                     <div className='border rounded-lg item-center px-2' 
//                          style={{ width: `${(modalWidth * 0.9).toFixed(2)}px`, height: `${((modalHeight * 0.75) * 0.98).toFixed(2)}px` }}>
                         
//                         <div className='flex justify-between items-center mt-2'>
//                             <input 
//                                 type="checkbox" 
//                                 onChange={handleCheckboxChange} 
//                                 className="mr-2"
//                             />
//                             <label className="text-sm">Show Additional Fields</label>
//                         </div>

//                         {showTextBoxes && (
//                             <div className="flex flex-col mt-2">
//                                 {/* Render four text boxes */}
//                                 {[...Array(4)].map((_, index) => (
//                                     <input 
//                                         key={index}
//                                         type="text" 
//                                         className="my-2 px-2 py-1 border rounded"
//                                         placeholder={`Text Box ${index + 1}`} 
//                                     />
//                                 ))}
//                             </div>
//                         )}

//                         {/* Always show two checkboxes */}
//                         <div className="flex items-center mt-2">
//                             <input type="checkbox" className="mr-2" />
//                             <label className="text-sm">Checkbox 1</label>
//                         </div>
//                         <div className="flex items-center mt-2">
//                             <input type="checkbox" className="mr-2" />
//                             <label className="text-sm">Checkbox 2</label>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddMaskingConfig;
import React, { useState } from 'react';
import Modal from 'react-modal';
import { API_URL } from './ApiConfig';
import Jsontimezones from "./TimeZones";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

// const AddMaskingConfig = ({ closePreviewModal, isAddMaskingConfigOpen }) => {
//     const { width, height } = getViewportDimensions();
//     const modalWidth = (width * 0.28).toFixed(2);
//     const modalHeight = (height * 0.8).toFixed(2);
//     const marginleft = (width * 0.2).toFixed(2);
//     const [showTextBoxes, setShowTextBoxes] = useState(false); // Default is false

//     const handleCheckboxChange = () => {
//         setShowTextBoxes(prev => !prev);
//     };

//     return (
//         <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isAddMaskingConfigOpen ? "block" : "hidden"}`}>
//             <div
//                 className="relative bg-white flex flex-col shadow-md shadow-slate-500/30 rounded-lg"
//                 style={{
//                     width: `${modalWidth}px`,
//                     height: `${modalHeight}px`,
//                     marginLeft: `${marginleft}px`
//                 }}
//             >
//                 <div className='flex flex-col' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.12}px` }}>
//                     <div className="flex bg-red-400 justify-between p-3" style={{ width: `${modalWidth}px`, height: `${((modalHeight * 0.15) * 0.7).toFixed(2)}px` }}>
//                         <h2 className="text-base font-medium mb-2">Timezone</h2>
//                         <button className="bg-background-100 text-2xl font-semibold" onClick={closePreviewModal}>
//                             <img src={process.env.PUBLIC_URL + "/closefile.png"} alt="close" className="h-4 w-4" />
//                         </button>
//                     </div>
//                 </div>

               

//                 <div className='flex flex-col bg-green-400 items-center ' 
//                 style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.85}px` }}>
//                     <div className=' flex flex-col border rounded-lg item-center px-2' 
//                          style={{ width: `${(modalWidth * 0.9).toFixed(2)}px`, height: `${((modalHeight * 0.85) * 0.98).toFixed(2)}px` }}>
                          
//                         {/* Always show two checkboxes by default */}
                       

//                         {/* Show checkbox to toggle additional text fields */}
//                         <div className='flex justify-between items-center mt-2'>
//                             <input 
//                                 type="checkbox" 
//                                 checked={showTextBoxes} // Check state
//                                 onChange={handleCheckboxChange} 
//                                 className="mr-2"
//                             />
//                             <label className="text-sm">Show Additional Fields</label>
                            
//                         </div>

                       

//                         {showTextBoxes && (
//                             <div className="px-2 py-1 text-sm  font-normal rounded placeholder:text-sm">
//                                 {/* Render four text boxes */}
//                                 {[...Array(2)].map((_, index) => (
//                                     <input 
//                                         key={index}
//                                         type="text" 
//                                         className="my-2 px-2 py-1 border rounded"
//                                         placeholder={`Text Box ${index + 1}`} 
//                                         style={{ width: `${(modalWidth * 0.8).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
//                                     />
//                                 ))}
//                             </div>
//                         )}
//                         {/* <div className='flex  bg-green-400'  */}
//                         {/* style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.09}px` }}> */}
//                     <input
//                         type="text"
//                         className="px-2 py-1 text-sm border font-normal rounded placeholder:text-sm"
//                         placeholder="Selected Timezone"
//                         value={""}
//                         readOnly
//                         style={{ width: `${(modalWidth * 0.8).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
//                     />
//                 {/* </div> */}
//                 {/* <div className='flex justify-center items-center' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.09}px` }}> */}
//                     <input
//                         type="text"
//                         className="px-2 py-1 text-sm border font-normal rounded placeholder:text-sm"
//                         placeholder="Selected Timezone"
//                         value={""}
//                         readOnly
//                         style={{ width: `${(modalWidth * 0.9).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
//                     />
//                 {/* </div> */}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddMaskingConfig;


const AddMaskingConfig = ({ closePreviewModal, isAddMaskingConfigOpen,containerData }) => {
    console.log(containerData);
    const { width, height } = getViewportDimensions();
    const modalWidth = (width * 0.28).toFixed(2);
    const modalHeight = (height * 0.8).toFixed(2);
    const marginleft = (width * 0.2).toFixed(2);
    const [showTextBoxes, setShowTextBoxes] = useState(false); // Default is false
    const [csvFile, setCsvFile] = useState(""); // State for CSV file input
    const [email, setEmail] = useState(""); // State for email input

    const handleCheckboxChange = () => {
        setShowTextBoxes(prev => !prev);
    };

    const handleCsvChange = (event) => {
        setCsvFile(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isAddMaskingConfigOpen ? "block" : "hidden"}`}>
            <div
                className="relative bg-white flex flex-col shadow-md shadow-slate-500/30 rounded-lg"
                style={{
                    width: `${modalWidth}px`,
                    height: `${modalHeight}px`,
                    marginLeft: `${marginleft}px`
                }}
            >
                <div className='flex flex-col' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.12}px` }}>
                    <div className="flex bg-red-400 justify-between p-3" style={{ width: `${modalWidth}px`, height: `${((modalHeight * 0.15) * 0.7).toFixed(2)}px` }}>
                        <h2 className="text-base font-medium mb-2">Timezone</h2>
                        <button className="bg-background-100 text-2xl font-semibold" onClick={closePreviewModal}>
                            <img src={process.env.PUBLIC_URL + "/closefile.png"} alt="close" className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className='flex flex-col bg-green-400 items-center ' style={{ width: `${modalWidth}px`, height: `${modalHeight * 0.85}px` }}>
                    <div className='flex flex-col border rounded-lg item-center px-2' 
                        style={{ width: `${(modalWidth * 0.9).toFixed(2)}px`, height: `${((modalHeight * 0.85) * 0.98).toFixed(2)}px` }}>
                        
                        {/* Checkbox to toggle additional text fields */}
                        <div className='flex justify-between items-center mt-2'>
                            <input 
                                type="checkbox" 
                                checked={showTextBoxes} // Check state
                                onChange={handleCheckboxChange} 
                                className="mr-2"
                            />
                            <label className="text-sm">Show Additional Fields</label>
                        </div>

                        {/* Render four text boxes (2 always visible and 2 additional based on checkbox) */}
                        <div className="flex flex-col px-2 py-1 text-sm font-normal rounded placeholder:text-sm">
                        <label
              htmlFor="masking-file-pattern"
              className="block text-gray-800 dark:text-gray-200 "
            >
              File Pattern
            </label>
                            {/* Initially visible text boxes */}
                            <input
                                type="text"
                                className="my-2 px-2 py-1 border rounded"
                                placeholder="Enter CSV file path"
                                value={csvFile}
                                onChange={handleCsvChange} // Handle change for CSV input
                                style={{ width: `${(modalWidth * 0.8).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
                            />

                            {/* Text Box for email input */}
                            <label
              htmlFor="masking-column"
              className="block text-gray-800 dark:text-gray-200 "
            >
              Column Name
            </label>
                            <input
                                type="text"
                                className="my-2 px-2 py-1 border rounded"
                                placeholder="Enter Email"
                                value={email}
                                onChange={handleEmailChange} // Handle change for email input
                                style={{ width: `${(modalWidth * 0.8).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
                            />
                          
                           {console.log("Container Data:", containerData)}
                           {console.log("Options:", Array.isArray(containerData[0]?.options) ? containerData[0].options : "No options available")}
                           {showTextBoxes && Array.isArray(containerData) && containerData.length > 0 && (
        <select
            className="my-2 px-2 py-1 border rounded"
            style={{ width: `${(modalWidth * 0.8).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
        >
            {/* <option value="" disabled selected>Select an Account</option> */}
            {containerData.map((account, index) => (
                <option key={index} value={account.account_key}> {/* Use account_key as the value */}
                    {account.account_name} {/* Display account_name as the label */}
                </option>
            ))}
        </select>
    )}

{showTextBoxes && Array.isArray(containerData) && containerData.length > 0 && (
        <select
            className="my-2 px-2 py-1 border rounded"
            style={{ width: `${(modalWidth * 0.8).toFixed(2)}px`, height: `${((modalHeight * 0.09) * 0.7).toFixed(2)}px` }}
        >
            {/* <option value="" disabled selected>Select an Account</option> */}
            {containerData.map((account, index) => (
                <option key={index} value={account.account_key}> {/* Use account_key as the value */}
                    {account.account_name} {/* Display account_name as the label */}
                </option>
            ))}
        </select>
    )}
                        </div>

                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMaskingConfig;

