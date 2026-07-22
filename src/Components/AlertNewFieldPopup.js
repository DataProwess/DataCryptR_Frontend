import { useState } from "react";
import authService from "./auth"
const AlertNewFieldPopup = ({
    newFilePattern,
    newAlertEmail,
    email,
    setEmail,
    setNewFieldName,
    setNewAccountKey,
    isChecked,
    setIsChecked,
    handleFilePatternChange,
    handleEmailChange,
    onCancel,
    handleAlertAccessDataSave,
     handleStorageAccountNameChange
  }) => {

    const [nameError, setNameError] = useState('');
  const [keyError, setKeyError] = useState('');
  


//   const handleSaveClick = () => {
//     let hasError = false;
  
//     // Handle null or undefined values by providing empty strings as default
//     const safeNewFilePattern = newFilePattern || '';
//     const safeNewAlertEmail = newAlertEmail || '';
  
//     if (safeNewFilePattern.trim() === '') {
//       setNameError('Please fill the field');
//       hasError = true;
//     } else {
//       setNameError(''); // Clear the error message if valid
//     }
  
//     if (safeNewAlertEmail.trim() === '') {
//       setKeyError('Please fill the field');
//       hasError = true;
//     } else {
//       setKeyError(''); // Clear the error message if valid
//     }
  
//     if (!hasError) {
//         handleAlertAccessDataSave();
//     }
//   };

const handleSaveClick = () => {
    console.log("handleSaveClick called");

    let hasError = false;
  
    const safeNewFilePattern = newFilePattern || '';
    const safeNewAlertEmail = email || '';
  
    if (safeNewFilePattern.trim() === '') {
        console.log("File Pattern is empty");
        setNameError('Please fill the field');
        hasError = true;
    } else {
        setNameError('');
    }
  
    if (safeNewAlertEmail.trim() === '') {
        console.log("Alert Email is empty");
        setKeyError('Please fill the field');
        hasError = true;
    } else {
        setKeyError('');
    }
  
    if (!hasError) {
        console.log("Calling handleAlertAccessDataSave...");
        handleAlertAccessDataSave();
    }
};


  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      setEmail(authService.getEmail());
    } else {
      setEmail("");
    }
  };
  

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[400px] h-[250px] flex flex-col space-y-2 ml-56">
          <p className="font-medium text-sm text-red-500"></p>
          <div className="flex flex-col w-full h-full space-y-6 items-center">
            <input
              type="text"
              // value={newFieldName}
              value={nameError ? '' : newFilePattern} 
              onChange={(e) => {
                handleFilePatternChange(e)
                // setNewFieldName(e.target.value);
                setNameError(''); // Clear the error message when typing
              }}
              placeholder={nameError || 'File Pattern'}  // Show error message as placeholder
              className={`px-2 w-80 h-8 py-1 pr-10 text-[11px] rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-[11px] 
                  ${nameError ? 'text-red-500 border-red-500 placeholder-red-500' : 'text-black border-gray-300'}`}
              required
              // onChange={handleAccountNameChange}
              // placeholder="Storage Account Name"
              // className="px-2 w-80 h-9 py-1 pr-10 text-base rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs"
              // required
            />
            <input
              type="email"
              value={email}
            //   value={keyError ? '' : newAlertEmail} 
              onChange={(e) => {handleEmailChange(e)
                setKeyError('');
              }}
              placeholder={keyError || 'Alert Email'}  // Show error message as placeholder
              className={`px-2 w-80 h-8 py-1 pr-10 text-[11px] rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-[11px] 
                  ${keyError ? 'text-red-500 border-red-500 placeholder-red-500' : 'text-black border-gray-300'}`}
              required
               pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address"
              // placeholder="Storage Account Key"
              // className="px-2 w-80 h-9 py-1 pr-10 text-base rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs"
              // required
            />
            <div className="flex space-x-2 justify-center mt-8 accent-purpleshade1">
            <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
            <span className="text-xs font-poppins">{authService.getEmail()}</span>
          </div>
            <div className="flex space-x-8 justify-center mt-8">
              <button
                className="w-20 h-7 bg-white text-black text-xs font-medium border border-black rounded-lg"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
                // onClick={handleStorageAccountSave}
                onClick={handleSaveClick}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AlertNewFieldPopup;
  