import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ErrorPopup from "../ErrorPopup";

const FileColumnDefinition = ({ 
  setIsColumnDataModalOpen,
  isColumnDataModalOpen,
  columnData,
  setColumnData,
  setSelectedFiles,
  selectedFiles,
  permissions,
  loading: parentLoading, // Rename this to avoid conflicts
  isNewFieldVisible,
  setisNewFieldVisible,
  handleSave,
  isPopupOpen,
  setIsPopupOpen,
  setError,
  error,
  saveButtonClicked,
  newFieldRef,
  newFieldName,
  setNewFieldName,
  newFieldIsMasked,
  setNewFieldIsMasked
}) => {
   const [localLoading, setLocalLoading] = useState(true);
   console.log("Column Data in FileColumnDefinition:", columnData);
  
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
        } else if (!parentLoading ) {
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
          <div className="w-[35vw] h-[85vh] flex flex-col justify-center items-center px-2">
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
                        setisNewFieldVisible(false);
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
                    <div className="w-full h-[5vh] flex flex-row items-center justify-between">
                       <table className="table-design table-fixed w-full border-collapse">
                      <colgroup>
                        <col className="w-[60%]" />
                        <col className="w-[40%]" />
                      </colgroup>
  
                      <thead className="bg-purpleshade1 text-white sticky top-0 z-10 rounded-t-lg">
                        <tr>
                          <th className="py-2 px-4 text-sm font-medium text-left">
                            Field Name
                          </th>
                          <th className="py-2 px-4 text-sm font-medium text-left">
                            Is Masked
                          </th>
                        </tr>
                      </thead>
                      </table>
                    </div>
                  <div
                    className="w-full h-[50vh] overflow-y-auto scrollbar-thin rounded-b-lg font-poppins "
                    style={{ scrollbarWidth: "thin", height: "55vh" }}
                  >
                    <table className="w-full border-collapse">
  
                      <tbody className="border-none">
                        {/* DYNAMIC NEW FIELD LINE CONTAINER */}
                        {/* DYNAMIC NEW FIELDROW GENERATOR */}
                        {isNewFieldVisible && (
                          <tr
                            id="newRow"
                            className="border-b border-gray-100 bg-purple-50/30"
                          >
                            {/* 🛠️ FIX: Removed 'overflow-hidden' so the absolute tooltip can render outside the cell boundaries */}
                            <td className="w-[60%] text-[11px] font-poppins font-[350] px-3 py-2 relative">
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
                            <td className="w-[40%] text-[13px] font-poppins font-[350] px-3 py-2">
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
         <ErrorPopup
                  isOpen={isPopupOpen}
                  message={error}
                  onClose={() => setIsPopupOpen(false)}
                />
      </div>,
      document.body,
    );
}

export default FileColumnDefinition