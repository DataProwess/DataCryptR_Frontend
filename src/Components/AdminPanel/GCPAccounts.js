// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Link } from "react-router-dom";
// import authService from "../auth";
// import { API_URL } from "../ApiConfig";
// import DeletionConfirmationPopup from "./DeletionConfirmationPopup";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import NewFieldPopup from "../NewField";
// import { useAuth } from "../AuthContext";
// // import { useGcpAccount } from "../Context/S3AccountContext";
// import { secureApiCall } from "../csrfUtils";
// import { useUI } from "../Context/UIContext";

// const GCPAccounts = ({ selectedOption }) => {
//   const { setShowPreview, showChatbot, isDisabled, isBlurred } = useUI();

//   const { token, csrfToken, permissions } = useAuth();
//   const [isGcpNewFieldVisible, setIsGcpNewFieldVisible] = useState(false);
//   const [selectedGcpRowForDeletion, setSelectedGcpRowForDeletion] =
//     useState(null);
//   // const [showChatbot, setShowChatbot] = useState(false);
//   const [loadingGcpAccounts, setLoadingGcpAccounts] = useState(false);
//   const [newGcpAccountKey, setNewGcpAccountKey] = useState("");
//   const [newGcpFieldName, setNewGcpFieldName] = useState("");
//   const [showGcpAccountKey, setShowGcpAccountKey] = useState(true);
//   const [gcpAccountsData, setGcpAccountsData] = useState([]);
//   const [selectedGcpAccount, setSelectedGcpAccount] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const isInteractionDisabled =
//     isGcpNewFieldVisible || selectedGcpRowForDeletion || showChatbot;

//   const fetchGcpAccountData = async () => {
//     try {
//       if (!token) return;

//       setLoadingGcpAccounts(true);

//       const response = await secureApiCall(
//         `${API_URL}/api/gcp/accounts/`,
//         "GET",
//         null,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//         },
//       );

//       if (!response) return;

//       setGcpAccountsData(response.data || []);

//       // 🛑 REMOVED AUTO-SELECTION CODE:
//       // Do NOT call setSelectedGcpAccountId(response.data[0].id) here.
//       // Let the user manually select an account by clicking it.

//       console.log("🏦 Gcp accounts:", response.data);
//     } catch (error) {
//       console.error("Error fetching Gcp accounts:", error.message);
//     } finally {
//       setLoadingGcpAccounts(false);
//     }
//   };

//   useEffect(() => {
//     // Check if the "DownloadConfigaccount" tab is active before making the API call
//     if (selectedOption === "GCP") {
//       fetchGcpAccountData();
//     }
//     // eslint-disable-next-line
//   }, [token, selectedOption]);

//   const handleSave = () => {};

//   const handleTableSave = async () => {
//     try {
//       setLoadingGcpAccounts(true);

//       // Map through table items and submit update payload matching endpoint spec
//       const updatePromises = gcpAccountsData.map(async (account) => {
//         const payload = {
//           name: account.name,
//           project_id: account.project_id,
//         };

//         const res = await secureApiCall(
//           `${API_URL}/api/gcp/accounts/${account.id}/update/`,
//           "PUT",
//           payload,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-CSRFToken": csrfToken,
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           },
//         );

//         // Returns updated account object from { "data": { ... } }
//         return res?.data;
//       });

//       await Promise.all(updatePromises);
//       await fetchGcpAccountData(); // Refresh to reflect latest backend data
//     } catch (error) {
//       console.error("Error updating GCP accounts:", error.message);
//     } finally {
//       setLoadingGcpAccounts(false);
//     }
//   };

//   const handleGcpAccountDelete = async () => {
//     if (!selectedGcpRowForDeletion?.id) return;

//     try {
//       setLoadingGcpAccounts(true);

//       const response = await secureApiCall(
//         `${API_URL}/api/gcp/accounts/${selectedGcpRowForDeletion.id}/delete/`,
//         "DELETE",
//         null,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-CSRFToken": csrfToken,
//           },
//           credentials: "include",
//         },
//       );

//       if (response) {
//         setSelectedGcpRowForDeletion(null);
//         await fetchGcpAccountData(); // Refresh remaining list
//       }
//     } catch (error) {
//       console.error("Error deleting GCP account:", error.message);
//     } finally {
//       setLoadingGcpAccounts(false);
//     }
//   };

