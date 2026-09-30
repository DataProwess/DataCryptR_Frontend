// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Link } from "react-router-dom";
// import authService from "../auth";
// import { API_URL } from "../ApiConfig";
// import DeletionConfirmationPopup from "./DeletionConfirmationPopup";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import NewFieldPopup from "../NewField";
// import { useAuth } from "../AuthContext";
// // import { useS3Account } from "../Context/S3AccountContext";
// import { secureApiCall } from "../csrfUtils";
// import "./admin.css";
// import { useUI } from "../Context/UIContext";

// const S3Accounts = ({ selectedOption }) => {
//     const {
//         setShowPreview,
//         showChatbot,
//         isDisabled,
//         isBlurred,
//       } = useUI();
//   const { token, csrfToken, permissions } = useAuth();
//   const [isS3NewFieldVisible, setIsS3NewFieldVisible] = useState(false);
//   const [selectedS3RowForDeletion, setSelectedS3RowForDeletion] =
//     useState(null);
//   // const [showChatbot, setShowChatbot] = useState(false);
//    const [loadingS3Accounts, setLoadingS3Accounts] = useState(false);
//   const [newS3AccountKey, setNewS3AccountKey] = useState("");
//   const [newS3FieldName, setNewS3FieldName] = useState("");
//   const [showS3AccountKey, setShowS3AccountKey] = useState(true);
//   const [s3AccountsData, setS3AccountsData] = useState([]);
//   const [selectedS3Account, setSelectedS3Account] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const isInteractionDisabled = showChatbot;


//   const fetchS3AccountData = async () => {
//     try {
//       if (!token) return;
  
//       setLoadingS3Accounts(true);
  
//       const response = await secureApiCall(
//         `${API_URL}/api/s3/accounts/`,
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
  
//       setS3AccountsData(response.data || []);
  
//       // 🛑 REMOVED AUTO-SELECTION CODE:
//       // Do NOT call setSelectedS3AccountId(response.data[0].id) here.
//       // Let the user manually select an account by clicking it.
  
//       console.log("🏦 S3 accounts:", response.data);
//     } catch (error) {
//       console.error("Error fetching S3 accounts:", error.message);
//     } finally {
//       setLoadingS3Accounts(false);
//     }
//   };

//    useEffect(() => {
//     // Check if the "DownloadConfigContainer" tab is active before making the API call
//     if (
//       selectedOption === "S3 Storage" 
//     ) {
//       fetchS3AccountData();
//     }
//     // eslint-disable-next-line
//   }, [token, selectedOption]);
  

  
//   const handleSave = () => {};

//   const handleTableSave = () => {};

//   // Close the deletion popup
// const handleCancelDelete = () => {
//   setSelectedS3RowForDeletion(null);
// };

// // Handle confirming the deletion
// const handleConfirmS3AccountDelete = async (accountId) => {
//   try {
//     // 1. Call your delete API endpoint using secureApiCall
//     const response = await secureApiCall(
//       `${API_URL}/api/s3/accounts/${accountId}/`,
//       "DELETE",
//       null,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       }
//     );

//     // 2. Remove the deleted account from state locally
//     setS3AccountsData((prevData) =>
//       prevData.filter((account) => account.id !== accountId)
//     );

//     console.log(`Account ${accountId} deleted successfully`);
//   } catch (error) {
//     console.error("Error deleting S3 account:", error.message);
//   } finally {
//     // 3. Close the modal
//     setSelectedS3RowForDeletion(null);
//   }
// };
//   const handleS3AccountSave = () => {};

//   const handleS3AccountChange = (index, field, value) => {
//     setS3AccountsData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = { ...newData[index], [field]: value };
//       return newData;
//     });
//   };

//   const handleRowClick = (container) => {
//     setSelectedS3Account(container);
//     // Trigger the checkbox click
//     const checkbox = document.getElementById(
//       `checkbox-${container.container_id}`,
//     );
//     if (checkbox) {
//       checkbox.click();
//     }
//   };
//   const handleS3AccountKeyChange = (e) => {
//     const accKey = e.target.value;
//     setNewS3AccountKey(accKey);
//   };

//   const handleS3AccountNameChange = (e) => {
//     const accName = e.target.value.toLowerCase();
//     setNewS3FieldName(accName);
//   };

//   const handleS3Refresh = () => {};

