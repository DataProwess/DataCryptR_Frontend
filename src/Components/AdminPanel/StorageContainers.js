// import React, { useEffect, useState } from "react";
// import NewFieldPopup from "../NewField";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash ,faSync} from "@fortawesome/free-solid-svg-icons";
// import "react-toastify/dist/ReactToastify.css";
// import { API_URL } from "../ApiConfig";
// import { toast } from "react-toastify";
// import {
//   secureApiCall,
// } from "../csrfUtils";
// import { useUI } from "../Context/UIContext";
// import { useAuth } from "../AuthContext";
// import "./admin.css";
// import UserDeleteConfirmationPopup from "./UserDeleteConfirmationPopup";

// const StorageContainers = ({selectedOption}) => {
//   const { token, csrfToken } = useAuth();
 
//   const {
//     setShowPreview,
//     showChatbot,
//     isDisabled,
//     isBlurred,
//   } = useUI();
//   const [isNewFieldVisibleStorage, setisNewFieldVisibleStorage] =
//     useState(false);
//   const [loadingStorageContainers, setLoadingStorageContainers] =
//     useState(true);
//   const [containerData, setContainerData] = useState([]);
//   const [selectedStorageRowForDeletion, setSelectedStorageRowForDeletion] =
//     useState(null);
//   const [newFieldName, setNewFieldName] = useState("");
//   const [newAccountKey, setNewAccountKey] = useState("");
//   const [, setModifiedFileShares] = useState([]);
//   const [, setIsDeleteButtonVisible] = useState(true);
//   const [, setError] = useState("");
//   const [, setIsPopupOpen] = useState(false);
//   const [, setIsSaveClicked] = useState(false);
//   const [selectedContainer, setSelectedContainer] = useState(null);
//   const [storageContainerSyncStatus, setStorageContainerSyncStatus] = useState(
//     {},
//   );
//   const [showAccountKey, setShowAccountKey] = useState(true);
//   const [showDownloadPopup, setShowDownloadPopup] = useState(false);
//   const [isStorageContainerModal, setIsStorageContainerModal] = useState(false);
//   const isInteractionDisabled = showChatbot;

//    const fetchStorageContainerData = async () => {
//       setLoadingStorageContainers(true);
//       try {
//         if (!token) {
//           console.error("Token is not available.");
//           return;
//         }
  
//         const responseData = await secureApiCall(
//           `${API_URL}/api/admin/list-storage-accounts/`,
//           "GET"
//         );
  
//         setContainerData(responseData.data);
//         setIsStorageContainerModal(true);
//         setShowPreview(true);
//         setLoadingStorageContainers(false);
//       } catch (error) {
//         console.error("An error occurred:", error.message);
//         setLoadingStorageContainers(false);
//       }
//     };
  
//     useEffect(() => {
//       // Check if the "DownloadConfigContainer" tab is active before making the API call
//       if (
//         selectedOption === "Storage Container" 
       
//       ) {
//         fetchStorageContainerData();
//       }
//       // eslint-disable-next-line
//     }, [token, selectedOption]);

//   const handleStorageAccountSave = async () => {
//     try {
//       if (!token) {
//         console.error("Token is not available.");
//         return;
//       }

//       if (
//         isNewFieldVisibleStorage &&
//         (!newFieldName.trim() || !newAccountKey.trim())
//       ) {
//         toast.error("Please enter values for Field Name and Account key.");
//         return;
//       }

//       const newField = isNewFieldVisibleStorage
//         ? {
//             id: null,
//             account_name: newFieldName,
//             account_key: newAccountKey,
//             is_download_storage: false,
//           }
//         : null;

//       const requestBody = {
//         storage_account_data: [
//           ...containerData.map((container) => ({
//             id: container.id,
//             account_name: container.account_name,
//             account_key: container.account_key,
//             is_download_storage: container.is_download_storage,
//           })),
//           ...(newField ? [newField] : []),
//         ],
//       };