//   const handleCancelDelete = () => {};
//   const handleGcpAccountSave = () => {};

//   const handleGcpAccountChange = (index, field, value) => {
//     setGcpAccountsData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = { ...newData[index], [field]: value };
//       return newData;
//     });
//   };

//   const handleRowClick = (account) => {
//     setSelectedGcpAccount(account);
//     // Trigger the checkbox click
//     const checkbox = document.getElementById(`checkbox-${account.account_id}`);
//     if (checkbox) {
//       checkbox.click();
//     }
//   };
//   const handleGcpAccountKeyChange = (e) => {
//     const accKey = e.target.value;
//     setNewGcpAccountKey(accKey);
//   };

//   const handleGcpAccountNameChange = (e) => {
//     const accName = e.target.value.toLowerCase();
//     setNewGcpFieldName(accName);
//   };

//   const handleGcpRefresh = () => {};

//   const toggleGcpAccountKeyVisibility = (index) => {
//     setGcpAccountsData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = {
//         ...newData[index],
//         showActualKey: !newData[index].showActualKey,
//       };
//       return newData;
//     });
//   };

//   const handleCheckboxChange = (selectedaccount) => {
//     // Map through the account data and update the `is_download_storage` property
//     const updatedaccountData = gcpAccountsData.map((account) => {
//       if (account === selectedaccount) {
//         // Toggle the checkbox for the selected account
//         return {
//           ...account,
//           is_download_storage: !account.is_download_storage,
//         };
//       } else {
//         // Uncheck all other checkboxes
//         return { ...account, is_download_storage: false };
//       }
//     });

//     // Update the state with the modified account data
//     setGcpAccountsData(updatedaccountData);
//   };

//   return (
//     <>
//       <div
//         className={`options-data-container layout-gap flex flex-col items-center 
                       
//                         `}
//       >
//         <div
//           className={`button-container flex flex-row   px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30`}
//         >
//           <button
//             className={`add-new-button flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 
                         
//                          `}
//             onClick={() => setIsGcpNewFieldVisible(true)}
//             // style={{
//             //   height: "2rem",
//             //   maxWidth: "100%",
//             //   maxHeight: "100%",
//             //   overflow: "hidden",
//             // }}
//           >
//             Add New Field
//           </button>
//           <button
//             className={`w-20  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
//                         `}
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
//         <div className={`usergroup-data-container flex flex-col items-center `}>
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
//                     GCP Account
//                   </th>
//                   <th className="py-3 sticky top-0 text-xs text-white font-normal">
//                     Project_Id
//                   </th>
//                   <th className="py-3 sticky top-0 text-xs text-white font-normal rounded-tr-lg">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//             </table>
//           </div>
//           <div
//             className={`usergroup-tabular-data mt-2 flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
//           >
//             <div
//               className={`usergroup-tabular-rows py-1  overflow-auto `}
//               style={{ scrollbarWidth: "thin" }}
//             >
//               <table className="table-design table-fixed w-full">
//                 <tbody className="sticky  mt-3">
//                   {loadingGcpAccounts ? (
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="w-full h-full flex flex-col justify-center items-center space-y-6 mt-20"
//                       >
//                         <img
//                           src={`${process.env.PUBLIC_URL}/loadergif.gif`}
//                           alt="Loading..."
//                           className="animate-spin w-8 h-8"
//                         />
//                         <p className="text-logintext font-[350] text-[13px] animate-pulse">
//                           Just a moment...
//                         </p>
//                       </td>
//                     </tr>
//                   ) : (
//                     gcpAccountsData &&
//                     gcpAccountsData.map((account, index) => (
//                       <tr
//                         className="mt-1"
//                         key={account.id}
//                         onClick={() => handleRowClick(account)}
//                         style={{ cursor: "pointer" }}
//                         // className="border  border-l-0 border-r-0 border-lightgray-200 "
//                       >
//                         <td
//                           className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap 
//                           overflow-hidden accent-purpleshade1"
//                         >
//                           <input
//                             // className="admin-checkbox"
//                             type="checkbox"
//                             onChange={() => handleCheckboxChange(account)}
//                             // checked={selectedaccount === account}
//                             checked={account.is_download_storage}
//                             className="ml-2"
//                           />
//                         </td>
//                         <td className="w-[25%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
//                           <input
//                             type="text"
//                             value={account.name}
//                             onChange={(e) =>
//                               handleGcpAccountChange(
//                                 index,
//                                 "name",
//                                 e.target.value,
//                               )
//                             }
//                             // readOnly
//                           />
//                         </td>
//                         {/* <div className="w-full"> */}
//                         <td className="w-[50%]  text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden ">
//                           {showGcpAccountKey ? (
//                             <React.Fragment>
//                               <input
//                                 className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
//                                 type="text"
//                                 value={
//                                   account.showActualKey && account.project_id
//                                     ? account.project_id
//                                     : "*".repeat(
//                                         account.project_id
//                                           ? account.project_id.length
//                                           : 0,
//                                       )
//                                 }
//                                 onChange={(e) =>
//                                   handleGcpAccountChange(
//                                     index,
//                                     "project_id",
//                                     e.target.value,
//                                   )
//                                 }
//                               />
//                               <button
//                                 className="text-xs font-light  border-none"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleGcpAccountKeyVisibility(index);
//                                 }}
//                               >
//                                 {/* <FontAwesomeIcon icon={faEye} /> */}
//                                 {account.showActualKey ? (
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
//                                 value={account.project_id || ""}
//                                 onChange={(e) =>
//                                   handleGcpAccountChange(
//                                     index,
//                                     "project_id",
//                                     e.target.value,
//                                   )
//                                 }
//                               />
//                               <button
//                                 className="text-xs font-light border-none"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleGcpAccountKeyVisibility(index);
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
//                                         rounded-md flex h-6 space-x-2"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleGcpRefresh(account);
//                               }}
//                             >
//                               <img src="sync-icon.png" alt="sync" />
//                             </button>
//                             <button
//                               className="w-[20px] "
//                               onClick={(e) => {
//                                 e.stopPropagation(); // Prevent row click when button is clicked
//                                 setSelectedGcpRowForDeletion(account);
//                               }}
//                             >
//                               <img
//                                 src="icon-delete.png"
//                                 alt="delete"
//                                 className="w-4 h-4 rounded-lg"
//                               />