//   const toggleS3AccountKeyVisibility = (index) => {
//     setS3AccountsData((prevData) => {
//       const newData = [...prevData];
//       newData[index] = {
//         ...newData[index],
//         showActualKey: !newData[index].showActualKey,
//       };
//       return newData;
//     });
//   };

//   const handleCheckboxChange = (selectedContainer) => {
//     // Map through the container data and update the `is_download_storage` property
//     const updatedContainerData = s3AccountsData.map((container) => {
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
//     setS3AccountsData(updatedContainerData);
//   };

//   return (
//     <>
//    <div
//         className={`options-data-container layout-gap flex flex-col items-center 
//                         ${
//                           isInteractionDisabled || isDisabled || isBlurred
//                             ? " blur-effect pointer-events-none"
//                             : ""
//                         }`}
//       >
//      <div
//           className={`button-container flex flex-row   px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30`}
//         >
//         <button
//           className={`add-new-button flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 
//                           ${isInteractionDisabled ? "blur-effect" : ""} 
//                          `}
//           onClick={() => setIsS3NewFieldVisible(true)}
//           // style={{
//           //   height: "2rem",
//           //   maxWidth: "100%",
//           //   maxHeight: "100%",
//           //   overflow: "hidden",
//           // }}
//         >
//           Add New Field
//         </button>
//         <button
//            className={`w-20  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
//                         ${isInteractionDisabled || isDisabled || isBlurred ? "blur-effect" : ""} `}
//           onClick={handleTableSave}
//           // style={{
//           //   height: "2rem",
//           //   maxWidth: "100%",
//           //   maxHeight: "100%",
//           //   overflow: "hidden",
//           // }}
//         >
//           Save
//         </button>
//       </div>
//      <div className={`usergroup-data-container flex flex-col items-center `}>
//        <div className={`usergroup-data-header rounded-t-xl`}>
//           <table className="table-design table-fixed w-full ">
//             <colgroup>
//               <col className="w-[5%]" />
//               <col className="w-[25%]" />
//               <col className="w-[50%]" />
//               <col className="w-[20%]" />
//             </colgroup>
//             <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-t-lg">
//               <tr>
//                 <th className="py-3 sticky top-0 border border-none rounded-tl-lg"></th>
//                 <th className="py-3 sticky top-0 border border-l-0 border-r-0 text-xs text-white font-normal">
//                   S3 Account Name
//                 </th>
//                 <th className="py-3 sticky top-0 text-xs text-white font-normal">
//                   Access Key
//                 </th>
//                 <th className="py-3 sticky top-0 text-xs text-white font-normal rounded-tr-lg">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//           </table>
//         </div>
//          <div
//             className={`usergroup-tabular-data mt-2  flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
//           >
//             <div
//               className={`usergroup-tabular-rows py-1  overflow-auto `}
//               style={{ scrollbarWidth: "thin" }}
//             >
//             <table className="table-design table-fixed w-full">
//               <tbody className="sticky  mt-3">
//                 {loadingS3Accounts ? (
//                   <tr>
//                     <td
//                       colSpan="4"
//                       className="w-full h-full flex flex-col justify-center items-center space-y-6 mt-20"
//                     >
//                       <img
//                         src={`${process.env.PUBLIC_URL}/loadergif.gif`}
//                         alt="Loading..."
//                         className="animate-spin w-8 h-8"
//                       />
//                       <p className="text-logintext font-[350] text-[13px] animate-pulse">
//                         Just a moment...
//                       </p>
//                     </td>
//                   </tr>
//                 ) : (
                   
//                   s3AccountsData &&
//                   s3AccountsData.map((account, index) => (
                    
