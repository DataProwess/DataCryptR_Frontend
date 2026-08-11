import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const GcpColumnDefinition = ({
  isOpen,
  setIsGcpColumnDataModalOpen,
  isGcpColumnDataModalOpen,
  closeModal,
  gcpColumnData,
  setGcpColumnData,
  renderColumnData,
  showGcpPreview,
  setGcpSelectedFiles,
  gcpSelectedFiles,
  permissions,
  gcpLoading: parentLoading, // Rename this to avoid conflicts
  isGcpNewFieldVisible,
  setisGcpNewFieldVisible,
  handleSave,
  closePreviewModal,
  gcpSaveButtonClicked,
  gcpnewFieldRef,
  isGcpColumnDataFetched,
  gcpNewFieldName,
  setGcpNewFieldName,
  gcpNewFieldIsMasked,
  setGcpNewFieldIsMasked
}) => {
  

  // 🛠️ LOCAL STATE FIX: Manage loading state locally inside the modal
  const [localLoading, setLocalLoading] = useState(true);

  // Safely parse column data array structures
  const validColumnData = Array.isArray(gcpColumnData)
    ? gcpColumnData
    : gcpColumnData?.data || gcpColumnData?.columns || [];

  // 🛠️ WATCH DATA PIPELINE: As soon as data arrives, instantly turn off the loader locally
  useEffect(() => {
    if (isGcpColumnDataModalOpen) {
      if (validColumnData && validColumnData.length > 0) {
        console.log("Local Loader: Data detected! Dropping loading mask.");
        setLocalLoading(false);
      } else if (!parentLoading && isGcpColumnDataFetched) {
        // If API finished and array is genuinely empty
        setLocalLoading(false);
      } else {
        setLocalLoading(true);
      }
    }
  }, [
    gcpColumnData,
    isGcpColumnDataModalOpen,
    parentLoading,
    isGcpColumnDataFetched,
    validColumnData,
  ]);

  const handleToggleSwitch = (value, fieldId) => {
    const updatedColumnData = validColumnData.map((column) =>
      column.field_id === fieldId ? { ...column, is_masked: value } : column,
    );
    setGcpColumnData(updatedColumnData);
  };

  const handleNewSwitchChange = (value) => {
    setGcpNewFieldIsMasked(value);
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
    if (!gcpNewFieldName.trim()) return;

    const existingBlobPrefix =
      validColumnData.length > 0 ? validColumnData[0].blob_prefix : "";

    const newField = {
      field_id: "",
      blob_prefix: existingBlobPrefix,
      field_name: gcpNewFieldName,
      is_masked: gcpNewFieldIsMasked,
      showDeleteButton: true,
    };

    setGcpColumnData((prev) => [...(Array.isArray(prev) ? prev : []), newField]);
    setGcpNewFieldName("");
    setGcpNewFieldIsMasked(false);
    setisGcpNewFieldVisible(true);

    setTimeout(() => {
      gcpnewFieldRef.current = document.getElementById("newRow");
      gcpnewFieldRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);
  };

  const handleDeleteField = (fieldId, fieldName) => {
    setGcpColumnData((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (column) =>
          column.field_id !== fieldId ||
          (column.field_id === "" && column.field_name !== fieldName),
      ),
    );
  };

  if (!isGcpColumnDataModalOpen) return null;

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
                        setisGcpNewFieldVisible(true);
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
                      setIsGcpColumnDataModalOpen(false);
                      if (setGcpSelectedFiles) setGcpSelectedFiles([]);
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
                {gcpSelectedFiles && gcpSelectedFiles[0]?.split(/[\\/]/).pop()}
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
                      {isGcpNewFieldVisible && (
                        <tr
                          id="newRow"
                          className="border-b border-gray-100 bg-purple-50/30"
                        >
                          {/* 🛠️ FIX: Removed 'overflow-hidden' so the absolute tooltip can render outside the cell boundaries */}
                          <td className="w-[60%] text-[11px] font-poppins font-[350] px-7 py-2 relative">
                            <input
                              id="newFieldNameInput"
                              className={`h-6 border w-36 px-2 rounded bg-white text-black transition-all ${
                                !gcpNewFieldName.trim() && gcpSaveButtonClicked
                                  ? "border-red-500 bg-red-50 placeholder:text-red-400"
                                  : "border-black"
                              }`}
                              value={gcpNewFieldName}
                              onChange={(e) => setGcpNewFieldName(e.target.value)}
                              placeholder="Field name..."
                              title={
                                !gcpNewFieldName.trim()
                                  ? "Please fill out this field"
                                  : ""
                              }
                            />

                            {/* 🛠️ FIX: Cleaned up absolute coordinates to position the tooltip directly under the input field */}
                            {!gcpNewFieldName.trim() && gcpSaveButtonClicked && (
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
                                  isMasked={gcpNewFieldIsMasked}
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
                                    handleDeleteField("", gcpNewFieldName);
                                    setisGcpNewFieldVisible(false);
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
}

export default GcpColumnDefinition;

// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";

// const GcpColumnDefinition = ({
//   isOpen,
//   setIsGcpColumnDataModalOpen,
//   isGcpColumnDataModalOpen,
//   closeModal,
//   gcpColumnData,
//   setGcpColumnData,
//   renderColumnData,
//   showGcpPreview,
//   setGcpSelectedFiles,
//   gcpSelectedFiles,
//   permissions = [],
//   gcpLoading: parentLoading,
//   isGcpNewFieldVisible,
//   setisGcpNewFieldVisible,
//   handleSave,
//   closePreviewModal,
//   gcpSaveButtonClicked,
//   gcpnewFieldRef,
//   isGcpColumnDataFetched,
//   gcpNewFieldName,
//   setGcpNewFieldName,
//   gcpNewFieldIsMasked,
//   setGcpNewFieldIsMasked,
// }) => {
//   const [localLoading, setLocalLoading] = useState(true);

//   // Safely parse array response
//   const validColumnData = Array.isArray(gcpColumnData)
//     ? gcpColumnData
//     : gcpColumnData?.data || gcpColumnData?.columns || [];

//   useEffect(() => {
//     if (isGcpColumnDataModalOpen) {
//       if (validColumnData && validColumnData.length > 0) {
//         setLocalLoading(false);
//       } else if (!parentLoading && isGcpColumnDataFetched) {
//         setLocalLoading(false);
//       } else {
//         setLocalLoading(true);
//       }
//     }
//   }, [
//     gcpColumnData,
//     isGcpColumnDataModalOpen,
//     parentLoading,
//     isGcpColumnDataFetched,
//     validColumnData,
//   ]);

//   // 🛠️ Updated Toggle: Handles both `field_id` and `field_position`
//   const handleToggleSwitch = (value, columnIdentifier, index) => {
//     const updatedColumnData = validColumnData.map((column, idx) => {
//       const matchById = column.field_id && column.field_id === columnIdentifier;
//       const matchByPos = column.field_position && column.field_position === columnIdentifier;
//       const matchByIndex = idx === index;

//       if (matchById || matchByPos || matchByIndex) {
//         return { ...column, is_masked: value };
//       }
//       return column;
//     });
//     setGcpColumnData(updatedColumnData);
//   };

//   const handleNewSwitchChange = (value) => {
//     setGcpNewFieldIsMasked(value);
//   };

//   const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
//     const toggleIsMasked = () => {
//       if (!disabled) {
//         onToggle(!isMasked);
//       }
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

//   const handleAddNewField = () => {
//     if (!gcpNewFieldName.trim()) return;

//     const existingBlobPrefix =
//       validColumnData.length > 0 ? validColumnData[0].blob_prefix : "";

//     const newField = {
//       field_id: "",
//       blob_prefix: existingBlobPrefix,
//       field_name: gcpNewFieldName,
//       field_position: validColumnData.length + 1, // Auto-assign position for positional fallbacks
//       is_masked: gcpNewFieldIsMasked,
//       showDeleteButton: true,
//     };

//     setGcpColumnData((prev) => [...(Array.isArray(prev) ? prev : []), newField]);
//     setGcpNewFieldName("");
//     setGcpNewFieldIsMasked(false);
//     setisGcpNewFieldVisible(true);

//     setTimeout(() => {
//       gcpnewFieldRef.current = document.getElementById("newRow");
//       gcpnewFieldRef.current?.scrollIntoView({
//         behavior: "smooth",
//         block: "end",
//       });
//     }, 50);
//   };

//   const handleDeleteField = (fieldId, fieldName, index) => {
//     setGcpColumnData((prev) =>
//       (Array.isArray(prev) ? prev : []).filter((column, idx) => {
//         if (fieldId) return column.field_id !== fieldId;
//         if (column.field_name) return column.field_name !== fieldName;
//         return idx !== index;
//       }),
//     );
//   };

//   if (!isGcpColumnDataModalOpen) return null;

//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center">
//       <div className="w-[40vw] h-[90vh] ml-[40vw] relative bg-white flex flex-col justify-center items-center rounded-lg shadow shadow-slate-500/30 transform -translate-x-1/2 transition-right-0.3s ease-in-out">
//         <div className="w-[35vw] h-[85vh] flex flex-col justify-center items-center px-4">
//           <div className="w-full h-full flex justify-center items-center">
//             <div className="w-[35vw] h-[80vh] flex flex-col items-center">
//               {/* HEADER ROW */}
//               <div className="w-[30vw] h-[6vh] flex flex-row items-center">
//                 {permissions.includes("SeeUserReports") && (
//                   <div>
//                     <button
//                       className="w-32 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow hover:bg-opacity-90"
//                       onClick={() => {
//                         setisGcpNewFieldVisible(true);
//                         handleAddNewField();
//                       }}
//                     >
//                       Add New Field
//                     </button>
//                   </div>
//                 )}

//                 <div className="flex-grow"></div>
//                 <div className="flex">
//                   <button
//                     onClick={() => {
//                       setIsGcpColumnDataModalOpen(false);
//                       if (setGcpSelectedFiles) setGcpSelectedFiles([]);
//                     }}
//                   >
//                     <img
//                       src={process.env.PUBLIC_URL + "/closefile.png"}
//                       alt="close"
//                       className="h-4 w-4"
//                     />
//                   </button>
//                 </div>
//               </div>

//               {/* FILE IDENTIFIER */}
//               <div className="w-[30vw] h-[5vh] mt-1 flex flex-row items-center justify-between text-xs font-medium text-gray-700">
//                 {gcpSelectedFiles && gcpSelectedFiles[0]?.split(/[\\/]/).pop()}
//               </div>

//               {/* GRID / TABLE CONTAINER */}
//               <div className="w-[30vw] h-[60vh] bg-white rounded-lg mt-2 border border-lightgray-200 overflow-hidden flex flex-col">
//                 <div
//                   className="w-full overflow-y-auto scrollbar-thin rounded-b-lg font-poppins"
//                   style={{ scrollbarWidth: "thin", height: "55vh" }}
//                 >
//                   <table className="table-design table-fixed w-full border-collapse">
//                     <colgroup>
//                       <col className="w-[60%]" />
//                       <col className="w-[40%]" />
//                     </colgroup>

//                     <thead className="bg-purpleshade1 text-white sticky top-0 z-10">
//                       <tr>
//                         <th className="py-2 px-4 text-sm font-medium text-left">
//                           Field Name / Position
//                         </th>
//                         <th className="py-2 px-4 text-sm font-medium text-left">
//                           Is Masked
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody className="border-none">
//                       {/* NEW FIELD ROW */}
//                       {isGcpNewFieldVisible && (
//                         <tr id="newRow" className="border-b border-gray-100 bg-purple-50/30">
//                           <td className="w-[60%] text-[11px] font-poppins font-[350] px-7 py-2 relative">
//                             <input
//                               id="newFieldNameInput"
//                               className={`h-6 border w-36 px-2 rounded bg-white text-black transition-all ${
//                                 !gcpNewFieldName.trim() && gcpSaveButtonClicked
//                                   ? "border-red-500 bg-red-50 placeholder:text-red-400"
//                                   : "border-black"
//                               }`}
//                               value={gcpNewFieldName}
//                               onChange={(e) => setGcpNewFieldName(e.target.value)}
//                               placeholder="Field name..."
//                             />
//                             {!gcpNewFieldName.trim() && gcpSaveButtonClicked && (
//                               <div className="absolute left-7 top-[34px] bg-red-600 text-white text-[10px] py-1 px-2 rounded shadow-lg z-[999] whitespace-nowrap animate-bounce">
//                                 Please fill out this field
//                               </div>
//                             )}
//                           </td>
//                           <td className="w-[40%] text-[13px] font-poppins font-[350] px-6 py-2">
//                             <div className="w-20 flex flex-row justify-between items-center">
//                               <IsMaskedSwitch
//                                 isMasked={gcpNewFieldIsMasked}
//                                 onToggle={handleNewSwitchChange}
//                                 disabled={!permissions.includes("SeeUserReports")}
//                               />
//                               <button
//                                 className="text-xl font-semibold text-gray-400 hover:text-red-500"
//                                 onClick={() => {
//                                   handleDeleteField("", gcpNewFieldName);
//                                   setisGcpNewFieldVisible(false);
//                                 }}
//                               >
//                                 &times;
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       )}

//                       {/* DATA ROWS */}
//                       {localLoading ? (
//                         <tr>
//                           <td colSpan="2" className="py-20 text-center">
//                             <div className="w-full flex flex-col justify-center items-center space-y-3">
//                               <img
//                                 src={process.env.PUBLIC_URL + "/loadergif.gif"}
//                                 alt="loading..."
//                                 className="w-5 h-5"
//                               />
//                               <p className="text-logintext font-[350] text-[13px] animate-pulse">
//                                 Loading data structure...
//                               </p>
//                             </div>
//                           </td>
//                         </tr>
//                       ) : !validColumnData || validColumnData.length === 0 ? (
//                         <tr>
//                           <td
//                             colSpan="2"
//                             className="text-center py-20 text-xs font-light text-gray-400"
//                           >
//                             No fields available.
//                           </td>
//                         </tr>
//                       ) : (
//                         validColumnData.map((column, index) => {
//                           let cleanFieldName = column.field_name || "";

//                           // Parse column name if it contains JSON or structured objects
//                           try {
//                             if (
//                               typeof cleanFieldName === "string" &&
//                               (cleanFieldName.startsWith("{") || cleanFieldName.startsWith('"'))
//                             ) {
//                               const parsed = JSON.parse(cleanFieldName);
//                               if (parsed && typeof parsed === "object" && parsed.type) {
//                                 cleanFieldName = parsed.type;
//                               } else if (typeof parsed === "string") {
//                                 cleanFieldName = parsed;
//                               }
//                             }
//                           } catch (e) {
//                             if (cleanFieldName.includes('"type":"')) {
//                               const match = cleanFieldName.match(/"type"\s*:\s*"([^"]+)"/);
//                               if (match && match[1]) cleanFieldName = match[1];
//                             }
//                           }

//                           cleanFieldName = String(cleanFieldName)
//                             .replace(/\\"/g, '"')
//                             .replace(/^"|"$|^\{"type":"|"$|^\{type:/g, "");

//                           // Fallback display name for positional headers
//                           const displayName =
//                             cleanFieldName ||
//                             (column.field_position
//                               ? `Position ${column.field_position}`
//                               : `Column ${index + 1}`);

//                           const columnId = column.field_id || column.field_position;

//                           return (
//                             <tr key={columnId || index} className="hover:bg-gray-50/50">
//                               <td
//                                 className="w-[60%] text-[11px] font-[350] font-poppins text-black px-4 py-2 overflow-ellipsis whitespace-nowrap overflow-hidden"
//                                 title={displayName}
//                               >
//                                 {displayName}
//                                 {column.field_position && !column.field_id && (
//                                   <span className="ml-2 text-[9px] text-gray-400 font-mono">
//                                     [Pos: {column.field_position}]
//                                   </span>
//                                 )}
//                               </td>

//                               <td className="w-[40%] text-[11px] font-[350] font-poppins px-4 py-2 whitespace-nowrap overflow-hidden">
//                                 <div className="flex flex-row items-center space-x-2">
//                                   <IsMaskedSwitch
//                                     isMasked={!!column.is_masked}
//                                     onToggle={(value) =>
//                                       handleToggleSwitch(value, columnId, index)
//                                     }
//                                     disabled={!permissions.includes("SeeUserReports")}
//                                   />
//                                   {column.showDeleteButton && (
//                                     <button
//                                       className="text-xl font-medium font-poppins ml-2 text-red-500 hover:text-red-700 leading-none"
//                                       onClick={() =>
//                                         handleDeleteField(
//                                           column.field_id,
//                                           column.field_name,
//                                           index
//                                         )
//                                       }
//                                     >
//                                       &times;
//                                     </button>
//                                   )}
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* SAVE ACTION */}
//               <div className="z-20 w-[30vw] h-[6vh] flex flex-row space-x-4 justify-end mt-4">
//                 {permissions.includes("SeeUserReports") && (
//                   <div>
//                     <button
//                       className="w-16 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow hover:bg-opacity-95"
//                       onClick={handleSave}
//                     >
//                       Save
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };

// export default GcpColumnDefinition;