//       const data = await secureApiCall(
//         `${API_URL}/api/admin/update-storage-accounts/`,
//         "POST",
//         {
//           storage_account: requestBody.storage_account_data,
//         },
//       );

//       if (Array.isArray(data.data)) {
//         setContainerData(data.data);
//         setModifiedFileShares([]);
//         setNewFieldName(null);
//         setNewAccountKey(null);
//         setisNewFieldVisibleStorage(false);
//         setIsDeleteButtonVisible(false);
//         setLoadingStorageContainers(false);
//         setError("Storage account saved successfully!");
//         setIsPopupOpen(true);
//       } else {
//         console.error("Invalid storage_account_data:", data.data);
//       }

//       setIsSaveClicked(true);
//     } catch (error) {
//       console.error("Error saving storage accounts:", error);
//     }
//   };

//   const handleTableSave = () => {
//     handleStorageAccountSave(); // Pass false to indicate it's not a new field
//   };
//   const handleRowClick = (container) => {
//     setSelectedContainer(container);
//     // Trigger the checkbox click
//     const checkbox = document.getElementById(
//       `checkbox-${container.container_id}`,
//     );
//     if (checkbox) {
//       checkbox.click();
//     }
//   };
//   const handleCheckboxChange = (selectedContainer) => {
//     // Map through the container data and update the `is_download_storage` property
//     const updatedContainerData = containerData.map((container) => {
//       if (container === selectedContainer) {
//         // Toggle the checkbox for the selected container
//         return {
//           ...container,
//           is_download_storage: !container.is_download_storage,
//         };
//       } else {
//         // Uncheck all other checkboxes
//         return { ...container, is_download_storage: false };
//       }
//     });

//     // Update the state with the modified container data
//     setContainerData(updatedContainerData);
//   };
//   const handleContainerDataChange = (index, field, value) => {
//     setContainerData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = { ...newData[index], [field]: value };
//       return newData;
//     });
//   };
//   const toggleAccountKeyVisibility = (index) => {
//     setContainerData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = {
//         ...newData[index],
//         showActualKey: !newData[index].showActualKey,
//       };
//       return newData;
//     });
//   };
//    const handleAccountNameChange = (e) => {
//     const accName = e.target.value.toLowerCase();
//     setNewFieldName(accName);
//   };
//   const handleAccountKeyChange = (e) => {
//     const accKey = e.target.value;
//     setNewAccountKey(accKey);
//   };
//   // const handleRefresh = async (container) => {
//   //   try {
//   //     if (!token) {
//   //       console.error("Token is not available.");
//   //       return;
//   //     }
//   //     setError(`Sync is in progress for ${container.account_name}`);
//   //     setIsPopupOpen(true);
//   //     const requestBody = {
//   //       storage_account_name: container.account_name,
//   //     };
//   //     const response = await fetch(
//   //       `${API_URL}/api/core/refresh_storage_account/`,
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "X-CSRFToken": csrfToken,
//   //           "Content-Type": "application/json",
//   //         },
//   //         credentials: "include",
//   //         body: JSON.stringify(requestBody),
//   //       },
//   //     );
//   //     if (response.ok) {
//   //       setStorageContainerSyncStatus((prev) => ({
//   //         ...prev,
//   //         [container.id]: "pending",
//   //       }));
//   //       setStorageContainerSyncStatus((prev) => ({
//   //         ...prev,
//   //         [container.id]: "success",
//   //       }));
//   //       setError(`Sync is completed for ${container.account_name}`);
//   //       setIsPopupOpen(true);
//   //     } else {
//   //       setStorageContainerSyncStatus((prev) => ({
//   //         ...prev,
//   //         [container.id]: "failed",
//   //       }));
//   //       setError(`Failed to sync ${container.account_name}`);
//   //       setIsPopupOpen(true);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error during sync:", error);
//   //   }
//   // };


