import {useState,useEffect} from 'react'
import FolderNoDataPopup from '../FolderNoDataPopup';

const FolderTabularView = ({
  initialFiles = [],
  initialFolders = [],

}) => {

     const [foldersList, setFoldersList] = useState(initialFolders || []);
      const [filesList, setFilesList] = useState(initialFiles || []);
      const [selectedFiles, setSelectedFiles] = useState([]);
      const [noPattern, setNoPattern] = useState(null);
      const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);
      const [filteredFilesFolders, setFilteredFilesFolders] = useState(
        initialFiles || [],
      );
      const [filteredFolders, setFilteredFolders] = useState(initialFolders || []);
      const [noDataMessage, setNoDataMessage] = useState("");
    
      console.log(filteredFilesFolders, filteredFolders);

       useEffect(() => {
          setFoldersList(initialFolders);
          setFilteredFolders(initialFolders);
      
          setFilesList(initialFiles);
          setFilteredFilesFolders(initialFiles);
        }, [initialFiles, initialFolders]);
      
       
      
        const handleFileClick = (file) => {
          setSelectedFiles([file]); // Ensure it sets an array with the selected file
        };

        const handleSearchOkClick = () => {}

        const handleFolderClick = () =>{}


         const handleSortAscending = (sortKey) => {
    // Helper function to handle sorting based on the type of the field
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal; // Numeric comparison for size
      } else if (
        new Date(aVal) instanceof Date &&
        !isNaN(new Date(aVal)) &&
        new Date(bVal) instanceof Date &&
        !isNaN(new Date(bVal))
      ) {
        return new Date(aVal) - new Date(bVal); // Date comparison for creation/modified date
      }
      return 0; // Default return for non-comparable values
    };

    // Sort folders
    const sortedFolders = [...filteredFolders].sort(sortFunction);

    // Sort files
    const sortedFiles = [...filteredFilesFolders].sort(sortFunction);

    setFilteredFolders(sortedFolders);
    setFilteredFilesFolders(sortedFiles);
  };

  const handleSortDescending = (sortKey) => {
    // Helper function to handle sorting based on the type of the field
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return bVal.localeCompare(aVal); // Reverse alphabetical order
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return bVal - aVal; // Reverse numeric comparison
      } else if (
        new Date(aVal) instanceof Date &&
        !isNaN(new Date(aVal)) &&
        new Date(bVal) instanceof Date &&
        !isNaN(new Date(bVal))
      ) {
        return new Date(bVal) - new Date(aVal); // Reverse date comparison
      }
      return 0; // Default return for non-comparable values
    };

    // Sort folders
    const sortedFolders = [...filteredFolders].sort(sortFunction);

    // Sort files
    const sortedFiles = [...filteredFilesFolders].sort(sortFunction);

    setFilteredFolders(sortedFolders);
    setFilteredFilesFolders(sortedFiles);
  };

