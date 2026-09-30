import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash ,faSync} from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../ApiConfig";
import { toast } from "react-toastify";
import { secureApiCall } from "../csrfUtils";
import { useUI } from "../Context/UIContext";
import { useAuth } from "../AuthContext";
import "./admin.css";
import NewFileShareModal from "./NewFileShareModal";

const FileShareData = ({ selectedOption,selectedFileShareForDeletion,setSelectedFileShareForDeletion }) => {
  const { token, csrfToken } = useAuth();
  const { setShowPreview, showChatbot, isDisabled, isBlurred } = useUI();

  const [newFilePath, setNewFilePath] = useState("");
  const [newFileShareFieldName, setNewFileShareFieldName] = useState("");
  const [isNewFieldVisibleFileShare, setisNewFieldVisibleFileShare] =
    useState(false);
  const [showAccountKey, setShowAccountKey] = useState(true);
  const [modifiedFileShares, setModifiedFileShares] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [fileShareData, setFileShareData] = useState([]);
  const [newFileShares, setNewFileShares] = useState([]);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);
  const [loadingFileShareData, setLoadingFileShareData] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [fileShareSyncStatus, setFileShareSyncStatus] = useState({});
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isFileContainerModal, setIsFileContainerModal] = useState(false);
  const [fileShareInputValue, setFileShareInputValue] = useState("");
  const [syncingAccountIds, setSyncingAccountIds] = useState(new Set());
  const isInteractionDisabled = showChatbot;

  const fetchFileSharesData = async () => {
    try {
      setLoadingFileShareData(true);
      // ✅ SECURE - Using apiRequest utility
      const responseData = await secureApiCall(
        `${API_URL}/api/admin/list-file-shares/`,
        "GET",
        {},
      );
      if (responseData && responseData.data && responseData.data.length > 0) {
        setFileShareData(responseData.data);
      } else {
        setFileShareData([]); // Falls back to empty array
      }
      setLoadingFileShareData(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setFileShareData([]);
    } finally {
      setLoadingFileShareData(false); // Clean up loading state
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (selectedOption === "File Share") {
      fetchFileSharesData();
    }
    // eslint-disable-next-line
  }, [token, selectedOption]);

  console.log(fileShareData);

  const handleNewFilePathChange = (e) => {
    const accKey = e.target.value.toLowerCase();
    setNewFilePath(accKey);
    // setNewFilePath(saveButtonClicked ? "*".repeat(accKey.length) : accKey);
  };

  // eslint-disable-next-line
  const handleFileShareRowClick = (fileshare) => {
    setSelectedContainer(fileshare);
    // Trigger the checkbox click
    const checkbox = document.getElementById(`checkbox-${fileshare.id}`);
    if (checkbox) {
      checkbox.click();
    }
  };

  const handleFileShareNameChange = (e, id) => {
    const { value } = e.target;

    // Update modifiedFileShares with the new name
    setModifiedFileShares((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleFileShareAccountNameChange = (e) => {
    const accName = e.target.value.toLowerCase();
    setNewFileShareFieldName(accName);
  };

  //   const handleFileShareSaveButtonClick = async () => {
  //     try {
  //       if (!token) {
  //         console.error("Token is not available.");
  //         return;
  //       }

  //       // const updatedFileShares = fileShareData.map((fileshare) => ({
  //       //   id: fileshare.id,
  //       //   // Use modified name if available, otherwise use the original name
  //       //   name: modifiedFileShares[fileshare.id] || fileshare.name,
  //       //   filepath:
  //       //     modifiedFileShares[fileshare.id]?.filepath || fileshare.filepath,
  //       //   // filepath: fileshare.filepath,
  //       //   sync_status: "NOT_STARTED",
  //       //   sync_start_time: "",
  //       //   sync_end_time: "",
  //       // }));

  //       // Add a new file share entry only if both the newFileShareFieldName and newFilePath are provided
  //       // if (newFileShareFieldName.trim() && newFilePath.trim()) {
  //       //   updatedFileShares.push({
  //       //     id: null,
  //       //     name: newFileShareFieldName,
  //       //     filepath: newFilePath,
  //       //     sync_status: "NOT_STARTED",
  //       //     sync_start_time: "",
  //       //     sync_end_time: "",
  //       //   });
  //       // }
  //       const updatedFileShares = fileShareData.map((fileshare) => {
  //   const updatedName =
  //     modifiedFileShares[fileshare.id]?.name ||
  //     modifiedFileShares[fileshare.id] ||
  //     fileshare.name ||
  //     fileshare.share_name ||
  //     "";

  //   const updatedFilepath =
  //     modifiedFileShares[fileshare.id]?.filepath ||
  //     fileshare.filepath ||
  //     "";

  //   return {
  //     id: fileshare.id,
  //     name: updatedName,
  //     share_name: updatedName,
  //     filepath: updatedFilepath,
  //     sync_status: "NOT_STARTED",
  //     sync_start_time: "",
  //     sync_end_time: "",
  //   };
  // });
  //       if (newFileShareFieldName.trim() && newFilePath.trim()) {
  //   const newFileShare = {
  //     id: "",
  //     name: newFileShareFieldName.trim(),
  //     share_name: newFileShareFieldName.trim(),
  //     filepath: newFilePath.trim(),
  //     sync_status: "NOT_STARTED",
  //     sync_start_time: "",
  //     sync_end_time: "",
  //   };

  //   updatedFileShares.push(newFileShare);
  // }

  //       // Prepare the request body with file shares
  //       const requestBody = {
  //         file_shares: updatedFileShares,
  //       };

  //       const data = await secureApiCall(
  //         `${API_URL}/api/admin/update-file-shares/`,
  //         "POST",
  //         requestBody,
  //       );

  //       if (Array.isArray(data.data)) {
  //         // Set the new file share data
  //         setFileShareData(data.data);

  //         // Clear the new field inputs
  //         setNewFileShareFieldName("");
  //         setNewFilePath("");

  //         setModifiedFileShares([]);
  //         setNewFileShares([]);
  //         setIsDeleteButtonVisible(false);
  //         setLoadingFileShareData(false);
  //         setNewFilePath("");

  //         setError("FileShare account saved successfully!");
  //         setIsPopupOpen(true);
  //       } else {
  //         console.error("Failed to save FileShare.");
  //       }

  //       // Set newFilePath to asterisks only if the save button is clicked
  //       setNewFilePath((prevFilePath) =>
  //         saveButtonClicked ? "*".repeat(prevFilePath.length) : prevFilePath,
  //       );

  //       setSaveButtonClicked(true);
  //       setisNewFieldVisibleFileShare(false);
  //     } catch (error) {
  //       console.error("Error saving file shares:", error);
  //     }
  //   };

  const handleFileShareSaveButtonClick = async () => {
    console.log("Save button clicked");

    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      // --------------------------------------------------
      // 1. Prepare EXISTING file shares
      // --------------------------------------------------
      const updatedFileShares = fileShareData.map((fileshare) => {
        const modifiedValue = modifiedFileShares[fileshare.id];

        const updatedName =
          typeof modifiedValue === "string"
            ? modifiedValue.trim()
            : fileshare.name?.trim() || "";

        const updatedPath = fileshare.filepath?.trim() || "";

        return {
          id: fileshare.id,
          name: updatedName,
          share_name: updatedName,
          filepath: updatedPath,
          sync_status: "NOT_STARTED",
          sync_start_time: "",
          sync_end_time: "",
        };
      });

      // --------------------------------------------------
      // 2. Add NEW file share only if both fields exist
      // --------------------------------------------------
      const newName = (newFileShareFieldName || "").trim();
      const newPath = (newFilePath || "").trim();

      if (newName || newPath) {
        // If user started adding a new field,
        // both values are required.
        if (!newName || !newPath) {
          console.error("File Share name or path is empty.");
          return;
        }

        updatedFileShares.push({
          id: "",
          name: newName,
          share_name: newName,
          filepath: newPath,
          sync_status: "NOT_STARTED",
          sync_start_time: "",
          sync_end_time: "",
        });
      }

      // --------------------------------------------------
      // 3. Request body
      // --------------------------------------------------
      const requestBody = {
        file_shares: updatedFileShares,
      };

      console.log("========== FILE SHARE REQUEST ==========");

      console.log(JSON.stringify(requestBody, null, 2));

      console.log("========================================");

      // --------------------------------------------------
      // 4. API call
      // --------------------------------------------------
      const data = await secureApiCall(
        `${API_URL}/api/admin/update-file-shares/`,
        "POST",
        requestBody,
      );

      console.log("File Share API Response:", data);

      // --------------------------------------------------
      // 5. Success
      // --------------------------------------------------
      if (Array.isArray(data?.data)) {
        setFileShareData(data.data);

        setNewFileShareFieldName("");
        setNewFilePath("");

        setModifiedFileShares({});
        setNewFileShares([]);

        setIsDeleteButtonVisible(false);
        setLoadingFileShareData(false);

        setError("FileShare account saved successfully!");
        setIsPopupOpen(true);

        setSaveButtonClicked(true);
        setisNewFieldVisibleFileShare(false);
      } else {
        console.error("Failed to save FileShare:", data);
      }
    } catch (error) {
      console.error("Error saving file shares:", error);
    }
  };

  useEffect(() => {}, [fileShareData]);

  const handleConfirmDelete = async (fileShareId) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        // navigate("/")
        return;
      }
      if (fileShareId === null) {
        // If the file share ID is null, it's a newly added field, so remove it directly from the UI
        setFileShareData((prevData) =>
          prevData.filter((fileshare) => fileshare.id !== fileShareId),
        );
        setSelectedFileShareForDeletion(null);
        return; // Exit the function early
      }

      const response = await fetch(
        `${API_URL}/api/admin/delete-file-shares/${fileShareId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        setFileShareData((prevData) =>
          prevData.filter((fileshare) => fileshare.id !== fileShareId),
        );
        setSelectedFileShareForDeletion(null);
      } else {
        console.error("Failed to delete file share.");
      }
    } catch (error) {
      console.error("Error during delete:", error);
    } finally {
      setSelectedFileShareForDeletion(null);
    }
  };
  const handleCancelDelete = () => {
    setSelectedFileShareForDeletion(null);
    setShowDownloadPopup(false);
  };

  const toggleFilePathVisibility = (index) => {
    setFileShareData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        showActualKey: !newData[index].showActualKey,
      };
      return newData;
    });
  };
  const handleFilePathChange = (index, value) => {
    setFileShareData((prev) => {
      if (!prev[index]) {
        console.error("Invalid index:", index);
        return prev;
      }

      const updatedData = [...prev];
      updatedData[index] = { ...updatedData[index], filepath: value };
      return updatedData;
    });
  };

  const handleFileShareRefresh = async (fileshare) => {
     if (syncingAccountIds.has(fileshare.id) || fileshare.sync_status === "IN_PROGRESS") {
      return;
    }
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }
        setSyncingAccountIds((prev) => new Set(prev).add(fileshare.id));
            // toast.info(`Sync started for ${fileshare.name}`);

      setError(`Sync is in progress for ${fileshare.name}`);
      setIsPopupOpen(true);

       setFileShareData((prevData) =>
        prevData.map((acc) =>
          acc.id === fileshare.id
            ? { ...acc, sync_status: "IN_PROGRESS" }
            : acc
        )
      );
      const response = await secureApiCall(
        `${API_URL}/api/admin/sync-file-shares/${fileshare.id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      if (response.ok) {
        setFileShareSyncStatus((prev) => ({
          ...prev,
          [fileshare.id]: "pending",
        }));
        setFileShareSyncStatus((prev) => ({
          ...prev,
          [fileshare.id]: "success",
        }));
        setError(`Sync is Success for ${fileshare.name}`);
        setIsPopupOpen(true);
      } else {
        setFileShareSyncStatus((prev) => ({
          ...prev,
          [fileshare.id]: "failed",
        }));
        setError(`Sync is Failed for ${fileshare.name}`);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("Error during sync:", error);
    } finally {
       setSyncingAccountIds((prev) => {
        const updated = new Set(prev);
        updated.delete(fileshare.id);
        return updated;
      });
    }
  };

  const DeleteConfirmationPopup = ({ fileShare, onCancel, onConfirm }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-80 h-32 flex flex-col space-y-4 ml-56 mt-11">
          <p className="font-medium text-sm text-red-500">
            Are You Sure You want to Delete {fileShare.name}?
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
              onClick={() => onConfirm(fileShare.id)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 animate-pulse">
            In Progress
          </span>
        );
      case "SUCCESS":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
            Success
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-400 text-gray-500">
            Not Synced
          </span>
        );
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
          className={`button-container flex flex-row  px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30`}
        >
          <button
            className={`add-new-button flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 `}
            onClick={() => {
              setisNewFieldVisibleFileShare(true);
              // handleAddFileShareNewField();
            }}
            //   style={{
            //     height: "2rem",
            //     maxWidth: "100%",
            //     maxHeight: "100%",
            //     overflow: "hidden",
            //   }}
          >
            Add New Field
          </button>
          <button
            className={`w-20  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
                            ${isInteractionDisabled || isDisabled || isBlurred ? "blur-effect" : ""} `}
            onClick={() => handleFileShareSaveButtonClick()}
            // style={{
            //   height: "2rem",
            //   maxWidth: "100%",
            //   maxHeight: "100%",
            //   overflow: "hidden",
            // }}
          >
            Save
          </button>
        </div>
        <div className={`usergroup-data-container flex flex-col items-center `}>
          <div className={`usergroup-data-header rounded-t-xl`}>
            <table className="table-design table-fixed w-full ">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[25%]" />
                <col className="w-[35%]" />
                <col className="w-[18%]" />
                <col className="w-[17%]" />
              </colgroup>

              <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-t-lg">
                <tr>
                  <th className="py-3 sticky top-0 border border-none rounded-tl-lg"></th>
                  <th className="py-3 sticky top-0 border border-l-0 border-r-0 text-xs text-white font-normal">
                    File Share Name
                  </th>
                  <th className="py-3 sticky top-0 text-xs text-white font-normal">
                    File Share Path
                  </th>
                  <th className="py-3 sticky top-0 text-xs text-white font-normal">
                    Sync Status
                  </th>
                  <th className="py-3 sticky top-0 text-xs text-white font-normal rounded-tr-lg ">
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
              className={`usergroup-tabular-rows py-1  overflow-auto `}
              style={{ scrollbarWidth: "thin" }}
            >
              <table className="table-design table-fixed w-full ">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[35%]" />
                  <col className="w-[18%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <tbody className="sticky  mt-3">
                   {loadingFileShareData ? (
                  <tr>
                    <td colSpan="5" className="p-0 border-none">
                      <div className="w-full flex flex-col items-center justify-center py-12 space-y-4">
                        <img
                          src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                          alt="Loading..."
                          className="animate-spin w-8 h-8"
                        />
                        <p className="text-logintext font-[350] text-[13px] animate-pulse">
                          Just a moment...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  
                    fileShareData &&
                    fileShareData.map((fileshare, index) => {
                      const isSyncing =
                        syncingAccountIds.has(fileshare.id) ||
                        fileshare.sync_status === "IN_PROGRESS";

                      return (
                        <tr
                          key={fileshare.id}
                          onClick={() => handleFileShareRowClick(fileshare)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                          <td className="w-[25%] text-[11px] font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                            <input
                              className="w-full mr-[12px] "
                              type="text"
                              // value={fileshare.name || ''}
                              // onChange={(e) => handleFieShareNameChange(e)}
                              value={
                                modifiedFileShares[fileshare.id] ||
                                fileshare.name ||
                                ""
                              }
                              onChange={(e) =>
                                handleFileShareNameChange(e, fileshare.id)
                              }
                              // readOnly
                            />
                          </td>

                          <td className="w-[35%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                            {showAccountKey ? (
                              <React.Fragment>
                                <input
                                  className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
                                  type="text"
                                  value={
                                    fileshare.showActualKey &&
                                    fileshare.filepath
                                      ? fileshare.filepath
                                      : "*".repeat(
                                          fileshare.filepath
                                            ? fileshare.filepath.length
                                            : 0,
                                        )
                                  }
                                  onChange={(e) =>
                                    // handleFileShareDataChange(index, "filepath", e.target.value)
                                    handleFilePathChange(index, e.target.value)
                                  }
                                />
                                <button
                                  className="text-[13px] font-light border-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFilePathVisibility(index);
                                  }}
                                >
                                  {fileshare.showActualKey ? (
                                    <FontAwesomeIcon icon={faEyeSlash} />
                                  ) : (
                                    <FontAwesomeIcon icon={faEye} />
                                  )}
                                </button>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <input
                                  className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
                                  type="text"
                                  value={fileshare.filepath || ""}
                                  onChange={(e) =>
                                    handleFilePathChange(index, e.target.value)
                                  }
                                />
                                <button
                                  className="text-xs font-light border-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFilePathVisibility(index);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEyeSlash} />
                                </button>
                              </React.Fragment>
                            )}
                          </td>
                          <td className="w-[18%] text-[11px] font-light text-center overflow-ellipsis whitespace-nowrap overflow-hidden">
                            {renderStatusBadge(fileshare.sync_status)}
                          </td>

                          <td className="w-[17%] text-xs font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                            <div className="flex flex-row space-x-3">
                              <button
                                type="button"
                                disabled={isSyncing}
                                className={`text-xs font-light border-none w-8 justify-center rounded-md flex h-6 items-center ${
                                  isSyncing
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100 cursor-pointer"
                                }`}
                                title={
                                  isSyncing
                                    ? "Syncing..."
                                    : "Trigger File Share Sync"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileShareRefresh(fileshare);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faSync}
                                  className={
                                    isSyncing
                                      ? "animate-spin text-purpleshade1"
                                      : "text-gray-600"
                                  }
                                />
                              </button>
                              {/* <button
                              className="text-xs font-light border-none  w-14 items-center justify-center
                                                              rounded-md flex h-6 space-x-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileShareRefresh(fileshare);
                              }}
                              // disabled={selectedFileShareRow !== fileshare}
                            >
                              <img
                                src="sync-icon.png"
                                alt="sync"
                                //   className="w-4 h-4 rounded-lg font-semibold"
                              />
                            </button> */}
                              <button
                                className="w-[20px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileShareForDeletion(fileshare);
                                  // handleFileshareDeleteClick(fileshare)
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {selectedFileShareForDeletion && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            <DeleteConfirmationPopup
              fileShare={selectedFileShareForDeletion}
              onCancel={handleCancelDelete}
              onConfirm={() =>
                handleConfirmDelete(selectedFileShareForDeletion.id)
              }
            />
          </div>
        )}

        {isNewFieldVisibleFileShare && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            <NewFileShareModal
              newFieldName={newFileShareFieldName}
              newFilePatth={newFilePath}
              handleAccountNameChange={handleFileShareAccountNameChange}
              handleFilePathChange={handleNewFilePathChange}
              onCancel={() => setisNewFieldVisibleFileShare(false)}
              //   onCancel={closePreviewModal}
              handleFileShareSaveButtonClick={handleFileShareSaveButtonClick}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default FileShareData;