//   const handleRefresh = async (container) => {
//   try {
//     if (!token) {
//       console.error("Token is not available.");
//       toast.error("Authentication token missing.");
//       return;
//     }

//     // Set loading status for this specific container ID
//     setStorageContainerSyncStatus((prev) => ({
//       ...prev,
//       [container.id]: "pending",
//     }));
//     toast.info(`Sync is in progress for ${container.account_name}`);

//     // Call API using secureApiCall wrapper
//     const responseData = await secureApiCall(
//       `${API_URL}/api/core/refresh_storage_account/`,
//       "POST",
//       {
//         storage_account_name: container.account_name,
//       }
//     );

//     // Update status to success on completion
//     setStorageContainerSyncStatus((prev) => ({
//       ...prev,
//       [container.id]: "success",
//     }));

//     toast.success(
//       responseData?.message || `Sync completed for ${container.account_name}`
//     );

//     // Refresh the table data to reflect changes from the backend
//     fetchStorageContainerData();
//   } catch (error) {
//     console.error("Error during sync:", error);

//     setStorageContainerSyncStatus((prev) => ({
//       ...prev,
//       [container.id]: "failed",
//     }));

//     toast.error(`Failed to sync ${container.account_name}`);
//   }
// };
//    const handleCancelDelete = () => {
//       setSelectedStorageRowForDeletion(null);
//       setShowDownloadPopup(false);
//     };
  
//     const handleConfirmStorageDelete = async (storageaccountId) => {
//       try {
//         if (!token) {
//           console.error("Token is not available.");
//           // navigate("/")
//           return;
//         }
//         const response = await secureApiCall(
//           // `http://127.0.0.1:8000/api/admin/delete-file-shares/${fileShareId}/`,
//           `${API_URL}/api/admin/delete-storage-accounts/`,
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-CSRFToken": csrfToken,
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//             body: JSON.stringify({
//               storage_account_id: storageaccountId,
//             }),
//           }
//         );
  
//         if (response.ok) {
//           // Update state to remove the deleted file share
//           setContainerData((prevData) =>
//             prevData.filter((container) => container.id !== storageaccountId)
//           );
//           setSelectedStorageRowForDeletion(null);
//         } else {
//           // Handle deletion failure
//           console.error("Failed to delete storage container.");
//         }
//       } catch (error) {
//         console.error("Error during delete:", error);
//         // Handle error if necessary
//       } finally {
//         // Close the confirmation popup
//         // setSelectedFileShareForDeletion(null);
//       }
//     };
//   return (
//     <>
//       <div
//         className={`options-data-container layout-gap flex flex-col items-center 
//                         ${
//                           isInteractionDisabled || isDisabled || isBlurred
//                             ? " blur-effect pointer-events-none"
//                             : ""
//                         }`}
//       >
//         <div
//           className={`button-container flex flex-row  px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30`}
//         >
//           <button
//             className={`add-new-button flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 `}
//             onClick={() => setisNewFieldVisibleStorage(true)}
//             //   style={{
//             //     height: "2rem",
//             //     maxWidth: "100%",
//             //     maxHeight: "100%",
//             //     overflow: "hidden",
//             //   }}
//           >
//             Add New Field
//           </button>
//           <button
//             className={`w-20  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
//                         ${isInteractionDisabled || isDisabled || isBlurred ? "blur-effect" : ""} `}
//             onClick={handleTableSave}
//             // style={{
//             //   height: "2rem",
//             //   maxWidth: "100%",
//             //   maxHeight: "100%",
//             //   overflow: "hidden",
//             // }}
//           >
//             Save
//           </button>
//         </div>
//         <div className={`usergroup-data-container  flex flex-col items-center `}>
//           <div className={`usergroup-data-header rounded-t-xl`}>
//             <table className="table-design table-fixed w-full ">
//               <colgroup>
//                 <col className="w-[5%]" />
//                 <col className="w-[25%]" />
//                 <col className="w-[50%]" />
//                 <col className="w-[20%]" />
//               </colgroup>

