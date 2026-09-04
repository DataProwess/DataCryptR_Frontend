import { useState, useEffect } from "react";
import { useUI } from "../Context/UIContext";
// import Navbar from "../Navbar";
import Navbar from "../Navbar/Navbar";
// import Sidebar from "../Sidebar";
import Sidebar from "../Sidebar/Sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Chatbot from "../Chatbot";
import { useAuth } from "../AuthContext";
import ErrorPopup from "../ErrorPopup";
import { API_URL } from "../ApiConfig";
import { apiRequest } from "../csrfUtils";
import ContainerOptionsModal from "./ContainerOptionsModal";
import S3BucketsData from "../S3BucketExplore/S3BucketsData";
import GCPBucketsData from "../GCPDataExplore/GCPBucketsData";
import "./containerdata.css";

const ContainerData = () => {
  const location = useLocation();
  const {
    isTimezoneModalOpen,
    showProfileModal,
    setIsTimezoneModalOpen,
    setShowProfileModal,
    showChatbot,
    setShowChatbot,
    isDisabled,
    isBlurred,
  } = useUI();
  const navigate = useNavigate();
  const { token, permissions, csrfToken, userEmail, authLoading } = useAuth();
  //   const [selectedOption, setSelectedOption] = useState("storageAccount");
  const [selectedOption, setSelectedOption] = useState(() => {
    if (location.state && location.state.activeTabFallback) {
      return location.state.activeTabFallback;
    }
    return "storageAccount"; // Global default when coming from Home/Sidebar directly
  });
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedStorageAccountName, setSelectedStorageAccountName] =
    useState();
  const [loadingStorageAccounts, setLoadingStorageAccounts] = useState(true);
  const [loadingFileShares, setLoadingFileShares] = useState(false);
  const [loadingS3Accounts, setLoadingS3Accounts] = useState(false);
  const [loadinggcpdata, setLoadinggcpdata] = useState(false);
  const [storageAccountOptions, setStorageAccountOptions] = useState([]);
  const [selectedStorageAccountId, setSelectedStorageAccountId] =
    useState(null);
  const [fileShareData, setFileShareData] = useState([]);
  const [s3AccountData, setS3AccountData] = useState([]);
  const [gcpData, setGcpData] = useState([]);
  const [selectedS3storageAccountId, setSelectedS3storageAccountId] =
    useState(null);
  const [showContainerOptions, setShowContainerOptions] = useState(false);
  const [showNoContainersPopup, setShowNoContainersPopup] = useState(false);
  const [containerOptions, setContainerOptions] = useState([]);
  const [error, setError] = useState("");
  const [selectedStorageAccount, setSelectedStorageAccount] = useState("");
  const [loading, setLoading] = useState(true);
  //   const [showChatbot, setShowChatbot] = useState(false);
  const [selectedS3AccountName, setSelectedS3AccountName] = useState([]);
  const [selectedS3AccountId, setSelectedS3AccountId] = useState(null);
  const [selectedgcpId, setSelectedgcpId] = useState(null);
  // Add these lines near the top of your component function
  const [selectedFileShareName, setSelectedFileShareName] = useState("");
  const [selectedGcpAccountName, setSelectedGcpAccountName] = useState("");

  useEffect(() => {
    // If we loaded with a router state override, scrub history cache smoothly
    if (location.state?.activeTabFallback) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Check if we arrived here via a back click passing fallback parameters
    if (location.state && location.state.activeTabFallback) {
      console.log(
        "🔄 Restoring active tab layout view to:",
        location.state.activeTabFallback,
      );
      setSelectedOption(location.state.activeTabFallback);

      /* Optional: Clear out history state references so standard 
         manually triggered page reloads maintain standard caching rules */
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchStorageAccountOptions = async () => {
    try {
      if (!token) return;
      setLoadingStorageAccounts(true);

      // const getCsrfTokenFromCookie = () => {
      //   const cookieValue = document.cookie
      //     .split("; ")
      //     .find((row) => row.startsWith("csrftoken="));
      //   return cookieValue ? cookieValue.split("=")[1] : null;
      // };

      // const csrfTokenId = getCsrfTokenFromCookie();

      const response = await apiRequest(
        `${API_URL}/api/admin/list-storage-accounts/`,
        "GET",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        },
      );

      if (!response) return;

      setLoadingStorageAccounts(false);

      // ✅ IMPORTANT: apiRequest already returns parsed JSON
      const storageAccountDetails = response;

      setStorageAccountOptions(storageAccountDetails.data);

      console.log("🏦 Available storage accounts:", storageAccountDetails.data);

      if (storageAccountDetails.data.length > 0) {
        //   setSelectedStorageAccountId(storageAccountDetails.data[0].id);
        // fetchContainerOptions(storageAccountDetails.data[0].id);
        setShowContainerOptions(true);

        // ❌ REMOVE OR COMMENT OUT THIS LINE:
        // setSelectedStorageAccountName(accountData[0].account_name);
      }
    } catch (error) {
      console.error("Error fetching storage accounts:", error.message);
    } finally {
      setLoadingStorageAccounts(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStorageAccountOptions();
    }
  }, [token]);
  console.log(
    "account_key (first account):",
    storageAccountOptions[0]?.account_key,
  );

  // 1. Derive the selected account object
  const selectedAccount = storageAccountOptions.find(
    (acc) => acc.id === selectedStorageAccountId,
  );

  // 2. Store the key in a variable
  const selectedAccountKey = selectedAccount?.account_key || "";

  // 3. Log it whenever the selection or options change
  useEffect(() => {
    if (selectedStorageAccountId) {
      console.log("Selected account ID:", selectedStorageAccountId);
      console.log("Selected Account Key:", selectedAccountKey);
    }
  }, [selectedStorageAccountId, selectedAccountKey]);

  useEffect(() => {}, [storageAccountOptions, selectedStorageAccountName]);

  const fetchContainerOptions = async (storageAccountId) => {
    try {
      if (!token) {
        return;
      }
      // ✅ SECURE - Using apiRequest utility
      const response = await apiRequest(
        `${API_URL}/api/blob/list_containers/`,
        "POST",
        {
          storage_account_id: storageAccountId,
        },
      );
      const data = response;
      console.log(
        "🔍 Available containers for storage account",
        storageAccountId,
        ":",
        data,
      );
      console.log(
        "📋 Container details for storage account",
        storageAccountId,
        ":",
      );
      data.forEach((container) => {
        console.log(
          `  - ID: ${container.id}, Name: ${container.name}, Storage: ${container.storage_account}, Last Modified: ${container.last_modified}`,
        );
      });
      if (data.length === 0) {
        setShowNoContainersPopup(true);
      } else {
        setShowNoContainersPopup(false);
      }
      setContainerOptions(data);
    } catch (error) {
      console.error("Error fetching containers:", error.message);
    }
  };

  const handleStorageAccountClick = (accountId) => {
    console.log("clicked storage account:", accountId);
    setSelectedStorageAccountId(accountId);

    const clickedAccount = storageAccountOptions.find(
      (account) => account.id === accountId,
    );

    if (clickedAccount) {
      // ✅ THIS STAYS HERE - It will now safely set the breadcrumb ONLY on click!
      setSelectedStorageAccountName(clickedAccount.account_name);
    }

    fetchContainerOptions(accountId);
    setShowContainerOptions(true);
  };
  console.log(selectedStorageAccountId);

  const fetchFileSharesData = async () => {
    try {
      setLoadingFileShares(true);
      // ✅ SECURE - Using apiRequest utility
      const responseData = await apiRequest(
        `${API_URL}/api/admin/list-file-shares/`,
        "GET",
        {},
      );
      if (responseData && responseData.data && responseData.data.length > 0) {
        setFileShareData(responseData.data);
      } else {
        setFileShareData([]); // Falls back to empty array
      }
      setLoadingFileShares(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setFileShareData([]);
    } finally {
      setLoadingFileShares(false); // Clean up loading state
    }
  };

  const handleFileShareClick = async (fileShare) => {
    let requestBody = {
      storage_account: selectedStorageAccount,
      pattern: "",
      folder_pattern: "",
      page_number: 1,
      page_size: 10,
      file_share_id: fileShare.id,
      sort_by: {
        sort_string: "creation_time",
        order_by: "des",
      },
    };

    const response = await fetch(`${API_URL}/api/blob/list_blobs/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const responseData = await response.json();
        if (responseData.error === "Access token has expired") {
          window.location.href = "/";
          return;
        }
      }
      if (response.status === 404) {
        console.error("Error: No data found.");
        setError(true);
        setLoading(false);
        return null;
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

    const data = await response.json();

    if (!data.blob_list.length && !data.folder_list.length) {
      setError("No Folders and Files Found");
      setIsPopupOpen(true);
    } else {
      navigate(`/files/${fileShare.id}`, {
        state: {
          fileShareId: fileShare.id,
          fileShareName: fileShare.name,
          selectedOption: selectedOption,
        },
      });
    }

    // Navigate to the appropriate route based on the fileShareId
  };

  // const fetchS3AccountData = async () => {
  //   try {
  //     if (!token) return;

  //     setLoadingS3Accounts(true);

  //     const response = await apiRequest(
  //       `${API_URL}/api/s3/accounts/`,
  //       "GET",
  //       null,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         credentials: "include",
  //       },
  //     );

  //     if (!response) return;

  //     setS3AccountData(response.data);

  //     if (response.data && response.data.length > 0) {
  //     setSelectedS3AccountId(response.data[0].id);
  //   }

  //     console.log("🏦 S3 accounts:", response.data);
  //   } catch (error) {
  //     console.error("Error fetching S3 accounts:", error.message);
  //   } finally {
  //     setLoadingS3Accounts(false);
  //   }
  // };

  const fetchS3AccountData = async () => {
    try {
      if (!token) return;

      setLoadingS3Accounts(true);

      const response = await apiRequest(
        `${API_URL}/api/s3/accounts/`,
        "GET",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );

      if (!response) return;

      setS3AccountData(response.data || []);

      // 🛑 REMOVED AUTO-SELECTION CODE:
      // Do NOT call setSelectedS3AccountId(response.data[0].id) here.
      // Let the user manually select an account by clicking it.

      console.log("🏦 S3 accounts:", response.data);
    } catch (error) {
      console.error("Error fetching S3 accounts:", error.message);
    } finally {
      setLoadingS3Accounts(false);
    }
  };

  const fetchGcpAccounts = async () => {
    try {
      if (!token) return;

      setLoadinggcpdata(true);

      const response = await apiRequest(
        `${API_URL}/api/gcp/accounts/`,
        "GET",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );

      // Ensure response exists and contains data
      const accounts = response?.data || [];
      setGcpData(accounts);

      // 🛑 FIX: Clear selected ID on fetch so no account is auto-selected
      setSelectedgcpId(null);
      const downloadAccount = accounts.find((acc) => acc.is_download_storage);

      console.log("🏦 GCP accounts:", accounts, downloadAccount);
      console.log(
        "All download statuses:",
        accounts.map((acc) => acc.is_download_storage),
      );
    } catch (error) {
      console.error("Error fetching GCP accounts:", error.message);
    } finally {
      setLoadinggcpdata(false);
    }
  };

  const renderFolderIcon = (accountId) => {
    if (accountId === selectedStorageAccountId) {
      return (
        <img
          src={process.env.PUBLIC_URL + "/purple-storage-icon.png"}
          alt="Closed Folder"
          className="w-4 h-4 mr-3"
        />
      );
    } else {
      return (
        <img
          src={process.env.PUBLIC_URL + "/graystorageaccount-icon.png"}
          alt="icon"
          className="w-4 h-4 mr-3"
        />
      );
    }
  };

  //   const handleTabClick = (option) => {
  //     setSelectedOption(option);

  //     // 🧹 Reset all Storage Account related states when changing tabs
  //     setSelectedStorageAccountId(null);
  //     setSelectedStorageAccountName("");
  //     setContainerOptions([]);
  //     setShowContainerOptions(false);

  //     if (option === "storageAccount") {
  //       fetchStorageAccountOptions();
  //     } else if (option === "fileShares") {
  //       fetchFileSharesData();
  //     } else if (option === "s3Storage") {
  //       fetchS3AccountData();
  //     } else if (option === "gcp") {
  //     }
  //   };

  // 1. Keep tab click simple (just state assignment)
  // const handleTabClick = (tabValue) => {
  //   setSelectedOption(tabValue);
  // };
  const handleTabClick = (tabValue) => {
    setSelectedOption(tabValue);

    // 🧹 Reset selected state so no account/bucket is active when changing tabs
    setSelectedS3storageAccountId(null); // Or setSelectedS3AccountId based on your parent state name
    setSelectedS3AccountName("");
    setSelectedStorageAccountId(null);
    setSelectedStorageAccountName("");
    setSelectedgcpId(null);
    setSelectedGcpAccountName("");
  };

  // 2. React to tab state changes automatically
  useEffect(() => {
    if (!selectedOption) return;

    console.log(
      `🚀 Automated Lifecycle trigger: Fetching data for ${selectedOption}`,
    );

    switch (selectedOption) {
      case "storageAccount":
        // Replace with your actual Azure Blobs fetching function name
        fetchStorageAccountOptions();
        break;

      case "fileShares":
        // Replace with your actual File Shares fetching function name
        fetchFileSharesData();
        break;

      case "s3Storage":
        // ✅ This will fire automatically when returning via back-click!
        // Replace with your actual S3 configuration/accounts fetching function name
        fetchS3AccountData();
        break;

      case "gcp":
        // Replace with your actual GCP fetching function name
        fetchGcpAccounts();
        break;

      default:
        break;
    }
  }, [selectedOption]); // Fires whenever selectedOption changes

  const handleS3AccountClick = (account) => {
    console.log("Selected S3 Account ID:", account.id, "Name:", account.name);

    // Updating these triggers a prop-change re-render for the child component
    setSelectedS3storageAccountId(account.id);
    setSelectedS3AccountName(account.name);
  };
  console.log(
    "i am",
    selectedS3storageAccountId,
    selectedS3AccountName,
    gcpData?.find((acc) => acc.id === selectedgcpId)?.is_download_storage ||
      false,
  );

  const handlegcpDataClick = (gcpaccount) => {
    console.log(
      "Selected gcp Account ID:",
      gcpaccount.id,
      "Name:",
      gcpaccount.name,
    );

    // Updating these triggers a prop-change re-render for the child component
    setSelectedgcpId(gcpaccount.id);
    setSelectedGcpAccountName(gcpaccount.name);
  };

  const handleChatbotIconClick = () => {
    setShowChatbot(!showChatbot); // Toggle the showChatbot state
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    setSelectedNavbarOption(null);
    setIsPopupOpen(false);
  };

  const getZoomScale = () => {
    const width = window.innerWidth;

    if (width >= 1600) return 1;
    if (width >= 1400) return 1;
    if (width >= 1200) return 1;
    if (width >= 1000) return 1;
    if (width >= 800) return 1;
    return 1;
  };

  // State to track scale dynamically on resize
  const [scale, setScale] = useState(getZoomScale());

  useEffect(() => {
    const handleResize = () => setScale(getZoomScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isInteractionDisabled = isPopupOpen || showChatbot;

  return (
    <>
      <div className="container-data">
        <div className="app-container-data bg-primary">
          <div className="w-full h-full flex flex-col items-center container-padding vertical-gap ">
            <div
              className={` container-navbar-wrapper  flex ${isDisabled || isBlurred || isInteractionDisabled ? "  pointer-events-none" : ""}`}
            >
              <Navbar />
            </div>
            <div className={`container-wrapper flex layout-gap`}>
              <div
                className={`container-Sidebar-wrapper
                                  ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <Sidebar />
              </div>
              <div
                className={`subcontainer-wrapper bg-newgray  padding rounded-lg shadow-xl shadow-slate-500/50 overflow-hidden sub-container-gap
                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <div
                  className={`container-back-dashboard flex items-center text-sm font-medium text-purpleshade1 `}
                >
                  <div>
                    <Link to="/home">Home</Link> &gt;&nbsp;
                  </div>
                  <span>
                    {(() => {
                      switch (selectedOption) {
                        case "storageAccount":
                          return "Storage Account";
                        case "fileShares":
                          return "File Shares";
                        case "s3Storage":
                          return "S3 Storage";
                        case "gcp":
                          return "GCP";
                        default:
                          return "Storage Platform"; // Fallback text
                      }
                    })()}
                  </span>
                  {/* Contextual Sub-Item: Check that it is a valid string with text */}
                  {selectedOption === "storageAccount" &&
                    typeof selectedStorageAccountName === "string" &&
                    selectedStorageAccountName.trim() && (
                      <span>&nbsp;&gt; {selectedStorageAccountName}</span>
                    )}

                  {selectedOption === "fileShares" &&
                    typeof selectedFileShareName === "string" &&
                    selectedFileShareName.trim() && (
                      <span>&nbsp;&gt; {selectedFileShareName}</span>
                    )}

                  {selectedOption === "s3Storage" &&
                    typeof selectedS3AccountName === "string" &&
                    selectedS3AccountName.trim() && (
                      <span>&nbsp;&gt; {selectedS3AccountName}</span>
                    )}

                  {selectedOption === "gcp" &&
                    typeof selectedGcpAccountName === "string" &&
                    selectedGcpAccountName.trim() && (
                      <span>&nbsp;&gt; {selectedGcpAccountName}</span>
                    )}
                </div>
                <div
                  className={`tab-container flex bg-white shadow-md rounded-lg p-1 overflow-hidden tab-margin-bottom`}
                >
                  {[
                    { label: "Storage Account", value: "storageAccount" },
                    { label: "File Shares", value: "fileShares" },
                    { label: "S3 Storage", value: "s3Storage" },
                    { label: "GCP", value: "gcp" },
                  ].map((tab) => (
                    <div
                      key={tab.value}
                      className={`flex-1 min-w-0 h-[40px] flex items-center justify-center cursor-pointer rounded-md 
                            text-[12px] sm:text-[14px] md:text-[15px] font-medium truncate select-none transition-colors
                            ${selectedOption === tab.value ? "bg-purpleshade1 text-white" : "bg-white text-black"}`}
                      onClick={() => handleTabClick(tab.value)}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>
                <div className={` containers-view flex  overflow-hidden`}>
                  <div
                    className={`container-accounts-wrapper options-wrapper-padding bg-newgray shadow-md shadow-slate-500/30 flex flex-col rounded-l-xl  items-center justify-center border-l-2 border-slate-200/100 z-10 `}
                  >
                    <div
                      className="w-full  h-full overflow-y-visible"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {/* Storage Accounts Loading / Mapping */}
                      {loadingStorageAccounts &&
                      selectedOption === "storageAccount" ? (
                        <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-4 mt-2 ml-2">
                          <img
                            src={process.env.PUBLIC_URL + "/loadergif.gif"}
                            alt="logo"
                            className="animate-spin w-6 h-6"
                          />
                          <p className="text-logintext font-[350] text-[11px] animate-pulse">
                            Just a moment...
                          </p>
                        </div>
                      ) : (
                        selectedOption === "storageAccount" &&
                        (storageAccountOptions.length === 0 ? (
                          <div className="w-full text-center py-4 text-xs font-normal text-slate-400 italic">
                            No Storage Account data found.
                          </div>
                        ) : (
                          storageAccountOptions.map((account) => (
                            <div
                              key={account.id}
                              className="flex flex-row w-full h-9 items-center font-normal text-xs cursor-pointer px-3 rounded-md transition-all duration-150 ease-in-out"
                              style={{
                                background:
                                  account.id === selectedStorageAccountId
                                    ? "white"
                                    : "transparent",
                                boxShadow:
                                  account.id === selectedStorageAccountId
                                    ? "0px 4px 10px rgba(0, 0, 0, 0.15)"
                                    : "none",
                              }}
                              onClick={() =>
                                handleStorageAccountClick(account.id)
                              }
                            >
                              {/* Folder Icon stays fixed shape */}
                              <div className="flex-shrink-0">
                                {renderFolderIcon(account.id)}
                              </div>

                              {/* Text container fills space and truncates safely with an ellipse (...) */}
                              <div className="truncate min-w-0 flex-1 select-none text-left">
                                {account.account_name}
                              </div>
                            </div>
                          ))
                        ))
                      )}

                      {/* File Shares Loading / Mapping */}
                      {loadingFileShares && selectedOption === "fileShares" ? (
                        <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-10">
                          <img
                            src={process.env.PUBLIC_URL + "/loadergif.gif"}
                            alt="logo"
                            className="animate-spin w-8 h-8"
                          />
                          <p className="text-logintext font-[350] text-[13px] animate-pulse">
                            Loading File Shares...
                          </p>
                        </div>
                      ) : (
                        selectedOption === "fileShares" &&
                        (fileShareData.length === 0 ? (
                          <div className="w-full text-center py-4 text-xs font-normal text-slate-400 italic">
                            No File Share data found.
                          </div>
                        ) : (
                          fileShareData.map((fileShare) => (
                            <div
                              key={fileShare.id}
                              className="flex flex-row w-full h-9 items-center font-normal text-xs cursor-pointer px-3 rounded-md transition-all duration-150 ease-in-out"
                              onClick={() => handleFileShareClick(fileShare)}
                            >
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/graystorageaccount-icon.png"
                                }
                                alt="icon"
                                className="w-4 h-4 mr-3"
                              />
                              {fileShare.name}
                            </div>
                          ))
                        ))
                      )}

                      {/* S3 Storage Loading / Mapping */}
                      {loadingS3Accounts && selectedOption === "s3Storage" ? (
                        <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-4 mt-2 ml-2">
                          <img
                            src={process.env.PUBLIC_URL + "/loadergif.gif"}
                            alt="logo"
                            className="animate-spin w-6 h-6"
                          />
                          <p className="text-logintext font-[350] text-[11px] animate-pulse">
                            Just a moment...
                          </p>
                        </div>
                      ) : (
                        selectedOption === "s3Storage" &&
                        (s3AccountData.length === 0 ? (
                          <div className="w-full text-center py-4 text-xs font-normal text-slate-400 italic">
                            No S3 data found.
                          </div>
                        ) : (
                          s3AccountData.map((account) => (
                            <div
                              key={account.id}
                              className="flex flex-row w-full h-9 items-center font-normal text-xs cursor-pointer px-3 rounded-md transition-all duration-150 ease-in-out"
                              style={{
                                background:
                                  account.id === selectedS3storageAccountId
                                    ? "white"
                                    : "transparent",
                                boxShadow:
                                  account.id === selectedS3storageAccountId
                                    ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
                                    : "none",
                              }}
                              onClick={() => handleS3AccountClick(account)}
                            >
                              {renderFolderIcon(account.id)}
                              <div className="truncate min-w-0 flex-1 select-none text-left">
                                {account.name}
                              </div>
                            </div>
                          ))
                        ))
                      )}
                      {loadinggcpdata && selectedOption === "gcp" ? (
                        <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-4 mt-2 ml-2">
                          <img
                            src={process.env.PUBLIC_URL + "/loadergif.gif"}
                            alt="logo"
                            className="animate-spin w-6 h-6"
                          />
                          <p className="text-logintext font-[350] text-[11px] animate-pulse">
                            Just a moment...
                          </p>
                        </div>
                      ) : (
                        selectedOption === "gcp" &&
                        (gcpData.length === 0 ? (
                          <div className="w-full text-center py-4 text-xs font-normal text-slate-400 italic">
                            No GCP data found.
                          </div>
                        ) : (
                          gcpData.map((account) => (
                            <div
                              key={account.id}
                              className="flex flex-row w-full h-9 items-center font-normal text-xs cursor-pointer px-3 rounded-md transition-all duration-150 ease-in-out"
                              style={{
                                background:
                                  account.id === selectedgcpId
                                    ? "white"
                                    : "transparent",
                                boxShadow:
                                  account.id === selectedgcpId
                                    ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
                                    : "none",
                              }}
                              onClick={() => handlegcpDataClick(account)}
                            >
                              {renderFolderIcon(account.id)}
                              <div className="truncate min-w-0 flex-1 select-none text-left">
                                {account.name}
                              </div>
                            </div>
                          ))
                        ))
                      )}
                    </div>
                  </div>
                  <div
                    className={`container-data-wrapper bg-white rounded-r-xl shadow-md shadow-slate-500/30 flex flex-col justify-center items-center `}
                  >
                    <div className="w-full h-full flex justify-center items-center">
                      {/* <div className="w-full h-9 bg-white rounded-lg shadow-md border-t border-slate-200/70"> */}
                      {selectedOption === "storageAccount" && (
                        <ContainerOptionsModal
                          className={`${
                            showChatbot ? "admin-blur-effect" : ""
                          }`}
                          containerOptions={containerOptions}
                          //  selectedStorageAccount={storageAccountOptions.account_name}
                          selectedStorageAccount={selectedStorageAccountName}
                          selectedOption={selectedOption}
                          fileShareData={fileShareData}
                          isDownloadStorage={
                            storageAccountOptions?.find(
                              (acc) => acc.id === selectedStorageAccountId,
                            )?.is_download_storage || false
                          }
                          selectedStorageAccountId={selectedStorageAccountId}
                          selectedAccountKey={selectedAccountKey}
                        />
                      )}
                      {selectedOption === "s3Storage" && (
                        <S3BucketsData
                          selectedOption={selectedOption}
                          selectedS3storageAccountId={
                            selectedS3storageAccountId
                          }
                          selectedS3AccountName={selectedS3AccountName}
                          isDownloadStorage={
                            s3AccountData?.find(
                              (acc) => acc.id === selectedS3storageAccountId,
                            )?.is_download_storage || false
                          }
                        />
                      )}
                      {selectedOption === "gcp" && (
                        <GCPBucketsData
                          selectedgcpId={selectedgcpId}
                          selectedGcpAccountName={selectedGcpAccountName}
                          selectedOption={selectedOption}
                          isDownloadStorage={
                            gcpData?.find((acc) => acc.id === selectedgcpId)
                              ?.is_download_storage || false
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="h-screen w-screen bg-primary overflow-hidden">
        <div className="w-full h-full flex flex-col items-center px-3 py-3 gap-1">
          {/* Navbar Configuration */}
          <div
            className={`flex items-center justify-center w-[98vw] h-[10vh]
                     ${isDisabled || isBlurred ? "pointer-events-none" : ""}`}
          >
            <Navbar />
          </div>
          {/* SideBar + Main Content (GREEN CONTAINER) */}
          <div className="flex-1 flex flex-row w-full h-[88vh] gap-2 overflow-hidden">
            {/* SideBar Wrapper - Given specific width padding room to breathe */}
            <div
              className={`w-[6vw] min-w-[80px] max-w-[100px] h-full flex-shrink-0 py-1 ${isDisabled || isBlurred ? "pointer-events-none" : ""}`}
            >
              {/* Inner Sidebar Card - This handles the background color, rounding, and shadow */}
              <div className="w-full h-full bg-white rounded-lg shadow-lg shadow-slate-400/50 flex items-center justify-center py-4">
                <Sidebar />
              </div>
            </div>
            {/* SCALE WRAPPER - Centered container that takes remaining width */}
            <div
              className={`flex-1 h-full flex items-center justify-center p-1.5 ${isDisabled || isBlurred ? "pointer-events-none" : ""}`}
            >
              {/* SCALE CONTAINER 
                  Using inverse width/height properties ensures that the element scales 
                  but doesn't leave trailing dead margins in your layout.
              */}
              <div
                className="origin-center transition-transform relative"
                style={{
                  transform: `scale(${scale})`,
                  width: `${100 / scale}%`,
                  height: `${100 / scale}%`,
                }}
              >
                {/* Main Content Card */}
                <div className="w-full h-full flex flex-col rounded-lg gap-2 bg-newgray shadow-lg shadow-slate-500/50 py-3 px-5">
                  <div className="w-full h-[98%] flex flex-col gap-2">
                    {/* Breadcrumbs */}
                    <div className="w-full h-[4vh] flex items-center text-sm font-medium text-purpleshade1">
                      <div>
                        <Link to="/home">Home</Link> &gt;&nbsp;
                      </div>
                      {/* {selectedOption === "storageAccount"
                        ? "Storage Account"
                        : "File Share Data"}
                      {selectedOption === "storageAccount" &&
                        selectedStorageAccountName && (
                          <span>&gt; {selectedStorageAccountName}</span>
                        )} */}

                      <span>
                        {(() => {
                          switch (selectedOption) {
                            case "storageAccount":
                              return "Storage Account";
                            case "fileShares":
                              return "File Shares";
                            case "s3Storage":
                              return "S3 Storage";
                            case "gcp":
                              return "GCP";
                            default:
                              return "Storage Platform"; // Fallback text
                          }
                        })()}
                      </span>

                      {/* Contextual Sub-Item: Check that it is a valid string with text */}
                      {selectedOption === "storageAccount" &&
                        typeof selectedStorageAccountName === "string" &&
                        selectedStorageAccountName.trim() && (
                          <span>&nbsp;&gt; {selectedStorageAccountName}</span>
                        )}

                      {selectedOption === "fileShares" &&
                        typeof selectedFileShareName === "string" &&
                        selectedFileShareName.trim() && (
                          <span>&nbsp;&gt; {selectedFileShareName}</span>
                        )}

                      {selectedOption === "s3Storage" &&
                        typeof selectedS3AccountName === "string" &&
                        selectedS3AccountName.trim() && (
                          <span>&nbsp;&gt; {selectedS3AccountName}</span>
                        )}

                      {selectedOption === "gcp" &&
                        typeof selectedGcpAccountName === "string" &&
                        selectedGcpAccountName.trim() && (
                          <span>&nbsp;&gt; {selectedGcpAccountName}</span>
                        )}
                    </div>

                    {/* Tab Selection */}
                    <div className="w-full max-w-full sm:max-w-[650px] flex bg-white shadow-md rounded-lg p-1 overflow-hidden">
                      {[
                        { label: "Storage Account", value: "storageAccount" },
                        { label: "File Shares", value: "fileShares" },
                        { label: "S3 Storage", value: "s3Storage" },
                        { label: "GCP", value: "gcp" },
                      ].map((tab) => (
                        <div
                          key={tab.value}
                          className={`flex-1 min-w-0 h-[40px] flex items-center justify-center cursor-pointer rounded-md 
                            text-[12px] sm:text-[14px] md:text-[15px] font-medium truncate select-none transition-colors
                            ${selectedOption === tab.value ? "bg-purpleshade1 text-white" : "bg-white text-black"}`}
                          onClick={() => handleTabClick(tab.value)}
                        >
                          {tab.label}
                        </div>
                      ))}
                    </div>

                    {/* Split View Content Area */}
                    <div className="w-full flex-1 flex flex-row  overflow-hidden">
                      {/* Left Sidebar Menu List */}
                      <div className="w-[20vw] min-w-[160px] max-w-[280px] h-[93%] bg-newgray shadow-md shadow-slate-500/30 flex flex-col rounded-l-xl  items-center justify-center border-l-2 border-slate-200/100 z-10 p-2">
                        <div
                          className="w-full  h-full overflow-y-visible"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          {/* Storage Accounts Loading / Mapping */}
                          {loadingStorageAccounts &&
                          selectedOption === "storageAccount" ? (
                            <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-4 mt-2 ml-2">
                              <img
                                src={process.env.PUBLIC_URL + "/loadergif.gif"}
                                alt="logo"
                                className="animate-spin w-6 h-6"
                              />
                              <p className="text-logintext font-[350] text-[11px] animate-pulse">
                                Just a moment...
                              </p>
                            </div>
                          ) : (
                            selectedOption === "storageAccount" &&
                            storageAccountOptions.map((account) => (
                              <div
                                key={account.id}
                                className="flex flex-row w-full h-9 items-center font-normal text-xs cursor-pointer px-3 rounded-md transition-all duration-150 ease-in-out"
                                style={{
                                  background:
                                    account.id === selectedStorageAccountId
                                      ? "white"
                                      : "transparent",
                                  boxShadow:
                                    account.id === selectedStorageAccountId
                                      ? "0px 4px 10px rgba(0, 0, 0, 0.15)"
                                      : "none",
                                }}
                                onClick={() =>
                                  handleStorageAccountClick(account.id)
                                }
                              >
                                {/* Folder Icon stays fixed shape */}
                                <div className="flex-shrink-0">
                                  {renderFolderIcon(account.id)}
                                </div>

                                {/* Text container fills space and truncates safely with an ellipse (...) */}
                                <div className="truncate min-w-0 flex-1 select-none text-left">
                                  {account.account_name}
                                </div>
                              </div>
                            ))
                          )}

                          {/* File Shares Loading / Mapping */}
                          {loadingFileShares &&
                          selectedOption === "fileShares" ? (
                            <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-10">
                              <img
                                src={process.env.PUBLIC_URL + "/loadergif.gif"}
                                alt="logo"
                                className="animate-spin w-8 h-8"
                              />
                              <p className="text-logintext font-[350] text-[13px] animate-pulse">
                                Loading File Shares...
                              </p>
                            </div>
                          ) : (
                            selectedOption === "fileShares" &&
                            (fileShareData.length === 0 ? (
                              <div className="w-full text-center py-4 text-xs font-normal text-slate-400 italic">
                                No File Share data found.
                              </div>
                            ) : (
                              fileShareData.map((fileShare) => (
                                <div
                                  key={fileShare.id}
                                  className="flex flex-row w-[200px] h-6 items-center text-black font-normal text-xs cursor-pointer p-2 rounded-lg"
                                  onClick={() =>
                                    handleFileShareClick(fileShare)
                                  }
                                >
                                  <img
                                    src={
                                      process.env.PUBLIC_URL +
                                      "/graystorageaccount-icon.png"
                                    }
                                    alt="icon"
                                    className="w-4 h-4 mr-3"
                                  />
                                  {fileShare.name}
                                </div>
                              ))
                            ))
                          )}

                          {/* S3 Storage Loading / Mapping */}
                          {loadingS3Accounts &&
                          selectedOption === "s3Storage" ? (
                            <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-4 mt-2 ml-2">
                              <img
                                src={process.env.PUBLIC_URL + "/loadergif.gif"}
                                alt="logo"
                                className="animate-spin w-6 h-6"
                              />
                              <p className="text-logintext font-[350] text-[11px] animate-pulse">
                                Just a moment...
                              </p>
                            </div>
                          ) : (
                            selectedOption === "s3Storage" &&
                            s3AccountData.map((account) => (
                              <div
                                key={account.id}
                                className="flex flex-row w-full h-9 items-center font-normal text-xs cursor-pointer px-3 rounded-md transition-all duration-150 ease-in-out"
                                style={{
                                  background:
                                    account.id === selectedStorageAccountId
                                      ? "white"
                                      : "transparent",
                                  boxShadow:
                                    account.id === selectedStorageAccountId
                                      ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
                                      : "none",
                                }}
                                onClick={() => handleS3AccountClick(account)}
                              >
                                {renderFolderIcon(account.id)}
                                <div className="truncate min-w-0 flex-1 select-none text-left">
                                  {account.name}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right Workspace Window */}
                      <div className="flex-1 h-[93%] bg-white rounded-r-xl shadow-md shadow-slate-500/30 flex flex-col justify-center items-center ">
                        {/* Dynamic content changes go here */}
                        <div className="w-full h-full flex justify-center items-center">
                          {/* <div className="w-full h-9 bg-white rounded-lg shadow-md border-t border-slate-200/70"> */}
                          {selectedOption === "storageAccount" && (
                            <ContainerOptionsModal
                              className={`${
                                showChatbot ? "admin-blur-effect" : ""
                              }`}
                              containerOptions={containerOptions}
                              //  selectedStorageAccount={storageAccountOptions.account_name}
                              selectedStorageAccount={
                                selectedStorageAccountName
                              }
                              selectedOption={selectedOption}
                              fileShareData={fileShareData}
                            />
                          )}
                          {selectedOption === "s3Storage" && (
                            <S3BucketsData
                              selectedS3AccountId={selectedStorageAccountId}
                              selectedS3AccountName={selectedS3AccountName}
                              selectedOption={selectedOption}
                            />
                          )}
                        </div>
                        {/* </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>{" "}
              {/* End of Scale Container */}
            </div>{" "}
            {/* End of Scale Wrapper */}
          </div>{" "}
          {/* End of Green Container */}
        </div>
      </div>

      <div
        className={`fixed z-[9999] ${isDisabled || isBlurred ? "pointer-events-none" : ""} `}
        style={{
          right: "20px",
          bottom: "20px",
        }}
      >
        <img
          src={process.env.PUBLIC_URL + "/chat-icon.png"}
          alt="Chat Icon"
          className="w-12 h-12 cursor-pointer animate-floating"
          onClick={handleChatbotIconClick}
        />
      </div>
      {showChatbot && (
        <Chatbot
          isOpen={showChatbot}
          onClose={handleCloseChatbot} // Pass handleCloseChatbot to Chatbot
        />
      )}

      <ErrorPopup
        isOpen={isPopupOpen}
        message={error}
        onClose={handleCloseChatbot}
      />
    </>
  );
};

export default ContainerData;
