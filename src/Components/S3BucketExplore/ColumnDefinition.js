// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";

// const ColumnDefinition = ({
//   isOpen,
//   setIsColumnDataModalOpen,
//   isColumnDataModalOpen,
//   closeModal,
//   columnData,
//   renderColumnData,
//   showPreview,
//   setColumnData,
//   setSelectedFiles,
//   selectedFiles,
//   permissions,
// //   loading,
//   isNewFieldVisible,
//   setisNewFieldVisible,
//   handleSave,
//   closePreviewModal,
//   saveButtonClicked,
//   newFieldRef,
//   isColumnDataFetched,
// }) => {
//   console.log("columnData",columnData);

//   const [newFieldName, setNewFieldName] = useState("");
//   const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
//   const [loading,] = useState(false)

//   const handleToggleSwitch = (value, fieldId) => {
//     const updatedColumnData = columnData.map((column) =>
//       column.field_id === fieldId ? { ...column, is_masked: value } : column,
//     );
//     setColumnData(updatedColumnData);
//   };

//   const handleNewSwitchChange = (value) => {
//     setNewFieldIsMasked(value);
//   };

//   const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
//     const toggleIsMasked = () => {
//       if (!disabled) {
//         onToggle(!isMasked);
//       }
//       // const toggleIsMasked = () => {
//       //   onToggle(!isMasked);
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
//           style={{ width: "30px", height: "15px", cursor: "pointer" }}
//         />
//       </div>
//     );
//   };

// //   if (!columnData || !Array.isArray(columnData) || columnData.length === 0) {
// //     return <p className="font-poppins">No data available</p>;
// //   }

//   // 👉 Move internal functions here
//   const handleAddNewField = () => {
//     if (!newFieldName.trim()) return;

//     const existingBlobPrefix =
//       columnData.length > 0 ? columnData[0].blob_prefix : "";

//     const newField = {
//       field_id: "",
//       blob_prefix: existingBlobPrefix,
//       field_name: newFieldName,
//       is_masked: newFieldIsMasked,
//       showDeleteButton: true,
//     };

//     setColumnData((prev) => [...prev, newField]);

//     setNewFieldName("");
//     setNewFieldIsMasked(false);
//     setisNewFieldVisible(true);

//     newFieldRef.current = document.getElementById("newRow");
//     newFieldRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "end",
//     });
//   };

//   const handleDeleteField = (fieldId, fieldName) => {
//     setColumnData((prev) =>
//       prev.filter(
//         (column) =>
//           column.field_id !== fieldId ||
//           (column.field_id === "" && column.field_name !== fieldName),
//       ),
//     );
//   };

//   return createPortal(
//     <div
//       className={`fixed inset-0 z-[9999] flex items-center justify-center ${
//         isColumnDataModalOpen ? "block" : "hidden"
//       }`}
//     >
//       <div className="w-[40vw] h-[90vh] ml-[40vw]   relative bg-white flex flex-col justify-center items-center  rounded-lg shadow shadow-slate-500/30  transform -translate-x-1/2 transition-right-0.3s ease-in-out">
//         {/* <div className="w-full flex justify-end fixed">
//             <button
//               className=" text-2xl font-semibold mt-3 mr-2 "
//               onClick={closeModal}
//             >
//                <img
//                     src={process.env.PUBLIC_URL + "/closefile.png"}
//                     alt="close"
//                     className="h-4 w-4"
//                   />
//             </button>
//             {/* Add other navbar elements or links here */}
//         {/* </div>  */}
//         <div className="w-[35vw] h-[85vh]  flex flex-col  justify-center items-center px-4 ">
//           {showPreview && (
//             <div className="w-full h-full flex justify-center items-center ">
//               <div className="w-[35vw] h-[80vh] flex flex-col items-center ">
//                 {/* HEADER */}
//                 <div className="w-[30vw] h-[6vh] flex flex-row items-center ">
//                   {permissions.includes("SeeUserReports") && (
//                     <div>
//                       <button
//                         className="w-32 h-7 rounded cursor-pointer font-medium font-poppins text-xs  bg-purpleshade1 text-white shadow"
//                         onClick={() => {
//                           setisNewFieldVisible(true);
//                           handleAddNewField();
//                         }}
//                       >
//                         Add New Field
//                       </button>
//                     </div>
//                   )}

