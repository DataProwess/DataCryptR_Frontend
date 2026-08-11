import React from "react";
import { createPortal } from "react-dom";

const GcpMetaData = ({
  isOpen,
  metaGcpData,
  gcpSelectedFiles,
  setGcpSelectedFiles,
  gcpLoading,
  closePreviewModal,
  setGcpMetaDataModalOpen,
}) => {
  
  // If the modal state is closed, render absolutely nothing.
  if (!isOpen) return null;

  // Helper function to format raw property keys into clean display titles
  const formatLabel = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to convert raw bytes into a human-readable size string
  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Renders inside the Portal view hierarchy safely over the main layout
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      <div className="w-[38vw] h-[75vh] ml-[40vw] relative bg-white flex flex-col rounded-lg shadow-xl shadow-slate-500/30 p-4 transform -translate-x-1/2 transition-all ease-in-out z-10">
        <div className="w-[35vw] h-[70vh] flex flex-col items-center overflow-y-auto scrollbar-thin">
          
          {/* Header Actions Row */}
          <div className="w-[35vw] h-[5vh] flex flex-row items-center">
            <div className="flex-grow"></div>
            <div className="flex">
              <button 
                onClick={() => {
                  setGcpMetaDataModalOpen(false);
                  setGcpSelectedFiles([]);
                  document.body.style.overflow = "auto"; // Restore core window scrolling layout
                }} 
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                type="button"
              >
                <img
                  src={process.env.PUBLIC_URL + "/closefile.png"}
                  alt="close"
                  className="h-4 w-4"
                />
              </button>
            </div>
          </div>

          {/* Target Title Label */}
          <div className="w-[35vw] h-[5vh] text-xs font-semibold text-slate-500 truncate flex items-center border-b border-slate-50 mb-2">
            {gcpSelectedFiles && gcpSelectedFiles[0] 
              ? (typeof gcpSelectedFiles[0] === "object" ? gcpSelectedFiles[0].file_key : gcpSelectedFiles[0]).split(/[\\/]/).pop() 
              : "GCP Target Object Metadata"}
          </div>

          {/* Dynamic Core Container View */}
          <div className="w-[35vw] min-h-[55vh] flex flex-col space-y-3 items-center justify-start pt-2">
            {gcpLoading ? (
              /* Loader shows inside the modal while apiRequest resolves */
              <div className="w-full h-[40vh] flex flex-col justify-center items-center space-y-4">
                <div className="w-6 h-6 border-2 border-purpleshade1 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium text-[12px] animate-pulse">
                  Just a moment...
                </p>
              </div>
            ) : !metaGcpData ? (
              /* If fetching complete but object returned null/empty */
              <div className="w-full h-[40vh] flex items-center justify-center">
                <p className="text-slate-400 text-xs font-poppins">No metadata keys found for this schema definition.</p>
              </div>
            ) : (
              /* Loops structural elements properly once data cache populates */
              Object.entries(metaGcpData).map(([property, value], index) => {
                
                // 1. Format the label cleanly (e.g. storage_class -> Storage Class)
                const cleanLabel = formatLabel(property);

                // 2. Format specific data types dynamically for better readability
                let displayValue = "";
                if (property === "size") {
                  displayValue = formatBytes(value);
                } else if (property === "last_modified" && value) {
                  displayValue = new Date(value).toLocaleString();
                } else if (typeof value === "object" && value !== null) {
                  displayValue = Object.keys(value).length > 0 ? JSON.stringify(value) : "None";
                } else {
                  displayValue = String(value ?? "");
                }

                return (
                  <div key={index} className="flex items-center space-x-3 w-full justify-center">
                    <input
                      type="text"
                      readOnly
                      className="w-[15vw] h-8 px-3 text-left font-medium text-xs font-poppins text-slate-500 bg-slate-50 border border-slate-100/70 rounded-md truncate cursor-default select-none"
                      value={cleanLabel}
                      title={cleanLabel}
                    />
                    <div className="text-slate-300 font-bold">:</div>
                    <input
                      type="text"
                      readOnly
                      className="w-[15vw] h-8 px-3 text-left font-normal text-xs font-poppins text-slate-800 bg-slate-50/30 border border-slate-100/70 rounded-md truncate cursor-default"
                      value={displayValue}
                      title={displayValue}
                    />
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

export default GcpMetaData

// import React from "react";
// import { createPortal } from "react-dom";

// const GcpMetaData = ({
//   isOpen,
//   metaGcpData,
//   gcpSelectedFiles,
//   setGcpSelectedFiles,
//   gcpLoading,
//   closePreviewModal,
//   setGcpMetaDataModalOpen,
// }) => {
//   // If the modal state is closed, render absolutely nothing.
//   if (!isOpen) return null;

//   // Helper function to format raw property keys into clean display titles
//   const formatLabel = (key) => {
//     return key
//       .split("_")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   // Helper function to convert raw bytes into a human-readable size string
//   const formatBytes = (bytes) => {
//     if (bytes === 0 || !bytes) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   // Check if metaGcpData has actual key-value pairs to display
//   const hasMetaData =
//     metaGcpData &&
//     typeof metaGcpData === "object" &&
//     Object.keys(metaGcpData).length > 0;

//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center">
//       <div className="w-[38vw] h-[75vh] ml-[40vw] relative bg-white flex flex-col rounded-lg shadow-xl shadow-slate-500/30 p-4 transform -translate-x-1/2 transition-all ease-in-out z-10">
//         <div className="w-[35vw] h-[70vh] flex flex-col items-center overflow-y-auto scrollbar-thin">
          
//           {/* Header Actions Row */}
//           <div className="w-[35vw] h-[5vh] flex flex-row items-center">
//             <div className="flex-grow"></div>
//             <div className="flex">
//               <button
//                 onClick={() => {
//                   setGcpMetaDataModalOpen(false);
//                   setGcpSelectedFiles([]);
//                   document.body.style.overflow = "auto";
//                 }}
//                 className="p-1 hover:bg-slate-100 rounded transition-colors"
//                 type="button"
//               >
//                 <img
//                   src={process.env.PUBLIC_URL + "/closefile.png"}
//                   alt="close"
//                   className="h-4 w-4"
//                 />
//               </button>
//             </div>
//           </div>

//           {/* Target Title Label */}
//           <div className="w-[35vw] h-[5vh] text-xs font-semibold text-slate-500 truncate flex items-center border-b border-slate-50 mb-2">
//             {gcpSelectedFiles && gcpSelectedFiles[0]
//               ? (
//                   typeof gcpSelectedFiles[0] === "object"
//                     ? gcpSelectedFiles[0].file_key
//                     : gcpSelectedFiles[0]
//                 )
//                   .split(/[\\/]/)
//                   .pop()
//               : "GCP Target Object Metadata"}
//           </div>

//           {/* Dynamic Core Container View */}
//           <div className="w-[35vw] min-h-[55vh] flex flex-col space-y-3 items-center justify-start pt-2">
//             {/* 1. Show Loader whenever API fetching is active */}
//             {gcpLoading ? (
//               <div className="w-full h-[40vh] flex flex-col justify-center items-center space-y-4">
//                 <div className="w-6 h-6 border-2 border-purpleshade1 border-t-transparent rounded-full animate-spin"></div>
//                 <p className="text-slate-400 font-medium text-[12px] animate-pulse">
//                   Just a moment...
//                 </p>
//               </div>
//             ) : !hasMetaData ? (
//               /* 2. Show No Data / Error message ONLY when loading is finished AND data is missing or empty */
//               <div className="w-full h-[40vh] flex items-center justify-center">
//                 <p className="text-slate-400 text-xs font-poppins">
//                   No metadata keys found for this schema definition.
//                 </p>
//               </div>
//             ) : (
//               /* 3. Render Metadata Rows when data is successfully loaded */
//               Object.entries(metaGcpData).map(([property, value], index) => {
//                 const cleanLabel = formatLabel(property);

//                 let displayValue = "";
//                 if (property === "size") {
//                   displayValue = formatBytes(value);
//                 } else if (property === "last_modified" && value) {
//                   displayValue = new Date(value).toLocaleString();
//                 } else if (typeof value === "object" && value !== null) {
//                   displayValue =
//                     Object.keys(value).length > 0
//                       ? JSON.stringify(value)
//                       : "None";
//                 } else {
//                   displayValue = String(value ?? "");
//                 }

//                 return (
//                   <div
//                     key={index}
//                     className="flex items-center space-x-3 w-full justify-center"
//                   >
//                     <input
//                       type="text"
//                       readOnly
//                       className="w-[15vw] h-8 px-3 text-left font-medium text-xs font-poppins text-slate-500 bg-slate-50 border border-slate-100/70 rounded-md truncate cursor-default select-none"
//                       value={cleanLabel}
//                       title={cleanLabel}
//                     />
//                     <div className="text-slate-300 font-bold">:</div>
//                     <input
//                       type="text"
//                       readOnly
//                       className="w-[15vw] h-8 px-3 text-left font-normal text-xs font-poppins text-slate-800 bg-slate-50/30 border border-slate-100/70 rounded-md truncate cursor-default"
//                       value={displayValue}
//                       title={displayValue}
//                     />
//                   </div>
//                 );
//               })
//             )}
//           </div>

//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };

// export default GcpMetaData;