//                               {/* Delete */}
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
//           {isGcpNewFieldVisible && (
//             <NewFieldPopup
//               newFieldName={newGcpFieldName}
//               setNewFieldName={setNewGcpFieldName}
//               setNewAccountKey={setNewGcpAccountKey}
//               newAccountKey={newGcpAccountKey}
//               handleAccountNameChange={handleGcpAccountNameChange}
//               handleAccountKeyChange={handleGcpAccountKeyChange}
//               namePlaceholder="GCP Account Name"
//               keyPlaceholder="Project ID"
//               onCancel={() => {
//                 setIsGcpNewFieldVisible(false);
//                 setNewGcpFieldName("");
//                 setNewGcpAccountKey("");
//               }}
//               handleStorageAccountSave={handleGcpAccountSave}
//             />
//           )}

//           {selectedGcpRowForDeletion && (
//             <div className="absolute inset-0 flex justify-center z-20 items-center">
//               <DeletionConfirmationPopup
//                 context={selectedGcpRowForDeletion}
//                 onCancel={handleCancelDelete}
//                 onConfirm={() =>
//                   handleGcpAccountDelete(selectedGcpRowForDeletion.id)
//                 }
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default GCPAccounts;


import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "../auth";
import { API_URL } from "../ApiConfig";
import DeletionConfirmationPopup from "./DeletionConfirmationPopup";
import UserDeleteConfirmationPopup from "./UserDeleteConfirmationPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSync } from "@fortawesome/free-solid-svg-icons";
import NewFieldPopup from "./NewField";
import { useAuth } from "../AuthContext";
import { secureApiCall } from "../csrfUtils";
import { useUI } from "../Context/UIContext";