//                   <div className="flex-grow"></div>
//                   <div className="flex ">
//                     <button
//                       onClick={() => {
//                         setIsColumnDataModalOpen(false);
//                         setSelectedFiles([]);
//                       }}
//                     >
//                       <img
//                         src={process.env.PUBLIC_URL + "/closefile.png"}
//                         alt="close"
//                         className="h-4 w-4"
//                       />
//                     </button>
//                   </div>
//                 </div>

//                 {/* FILE NAME */}
//                 <div className="w-[30vw] h-[5vh] mt-1 flex flex-row items-center justify-between text-xs font-medium ">
//                   {selectedFiles[0]?.split(/[\\/]/).pop()}
//                 </div>

//                 {/* TABLE */}
//                 <div className="w-[30vw] h-[60vh] bg-white rounded-lg mt-2 ">
//                   <table className="table-design table-fixed w-full">
//                     <colgroup>
//                       <col className="w-[60%]" />
//                       <col className="w-[40%]" />
//                     </colgroup>
//                     <thead className="bg-purpleshade1 text-white sticky top-0 rounded-tr-lg rounded-tl-lg  ">
//                       <tr>
//                         <th className="py-2 sticky top-0 px-7 rounded-tl-lg text-sm font-medium  ">
//                           Field Name
//                         </th>
//                         <th className="py-2 sticky top-0 px-7 rounded-tr-lg text-sm font-medium ">
//                           Is Masked
//                         </th>
//                       </tr>
//                     </thead>
//                   </table>
//                   <div
//                     className="w-full h-[55vh] pr-3 py-3   border border-lightgray-200  font-poppins  scrollbar-thin overflow-y-auto rounded-b-lg !important"
//                     style={{ scrollbarWidth: "thin" }}
//                   >
//                     <table className="table-design table-fixed w-full">
//                       <tbody className="border-none">
//                         {/* NEW FIELD */}
//                         {isNewFieldVisible && (
//                           <tr id="newRow">
//                             <td className="w-[60%] text-[11px] font-poppins font-[350] px-7  overflow-hidden">
//                               <input
//                                 className="h-6 border border-black w-36 placeholder:text-black "
//                                 value={newFieldName}
//                                 onChange={(e) =>
//                                   setNewFieldName(e.target.value)
//                                 }
//                               />
//                             </td>
//                             <td className="w-[40%] text-[13px] font-poppins font-[350] px-6">
//                               <div className=" w-20 flex flex-row justify-between mt-1 mr-3  items-center ">
//                                 <div className="">
//                                   <IsMaskedSwitch
//                                     isMasked={newFieldIsMasked}
//                                     onToggle={handleNewSwitchChange}
//                                     disabled={
//                                       !permissions.includes("SeeUserReports")
//                                     }
//                                   />
//                                 </div>
//                                 <div>
//                                   {!saveButtonClicked && (
//                                     <button
//                                       className=" text-xl font-semibold mr-3 "
//                                       onClick={() => {
//                                         handleDeleteField("", newFieldName);
//                                         setisNewFieldVisible(false);
//                                       }}
//                                     >
//                                       &times;
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         )}

//                         {/* LOADING */}{console.log("1",columnData)}
//                         {loading ? (
//                           <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-10">
//                             <img
//                               src={process.env.PUBLIC_URL + "/loadergif.gif"}
//                               alt="logo"
//                               className="animate-spin w-4 h-4"
//                             />
//                             <p className="text-logintext font-[350] text-[13px] animate-pulse">
//                               Just a moment...
//                             </p>
//                           </div>
//                         ) : (
//                           columnData.map((column, index) => {
//                             let cleanFieldName = column.field_name;
//                             try {
//                               // If it looks like a JSON string chunk, strip out backslashes and surrounding quotes
//                               if (
//                                 cleanFieldName.startsWith('"') ||
//                                 cleanFieldName.includes('\\"')
//                               ) {
//                                 cleanFieldName = JSON.parse(cleanFieldName);
//                               }
//                             } catch (e) {
//                               // Fallback to original string if parsing fails
//                               cleanFieldName = column.field_name
//                                 .replace(/\\"/g, '"')
//                                 .replace(/^"| Font$/, "");
//                             }