if (noPattern) {
      return (
        <FolderNoDataPopup
          isOpen={isNoDataPopupOpen}
          message={noPattern} // "No matching folders or files found."
          onClose={handleSearchOkClick}
        />
      );
    }

    // if (!Array.isArray(folders) || !Array.isArray(filteredFilesFolders)) return null; // Defensive check
    if (!Array.isArray(filteredFilesFolders) || !Array.isArray(filteredFolders))
      //  return null;
      return (
        <div className="w-full h-full flex items-center justify-center p-10">
          {/* <p className="text-center text-primary">No Folders and Files Exist</p> */}{" "}
          <div className="bg-white p-6 rounded-lg shadow-lg items-center w-80 h-32 flex flex-col space-y-8">
            <p className="font-normal text-xs text-black">
              No Folders and Files Exist
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                className="w-16 h-6 text-black text-xs bg-gray font-normal border border-none rounded-lg"
                // onClick={() => setNoDataMessage(false)}
                onClick={() => {
                  setNoDataMessage(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );

    const handleFileRowClick = (file) => {
      if (file.file_id) {
        handleFileClick(file.file_name);
      } else {
        handleFolderClick(file);
      }
    };

    

    

  return (
  /* 🛠️ TABLE MAIN FRAME CONTAINER (Forces a rigid maximum screen constraint) */
  <div 
    className="w-full flex-1 flex flex-col min-h-0 h-full overflow-hidden rounded-b-lg   shadow-lg shadow-slate-500/50"
    style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msSelect: "none",
    }}
  >
    {/* 🛠️ SCROLL PANELS WRAPPER: Changed height rules from h-[90%] to a managed flex configuration */}
   <div className="w-full flex-shrink-0 block mt-1">
      <table className="w-full table-fixed min-w-[400px] border-collapse text-left">
        <colgroup>
          <col className="w-[3%]" />
          <col className="w-[25%]" />
          <col className="w-[15%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[15%]" />
        </colgroup>
        
        {/* 📌 FIXED HEADER TRACK */}
        <thead className="bg-purpleshade1 text-white sticky top-0 z-10 text-[12px]">
          <tr>
            <th className="py-2 px-3 bg-purpleshade1 rounded-tl-lg sticky top-0"></th>
            <th className="py-2 px-3 bg-purpleshade1 font-normal text-xs sticky top-0">
              Name
              <span onClick={() => handleSortAscending("name")} className="ml-1 cursor-pointer select-none text-slate-300 hover:text-white">&uarr;</span>
              <span onClick={() => handleSortDescending("name")} className="cursor-pointer select-none text-slate-300 hover:text-white">&darr;</span>
            </th>
            <th className="py-2 px-3 bg-purpleshade1 font-normal text-xs sticky top-0">
              Size (bytes)
              <span onClick={() => handleSortAscending("size")} className="ml-1 cursor-pointer select-none text-slate-300 hover:text-white">&uarr;</span>
              <span onClick={() => handleSortDescending("size")} className="cursor-pointer select-none text-slate-300 hover:text-white">&darr;</span>
            </th>
            <th className="py-2 px-3 bg-purpleshade1 font-normal text-xs sticky top-0">
              Created Date
              <span onClick={() => handleSortAscending("creation_time")} className="ml-1 cursor-pointer select-none text-slate-300 hover:text-white">&uarr;</span>
              <span onClick={() => handleSortDescending("creation_time")} className="cursor-pointer select-none text-slate-300 hover:text-white">&darr;</span>
            </th>
            <th className="py-2 px-3 bg-purpleshade1 font-normal text-xs sticky top-0">
              Modified Date
              <span onClick={() => handleSortAscending("modified_time")} className="ml-1 cursor-pointer select-none text-slate-300 hover:text-white">&uarr;</span>
              <span onClick={() => handleSortDescending("modified_time")} className="cursor-pointer select-none text-slate-300 hover:text-white">&darr;</span>
            </th>
            <th className="py-2 px-3 bg-purpleshade1 font-normal text-xs rounded-tr-lg sticky top-0">
              File Path
            </th>
          </tr>
        </thead>
        </table>
        </div>

        {/* 📂 ROWS BUFFER SECTION */}
       <div
      className="w-full flex-1 overflow-y-visible mt-1 flex-shrink-0 block"
      style={{ scrollbarWidth: "thin" }}
    >
      {/* 🛠️ FIXED: Removed h-full from this table node so row heights don't stretch artificially */}
      <table className="table-design table-fixed w-full min-w-[800px] border-collapse text-left">
              <tbody>
                {filteredFolders.map((folder) => (
                    
                  <tr key={folder.id}>
                    {console.log(folder)}
                    <td className="w-[3%] text-xs font-normal overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      onClick={() => handleFileRowClick(folder)}
                    >
                      <span className="text-[11px] font-light text-black cursor-pointer text-center flex items-center">
                        <div className="flex items-center mr-2">
                          <img
                            src={
                              process.env.PUBLIC_URL + "/baseline-folder.png"
                            }
                            alt="Folder"
                            className="w-3 h-3"
                          />
                        </div>
                        <span className="truncate">{folder}</span>
                      </span>

                      {/* {folder.name} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                  </tr>
                ))}
                {filteredFilesFolders.map((file) => (
                  <tr
                    key={file.file_id}
                    className={` ${
                      selectedFiles.includes(file.file_name)
                        ? "bg-primary rounded-md "
                        : ""
                    }`}
                    onClick={() => handleFileRowClick(file)}

                  >
                    <td className="w-[3%]"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      // onClick={() => handleFileRowClick(file)}
                    >
                      <span className="text-[11px] font-normal text-black cursor-pointer text-center flex flex-row items-center">
                        <div className="flex items-center relative mr-2 mt-1 flex-shrink-0">
                          <img
                            src={process.env.PUBLIC_URL + "/file-icon.png"}
                            alt="File"
                            className="w-3 h-3 "
                          />
                          {/* {selectedFiles.includes(file.file_name) && (
                            <img
                              src={process.env.PUBLIC_URL + "/tick-icon.png"}
                              alt="Selected"
                              className="absolute w-4 h-4 -top-2 -right-1"
                            />
                          )} */}
                        </div>
                        <span className="truncate">
                          {file.file_name ? file.file_name.split("/").pop() : file.name}
                        </span>
                      </span>
                      {/* {file.file_name ? file.file_name.split("/").pop() : ""} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light  pl-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.size}
                    </td>
                    <td className="w-[20%] text-[11px] font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.creation_time}
                    </td>
                    <td className="w-[20%] text-[11px]  font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.modified_time}
                    </td>
                    {/* <td className="w-[15%] bg-green-500 text-[11px] flex item-center font-light overflow-ellipsis whitespace-nowrap overflow-hidden"> */}
                     <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.file_path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
  </div>
);

    
   
}

export default FolderTabularView