//                     <tr
//                       className=""
//                       key={account.id}
//                       onClick={() => handleRowClick(account)}
//                       style={{ cursor: "pointer" }}
//                       // className="border  border-l-0 border-r-0 border-lightgray-200 "
//                     >
//                       <td
//                         className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap 
//                           overflow-hidden accent-purpleshade1"
//                       >
//                         <input
//                           // className="admin-checkbox"
//                           type="checkbox"
//                           onChange={() => handleCheckboxChange(account)}
//                           // checked={selectedContainer === container}
//                           checked={account.is_download_storage}
//                           className="ml-2"
//                         />
//                       </td>
//                       <td className="w-[25%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
//                         <input
//                           type="text"
//                           value={account.name}
//                           onChange={(e) =>
//                             handleS3AccountChange(
//                               index,
//                               "name",
//                               e.target.value,
//                             )
//                           }
//                           // readOnly
//                         />
//                       </td>
//                       {/* <div className="w-full"> */}
//                       <td className="w-[50%]  text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden ">
//                         {showS3AccountKey ? (
//                           <React.Fragment>
//                             <input
//                               className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
//                               type="text"
//                               value={
//                                 account.showActualKey && account.aws_access_key_id
//                                   ? account.aws_access_key_id
//                                   : "*".repeat(
//                                       account.aws_access_key_id
//                                         ? account.aws_access_key_id.length
//                                         : 0,
//                                     )
//                               }
//                               onChange={(e) =>
//                                 handleS3AccountChange(
//                                   index,
//                                   "aws_access_key_id",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                             <button
//                               className="text-xs font-light  border-none"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 toggleS3AccountKeyVisibility(index);
//                               }}
//                             >
//                               {/* <FontAwesomeIcon icon={faEye} /> */}
//                               {account.showActualKey ? (
//                                 <FontAwesomeIcon icon={faEyeSlash} />
//                               ) : (
//                                 <FontAwesomeIcon icon={faEye} />
//                               )}
//                             </button>
//                           </React.Fragment>
//                         ) : (
//                           <React.Fragment>
//                             <input
//                               className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
//                               type="text"
//                               value={account.aws_access_key_id || ""}
//                               onChange={(e) =>
//                                 handleS3AccountChange(
//                                   index,
//                                   "aws_access_key_id",
//                                   e.target.value,
//                                 )
//                               }
//                             />
//                             <button
//                               className="text-xs font-light border-none"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 toggleS3AccountKeyVisibility(index);
//                               }}
//                             >
//                               <FontAwesomeIcon icon={faEyeSlash} />
//                             </button>
//                           </React.Fragment>
//                         )}
//                       </td>
//                       {/* </div> */}

//                       <td className="w-[20%] text-xs font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
//                         <div className="flex flex-row space-x-3">
//                           <button
//                             className="text-xs font-light border-none  w-14 items-center justify-center
//                                         rounded-md flex h-6 space-x-2"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleS3Refresh(account);
//                             }}
//                           >
//                             <img src="sync-icon.png" alt="sync" />
//                           </button>
//                           <button
//                             className="w-[20px] "
//                             onClick={(e) => {
//                               e.stopPropagation(); // Prevent row click when button is clicked
//                               setSelectedS3RowForDeletion(account);
//                             }}
//                           >
//                             <img
//                               src="icon-delete.png"
//                               alt="delete"
//                               className="w-4 h-4 rounded-lg"
//                             />

//                             {/* Delete */}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         {isS3NewFieldVisible && (
//           <NewFieldPopup
//             newFieldName={newS3FieldName}
//             setNewFieldName={setNewS3FieldName}
//             setNewAccountKey={setNewS3AccountKey}
//             newAccountKey={newS3AccountKey}
//             handleAccountNameChange={handleS3AccountNameChange}
//             handleAccountKeyChange={handleS3AccountKeyChange}
//             namePlaceholder="S3 Account Name"
//             keyPlaceholder="Access Key ID"
//             onCancel={() => {
//               setIsS3NewFieldVisible(false);
//               setNewS3FieldName("");
//               setNewS3AccountKey("");
//             }}
//             handleStorageAccountSave={handleS3AccountSave}
//           />
//         )}

//         {selectedS3RowForDeletion && (
//           <div className="absolute inset-0 flex justify-center z-20 items-center">
//             <DeletionConfirmationPopup
//               context={selectedS3RowForDeletion}
//               onCancel={handleCancelDelete}
//               onConfirm={() =>
//                 handleConfirmS3AccountDelete(selectedS3RowForDeletion.id)
//               }
//             />
//           </div>
//         )}
//       </div>
//     </div>
//     </>
//   );
// };

// export default S3Accounts;


import React, { useEffect, useState, useRef, useCallback} from "react";
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

