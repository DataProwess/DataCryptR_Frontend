import { useState, useEffect } from "react";
import { secureApiCall } from "../csrfUtils";
import ErrorPopup from "../ErrorPopup";
import AddMaskingConfig from "../AddMaskingConfig";
import { API_URL } from "../ApiConfig";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";
import MaskingUploadPopup from "./MaskingUploadPopup";

import { useUI } from "../Context/UIContext";

const PermanenetMasking = ({ selectedOption, showMaskingUploadPopup, setShowMaskingUploadPopup }) => {
  const { token, permissions, csrfToken, userEmail, authLoading } = useAuth();
  const {
    showChatbot,
    isDisabled,
    isBlurred,
  } = useUI();
  
  const [selectedMaskedDataRowDeletion, setSelectedMaskedDataRowDeletion] =
    useState(null);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAddMaskingConfigOpen, setIsAddMaskingConfigOpen] = useState(false);
  const [containerData, setContainerData] = useState([]);
  const [permanentMaskingData, setPermanentMaskingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedMaskedFileName, setSelectedMaskedFileName] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
   const [maskedFileName, setMaskedFileName] = useState("");

  const isInteractionDisabled = showChatbot;

  const DeleteMaskedConfirmationPopup = ({
    id,
    filePattern,
    onCancel,
    onConfirm,
  }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-80 h-32 flex flex-col space-y-4 ml-56 mt-11">
          <p className="font-medium text-sm text-red-500">
            Are You Sure You want to Delete {filePattern}?
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
              onClick={() => onConfirm(id)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

   const fetchPermanentMaskingData = async () => {
      setLoading(true);
      try {
        if (!token) {
          console.error("Token is not available.");
          return;
        }
  
        const responseData = await secureApiCall(
          `${API_URL}/api/blob/list_permanent_masking/`,
          "GET"
        );
  
        setPermanentMaskingData(responseData.permanent_masking);
        setLoading(false);
      } catch (error) {
        console.error("An error occurred:", error.message);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      // Check if the "DownloadConfigContainer" tab is active before making the API call
      if (selectedOption === "Permanent Masking") {
        fetchPermanentMaskingData();
      }
      // eslint-disable-next-line
    }, [token, selectedOption]);

  const handleClearSelectedFile = () => {
    setSelectedFileName("");
    setSelectedMaskedFileName("");
  };

  const handleClosePopup = () => {
    // closePreviewModal(); // Call the first function
    // closeGlobalPreviewModal(); // Call the second function
    // setShowUploadPopup(false);
    // setIsPopupOpen(false)
    setShowMaskingUploadPopup(false);
  };
//   const handleMaskedDownloadButtonClick = async () => {
//     console.log("downloaded")
//     try {
//       if (!token || !csrfToken) {
//         toast.error("Authentication required to download masking export.");
//         return;
//       }
//       const response = await secureApiCall(
//         `${API_URL}/api/blob/get_permanent_masking_xlsx/`,
//         {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-CSRFToken": csrfToken,
//           },
//         },
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}`);
//       }
//       const url = window.URL.createObjectURL(await response.blob());
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "permanent_masking_records.csv");
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//     } catch (error) {
//       console.error("Error downloading the file:", error);
//     }
//   };

// const handleMaskedDownloadButtonClick = async () => {
//   console.log("Downloading file...");
//   try {
//     if (!token || !csrfToken) {
//       toast.error("Authentication required to download masking export.");
//       return;
//     }

//     // Make the API request
//     const response = await secureApiCall(
//       `${API_URL}/api/blob/get_permanent_masking_xlsx/`,
//       "GET",
//       null,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "X-CSRFToken": csrfToken,
//         },
//       }
//     );

//     let blob;

//     // 1. If secureApiCall returned a raw Fetch Response object, convert it to a Blob
//     if (response instanceof Response) {
//       if (!response.ok) {
//         throw new Error(`HTTP Error ${response.status}`);
//       }
//       blob = await response.blob();
//     } 
//     // 2. If it's already a Blob
//     else if (response instanceof Blob) {
//       blob = response;
//     } 
//     // 3. If it returned JSON (likely an error message from backend)
//     else {
//       console.error("Expected a file blob, but got:", response);
//       toast.error(response?.message || response?.error || "Failed to download file.");
//       return;
//     }

//     // Verify we have a valid Blob with content
//     if (!blob || blob.size === 0) {
//       toast.error("Downloaded file is empty.");
//       return;
//     }

//     // Create download URL and trigger browser download
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "permanent_masking_records.xlsx");
//     document.body.appendChild(link);
//     link.click();

//     // Clean up DOM and memory
//     link.parentNode.removeChild(link);
//     window.URL.revokeObjectURL(url);
    
//   } catch (error) {
//     console.error("Error downloading the file:", error);
//     toast.error("Error downloading file: " + error.message);
//   }
// };

const handleMaskedDownloadButtonClick = async () => {
  console.log("Downloading file...");
  try {
    if (!token || !csrfToken) {
      toast.error("Authentication required to download masking export.");
      return;
    }

    // Make the API request
    const response = await secureApiCall(
      `${API_URL}/api/blob/get_permanent_masking_xlsx/`,
      "GET",
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
      }
    );

    let rawData;

    // 1. Resolve response to Blob or raw data
    if (response instanceof Response) {
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      rawData = await response.blob();
    } else if (response instanceof Blob) {
      rawData = response;
    } else if (typeof response === "object") {
      // Backend sent a JSON object instead of a file
      console.error("Backend returned JSON instead of a file:", response);
      toast.error(response?.message || response?.error || response?.detail || "Failed to download file.");
      return;
    }

    if (!rawData || rawData.size === 0) {
      toast.error("Downloaded file is empty.");
      return;
    }

    // 2. Read the first few characters to verify if it's text/CSV, JSON, or real XLSX
    const textPreview = await rawData.slice(0, 200).text();

    // Case A: Response is JSON error wrapped as text/blob
    if (textPreview.trim().startsWith("{") || textPreview.trim().startsWith("[")) {
      try {
        const errorJson = JSON.parse(textPreview);
        toast.error(errorJson.detail || errorJson.error || errorJson.message || "Error downloading file.");
        return;
      } catch (e) {
        // Fallback if JSON parse fails
      }
    }

    // Case B: Response is HTML (error page)
    if (textPreview.trim().toLowerCase().startsWith("<!doctype") || textPreview.trim().toLowerCase().startsWith("<html")) {
      toast.error("Server returned an HTML error page instead of a file.");
      return;
    }

    // Case C: Check if content is CSV vs XLSX
    // True XLSX binary starts with "PK\x03\x04" (Zip Header)
    const isXlsx = textPreview.startsWith("PK\x03\x04") || textPreview.startsWith("PK");
    
    let downloadBlob;
    let fileName;

    if (isXlsx) {
      // Real XLSX file
      downloadBlob = new Blob([rawData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fileName = "permanent_masking_records.xlsx";
    } else {
      // Backend sent CSV data (comma/tab separated text)
      downloadBlob = new Blob([rawData], {
        type: "text/csv;charset=utf-8;",
      });
      fileName = "permanent_masking_records.csv";
    }

    // 3. Trigger Download
    const url = window.URL.createObjectURL(downloadBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error downloading the file:", error);
    toast.error("Error downloading file: " + error.message);
  }
};

  const handleUploadPopupClose = () => {
    setShowUploadPopup(false);
    setShowMaskingUploadPopup(false);
  };
  const handleMaskedFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedMaskedFileName(file.name);
      setMaskedFileName(file);
    }
  };
  const handleMaskedBrowseClick = async () => {
    // setShowUploadPopup(true)
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = handleMaskedFileChange;
      fileInput.click();
      // setShowUploadPopup(true);
    } catch (error) {
      console.error("Error in handleUploadButtonClick:", error);
      toast.error("Failed to upload file");
    }
  };
  const handleMaskedSampleFileDownload = async () => {
    try {
      const fileBlob = await secureApiCall(
        `${API_URL}/api/blob/get_sample_permanent_masking_xlsx/`,
        "GET",
      );
      const blob =
        fileBlob instanceof Blob
          ? fileBlob
          : new Blob([fileBlob], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `downloaded-file.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading sample file:", error);
      toast.error("Failed to download sample file");
    }
  };
  const handleMaskedUploadFile = async () => {
    if (!maskedFileName) {
      setError("No file selected");
      setIsPopupOpen(true);
      return;
    }

    const browseFile = new FormData();
    browseFile.append("file", maskedFileName);

    try {
      if (!token) {
        console.error("Token is not available.");
        // navigate("/")
        return;
      }

      const response = await secureApiCall(
        `${API_URL}/api/blob/upload_permanent_masking_xlsx/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: browseFile,
        },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      // eslint-disable-next-line
      const data = await response.json(); // Extract the response JSON
      const message = "File uploaded successfully";
      // setShowUploadPopup(false);
      setIsPopupOpen(true);
      setError(message);
      // window.alert(message);
      handleClearSelectedFile(); // Clear the selected file after successful upload
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      // window.alert("Failed to upload file");
      setError("Failed to upload file");
      setIsPopupOpen(true);
      setLoading(false); // Ensure loading state is reset in case of an error
    }
  };

  const handleUploadButtonClick = async () => {
    setShowUploadPopup(true);
    setShowMaskingUploadPopup(true);
    // setError(true);
  };

  const handleMaskedDeleteClick = async (id) => {
    try {
      // Call the delete API
      const response = await secureApiCall(
        `${API_URL}/api/blob/delete_permanent_masking/${id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        // If the response is not ok (status code is not 200-299), throw an error
        throw new Error(
          `Failed to delete item with status: ${response.status}`,
        );
      }

      // Parse response data if necessary (optional for DELETE requests)
      const data = await response.json();

      // Filter out the deleted item from the state if the deletion was successful
      setPermanentMaskingData((prevData) =>
        prevData.filter((item) => item.id !== id),
      );

      console.log("Item deleted successfully:", data);
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };
  return (
    <>
       <div
        className={`options-data-container layout-gap flex flex-col items-center 
                        ${
                          isInteractionDisabled || isDisabled || isBlurred
                            ? " blur-effect pointer-events-none"
                            : ""
                        }`}
      >
     <div
          className={`button-container flex flex-row   px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30 ${showMaskingUploadPopup ? "blur-effect" : ""}`}
        >
          <div className="w-full flex flex-row justify-end space-x-2  ">
            {/* <button
                     className={`w-72  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
                      
                    
                     ${showChatbot ? "blur-effect" : ""}
                      ${showProfileModal ? "blur-effect" : ""}
                      ${isTimezoneModalOpen ? "blur-effect" : ""}`}
         
          style={{
            height: "2rem",
            maxWidth: "100%",
            maxHeight: "100%",
            overflow: "hidden",
          }}
          onClick={handleAddMaskingConfigOpen}
                  >
                    Add Masking Config
                  </button> */}
            <button
              className={`add-new-button flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 
                          ${isInteractionDisabled ? "blur-effect" : ""} 
                         `}
              style={{
                height: "2rem",
                maxWidth: "100%",
                maxHeight: "100%",
                overflow: "hidden",
              }}
              onClick={handleUploadButtonClick}
            >
              Upload
            </button>
            <button
              className="w-28  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                               justify-center items-center font-normal text-xs bg-purpleshade1
                              text-white  add-field-button"
              onClick={handleMaskedDownloadButtonClick}
              // onClick={setShowUploadPopup(true)}
              style={{
                height: "2rem",
                maxWidth: "100%",
                maxHeight: "90%",
                overflow: "hidden",
              }}
            >
              Download
            </button>
          </div>
        </div>
       <div className={`usergroup-data-container flex flex-col items-center `}>
       <div className={`usergroup-data-header rounded-t-xl ${showMaskingUploadPopup ? "blur-effect" : ""}`}>
          <table className="table-design table-fixed w-full ">
              <colgroup>
                <col className="w-[1%]" />
                <col className="w-[24%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white ">
                <tr>
                  <th
                    className="py-3 sticky top-0  rounded-tl-lg font-normal text-xs 
                         overflow-ellipsis whitespace-nowrap overflow-hidden"
                  ></th>
                  <th
                    className="py-3 sticky top-0 px-6  font-normal text-xs 
                         overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    File Pattern
                  </th>
                  <th
                    className="py-3 sticky top-0  font-normal text-xs
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    Column Name
                  </th>
                  <th
                    className="py-3 sticky top-0  font-normal text-xs
                        overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    Column Value
                  </th>
                  <th
                    className="py-2 sticky top-0  font-normal text-xs
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    Is Masked
                  </th>
                  <th
                    className="py-2 sticky top-0  font-normal text-xs
                       overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    Retention Policy
                  </th>
                  <th
                    className="py-2 sticky top-0 rounded-tr-lg font-normal text-xs
                     overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            className={`usergroup-tabular-data mt-2 flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
          >
            <div
              className={`usergroup-tabular-rows py-1  overflow-auto ${showMaskingUploadPopup ? "blur-effect" : ""}`}
              style={{ scrollbarWidth: "thin" }}
            >
              <table className="table-design table-fixed w-full ">
                <tbody className="sticky  mt-3">
                  {loading ? (
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
                    permanentMaskingData.map((item) => (
                      <tr key={item.id}>
                        <td className="w-[1%] text-[11px] font-light text-black px-6 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                        <td className="w-[24%] text-[11px] font-light text-black px-6 overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {item.file_pattern || "-"}
                        </td>
                        <td className="w-[15%] text-[11px] px-1 font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {item.column_name || "-"}
                        </td>
                        <td className="w-[20%] px-1 text-[11px] font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {item.column_value || "-"}
                        </td>
                        <td className="w-[15%] text-[11px] font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {item.is_masked ? "true" : "false"}
                        </td>
                        <td className="w-[15%] text-[11px] font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {item.is_permanent_delete_task ? "true" : "false"}
                        </td>
                        <td className="w-[8%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <div className="flex flex-row space-x-2">
                            <button
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
                                setSelectedMaskedDataRowDeletion(item);
                              }}
                            >
                              <img
                                src="icon-delete.png"
                                alt="delete"
                                className="w-4 h-4  rounded-lg"
                              />

                              {/* Delete */}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {showMaskingUploadPopup && (
              <div
                className={`absolute left-0 w-full h-full flex justify-center items-center z-50 
             ${showMaskingUploadPopup ? "blur-none" : ""}`}
              >
                <MaskingUploadPopup
                  handleUploadPopupClose={handleUploadPopupClose}
                  handleMaskedBrowseClick={handleMaskedBrowseClick}
                  handleMaskedSampleFileDownload={
                    handleMaskedSampleFileDownload
                  }
                  selectedMaskedFileName={selectedMaskedFileName}
                  handleClearSelectedFile={handleClearSelectedFile}
                  handleMaskedUploadFile={handleMaskedUploadFile}
                />
              </div>
            )}
            <div className="relative inline-block">
              <AddMaskingConfig
                isAddMaskingConfigOpen={isAddMaskingConfigOpen}
                // setIsTimezoneModalOpen={setIsTimezoneModalOpen}
                containerData={containerData}
                onclose={() => setIsAddMaskingConfigOpen(false)}
                // closePreviewModal={closePreviewModal}
                // setSelectedNavbarOption={setSelectedNavbarOption}
              />
            </div>
            <ErrorPopup
              isOpen={isPopupOpen}
              message={error}
              onClose={()=>setIsPopupOpen(false)}
            //   onClose={handleClosePopup}
            />
            {selectedMaskedDataRowDeletion && (
              <DeleteMaskedConfirmationPopup
                id={selectedMaskedDataRowDeletion.id}
                filePattern={selectedMaskedDataRowDeletion.file_pattern}
                onCancel={() => setSelectedMaskedDataRowDeletion(null)}
                onConfirm={() =>
                  handleMaskedDeleteClick(selectedMaskedDataRowDeletion.id)
                }
                message="Are you sure you want to delete this row?"
                confirmationButtonText="Confirm"
                cancelButtonText="Cancel"
              />
            )}
            {/* )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default PermanenetMasking;