//               <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-t-lg">
//                 <tr>
//                   <th className="py-3 sticky top-0 border border-none rounded-tl-lg"></th>
//                   <th className="py-3 sticky top-0 border border-l-0 border-r-0 text-xs text-white font-normal">
//                     Storage Account Name
//                   </th>
//                   <th className="py-3 sticky top-0 text-xs text-white font-normal">
//                     Storage Account Key
//                   </th>
//                   <th className="py-3 sticky top-0 text-xs text-white font-normal rounded-tr-lg">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//             </table>
//           </div>
//           <div
//             className={`usergroup-tabular-data  mt-2 flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
//           >
//             <div
//               className={`usergroup-tabular-rows  py-1  overflow-auto `}
//               style={{ scrollbarWidth: "thin" }}
//             >
//               <table className="table-design  table-fixed w-full ">
//                 <tbody className="sticky  mt-3">
//                   {loadingStorageContainers ? (
//                     <tr>
//                       <td colSpan="2" className="text-center py-10">
//                         <div className="flex flex-col justify-center items-center space-y-6">
//                           <img
//                             src={`${process.env.PUBLIC_URL}/loadergif.gif`}
//                             alt="Loading..."
//                             className="animate-spin w-8 h-8"
//                           />
//                           <p className="text-logintext font-[350] text-[13px] animate-pulse">
//                             Just a moment...
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     containerData &&
//                     containerData.map((container, index) => (
//                       <tr
//                         className=""
//                         key={container.id}
//                         onClick={() => handleRowClick(container)}
//                         style={{ cursor: "pointer" }}
//                         // className="border  border-l-0 border-r-0 border-lightgray-200 "
//                       >
//                         <td
//                           className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap 
//                                                            overflow-hidden accent-purpleshade1"
//                         >
//                           <input
//                             // className="admin-checkbox"
//                             type="checkbox"
//                             onChange={() => handleCheckboxChange(container)}
//                             // checked={selectedContainer === container}
//                             checked={container.is_download_storage}
//                             className="ml-2"
//                           />
//                         </td>
//                         <td className="w-[25%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
//                           <input
//                             type="text"
//                             value={container.account_name}
//                             onChange={(e) =>
//                               handleContainerDataChange(
//                                 index,
//                                 "account_name",
//                                 e.target.value,
//                               )
//                             }
//                             // readOnly
//                           />
//                         </td>
//                         {/* <div className="w-full"> */}
//                         <td className="w-[50%]  text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden ">
//                           {showAccountKey ? (
//                             <React.Fragment>
//                               <input
//                                 className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
//                                 type="text"
//                                 value={
//                                   container.showActualKey &&
//                                   container.account_key
//                                     ? container.account_key
//                                     : "*".repeat(
//                                         container.account_key
//                                           ? container.account_key.length
//                                           : 0,
//                                       )
//                                 }
//                                 onChange={(e) =>
//                                   handleContainerDataChange(
//                                     index,
//                                     "account_key",
//                                     e.target.value,
//                                   )
//                                 }
//                               />
//                               <button
//                                 className="text-xs font-light  border-none"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleAccountKeyVisibility(index);
//                                 }}
//                               >
//                                 {/* <FontAwesomeIcon icon={faEye} /> */}
//                                 {container.showActualKey ? (
//                                   <FontAwesomeIcon icon={faEyeSlash} />
//                                 ) : (
//                                   <FontAwesomeIcon icon={faEye} />
//                                 )}
//                               </button>
//                             </React.Fragment>
//                           ) : (
//                             <React.Fragment>
//                               <input
//                                 className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
//                                 type="text"
//                                 value={container.account_key || ""}
//                                 onChange={(e) =>
//                                   handleContainerDataChange(
//                                     index,
//                                     "account_key",
//                                     e.target.value,
//                                   )
//                                 }
//                               />
//                               <button
//                                 className="text-xs font-light border-none"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleAccountKeyVisibility(index);
//                                 }}
//                               >
//                                 <FontAwesomeIcon icon={faEyeSlash} />
//                               </button>
//                             </React.Fragment>
//                           )}
//                         </td>
//                         {/* </div> */}