//                             return (
//                               <tr
//                                 key={column.field_id || index}
//                                 className="border-none mt-1"
//                               >
//                                 {/* FIELD NAME */}
//                                 <td
//                                   className="w-[60%] text-[11px] font-[350] font-poppins text-black px-7 overflow-ellipsis whitespace-nowrap overflow-hidden"
//                                   title={cleanFieldName} // Shows full name on hover if truncated
//                                 >
//                                   {cleanFieldName}
//                                 </td>

//                                 {/* IS MASKED */}
//                                 <td className="w-[40%] text-[11px] font-[350] font-poppins px-6 whitespace-nowrap overflow-hidden">
//                                   <div className="flex flex-row items-center space-x-2">
//                                     <IsMaskedSwitch
//                                       isMasked={column.is_masked}
//                                       onToggle={(value) =>
//                                         handleToggleSwitch(
//                                           value,
//                                           column.field_id,
//                                         )
//                                       }
//                                       disabled={
//                                         !permissions.includes("SeeUserReports")
//                                       }
//                                     />
//                                     {column.showDeleteButton && (
//                                       <button
//                                         className="text-xl font-medium font-poppins ml-2 text-red-500 hover:text-red-700"
//                                         onClick={() =>
//                                           handleDeleteField(
//                                             column.field_id,
//                                             column.field_name,
//                                           )
//                                         }
//                                       >
//                                         &times;
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 <div className="w-[30vw] h-[6vh] flex flex-row space-x-4 justify-end mt-4">
//                   {permissions.includes("SeeUserReports") && (
//                     <div>
//                       <button
//                         className="w-16 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow"
//                         onClick={handleSave}
//                       >
//                         Save
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//           {/* {!showPreview && <p>No ColumnData available</p>} */}
//           {isColumnDataFetched && columnData.length === 0 && (
//             <p>No data available</p>
//           )}
//         </div>
//       </div>
//     </div>,

//     document.body,
//   );
// };