const S3Accounts = ({ selectedOption }) => {
  const { setShowPreview, showChatbot, isDisabled, isBlurred } = useUI();
  const { token, csrfToken, permissions } = useAuth();

  const [isS3NewFieldVisible, setIsS3NewFieldVisible] = useState(false);
  const [selectedS3RowForDeletion, setSelectedS3RowForDeletion] = useState(null);
  const [loadingS3Accounts, setLoadingS3Accounts] = useState(false);
  const [newS3AccountKey, setNewS3AccountKey] = useState("");
  const [newS3FieldName, setNewS3FieldName] = useState("");
  const [s3AccountsData, setS3AccountsData] = useState([]);
  const [selectedS3Account, setSelectedS3Account] = useState(null);
  const [syncingAccountIds, setSyncingAccountIds] = useState(new Set());
  // Add these state declarations alongside your existing states
const [newS3AccountSecret, setNewS3AccountSecret] = useState("");
const [newS3Region, setNewS3Region] = useState("us-east-1");

  // Helper to extract CSRF token accurately
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
          ? `${API_URL}/api/s3/accounts/sync-status/?s3_account_id=${accountId}`
          : `${API_URL}/api/s3/accounts/sync-status/`;

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
            acc[item.id || item.s3_account_id] = item;
            return acc;
          }, {});

          setS3AccountsData((prevData) => {
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
        console.error("Error fetching S3 sync status:", error.message);
      }
    },
    [token]
  );

  // 2. Load S3 Accounts List
  const fetchS3AccountData = useCallback(async () => {
    try {
      if (!token) return;

      setLoadingS3Accounts(true);

      const response = await secureApiCall(
        `${API_URL}/api/s3/accounts/`,
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
        setS3AccountsData(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching S3 accounts:", error.message);
    } finally {
      setLoadingS3Accounts(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedOption === "S3 Storage" || selectedOption === "S3") {
      fetchS3AccountData();
    }
  }, [selectedOption, fetchS3AccountData]);

  const fetchSyncStatusRef = useRef(fetchSyncStatus);
  useEffect(() => {
    fetchSyncStatusRef.current = fetchSyncStatus;
  }, [fetchSyncStatus]);

  // 3. Controlled Polling (Polled only when account state strictly requires it)
  const hasActiveSync = s3AccountsData.some(
    (acc) => acc.sync_status === "IN_PROGRESS"
  );

  useEffect(() => {
    if (
      !hasActiveSync ||
      (selectedOption !== "S3 Storage" && selectedOption !== "S3")
    )
      return;

    const intervalId = setInterval(() => {
      fetchSyncStatusRef.current();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [hasActiveSync, selectedOption]);

  // 4. Trigger S3 Sync API Call
  const handleS3Refresh = async (account) => {
    // Block multiple simultaneous requests for the same account ID
    if (syncingAccountIds.has(account.id)) return;

    // Prevent trigger if account is already syncing on backend
    if (account.sync_status === "IN_PROGRESS") return;

    try {
      // Mark as syncing locally before network request
      setSyncingAccountIds((prev) => new Set(prev).add(account.id));

      const activeCsrfToken = getCsrfToken();

      const response = await secureApiCall(
        `${API_URL}/api/s3/accounts/sync/`,
        "POST",
        { s3_account_id: account.id },
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
        setS3AccountsData((prevData) =>
          prevData.map((acc) =>
            acc.id === account.id ? { ...acc, sync_status: "IN_PROGRESS" } : acc
          )
        );

        // Fetch immediate status update
        await fetchSyncStatus(account.id);
      }
    } catch (error) {
      console.error("Error triggering S3 sync:", error.message);

      // Revert status on failure so polling doesn't run indefinitely
      setS3AccountsData((prevData) =>
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
      setLoadingS3Accounts(true);
      const activeCsrfToken = getCsrfToken();

      const updatePromises = s3AccountsData.map(async (account) => {
        const payload = {
          name: account.name,
          aws_access_key_id: account.aws_access_key_id,
        };

        const res = await secureApiCall(
          `${API_URL}/api/s3/accounts/${account.id}/update/`,
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
      await fetchS3AccountData();
    } catch (error) {
      console.error("Error updating S3 accounts:", error.message);
    } finally {
      setLoadingS3Accounts(false);
    }
  };

  const handleS3AccountDelete = async () => {
    if (!selectedS3RowForDeletion?.id) return;

    try {
      setLoadingS3Accounts(true);
      const activeCsrfToken = getCsrfToken();

      const response = await secureApiCall(
        `${API_URL}/api/s3/accounts/${selectedS3RowForDeletion.id}/delete/`,
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
        setSelectedS3RowForDeletion(null);
        await fetchS3AccountData();
      }
    } catch (error) {
      console.error("Error deleting S3 account:", error.message);
    } finally {
      setLoadingS3Accounts(false);
    }
  };

  const handleCancelDelete = () => setSelectedS3RowForDeletion(null);
 const handleS3AccountSave = async () => {
  try {
    setLoadingS3Accounts?.(true);
    const activeCsrfToken = getCsrfToken();

    const payload = {
      s3_accounts: [
        {
          id: null,
          name: newS3FieldName,
          aws_access_key_id: newS3AccountKey,
          aws_secret_access_key: "dummy_secret_or_same_key", // Fallback string expected by backend
          region_name: "us-east-1",                          // Default AWS region
          is_download_storage: false,
        },
      ],
    };

    const res = await secureApiCall(
      `${API_URL}/api/s3/accounts/create/`,
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
      setNewS3FieldName("");
      setNewS3AccountKey("");
      setIsS3NewFieldVisible(false);

      if (typeof fetchS3AccountData === "function") {
        await fetchS3AccountData();
      }
    }
  } catch (error) {
    console.error("Error creating S3 account:", error.message);
  } finally {
    setLoadingS3Accounts?.(false);
  }
};



  const handleS3AccountChange = (index, field, value) => {
    setS3AccountsData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleRowClick = (account) => setSelectedS3Account(account);
  const handleS3AccountKeyChange = (e) => setNewS3AccountKey(e.target.value);
  const handleS3AccountNameChange = (e) =>
    setNewS3FieldName(e.target.value.toLowerCase());

  const toggleS3AccountKeyVisibility = (index) => {
    setS3AccountsData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        showActualKey: !newData[index].showActualKey,
      };
      return newData;
    });
  };

  const handleCheckboxChange = (selectedAccount) => {
    const updatedAccountData = s3AccountsData.map((account) => {
      if (account === selectedAccount) {
        return {
          ...account,
          is_download_storage: !account.is_download_storage,
        };
      } else {
        return { ...account, is_download_storage: false };
      }
    });

    setS3AccountsData(updatedAccountData);
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
    <div className="options-data-container layout-gap flex flex-col items-center">
      <div className="button-container flex flex-row px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30">
        <button
          className="add-new-button flex flex-row justify-center text-xs rounded-md cursor-pointer items-center font-medium text-white bg-purpleshade1"
          onClick={() => setIsS3NewFieldVisible(true)}
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
                  S3 Account
                </th>
                <th className="py-3 sticky top-0 text-xs text-white font-normal">
                  Access Key ID
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
                {loadingS3Accounts ? (
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
                  s3AccountsData &&
                  s3AccountsData.map((account, index) => {
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
                              handleS3AccountChange(
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
                                account.showActualKey &&
                                account.aws_access_key_id
                                  ? account.aws_access_key_id
                                  : "*".repeat(
                                      account.aws_access_key_id
                                        ? account.aws_access_key_id.length
                                        : 0
                                    )
                              }
                              onChange={(e) =>
                                handleS3AccountChange(
                                  index,
                                  "aws_access_key_id",
                                  e.target.value
                                )
                              }
                            />
                            <button
                              type="button"
                              className="text-xs font-light border-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleS3AccountKeyVisibility(index);
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
                                isSyncing ? "Syncing..." : "Trigger S3 Sync"
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleS3Refresh(account);
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
                                setSelectedS3RowForDeletion(account);
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

        {isS3NewFieldVisible && (
          <NewFieldPopup
            newFieldName={newS3FieldName}
            setNewFieldName={setNewS3FieldName}
            setNewAccountKey={setNewS3AccountKey}
            newAccountKey={newS3AccountKey}
            handleAccountNameChange={handleS3AccountNameChange}
            handleAccountKeyChange={handleS3AccountKeyChange}
            namePlaceholder="S3 Account Name"
            keyPlaceholder="Access Key ID"
            onCancel={() => {
              setIsS3NewFieldVisible(false);
              setNewS3FieldName("");
              setNewS3AccountKey("");
            }}
            handleStorageAccountSave={handleS3AccountSave}
          />
        )}

        {selectedS3RowForDeletion && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            {/* <DeletionConfirmationPopup
              context={selectedS3RowForDeletion}
              onCancel={handleCancelDelete}
              onConfirm={handleS3AccountDelete}
            /> */}
             <UserDeleteConfirmationPopup
                                      context={selectedS3RowForDeletion}
                                      onCancel={handleCancelDelete}
                                      onConfirm={() =>
                                        handleS3AccountDelete(selectedS3RowForDeletion.id)
                                      }
                                    />
          </div>
        )}
      </div>
    </div>
  );
};

export default S3Accounts;