//                         <td className="w-[20%] text-xs font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
//                           <div className="flex flex-row space-x-3">
//                             <button
//                               className="text-xs font-light border-none  w-14 items-center justify-center
//                                                                          rounded-md flex h-6 space-x-2"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleRefresh(container);
//                               }}
//                             >
//                               <img src="sync-icon.png" alt="sync" />
//                             </button>
//                             <button
//                               className="w-[20px] "
//                               onClick={(e) => {
//                                 e.stopPropagation(); // Prevent row click when button is clicked
//                                 setSelectedStorageRowForDeletion(container);
//                               }}
//                             >
//                               <img
//                                 src="icon-delete.png"
//                                 alt="delete"
//                                 className="w-4 h-4 rounded-lg"
//                               />

                              
//                             </button>
//                           </div>
//                         </td>
                       
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//          {isNewFieldVisibleStorage && (
//                     <NewFieldPopup
//                       newFieldName={newFieldName}
//                       setNewFieldName={setNewFieldName}
//                       setNewAccountKey={setNewAccountKey}
//                       newAccountKey={newAccountKey}
//                       handleAccountNameChange={handleAccountNameChange}
//                       handleAccountKeyChange={handleAccountKeyChange}
//                       namePlaceholder="Storage Account Name"
//                       keyPlaceholder="Storage Account Key"
//                       onCancel={() => {
//                         setisNewFieldVisibleStorage(false);
//                         setNewFieldName("");
//                         setNewAccountKey("");
//                       }}
//                       handleStorageAccountSave={handleStorageAccountSave}
//                     />
//                   )}
        
//                   {selectedStorageRowForDeletion && (
//                     <div className="absolute inset-0 flex justify-center z-20 items-center">
//                       <UserDeleteConfirmationPopup
//                         context={selectedStorageRowForDeletion}
//                         onCancel={handleCancelDelete}
//                         onConfirm={() =>
//                           handleConfirmStorageDelete(selectedStorageRowForDeletion.id)
//                         }
//                       />
//                     </div>
//                   )}
//       </div>
//     </>
//   );
// };

// export default StorageContainers;

import React, { useEffect, useState, useRef, useCallback } from "react";
import NewFieldPopup from "../NewField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSync } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../ApiConfig";
import { toast } from "react-toastify";
import { secureApiCall } from "../csrfUtils";
import { useUI } from "../Context/UIContext";
import { useAuth } from "../AuthContext";
import "./admin.css";
import UserDeleteConfirmationPopup from "./UserDeleteConfirmationPopup";

