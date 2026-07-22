// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import FolderNoDataPopup from "../FolderNoDataPopup";

// const FilesPlainView = ({
//   // initialFiles = [],
//   // initialFolders = [],
//   isTableView,
//   handlePlainView,
//   handleTableView,
//   currentPath,
//   setCurrentPath,
//   handleFileClick,handleFolderClick,
//   displayedFolders,
//   displayedFiles,
//   isLoading
// }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     bucketId,
//     bucketName,
//     selectedOption,
//     selectedS3AccountName,
//     initialFiles,
//     initialFolders,
//   } = location.state || {};

//   console.log(initialFolders, initialFiles);
//   console.log("plsin",displayedFiles,displayedFolders)

//   const [foldersList, setFoldersList] = useState(initialFolders || []);
//   const [filesList, setFilesList] = useState(initialFiles || []);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [noPattern, setNoPattern] = useState(null);
//   const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);
//   const [filteredFilesFolders, setFilteredFilesFolders] = useState(
//     initialFiles || [],
//   );
//   const [filteredFolders, setFilteredFolders] = useState(initialFolders || []);
//   const [noDataMessage, setNoDataMessage] = useState("");

//   console.log(filteredFilesFolders, filteredFolders);

//   useEffect(() => {
//     setFoldersList(initialFolders);
//     setFilteredFolders(initialFolders);

//     setFilesList(initialFiles);
//     setFilteredFilesFolders(initialFiles);
//   }, [initialFiles, initialFolders]);

//   //  const handleFolderClick = (folderObj) => {
//   //   setCurrentPath((prev) => [...prev, folderObj.name]);
//   // };

//   // const handleFileClick = (file) => {
//   //   setSelectedFiles([file]); // Ensure it sets an array with the selected file
//   // };

//   if (noPattern) {
//     return (
//       <FolderNoDataPopup
//         isOpen={isNoDataPopupOpen}
//         message={noPattern} // "No matching folders or files found."
//         // onClose={handleSearchOkClick}
//       />
//     );
//   }

//   // Check if filteredFilesFolders and filteredFolders are empty arrays safely
//   if (!Array.isArray(filteredFilesFolders) || !Array.isArray(filteredFolders)) {
//     return (
//       <div className="w-full h-full flex items-center justify-center p-6">
//         <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4 w-72 h-32 border border-slate-100">
//           <p className="font-medium text-xs text-[#5c5cff] text-center">
//             No Folders and Files Exist
//           </p>
//           <button
//             className="px-4 py-1 text-black text-xs bg-slate-100 hover:bg-slate-200 transition-colors font-medium rounded-lg"
//             onClick={() => setNoDataMessage(false)}
//             type="button"
//           >
//             OK
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="w-full h-full select-none flex flex-col "
//       style={{
//         WebkitUserSelect: "none",
//         MozUserSelect: "none",
//         msUserSelect: "none",
//       }}
//     >
      
     
//       <div
//         className="w-full h-full grid items-start gap-4 overflow-y-auto p-5"
//         style={{
//           gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
//           scrollbarWidth: "thin",
//           alignContent: "start",
//         }}
//       >
//         {/* 📁 FOLDER DISPLAY ENGINE */}
//         {filteredFolders.map((folder, index) => {
//           // ✅ FIX: Safely parse string item values directly if it's a raw array string
//           let folderName =
//             typeof folder === "string"
//               ? folder
//               : folder?.name || folder?.folder_name;
//           if (!folderName) folderName = `Folder-${index}`;

//           // Drop trailing folder slashes if returned by S3 structure
//           if (folderName.endsWith("/")) folderName = folderName.slice(0, -1);
//           const folderId = folder?.id || `folder-${index}`;

//           return (
//             <div
//               key={folderId}
//               className="flex flex-col items-center justify-start cursor-pointer w-full group"
//               onClick={() => handleFolderClick(folder)}
//             >
//               <div className="flex flex-col items-center space-y-1 w-full text-center">
//                 <div className="w-14 h-14 flex items-center justify-center p-1 rounded-md transition-all group-hover:bg-slate-100/80">
//                   <img
//                     src={process.env.PUBLIC_URL + "/baseline-folder.png"}
//                     alt="Folder"
//                     className="w-12 h-12 object-contain"
//                     title={folderName}
//                   />
//                 </div>
//                 <span
//                   className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5"
//                   title={folderName}
//                 >
//                   {folderName}
//                 </span>
//               </div>
//             </div>
//           );
//         })}

//         {/* 📄 FILE DISPLAY ENGINE */}
//         {filteredFilesFolders.map((file, index) => {
//           // ✅ FIX: Handle file name whether it is a string directly or an object property
//           const rawFileName =
//             typeof file === "string"
//               ? file
//               : file?.file_name || file?.name || `File-${index}`;
//           const cleanFileName = rawFileName.split("/").pop() || rawFileName;
//           const fileId = file?.file_id || file?.id || `file-${index}`;
//           const isSelected = selectedFiles.includes(rawFileName);

