import { useState } from "react";
const NewFieldPopup = ({
    newFieldName,
    newAccountKey,
    setNewFieldName,
    setNewAccountKey,
    handleAccountNameChange,
    handleAccountKeyChange,
    onCancel,
    handleStorageAccountSave,
     handleStorageAccountNameChange,
     namePlaceholder = "Account Name",
  keyPlaceholder = "Account Key",
  }) => {

    const [nameError, setNameError] = useState('');
  const [keyError, setKeyError] = useState('');

  const handleSaveClick = () => {
    let hasError = false;
  
    // Handle null or undefined values by providing empty strings as default
    const safeNewFieldName = newFieldName || '';
    const safeNewAccountKey = newAccountKey || '';
  
    if (safeNewFieldName.trim() === '') {
      setNameError('Please fill the field');
      hasError = true;
    } else {
      setNameError(''); // Clear the error message if valid
    }
  
    if (safeNewAccountKey.trim() === '') {
      setKeyError('Please fill the field');
      hasError = true;
    } else {
      setKeyError(''); // Clear the error message if valid
    }
  
    if (!hasError) {
      handleStorageAccountSave();
    }
  };
  

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[400px] h-[250px] flex flex-col space-y-4 ml-56">
          <p className="font-medium text-sm text-red-500"></p>
          <div className="flex flex-col w-full h-full space-y-6 items-center">
            <input
              type="text"
              // value={newFieldName}
              value={nameError ? '' : newFieldName} 
              onChange={(e) => {
                handleAccountNameChange(e)
                // setNewFieldName(e.target.value);
                setNameError(''); // Clear the error message when typing
              }}
              placeholder={nameError || namePlaceholder}  // Show error message as placeholder
              className={`px-2 w-80 h-9 py-1 pr-10 text-xs rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs 
                  ${nameError ? 'text-red-500 border-red-500 placeholder-red-500' : 'text-black border-gray-300'}`}
              required
              // onChange={handleAccountNameChange}
              // placeholder="Storage Account Name"
              // className="px-2 w-80 h-9 py-1 pr-10 text-base rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs"
              // required
            />
            <input
              type="text"
              // value={newAccountKey}
              value={keyError ? '' : newAccountKey} 
              onChange={(e) => {handleAccountKeyChange(e)
                setKeyError('');
              }}
              placeholder={keyError || keyPlaceholder}  // Show error message as placeholder
              className={`px-2 w-80 h-9 py-1 pr-10 text-xs rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs 
                  ${keyError ? 'text-red-500 border-red-500 placeholder-red-500' : 'text-black border-gray-300'}`}
              required
              // placeholder="Storage Account Key"
              // className="px-2 w-80 h-9 py-1 pr-10 text-base rounded-lg bg-white border shadow-md focus:bg-white focus:outline-none relative z-10 placeholder:text-xs"
              // required
            />
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
  
  export default NewFieldPopup;
  