const GCPAccounts = ({ selectedOption, isGcpNewFieldVisible, setIsGcpNewFieldVisible }) => {
  const { setShowPreview, showChatbot, isDisabled, isBlurred } = useUI();
  const { token, csrfToken, permissions } = useAuth();

 
  const [selectedGcpRowForDeletion, setSelectedGcpRowForDeletion] = useState(null);
  const [loadingGcpAccounts, setLoadingGcpAccounts] = useState(false);
  const [newGcpAccountKey, setNewGcpAccountKey] = useState("");
  const [newGcpFieldName, setNewGcpFieldName] = useState("");
  const [showGcpAccountKey, setShowGcpAccountKey] = useState(true);
  const [gcpAccountsData, setGcpAccountsData] = useState([]);
  const [selectedGcpAccount, setSelectedGcpAccount] = useState(null);
  const [syncingAccountIds, setSyncingAccountIds] = useState(new Set());

  // Helper to extract CSRF token accurately
  const getCsrfToken = useCallback(() => {
    if (csrfToken) return csrfToken;

    const cookieMatch = document.cookie.match(/(?:^|; )\s*(?:csrftoken|XSRF-TOKEN|csrf_token)=([^;]+)/);
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
          ? `${API_URL}/api/gcp/accounts/sync-status/?gcp_account_id=${accountId}`
          : `${API_URL}/api/gcp/accounts/sync-status/`;

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
            acc[item.id || item.gcp_account_id] = item;
            return acc;
          }, {});

          setGcpAccountsData((prevData) => {
            let hasChanges = false;
            const updated = prevData.map((acc) => {
              const syncData = syncMap[acc.id];
              if (
                syncData &&
                (acc.sync_status !== syncData.sync_status ||
                  acc.bucket_count !== syncData.bucket_count)
              ) {
                hasChanges = true;
                return {
                  ...acc,
                  sync_status: syncData.sync_status,
                  sync_start_time: syncData.sync_start_time,
                  sync_end_time: syncData.sync_end_time,
                  bucket_count: syncData.bucket_count,
                };
              }
              return acc;
            });
            return hasChanges ? updated : prevData;
          });
        }
      } catch (error) {
        console.error("Error fetching sync status:", error.message);
      }
    },
    [token]
  );

  // 2. Load GCP Accounts List
  const fetchGcpAccountData = useCallback(async () => {
    try {
      if (!token) return;

      setLoadingGcpAccounts(true);

      const response = await secureApiCall(
        `${API_URL}/api/gcp/accounts/`,
        "GET",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response?.data) {
        setGcpAccountsData(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching GCP accounts:", error.message);
    } finally {
      setLoadingGcpAccounts(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedOption === "GCP") {
      fetchGcpAccountData();
    }
  }, [selectedOption, fetchGcpAccountData]);

  const fetchSyncStatusRef = useRef(fetchSyncStatus);
  useEffect(() => {
    fetchSyncStatusRef.current = fetchSyncStatus;
  }, [fetchSyncStatus]);

  // 3. Controlled Polling (Polled only when account state strictly requires it)
  const hasActiveSync = gcpAccountsData.some(
    (acc) => acc.sync_status === "IN_PROGRESS"
  );

  useEffect(() => {
    if (!hasActiveSync || selectedOption !== "GCP") return;

    const intervalId = setInterval(() => {
      fetchSyncStatusRef.current();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [hasActiveSync, selectedOption]);

  // 4. Trigger GCP Sync API Call (Fixed for CSRF and Error Handling)
  const handleGcpRefresh = async (account) => {
    // Block multiple simultaneous requests for the same account ID
    if (syncingAccountIds.has(account.id)) return;

    // Prevent trigger if account is already syncing on backend
    if (account.sync_status === "IN_PROGRESS") return;

    try {
      // Mark as syncing locally before network request
      setSyncingAccountIds((prev) => new Set(prev).add(account.id));

      const activeCsrfToken = getCsrfToken();

      const response = await secureApiCall(
        `${API_URL}/api/gcp/accounts/sync/`,
        "POST",
        { gcp_account_id: account.id },
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
        // Update local status to IN_PROGRESS only after successful request initiation
        setGcpAccountsData((prevData) =>
          prevData.map((acc) =>
            acc.id === account.id ? { ...acc, sync_status: "IN_PROGRESS" } : acc
          )
        );

        // Fetch immediate status update
        await fetchSyncStatus(account.id);
      }
    } catch (error) {
      console.error("Error triggering GCP sync:", error.message);

      // Revert status on failure so polling doesn't run indefinitely on 403 or network errors
      setGcpAccountsData((prevData) =>
        prevData.map((acc) =>
          acc.id === account.id ? { ...acc, sync_status: "FAILED" } : acc
        )
      );
    } finally {
      // Always remove account ID from pending set
      setSyncingAccountIds((prev) => {
        const updated = new Set(prev);
        updated.delete(account.id);
        return updated;
      });
    }
  };

  const handleTableSave = async () => {
    try {
      setLoadingGcpAccounts(true);
      const activeCsrfToken = getCsrfToken();

      const updatePromises = gcpAccountsData.map(async (account) => {
        const payload = {
          name: account.name,
          project_id: account.project_id,
        };

        const res = await secureApiCall(
          `${API_URL}/api/gcp/accounts/${account.id}/update/`,
          "PUT",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRFToken": activeCsrfToken,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        return res?.data;
      });

      await Promise.all(updatePromises);
      await fetchGcpAccountData();
    } catch (error) {
      console.error("Error updating GCP accounts:", error.message);
    } finally {
      setLoadingGcpAccounts(false);
    }
  };

  const handleGcpAccountDelete = async () => {
    if (!selectedGcpRowForDeletion?.id) return;

    try {
      setLoadingGcpAccounts(true);
      const activeCsrfToken = getCsrfToken();

      const response = await secureApiCall(
        `${API_URL}/api/gcp/accounts/${selectedGcpRowForDeletion.id}/delete/`,
        "DELETE",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": activeCsrfToken,
          },
          credentials: "include",
        }
      );

      if (response) {
        setSelectedGcpRowForDeletion(null);
        await fetchGcpAccountData();
      }
    } catch (error) {
      console.error("Error deleting GCP account:", error.message);
    } finally {
      setLoadingGcpAccounts(false);
    }
  };

  const handleCancelDelete = () => setSelectedGcpRowForDeletion(null);
  // const handleGcpAccountSave = () => {};

 const handleGcpAccountSave = async () => {
  try {
    setLoadingGcpAccounts(true);
    const activeCsrfToken = getCsrfToken();

    // Parse if user pasted JSON string, or create a valid JSON string structure
    let formattedCredentials = newGcpAccountKey;
    
    try {
      // Check if user pasted a JSON string; if so, parse/re-stringify to guarantee format
      const parsed = JSON.parse(newGcpAccountKey);
      formattedCredentials = JSON.stringify(parsed);
    } catch {
      // If user typed a plain string (like Project ID), construct a valid JSON object string
      formattedCredentials = JSON.stringify({ project_id: newGcpAccountKey });
    }

    const payload = {
      gcp_accounts: [
        {
          id: null,
          name: newGcpFieldName,
          credentials_json: formattedCredentials, // Valid JSON string required by serializer
          project_id: newGcpAccountKey,
          is_download_storage: false,
        },
      ],
    };

    const res = await secureApiCall(
      `${API_URL}/api/gcp/accounts/create/`,
      "POST",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": activeCsrfToken,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (res?.data) {
      setNewGcpFieldName("");
      setNewGcpAccountKey("");
      setIsGcpNewFieldVisible(false);
      await fetchGcpAccountData();
    }
  } catch (error) {
    console.error("Error creating GCP account:", error.message);
  } finally {
    setLoadingGcpAccounts(false);
  }
};
  const handleGcpAccountChange = (index, field, value) => {
    setGcpAccountsData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleRowClick = (account) => setSelectedGcpAccount(account);
  const handleGcpAccountKeyChange = (e) => setNewGcpAccountKey(e.target.value);
  const handleGcpAccountNameChange = (e) =>
    setNewGcpFieldName(e.target.value.toLowerCase());

  const toggleGcpAccountKeyVisibility = (index) => {
    setGcpAccountsData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        showActualKey: !newData[index].showActualKey,
      };
      return newData;
    });
  };

  const handleCheckboxChange = (selectedaccount) => {
    const updatedaccountData = gcpAccountsData.map((account) => {
      if (account === selectedaccount) {
        return {
          ...account,
          is_download_storage: !account.is_download_storage,
        };
      } else {
        return { ...account, is_download_storage: false };
      }
    });

    setGcpAccountsData(updatedaccountData);
  };

  // const handleConfirmGcpDelete = async (gcpaccountId) => {
  //     try {
  //       if (!token) return;
  
  //       // const activeCsrfToken = getCsrfToken();
  
  //       const response = await secureApiCall(
  //         `${API_URL}/api/admin/delete-storage-accounts/`,
  //         "POST",
  //         { storage_account_id: storageaccountId },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "X-CSRFToken": csrfToken,
  //             "Content-Type": "application/json",
  //           },
  //           credentials: "include",
  //         }
  //       );
  
  //       if (response) {
  //         setGcpAccountsData((prevData) =>
  //           prevData.filter((container) => container.id !== gcpaccountId)
  //         );
  //         setSelectedGcpRowForDeletion(null);
  //         toast.success("Storage account deleted successfully.");
  //       }
  //     } catch (error) {
  //       console.error("Error during delete:", error);
  //       toast.error("Failed to delete storage account.");
  //     }
  //   };

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
    <div className="options-data-container layout-gap flex flex-col items-center">
      <div className={`button-container flex flex-row px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30 ${isGcpNewFieldVisible ? "blur-effect" : ""}`}>
        <button
          className="add-new-button flex flex-row justify-center text-xs rounded-md cursor-pointer items-center font-medium text-white bg-purpleshade1"
          onClick={() => setIsGcpNewFieldVisible(true)}
        >
          Add New Field
        </button>
        <button
          className="w-20 h-8 flex flex-row px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button"
          onClick={handleTableSave}
        >
          Save
        </button>
      </div>

      <div className="usergroup-data-container flex flex-col items-center">
        <div className={`usergroup-data-header rounded-t-xl ${isGcpNewFieldVisible ? "blur-effect" : ""}`}>
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
                  GCP Account
                </th>
                <th className="py-3 sticky top-0 text-xs text-white font-normal">
                  Project_Id
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

        <div className={`usergroup-tabular-data mt-2 flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white ${isGcpNewFieldVisible ? "blur-effect" : ""}`}>
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
                {loadingGcpAccounts ? (
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
                  gcpAccountsData &&
                  gcpAccountsData.map((account, index) => {
                    const isSyncing =
                      syncingAccountIds.has(account.id) ||
                      account.sync_status === "IN_PROGRESS";

                    return (
                      <tr
                        className="mt-1"
                        key={account.id}
                        onClick={() => handleRowClick(account)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden accent-purpleshade1">
                          <input
                            type="checkbox"
                            onChange={() => handleCheckboxChange(account)}
                            checked={!!account.is_download_storage}
                            className="ml-2"
                          />
                        </td>

                        <td className="w-[25%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <input
                            type="text"
                            value={account.name || ""}
                            onChange={(e) =>
                              handleGcpAccountChange(
                                index,
                                "name",
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
                                account.showActualKey && account.project_id
                                  ? account.project_id
                                  : "*".repeat(
                                      account.project_id
                                        ? account.project_id.length
                                        : 0
                                    )
                              }
                              onChange={(e) =>
                                handleGcpAccountChange(
                                  index,
                                  "project_id",
                                  e.target.value
                                )
                              }
                            />
                            <button
                              type="button"
                              className="text-xs font-light border-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGcpAccountKeyVisibility(index);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  account.showActualKey ? faEyeSlash : faEye
                                }
                              />
                            </button>
                          </div>
                        </td>

                        <td className="w-[18%] text-[11px] font-light text-center overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {renderStatusBadge(account.sync_status)}
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
                                isSyncing ? "Syncing..." : "Trigger GCP Sync"
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGcpRefresh(account);
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
                                setSelectedGcpRowForDeletion(account);
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

        {isGcpNewFieldVisible && (
          <NewFieldPopup
            newFieldName={newGcpFieldName}
            setNewFieldName={setNewGcpFieldName}
            setNewAccountKey={setNewGcpAccountKey}
            newAccountKey={newGcpAccountKey}
            handleAccountNameChange={handleGcpAccountNameChange}
            handleAccountKeyChange={handleGcpAccountKeyChange}
            namePlaceholder="GCP Account Name"
            keyPlaceholder="Project ID"
            onCancel={() => {
              setIsGcpNewFieldVisible(false);
              setNewGcpFieldName("");
              setNewGcpAccountKey("");
            }}
            handleStorageAccountSave={handleGcpAccountSave}
          />
        )}

        {selectedGcpRowForDeletion && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            {/* <DeletionConfirmationPopup
              context={selectedGcpRowForDeletion}
              onCancel={handleCancelDelete}
              onConfirm={handleGcpAccountDelete}
            /> */}
             <UserDeleteConfirmationPopup
                          context={selectedGcpRowForDeletion}
                          onCancel={handleCancelDelete}
                          onConfirm={() =>
                            handleGcpAccountDelete(selectedGcpRowForDeletion.id)
                          }
                        />
          </div>
        )}
      </div>
    </div>
  );
};

export default GCPAccounts;