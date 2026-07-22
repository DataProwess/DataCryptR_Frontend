import React, { useState, useEffect } from "react";
import "./style.css";
import "./folder.css";
import authService from "./auth";
import "react-toastify/dist/ReactToastify.css";
import "./toaststyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Mnavbar from "./Navbar";
import ContainerOptionsModal from "./ContainerData/ContainerOptionsModal";
import { API_URL } from "./ApiConfig";
import Chatbot from "./Chatbot";
import ProfileModal from "./ProfileModal";
import TimezoneModal from "./TimeZoneModal";
import './sidebar.css'
import ErrorPopup from "./ErrorPopup";
import { apiRequest } from "./csrfUtils";
import { method } from "lodash";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const NewContainerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // const selectedOption = queryParams.get("selectedOption");
  // const fileShareName = queryParams.get("fileShareName");
 
  const [loadingStorageAccounts, setLoadingStorageAccounts] = useState(true);
  const [loadingFileShares, setLoadingFileShares] = useState(false);
  const [loadingS3Accounts,setLoadingS3Accounts] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false);
  const [s3AccountData,setS3AccountData] = useState()
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  // eslint-disable-next-line
  const [isStorageAccountSelected, setIsStorageAccountSelected] =
    useState(false);
  const [token, setToken] = useState(null);
  // eslint-disable-next-line
  const [userGroups, setUserGroups] = useState([]);
  // const [isMasked, setIsMasked] = useState(true);
  // eslint-disable-next-line
  const [isMasked, setIsMasked] = useState(
    localStorage.getItem("isMasked") === "true" || true
  );
  const [fileShareName, setFileShareName] = useState("");
  const [selectedStorageAccount, setSelectedStorageAccount] = useState("");
  const [containerOptions, setContainerOptions] = useState([]);
 
  // eslint-disable-next-line
  const [csrfToken, setCsrfToken] = useState(null);
  // eslint-disable-next-line
  const [userEmail, setUserEmail] = useState("");
  const [selectedOption, setSelectedOption] = useState("storageAccount");
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  // eslint-disable-next-line
  const [storageAccountOptions, setStorageAccountOptions] = useState([]);
  // eslint-disable-next-line
  const [selectedStorageAccountId, setSelectedStorageAccountId] =
    useState(null);
  const [fileShareData, setFileShareData] = useState([]);
  const [selectedStorageAccountName, setSelectedStorageAccountName] =
    useState("");
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  // eslint-disable-next-line
  const [showContainerOptions, setShowContainerOptions] = useState(false);
  const [showNoContainersPopup, setShowNoContainersPopup] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
 // eslint-disable-next-line
  const [timezoneOptions, setTimezoneOptions] = useState([
    { label: "Time Zone", value: null },
    { label: "UTC", value: "UTC" },
    { label: "Australia/Sydney", value: "Australia/Sydney" },
    // Add other timezones here
  ]);
  // eslint-disable-next-line
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  // eslint-disable-next-line
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [error, setError] = useState("")
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Call handleResize once to set the initial height and width
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  useEffect(() => {
    localStorage.setItem("isMasked", isMasked);
  }, [isMasked]);

  useEffect(() => {
    // Fetch container options on component mount
    const getCsrfTokenFromCookie = () => {
      const cookieArray = document.cookie.split(";");
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
          setCsrfToken(decodeURIComponent(value));
        }
      }
    };

    // Get CSRF token
    getCsrfTokenFromCookie();
    fetchStorageAccountOptions();
    // fetchContainerOptions(accountId);
    // eslint-disable-next-line
  }, [token]);

  /*The fetchToken function is wrapped inside a useEffect hook  to ensure it's called when the component mounts.
  A try block is used to catch and handle any errors that may occur during the execution of the code within this block
  The function calls authService.getToken() to fetch the token,The resolved value is stored in the fetchedToken variable.
  the function calls authService.getUserGroup() to fetch the user group information ,the value is stored in the userGroup variable.
  The token and email are extracted from the parsed object.The extracted email is set into a state variable using setUserEmail.
  The extracted token and retrieved userGroup are set into a state variable using setToken setUserGroups respectively.*/

  useEffect(() => {
    // Fetch the token and set it in the state
    const fetchToken = async () => {
      try {
        const fetchedToken = await authService.getToken();
        const userGroup = await authService.getUserGroup();
        const dataObject = JSON.parse(fetchedToken);

        // Access the token property from the data object
        const token = dataObject.data.token;
        const email = dataObject.data.email;
        setUserEmail(email);
        setToken(token);
        setUserGroups(userGroup);
        setUserEmail(email);
        const csrfToken = authService.getCsrfToken();
        setCsrfToken(csrfToken)
      } catch (error) {
        console.error("Token error:", error);
      }
    };
    // Call the fetchToken function
    fetchToken();
  }, []);

  useEffect(() => {
    // Simulating data loading with setTimeout
    const timeout = setTimeout(() => {
      setLoading(false); // Set loading to false after 1000ms (1 second)
      setLoadingFileShares(false);
      setLoadingFileShares(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleZoomChange = (event) => {
      if (event.ctrlKey) {
        event.preventDefault(); // Prevent default browser zoom behavior

        if (event.code === "Equal" || event.code === "NumpadAdd") {
          // Zoom in by 10% when Ctrl+"=" or Ctrl+"+" is pressed
          if (zoomLevel < 150) {
            setZoomLevel((prevZoom) => Math.min(prevZoom + 10, 150));
            setShowZoomPopup(true); // Show zoom popup on zoom in
          }
        } else if (event.code === "Minus" || event.code === "NumpadSubtract") {
          // Zoom out by 10% when Ctrl+"-" or Ctrl+"-" is pressed
          if (zoomLevel > 50) {
            setZoomLevel((prevZoom) => Math.max(prevZoom - 10, 100));
            setShowZoomPopup(true); // Show zoom popup on zoom out
          }
        }
      }
    };

    window.addEventListener("keydown", handleZoomChange);

    return () => {
      window.removeEventListener("keydown", handleZoomChange);
    };
  }, [zoomLevel]);

  useEffect(() => {
    // Hide the zoom popup after 2 seconds
    const timer = setTimeout(() => {
      setShowZoomPopup(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showZoomPopup]);

  /*The fetchStorageAccountOptions function fetches a list of storage accounts from an API and updates 
  the application state with the fetched data. It handles cases where the access token has expired by 
  redirecting the user to the login page. The setStorageAccountOptions function is called to update the 
  state with the fetched storage account data. If a callback function is provided, it is called with the 
  name of the first storage account.Any errors that occur during the API call or response handling are caught 
  in the catch block and logged to the console. */

  // const fetchStorageAccountOptions = async (callback) => {
  //   // authService.handleTokenExpiration();

  //   // const token = await authService.getToken();
   

  //   try {
  //     if (!token) {
  //       // console.error("Token is not available.");
  //       // navigate("/")
  //       return;
  //     }

  //     function getCsrfTokenFromCookie() {
  //       const cookieValue = document.cookie
  //         .split("; ")
  //         .find(row => row.startsWith("csrftoken=")); // 'csrftoken' is Django's default name
  //       return cookieValue ? cookieValue.split("=")[1] : null;
  //     }

  //     const csrfTokenId = getCsrfTokenFromCookie();

  //     const response = await fetch(
  //       `${API_URL}/api/admin/list-storage-accounts/`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //           "X-CSRFToken": csrfTokenId,
  //         },
  //         credentials: 'include',
  //       }
  //     );

  //     // if (!response.ok) {
  //     //   throw new Error(`HTTP error! Status: ${response.status}`);
  //     // }
  //     if (!response.ok) {
  //       if (response.status === 401) {
  //         const responseData = await response.json();
  //         if (responseData.error === "Access token has expired") {
  //           window.location.href = "/";
  //           return;
  //         }
  //       }
  //     }
  //     setLoadingStorageAccounts(false);

  //     const storageAccountDetails = await response.json();
      

  //     setStorageAccountOptions(storageAccountDetails.data);
  //     console.log("🏦 Available storage accounts:", storageAccountDetails.data);
  //     storageAccountDetails.data.forEach(account => {
  //       console.log(`  - ID: ${account.id}, Name: ${account.account_name}, Account Key: ${account.account_key ? '***' : 'Not set'}`);
  //     });

  //     // Assuming you want to set the name of the first storage account as an example
  //     if (storageAccountDetails.data.length > 0) {
  //       setSelectedStorageAccountName(storageAccountDetails.data.account_name);
  //       if (callback && typeof callback === "function") {
  //         callback(storageAccountDetails.data[0].account_name);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching storage accounts:", error.message);
  //   }
  // };

  const fetchStorageAccountOptions = async () => {
  try {
    if (!token) return;

    const getCsrfTokenFromCookie = () => {
      const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));
      return cookieValue ? cookieValue.split("=")[1] : null;
    };

    const csrfTokenId = getCsrfTokenFromCookie();

    const response = await apiRequest(
      `${API_URL}/api/admin/list-storage-accounts/`,
      "GET",
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfTokenId,
        },
        credentials: "include",
      }
    );

    if (!response) return;

    setLoadingStorageAccounts(false);

    // ✅ IMPORTANT: apiRequest already returns parsed JSON
    const storageAccountDetails = response;

    setStorageAccountOptions(storageAccountDetails.data);

    console.log("🏦 Available storage accounts:", storageAccountDetails.data);

    if (storageAccountDetails.data.length > 0) {
      setSelectedStorageAccountName(
        storageAccountDetails.data[0].account_name // ❗ FIXED
      );
    }

  } catch (error) {
    console.error("Error fetching storage accounts:", error.message);
  }
};

  // useEffect(() => {
  
  // }, [storageAccountOptions, selectedStorageAccountName]);

  /* The fetchContainerOptions function is designed to fetch a list of containers from an API based on the provided storage account ID. 
  If the response is successful, the function parses the JSON response.It checks if the fetched data array is empty. 
  If it is, the function sets a state variable to show a popup indicating that no containers were found. Otherwise, it hides the popup.
  The function updates the state variable setContainerOptions with the fetched container data.If any errors occur during the API call or response handling, 
  they are caught and logged to the console.   */

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
        }
      );
      const data = response;
      console.log("🔍 Available containers for storage account", storageAccountId, ":", data);
      console.log("📋 Container details for storage account", storageAccountId, ":");
      data.forEach(container => {
        console.log(`  - ID: ${container.id}, Name: ${container.name}, Storage: ${container.storage_account}, Last Modified: ${container.last_modified}`);
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

  const fetchFileSharesData = async () => {
    try {
      // ✅ SECURE - Using apiRequest utility
      const responseData = await apiRequest(
        `${API_URL}/api/admin/list-file-shares/`,
        "GET",
        {}
      );
      if (responseData && responseData.data) {
        setFileShareData(responseData.data);
      } else {
        setFileShareData([]);
      }
      setLoadingFileShares(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setLoadingFileShares(false);
    }
  };

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
      }
    );

    if (!response) return;

    setS3AccountData(response.data);

    console.log("🏦 S3 accounts:", response.data);

  } catch (error) {
    console.error("Error fetching S3 accounts:", error.message);
  } finally {
    setLoadingS3Accounts(false);
  }
};

  // useEffect(() => {
  //   // Log the full window location
   

  //   // Access the search string directly from the window object
  //   const searchParams = new URLSearchParams(location.search);


  //   const option = searchParams.get("selectedOption");
  //   const fileShare = searchParams.get("fileShareName");
  //   const storageAccount = searchParams.get("selectedStorageAccount");
  //   if (option === "fileShares") {
   
  //     setSelectedOption("fileShares");
  //     setFileShareName(fileShare);
  //     fetchFileSharesData(fileShare);
  //   } else {
    
  //     setSelectedOption("storageAccount");
  //     setSelectedStorageAccount(storageAccount);
  //     fetchStorageAccountOptions(storageAccount);
  //   }
  //    // eslint-disable-next-line
  // }, [location.search]);


  useEffect(() => {
  const searchParams = new URLSearchParams(location.search);

  const option = searchParams.get("selectedOption");
  const fileShare = searchParams.get("fileShareName");
  const storageAccount = searchParams.get("selectedStorageAccount");

  if (option === "fileShares") {
    setSelectedOption("fileShares");
    setFileShareName(fileShare);
  } else {
    setSelectedOption("storageAccount");
    setSelectedStorageAccount(storageAccount);
  }
}, [location.search]);

  useEffect(() => {
    if (selectedOption === "fileShares") {
      fetchFileSharesData();
    } else {
      fetchStorageAccountOptions();
    }
     // eslint-disable-next-line
  }, [selectedOption, fileShareName]);

  const handleTabClick = (option) => {
    setSelectedOption(option);

    if (option === "storageAccount") {
      setSelectedStorageAccountId(null); // Unselect the storage account
      setSelectedStorageAccountName(""); // Clear the selected storage account name
      fetchStorageAccountOptions();
    } else if (option === "fileShares") {
      // setSelectedFileShareAccountId(null); // Unselect the file share account
      fetchFileSharesData();
    }
    else if (option === "S3 Storage") {
      fetchS3AccountData()
    }
    else if (option === "gcp"){
      
    }
  };

 
  useEffect(() => {
  if (selectedOption === "storageAccount") {
    fetchStorageAccountOptions();
  } else if (selectedOption === "fileShares") {
    fetchFileSharesData();
  } else if (selectedOption === "S3 Storage") {
    fetchS3AccountData();
  }
  // eslint-disable-next-line
}, [selectedOption]);

  // const handleStorageAccountClick = async (accountId) => {
  //   try {
  //     // setIsStorageAccountSelected(false);
  //     setSelectedStorageAccountId(accountId);
  //     // Find the storage account object with the clicked accountId
  //     const clickedAccount = storageAccountOptions.find(
  //       (account) => account.id === accountId
  //     );

  //     if (clickedAccount) {
  //       // Update the selected storage account name
  //       setSelectedStorageAccountName(clickedAccount.account_name);
     
  //     }
  //     // Fetch container options for the selected storage account
  //     fetchContainerOptions(accountId);
  //     setShowContainerOptions(true);
  //     setSelectedOption("storageAccount");
  //     setIsStorageAccountSelected(true);
  //   } catch (error) {
  //     console.error("Error fetching containers:", error.message);
  //   }
  // };


  const handleStorageAccountClick = (accountId) => {
  setSelectedStorageAccountId(accountId);

  const clickedAccount = storageAccountOptions.find(
    (account) => account.id === accountId
  );

  if (clickedAccount) {
    setSelectedStorageAccountName(clickedAccount.account_name);
  }

  // ✅ ONLY HERE containers API should fire
  fetchContainerOptions(accountId);

  setShowContainerOptions(true);
};
  // useEffect(() => {
  //   // eslint-disable-next-line
  // }, [selectedStorageAccountName]);

 

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
    }

    const response = await fetch(`${API_URL}/api/blob/list_blobs/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: 'include',
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

    if (!data.blob_list.length && !data.folder_list.length){
      setError("No Folders and Files Found");
      setIsPopupOpen(true);
    }
    else{
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

  const handleClosePopup = () => {
    setSelectedStorageAccountId(null); // Unselect the storage account
    setSelectedStorageAccountName("");
    setShowNoContainersPopup(false);
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    setSelectedNavbarOption(null);
    setIsPopupOpen(false);
  };

  const handleChatbotIconClick = () => {
    setShowChatbot(!showChatbot); // Toggle the showChatbot state
  };

  const handleOptionSelect = (option) => {
    setSelectedNavbarOption(option);

    // Determine which modal to open based on the selected option
    if (option === "Profile") {
      setShowProfileModal(true);
      setIsTimezoneModalOpen(false); // Ensure timezone modal is closed
    } else if (option === "Select Time Zone") {
      setIsTimezoneModalOpen(true);
      setShowProfileModal(false); // Ensure profile modal is closed
    }

    // Perform navigation or other actions based on the selected option
  
  };

  const { width, height } = getViewportDimensions();

  const navWidth = (width * 0.98).toFixed(2); // Width in pixels
  const navHeight = (height * 0.09).toFixed(2); // Height in pixels
  const navMarginTop = (height * 0.02).toFixed(2); // MarginTop in pixels
  const containerWidth = (width * 0.91).toFixed(2); // Container Width in pixels
  const containerHeight = (height * 0.85).toFixed(2); // Container Height in pixels
  const containerMTop = (height * 0.13).toFixed(2); // Container MarginTop in pixels
  const cMarginTop = `${(
    containerMTop -
    (parseFloat(navHeight) + parseFloat(navMarginTop))
  ).toFixed(2)}`;
  const PContainerHeight = `${(
    height -
    (parseFloat(navHeight) + parseFloat(navMarginTop))
  ).toFixed(2)}`;
  const sidebarWidth = `${(width * 0.06).toFixed(2)}`;
  const sidebarLMargin = `${(width * 0.01).toFixed(2)}`;
  const containerMarginLeft = `${(width * 0.081).toFixed(2)}`;
  const cMarginLeft = `${(
    containerMarginLeft -
    (parseFloat(sidebarWidth) + parseFloat(sidebarLMargin))
  ).toFixed(2)}px`;
  const subContainerWidth = `${(containerWidth * 0.95).toFixed(2)}`;
  const subContainerHeight = `${(containerHeight * 0.85).toFixed(2)}`;
  const subContainerTMargin = `${(
    containerHeight * 0.1 -
    parseFloat(cMarginTop)
  ).toFixed(2)}`;
  const listItemsContainerWidth = `${(subContainerWidth * 0.2).toFixed(2)}`;
  const listItemsContainerHeight = `${(containerHeight * 0.75).toFixed(2)}`;
  const dataContainerWidth = `${subContainerWidth - listItemsContainerWidth}`;
  const subDataContainerWidth = `${(dataContainerWidth * 0.99).toFixed(2)}`;
  const buttonWidth = `${(subContainerWidth * 0.98).toFixed(2)}`;
  const buttonMHeight = `${(subContainerHeight * 0.07).toFixed(2)}`;
  const buttonHeight = `${(subContainerHeight * 0.08).toFixed(2)}`;
  // eslint-disable-next-line
  const marginTop = `${(
    parseFloat(subContainerTMargin * 0.1) + parseFloat(buttonMHeight)
  ).toFixed(2)}`;
  const routeContainerHeight = `${(containerHeight * 0.07).toFixed(2)}`;

  return (
    <div
      className="bg-primary"
      style={{ width: `${width}px`, height: `${height}px` ,
      userSelect: "none",
      WebkitUserSelect: "none" /* Safari */,
      MozUserSelect: "none" /* Firefox */,
      msUserSelect: "none",}}
    >
      <div
        className="flex flex-col items-center "
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className={` ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
            ${showProfileModal ? "pointer-events-none" : ""}
              ${showChatbot ? "pointer-events-none" : ""}`}
          style={{
            width: `${navWidth}px`,
            height: `${navHeight}px`,
            marginTop: `${navMarginTop}px`,
          }}
        >
          <Mnavbar
            onOptionSelect={handleOptionSelect}
            selectedOption={selectedNavbarOption}
          />
        </div>
        <div
          className="flex flex-row "
          style={{ width: `${width}px`, height: `${PContainerHeight}px` }}
        >
          <div
            className={`
            ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
            ${showProfileModal ? "pointer-events-none" : ""}
              ${showChatbot ? "pointer-events-none" : ""}`}
            style={{
              width: `${sidebarWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: `${sidebarLMargin}px`,
            }}
          >
            <Sidebar  />
          </div>
          <div
            className=" bg-newgray flex flex-col   rounded-lg items-center  shadow-md shadow-slate-500/30 "
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: cMarginLeft,
            }}
          >
            <div
              className={`flex mt-1 flex-row items-center text-sm font-medium  text-purpleshade1  ml-9 p-2 
              
              ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
              ${showProfileModal ? "pointer-events-none" : ""}
                ${showChatbot ? "pointer-events-none" : ""}`}
              style={{
                width: `${(containerWidth * 0.99).toFixed(2)}px`,
                height: `${routeContainerHeight}px`,
              }}
            >
              <div>
                <Link to="/home">Home</Link> &gt;
              </div>

              {selectedOption === "storageAccount"
                ? "Storage Account"
                : "File Share Data"}

              {selectedOption === "storageAccount" ? (
                <>
                  {/* <span>Storage Account</span> */}
                  {selectedStorageAccountName && (
                    <span>&gt; {selectedStorageAccountName}</span>
                  )}
                </>
              ) : (
                <>{/* <span>&gt;File Share Data</span> */}</>
              )}
            </div>

            <div
              className="flex flex-col items-center "
              style={{
                width: `${(containerWidth * 0.99).toFixed(2)}px`,
                height: `${containerHeight}px`,
              }}
            >
              <div
                className={`flex flex-col  ${isTimezoneModalOpen ? "pointer-events-none" : ""} ${
                  showProfileModal ? "pointer-events-none" : ""
                }`}
                style={{
                  width: `${subContainerWidth}px`,
                  height: `${subContainerHeight}px`,
                }}
              >
                <div
                  className=""
                  style={{
                    width: `${buttonWidth}px`,
                    height: `${buttonHeight}px`,
                  }}
                >
                  <div
                    className={`flex flex-row w-[650px] h-10 bg-white mb-1 shadow-slate-500/30 shadow-md justify-center items-center font-medium  rounded-lg `}>
                    <div
                      className={`flex-1 flex w-[137px] h-[39px] text-[15px] shadow shadow-slate-500/30 rounded-l-md items-center justify-center cursor-pointer tab ${
                        selectedOption === "storageAccount"
                          ? "bg-purpleshade1 text-white w-[137px] rounded-[8px] h-9 pt-1.5  text-center font-medium"
                          : "bg-white text-black w-[140px] rounded-[5px] h-9 pt-1.5 text-center font-medium"
                      }`}
                      onClick={() => handleTabClick("storageAccount")}
                    >
                      <h1 className="w-[140px] h-9 pt-1 text-center font-medium">
                        Storage Account
                      </h1>
                    </div>
                    

                    <div
                      className={`flex-1 flex w-[140px] h-[39px] rounded-r-md items-center justify-center cursor-pointer tab ${
                        selectedOption === "fileShares"
                          ? "bg-purpleshade1 text-white w-[140px] rounded-[8px] h-[38px] pt-1.5 text-center font-medium"
                          : "bg-white text-black w-[140px] rounded-[5px] h-9 pt-1.5 text-center font-medium"
                      }`}
                      onClick={() => handleTabClick("fileShares")}
                    >
                      <h1 className="w-[140px] h-9 pt-1 text-center font-medium">
                        File Shares
                      </h1>
                    </div>

                    <div
                      className={`flex-1 flex w-[140px] h-[39px] rounded-r-md items-center justify-center cursor-pointer tab ${
                        selectedOption === "S3 Storage"
                          ? "bg-purpleshade1 text-white w-[140px] rounded-[8px] h-[38px] pt-1.5 text-center font-medium"
                          : "bg-white text-black w-[140px] rounded-[5px] h-9 pt-1.5 text-center font-medium"
                      }`}
                      onClick={() => handleTabClick("S3 Storage")}
                    >
                      <h1 className="w-[140px] h-9 pt-1 text-center font-medium">
                        S3 Storage
                      </h1>
                    </div>
                    <div
                      className={`flex-1 flex w-[140px] h-[39px] rounded-r-md items-center justify-center cursor-pointer tab ${
                        selectedOption === "gcp"
                          ? "bg-purpleshade1 text-white w-[140px] rounded-[8px] h-[38px] pt-1.5 text-center font-medium"
                          : "bg-white text-black w-[140px] rounded-[5px] h-9 pt-1.5 text-center font-medium"
                      }`}
                      onClick={() => handleTabClick("gcp")}
                    >
                      <h1 className="w-[140px] h-9 pt-1 text-center font-medium">
                        GCP
                      </h1>
                    </div>
                    
                  </div>
                </div>
                <div
                  className={`flex flex-row margin-top rounded-lg  ${isTimezoneModalOpen ? "blur-effect" : ""} ${
                  showProfileModal ? "blur-effect" : ""
                }  ${showChatbot ? "pointer-events-none" : ""}`}
                  style={{
                    width: `${subContainerWidth}px`,
                    height: `${listItemsContainerHeight}px`,
                  }}
                >
                  <div
                    className="bg-newgray  shadow-md shadow-slate-500/30 flex flex-col rounded-l-lg  items-center justify-center"
                    style={{
                      width: `${listItemsContainerWidth}px`,
                      height: `${listItemsContainerHeight}px`,
                    }}
                  >
                    <div
                      className="flex flex-col  overflow-y-auto space-y-2"
                      style={{
                        width: `${(listItemsContainerWidth * 0.97).toFixed(
                          2
                        )}px`,
                        height: `${(listItemsContainerHeight * 0.97).toFixed(
                          2
                        )}px`,
                        scrollbarWidth: "thin",
                      }}
                    >
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
                            // className="flex flex-row w-[200px] h-6  items-center  text-sm cursor-pointer  "
                            className={`flex flex-row w-[200px] h-6 items-center   font-normal text-xs 
                              cursor-pointer p-3 rounded-md 
                    `}
                            style={{
                              background:
                                account.id === selectedStorageAccountId
                                  ? "white"
                                  : "transparent",
                                  boxShadow: account.id === selectedStorageAccountId ? "0px 4px 10px rgba(0, 0, 0, 0.3)" : "none", // Adds gray shadow when selected
                              color:
                                account.id === selectedStorageAccountId
                                  ? "black"
                                  : "black",
                            }}
                            onClick={() =>
                              handleStorageAccountClick(account.id)
                            }
                          >
                            {renderFolderIcon(account.id)}
                            <div className="cursor-pointer ">
                              {account.account_name}
                            </div>
                          </div>
                        ))
                      )}
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
                        fileShareData.map((fileShare) => (
                          <div
                            key={fileShare.id}
                            className="flex flex-row w-[200px] h-6 items-center  text-black font-normal text-xs cursor-pointer p-2 rounded-lg "
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
                      )}
                       {loadingS3Accounts && selectedOption === "S3 Storage" ? (
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
  selectedOption === "S3 Storage" &&
  s3AccountData.map((account) => (
    <div
      key={account.id}
      className="flex flex-row w-[200px] h-6 items-center font-normal text-xs cursor-pointer p-3 rounded-md"
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
      onClick={() => handleStorageAccountClick(account.id)}
    >
      {renderFolderIcon(account.id)}

      {/* ✅ FIXED FIELD NAME */}
      <div className="cursor-pointer">
        {account.name}
      </div>
    </div>
  ))
)}
                    </div>
                  </div>
                  <div
                    className="bg-white rounded-r-md shadow-md shadow-slate-500/30 flex flex-col justify-center items-center"
                    style={{
                      width: `${dataContainerWidth}px`,
                      height: `${listItemsContainerHeight}px`,
                    }}
                  >
                    <div
                      className="flex flex-col items-center "
                      style={{
                        width: `${subDataContainerWidth}px`,
                        height: `${subContainerHeight}px`,
                      }}
                    >
                      <div
                        className={`w-full h-8 bg-white rounded-lg mt-3 mr-2 ml-2 shadow ${
                          showChatbot ? "admin-blur-effect" : ""
                        }  
                ${showProfileModal ? "admin-blur-effect" : ""} ${
                          isTimezoneModalOpen ? "admin-blur-effect" : ""
                        }`}
                      >
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
                           
                            
                          />
                        )}

                        {showNoContainersPopup && (
                          <div className="fixed inset-0 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-md shadow-slate-500/30 w-96 h-32 flex flex-col items-center justify-center space-y-4">
                              <p className="font-normal text-xs text-black break-words text-center">
                                No containers available in{" "}
                                {selectedStorageAccountName}
                              </p>
                              <div className="flex justify-center">
                                <button
                                  className="w-20 h-7 text-white text-xs bg-purpleshade1 font-normal border border-none rounded-lg"
                                  onClick={handleClosePopup}
                                >
                                  OK
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                     
                    </div>
                  </div>
                </div>
                <div
  className={`fixed z-[9999] ${showNoContainersPopup ? "pointer-events-none" : ""}`}
  style={{
    right: '20px', 
    bottom: '20px', 
   
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

              </div>
            </div>
          </div>
        </div>
        <ErrorPopup
              isOpen={isPopupOpen}
              message={error}
              onClose={handleCloseChatbot}

            />
        {showProfileModal && (
          <ProfileModal
            isOpen={showProfileModal}
            onClose={handleCloseChatbot}
          />
        )}
        <TimezoneModal
          closePreviewModal={handleCloseChatbot}
          setIsTimezoneModalOpen={setIsTimezoneModalOpen}
          setSelectedNavbarOption={setSelectedNavbarOption}
          isTimezoneModalOpen={isTimezoneModalOpen}
        />
      </div>
      

      {showZoomPopup && (
        <div className="fixed top-8 bg-white border border-gray-300 rounded p-2 shadow ">
          <p>Zoom Level: {zoomLevel}%</p>
        </div>
      )}
    </div>
  );
};

export default NewContainerPage;