const StorageContainers = ({ selectedOption }) => {
  const { token, csrfToken } = useAuth();
  const { setShowPreview, showChatbot, isDisabled, isBlurred } = useUI();

  const [isNewFieldVisibleStorage, setisNewFieldVisibleStorage] = useState(false);
  const [loadingStorageContainers, setLoadingStorageContainers] = useState(true);
  const [containerData, setContainerData] = useState([]);
  const [selectedStorageRowForDeletion, setSelectedStorageRowForDeletion] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newAccountKey, setNewAccountKey] = useState("");
  const [syncingAccountIds, setSyncingAccountIds] = useState(new Set());
  const [, setSelectedContainer] = useState(null);

  const isInteractionDisabled = showChatbot;

  // Extract CSRF Token dynamically
  const getCsrfToken = useCallback(() => {
    if (csrfToken) return csrfToken;

    const cookieMatch = document.cookie.match(
      /(?:^|; )\s*(?:csrftoken|XSRF-TOKEN|csrf_token)=([^;]+)/
    );
    if (cookieMatch) return decodeURIComponent(cookieMatch[1]);

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute("content");

    return "";
  }, [csrfToken]);

  // 1. Get Sync Status API Call
  const fetchSyncStatus = useCallback(
    async (accountId = null) => {
      try {
        if (!token) return;

        const url = accountId
          ? `${API_URL}/api/admin/storage-accounts/sync-status/?account_id=${accountId}`
          : `${API_URL}/api/admin/storage-accounts/sync-status/`;

        const response = await secureApiCall(url, "GET", null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response?.data) {
          const syncArray = Array.isArray(response.data)
            ? response.data
            : [response.data];

          const syncMap = syncArray.reduce((acc, item) => {
            acc[item.id || item.account_id] = item;
            return acc;
          }, {});

          setContainerData((prevData) => {
            let hasChanges = false;
            const updated = prevData.map((acc) => {
              const syncData = syncMap[acc.id];
              if (
                syncData &&
                (acc.sync_status !== syncData.sync_status ||
                  acc.sync_start_time !== syncData.sync_start_time ||
                  acc.sync_end_time !== syncData.sync_end_time)
              ) {
                hasChanges = true;
                return {
                  ...acc,
                  sync_status: syncData.sync_status,
                  sync_start_time: syncData.sync_start_time,
                  sync_end_time: syncData.sync_end_time,
                };
              }
              return acc;
            });
            return hasChanges ? updated : prevData;
          });
        }
      } catch (error) {
        console.error("Error fetching storage sync status:", error.message);
      }
    },
    [token]
  );

  // 2. Fetch Initial Table Data
  const fetchStorageContainerData = useCallback(async () => {
    setLoadingStorageContainers(true);
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const responseData = await secureApiCall(
        `${API_URL}/api/admin/list-storage-accounts/`,
        "GET"
      );

      setContainerData(responseData.data || []);
      setShowPreview(true);
    } catch (error) {
      console.error("An error occurred:", error.message);
    } finally {
      setLoadingStorageContainers(false);
    }
  }, [token, setShowPreview]);

  useEffect(() => {
    if (selectedOption === "Storage Container") {
      fetchStorageContainerData();
    }
  }, [selectedOption, fetchStorageContainerData]);

  const fetchSyncStatusRef = useRef(fetchSyncStatus);
  useEffect(() => {
    fetchSyncStatusRef.current = fetchSyncStatus;
  }, [fetchSyncStatus]);

  // 3. Controlled Polling when any account status is IN_PROGRESS
  const hasActiveSync = containerData.some(
    (acc) => acc.sync_status === "IN_PROGRESS"
  );

  useEffect(() => {
    if (!hasActiveSync || selectedOption !== "Storage Container") return;

    const intervalId = setInterval(() => {
      fetchSyncStatusRef.current();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [hasActiveSync, selectedOption]);

  // 4. Save Changes
  const handleStorageAccountSave = async () => {
    try {
      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      if (
        isNewFieldVisibleStorage &&
        (!newFieldName.trim() || !newAccountKey.trim())
      ) {
        toast.error("Please enter values for Field Name and Account key.");
        return;
      }

      const newField = isNewFieldVisibleStorage
        ? {
            id: null,
            account_name: newFieldName,
            account_key: newAccountKey,
            is_download_storage: false,
          }
        : null;

      const requestBody = {
        storage_account_data: [
          ...containerData.map((container) => ({
            id: container.id,
            account_name: container.account_name,
            account_key: container.account_key,
            is_download_storage: container.is_download_storage,
          })),
          ...(newField ? [newField] : []),
        ],
      };

      const data = await secureApiCall(
        `${API_URL}/api/admin/update-storage-accounts/`,
        "POST",
        {
          storage_account: requestBody.storage_account_data,
        }
      );

      if (Array.isArray(data.data)) {
        setContainerData(data.data);
        setNewFieldName("");
        setNewAccountKey("");
        setisNewFieldVisibleStorage(false);
        toast.success("Storage account saved successfully!");
      } else {
        console.error("Invalid storage_account_data:", data.data);
      }
    } catch (error) {
      console.error("Error saving storage accounts:", error);
      toast.error("Failed to save storage accounts.");
    }
  };

  const handleTableSave = () => {
    handleStorageAccountSave();
  };

  // 5. Trigger Refresh / Sync
 const handleRefresh = async (container) => {
    if (syncingAccountIds.has(container.id) || container.sync_status === "IN_PROGRESS") {
      return;
    }

    try {
      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      const activeCsrfToken = getCsrfToken();

      setSyncingAccountIds((prev) => new Set(prev).add(container.id));
      toast.info(`Sync started for ${container.account_name}`);

      // Optimistically update sync status
      setContainerData((prevData) =>
        prevData.map((acc) =>
          acc.id === container.id
            ? { ...acc, sync_status: "IN_PROGRESS" }
            : acc
        )
      );

      const responseData = await secureApiCall(
        `${API_URL}/api/core/refresh_storage_account/`,
        "POST",
        {
          storage_account_name: container.account_name,
          csrfmiddlewaretoken: activeCsrfToken, // Included in payload if backend expects form-data/body CSRF
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": activeCsrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      toast.success(
        responseData?.message || `Sync initiated for ${container.account_name}`
      );

      await fetchSyncStatus(container.id);
    } catch (error) {
      console.error("Error during sync:", error);

      setContainerData((prevData) =>
        prevData.map((acc) =>
          acc.id === container.id ? { ...acc, sync_status: "FAILED" } : acc
        )
      );

      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        `Failed to sync ${container.account_name}`;

      toast.error(errorMessage);
    } finally {
      setSyncingAccountIds((prev) => {
        const updated = new Set(prev);
        updated.delete(container.id);
        return updated;
      });
    }
  };

  const handleConfirmStorageDelete = async (storageaccountId) => {
    try {
      if (!token) return;

      const activeCsrfToken = getCsrfToken();

      const response = await secureApiCall(
        `${API_URL}/api/admin/delete-storage-accounts/`,
        "POST",
        { storage_account_id: storageaccountId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": activeCsrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response) {
        setContainerData((prevData) =>
          prevData.filter((container) => container.id !== storageaccountId)
        );
        setSelectedStorageRowForDeletion(null);
        toast.success("Storage account deleted successfully.");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error("Failed to delete storage account.");
    }
  };

  const handleCancelDelete = () => {
    setSelectedStorageRowForDeletion(null);
  };

  const handleRowClick = (container) => {
    setSelectedContainer(container);
  };

  const handleCheckboxChange = (selectedContainer) => {
    const updatedContainerData = containerData.map((container) => {
      if (container === selectedContainer) {
        return {
          ...container,
          is_download_storage: !container.is_download_storage,
        };
      } else {
        return { ...container, is_download_storage: false };
      }
    });

    setContainerData(updatedContainerData);
  };

  const handleContainerDataChange = (index, field, value) => {
    setContainerData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const toggleAccountKeyVisibility = (index) => {
    setContainerData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        showActualKey: !newData[index].showActualKey,
      };
      return newData;
    });
  };

  const handleAccountNameChange = (e) => {
    setNewFieldName(e.target.value.toLowerCase());
  };

  const handleAccountKeyChange = (e) => {
    setNewAccountKey(e.target.value);
  };

  // Helper Badge Render function
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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
            Not Synced
          </span>
        );
    }
  };

  return (
    <>
      <div
        className={`options-data-container layout-gap flex flex-col items-center 
          ${isInteractionDisabled || isDisabled || isBlurred ? "blur-effect pointer-events-none" : ""}`}
      >
        <div className="button-container flex flex-row px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30">
          <button
            className="add-new-button flex flex-row justify-center text-xs rounded-md cursor-pointer items-center font-medium text-white bg-purpleshade1"
            onClick={() => setisNewFieldVisibleStorage(true)}
          >
            Add New Field
          </button>
          <button
            className={`w-20 h-8 flex flex-row px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
              ${isInteractionDisabled || isDisabled || isBlurred ? "blur-effect" : ""}`}
            onClick={handleTableSave}
          >
            Save
          </button>
        </div>

        <div className="usergroup-data-container flex flex-col items-center">
          <div className="usergroup-data-header rounded-t-xl">
            <table className="table-design table-fixed w-full">
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
                    Storage Account Name
                  </th>
                  <th className="py-3 sticky top-0 text-xs text-white font-normal">
                    Storage Account Key
                  </th>
                  <th className="py-3 sticky top-0 text-xs text-white font-normal">
                    Sync Status
                  </th>
                  <th className="py-3 sticky top-0 text-xs text-white font-normal rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="usergroup-tabular-data mt-2 flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white">
            <div
              className="usergroup-tabular-rows py-1 overflow-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              <table className="table-design table-fixed w-full">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[35%]" />
                  <col className="w-[18%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <tbody className="sticky mt-3">
                  {loadingStorageContainers ? (
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
                    containerData &&
                    containerData.map((container, index) => {
                      const isSyncing =
                        syncingAccountIds.has(container.id) ||
                        container.sync_status === "IN_PROGRESS";

                      return (
                        <tr
                          key={container.id}
                          onClick={() => handleRowClick(container)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden accent-purpleshade1">
                            <input
                              type="checkbox"
                              onChange={() => handleCheckboxChange(container)}
                              checked={!!container.is_download_storage}
                              className="ml-2"
                            />
                          </td>

                          <td className="w-[25%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                            <input
                              type="text"
                              value={container.account_name || ""}
                              onChange={(e) =>
                                handleContainerDataChange(
                                  index,
                                  "account_name",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td className="w-[35%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                            <div className="flex items-center space-x-2">
                              <input
                                className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
                                type="text"
                                value={
                                  container.showActualKey && container.account_key
                                    ? container.account_key
                                    : "*".repeat(
                                        container.account_key
                                          ? container.account_key.length
                                          : 0
                                      )
                                }
                                onChange={(e) =>
                                  handleContainerDataChange(
                                    index,
                                    "account_key",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="text-xs font-light border-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccountKeyVisibility(index);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    container.showActualKey
                                      ? faEyeSlash
                                      : faEye
                                  }
                                />
                              </button>
                            </div>
                          </td>

                          <td className="w-[18%] text-[11px] font-light text-center overflow-ellipsis whitespace-nowrap overflow-hidden">
                            {renderStatusBadge(container.sync_status)}
                          </td>

                          <td className="w-[17%] text-xs font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                            <div className="flex flex-row space-x-3 items-center">
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
                                    : "Trigger Storage Sync"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRefresh(container);
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
                              <button
                                type="button"
                                className="w-[20px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStorageRowForDeletion(container);
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

        {isNewFieldVisibleStorage && (
          <NewFieldPopup
            newFieldName={newFieldName}
            setNewFieldName={setNewFieldName}
            setNewAccountKey={setNewAccountKey}
            newAccountKey={newAccountKey}
            handleAccountNameChange={handleAccountNameChange}
            handleAccountKeyChange={handleAccountKeyChange}
            namePlaceholder="Storage Account Name"
            keyPlaceholder="Storage Account Key"
            onCancel={() => {
              setisNewFieldVisibleStorage(false);
              setNewFieldName("");
              setNewAccountKey("");
            }}
            handleStorageAccountSave={handleStorageAccountSave}
          />
        )}

        {selectedStorageRowForDeletion && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            <UserDeleteConfirmationPopup
              context={selectedStorageRowForDeletion}
              onCancel={handleCancelDelete}
              onConfirm={() =>
                handleConfirmStorageDelete(selectedStorageRowForDeletion.id)
              }
            />
          </div>
        )}
      </div>
    </>
  );
};

export default StorageContainers;