// export default ColumnDefinition;
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ColumnDefinition = ({
  isOpen,
  setIsColumnDataModalOpen,
  isColumnDataModalOpen,
  closeModal,
  columnData,
  renderColumnData,
  showPreview,
  setColumnData,
  setSelectedFiles,
  selectedFiles,
  permissions,
  loading: parentLoading, // Rename this to avoid conflicts
  isNewFieldVisible,
  setisNewFieldVisible,
  handleSave,
  closePreviewModal,
  saveButtonClicked,
  newFieldRef,
  isColumnDataFetched,
  newFieldName,
  setNewFieldName,
  newFieldIsMasked,
  setNewFieldIsMasked
}) => {
  

  // 🛠️ LOCAL STATE FIX: Manage loading state locally inside the modal
  const [localLoading, setLocalLoading] = useState(true);

  // Safely parse column data array structures
  const validColumnData = Array.isArray(columnData)
    ? columnData
    : columnData?.data || columnData?.columns || [];

  // 🛠️ WATCH DATA PIPELINE: As soon as data arrives, instantly turn off the loader locally
  useEffect(() => {
    if (isColumnDataModalOpen) {
      if (validColumnData && validColumnData.length > 0) {
        console.log("Local Loader: Data detected! Dropping loading mask.");
        setLocalLoading(false);
      } else if (!parentLoading && isColumnDataFetched) {
        // If API finished and array is genuinely empty
        setLocalLoading(false);
      } else {
        setLocalLoading(true);
      }
    }
  }, [
    columnData,
    isColumnDataModalOpen,
    parentLoading,
    isColumnDataFetched,
    validColumnData,
  ]);

  const handleToggleSwitch = (value, fieldId) => {
    const updatedColumnData = validColumnData.map((column) =>
      column.field_id === fieldId ? { ...column, is_masked: value } : column,
    );
    setColumnData(updatedColumnData);
  };

  const handleNewSwitchChange = (value) => {
    setNewFieldIsMasked(value);
  };

  const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
    const toggleIsMasked = () => {
      if (!disabled) {
        onToggle(!isMasked);
      }
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
          style={{ width: "30px", height: "15px", cursor: "pointer" }}
        />
      </div>
    );
  };

  const handleAddNewField = () => {
    if (!newFieldName.trim()) return;

    const existingBlobPrefix =
      validColumnData.length > 0 ? validColumnData[0].blob_prefix : "";

    const newField = {
      field_id: "",
      blob_prefix: existingBlobPrefix,
      field_name: newFieldName,
      is_masked: newFieldIsMasked,
      showDeleteButton: true,
    };

    setColumnData((prev) => [...(Array.isArray(prev) ? prev : []), newField]);
    setNewFieldName("");
    setNewFieldIsMasked(false);
    setisNewFieldVisible(true);

    setTimeout(() => {
      newFieldRef.current = document.getElementById("newRow");
      newFieldRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);
  };

  const handleDeleteField = (fieldId, fieldName) => {
    setColumnData((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (column) =>
          column.field_id !== fieldId ||
          (column.field_id === "" && column.field_name !== fieldName),
      ),
    );
  };

  if (!isColumnDataModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center ">
      <div className="w-[40vw] h-[90vh] ml-[40vw] relative bg-white flex flex-col justify-center items-center rounded-lg shadow shadow-slate-500/30 transform -translate-x-1/2 transition-right-0.3s ease-in-out">
        <div className="w-[35vw] h-[85vh] flex flex-col justify-center items-center px-4">
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-[35vw] h-[80vh] flex flex-col items-center">
              {/* HEADER ROW */}
              <div className="w-[30vw] h-[6vh] flex flex-row items-center">
                {permissions.includes("SeeUserReports") && (
                  <div>
                    <button
                      className="w-32 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow hover:bg-opacity-90"
                      onClick={() => {
                        setisNewFieldVisible(true);
                        handleAddNewField();
                      }}
                    >
                      Add New Field
                    </button>
                  </div>
                )}

                <div className="flex-grow"></div>
                <div className="flex">
                  <button
                    onClick={() => {
                      setIsColumnDataModalOpen(false);
                      if (setSelectedFiles) setSelectedFiles([]);
                    }}
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/closefile.png"}
                      alt="close"
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              {/* FILE IDENTIFIER */}
              <div className="w-[30vw] h-[5vh] mt-1 flex flex-row items-center justify-between text-xs font-medium text-gray-700">
                {selectedFiles && selectedFiles[0]?.split(/[\\/]/).pop()}
              </div>

              {/* GRID / TABLE BOUNDING CONTAINER */}
              <div className="w-[30vw] h-[60vh] bg-white rounded-lg mt-2 border border-lightgray-200 overflow-hidden flex flex-col">
                <div
                  className="w-full overflow-y-auto scrollbar-thin rounded-b-lg font-poppins "
                  style={{ scrollbarWidth: "thin", height: "55vh" }}
                >
                  <table className="table-design table-fixed w-full border-collapse">
                    <colgroup>
                      <col className="w-[60%]" />
                      <col className="w-[40%]" />
                    </colgroup>

                    <thead className="bg-purpleshade1 text-white sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-4 text-sm font-medium text-left">
                          Field Name
                        </th>
                        <th className="py-2 px-4 text-sm font-medium text-left">
                          Is Masked
                        </th>
                      </tr>
                    </thead>

                    <tbody className="border-none">
                      {/* DYNAMIC NEW FIELD LINE CONTAINER */}
                      {/* DYNAMIC NEW FIELDROW GENERATOR */}
                      {isNewFieldVisible && (
                        <tr
                          id="newRow"
                          className="border-b border-gray-100 bg-purple-50/30"
                        >
                          {/* 🛠️ FIX: Removed 'overflow-hidden' so the absolute tooltip can render outside the cell boundaries */}
                          <td className="w-[60%] text-[11px] font-poppins font-[350] px-7 py-2 relative">
                            <input
                              id="newFieldNameInput"
                              className={`h-6 border w-36 px-2 rounded bg-white text-black transition-all ${
                                !newFieldName.trim() && saveButtonClicked
                                  ? "border-red-500 bg-red-50 placeholder:text-red-400"
                                  : "border-black"
                              }`}
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              placeholder="Field name..."
                              title={
                                !newFieldName.trim()
                                  ? "Please fill out this field"
                                  : ""
                              }
                            />

                            {/* 🛠️ FIX: Cleaned up absolute coordinates to position the tooltip directly under the input field */}
                            {!newFieldName.trim() && saveButtonClicked && (
                              <div className="absolute left-7 top-[34px] bg-red-600 text-white text-[10px] py-1 px-2 rounded shadow-lg z-[999] whitespace-nowrap animate-bounce">
                                Please fill out this field
                                <div className="absolute top-[-4px] left-4 border-solid border-b-red-600 border-b-4 border-x-transparent border-x-4 border-t-0"></div>
                              </div>
                            )}
                          </td>
                          <td className="w-[40%] text-[13px] font-poppins font-[350] px-6 py-2">
                            <div className="w-20 flex flex-row justify-between items-center">
                              <div>
                                <IsMaskedSwitch
                                  isMasked={newFieldIsMasked}
                                  onToggle={handleNewSwitchChange}
                                  disabled={
                                    !permissions.includes("SeeUserReports")
                                  }
                                />
                              </div>
                              <div>
                                <button
                                  className="text-xl font-semibold text-gray-400 hover:text-red-500"
                                  onClick={() => {
                                    handleDeleteField("", newFieldName);
                                    setisNewFieldVisible(false);
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* 🛠️ UPDATED EVALUATION CRITERIA: Uses 'localLoading' to prevent parent batching lags */}
                      {localLoading ? (
                        <tr>
                          <td colSpan="2" className="py-20 text-center">
                            <div className="w-full flex flex-col justify-center items-center space-y-3">
                              <img
                                src={process.env.PUBLIC_URL + "/loadergif.gif"}
                                alt="loading..."
                                className="w-5 h-5"
                              />
                              <p className="text-logintext font-[350] text-[13px] animate-pulse">
                                Loading data structure...
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : !validColumnData || validColumnData.length === 0 ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="text-center py-20 text-xs font-light text-gray-400"
                          >
                            No fields available.
                          </td>
                        </tr>
                      ) : (
                        // validColumnData.map((column, index) => {
                        //   let cleanFieldName = column.field_name || "";
                        //   try {
                        //     if (
                        //       cleanFieldName.startsWith('"') ||
                        //       cleanFieldName.includes('\\"')
                        //     ) {
                        //       cleanFieldName = JSON.parse(cleanFieldName);
                        //     }
                        //   } catch (e) {
                        //     cleanFieldName = cleanFieldName
                        //       .replace(/\\"/g, '"')
                        //       .replace(/^"| Font$/, "");
                        //   }

                        //   return (
                        //     <tr key={column.field_id || index} className="border-b border-gray-50 hover:bg-gray-50/50">
                        //       <td
                        //         className="w-[60%] text-[11px] font-[350] font-poppins text-black px-7 py-2 overflow-ellipsis whitespace-nowrap overflow-hidden"
                        //         title={cleanFieldName}
                        //       >
                        //         {cleanFieldName}
                        //       </td>

                        //       <td className="w-[40%] text-[11px] font-[350] font-poppins px-6 py-2 whitespace-nowrap overflow-hidden">
                        //         <div className="flex flex-row items-center space-x-2">
                        //           <IsMaskedSwitch
                        //             isMasked={column.is_masked}
                        //             onToggle={(value) =>
                        //               handleToggleSwitch(value, column.field_id)
                        //             }
                        //             disabled={!permissions.includes("SeeUserReports")}
                        //           />
                        //           {column.showDeleteButton && (
                        //             <button
                        //               className="text-xl font-medium font-poppins ml-2 text-red-500 hover:text-red-700 leading-none"
                        //               onClick={() =>
                        //                 handleDeleteField(column.field_id, column.field_name)
                        //               }
                        //             >
                        //               &times;
                        //             </button>
                        //           )}
                        //         </div>
                        //       </td>
                        //     </tr>
                        //   );
                        // })
                        validColumnData.map((column, index) => {
                          let cleanFieldName = column.field_name || "";

                          try {
                            // 1. If it's a JSON string, parse it first
                            if (
                              typeof cleanFieldName === "string" &&
                              (cleanFieldName.startsWith("{") ||
                                cleanFieldName.startsWith('"'))
                            ) {
                              const parsed = JSON.parse(cleanFieldName);

                              // 2. If it parses into an object with a 'type' key, extract just the type value
                              if (
                                parsed &&
                                typeof parsed === "object" &&
                                parsed.type
                              ) {
                                cleanFieldName = parsed.type;
                              } else if (typeof parsed === "string") {
                                cleanFieldName = parsed;
                              }
                            }
                          } catch (e) {
                            // Fallback regex cleanup if JSON parsing hit an unexpected character escape
                            if (cleanFieldName.includes('"type":"')) {
                              const match = cleanFieldName.match(
                                /"type"\s*:\s*"([^"]+)"/,
                              );
                              if (match && match[1]) {
                                cleanFieldName = match[1];
                              }
                            }
                          }

                          // Final trim to catch leftover artifacts
                          cleanFieldName = cleanFieldName
                            .replace(/\\"/g, '"')
                            .replace(/^"|"$|^\{"type":"|"$|^\{type:/g, "");

                          return (
                            <tr
                              key={column.field_id || index}
                              className=" hover:bg-gray-50/50"
                            >
                              <td
                                className="w-[60%] text-[11px] font-[350] font-poppins text-black px-4 py-2 overflow-ellipsis whitespace-nowrap overflow-hidden"
                                title={cleanFieldName}
                              >
                                {cleanFieldName}{" "}
                                {/* 👈 Will cleanly render "FeatureCollection" */}
                              </td>

                              <td className="w-[40%] text-[11px] font-[350] font-poppins px-4 py-2 whitespace-nowrap overflow-hidden">
                                <div className="flex flex-row items-center space-x-2">
                                  <IsMaskedSwitch
                                    isMasked={column.is_masked}
                                    onToggle={(value) =>
                                      handleToggleSwitch(value, column.field_id)
                                    }
                                    disabled={
                                      !permissions.includes("SeeUserReports")
                                    }
                                  />
                                  {column.showDeleteButton && (
                                    <button
                                      className="text-xl font-medium font-poppins ml-2 text-red-500 hover:text-red-700 leading-none"
                                      onClick={() =>
                                        handleDeleteField(
                                          column.field_id,
                                          column.field_name,
                                        )
                                      }
                                    >
                                      &times;
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SAVING FOOTER ACTION BLOCK */}
              <div className="z-20 w-[30vw] h-[6vh] flex flex-row space-x-4 justify-end mt-4 ">
                {permissions.includes("SeeUserReports") && (
                  <div>
                    <button
                      className="w-16 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow hover:bg-opacity-95"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ColumnDefinition;

// if the field_name map as it how the reponse seems

// {validColumnData.map((column, index) => {
//   let cleanFieldName = column.field_name || "";

//   try {
//     // If the backend wrapped the JSON string inside extra quotes,
//     // this will safely unwrap it so it displays as valid raw JSON text.
//     if (
//       typeof cleanFieldName === "string" &&
//       (cleanFieldName.startsWith('"') || cleanFieldName.includes('\\"'))
//     ) {
//       cleanFieldName = JSON.parse(cleanFieldName);
//     }
//   } catch (e) {
//     // If JSON parsing fails due to truncation, fall back to simple replacement formatting
//     cleanFieldName = cleanFieldName.replace(/\\"/g, '"');
//   }

//   // Ensure any lingering double-quote wrapping artifacts are cleaned up
//   if (typeof cleanFieldName === "string") {
//     cleanFieldName = cleanFieldName.trim();
//   }

//   return (
//     <tr key={column.field_id || index} className="border-b border-gray-50 hover:bg-gray-50/50">
//       <td
//         className="w-[60%] text-[11px] font-[350] font-poppins text-black px-7 py-2 overflow-ellipsis whitespace-nowrap overflow-hidden"
//         title={cleanFieldName} // This shows the full string when you hover with your mouse
//       >
//         {cleanFieldName} {/* 👈 This will now print '{"type":"FeatureCollection"' exactly as it is */}
//       </td>

//       <td className="w-[40%] text-[11px] font-[350] font-poppins px-6 py-2 whitespace-nowrap overflow-hidden">
//         <div className="flex flex-row items-center space-x-2">
//           <IsMaskedSwitch
//             isMasked={column.is_masked}
//             onToggle={(value) =>
//               handleToggleSwitch(value, column.field_id)
//             }
//             disabled={!permissions.includes("SeeUserReports")}
//           />
//           {column.showDeleteButton && (
//             <button
//               className="text-xl font-medium font-poppins ml-2 text-red-500 hover:text-red-700 leading-none"
//               onClick={() =>
//                 handleDeleteField(column.field_id, column.field_name)
//               }
//             >
//               &times;
//             </button>
//           )}
//         </div>
//       </td>
//     </tr>
//   );
// })}