//           return (
//             <div
//               key={fileId}
//               className={`flex flex-col items-center justify-start cursor-pointer w-full group p-1 transition-all rounded-md ${
//                 isSelected
//                   ? "bg-primary/20 ring-1 ring-primary/40 shadow-sm"
//                   : "hover:bg-slate-100/80"
//               }`}
//               onClick={() => handleFileClick(rawFileName)}
//             >
//               <div className="flex flex-col items-center space-y-1 w-full text-center relative">
//                 <div className="w-14 h-14 flex items-center justify-center">
//                   <img
//                     src={process.env.PUBLIC_URL + "/file-icon.png"}
//                     alt="File"
//                     className="w-10 h-12 object-contain"
//                     title={cleanFileName}
//                   />
//                 </div>
//                 <span
//                   className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5 cursor-pointer"
//                   title={cleanFileName}
//                 >
//                   {cleanFileName}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       </div>
    
//   );
// };

// export default FilesPlainView;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FolderNoDataPopup from "../FolderNoDataPopup";

const FilesPlainView = ({
  isTableView,
  handlePlainView,
  handleTableView,
  currentPath,
  setCurrentPath,
  handleFolderClick,
  handleFileRowClick, // 🎯 FIXED NAME MATCH (Changed from handleFileClick)
  displayedFolders = [], // 🎯 Use live props instead of stale state
  displayedFiles = [],   // 🎯 Use live props instead of stale state
  isLoading
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [noPattern, setNoPattern] = useState(null);
  const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);

  if (noPattern) {
    return (
      <FolderNoDataPopup
        isOpen={isNoDataPopupOpen}
        message={noPattern}
      />
    );
  }

  // Check if your live display vectors are arrays cleanly
  if (!Array.isArray(displayedFiles) || !Array.isArray(displayedFolders)) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4 w-72 h-32 border border-slate-100">
          <p className="font-medium text-xs text-[#5c5cff] text-center">
            No Folders and Files Exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full select-none flex flex-col"
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <div
        className="w-full max-h-72  grid items-start gap-4 overflow-y-auto p-5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          scrollbarWidth: "thin",
          alignContent: "start",
        }}
      >
        {/* 📁 LIVE FOLDER DISPLAY ENGINE */}
        {displayedFolders.map((folder, index) => {
          let folderName = typeof folder === "string" ? folder : folder?.name || folder?.folder_name;
          if (!folderName) folderName = `Folder-${index}`;

          // Drop trailing folder slashes if returned by S3 structure
          if (folderName.endsWith("/")) folderName = folderName.slice(0, -1);
          const folderId = folder?.id || `folder-${index}`;

          return (
            <div
              key={folderId}
              className="flex flex-col items-center justify-start cursor-pointer w-full group"
              onClick={() => handleFolderClick(folder)} // 🎯 Trigger parent path updates
            >
              <div className="flex flex-col items-center space-y-1 w-full text-center">
                <div className="w-14 h-14 flex items-center justify-center p-1 rounded-md transition-all group-hover:bg-slate-100/80">
                  <img
                    src={process.env.PUBLIC_URL + "/baseline-folder.png"}
                    alt="Folder"
                    className="w-12 h-12 object-contain"
                    title={folderName}
                  />
                </div>
                <span
                  className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5"
                  title={folderName}
                >
                  {folderName}
                </span>
              </div>
            </div>
          );
        })}

        {/* 📄 LIVE FILE DISPLAY ENGINE */}
        {displayedFiles.map((file, index) => {
          const rawFileName = typeof file === "string" ? file : file?.file_name || file?.name || `File-${index}`;
          const cleanFileName = rawFileName.split("/").pop() || rawFileName;
          const fileId = file?.file_id || file?.id || `file-${index}`;
          
          // Use parent calculated boolean validation property directly
          const isSelected = file?.isSelected || false; 

          return (
            <div
              key={fileId}
              className={`flex flex-col items-center justify-start cursor-pointer w-full group p-1 transition-all rounded-md ${
                isSelected
                  ? "bg-primary/20 ring-1 ring-primary/40 shadow-sm"
                  : "hover:bg-slate-100/80"
              }`}
              onClick={() => handleFileRowClick(file)} // 🎯 Match parent selection state functions
            >
              <div className="flex flex-col items-center space-y-1 w-full text-center relative">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={process.env.PUBLIC_URL + "/file-icon.png"}
                    alt="File"
                    className="w-10 h-12 object-contain"
                    title={cleanFileName}
                  />
                </div>
                <span
                  className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5 cursor-pointer"
                  title={cleanFileName}
                >
                  {cleanFileName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilesPlainView;
