// import { useState } from "react";
// import React from "react";
// // import IsMaskedSwitch from "./IsMaskedSwitch";

// const NewFieldPopup = ({
//   onCancel,
//   onSave,
//   newFieldName = '',
//   setNewFieldName,
//   newFieldIsMasked,
//   setNewFieldIsMasked,
//   // IsMaskedSwitch,
//   handleDownloadSaveButtonClick,
//   isMasked,
//   onToggle
// }) => {

//   const IsMaskedSwitch = ({ isMasked, onToggle }) => {
//     const toggleIsMasked = () => {
//       onToggle(!isMasked);
//     };

//     return (
//       <div className="flex flex-row items-center space-x-2">
//         <img
//           src={
//             isMasked
//               ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
//               : process.env.PUBLIC_URL + "/noswitch-icon.png"
//           }
//           alt={isMasked ? "Yes" : "No"}
//           onClick={toggleIsMasked}
//           style={{ width: "30px", height: "20px", cursor: "pointer" }}
//         />
//       </div>
//     );
//   };
//   const [nameError, setNameError] = useState('');
//   const [keyError, setKeyError] = useState('');

//   const handleSaveClick = () => {
//     let hasError = false;

//     if (newFieldName.trim() === '') {
//       setNameError('Please fill the field');
//       hasError = true;
//     } else {
//       setNameError(''); // Clear the error if the field is not empty
//     }

//     if (!hasError) {
//       handleDownloadSaveButtonClick(); // Assuming this should be called on successful save
//     }
//   };
//   return (
//     <div className="fixed inset-0 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[400px] h-[200px] flex flex-col space-y-4">
//         <div className="flex flex-col space-y-5 w-full h-full mt-4  items-center">
//           {/* <input
//             className="px-2 w-80 h-9 py-1 pr-10 text-base rounded-lg
//              bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs"
//             type="text"
//             placeholder="Enter Field Name"
//             value={newFieldName}
//             onChange={(e) => setNewFieldName(e.target.value)}
//           /> */}
//            {/* <input
//               type="text"
//               value={newFieldName}
//               onChange={(e) => {
//                 setNewFieldName(e.target.value);
//                 setNameError(''); // Clear the error message when typing
//               }}
//               placeholder="Storage Account Name"
//               className="px-2 w-80 h-9 py-1 pr-10 text-base rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs"
//               required
//             /> */}
//             <input
//   type="text"
//   value={nameError ? '' : newFieldName}  // Clear the input if there's an error
//   onChange={(e) => {
//     setNewFieldName(e.target.value);
//     setNameError(''); // Clear the error message when typing
//   }}
//   placeholder={nameError || 'Storage Account Name'}  // Show error message as placeholder
//   className={`px-2 w-80 h-9 py-1 pr-10 text-xs rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs 
//       ${nameError ? 'text-red-500 border-red-500 placeholder-red-500' : 'text-black border-gray-300'}`}
//   required
// />

           
// <div className="flex items-center space-x-3 justify-between w-full mt-3">
//             <label className="ml-3 text-sm">Is Masked</label>
//             <div className="mr-3">
//               <IsMaskedSwitch
//                 isMasked={newFieldIsMasked}
//                 onToggle={(isChecked) => setNewFieldIsMasked(isChecked)}
//               />
//             </div>
//           </div>
//         </div>
       
//         <div className="flex space-x-8 justify-center mt-6">
//           <button
//             className="w-20 h-7 bg-white text-black text-xs font-medium border border-black rounded-lg"
//             onClick={onCancel}
//           >
//             Cancel
//           </button>
//           <button
//             className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
//             // onClick={handleDownloadSaveButtonClick}
//             onClick={handleSaveClick}
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewFieldPopup;

import { useState } from "react";
import React from "react";

const IsMaskedSwitch = React.memo(({ isMasked, onToggle }) => {
  const toggleIsMasked = () => {
    onToggle(!isMasked);
  };

  return (
    <div className="flex flex-row items-center space-x-2">
      <img
        src={
          isMasked
            ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
            : process.env.PUBLIC_URL + "/noswitch-icon.png"
        }
        alt={isMasked ? "Yes" : "No"}
        onClick={toggleIsMasked}
        style={{ width: "30px", height: "20px", cursor: "pointer" }}
      />
    </div>
  );
});

const NewGlobalField = ({
  onCancel,
  onSave,
  newFieldName = '',
  setNewFieldName,
  newFieldIsMasked,
  setNewFieldIsMasked,
  handleDownloadSaveButtonClick,
}) => {
  // Local IsMaskedSwitch component to toggle isMasked state
  

  const [nameError, setNameError] = useState('');

  const handleSaveClick = () => {
    let hasError = false;

    if (newFieldName.trim() === '') {
      setNameError('Please fill the field');
      hasError = true;
    } else {
      setNameError(''); // Clear the error if the field is not empty
    }

    if (!hasError) {
      handleDownloadSaveButtonClick(); // Assuming this should be called on successful save
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[400px] h-[200px] flex flex-col space-y-4">
        <div className="flex flex-col space-y-5 w-full h-full mt-4  items-center">
          <input
            type="text"
            value={nameError ? '' : newFieldName} // Clear the input if there's an error
            onChange={(e) => {
              setNewFieldName(e.target.value);
              setNameError(''); // Clear the error message when typing
            }}
            placeholder={nameError || 'Feild Name'} // Show error message as placeholder
            className={`px-2 w-80 h-9 py-1 pr-10 text-xs rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs 
              ${nameError ? 'text-red-500 border-red-500 placeholder-red-500' : 'text-black border-gray-300'}`}
            required
          />
          <div className="flex items-center py-1 space-x-3 justify-center w-full mt-3">
            <label className="ml-3 text-sm">Is Masked</label>
            <div className="">
            <IsMaskedSwitch
                isMasked={newFieldIsMasked}
                onToggle={(isChecked) => setNewFieldIsMasked(isChecked)}
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-8 justify-center mt-6">
          <button
            className="w-20 h-7 bg-white text-black text-xs font-medium border border-black rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
            onClick={handleSaveClick}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGlobalField;

