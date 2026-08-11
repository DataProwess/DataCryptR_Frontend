import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "../auth";
import { API_URL } from "../ApiConfig";
import { useAuth } from "../AuthContext";
// import { useS3Account } from "../Context/S3AccountContext";
import { secureApiCall } from "../csrfUtils";
import "./admin.css";
import { useUI } from "../Context/UIContext";
import AlertNewFieldPopup from "../AlertNewFieldPopup";
import ErrorPopup from "../ErrorPopup";
import { toast } from "react-toastify";
import UploadPopup from "./UploadPopup";

const Alert = ({selectedOption}) => {
   const {
          setShowPreview,
          showChatbot,
          isDisabled,
          isBlurred,
        } = useUI();
    const { token, csrfToken, permissions } = useAuth();
     const [isAlertNewFieldVisible, setIsAlertNewFieldVisible] = useState(false);
     const [isChecked, setIsChecked] = useState(false);
     
      const [newFilePattern, setNewFilePattern] = useState("");
      const [newAlertEmail, setNewAlertEmail] = useState("");
      const [email, setEmail] = useState(newAlertEmail || "");
       const popupRef = useRef(null);
        const [showDownloadPopup, setShowDownloadPopup] = useState(false);
        const [error, setError] = useState("");
         const [isPopupOpen, setIsPopupOpen] = useState(false);
         const [showUploadPopup, setShowUploadPopup] = useState(false);
         const [selectedAlertAccessRowDeletion, setSelectedAlertAccessRowDeletion] =
             useState(null);
              const [alertAccessData, setAlertAccessData] = useState([]);
              const [loadingAlerts, setLoadingAlerts] = useState(true);
              const [isSaveClicked, setIsSaveClicked] = useState(false);
               const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
               const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
               const newFieldRef = useRef(null);
               const [newFieldName, setNewFieldName] = useState("");
               const [downloadConfigApiData, setDownloadConfigApiData] = useState(null);
               const [columnData, setColumnData] = useState([]);
               const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const isInteractionDisabled =  showChatbot;


     const fetchAlertAccessData = async () => {
        setLoadingAlerts(true);
        try {
          if (!token) {
            console.error("Token is not available.");
            return;
          }
    
          const responseData = await secureApiCall(
            `${API_URL}/api/admin/list-file-access-alerts/`,
            "POST"
          );
    
          // Extract the 'data' property from the API response
          if (responseData && Array.isArray(responseData.data)) {
            setAlertAccessData(responseData.data);
          } else {
            console.error(
              "API response does not contain a valid 'data' array:",
              responseData
            );
            setAlertAccessData([]); // Fallback to empty array
          }
        } catch (error) {
          console.error("An error occurred:", error.message);
        } finally {
          setLoadingAlerts(false);
        }
      };
    
      useEffect(() => {
        if (selectedOption === "Alert") {
          fetchAlertAccessData();
        }
        // eslint-disable-next-line
      }, [token, selectedOption]);

       const handleDownloadOptionChange = async (selectedOption) => {
          try {
            if (!token) {
              console.error("Token is not available.");
              return;
            }
            setShowDownloadOptions(false);
      
            let configType, requestBody;
      
            if (selectedOption === "Global") {
              configType = "global";
              requestBody = { config_type: configType };
            } else if (selectedOption === "Local") {
              configType = "file_specific";
              requestBody = { config_type: configType };
            }
      
            const response = await secureApiCall(
              `${API_URL}/api/admin/download-column/`,
              "POST",
              requestBody
            );
      
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response]));
      
            // Create a hidden anchor element
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `downloaded-${configType}-file.xlsx`);
            document.body.appendChild(link);
      
            // Trigger a click on the anchor element to initiate the download
            link.click();
      
            // Remove the anchor element
            document.body.removeChild(link);
            setLoadingAlerts(false);
          } catch (error) {
            console.error("Error in handleDownloadOptionChange:", error);
            toast.error("Failed to initiate download");
          }
        };
      

 const handleAddNewField = () => {
    if (!newFieldName || newFieldName.trim() === "") {
      // Handle the error if needed, e.g., set error state
      return;
    }

    // Check if there is an existing row being edited
    const existingRowIndex = downloadConfigApiData.findIndex(
      (column) => column.isEditing
    );

    if (existingRowIndex !== -1) {
      // If there is an existing row, update it with new values
      const updatedColumnData = [...downloadConfigApiData];
      const existingRow = updatedColumnData[existingRowIndex];
      existingRow.field_name = newFieldName;
      existingRow.is_masked = newFieldIsMasked;
      existingRow.isEditing = false;
      setDownloadConfigApiData(updatedColumnData);
    } else {
      // If there is no existing row, add a new row
      const defaultBlobPrefix = ""; // Replace this with your default value
      // eslint-disable-next-line
      const existingBlobPrefix =
        columnData.length > 0 ? columnData[0].blob_prefix : defaultBlobPrefix;

      const newField = {
        id: "",
        // blob_prefix: existingBlobPrefix,
        name: newFieldName,
        is_masked: newFieldIsMasked,
        showDeleteButton: true,
        // Add any other properties you might need for a new field
      };

      // setDownloadConfigApiData((prevColumnData) => [...prevColumnData, newField]);
      setDownloadConfigApiData((prevDownloadApiData) => [
        ...prevDownloadApiData,
        newField,
      ]);
    }

    // Clear input values after adding/updating a new field
    setNewFieldName("");
    setNewFieldIsMasked(false);
    setisNewFieldVisible(true);
  };

  useEffect(() => {
    if (isNewFieldVisible && newFieldRef.current) {
      newFieldRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isNewFieldVisible]);


     const handleDownloadOptionSelect = async (option) => {
        try {
          // Handle the selected download option (Global, Local, etc.)
    
          // Call the download function directly
          await handleDownloadOptionChange(option);
    
          // Close the popup
          setShowDownloadPopup(false);
        } catch (error) {
          console.error("Error in handleDownloadOptionSelect:", error);
          toast.error("Failed to initiate download");
        }
      };

     const handleAlertAccessDataSave = async () => {
        try {
          if (!token) {
            console.error("Token is not available.");
            return;
          }
    
          if (isAlertNewFieldVisible && (!newFilePattern.trim() || !email.trim())) {
            toast.error("Please enter values for File Pattern and Alert Email.");
            return;
          }
    
          const newAlertField = {
            alert_recipient: email,
            file_regex: newFilePattern,
          };
    
          const response = await fetch(
            `${API_URL}/api/admin/create-file-access-alert/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify(newAlertField),
            }
          );
    
          // const data = await response.json();
    
          if (response.ok) {
            fetchAlertAccessData();
            // setAlertAccessData((prevData) => [...prevData, newAlertField]); // Append new data properly
            setNewFilePattern(""); // Reset input fields
            setEmail("");
            setIsAlertNewFieldVisible(false); // Hide popup
            setIsSaveClicked(true);
            setIsPopupOpen(true);
            setError("Notification Details saved successfully!");
          } else {
            console.error("Failed to save data.");
          }
        } catch (error) {
          console.error("Error saving Notification Data:", error);
        }
      };

       const handleAlertAccessDataDeleteClick = async (fileAccessAlertId, index) => {
          console.log("aa");
          try {
            const response = await fetch(
              `${API_URL}/api/admin/delete-file-access-alert/${fileAccessAlertId}/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  "X-CSRFToken": csrfToken,
                },
                credentials: "include",
              }
            );
      
            if (!response.ok) {
              throw new Error("Failed to delete the alert.");
            }
      
            // Remove the item from state only if the API call is successful
      
            // setAlertAccessData((prevData) => prevData.filter((_, i) => i !== index));
            fetchAlertAccessData();
            setSelectedAlertAccessRowDeletion(null);
          } catch (error) {
            console.error("Error deleting alert:", error);
            alert("Failed to delete alert. Please try again.");
          }
        };

       const handleEmailChange = (e) => {
    const email_acc = e.target.value.toLowerCase();
    setEmail(email_acc);
    setIsChecked(false);
  };
  const handleFilePatternChange = (e) => {
    const filePattern = e.target.value.toLowerCase();
    setNewFilePattern(filePattern);
  };

  const DownloadPopup = ({ onSelect, onClose }) => {
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (popupRef.current && !popupRef.current.contains(event.target)) {
            onClose();
          }
        };
  
        document.addEventListener("mousedown", handleClickOutside);
  
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [onClose]);
      return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white px-4 py-2 rounded-lg shadow-top z-50 w-72 h-36  flex flex-col space-y-4 ml-56 ">
            <div className="flex justify-end">
              <button
                className="bg-background-100 text-2xl font-semibold "
                // onClick={handlePopupClose}
                onclick= {()=> setShowDownloadPopup(false)}
              >
                <img
                  src={process.env.PUBLIC_URL + "/closefile.png"}
                  alt="close"
                  className="h-4 w-4 "
                />
              </button>
            </div>
            <div className="flex flex-col space-y-4 items-center">
              <p className="font-medium text-sm  text-black ">Download ?</p>
              <div className="flex space-x-4 justify-center">
                <button
                  className="w-24  h-6 flex flex-row p-1 ml-4 px-4 rounded-md cursor-pointer
               justify-center items-center font-medium text-[13px] bg-purpleshade1 text-white "
                  onClick={() => {
                    onSelect("Global");
                    onClose();
                  }}
                >
                  Global
                </button>
                <button
                  className="w-24  h-6 p-1 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
               justify-center items-center font-medium text-[13px] bg-purpleshade1 text-white"
                  onClick={() => {
                    onSelect("Local");
                    onClose();
                  }}
                >
                  Local
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
     const DeleteAlertConfirmationPopup = ({
    fileAccessAlertId,
    onCancel,
    onConfirm,
  }) => {
    console.log("aa");
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-80 h-32 flex flex-col space-y-4 ml-56 mt-11">
          <p className="font-medium text-sm text-red-500">
            Are You Sure You want to Delete {}
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              className="w-20 h-7 bg-white text-black text-xs font-medium border border-black rounded-lg"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
              onClick={() => onConfirm(fileAccessAlertId)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };
    
    return (
         <div
        className={`options-data-container layout-gap flex flex-col items-center 
                        ${
                          isInteractionDisabled || isDisabled || isBlurred
                            ? " blur-effect pointer-events-none"
                            : ""
                        }`}
      >
     <div
          className={`button-container flex flex-row   px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30`}
        >
            <button
              className={`add-new-button flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
                ${isInteractionDisabled ?  "blur-effect" : ""}`}
              onClick={() => {
                setIsAlertNewFieldVisible(true);
                handleAddNewField();
              }}
             
            >
              Add New Alert
            </button>
            {/* <button
              className={`w-20  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
                          ${isNewFieldVisibleStorage ? "blur-effect" : ""} 
                         ${selectedStorageRowForDeletion ? "blur-effect" : ""}
                         ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              } ${isTimezoneModalOpen ? "blur-effect" : ""}`}
              onClick={handleTableSave}
              style={{
                height: "2rem",
                maxWidth: "100%",
                maxHeight: "100%",
                overflow: "hidden",
              }}
            >
              Save
            </button> */}
          </div>
           <div className={`usergroup-data-container flex flex-col items-center `}>
       <div className={`usergroup-data-header rounded-t-xl`}>
              <table className="table-design table-fixed w-full ">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[50%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-t-lg text-white">
                  <tr>
                    <th
                      className="py-2 sticky top-0  rounded-tl-lg font-normal text-xs 
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                    ></th>
                    <th
                      className="py-2 sticky top-0   font-normal text-xs 
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                    >
                      File Pattern
                    </th>
                    <th
                      className="py-2 sticky top-0   font-normal text-xs 
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                    >
                      Alert Email
                    </th>
                    <th
                      className="py-2 sticky top-0  rounded-tr-lg font-normal text-xs 
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
            className={`usergroup-tabular-data mt-2  flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
          >
            <div
              className={`usergroup-tabular-rows py-1  overflow-auto `}
              style={{ scrollbarWidth: "thin" }}
            >
               <table className="table-design table-fixed w-full">
              <tbody className="sticky  mt-3">
                {loadingAlerts ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="w-full h-full flex flex-col justify-center items-center space-y-6 mt-20"
                    >
                      <img
                        src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                        alt="Loading..."
                        className="animate-spin w-8 h-8"
                      />
                      <p className="text-logintext font-[350] text-[13px] animate-pulse">
                        Just a moment...
                      </p>
                    </td>
                  </tr>
                    ) : (
                      alertAccessData &&
                      alertAccessData.map((alertItem, index) => (
                        <tr key={index}>
                          <td className="w-[5%] text-[11px] font-light text-black px-6 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                          <td className="w-[25%] text-[11px] font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                            {alertItem.file_regex}
                          </td>
                          <td className="w-[50%] text-[11px]  font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                            {alertItem.alert_recipient}
                          </td>
  
                          <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                            <div className="flex flex-row space-x-2">
                              {/* <button
                                // className="bg-lightgray-100 text-white px-2 py-1 w-[100px] rounded-lg font-semibold"
                                className="w-[20px] "
                                // onClick={(e) => {
                                //   e.stopPropagation(); // Prevent row click when button is clicked
                                //   // handleDeleteClick(index);
                                //   setSelectionUserGroupDeletion(
                                //     group
                                //   );
                                // }}
                                // onClick={() => handleMaskedDeleteClick(item.id)}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when button is clicked
                                  // handleAlertAccessDataDeleteClick(alertItem.id, index)
                                  // setSelectedMaskedDataRowDeletion(item);
                                  setSelectedAlertAccessRowDeletion(alertItem)
                                }}
                              >
                                <img
                                  src="icon-delete.png"
                                  alt="delete"
                                  className="w-4 h-4  rounded-lg"
                                />
  
                                {/* Delete */}
                              {/* </button>  */}
                              <button
                                className="w-[20px]"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when button is clicked
                                  setSelectedAlertAccessRowDeletion(alertItem); // Set the selected alert item
                                }}
                              >
                                <img
                                  src="icon-delete.png"
                                  alt="delete"
                                  className="w-4 h-4 rounded-lg"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {selectedAlertAccessRowDeletion && (
              <DeleteAlertConfirmationPopup
                id={selectedAlertAccessRowDeletion.id}
                // fileRegix={selectedAlertAccessRowDeletion.file_Regix}
                onCancel={() => setSelectedAlertAccessRowDeletion(null)}
                onConfirm={() =>
                  handleAlertAccessDataDeleteClick(
                    selectedAlertAccessRowDeletion.id
                  )
                }
                // message="Are you sure you want to delete this row?"
                // confirmationButtonText="Confirm"
                // cancelButtonText="Cancel"
                // onCancel={setSelectedAlertAccessRowDeletion(false)}
                // onConfirm={() =>
                //   handleAlertAccessDataDeleteClick(selectedAlertAccessRowDeletion.id)
                // }
              />
            )}
  
            {/* {selectedAlertAccessRowDeletion && (
    <DeleteAlertConfirmationPopup
      alertAccessData={selectedAlertAccessRowDeletion}
      onCancel={() => setSelectedAlertAccessRowDeletion(null)}
      onConfirm={(id) => {
        handleAlertAccessDataDeleteClick(id); // Call delete function
        setSelectedAlertAccessRowDeletion(null); // Close the popup after confirming
      }}
    />
  )} */}
  
            {showUploadPopup && (
              <div
                className={`absolute left-0 w-full h-full flex justify-center items-center z-50 
           ${showUploadPopup ? "blur-none" : ""}`}
              >
                <UploadPopup />
              </div>
            )}
            <ErrorPopup
              isOpen={isPopupOpen}
              message={error}
              // onClose={closePreviewModal}
              onClose={()=>setIsPopupOpen(false)}
              // onClose={handleClosePopup}
            />
            {/* )} */}
            {showDownloadPopup && (
              <div className="absolute inset-0 flex justify-center z-20 items-center">
                <DownloadPopup
                  // onClose={handlePopupClose}
                  onclose= {()=> setShowDownloadPopup(false)}
                  onSelect={handleDownloadOptionSelect}
                  popupRef={popupRef}
                />
              </div>
            )}
            {isAlertNewFieldVisible && (
              <div className="absolute inset-0 flex justify-center z-20 items-center">
                <AlertNewFieldPopup
                  newFilePattern={newFilePattern}
                  newAlertEmail={newAlertEmail}
                  email={email}
                  setEmail={setEmail}
                  isChecked={isChecked}
                  setIsChecked={setIsChecked}
                  handleFilePatternChange={handleFilePatternChange}
                  handleEmailChange={handleEmailChange}
                  onCancel={() => setIsAlertNewFieldVisible(false)}
                  // onCancel={closePreviewModal}
                  handleAlertAccessDataSave={handleAlertAccessDataSave}
                  namePlaceholder="File Pattern"
                  keyPlaceholder="Alert Email"
                />
              </div>
            )}
          </div>
        </div>
      );
}

export default Alert