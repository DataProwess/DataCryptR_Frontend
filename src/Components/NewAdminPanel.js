import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "./auth";
import NewFieldPopup from "./AdminPanel/NewField";
import AlertNewFieldPopup from "./AlertNewFieldPopup";
import "./scroll.css";
import Jsontimezones from "./TimeZones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { faCircleRight, faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import Sidebar from "./V1_Sidebar";
import { API_URL } from "./ApiConfig";
import EditUserModal from "./EditUserModal";
import AddUserGroupModal from "./AddUserGroupModal";
import NewFileShareModal from "./AdminPanel/NewFileShareModal";
import TimezoneModal from "./TimeZoneModal";
import NewGlobalField from "./AdminPanel/NewGlobalField";
import { toast } from "react-toastify";
import Chatbot from "./Chatbot";
import ProfileModal from "./ProfileModal";
import ErrorPopup from "./ErrorPopup";
import debounce from "lodash/debounce";
import "./admin.css";
import AddMaskingConfig from "./AddMaskingConfig";
import {
  secureApiCall,
  apiRequest,
  getCSRFToken,
  getAuthToken,
  fetchAndStoreCSRFToken,
} from "./csrfUtils";
import { useUI } from "./Context/UIContext";

import { Options_Config } from "./AdminPanel/OptionsConfig";
import OptionsItems from "./AdminPanel/OptionsItems";
import S3Accounts from "./AdminPanel/S3Accounts";
import GCPAccounts from "./AdminPanel/GCPAccounts";


// const API_URL = "http://127.0.0.1:8000";

const calculateViewportSize = (percentage) => {
  const width = window.innerWidth * (percentage / 100);
  const height = window.innerHeight * (percentage / 100);
  return { width, height };
};
const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const NewAdminPanel = () => {
   const {
        isDisabled,
        isBlurred,
        // isTimezoneModalOpen,
        // showProfileModal,
        // setIsTimezoneModalOpen,
        // setShowProfileModal,
        // showChatbot,
        // setShowChatbot,
      } = useUI();
  const hasFetched = useRef(false);
  const [dynamicOption, setDynamicOption] = useState("default");
  const [keyValue, setKeyValue] = useState("");
  const [isAddMaskingConfigOpen, setIsAddMaskingConfigOpen] = useState(false);
  const [hasNameChanged, setHasNameChanged] = useState(false);
  const { width, height } = getViewportDimensions();
  const [fileShares, setFileShares] = useState([]);
  const [userGroupName, setUserGroupName] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [editedUserGroup, setEditedUserGroup] = useState({
    name: "",
    description: "",
    dcgroups_id: [],
    roles: [],
  });
  const [tooltipMessage, setTooltipMessage] = useState("");
  // eslint-disable-next-line
  const [input1Error, setInput1Error] = useState("");
  const [dcgroupsState, setDcgroupsState] = useState([]);
  const [editUserInput, setEditUserInput] = useState(
    editedUserGroup.name || ""
  );
  // eslint-disable-next-line
  const [dynamicGroupValues, setDynamicGroupValues] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  // eslint-disable-next-line
  const [noDataMessage, setNoDataMessage] = useState("");
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const popupRef = useRef(null);
  const [token, setToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  // eslint-disable-next-line
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line
  const [isModalVisible, setModalVisible] = useState(false);
  // eslint-disable-next-line
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // eslint-disable-next-line
  const [isAddUserGroup, setIsAddUserGroup] = useState(false);
  const [permanentMaskingData, setPermanentMaskingData] = useState([]);
  const [userGroupsData, setUserGroupsData] = useState([]);
  const [containerData, setContainerData] = useState([]);
  const [fileShareData, setFileShareData] = useState([]);
  // const [selectedTimeZone, setSelectedTimeZone] = useState(null);
  // eslint-disable-next-line
  const [selectedTimeZone, setSelectedTimeZone] = useState({
    label: "Select Timezone",
    value: null,
  });
  // eslint-disable-next-line
  const [isFileSizeUnitDropdownOpen, setIsFileSizeUnitDropdownOpen] =
    useState(false);
  // eslint-disable-next-line
  const [timeZones, setTimeZones] = useState([]);
  // eslint-disable-next-line
  const [userEmail, setUserEmail] = useState(null);
  // eslint-disable-next-line
  const [activeTab, setActiveTab] = useState("userGroup");
  const [inputValue, setInputValue] = useState("");
  // eslint-disable-next-line
  const [texinputValue, setTextInputValue] = useState("");
  // eslint-disable-next-line
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [downloadConfigApiData, setDownloadConfigApiData] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFileShareFieldName, setNewFileShareFieldName] = useState("");
  // eslint-disable-next-line
  const [newStorageFieldName, setNewStorageFieldName] = useState("");
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  const [isAlertNewFieldVisible, setIsAlertNewFieldVisible] = useState(false);
  // eslint-disable-next-line
  const [columnData, setColumnData] = useState([]);
  // eslint-disable-next-line
  const [pageSize, setPageSize] = useState(10);
  const newFieldRef = useRef(null);
  // eslint-disable-next-line
  const [selectedContainer, setSelectedContainer] = useState(null);
  // eslint-disable-next-line
  const [selectedUserGroup, setSelectedUserGroup] = useState(null);
  // eslint-disable-next-line
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  // eslint-disable-next-line
  const [showAccountKey, setShowAccountKey] = useState(true);
  const [chosenItems, setChosenItems] = useState(new Set());
  // eslint-disable-next-line
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line
  const [dataType, setDataType] = useState(null);
  const [newAccountKey, setNewAccountKey] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  // eslint-disable-next-line
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  // eslint-disable-next-line
  const [dcGroups, setDcGroups] = useState([]);
  // eslint-disable-next-line
  const [responseMessage, setResponseMessage] = useState("");
  const [inputValue1, setInputValue1] = useState([]);
  const [inputValue2, setInputValue2] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  // eslint-disable-next-line
  const [fileShareInputValue, setFileShareInputValue] = useState("");
  const [isNewFieldVisibleStorage, setisNewFieldVisibleStorage] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [isNewFieldVisibleFileShare, setisNewFieldVisibleFileShare] =
    useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  // eslint-disable-next-line
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  // eslint-disable-next-line
  // const [sidebarWidth, setSidebarWidth] = useState(200);
  const [selectedOption, setSelectedOption] = useState("User Group");
  const [modifiedFileShares, setModifiedFileShares] = useState([]);
  // eslint-disable-next-line
  const [newFileShares, setNewFileShares] = useState([]);
  // eslint-disable-next-line
  const [fileShareSyncStatus, setFileShareSyncStatus] = useState({});
  // eslint-disable-next-line
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);
  const [selectedFileShareForDeletion, setSelectedFileShareForDeletion] =
    useState(null);
  const [selectedUserGroupDeletion, setSelectionUserGroupDeletion] =
    useState(null);
  // eslint-disable-next-line
  const [selectedStorageRowForDeletion, setSelectedStorageRowForDeletion] =
    useState(null);
  const [selectedMaskedDataRowDeletion, setSelectedMaskedDataRowDeletion] =
    useState(null);
  // eslint-disable-next-line
  const [storageContainerSyncStatus, setStorageContainerSyncStatus] = useState(
    {}
  );
  // eslint-disable-next-line
  const [selectedTabState, setSelectedTabState] = useState({});
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedMaskedFileName, setSelectedMaskedFileName] = useState("");
  const [fileName, setFileName] = useState("");
  const [maskedFileName, setMaskedFileName] = useState("");
  // eslint-disable-next-line
  const [isFileShareModal, setIsFileShareModal] = useState(false);
  // eslint-disable-next-line
  const [isMiscellaneousModal, setIsMiscellaneousModal] = useState(false);
  // eslint-disable-next-line
  const [isGlobalColumnModal, setIsGlobalColumnModal] = useState(false);
  // eslint-disable-next-line
  const [activeModal, setActiveModal] = useState();
  // eslint-disable-next-line
  const [isStorageContainerModal, setIsStorageContainerModal] = useState(false);
  // eslint-disable-next-line
  const [isFileContainerModal, setIsFileContainerModal] = useState(false);
  // eslint-disable-next-line
  const [isMisContainerModal, setIsMisContainerModal] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showMaskingUploadPopup, setShowMaskingUploadPopup] = useState(false);
  // eslint-disable-next-line
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // const API_URL = "http://74.235.117.56:80"
  // eslint-disable-next-line
  const [viewportSize, setViewportSize] = useState(calculateViewportSize(90));
  // const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  // const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  // eslint-disable-next-line
  const [percentage, setPercentage] = useState(90); // Default percentage
  const [alertAccessData, setAlertAccessData] = useState([]);
  const [newFilePattern, setNewFilePattern] = useState("");
  // eslint-disable-next-line
  const [newAlertEmail, setNewAlertEmail] = useState("");
  const [email, setEmail] = useState(newAlertEmail || "");
  const [isChecked, setIsChecked] = useState(false);
  const [selectedAlertAccessRowDeletion, setSelectedAlertAccessRowDeletion] =
    useState(null);


  const handleResize = () => {
    // Calculate the viewport size based on the current zoom level
    const zoomLevel =
      100 * (window.innerWidth / document.documentElement.clientWidth);
    const adjustedPercentage = Math.min(100, zoomLevel); // Ensure the percentage does not exceed 100%
    setViewportSize(calculateViewportSize(adjustedPercentage));
    setPercentage(adjustedPercentage);
  };

  useEffect(() => {
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const options = Jsontimezones.map((timezone) => ({
      value: timezone,
      label: timezone,
    }));
    setTimeZones(options);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false); // Set loading to false after 1000ms (1 second)
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleResize = () => {};

    window.addEventListener("resize", handleResize);

    // Call handleResize once to set the initial height and width
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "=") {
        setIsZoomedIn(true);
      } else if (event.ctrlKey && event.key === "-") {
        setIsZoomedIn(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleZoomChange = (event) => {
      if (event.ctrlKey) {
        event.preventDefault(); // Prevent default browser zoom behavior

        if (event.code === "Equal" || event.code === "NumpadAdd") {
          // Zoom in by 10% when Ctrl+"=" or Ctrl+"+" is pressed
          if (zoomLevel < 200) {
            setZoomLevel((prevZoom) => Math.min(prevZoom + 10, 200));
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

  useEffect(() => {
    // Simulate a delay of 1000ms (1 second)
    const timer = setTimeout(() => {
      setLoading(false); // After 1 second, loading is false
    }, 5000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    return () => {
      // Cleanup function (optional)
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, []); // Run this effect only once when the component mounts

  useEffect(() => {
    if (showPreview) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showPreview]);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    });
  }, []);

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const fetchedToken = await authService.getToken();
  //     const dataObject = JSON.parse(fetchedToken);
  //     const token = dataObject.data.token;
  //     const email = dataObject.data.email;
  //     setToken(token);
  //     console.log("Token",token)
  //     setUserEmail(email);
  //     // eslint-disable-next-line
  //     const fetchedpermissions = authService.getPermissions();
  //     const permissions = dataObject.data.permissions;
  //     setPermissions(permissions);
  //     const csrfToken = authService.getCsrfToken();
  //     setCsrfToken(csrfToken);
  //     // setLoading(false);
  //     // await new Promise((resolve) => setTimeout(resolve, 3000));

  //     const userGroupsResponse = await fetch(
  //       `${API_URL}/api/core/blob-groups/`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "X-CSRFToken": csrfToken,
  //         },
  //         credentials: "include",
  //       }
  //     );

  //     if (userGroupsResponse.status === 401) {
  //       const responseData = await userGroupsResponse.json();

  //       // Check if the error message indicates token expiration
  //       if (responseData.error === "Access token has expired") {
  //         // console.warn("Token expired, redirecting to login...");

  //         // Redirect to login page
  //         window.location.href = "/";
  //         return; // Prevent further execution
  //       } else {
  //         throw new Error("Unauthorized access or other authentication error.");
  //       }
  //     }

  //     const userGroupsData = await userGroupsResponse.json();

  //     const existingUserGroupNames = userGroupsData.map((group) =>
  //       group.name.toLowerCase()
  //     );

  //     // setUserGroupsData(prevState => [...prevState, data]);
  //     setUserGroupsData(userGroupsData);
  //     setUserGroupName(existingUserGroupNames);

  //     // setLoading(false);
  //   } catch (error) {
  //     console.error("Fetch data error:", error);
  //     toast.error("Failed to fetch data");
  //   } finally {
  //     // Hide the loader once data is fetched or an error occurs
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   // Fetch available items
  //   if(token)
  //   {
  //     fetchData()
  //   }

  //   // handleUserPermissions();
  //   // handleEditUserPermissions();
  // }, [token]);

  // useEffect(() => {
  //   const getTokenAndFetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const fetchedToken = await authService.getToken();
  //       const dataObject = JSON.parse(fetchedToken);
  //       const token = dataObject.data.token;
  //       const email = dataObject.data.email;

  //       setToken(token);
  //       setUserEmail(email);
  //       console.log("Token:", token);

  //       const permissions = dataObject.data.permissions;
  //       setPermissions(permissions);
  //       const csrfToken = authService.getCsrfToken();
  //       setCsrfToken(csrfToken);

  //       // Now call fetchData with token
  //       fetchData(token, csrfToken);
  //     } catch (error) {
  //       console.error("Error fetching token:", error);
  //     }
  //   };

  //   getTokenAndFetchData();
  // }, []); // Run only once when the component mounts

  // const fetchData = async (token, csrfToken) => {
  //   try {
  //     const userGroupsResponse = await fetch(`${API_URL}/api/core/blob-groups/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "X-CSRFToken": csrfToken,
  //       },
  //       credentials: "include",
  //     });

  //     if (userGroupsResponse.status === 401) {
  //       const responseData = await userGroupsResponse.json();
  //       if (responseData.error === "Access token has expired") {
  //         window.location.href = "/";
  //         return;
  //       } else {
  //         throw new Error("Unauthorized access or other authentication error.");
  //       }
  //     }

  //     const userGroupsData = await userGroupsResponse.json();
  //     const existingUserGroupNames = userGroupsData.map((group) =>
  //       group.name.toLowerCase()
  //     );

  //     setUserGroupsData(userGroupsData);
  //     setUserGroupName(existingUserGroupNames);
  //   } catch (error) {
  //     console.error("Fetch data error:", error);
  //     toast.error("Failed to fetch data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const getTokenAndFetchData = async () => {
      if (hasFetched.current) return; // ✅ If already fetched, exit early
      hasFetched.current = true; // ✅ Set flag to prevent further calls

      setLoading(true);
      try {
        const fetchedToken = await authService.getToken();
        const dataObject = JSON.parse(fetchedToken);
        const token = dataObject.data.token;
        const email = dataObject.data.email;

        setToken(token);
        setUserEmail(email);
        console.log("Token:", token);

        const permissions = dataObject.data.permissions;
        setPermissions(permissions);
        // Async CSRF load: csrftoken cookie is HttpOnly, so sync getCsrfToken() cannot read it.
        await fetchAndStoreCSRFToken();
        let csrfToken = await getCSRFToken();
        setCsrfToken(csrfToken);

        await fetchData(token, csrfToken);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    getTokenAndFetchData();
  }, []); // ✅ Runs only on mount

  const fetchData = async (token, csrfToken) => {
    try {
      console.log("Fetching user groups...");
      const userGroupsData = await secureApiCall(
        `${API_URL}/api/core/blob-groups/`,
        "GET"
      );

      const existingUserGroupNames = userGroupsData.map((group) =>
        group.name.toLowerCase()
      );

      setUserGroupsData(userGroupsData);
      setUserGroupName(existingUserGroupNames);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log userGroupName whenever it changes
  }, [userGroupName]);

  const fetchDownloadConfigData = async (inputValue = "") => {
    setLoading(true);
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const downloadConfigData = await secureApiCall(
        `${API_URL}/api/admin/list-global-column/`,
        "POST",
        {
          search_query: inputValue,
        }
      );

      const data = downloadConfigData.data || [];

      if (downloadConfigData.data.length === 0) {
        setNoDataMessage("No data is available");
        setDownloadConfigApiData([]);
        setLoading(false);
        setShowPreview(false); // Hide the preview if no data is available
        setTotalPages(0);
        return;
      }

      // Set the state with all fetched data
      setDownloadConfigApiData(downloadConfigData.data);
      setIsGlobalColumnModal(true);
      setLoading(false);
      setShowPreview(true);

      // Update the total pages based on the total number of records
      const total =
          downloadConfigData.data.length > 0
            ? downloadConfigData.data[0].total
            : 0;
      setTotalPages(Math.ceil(total / pageSize));

      return data;
    } catch (error) {
      console.error("Error in fetchDownloadConfigData:", error);
      return [];
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (selectedOption === "Global Column Config") {
      fetchDownloadConfigData();
      fetchGlobalFileSetting();
    }
    // eslint-disable-next-line
  }, [token, selectedOption]);

  //   useEffect(() => {
  //     // Fetch settings from API if the selected option is "Global Column Config"
  //     if (selectedOption === "Global Column Config") {
  //         const fetchGlobalData = async () => {
  //             try {
  //                 await fetchGlobalFileSetting();
  //                 await fetchDownloadConfigData();
  //             } catch (error) {
  //                 console.error("Error fetching data:", error);
  //             }
  //         };
  //         fetchGlobalData();
  //     }
  // }, [selectedOption, token]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value.toLowerCase();
    setInputValue(inputValue);
  };

  const handleGlobalSearchClick = async () => {
    try {
      const result = await fetchDownloadConfigData(inputValue); // Pass the current search query to the API call

      if (result && Array.isArray(result) && result.length > 0) {
        setInputValue(inputValue); // If data is found, set it to state
        setError("");
        setIsPopupOpen(false); // Open the popup
      } else {
        setInputValue(""); // Clear any previous results
        setError("No data found for the search query."); // Display no data found message
        setIsPopupOpen(true);
      }
    } catch (error) {
      setInputValue("");
      setError("An error occurred while searching. Please try again."); // Handle potential API errors
      setIsPopupOpen(true);
    }
  };

  const handleModalInputChange1 = (e) => {
    setInputValue1(e.target.value); // Update state on input change
  };

  // Event handler for the second input
  const handleModalInputChange2 = (e) => {
    setInputValue2(e.target.value);
  };
  // eslint-disable-next-line
  const handleStorageAccountNameChange = (e) => {
    const accName = e.target.value.toLowerCase();
    setNewStorageFieldName(accName);
  };

  const handleAccountNameChange = (e) => {
    const accName = e.target.value.toLowerCase();
    setNewFieldName(accName);
  };
  const handleFileShareAccountNameChange = (e) => {
    const accName = e.target.value.toLowerCase();
    setNewFileShareFieldName(accName);
  };

  const handleAccountKeyChange = (e) => {
    const accKey = e.target.value;
    setNewAccountKey(accKey);
  };

  const handleFilePatternChange = (e) => {
    const filePattern = e.target.value.toLowerCase();
    setNewFilePattern(filePattern);
  };

  const handleEmailChange = (e) => {
    const email_acc = e.target.value.toLowerCase();
    setEmail(email_acc);
    setIsChecked(false);
  };

  const handleNewFilePathChange = (e) => {
    const accKey = e.target.value.toLowerCase();
    setNewFilePath(accKey);
    // setNewFilePath(saveButtonClicked ? "*".repeat(accKey.length) : accKey);
  };
  const handleUploadButtonClick = async () => {
    setShowUploadPopup(true);
    setShowMaskingUploadPopup(true);
    // setError(true);
  };

  const handleBrowseClick = async () => {
    // setShowUploadPopup(true)
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = handleFileChange;
      fileInput.click();
      // setShowUploadPopup(true);
    } catch (error) {
      console.error("Error in handleUploadButtonClick:", error);
      toast.error("Failed to upload file");
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setFileName(file);
    }
  };

  const handleMaskedFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedMaskedFileName(file.name);
      setMaskedFileName(file);
    }
  };

  const handleSampleFileDownload = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
        // navigate("/")
        return;
      }
      const response = await fetch(
        `${API_URL}/api/admin/download-sample-column/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(await response.blob());

        // Create a hidden anchor element
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `downloaded-file.xlsx`); // Set the desired file name
        document.body.appendChild(link);

        // Trigger a click on the anchor element to initiate the download
        link.click();

        // Remove the anchor element
        document.body.removeChild(link);
      } else {
        toast.error(`Failed to initiate sample file download`);
      }
    } catch (error) {
      console.error("Error downloading sample file:", error);
      toast.error("Failed to download sample file");
    }
  };

  const handleMaskedSampleFileDownload = async () => {
    try {
      const fileBlob = await secureApiCall(
        `${API_URL}/api/blob/get_sample_permanent_masking_xlsx/`,
        "GET"
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

  const handleUploadFile = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      if (!fileName) {
        setError("No file selected");
        setIsPopupOpen(true);
        return;
      }

      const browseFile = new FormData();
      browseFile.append("file", fileName);

      const response = await apiRequest(
        `${API_URL}/api/admin/upload-column/`,
        "POST",
        browseFile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      const message = "File uploaded successfully";
      setIsPopupOpen(true);
      setError(message);
      handleClearSelectedFile();
      setLoading(false);

    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
      setIsPopupOpen(true);
      setLoading(false);
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

      const response = await fetch(
        `${API_URL}/api/blob/upload_permanent_masking_xlsx/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: browseFile,
        }
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

  const fetchStorageContainerData = async () => {
    setLoading(true);
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const responseData = await secureApiCall(
        `${API_URL}/api/admin/list-storage-accounts/`,
        "GET"
      );

      setContainerData(responseData.data);
      setIsStorageContainerModal(true);
      setShowPreview(true);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (
      selectedOption === "Storage Container" ||
      selectedOption === "Permanent Masking"
    ) {
      fetchStorageContainerData();
    }
    // eslint-disable-next-line
  }, [token, selectedOption]);

  useEffect(() => {
    console.log("Updated ContainerData:", containerData);
  }, [containerData]);

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
      setLoading(false);
    } catch (error) {
      console.error("Error in handleDownloadOptionChange:", error);
      toast.error("Failed to initiate download");
    }
  };

  const handleMaskedDownloadButtonClick = async () => {
    try {
      const authToken = await getAuthToken();
      const csrf = await getCSRFToken();
      if (!authToken || !csrf) {
        toast.error("Authentication required to download masking export.");
        return;
      }
      const response = await fetch(
        `${API_URL}/api/blob/get_permanent_masking_xlsx/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-CSRFToken": csrf,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const url = window.URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "permanent_masking_records.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const handleCheckboxChange = (selectedContainer) => {
    // Map through the container data and update the `is_download_storage` property
    const updatedContainerData = containerData.map((container) => {
      if (container === selectedContainer) {
        // Toggle the checkbox for the selected container
        return {
          ...container,
          is_download_storage: !container.is_download_storage,
        };
      } else {
        // Uncheck all other checkboxes
        return { ...container, is_download_storage: false };
      }
    });

    // Update the state with the modified container data
    setContainerData(updatedContainerData);
  };

  const handleDownloadSaveButtonClick = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
        // navigate("/")
        return;
      }
      if (!Array.isArray(downloadConfigApiData)) {
        console.error("Invalid downloadConfigApiData format");
        return;
      }

      // Prepare the request body
      const requestBody = {
        global_column_config: [
          ...downloadConfigApiData.map((config) => ({
            id: config.id,
            name: config.name,
            is_masked: JSON.parse(config.is_masked),
          })),
          ...(newFieldName.trim() !== ""
            ? [
                {
                  id: "",
                  name: newFieldName,
                  is_masked: newFieldIsMasked,
                },
              ]
            : []),
        ],
      };

      // Make the API call
      const response = await fetch(
        `${API_URL}/api/admin/update-global-column/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      // Parse the response
      const responseData = await response.json();

      // Check if the request was successful
      if (response.ok) {
        setError("Data saved successfully!");
        setIsPopupOpen(true);
        // Update the state with the latest data
        setDownloadConfigApiData(responseData.updatedColumnData);
        setLoading(false);

        fetchDownloadConfigData();
        setNewFieldName("");
        setNewFieldIsMasked(false);
        // Hide the new field row
        setisNewFieldVisible(false);
      } else {
        console.error(
          "Error updating global column config:",
          responseData.message
        );
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  // eslint-disable-next-line
  const debouncedSaveChanges = useCallback(
    debounce(() => {
      if (token) {
        handleDownloadSaveButtonClick();
      } else {
        console.error("Token is not available");
      }
    }, 1000),
    [token]
  );

  const handleDownloadConfigFieldChange = (index, field, value) => {
    setDownloadConfigApiData((prevData) => {
      const newData = prevData.map((config, i) => {
        if (i === index) {
          return {
            ...config,
            id: config.id,
            name: field === "name" ? value : config.name,
            is_masked:
              field === "is_masked" ? value === "true" : config.is_masked,
          };
        }

        return config;
      });

      // handleDownloadSaveButtonClick();
      return newData;
    });

    // handleDownloadSaveButtonClick();
  };

  useEffect(() => {}, [downloadConfigApiData]);

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

  // eslint-disable-next-line
  const handleAddStorageNewField = async () => {
    try {
      if (!newFieldName.trim()) {
        return; // Don't add a new field if the field name is empty
      }

      // Check if there is an existing row being edited
      const existingRowIndex = containerData.findIndex(
        (column) => column.isEditing
      );

      if (existingRowIndex !== -1) {
        // If there is an existing row, update it with new values
        const updatedContainerData = [...containerData];
        const existingRow = updatedContainerData[existingRowIndex];
        existingRow.account_name = newFieldName;
        existingRow.account_key = newAccountKey;
        existingRow.isEditing = false;
        setContainerData(updatedContainerData);
      } else {
        // If there is no existing row, add a new row with a new ID
        const newField = {
          id: containerData.length + 1, // Incremental numeric ID
          account_name: newFieldName,
          account_key: newAccountKey,
          showDeleteButton: true,
          // Add any other properties you might need for a new field
        };

        setContainerData((prevContainerData) => [
          ...prevContainerData,
          newField,
        ]);
      }

      // Clear input values after adding/updating a new field
      setNewFieldName("");
      setNewAccountKey("");
      setisNewFieldVisibleStorage(true);
    } catch (error) {
      console.error("Add new storage field error:", error);
      toast.error("Failed to add new storage field");
    }
  };

  const fetchFileSharesData = async () => {
    try {
      if (!token) {
        return;
      }
      // ✅ SECURE - Using apiRequest utility
      const responseData = await apiRequest(
        `${API_URL}/api/admin/list-file-shares/`,
        "GET",
        {}
      );
      if (responseData && responseData.data) {
        setFileShareData(responseData.data);
        setIsFileContainerModal(true);
        setShowPreview(true);
        setLoading(false);
        if (responseData.data.length > 0) {
          setFileShareInputValue(responseData.data.name);
        }
      } else {
        setFileShareData([]);
      }
    } catch (error) {
      setFileShareData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (selectedOption === "File Share") {
      fetchFileSharesData();
    }
    // eslint-disable-next-line
  }, [token, selectedOption]);

  // eslint-disable-next-line
  const handleFileShareDataChange = (index, key, value) => {
    const updatedFileShares = fileShares.map((fileShare, i) => {
      if (i === index) {
        return { ...fileShare, [key]: value };
      }
      return fileShare;
    });

    setFileShares(updatedFileShares);
  };

  const handleStorageAccountSave = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
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
        setModifiedFileShares([]);
        setNewFieldName(null);
        setNewAccountKey(null);
        setisNewFieldVisibleStorage(false);
        setIsDeleteButtonVisible(false);
        setLoading(false);
        setError("Storage account saved successfully!");
        setIsPopupOpen(true);
      } else {
        console.error("Invalid storage_account_data:", data.data);
      }

      setIsSaveClicked(true);
    } catch (error) {
      console.error("Error saving storage accounts:", error);
    }
  };

  const handleFileShareSaveButtonClick = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const updatedFileShares = fileShareData.map((fileshare) => ({
        id: fileshare.id,
        // Use modified name if available, otherwise use the original name
        name: modifiedFileShares[fileshare.id] || fileshare.name,
        filepath:
          modifiedFileShares[fileshare.id]?.filepath || fileshare.filepath,
        // filepath: fileshare.filepath,
        sync_status: "NOT_STARTED",
        sync_start_time: "",
        sync_end_time: "",
      }));

      // Add a new file share entry only if both the newFileShareFieldName and newFilePath are provided
      if (newFileShareFieldName.trim() && newFilePath.trim()) {
        updatedFileShares.push({
          id: null,
          name: newFileShareFieldName,
          filepath: newFilePath,
          sync_status: "NOT_STARTED",
          sync_start_time: "",
          sync_end_time: "",
        });
      }

      // Prepare the request body with file shares
      const requestBody = {
        file_shares: updatedFileShares,
      };

      const data = await secureApiCall(
        `${API_URL}/api/admin/update-file-shares/`,
        "POST",
        requestBody
      );

      if (Array.isArray(data.data)) {
        // Set the new file share data
        setFileShareData(data.data);

        // Clear the new field inputs
        setNewFileShareFieldName("");
        setNewFilePath("");

        setModifiedFileShares([]);
        setNewFileShares([]);
        setIsDeleteButtonVisible(false);
        setLoading(false);
        setNewFilePath("");

        setError("FileShare account saved successfully!");
        setIsPopupOpen(true);
      } else {
        console.error("Failed to save FileShare.");
      }

      // Set newFilePath to asterisks only if the save button is clicked
      setNewFilePath((prevFilePath) =>
        saveButtonClicked ? "*".repeat(prevFilePath.length) : prevFilePath
      );

      setSaveButtonClicked(true);
      setisNewFieldVisibleFileShare(false);
    } catch (error) {
      console.error("Error saving file shares:", error);
    }
  };

  useEffect(() => {}, [fileShareData]);

  const handleFileShareRefresh = async (fileshare) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }
      setError(`Sync is in progress for ${fileshare.name}`);
      setIsPopupOpen(true);
      const response = await fetch(
        `${API_URL}/api/admin/sync-file-shares/${fileshare.id}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
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
    }
  };

  const handleRefresh = async (container) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }
      setError(`Sync is in progress for ${container.account_name}`);
      setIsPopupOpen(true);
      const requestBody = {
        storage_account_name: container.account_name,
      };
      const response = await fetch(
        `${API_URL}/api/core/refresh_storage_account/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );
      if (response.ok) {
        setStorageContainerSyncStatus((prev) => ({
          ...prev,
          [container.id]: "pending",
        }));
        setStorageContainerSyncStatus((prev) => ({
          ...prev,
          [container.id]: "success",
        }));
        setError(`Sync is completed for ${container.account_name}`);
        setIsPopupOpen(true);
      } else {
        setStorageContainerSyncStatus((prev) => ({
          ...prev,
          [container.id]: "failed",
        }));
        setError(`Failed to sync ${container.account_name}`);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("Error during sync:", error);
    }
  };

  const handleRowClick = (container) => {
    setSelectedContainer(container);
    // Trigger the checkbox click
    const checkbox = document.getElementById(
      `checkbox-${container.container_id}`
    );
    if (checkbox) {
      checkbox.click();
    }
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

  // eslint-disable-next-line
  const handleuserRowClick = (index) => {
    const clickedGroup = userGroupsData[index];
    setSelectedUserGroup(clickedGroup);
    const checkbox = document.getElementById(
      `checkbox-${clickedGroup.group_id}`
    );
    if (checkbox) {
      checkbox.click();
    }
  };

  const handleDeleteClick = async (userGroupId) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      await secureApiCall(
        `${API_URL}/api/core/blob-groups/${userGroupId}/`,
        "DELETE"
      );

      // If the deletion is successful, update the state to reflect the change
      const updatedUserGroups = userGroupsData.filter(
        (group) => group.id !== userGroupId
      );
      fetchData();
      setUserGroupsData(updatedUserGroups);
      setSelectionUserGroupDeletion(null);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred during delete:", error);
    }
  };

  const handleDeleteField = (fieldId, fieldName) => {
    setDownloadConfigApiData((prevDownloadApiData) => {
      // Check if prevDownloadApiData is not null before applying filter
      if (prevDownloadApiData) {
        // Check if newField is not null before applying filter
        const filteredData = prevDownloadApiData.filter((field) => {
          return !(field.id === fieldId && field.name === fieldName);
        });

        return filteredData;
      } else {
        // If prevDownloadApiData is null, return an empty array or handle it as needed
        return [];
      }
    });
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

  const fetchAlertAccessData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOption === "Alert") {
      fetchAlertAccessData();
    }
    // eslint-disable-next-line
  }, [token, selectedOption]); // Runs when token or selectedOption changes

  // const handleAlertAccessDataSave = async () => {
  //   try {
  //     if (!token) {
  //       console.error("Token is not available.");
  //       return;
  //     }

  //     if (
  //       isAlertNewFieldVisible &&
  //       (!newFilePattern.trim() || !email.trim())
  //     ) {
  //       toast.error("Please enter values for File Pattern and Alert Email.");
  //       return;
  //     }

  //     const newAlertField = isAlertNewFieldVisible
  //       ? {
  //           alert_recipient: email,
  //           file_regex: newFilePattern,
  //         }
  //       : null;

  //     const requestBody = {
  //       alert_access_data: [
  //         // ...alertAccessData.map((alertItem) => ({
  //         //   // id: alertItem.id,
  //         //   alert_recipient: alertItem.alert_recipient,
  //         //   file_regex: alertItem.file_regex,

  //         // })),
  //         ...(newAlertField ? [newAlertField] : []),
  //       ],
  //     };

  //     const response = await fetch(
  //       `${API_URL}/api/admin/create-file-access-alert/`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //           "X-CSRFToken": csrfToken,
  //         },
  //         credentials: "include",
  //         body: JSON.stringify({
  //           file_regex: requestBody.alert_access_data[0].file_regex,
  //           alert_recipient: requestBody.alert_access_data[0].alert_recipient
  //         }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (Array.isArray(data.data)) {
  //       // setAlertAccessData(data.data);
  //       setAlertAccessData((prevData) => [...prevData, newAlertField]);
  //       setModifiedFileShares([]);
  //       setNewAlertEmail(null);
  //       setEmail(null)
  //       setNewFilePattern(null);
  //       setIsAlertNewFieldVisible(false);
  //       setIsDeleteButtonVisible(false);
  //       setLoading(false);
  //     } else {
  //       console.error("Invalid Alert Notification data:", data.data);
  //     }
  //     if (response.ok) {
  //       setError("Notification Details saved successfully!");
  //       setIsPopupOpen(true);
  //       // Additional success logic, e.g., refreshing data
  //     } else {
  //       console.error("Failed to save data.");
  //     }

  //     setIsSaveClicked(true);
  //   } catch (error) {
  //     console.error("Error saving Notification Data:", error);
  //   }
  // };

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

  // Close the modal and reset state variables
  const closePreviewModal = () => {
    document.body.style.overflow = "visible";
    setIsAlertNewFieldVisible(false);
    setIsAddMaskingConfigOpen(false);
    setSelectedItems([]);
    setNewFieldIsMasked(false);
    setNewFilePath(null);
    setIsPopupOpen(false);
    setIsModalOpen(false);
    setIsChecked(false);
    setShowPreview(false);
    setDataType(null);
    setIsEditUserModalOpen(false);
    setIsAddUserGroup(false);
    setIsStorageContainerModal(false);
    setIsFileShareModal(false);
    setIsMiscellaneousModal(false);
    setIsGlobalColumnModal(false);
    setisNewFieldVisibleStorage(false);
    setIsTimezoneModalOpen(false);
    setisNewFieldVisible(false);
    setInputValue1(null);
    setInputValue2(null);
    setNewFieldName(null);
    setEmail(null);
    setNewFilePattern(null);
    setIsAlertNewFieldVisible(false);
    setNewFileShareFieldName(null);
    setisNewFieldVisibleFileShare(false);
    setInput1Error(null);
    setEditUserInput(editedUserGroup.name || "");
    setChosenItems(new Set());
  };

  const closeGlobalPreviewModal = () => {
    setIsPopupOpen(false); // Close the popup
    setInputValue(""); // Clear the search input field
    // fetchDownloadConfigData(""); // Trigger API call with empty input
  };

  const handleClosePopup = () => {
    closePreviewModal(); // Call the first function
    closeGlobalPreviewModal(); // Call the second function
    setShowUploadPopup(false);
    setShowMaskingUploadPopup(false);
  };

  // eslint-disable-next-line
  const handleAzureInputChange = (e) => {
    setTextInputValue(e.target.value);
  };

  const handleEditModalInputChange = (e) => {
    setEditUserInput(e.target.value);
    setHasNameChanged(true);
    validateForm();
  };

  useEffect(() => {
    setEditUserInput(editedUserGroup.name || "");
  }, [editedUserGroup.name]);

  // Function to handle changes in the input

  // Function to save the name back to `editedUserGroup` state (if needed)
  // eslint-disable-next-line
  const saveNameToUserGroup = () => {
    setEditedUserGroup((prevState) => ({
      ...prevState,
      name: editUserInput, // Update the `name` field in the main state
    }));
  };

  // eslint-disable-next-line
  const handleListUsergroups = () => {
    const promises = [
      fetch(`${API_URL}/api/core/blob-groups/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      }).then((response) => response.json()),
      // Add more fetch requests if needed
    ];

    Promise.all(promises)
      .then((data) => {
        if (data.length > 0) {
          setAvailableItems(data[0]);
          setModalVisible(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("AddUser");
          setLoading(false);
        } else {
          console.error("No data received from API for Preview.");
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  };

  const handleItemClick = (item, event) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    setSelectedItems((prevSelectedItems) => {
      if (isCtrlPressed) {
        // If Ctrl key is pressed, toggle the selection of the item
        if (prevSelectedItems.includes(item)) {
          // Item is already selected, remove it from the selection
          return prevSelectedItems.filter(
            (selectedItem) => selectedItem !== item
          );
        } else {
          // Item is not selected, add it to the selection
          return [...prevSelectedItems, item];
        }
      } else {
        // If Ctrl key is not pressed, select only the clicked item
        return [item];
      }
    });
  };

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted.current) {
    } else {
      // Set the ref to false after the initial render
      isMounted.current = false;
    }
  }, [selectedItems]);

  // eslint-disable-next-line
  const handleChosenItemClick = (item, event) => {
    // Check if the Ctrl key is pressed
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    setChosenItems((prevChosenItems) => {
      if (isCtrlPressed) {
        // If Ctrl key is pressed, toggle the selection of the item
        if (prevChosenItems.includes(item)) {
          // Item is already selected, remove it from the selection
          return prevChosenItems.filter((chosenItem) => chosenItem !== item);
        } else {
          // Item is not selected, add it to the selection
          return [...prevChosenItems, item];
        }
      } else {
        // If Ctrl key is not pressed, select only the clicked item
        return [item];
      }
    });
  };

  let uniqueChosenItems = [];

  const handleMoveToRight = () => {
    // Check if there are selected items
    if (selectedItems.length > 0) {
      // Use a callback function for state updates to ensure the latest state
      setChosenItems((prevChosenItems) => {
        // Combine the existing and newly selected permissions
        const updatedChosenItems = [...prevChosenItems, ...selectedItems];

        // Convert the array to a Set to remove duplicates, then convert it back to an array
        uniqueChosenItems = Array.from(new Set(updatedChosenItems));

        return uniqueChosenItems;
      });

      // Use a callback function for state updates to ensure the latest state
      setAvailableItems((prevAvailableItems) => {
        // Remove the moved items from the Available Permission container
        return prevAvailableItems.filter(
          (item) => !selectedItems.includes(item)
        );
      });

      // Clear the selection
      setSelectedItems([]);
    }

    // Move console.log here
    setTimeout(() => {}, 0);
  };

  const handleUserPermissions = () => {
    const promises = [
      fetch(`${API_URL}/api/core/blob-roles/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      }).then((response) => response.json()),
      // Add more fetch requests if needed
    ];

    Promise.all(promises)
      .then((data) => {
        if (data.length > 0) {
          setAvailableItems(data[0]);
          // setSelectedData(data[0]);
          setChosenItems(new Set());
          setModalVisible(true);
          setIsAddUserGroup(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("AddUser");
          setLoading(false);
        } else {
          console.error("No data received from API for Preview.");
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  };

  useEffect(() => {
    setChosenItems([]);

    setIsAddUserGroup(true);
  }, []);

  useEffect(() => {}, [availableItems]);

  useEffect(() => {}, [chosenItems]);

  // useEffect(() => {
  //   // Fetch available permissions when the component mounts
  //   handleUserPermissions();

  //   // eslint-disable-next-line
  // }, []);

  const handleMoveToLeft = () => {
    // setAvailableItems([...availableItems, ...selectedItems]);
    // setChosenItems(chosenItems.filter((item) => !selectedItems.includes(item)));
    // setSelectedItems([]);

    if (selectedItems.length > 0) {
      // Update editedUserGroup with the selected items removed from roles
      setEditedUserGroup((prevEditedUserGroup) => {
        const prevRoles = Array.isArray(prevEditedUserGroup?.roles)
          ? prevEditedUserGroup.roles
          : [];

        // Filter out only selected items from roles
        const updatedRoles = prevRoles.filter(
          (role) =>
            !selectedItems.some((selectedItem) => selectedItem.id === role.id)
        );

        return {
          ...prevEditedUserGroup,
          roles: updatedRoles,
        };
      });

      // Add the selected items back to the available items list
      setAvailableItems((prevAvailableItems) => {
        // Ensure the selected items are not already in the available list
        const filteredAvailableItems = prevAvailableItems.filter(
          (item) =>
            !selectedItems.some((selectedItem) => selectedItem.id === item.id)
        );

        const updatedAvailableItems = [
          ...filteredAvailableItems,
          ...selectedItems,
        ];

        // Remove duplicates
        const uniqueAvailableItems = Array.from(
          new Set(updatedAvailableItems.map((item) => item.id))
        ).map((id) => updatedAvailableItems.find((item) => item.id === id));

        return uniqueAvailableItems;
      });

      // Update chosenItems by removing only the selected items
      setChosenItems((prevChosenItems) => {
        const currentChosenItems = Array.isArray(prevChosenItems)
          ? prevChosenItems
          : [];

        // Filter out selected items from the chosen list
        const updatedChosenItems = currentChosenItems.filter(
          (item) =>
            !selectedItems.some((selectedItem) => selectedItem.id === item.id)
        );

        return updatedChosenItems;
      });

      // Clear the selection after moving the items
      setSelectedItems([]);
    }

    setTimeout(() => {}, 0);
  };

  // eslint-disable-next-line
  const handleDcGroupsChange = (index, value) => {
    setUserGroupsData((prevUserGroupsData) => {
      const updatedUserGroupsData = [...prevUserGroupsData];
      updatedUserGroupsData[index].dcgroups = value;
      return updatedUserGroupsData;
    });
  };

  const handleClick = (groupId) => {
    // Check if groupId is defined before calling handleEditUserPermissions
    if (groupId) {
      handleEditUserPermissions(groupId);
    } else {
      // console.error("Invalid groupId:", groupId);
    }
  };

  useEffect(() => {
    handleClick();
    // handleEditUserPermissions()
    // eslint-disable-next-line
  }, [chosenItems]);

  const handleEditUserPermissions = (groupId) => {
    const promises = [
      fetch(`${API_URL}/api/core/blob-groups/${groupId}/`, {
        method: "GET",
        // headers: {
        //   Authorization: `Bearer ${token}`,
        //   "Content-Type": "application/json",
        //   // "X-CSRFToken": csrfToken,
        // },
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }).then((response) => response.json()),
      // Add more fetch requests if needed
    ];

    Promise.all(promises)
      .then((data) => {
        if (data.length > 0) {
          setEditedUserGroup(data[0]);
          // setSelectedData(data[0]);
          setModalVisible(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("EditUser");
          setIsEditing(true);
          setLoading(false);
        } else {
          console.error("No data received from API for Preview.");
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  };

  useEffect(() => {
    setDynamicGroupValues([...editedUserGroup.dcgroups_id]);
  }, [editedUserGroup.dcgroups_id]);

  const validateForm = () => {
    // Check if input values are valid non-empty strings
    const isValidInputValue1 =
      typeof inputValue1 === "string" && inputValue1.trim() !== "";
    const isValidEditUserInput =
      typeof editUserInput === "string" && editUserInput.trim() !== "";

    // Convert input values to lowercase for case-insensitive comparison
    const inputValue1Lower =
      typeof inputValue1 === "string" ? inputValue1.toLowerCase() : "";
    const isNameUnique = !userGroupName.includes(inputValue1Lower);

    const editUserInputLower =
      typeof editUserInput === "string" ? editUserInput.toLowerCase() : "";
    const isEditUserInputNameUnique =
      !userGroupName.includes(editUserInputLower);

    // Determine the tooltip message based on validation
    let tooltipMessage = "";

    if (isEditing) {
      if (!hasNameChanged) {
        tooltipMessage = "";
      } else if (!isValidEditUserInput) {
        tooltipMessage = "Edit user input required";
      } else if (!isEditUserInputNameUnique) {
        tooltipMessage = "Edit user name already exists";
      }
    } else {
      if (!isValidInputValue1) {
        tooltipMessage = "Name required";
      } else if (!isNameUnique) {
        tooltipMessage = "Name already exists";
      }
    }

    // Set tooltip message
    setTooltipMessage(tooltipMessage);

    // Enable Save button if all conditions are met
    setIsSaveDisabled(
      (isEditing &&
        hasNameChanged &&
        (!isValidEditUserInput || !isEditUserInputNameUnique)) ||
        (!isEditing && (!isValidInputValue1 || !isNameUnique))
    );
  };

  // Call validateForm whenever the input changes
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line
  }, [inputValue1, editUserInput, userGroupName]); // Call validateForm whenever these values change

  const handleUserGroupSave = async () => {
    if (isSaveDisabled) return; // Prevent save if disabled

    try {
      // saveNameToUserGroup();
      const url =
        editedUserGroup && editedUserGroup?.id
          ? `${API_URL}/api/core/blob-groups/${editedUserGroup.id}/`
          : `${API_URL}/api/core/blob-groups/create/`;

      const method = editedUserGroup && editedUserGroup?.id ? "PUT" : "POST";

      let dcgroupsValue = method === "POST" ? inputValue2 : dcgroupsState || [];
      if (!Array.isArray(dcgroupsValue)) {
        dcgroupsValue = [dcgroupsValue];
      }

      // Ensure selectedItems is an array
      const selectedItemsArray = Array.isArray(selectedItems)
        ? selectedItems
        : [];

      const chosenItemsArray = Array.isArray(chosenItems)
        ? chosenItems
        : Array.from(chosenItems);

      const uniqueSelectedItems = Array.from(
        new Set([...chosenItemsArray, ...selectedItemsArray])
      );

      const data = await secureApiCall(url, method, {
        roles: uniqueSelectedItems,
        name: method === "POST" ? inputValue1 : editUserInput,
        description: "admin",
        dcgroups: dcgroupsValue.join(","),
      });

      localStorage.setItem("chosenItems", JSON.stringify(uniqueSelectedItems));

      setResponseMessage(data.message);

      fetchData();

      // Ensure userGroupsData is always an array before updating
      setUserGroupsData((prevState) => {
        const prevData = Array.isArray(prevState) ? prevState : [];

        if (
          data.data &&
          Array.isArray(data.data) &&
          typeof data.data === "object"
        ) {
          // Find the index of the edited user group in the previous data array
          const editedIndex = prevData.findIndex(
            (group) => group.id === editedUserGroup?.id
          );

          setChosenItems([...chosenItems]);

          if (editedIndex !== -1) {
            // If the edited user group exists in the previous data, update it
            const updatedData = [...prevData];
            updatedData[editedIndex] = data.data[0]; // Update with the new user group data
            return updatedData;
          } else {
            // If the user group does not exist, add it to the list
            return [...prevData, data.data[data.data.length - 1]];
          }
        } else {
          // In case data.data is not defined or not an array, return previous data
          return prevData;
        }
      });

      setInputValue1("");
      setInputValue2("");
      setSelectedItems([]);
      setIsModalOpen(false);
      setChosenItems([]); // Ensure chosenItems is reset to an array
      setDcGroups([]);
      closePreviewModal();
      setIsEditUserModalOpen(false);
      setLoading(false);
      setIsAddUserGroup(false);
    } catch (error) {
      console.error("Error occurred during save:", error);
      setResponseMessage("Error: Something went wrong.");
    }
  };

  useEffect(() => {
    handleUserGroupSave();
    // eslint-disable-next-line
  }, []);

  const handleChooseAll = () => {
    // Move all items from availableItems to chosenItems
    setChosenItems([...chosenItems, ...availableItems]);
    setAvailableItems([]);

    // Clear selectedItems array
    setSelectedItems([]);
  };

  const handleRemoveAll = () => {
    // Move all items from chosenItems to availableItems
    setAvailableItems([...availableItems, ...chosenItems]);
    setChosenItems([]);

    // Clear selectedItems array
    setSelectedItems([]);
  };

  // eslint-disable-next-line
  const handleEditMoveToRight = () => {
    setChosenItems((prevChosen) => [
      ...prevChosen,
      ...selectedItems.filter(
        (item) => !prevChosen.some((chosen) => chosen.id === item.id)
      ),
    ]);
    setAvailableItems((prevAvailable) =>
      prevAvailable.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id)
      )
    );
    setSelectedItems([]);
  };

  // eslint-disable-next-line
  const handleEditMoveToLeft = () => {
    setAvailableItems((prevAvailable) => [
      ...prevAvailable,
      ...selectedItems.filter(
        (item) => !prevAvailable.some((available) => available.id === item.id)
      ),
    ]);
    setChosenItems((prevChosen) =>
      prevChosen.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id)
      )
    );
    setSelectedItems([]);
  };

  const handleEditChooseAll = () => {
    // Ensure prevChosen is always an array before applying operations
    setChosenItems((prevChosen) => {
      const currentChosenItems = Array.isArray(prevChosen) ? prevChosen : [];

      return [
        ...currentChosenItems,
        // Filter availableItems and add only those that are not already in chosenItems
        ...availableItems.filter(
          (item) => !currentChosenItems.some((chosen) => chosen.id === item.id)
        ),
      ];
    });

    // Clear availableItems as all items are chosen
    setAvailableItems([]);
  };

  const handleEditRemoveAll = () => {
    // const chosenItemsArray = Array.from(chosenItems);

    //   setAvailableItems(prevAvailable => [
    //     ...prevAvailable,
    //     ...chosenItemsArray.filter(item => !prevAvailable.some(available => available.id === item.id))
    //   ]);

    //   setChosenItems(new Set()); // Clearing chosenItems

    // Get all chosen items from chosenItems state
    const allChosenItems = [...chosenItems]; // Create a copy to avoid mutation

    if (allChosenItems.length > 0) {
      // Update editedUserGroup by removing all chosen items from its roles
      setEditedUserGroup((prevEditedUserGroup) => {
        const prevRoles = Array.isArray(prevEditedUserGroup?.roles)
          ? prevEditedUserGroup.roles
          : [];

        // Filter out all the chosen items from roles
        const updatedRoles = prevRoles.filter(
          (role) =>
            !allChosenItems.some((chosenItem) => chosenItem.id === role.id)
        );

        return {
          ...prevEditedUserGroup,
          roles: updatedRoles,
        };
      });

      // Update availableItems by adding all chosen items
      setAvailableItems((prevAvailableItems) => {
        // Remove any items that are already in availableItems
        const filteredAvailableItems = prevAvailableItems.filter(
          (item) =>
            !allChosenItems.some((chosenItem) => chosenItem.id === item.id)
        );

        // Combine all chosen items back to the availableItems
        const updatedAvailableItems = [
          ...filteredAvailableItems,
          ...allChosenItems,
        ];

        // Ensure no duplicates in availableItems by converting to a Set and back to an array
        const uniqueAvailableItems = Array.from(
          new Set(updatedAvailableItems.map((item) => item.id))
        ).map((id) => updatedAvailableItems.find((item) => item.id === id));

        return uniqueAvailableItems;
      });

      // Clear all items from chosenItems as they have been removed
      setChosenItems([]); // Ensure that chosenItems are cleared immediately

      // Clear the selected items as we have removed everything
      setSelectedItems([]);

      // Log after the state is updated
      setTimeout(() => {}, 0);
    }
  };

  useEffect(() => {
    const chosenItemsArray = Array.from(chosenItems);

    // Filter availableItems to include only those that are not in chosenItems
    const filtered = availableItems.filter(
      (item) => !chosenItemsArray.some((chosen) => chosen.id === item.id)
    );

    setFilteredItems(filtered);
  }, [chosenItems, availableItems]);

  // eslint-disable-next-line
  const addItemToChosen = (item) => {
    setChosenItems((prevChosen) => new Set(prevChosen).add(item));
  };

  // Function to remove an item from chosenItems
  // eslint-disable-next-line
  const removeItemFromChosen = (item) => {
    setChosenItems((prevChosen) => {
      const newSet = new Set(prevChosen);
      newSet.delete(item);
      return newSet;
    });
  };

  useEffect(() => {
    if (editedUserGroup && Array.isArray(editedUserGroup.roles)) {
      setChosenItems(new Set(editedUserGroup.roles));
    }
  }, [editedUserGroup]);

  useEffect(() => {}, [filteredItems]);

  const handleAddMoveToLeft = () => {
    // Move selected items from chosen to available
    setAvailableItems([...availableItems, ...selectedItems]);
    setChosenItems(chosenItems.filter((item) => !selectedItems.includes(item)));
    setSelectedItems([]);
  };

  const renderAddUserGroup = () => {
    const addUserModalWidth = (width * 0.66).toFixed(2);
    const addUserModalHeight = (height * 0.86).toFixed(2);
    // eslint-disable-next-line
    const inputContainerWidth = (addUserModalWidth * 0.99).toFixed(2);
    const inputContainerHeight = (addUserModalHeight * 0.08).toFixed(2);
    const permissionsContainerWidth = (addUserModalWidth * 0.99).toFixed(2);
    const permissionContainerHeight = (addUserModalHeight * 0.65).toFixed(2);
    const authContainerWidth = (addUserModalWidth * 0.99).toFixed(2);
    const authContainerHeight = (addUserModalHeight * 0.12).toFixed(2);
    return (
      <div
        className=" flex flex-col items-center   "
        style={{
          width: `${addUserModalWidth}px`,
          height: `${addUserModalHeight}px`,
        }}
      >
        <div
          className="bg-purpleshade1  flex flex-row justufy-between items-center   "
          style={{
            width: `${addUserModalWidth}px`,
            height: `${inputContainerHeight}px`,
          }}
        >
          <div
            className="flex flex-row justify-between items-center px-3"
            style={{
              width: `${addUserModalWidth}px`,
              height: `${inputContainerHeight}px`,
            }}
          >
            <h2 className="font-[400] text-white text-xs">Add UserGroup</h2>
            <div className="flex flex-row items-center space-x-5 ">
              <label className="text-xs text-white">Name</label>

              <input
                className="outline-none p-1 font-base text-xs rounded-sm h-6"
                type="text"
                name="name"
                value={inputValue1}
                onChange={handleModalInputChange1}
                autoFocus="cursor"
                autoComplete="off"
              />
              {/* {input1Error && <div className="error-message">{input1Error}</div>} */}
              <button
                className=" text-2xl font-semibold text-white "
                onClick={closePreviewModal}
              >
                &times;
              </button>
              {/**/}
            </div>
          </div>
        </div>
        <div
          className="  flex flex-row justify-between items-center px-10"
          style={{
            width: `${addUserModalWidth}px`,
            height: `${inputContainerHeight}px`,
          }}
        >
          <h1 className=" font-[400] text-xs ">Permissions</h1>
          {/* <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: "14px" }} /> */}
        </div>

        <div
          className=" flex flex-col justify-between items-center px-3 mt-2"
          style={{
            width: `${permissionsContainerWidth}px`,
            height: `${permissionContainerHeight}px`,
          }}
        >
          <div
            className="flex flex-col space-y-2"
            style={{
              width: `${(permissionsContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(permissionContainerHeight * 0.98).toFixed(2)}px`,
            }}
          >
            <div
              className="flex flex-row items-center justify-evenly space-x-6 "
              style={{
                width: `${(permissionsContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(permissionContainerHeight * 0.9).toFixed(2)}px`,
              }}
            >
              <div className="flex flex-col">
                <div>
                  <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-lg bg-purpleshade1 ">
                    <h1 className=" p-1 text-white text-xs">
                      Available Permission
                    </h1>
                  </div>
                  <div
                    className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {availableItems.map((item, index) => (
                      <div
                        className="flex flex-col space-y-3 font-light py-0.5 text-xs "
                        key={index}
                        onClick={(event) => handleItemClick(item, event)}
                        style={{
                          cursor: "pointer",

                          background: selectedItems.includes(item)
                            ? "#E5E9F2"
                            : "transparent",
                        }}
                      >
                        {item.description}
                      </div>
                    ))}
                  </div>
                </div>
                {/* <button
                className="w-28 h-6  rounded  cursor-pointe mt-4 font-semibold text-xs bg-gray text-black"
                onClick={handleChooseAll}
              >
                Choose All
              </button>{" "} */}
                <div className="flex justify-end w-68 items-center h-8  ">
                  <button
                    className="w-28 h-6  rounded  cursor-pointer mt-1 font-medium text-xs bg-white text-black"
                    onClick={handleChooseAll}
                  >
                    Choose All
                  </button>{" "}
                </div>
              </div>
              <div className="flex flex-col h-80 w-5  space-y-4 items-center justify-center ">
                <button className="arrow-buttons" onClick={handleMoveToRight}>
                  <FontAwesomeIcon icon={faCircleRight} size="lg" />
                </button>
                <button className="arrow-buttons" onClick={handleAddMoveToLeft}>
                  <FontAwesomeIcon icon={faCircleLeft} size="lg" />
                </button>
              </div>
              <div className="flex flex-col  ">
                <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-md bg-purpleshade1 text-white ">
                  <h1 className=" p-1 text-white text-xs">Chosen Permission</h1>
                </div>
                <div
                  className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {chosenItems &&
                    Array.isArray(chosenItems) &&
                    chosenItems.map((item, index) => (
                      <div
                        className="flex flex-col space-y-3 font-light p-0.5 text-xs "
                        key={index}
                        onClick={(event) => handleItemClick(item, event)}
                        style={{
                          cursor: "pointer",
                          background: selectedItems.includes(item)
                            ? "#E5E9F2"
                            : "transparent",
                        }}
                      >
                        {item.description}
                      </div>
                    ))}
                </div>
                <div className="w-68 h-9 justify-end flex">
                  <button
                    className="w-28 h-6  rounded  cursor-pointer mt-1 font-medium text-xs bg-white text-black"
                    onClick={handleRemoveAll}
                  >
                    Remove All
                  </button>
                </div>
              </div>
            </div>
            <hr className="w-[98%]  bg-[#C0C0C0]  ml-2" />
          </div>
        </div>

        <div
          className=" flex flex-col space-y-2"
          style={{
            width: `${authContainerWidth}px`,
            height: `${authContainerHeight}px`,
          }}
        >
          <h2 className="font-normal text-sm   px-8">SAML Authentication</h2>
          <div className="flex flex-row space-x-5 mt-3  px-8">
            <label className="text-xs">Azure Group</label>
            <div>:</div>
            <input
              className="border border-[#D9DADF] outline-none p-1 font-light text-xs 
                w-[80%]  pt-2 text-justify  pb-2 h-8 overflow-ellipsis cursor-default"
              type="text"
              name="name"
              value={inputValue2}
              onChange={(e) => handleModalInputChange2(e)}
              textarea={true}
            />
          </div>
        </div>
        <div className="w-[96%] h-7 flex justify-end mt-3  mr-4">
          <button
            className={`w-20 h-7 items-end rounded-lg cursor-pointer font-semibold text-xs bg-purpleshade1 text-white
               save-button ${isSaveDisabled ? "disabled" : ""}`}
            onClick={handleUserGroupSave} // Ensure handleSave is bound here
            // onClick={handleAddSaveClick}
            disabled={isSaveDisabled} // Disable button based on form validation
            // title={isSaveDisabled ? 'Name required' : ''}
            title={isSaveDisabled ? tooltipMessage : ""}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {}, [availableItems]); // Ensure availableItems is updated and logged

  useEffect(() => {
    if (!editedUserGroup) return;

    const newFilteredItems = isEditing
      ? availableItems.filter(
          (item) => !editedUserGroup.roles.some((role) => role.id === item.id)
        )
      : availableItems;

    setFilteredItems(newFilteredItems);
  }, [availableItems, editedUserGroup, isEditing]);

  useEffect(() => {}, [availableItems, editedUserGroup, isEditing]);

  useEffect(() => {
    if (Array.isArray(editedUserGroup.dcgroups)) {
      setDcgroupsState(editedUserGroup.dcgroups);
    } else {
      setDcgroupsState([editedUserGroup.dcgroups || ""]);
    }
  }, [editedUserGroup]);

  // Handle changes in the dcgroups input fields
  const handleEditDcGroupsChange = (index, value) => {
    setDcgroupsState((prevState) => {
      const updatedDcGroups = [...prevState];
      updatedDcGroups[index] = value; // Update the specific dcgroup by index
      return updatedDcGroups;
    });
  };

  useEffect(() => {
    // Simulate fetching data
    // Replace with actual data fetching logic
    const fetchData = async () => {
      setChosenItems(chosenItems);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isEditUserModalOpen) {
      // When the modal opens, load the data
      setChosenItems(new Set(editedUserGroup.roles));
    }
    // eslint-disable-next-line
  }, [isEditUserModalOpen]);

  useEffect(() => {
    renderEditUserGroup();
    // eslint-disable-next-line
  }, [chosenItems, editedUserGroup]);

  const renderEditUserGroup = () => {
    // eslint-disable-next-line
    let item = {};
    const addUserModalWidth = (width * 0.66).toFixed(2);
    const addUserModalHeight = (height * 0.86).toFixed(2);
    // eslint-disable-next-line
    const inputContainerWidth = (addUserModalWidth * 0.99).toFixed(2);
    const inputContainerHeight = (addUserModalHeight * 0.08).toFixed(2);
    const permissionsContainerWidth = (addUserModalWidth * 0.99).toFixed(2);
    const permissionContainerHeight = (addUserModalHeight * 0.65).toFixed(2);
    const authContainerWidth = (addUserModalWidth * 0.99).toFixed(2);
    const authContainerHeight = (addUserModalHeight * 0.12).toFixed(2);

    // Check if editedUserGroup is null or undefined
    if (!editedUserGroup) {
      return;
      // <div>Error: No user group data available</div>;
    }

    // eslint-disable-next-line
    const filteredItems = isEditing
      ? availableItems.filter(
          (item) => !editedUserGroup.roles.some((role) => role.id === item.id)
        )
      : availableItems;

    // eslint-disable-next-line
    const items = Array.isArray(chosenItems) ? chosenItems : [];

    return (
      <div>
        {loading ? (
          <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-10">
            <img
              src={process.env.PUBLIC_URL + "/loadergif.gif"}
              alt="logo"
              className="animate-spin w-4 h-4"
            />
            <p className="text-logintext font-[350] text-[13px] animate-pulse">
              Just a moment...
            </p>
          </div>
        ) : (
          <div>
            {editedUserGroup && (
              <div
                className=" flex flex-col items-center   "
                style={{
                  width: `${addUserModalWidth}px`,
                  height: `${addUserModalHeight}px`,
                  transition: "opacity 0.3s ease-in-out", // Smooth transition
                  opacity: loading ? 0.5 : 1, // Opacity reduced when loading
                }}
              >
                <div
                  className="bg-purpleshade1  flex flex-row justufy-between items-center   "
                  style={{
                    width: `${addUserModalWidth}px`,
                    height: `${inputContainerHeight}px`,
                  }}
                >
                  <div
                    className="flex flex-row justify-between items-center px-3"
                    style={{
                      width: `${addUserModalWidth}px`,
                      height: `${inputContainerHeight}px`,
                    }}
                  >
                    <h2 className="font-[400] text-white text-xs">
                      Edit UserGroup
                    </h2>
                    <div className="flex flex-row items-center space-x-5 ">
                      <label className="text-xs text-white">Name</label>

                      <input
                        className="outline-none p-1 font-light text-xs rounded-sm h-6"
                        type="text"
                        name="name"
                        value={editUserInput}
                        onChange={handleEditModalInputChange}
                        title={isSaveDisabled ? "Name required" : ""}
                      />
                      {/* <input
  type="text"
  className="outline-none p-1 font-base text-xs rounded-sm h-6 placeholder:text-xs  text-red"
  value={editUserInput}
  onChange={(e) => {
    
      handleEditModalInputChange(e);
      if (input1Error) {
        setInput1Error(false); // Clear error on typing
      }
    
  }}
  placeholder={'User Group Name'}
/> */}
                      <button
                        className=" text-2xl font-semibold text-white "
                        onClick={closePreviewModal}
                      >
                        &times;
                      </button>
                      {/**/}
                    </div>
                  </div>
                </div>
                <div
                  className="  flex flex-row justify-between items-center px-10"
                  style={{
                    width: `${addUserModalWidth}px`,
                    height: `${inputContainerHeight}px`,
                  }}
                >
                  <h1 className=" font-[400] text-xs ">Permissions</h1>
                  {/* <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: "14px" }} /> */}
                </div>

                <div
                  className=" flex flex-col justify-between items-center px-3 mt-2"
                  style={{
                    width: `${permissionsContainerWidth}px`,
                    height: `${permissionContainerHeight}px`,
                  }}
                >
                  <div
                    className="flex flex-col space-y-2"
                    style={{
                      width: `${(permissionsContainerWidth * 0.97).toFixed(
                        2
                      )}px`,
                      height: `${(permissionContainerHeight * 0.98).toFixed(
                        2
                      )}px`,
                    }}
                  >
                    <div
                      className="flex flex-row items-center justify-evenly space-x-6 "
                      style={{
                        width: `${(permissionsContainerWidth * 0.97).toFixed(
                          2
                        )}px`,
                        height: `${(permissionContainerHeight * 0.9).toFixed(
                          2
                        )}px`,
                      }}
                    >
                      <div className="flex flex-col">
                        <div>
                          <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-lg bg-purpleshade1 ">
                            <h1 className=" p-1 text-white text-xs">
                              Available Permission
                            </h1>
                          </div>
                          <div
                            className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                            style={{ scrollbarWidth: "thin" }}
                          >
                            {isEditing
                              ? availableItems
                                  .filter(
                                    (item) =>
                                      !editedUserGroup.roles.some(
                                        (role) => role.id === item.id
                                      )
                                  )
                                  .map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-col space-y-3 font-light text-xs p-0.5 "
                                      onClick={(event) =>
                                        handleItemClick(item, event)
                                      }
                                      style={{
                                        cursor: "pointer",
                                        // background: selectedItems.includes(item)
                                        //   ? "lightblue"
                                        //   : "transparent",
                                        background: selectedItems.includes(item)
                                          ? "#E5E9F2"
                                          : "transparent",
                                      }}
                                    >
                                      {item.description}
                                    </div>
                                  ))
                              : availableItems.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col space-y-3 font-light text-xs p-0.5 "
                                    id={`available-${item.id}`}
                                    onClick={(event) =>
                                      handleItemClick(item, event)
                                    }
                                    style={{
                                      cursor: "pointer",
                                      // background: selectedItems.includes(item)
                                      //   ? "lightblue"
                                      //   : "transparent",
                                      background: selectedItems.includes(item)
                                        ? "#DCD9FF"
                                        : "transparent",
                                    }}
                                  >
                                    {item.description}
                                  </div>
                                ))}

                            {/* {isEditing ? renderItems(filteredItems, handleItemClick) : renderItems(availableItems, handleItemClick)} */}
                          </div>
                        </div>
                        <div className="flex justify-end w-68 items-center h-8  ">
                          <button
                            className="w-28 h-6  rounded  cursor-pointer font-medium text-xs bg-white text-black"
                            onClick={handleEditChooseAll}
                          >
                            Choose All
                          </button>{" "}
                        </div>
                      </div>
                      <div className="flex flex-col h-80 w-5  space-y-4 items-center justify-center ">
                        <button
                          className="arrow-buttons"
                          onClick={handleMoveToRight}
                        >
                          <FontAwesomeIcon icon={faCircleRight} size="lg" />
                        </button>
                        <button
                          className="arrow-buttons"
                          onClick={handleMoveToLeft}
                        >
                          <FontAwesomeIcon icon={faCircleLeft} size="lg" />
                        </button>
                      </div>
                      <div className="flex flex-col  ">
                        <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-md bg-purpleshade1 text-white ">
                          <h1 className=" p-1 text-white text-xs">
                            Chosen Permission
                          </h1>
                        </div>
                        <div
                          className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                          style={{
                            scrollbarWidth: "thin",
                            transition: "opacity 0.3s ease-in-out", // Smooth transition
                            opacity: loading ? 0.5 : 1, // Opacity reduced when loading
                          }}
                        >
                          {/* {Array.from(chosenItems).map((item, index) => ( */}
                          {[...chosenItems].map((item, index) => (
                            <div
                              key={index}
                              className="flex flex-col space-y-3 font-light p-0.5 text-xs "
                              onClick={(event) => handleItemClick(item, event)}
                              style={{
                                cursor: "pointer",
                                background: selectedItems.some(
                                  (selectedItem) => selectedItem.id === item.id
                                )
                                  ? "#E5E9F2"
                                  : "transparent",
                                // background: selectedItems.includes(item) ? "gray" : "transparent",
                              }}
                            >
                              {item.name}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end w-68 items-center h-8  ">
                          <button
                            className="w-28 h-6   rounded  cursor-pointer  font-medium text-xs bg-white text-black"
                            onClick={handleEditRemoveAll}
                          >
                            Remove All
                          </button>
                        </div>
                      </div>
                    </div>
                    <hr className="w-[98%]  bg-[#C0C0C0]  ml-2" />
                  </div>
                </div>

                <div
                  className=" flex flex-col space-y-2"
                  style={{
                    width: `${authContainerWidth}px`,
                    height: `${authContainerHeight}px`,
                  }}
                >
                  <h1 className="font-normal text-xs ml-3 px-8">
                    SAML Authentication
                  </h1>

                  {Array.isArray(dcgroupsState) ? (
                    dcgroupsState.map((groupId, index) => (
                      <div
                        key={index}
                        className="flex flex-row text-xs space-x-5 mt-3 ml-3 px-8"
                      >
                        <label className="text-sm">Azure Group</label>
                        <div>:</div>
                        <input
                          className="border w-[80%] border-lightgray-100 outline-none p-1 font-light text-xs"
                          type="text"
                          name={`dcgroups-${index}`}
                          value={groupId || ""}
                          onChange={(e) =>
                            handleEditDcGroupsChange(index, e.target.value)
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-row space-x-5 mt-3 ml-3 px-8">
                      <label className="text-xs">Azure Group</label>
                      <div>:</div>
                      <input
                        className="border w-[80%] border-lightgray-100 outline-none p-1 font-light text-xs"
                        type="text"
                        name="dcgroups"
                        value={dcgroupsState[0] || ""}
                        onChange={(e) =>
                          handleEditDcGroupsChange(0, e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="w-[96%] h-7 flex justify-end mt-3  mr-4">
                  <button
                    className={`w-20 h-6 items-end rounded-lg cursor-pointer font-semibold text-xs bg-purpleshade1 text-white
                    save-button ${isSaveDisabled ? "disabled" : ""}`}
                    onClick={handleUserGroupSave} // Ensure handleSave is bound here
                    // title={isSaveDisabled ? 'Name required' : ''}
                    title={isSaveDisabled ? tooltipMessage : ""}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (
      option === "User Group" ||
      option === "Storage Container" ||
      option === "File Share" ||
      option === "S3 Storage" ||
      option === "GCP" ||
      option === "Global Column Config" ||
      option === "Permanent Masking" ||
      option === "Alert"
    ) {
      setIsModalOpen(false);
      setIsAddUserGroup(false);
      setIsEditUserModalOpen(false);
      setSelectionUserGroupDeletion(false);
    }
  };

  useEffect(() => {
    // console.log("Selected Option:", selectedOption);
  }, [selectedOption]);

  useEffect(() => {
    if (selectedOption === "User Group") {
      fetchData();
    }
  }, [selectedOption]); // Runs when selectedOption changes

  const handleTableSave = () => {
    handleStorageAccountSave(); // Pass false to indicate it's not a new field
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
              onClick={handlePopupClose}
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

  // eslint-disable-next-line
  const GlobalNewFieldPopup = ({ onClose, onSave }) => {
    const handleSave = () => {
      onSave(newFieldName, newFieldIsMasked);
      onClose();
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <input
              className="newinput w-full border border-gray-300 rounded p-2"
              type="text"
              placeholder="Enter Field Name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
            />
          </div>
          <div className="flex items-center mb-4">
            <IsMaskedSwitch
              isMasked={newFieldIsMasked}
              onToggle={(isChecked) => setNewFieldIsMasked(isChecked)}
            />
            <label className="ml-2 text-sm">Is Masked</label>
          </div>
          <div className="flex justify-end">
            <button
              className="mr-2 px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePopupClose = () => {
    setShowDownloadPopup(false);
  };

  const handleDownloadButtonClick = () => {
    setShowDownloadPopup(true);
  };

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

  // const DeleteAlertConfirmationPopup = ({ alertAccessData, onCancel, onConfirm }) => {
  //   return (
  //     <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-50">
  //       <div className="bg-white p-6 rounded-lg shadow-lg w-80 h-32 flex flex-col space-y-4">
  //         <p className="font-medium text-sm text-red-500 text-center">
  //           Are you sure you want to delete <b>{alertAccessData.file_regex}</b>?
  //         </p>
  //         <div className="flex space-x-4 justify-center">
  //           <button
  //             className="w-20 h-7 bg-gray-300 text-black text-xs font-medium border border-black rounded-lg"
  //             onClick={onCancel}
  //           >
  //             Cancel
  //           </button>
  //           <button
  //             className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
  //             onClick={() => onConfirm(alertAccessData.id)}
  //           >
  //             Yes
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

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

  const UserDeleteConfirmationPopup = ({
    //  userGroupIndex,
    context,
    onCancel,
    onConfirm,
  }) => {
    const displayName =
      context.name || context.account_name || "the selected user";

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 ml-56 mt-40">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[350px] h-[120px] flex flex-col items-center space-y-4">
          <p className="font-medium text-[11px] text-red-500">
            {/* Are You Sure You want to Delete <span className="text-black">{context.account_name}</span> ? */}
            Are you sure you want to delete{" "}
            <span className="text-red-500">{displayName}</span>?
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
              // onClick={() => onConfirm(userGroupIndex)}
              onClick={() => onConfirm(context)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleClearSelectedFile = () => {
    setSelectedFileName("");
    setSelectedMaskedFileName("");
  };

  const handleUploadPopupClose = () => {
    setShowUploadPopup(false);
    setShowMaskingUploadPopup(false);
  };

  const modalWidth = (width * 0.28).toFixed(2);
  const modalHeight = (height * 0.8).toFixed(2);
  const marginleft = (width * 0.2).toFixed(2);
  const timezoneHeight = (modalHeight * 0.7).toFixed(2);
  // eslint-disable-next-line
  const listHeight = (timezoneHeight * 0.9).toFixed(2);
  // eslint-disable-next-line
  const searchWidth = (modalWidth * 0.9).toFixed(2);
  const searchHeight = (modalHeight * 0.07).toFixed(2);
  // eslint-disable-next-line
  const timezoneContainerWidth = (modalWidth * 0.9).toFixed(2);
  const timezoneContainerHeight = (modalHeight * 0.7).toFixed(2);
  // eslint-disable-next-line
  const timelistWidth = (timezoneContainerHeight * 0.95).toFixed(2);
  // eslint-disable-next-line
  const timelistHeight = (timezoneContainerHeight * 0.9).toFixed(2);
  // eslint-disable-next-line
  const UploadPopup = ({}) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-[9999]">
        <div
          className="relative bg-white flex flex-col   shadow-md shadow-slate-500/30 rounded-lg  transform -translate-x-1/2 transition-right-0.3s ease-in-out"
          style={{
            width: `${modalWidth}px`, // Use viewport width directly
            height: `${modalHeight}px`, // Use viewport height directly
            // boxSizing: 'border-box',
            // padding: '20px',
            marginLeft: `${marginleft}px`,
          }}
        >
          <div
            className="flex  justify-end px-2 "
            style={{
              width: `${modalWidth}px`,
              height: `${modalHeight * 0.07}px`,
            }}
          >
            <button
              className="text-2xl font-semibold "
              onClick={() => {
                handleUploadPopupClose();
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
            </button>
          </div>

          <div
            className=" flex justify-center px-6 items-center"
            style={{ width: `${modalWidth}px`, height: `${searchHeight}px` }}
          >
            <p className="text-sm">Upload</p>
          </div>
          <div
            className=" flex flex-col  items-center px-3 mt-2"
            style={{
              width: `${modalWidth}px`,
              height: `${modalHeight * 0.8}px`,
            }}
          >
            <div
              className="   rounded-lg item-center px-2 flex flex-col space-y-4"
              style={{
                width: `${(modalWidth * 0.9).toFixed(2)}px`,
                height: `${(modalHeight * 0.8 * 0.98).toFixed(2)}px`,
              }}
            >
              <div
                className=' bg-purpleshadeL border border-dashed border-gray-100 flex flex-col items-center space-y-4 " '
                style={{
                  width: `${(modalWidth * 0.85).toFixed(2)}px`,
                  height: `${(modalHeight * 0.75 * 0.98 * 0.6).toFixed(2)}px`,
                }}
              >
                <img
                  src={process.env.PUBLIC_URL + "/Upload-icon.png"}
                  alt="uploadicon"
                  className=" h-14 w-14 mt-6"
                />
                <p className="text-sm mt-5">
                  Drag & drop files or{" "}
                  <span
                    className="text-blue-800 underline"
                    onClick={handleBrowseClick}
                  >
                    Browse
                  </span>
                </p>
                <p className="text-[10px]">Supported formats: xlsx</p>
              </div>

              <div
                className=" flex flex-col  items-center py-2 px-3 space-y-6 rounded"
                style={{
                  width: `${(modalWidth * 0.85).toFixed(2)}px`,
                  height: `${(modalHeight * 0.75 * 0.98 * 0.5).toFixed(2)}px`,
                }}
              >
                <div
                  className=" flex flex-row  items-center justify-center px-3 rounded"
                  style={{
                    width: `${(modalWidth * 0.85).toFixed(2)}px`,
                    height: `${(modalHeight * 0.75 * 0.98 * 0.3 * 0.3).toFixed(
                      2
                    )}px`,
                  }}
                >
                  <p className="text-xs">
                    Download Sample xlsx
                    <span
                      className="text-blue-800 underline ml-1"
                      onClick={handleSampleFileDownload}
                    >
                      Files
                    </span>
                  </p>
                </div>

                <div
                  className="  text-sm flex bg-white flex-row border border-[#11AF22] rounded px-2  items-center justify-between"
                  style={{
                    width: `${(modalWidth * 0.85).toFixed(2)}px`,
                    height: `${(modalHeight * 0.75 * 0.98 * 0.3 * 0.3).toFixed(
                      2
                    )}px`,
                  }}
                >
                  <input
                    type="text"
                    className="outline-none"
                    placeholder="your-file-here.xlsx"
                    value={selectedFileName}
                    readOnly
                  />

                  <button onClick={handleClearSelectedFile}>
                    <img
                      src={process.env.PUBLIC_URL + "/closefile.png"}
                      alt="close"
                      className="h-3 w-3"
                    />
                  </button>
                </div>
                <div
                  className=" flex flex-row bg-purpleshade1 cursor-pointer items-center justify-center px-3  rounded"
                  style={{
                    width: `${(modalWidth * 0.85).toFixed(2)}px`,
                    height: `${(modalHeight * 0.75 * 0.98 * 0.3 * 0.3).toFixed(
                      2
                    )}px`,
                  }}
                >
                  <button
                    className="  px-4 rounded-sm 
                           justify-center items-center font-medium text-sm bg-purpleshade1
                          text-white  "
                    onClick={handleUploadFile}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // eslint-disable-next-line
  const MaskingUploadPopup = ({}) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-[9999]">
        <div
          className="relative bg-white flex flex-col   shadow-md shadow-slate-500/30 rounded-lg  transform -translate-x-1/2 transition-right-0.3s ease-in-out"
          style={{
            width: `${modalWidth}px`, // Use viewport width directly
            height: `${modalHeight}px`, // Use viewport height directly
            // boxSizing: 'border-box',
            // padding: '20px',
            marginLeft: `${marginleft}px`,
          }}
        >
          <div
            className="flex  justify-end px-2 "
            style={{
              width: `${modalWidth}px`,
              height: `${modalHeight * 0.07}px`,
            }}
          >
            <button
              className="text-2xl font-semibold "
              onClick={() => {
                handleUploadPopupClose();
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
            </button>
          </div>

          <div
            className=" flex justify-center px-6 items-center"
            style={{ width: `${modalWidth}px`, height: `${searchHeight}px` }}
          >
            <p className="text-sm">Upload</p>
          </div>
          <div
            className=" flex flex-col  items-center px-3 mt-2"
            style={{
              width: `${modalWidth}px`,
              height: `${modalHeight * 0.8}px`,
            }}
          >
            <div
              className="   rounded-lg item-center px-2 flex flex-col space-y-4"
              style={{
                width: `${(modalWidth * 0.9).toFixed(2)}px`,
                height: `${(modalHeight * 0.8 * 0.98).toFixed(2)}px`,
              }}
            >
              <div
                className=' bg-purpleshadeL border border-dashed border-gray-100 flex flex-col items-center space-y-4 " '
                style={{
                  width: `${(modalWidth * 0.85).toFixed(2)}px`,
                  height: `${(modalHeight * 0.75 * 0.98 * 0.6).toFixed(2)}px`,
                }}
              >
                <img
                  src={process.env.PUBLIC_URL + "/Upload-icon.png"}
                  alt="uploadicon"
                  className=" h-14 w-14 mt-6"
                />
                <p className="text-sm mt-5">
                  Drag & drop files or{" "}
                  <span
                    className="text-blue-800 underline"
                    onClick={handleMaskedBrowseClick}
                  >
                    Browse
                  </span>
                </p>
                <p className="text-[10px]">Supported formats: xlsx</p>
              </div>

              <div
                className=" flex flex-col  items-center py-2 px-3 space-y-6 rounded"
                style={{
                  width: `${(modalWidth * 0.85).toFixed(2)}px`,
                  height: `${(modalHeight * 0.75 * 0.98 * 0.5).toFixed(2)}px`,
                }}
              >
                <div
                  className=" flex flex-row  items-center justify-center px-3 rounded"
                  style={{
                    width: `${(modalWidth * 0.85).toFixed(2)}px`,
                    height: `${(modalHeight * 0.75 * 0.98 * 0.3 * 0.3).toFixed(
                      2
                    )}px`,
                  }}
                >
                  <p className="text-xs">
                    Download Sample xlsx
                    <span
                      className="text-blue-800 underline ml-1"
                      onClick={handleMaskedSampleFileDownload}
                    >
                      Files
                    </span>
                  </p>
                </div>

                <div
                  className="  text-sm flex bg-white flex-row border border-[#11AF22] rounded px-2  items-center justify-between"
                  style={{
                    width: `${(modalWidth * 0.85).toFixed(2)}px`,
                    height: `${(modalHeight * 0.75 * 0.98 * 0.3 * 0.3).toFixed(
                      2
                    )}px`,
                  }}
                >
                  <input
                    type="text"
                    className="outline-none"
                    placeholder="your-file-here.xlsx"
                    value={selectedMaskedFileName}
                    readOnly
                  />

                  <button onClick={handleClearSelectedFile}>
                    <img
                      src={process.env.PUBLIC_URL + "/closefile.png"}
                      alt="close"
                      className="h-3 w-3"
                    />
                  </button>
                </div>
                <div
                  className=" flex flex-row bg-purpleshade1 cursor-pointer items-center justify-center px-3  rounded"
                  style={{
                    width: `${(modalWidth * 0.85).toFixed(2)}px`,
                    height: `${(modalHeight * 0.75 * 0.98 * 0.3 * 0.3).toFixed(
                      2
                    )}px`,
                  }}
                >
                  <button
                    className="  px-4 rounded-sm 
                           justify-center items-center font-medium text-sm bg-purpleshade1
                          text-white  "
                    onClick={handleMaskedUploadFile}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCancelDelete = () => {
    setSelectedFileShareForDeletion(null);
    setSelectionUserGroupDeletion(null);
    setSelectedStorageRowForDeletion(null);
    setShowDownloadPopup(false);
  };

  const handleConfirmStorageDelete = async (storageaccountId) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        // navigate("/")
        return;
      }
      const response = await fetch(
        // `http://127.0.0.1:8000/api/admin/delete-file-shares/${fileShareId}/`,
        `${API_URL}/api/admin/delete-storage-accounts/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            storage_account_id: storageaccountId,
          }),
        }
      );

      if (response.ok) {
        // Update state to remove the deleted file share
        setContainerData((prevData) =>
          prevData.filter((container) => container.id !== storageaccountId)
        );
        setSelectedStorageRowForDeletion(null);
      } else {
        // Handle deletion failure
        console.error("Failed to delete storage container.");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      // Handle error if necessary
    } finally {
      // Close the confirmation popup
      // setSelectedFileShareForDeletion(null);
    }
  };

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
          prevData.filter((fileshare) => fileshare.id !== fileShareId)
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
        }
      );

      if (response.ok) {
        setFileShareData((prevData) =>
          prevData.filter((fileshare) => fileshare.id !== fileShareId)
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

  // eslint-disable-next-line
  const toggleFileSizeUnitDropdown = () => {
    setIsFileSizeUnitDropdownOpen((prev) => !prev);
  };

  const renderStorageContainer = () => {
    // console.log("input", inputValue);
    return (
      <div className="flex flex-col space-y-2  items-center">
        <div
          className=" flex flex-row mt-2  px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30"
          style={{
            width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
            height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
          }}
        >
          <button
            className={`w-32  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
                        ${isNewFieldVisibleStorage ? "blur-effect" : ""} 
                       ${selectedStorageRowForDeletion ? "blur-effect" : ""}
                       ${showChatbot ? "blur-effect" : ""}
                        ${showProfileModal ? "blur-effect" : ""}
                        ${isTimezoneModalOpen ? "blur-effect" : ""}`}
            onClick={() => setisNewFieldVisibleStorage(true)}
            style={{
              height: "2rem",
              maxWidth: "100%",
              maxHeight: "100%",
              overflow: "hidden",
            }}
          >
            Add New Field
          </button>
          <button
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
          </button>
        </div>
        <div
          className="flex flex-col items-center "
          style={{
            width: `${tableContainerWidth}px`,
            height: `${tableContainerHight}px`,
          }}
        >
          <div
            className={`flex rounded-t-xl   ${
              isZoomedIn ? "overflow-x-auto " : ""
            }
            ${isNewFieldVisibleStorage ? "blur-effect" : ""} 
        ${selectedStorageRowForDeletion ? "blur-effect" : ""}
        ${showChatbot ? "blur-effect" : ""} ${
              showProfileModal ? "blur-effect" : ""
            } ${isTimezoneModalOpen ? "blur-effect" : ""}`}
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.1).toFixed(2)}px`,
            }}
          >
            <table className="table-design table-fixed w-full ">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[25%]" />
                <col className="w-[50%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-t-lg">
                <tr>
                  <th className="py-2 sticky top-0 border border-none rounded-tl-lg"></th>
                  <th className="py-2 sticky top-0 border border-l-0 border-r-0 text-xs text-white font-normal">
                    Storage Account Name
                  </th>
                  <th className="py-2 sticky top-0 text-xs text-white font-normal">
                    Storage Account Key
                  </th>
                  <th className="py-2 sticky top-0 text-xs text-white font-normal rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            className="flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.8).toFixed(2)}px`,
            }}
          >
            <div
              className={`py-1 overflow-auto  ${
                isZoomedIn ? "overflow-x-auto " : ""
              }
            ${isNewFieldVisibleStorage ? "blur-effect" : ""} 
        ${selectedStorageRowForDeletion ? "blur-effect" : ""}
        ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              }`}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(tableContainerHight * 0.75).toFixed(2)}px`,
                scrollbarWidth: "thin",
              }}
            >
              <table className="table-design table-fixed w-full">
                <tbody>
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
                    containerData &&
                    containerData.map((container, index) => (
                      <tr
                        className="mt-1"
                        key={container.id}
                        onClick={() => handleRowClick(container)}
                        style={{ cursor: "pointer" }}
                        // className="border  border-l-0 border-r-0 border-lightgray-200 "
                      >
                        <td
                          className="w-[5%] text-[11px] font-light overflow-ellipsis whitespace-nowrap 
                        overflow-hidden accent-purpleshade1"
                        >
                          <input
                            // className="admin-checkbox"
                            type="checkbox"
                            onChange={() => handleCheckboxChange(container)}
                            // checked={selectedContainer === container}
                            checked={container.is_download_storage}
                            className="ml-2"
                          />
                        </td>
                        <td className="w-[25%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <input
                            type="text"
                            value={container.account_name}
                            onChange={(e) =>
                              handleContainerDataChange(
                                index,
                                "account_name",
                                e.target.value
                              )
                            }
                            // readOnly
                          />
                        </td>
                        {/* <div className="w-full"> */}
                        <td className="w-[50%]  text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden ">
                          {showAccountKey ? (
                            <React.Fragment>
                              <input
                                className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
                                type="text"
                                value={
                                  container.showActualKey &&
                                  container.account_key
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
                                className="text-xs font-light  border-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccountKeyVisibility(index);
                                }}
                              >
                                {/* <FontAwesomeIcon icon={faEye} /> */}
                                {container.showActualKey ? (
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
                                value={container.account_key || ""}
                                onChange={(e) =>
                                  handleContainerDataChange(
                                    index,
                                    "account_key",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                className="text-xs font-light border-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccountKeyVisibility(index);
                                }}
                              >
                                <FontAwesomeIcon icon={faEyeSlash} />
                              </button>
                            </React.Fragment>
                          )}
                        </td>
                        {/* </div> */}

                        <td className="w-[20%] text-xs font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <div className="flex flex-row space-x-3">
                            <button
                              className="text-xs font-light border-none  w-14 items-center justify-center
                                      rounded-md flex h-6 space-x-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefresh(container);
                              }}
                            >
                              <img src="sync-icon.png" alt="sync" />
                            </button>
                            <button
                              className="w-[20px] "
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click when button is clicked
                                setSelectedStorageRowForDeletion(container);
                              }}
                            >
                              <img
                                src="icon-delete.png"
                                alt="delete"
                                className="w-4 h-4 rounded-lg"
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
          </div>
          {isNewFieldVisibleStorage && (
            <NewFieldPopup
              newFieldName={newFieldName}
              setNewFieldName={setNewFieldName}
              setNewAccountKey={setNewAccountKey}
              newAccountKey={newAccountKey}
              handleAccountNameChange={handleAccountNameChange}
              handleAccountKeyChange={handleAccountKeyChange}
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
      </div>
    );
  };

  // eslint-disable-next-line
  const handleFieShareNameChange = (e) => {
    const inputValue = e.target.value.toLowerCase();
    setFileShareInputValue(inputValue);
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

  const renderFileShare = () => {
    const handleFileShareNameChange = (e, id) => {
      const { value } = e.target;

      // Update modifiedFileShares with the new name
      setModifiedFileShares((prev) => ({
        ...prev,
        [id]: value,
      }));
    };

    return (
      <div className="flex flex-col items-center space-y-2">
        <div
          className={` flex flex-row mt-2 r items-center justify-between px-2 bg-newgray rounded-lg shadow-md shadow-slate-500/30
     ${selectedFileShareForDeletion ? "blur-effect" : ""}
            ${isNewFieldVisibleFileShare ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} 
            ${showProfileModal ? "blur-effect" : ""}
            ${isTimezoneModalOpen ? "blur-effect" : ""}`}
          style={{
            width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
            height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
          }}
        >
          <button
            className={` h-8 flex flex-row  px-1 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
              `}
            onClick={() => {
              setisNewFieldVisibleFileShare(true);
              // handleAddFileShareNewField();
            }}
            style={{
              height: "2rem",
              maxWidth: "100%",
              maxHeight: "100%",
              overflow: "hidden",
            }}
          >
            Add New Field
          </button>
          <button
            className={`w-20  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button`}
            onClick={() => handleFileShareSaveButtonClick()}
            style={{
              height: "2rem",
              maxWidth: "100%",
              maxHeight: "100%",
              overflow: "hidden",
            }}
          >
            Save
          </button>
        </div>
        <div
          className={`flex flex-col items-center  `}
          style={{
            width: `${tableContainerWidth}px`,
            height: `${tableContainerHight}px`,
          }}
        >
          <div
            className={`flex rounded-t-xl  ${
              selectedFileShareForDeletion ? "blur-effect" : ""
            }
                        
            ${isTimezoneModalOpen ? "blur-effect" : ""}
        ${showChatbot ? "blur-effect" : ""} ${
              showProfileModal ? "blur-effect" : ""
            } ${isNewFieldVisibleFileShare ? "blur-effect" : ""}`}
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.1).toFixed(2)}px`,
            }}
          >
            <table className="table-design table-fixed w-full">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[25%]" />
                <col className="w-[50%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-t-lg">
                <tr>
                  <th className="py-2 sticky top-0 border border-none rounded-tl-lg"></th>
                  <th className="py-2 sticky top-0 border border-l-0 border-r-0 text-xs text-white font-normal">
                    File Share Name
                  </th>
                  <th className="py-2 sticky top-0 text-xs text-white font-normal">
                    File Share Path
                  </th>
                  <th className="py-2 sticky top-0 text-xs text-white font-normal rounded-tr-lg ">
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            className={`flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.8).toFixed(2)}px`,
            }}
          >
            <div
              className={`py-1  overflow-auto  ${
                isNewFieldVisibleFileShare ? "blur-effect" : ""
              }
        ${selectedFileShareForDeletion ? "blur-effect" : ""}
        ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              }`}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(tableContainerHight * 0.75).toFixed(2)}px`,
                scrollbarWidth: "thin",
                userSelect: "none",
                WebkitUserSelect: "none" /* Safari */,
                MozUserSelect: "none" /* Firefox */,
                msUserSelect: "none" /* Internet Explorer/Edge */,
              }}
            >
              <table className="table-design table-fixed w-full">
                <tbody>
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
                    fileShareData &&
                    fileShareData.map((fileshare, index) => (
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

                        <td className="w-[50%] text-[11px] font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {showAccountKey ? (
                            <React.Fragment>
                              <input
                                className="w-[85%] pr-3 outline-none border-none h-6 cursor-pointer text-lightgray-100"
                                type="text"
                                value={
                                  fileshare.showActualKey && fileshare.filepath
                                    ? fileshare.filepath
                                    : "*".repeat(
                                        fileshare.filepath
                                          ? fileshare.filepath.length
                                          : 0
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

                        <td className="w-[20%] text-xs font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <div className="flex flex-row space-x-3">
                            <button
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
                            </button>
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
                    ))
                  )}
                </tbody>
              </table>
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
                // onCancel={() => setisNewFieldVisibleFileShare(false)}
                onCancel={closePreviewModal}
                handleFileShareSaveButtonClick={handleFileShareSaveButtonClick}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (selectedOption === "Miscellaneous") {
      const fetchEncryptionType = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/admin/encryption-type/`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
            }
          );

          // if (!response.ok) {
          //   if (response.status === 401) {
          //     const responseData = await response.json();
          //     if (responseData.error === "Access token has expired") {
          //       window.location.href = "/";
          //       return;
          //     }
          //   }
          //   throw new Error("Failed to fetch encryption type");
          // }

          if (!response.ok) {
            // Check for token expiration
            if (response.status === 401) {
              try {
                const responseData = await response.json();
                if (responseData?.error === "Access token has expired") {
                  console.error("Token has expired. Redirecting to login...");
                  // Clear any relevant stored tokens
                  localStorage.removeItem("token");
                  sessionStorage.clear(); // Clear session storage if used
                  window.location.href = "/";
                  return; // Exit the function after redirect
                }
              } catch (jsonError) {
                console.error("Failed to parse JSON response:", jsonError);
              }
            }

            throw new Error("Failed to fetch encryption type");
          }

          const data = await response.json();
          console.log("Full data response:", data);

          const encryptionType = data?.data?.type;

          if (encryptionType) {
            console.log("Extracted encryption type:", encryptionType);

            if (encryptionType === "dynamic" || encryptionType === "key") {
              // Automatically select the Dynamic checkbox
              setSelectedTabState("dynamic");
              setShowDynamicOptions(true); // Ensure checkbox is activated
              setDynamicOption(encryptionType);

              // Set key value if the type is "key"
              if (encryptionType === "key") {
                setKeyValue(data?.data?.key || "");
              }
            } else if (encryptionType === "consistent") {
              // Handle "consistent" type
              setSelectedTabState("consistent");
              setShowDynamicOptions(false); // Hide dynamic options
            }
          } else {
            console.error(
              "Encryption type is undefined or data structure is unexpected"
            );
          }

          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch encryption type", error);
          setLoading(false);
        }
      };

      fetchEncryptionType();
    }
  }, [selectedOption, token, csrfToken]);

  const handleTabClick = async (tabName, key = null) => {
    try {
      const type = tabName.toLowerCase();

      const bodyData = {
        id: "1", // Ensure the id is correct as per your API requirements
        type: type, // Set the type based on the selected tab
        key: tabName === "key" ? key : null, // Only include key if tab is "key"
      };

      // Call the API to update the tab state on the server
      const response = await fetch(
        `${API_URL}/api/admin/encryption-type/update/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(bodyData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tab state on the server");
      }

      // Update the local state after a successful API call
      setSelectedTabState(tabName.toLowerCase());
      if (tabName === "key") {
        setKeyValue(key);
      }
    } catch (error) {
      console.error("Error updating tab state:", error);
    }
  };

  //   const renderMiscellaneous = () => {
  //     return (
  //       <div className="flex flex-col items-center justify-center space-y-2">
  //         <div
  //           className={` flex flex-row mt-2  items-center justify-between px-2 bg-newgray rounded-lg shadow-md shadow-slate-500/30

  //             ${showChatbot ? "blur-effect" : ""}
  //             ${showProfileModal ? "blur-effect" : ""}
  //             ${isTimezoneModalOpen ? "blur-effect" : ""}`}
  //           style={{
  //             width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
  //             height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
  //           }}
  //         ></div>

  //         <div
  //           className="flex flex-col items-center "
  //           style={{
  //             width: `${tableContainerWidth}px`,
  //             height: `${tableContainerHight}px`,
  //           }}
  //         >
  //           <div
  //             className="flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
  //             style={{
  //               width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
  //               height: `${(tableContainerHight * 0.9).toFixed(2)}px`,
  //             }}
  //           >
  //             <div
  //               className={`flex rounded-t-xl  ${
  //                 selectedFileShareForDeletion ? "blur-effect" : ""
  //               }

  //             ${isTimezoneModalOpen ? "blur-effect" : ""}
  //         ${showChatbot ? "blur-effect" : ""} ${
  //                 showProfileModal ? "blur-effect" : ""
  //               } `}
  //               style={{
  //                 width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
  //                 height: `${(tableContainerHight * 0.02).toFixed(2)}px`,
  //               }}
  //             ></div>
  //             <div
  //               className={`py-1 overflow-auto   ${
  //                 isZoomedIn ? "overflow-x-auto " : ""
  //               }

  //         ${showChatbot ? "blur-effect" : ""}
  //         ${showProfileModal ? "blur-effect" : ""}
  //        ${isTimezoneModalOpen ? "blur-effect" : ""}`}
  //               style={{
  //                 width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
  //                 height: `${(tableContainerHight * 0.75).toFixed(2)}px`,
  //                 scrollbarWidth: "thin",
  //               }}
  //             >
  //               <table className="table-design table-fixed w-full">
  //                 <colgroup>
  //                   <col className="w-[40%]" />
  //                   <col className="w-[60%]" />
  //                 </colgroup>
  //                 <tbody className=" sticky ">
  //                   {loading ? (
  //                     <tr>
  //                       <td
  //                         colSpan="2"
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
  //                     <tr className="mt-4">
  //                       <td className="w-[40%] font-light  text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden">
  //                         Encryption Type
  //                       </td>
  //                       <td className="w-[60%] font-light  text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden">
  //                         {/* <div> */}
  //                         <div className="flex flex-row gap-6 ">
  //                           {/* <div
  //                     className={`flex flex-row w-[150px] h-7  bg-newgray border border-newgray  shadow-slate-500/30 shadow-md justify-center items-center font-medium  rounded-lg `}>
  //                     <div
  //                       className={`flex-1 flex w-[70px] h-[27px] text-[10px]   rounded-l-lg items-center justify-center cursor-pointer tab ${
  //                         // selectedItem === "Consistent"
  //                          selectedTabState === "Consistent"
  //                           ? "bg-purpleshade1 text-white w-[90px] rounded-[8px] h-10 pt-1.5 text-center font-normal"
  //                           : "bg-newgray text-black w-[140px] rounded-[8px] h-10 pt-1.5 text-center font-normal"
  //                       }`}
  //                       onClick={() => handleTabClick("Consistent")}
  //                     >
  //                       <h1 className="w-[70px] h-10 pt-2 text-center font-normal">
  //                       Consistent
  //                       </h1>
  //                     </div>

  //                     <div
  //                       className={`flex-1 flex w-[70px] h-[27px] text-[10px] rounded-r-lg items-center justify-center cursor-pointer tab ${
  //                         // selectedItem === "Dynamic"
  //                          selectedTabState === "Dynamic"
  //                           ? "bg-purpleshade1 text-white  w-[90px] rounded-[8px] h-10 pt-1.5 text-center font-normal"
  //                           : "bg-newgray text-black w-[140px] rounded-[8px] h-10 pt-1.5 text-center font-normal"
  //                       }`}
  //                       onClick={() => handleTabClick("Dynamic")}
  //                     >
  //                       <h1 className="w-[70px] h-10 pt-2 text-center font-normal">
  //                       Dynamic
  //                       </h1>
  //                     </div>
  //                   </div> */}
  //                           {/* <label className="flex items-center">
  //                             <input
  //                               type="radio"
  //                               name="encryptionType"
  //                               value="consistent"
  //                               checked={selectedTabState === "consistent"}
  //                               onChange={() => handleTabClick("consistent")}
  //                               className="mr-2"
  //                             />
  //                             <span className="text-xs font-normal">
  //                               Consistent
  //                             </span>
  //                           </label>

  //                           <label className="flex items-center">
  //                             <input
  //                               type="radio"
  //                               name="encryptionType"
  //                               value="dynamic"
  //                               checked={selectedTabState === "dynamic"}
  //                               onChange={() => handleTabClick("dynamic")}
  //                               className="mr-2"
  //                             />
  //                             <span className="text-xs font-normal">Dynamic</span>
  //                           </label> */}

  // <label className="flex items-center">
  //   <input
  //     type="checkbox"
  //     name="encryptionType"
  //     value="consistent"
  //     checked={selectedTabState === "consistent"}
  //     onChange={() => handleTabClick("consistent")}
  //     className="mr-2"
  //   />
  //   <span className="text-xs font-normal">Consistent</span>
  // </label>

  // <label className="flex items-center">
  //   <input
  //     type="checkbox"
  //     name="encryptionType"
  //     value="dynamic"
  //     checked={selectedTabState === "dynamic"}
  //     onChange={() => handleTabClick("dynamic")}
  //     className="mr-2"
  //   />
  //   <span className="text-xs font-normal">Dynamic</span>
  // </label>
  //                           <div className="flex dynamic-flex gap-4">
  //                           <label className="flex items-center">
  //                             <input
  //                               type="radio"
  //                               name="encryptionType"
  //                               value="key"
  //                               checked={selectedTabState === "key"}
  //                               onChange={() => handleTabClick("key", keyValue)}
  //                               className="mr-2"
  //                             />
  //                             <span className="text-xs font-normal">Key</span>
  //                           </label>

  //                           {selectedTabState === "key" && (
  //                             <div className="">
  //                               <input
  //                                 type="text"
  //                                 placeholder="Enter your key"
  //                                 className="border rounded px-2 py-1 text-xs"
  //                                 value={keyValue}
  // onChange={(e) => {
  //   const newKey = e.target.value;
  //   setKeyValue(newKey);
  //   handleTabClick("key", newKey); // Pass the key to handleTabClick
  // }}
  //                               />
  //                             </div>
  //                           )}
  //                           </div>
  //                         </div>
  //                       </td>
  //                     </tr>
  //                   )}
  //                 </tbody>
  //               </table>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   };
  const [showDynamicOptions, setShowDynamicOptions] = useState(false);

  const renderMiscellaneous = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div
          className={` flex flex-row mt-2  items-center justify-between px-2 bg-newgray rounded-lg shadow-md shadow-slate-500/30
  
          ${showChatbot ? "blur-effect" : ""} 
          ${showProfileModal ? "blur-effect" : ""}
          ${isTimezoneModalOpen ? "blur-effect" : ""}`}
          style={{
            width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
            height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
          }}
        ></div>

        <div
          className="flex flex-col items-center "
          style={{
            width: `${tableContainerWidth}px`,
            height: `${tableContainerHight}px`,
          }}
        >
          <div
            className="flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.9).toFixed(2)}px`,
            }}
          >
            <div
              className={`flex rounded-t-xl  ${
                selectedFileShareForDeletion ? "blur-effect" : ""
              }
                      
          ${isTimezoneModalOpen ? "blur-effect" : ""}
      ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              } `}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(tableContainerHight * 0.02).toFixed(2)}px`,
              }}
            ></div>
            <div
              className={`py-1 overflow-auto   ${
                isZoomedIn ? "overflow-x-auto " : ""
              }
         
      ${showChatbot ? "blur-effect" : ""} 
      ${showProfileModal ? "blur-effect" : ""}
     ${isTimezoneModalOpen ? "blur-effect" : ""}`}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(tableContainerHight * 0.75).toFixed(2)}px`,
                scrollbarWidth: "thin",
              }}
            >
              <table className="table-design table-fixed w-full">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[60%]" />
                </colgroup>
                <tbody className=" sticky ">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="2"
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
                    <tr className="mt-4">
                      <td
                        className="w-[40%] h-10  font-light   text-xs px-16 overflow-ellipsis
                       whitespace-nowrap overflow-hidden align-top"
                      >
                        <div className="mt-6">
                          {" "}
                          {/* Add top margin */}
                          Encryption Type
                        </div>
                      </td>
                      <td
                        className="w-[60%] h-30 font-light  
                      text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden"
                      >
                        {/* <div> */}
                        <div className="flex flex-col  ">
                          <label className="flex h-10 items-center ">
                            <input
                              type="checkbox"
                              name="encryptionType"
                              value="consistent"
                              checked={selectedTabState === "consistent"}
                              // onChange={() => handleTabClick("consistent")}
                              onChange={() => {
                                if (selectedTabState !== "consistent") {
                                  setSelectedTabState("consistent"); // Set to 'consistent'
                                  setShowDynamicOptions(false); // Hide dynamic options
                                  handleTabClick("consistent"); // API call for consistent
                                }
                              }}
                              className="mr-2 accent-purpleshade1"
                            />
                            <span className="text-xs font-normal">
                              Consistent
                            </span>
                          </label>
                          <div className="flex flex-col h-20 ">
                            <label>
                              <input
                                type="checkbox"
                                name="encryptionType"
                                value="dynamic"
                                checked={showDynamicOptions} // Reflects the dynamic option state
                                onChange={() => {
                                  const isChecked = !showDynamicOptions;
                                  setShowDynamicOptions(isChecked); // Toggle visibility
                                  if (isChecked) {
                                    setDynamicOption("dynamic"); // Automatically select 'Default' radio button
                                    handleTabClick("dynamic"); // Call API with dynamic tab
                                  }
                                }}
                                className="mr-2 accent-purpleshade1"
                              />
                              <span className="text-xs font-normal">
                                Dynamic
                              </span>
                            </label>

                            {/* <div className="flex dynamic-flex gap-4"> */}
                            {showDynamicOptions && (
                              <div className="flex flex-row h-10 ml-4 w-full  items-center  gap-4 ">
                                {/* Default Radio Button */}
                                <label className="flex items-center ">
                                  <input
                                    type="radio"
                                    // name="dynamicOption"
                                    // value="default"
                                    name="encryptionType"
                                    value="dynamic"
                                    checked={dynamicOption === "dynamic"}
                                    onChange={() => {
                                      setDynamicOption("dynamic"); // Update UI state
                                      handleTabClick("dynamic"); // Call API to update server
                                      setKeyValue("");
                                    }}
                                    className="mr-2 accent-purpleshade1"
                                  />
                                  <span className="text-xs font-normal">
                                    Default
                                  </span>
                                </label>

                                {/* Key Radio Button */}
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="dynamicOption"
                                    value="key"
                                    checked={dynamicOption === "key"}
                                    onChange={() => {
                                      setDynamicOption("key"); // Show input field
                                    }}
                                    className="mr-2 accent-purpleshade1"
                                  />
                                  <span className="text-xs font-normal">
                                    Key
                                  </span>
                                </label>

                                {/* Key Input Field */}
                                {dynamicOption === "key" && (
                                  <input
                                    type="text"
                                    placeholder="Enter Key"
                                    value={keyValue}
                                    onChange={(e) => {
                                      const newKey = e.target.value;
                                      setKeyValue(newKey);
                                      handleTabClick("key", newKey); // Pass the key to handleTabClick
                                    }}
                                    // onChange={(e) =>
                                    //   setKeyValue(e.target.value)
                                    // } // Update key value in state
                                    // onBlur={() =>
                                    //   handleTabClick("key", keyValue)
                                    // } // Update backend on blur
                                    className=" p-2 border rounded text-[11px] w-64
                                    font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlertNotification = () => {
    // console.log("input", inputValue);
    return (
      <div className="flex flex-col space-y-2  items-center">
        <div
          className=" flex flex-row mt-2  px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30"
          style={{
            width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
            height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
          }}
        >
          <button
            className={`w-32  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
              ${showUploadPopup ? "blur-[5px]" : "blur-none"}
              ${showDownloadPopup ? "blur-effect" : ""}
              ${isAlertNewFieldVisible ? "blur-effect" : ""}
              ${showChatbot ? "blur-effect" : ""}
               ${isTimezoneModalOpen ? "blur-effect" : ""} ${
              showProfileModal ? "blur-effect" : ""
            }`}
            onClick={() => {
              setIsAlertNewFieldVisible(true);
              handleAddNewField();
            }}
            style={{
              height: "2rem",
              maxWidth: "100%",
              maxHeight: "100%",
              overflow: "hidden",
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
        <div
          className="flex flex-col items-center"
          style={{
            width: `${tableContainerWidth}px`,
            height: `${tableContainerHight}px`,
          }}
        >
          <div
            className={`flex rounded-t-xl   ${
              isZoomedIn ? "overflow-x-auto " : ""
            }
            showUploadPopup ? "blur-[5px]" : "blur-none"
            }
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isAlertNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} ${
              showProfileModal ? "blur-effect" : ""
            }
             ${isTimezoneModalOpen ? "blur-effect" : ""}`}
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.1).toFixed(2)}px`,
            }}
          >
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
            className="flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.8).toFixed(2)}px`,
            }}
          >
            <div
              className={`py-1 overflow-auto  ${
                isZoomedIn ? "overflow-x-auto " : ""
              }
            showUploadPopup ? "blur-[5px]" : "blur-none"
              }
               ${isTimezoneModalOpen ? "blur-effect" : ""}
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isAlertNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              }`}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(tableContainerHight * 0.75).toFixed(2)}px`,
                scrollbarWidth: "thin",
              }}
            >
              <table className="table-design table-fixed w-full">
                <tbody>
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
            onClose={handleClosePopup}
          />
          {/* )} */}
          {showDownloadPopup && (
            <div className="absolute inset-0 flex justify-center z-20 items-center">
              <DownloadPopup
                onClose={handlePopupClose}
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
                // onCancel={() => setisNewFieldVisibleFileShare(false)}
                onCancel={closePreviewModal}
                handleAlertAccessDataSave={handleAlertAccessDataSave}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  

  const IsMaskedSwitch = React.memo(({ isMasked, onToggle }) => {
    const toggleIsMasked = React.useCallback(() => {
      onToggle(!isMasked);
    }, [isMasked, onToggle]);

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
  });

  const [isGlobalChecked, setIsGlobalChecked] = useState(false);

  const fetchGlobalFileSetting = async () => {
    setLoading(true);
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/list-global-file-setting/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        }
      );

      const responseData = await response.json();
      console.log("1", responseData);

      if (!response.ok) {
        if (
          response.status === 401 &&
          responseData.error === "Access token has expired"
        ) {
          console.warn("Token expired, redirecting to login...");
          window.location.href = "/";
          return;
        } else {
          console.error(
            "Error fetching storage container data:",
            responseData.message
          );
          return;
        }
      }

      // setIsChecked(responseData.data.mask_similar_files);
      setIsGlobalChecked(responseData.data.mask_similar_files);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setLoading(false);
    }
  };

  const handleChange = async (event) => {
    const newCheckedState = event.target.checked;
    setIsGlobalChecked(newCheckedState);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/update-global-file-setting/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({ mask_similar_files: newCheckedState }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      setIsGlobalChecked(!newCheckedState); // Revert state on error
    }
  };

  const renderGlobalComun = () => {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div
          className={`flex flex-col mt-2 px-2 pt-2 bg-newgray overflow-y-auto rounded-lg shadow-xl shadow-slate-500/30 space-y-2
            ${showUploadPopup ? "blur-[5px]" : "blur-none"}
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""}
             ${isTimezoneModalOpen ? "blur-effect" : ""} ${
            showProfileModal ? "blur-effect" : ""
          }`}
          style={{
            width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
            height: `${(subContainerHeight * 0.2).toFixed(2)}px`,
            scrollbarWidth: "thin",
          }}
        >
          <div
            className=" flex items-center justify-between "
            style={{
              width: `${(subDataContainerWidth * 0.95 * 0.95).toFixed(2)}px`,
              height: `${(subContainerHeight * 0.2 * 0.8).toFixed(2)}px`,
              scrollbarWidth: "thin",
            }}
          >
            <div className="flex  items-center ml-2 px-1 bg-white rounded-md shadow-md shadow-slate-500/30 search-field">
              <input
                type="text"
                placeholder="Search here"
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGlobalSearchClick(); // Trigger API call on Enter key press
                  }
                }}
                className="outline-none ml-2 font-light text-xs flex-grow search-field "
                value={inputValue}
                style={{
                  height: "2rem",
                  maxWidth: "100%",
                  maxHeight: "90%",
                  overflow: "hidden",
                }}
                // style={{ height:  `${((subContainerHeight * 0.2) * 0.35).toFixed(2)}px`,width:'50%' }} // Ensure input height matches container
              />
              <div className="flex flex-row space-x-2">
                <button
                  className="bg-background-100 text-2xl font-semibold "
                  onClick={() => {
                    setInputValue(""); // Clear the input field
                    fetchDownloadConfigData(""); // Fetch the data with an empty search query
                  }}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/closefile.png"}
                    alt="close"
                    className="h-4 w-6"
                  />
                </button>
                <img
                  src="search_icon.png"
                  alt="search"
                  style={{ width: "17px", height: "17px" }}
                  onClick={handleGlobalSearchClick} // Trigger API call on click
                />
              </div>
              {/* <img
              src="search_icon.png"
              alt="search"
              style={{ width: "17px", height: "17px" }}
            /> */}
            </div>

            <div className="flex  items-center  px-1  rounded-md global-mask-field ">
              {/* <label>
            <input type="checkbox" checked={isGlobalChecked} 
            // onChange={handleChange} 
            />
           Mask Similar Column Name
        </label> */}

              <label className="flex h-10 items-center ">
                {/* <input type="checkbox" checked={isGlobalChecked} 
            onChange={handleChange} 
            
                              className="mr-2 accent-purpleshade1"
                            /> */}

                <input
                  type="checkbox"
                  checked={isGlobalChecked}
                  onChange={handleChange}
                  disabled={loading}
                  className="mr-2 accent-purpleshade1"
                />
                <span className="text-xs font-normal">
                  Mask Similar Column Name
                </span>
              </label>
            </div>
          </div>
          <div
            className=" flex items-center"
            style={{
              width: `${(subDataContainerWidth * 0.95 * 0.95).toFixed(2)}px`,
              height: `${(subContainerHeight * 0.2 * 0.8).toFixed(2)}px`,
            }}
          >
            <div className="w-full flex flex-row space-x-4 px-3 ">
              <button
                className="w-32  h-8 flex flex-row   px-4 rounded-md cursor-pointer 
                          items-center justify-center font-normal text-xs bg-purpleshade1
                          text-white add-field-button"
                onClick={() => {
                  setisNewFieldVisible(true);
                  handleAddNewField();
                }}
                style={{
                  height: "2rem",
                  maxWidth: "100%",
                  maxHeight: "90%",
                  overflow: "hidden",
                }}
              >
                Add New Field
              </button>
              <button
                className="w-28  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                           justify-center items-center font-normal text-xs bg-purpleshade1
                          text-white add-field-button"
                onClick={handleUploadButtonClick}
                // onClick={setShowUploadPopup(true)}
                style={{
                  height: "2rem",
                  maxWidth: "100%",
                  maxHeight: "90%",
                  overflow: "hidden",
                }}
              >
                Upload
              </button>
              <button
                className="w-28  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                           justify-center items-center font-normal text-xs bg-purpleshade1
                          text-white  add-field-button"
                onClick={handleDownloadButtonClick}
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

              <div className="flex-grow"></div>
              <button
                className="w-28  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                           justify-center items-center font-normal text-xs bg-purpleshade1
                          text-white add-field-button "
                onClick={handleDownloadSaveButtonClick}
                // onClick={setShowUploadPopup(true)}
                style={{
                  height: "2rem",
                  maxWidth: "100%",
                  maxHeight: "90%",
                  overflow: "hidden",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div
          className="flex flex-col items-center"
          style={{
            width: `${tableContainerWidth}px`,
            height: `${globaltableContainerHight}px`,
          }}
        >
          <div
            className={`flex rounded-t-xl bg-blue-500 ${
              showUploadPopup ? "blur-[5px]" : "blur-none"
            }
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} ${
              showProfileModal ? "blur-effect" : ""
            }
             ${isTimezoneModalOpen ? "blur-effect" : ""}`}
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(globaltableContainerHight * 0.1).toFixed(2)}px`,
            }}
          >
            <table className="table-design table-fixed w-full">
              <colgroup>
                <col className="w-[75%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white ">
                <tr>
                  <th className="py-2 sticky top-0 px-16 rounded-tl-lg font-normal text-xs ">
                    Field Name
                  </th>
                  <th className="py-2 sticky top-0 rounded-tr-lg font-normal text-xs">
                    Is Masked
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div
            className="flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(globaltableContainerHight * 0.8).toFixed(2)}px`,
            }}
          >
            <div
              className={`py-1  overflow-auto ${
                showUploadPopup ? "blur-[5px]" : "blur-none"
              }
               ${isTimezoneModalOpen ? "blur-effect" : ""}
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              }`}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(globaltableContainerHight * 0.75).toFixed(2)}px`,
                scrollbarWidth: "thin",
              }}
            >
              <table
                className="table-design table-fixed w-full"
                style={{
                  // height: `calc(90% )`, // Adjust based on the desired height
                  scrollbarWidth: "thin",
                }}
              >
                <tbody className="px-6">
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
                    downloadConfigApiData &&
                    downloadConfigApiData.map((config, index) => (
                      <tr key={index}>
                        <td className="w-[75%] font-light text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <input
                            id={`config-input-${index}`}
                            type="text"
                            value={config.name}
                            onChange={(e) =>
                              handleDownloadConfigFieldChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="w-[25%] font-light text-xs px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <div className="flex flex-row space-x-6 px-4">
                            <IsMaskedSwitch
                              isMasked={config.is_masked.toString() === "true"}
                              onToggle={(isChecked) =>
                                handleDownloadConfigFieldChange(
                                  index,
                                  "is_masked",
                                  isChecked ? "true" : "false"
                                )
                              }
                            />
                            {config.showDeleteButton && (
                              <button
                                className="bg-background-100 text-2xl font-semibold mr-4"
                                onClick={() =>
                                  handleDeleteField(
                                    config.field_id,
                                    config.name
                                  )
                                }
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
              onClose={handleClosePopup}
            />
            {/* )} */}
            {showDownloadPopup && (
              <div className="absolute inset-0 flex justify-center z-20 items-center">
                <DownloadPopup
                  onClose={handlePopupClose}
                  onSelect={handleDownloadOptionSelect}
                  popupRef={popupRef}
                />
              </div>
            )}
            {isNewFieldVisible && (
              <div className="absolute inset-0 flex justify-center z-20 items-center">
                <NewGlobalField
                  onCancel={closePreviewModal}
                  //  onSave={handleSaveNewField}
                  newFieldName={newFieldName || ""}
                  setNewFieldName={setNewFieldName}
                  newFieldIsMasked={newFieldIsMasked}
                  setNewFieldIsMasked={setNewFieldIsMasked}
                  IsMaskedSwitch={IsMaskedSwitch}
                  handleDownloadSaveButtonClick={handleDownloadSaveButtonClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // const handleAddMaskingConfigOpen = () => {
  //   setIsAddMaskingConfigOpen(true);
  // };

  const handleMaskedDeleteClick = async (id) => {
    try {
      // Call the delete API
      const response = await fetch(
        `${API_URL}/api/blob/delete_permanent_masking/${id}/`,
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
        // If the response is not ok (status code is not 200-299), throw an error
        throw new Error(
          `Failed to delete item with status: ${response.status}`
        );
      }

      // Parse response data if necessary (optional for DELETE requests)
      const data = await response.json();

      // Filter out the deleted item from the state if the deletion was successful
      setPermanentMaskingData((prevData) =>
        prevData.filter((item) => item.id !== id)
      );

      console.log("Item deleted successfully:", data);
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  const renderPermanentMasking = () => {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div
          className={`flex flex-row mt-2  px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30
            ${showMaskingUploadPopup ? "blur-[5px]" : "blur-none"}
            ${showChatbot ? "blur-effect" : ""}
             ${isTimezoneModalOpen ? "blur-effect" : ""} ${
            showProfileModal ? "blur-effect" : ""
          }`}
          style={{
            width: `${(subDataContainerWidth * 0.95).toFixed(2)}px`,
            height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
          }}
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
              className={`w-48  h-8 flex flex-row   px-2 rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white add-field-button
                 
                 ${showChatbot ? "blur-effect" : ""}
                  ${showProfileModal ? "blur-effect" : ""}
                  ${isTimezoneModalOpen ? "blur-effect" : ""}`}
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
        <div
          className={`flex flex-col items-center   bg-gr`}
          style={{
            width: `${tableContainerWidth}px`,
            height: `${tableContainerHight}px`,
          }}
        >
          <div
            className={`flex rounded-t-xl  ${
              showMaskingUploadPopup ? "blur-[5px]" : "blur-none"
            }
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} ${
              showProfileModal ? "blur-effect" : ""
            }
             ${isTimezoneModalOpen ? "blur-effect" : ""}`}
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.1).toFixed(2)}px`,
            }}
          >
            <table className="table-design table-fixed w-full">
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
                    className="py-2 sticky top-0  rounded-tl-lg font-normal text-xs 
                     overflow-ellipsis whitespace-nowrap overflow-hidden"
                  ></th>
                  <th
                    className="py-2 sticky top-0 px-6  font-normal text-xs 
                     overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    File Pattern
                  </th>
                  <th
                    className="py-2 sticky top-0  font-normal text-xs
                   overflow-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    Column Name
                  </th>
                  <th
                    className="py-2 sticky top-0  font-normal text-xs
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
            className="flex flex-col adjusted-margin-top  rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
            style={{
              width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
              height: `${(tableContainerHight * 0.8).toFixed(2)}px`,
            }}
          >
            <div
              className={`py-1  overflow-auto ${
                showUploadPopup ? "blur-[5px]" : "blur-none"
              }
               ${isTimezoneModalOpen ? "blur-effect" : ""}
            ${showDownloadPopup ? "blur-effect" : ""}
            ${isNewFieldVisible ? "blur-effect" : ""}
            ${showChatbot ? "blur-effect" : ""} ${
                showProfileModal ? "blur-effect" : ""
              }`}
              style={{
                width: `${(tableContainerWidth * 0.97).toFixed(2)}px`,
                height: `${(globaltableContainerHight * 0.75).toFixed(2)}px`,
                scrollbarWidth: "thin",
              }}
            >
              <table
                className="table-design table-fixed w-full"
                style={{
                  // height: `calc(90% )`, // Adjust based on the desired height
                  scrollbarWidth: "thin",
                }}
              >
                <tbody className="px-6">
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
                <MaskingUploadPopup />
              </div>
            )}
            <div className="relative inline-block">
              <AddMaskingConfig
                isAddMaskingConfigOpen={isAddMaskingConfigOpen}
                // setIsTimezoneModalOpen={setIsTimezoneModalOpen}
                containerData={containerData}
                closePreviewModal={closePreviewModal}
                // setSelectedNavbarOption={setSelectedNavbarOption}
              />
            </div>
            <ErrorPopup
              isOpen={isPopupOpen}
              message={error}
              // onClose={closePreviewModal}
              onClose={handleClosePopup}
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
    );
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setIsTimezoneModalOpen(false);
    setSelectedNavbarOption(null);
    setShowProfileModal(false);
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
  };

  useEffect(() => {}, []);

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
  // eslint-disable-next-line
  const sidebarHeight = `${(height * 0.98).toFixed}`;
  const sidebarLMargin = `${(width * 0.01).toFixed(2)}`;
  const containerMarginLeft = `${(width * 0.08).toFixed(2)}`;
  const cMarginLeft = `${(
    containerMarginLeft -
    (parseFloat(sidebarWidth) + parseFloat(sidebarLMargin))
  ).toFixed(2)}px`;
  const subContainerWidth = `${(containerWidth * 0.95).toFixed(2)}`;
  const subContainerHeight = `${(containerHeight * 0.8).toFixed(2)}`;
  // eslint-disable-next-line
  const subContainerTMargin = `${(
    containerHeight * 0.1 -
    parseFloat(cMarginTop)
  ).toFixed(2)}`;
  const listItemsContainerWidth = `${(subContainerWidth * 0.2).toFixed(2)}`;
  const listItemsContainerHeight = `${(containerHeight * 0.8).toFixed(2)}`;
  const dataContainerWidth = `${subContainerWidth - listItemsContainerWidth}`;
  const subDataContainerWidth = `${(dataContainerWidth * 0.99).toFixed(2)}`;
  // eslint-disable-next-line
  const subDataContainerHeight = `${(listItemsContainerHeight * 0.98).toFixed(
    2
  )}`;
  const tableContainerWidth = `${(subDataContainerWidth * 0.98).toFixed(2)}`;
  const tableContainerHight = `${(subContainerHeight * 0.84).toFixed(2)}`;
  const globaltableContainerHight = `${(subContainerHeight * 0.74).toFixed(2)}`;

  return (
    <div
      className={`bg-primary `}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        userSelect: "none",
        WebkitUserSelect: "none" /* Safari */,
        MozUserSelect: "none" /* Firefox */,
        msUserSelect: "none",
      }}
    >
      <div
        className="flex flex-col items-center "
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className={` ${
            showUploadPopup ||
            isModalOpen || // Ensure to only apply when modal is open
            isEditUserModalOpen ||
            showDownloadPopup ||
            isNewFieldVisible ||
            isNewFieldVisibleFileShare ||
            isAlertNewFieldVisible ||
            showChatbot ||
            isTimezoneModalOpen ||
            showProfileModal
              ? "pointer-events-none"
              : ""
          }`}
          style={{
            width: `${navWidth}px`,
            height: `${navHeight}px`,
            marginTop: `${navMarginTop}px`,
          }}
        >
          <Navbar
            onOptionSelect={handleOptionSelect}
            selectedOption={selectedNavbarOption}
          />
        </div>
        <div
          className="flex flex-row "
          style={{ width: `${width}px`, height: `${PContainerHeight}px` }}
        >
          <div
            className={`bg-white rounded-lg shadow-lg shadow-slate-500/50 ${ 
              showUploadPopup ||
              isModalOpen || // Ensure to only apply when modal is open
              isEditUserModalOpen ||
              showDownloadPopup ||
              isNewFieldVisible ||
              showChatbot ||
              isAlertNewFieldVisible ||
              isTimezoneModalOpen ||
              showProfileModal
                ? "pointer-events-none"
                : ""
            }`}
            style={{
              width: `${sidebarWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: `${sidebarLMargin}px`,
            }}
          >
            <Sidebar />
          </div>
           
          <div
            className="flex flex-col bg-newgray  rounded-lg items-center  shadow-md shadow-slate-500/30 "
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: cMarginLeft,
            }}
          >
            <div
              className={`flex flex-row text-purpleshade1  items-center text-sm font-medium ml-10
                ${
                  showUploadPopup ||
                  isModalOpen || // Ensure to only apply when modal is open
                  isEditUserModalOpen ||
                  showDownloadPopup ||
                  isNewFieldVisible ||
                  isAlertNewFieldVisible ||
                  showChatbot ||
                  isTimezoneModalOpen ||
                  showProfileModal
                    ? "pointer-events-none"
                    : ""
                }`}
              style={{
                width: `${(containerWidth * 0.98).toFixed(2)}px`,
                height: `${(containerHeight * 0.07).toFixed(2)}px`,
                marginTop: `${cMarginTop}px`,
              }}
            >
              {/* name */}
              <Link to="/home">Home</Link> &gt; Admin Panel
            </div>
            <div
              className="flex flex-row "
              style={{
                width: `${subContainerWidth}px`,
                height: `${subContainerHeight}px`,
              }}
            >
              <div
                className={`flex flex-col  items-center justify-center shadow-md shadow-slate-500/30 rounded-l-lg
                  ${
                    showUploadPopup ||
                    isModalOpen || // Ensure to only apply when modal is open
                    isEditUserModalOpen ||
                    showDownloadPopup ||
                    isNewFieldVisible ||
                    isAlertNewFieldVisible ||
                    showChatbot ||
                    isTimezoneModalOpen ||
                    showProfileModal
                      ? "pointer-events-none"
                      : ""
                  }`}
                style={{
                  width: `${listItemsContainerWidth}px`,
                  height: `${listItemsContainerHeight}px`,
                }}
              >
                <div
                  className="flex flex-col  overflow-y-auto space-y-1 "
                  style={{
                    width: `${(listItemsContainerWidth * 0.97).toFixed(2)}px`,
                    height: `${(listItemsContainerHeight * 0.97).toFixed(2)}px`,
                    scrollbarWidth: "thin",
                  }}
                >

                   {Options_Config.map((item) => (
                        <OptionsItems
                          key={item.key}
                          item={item}
                          selectedOption={selectedOption}
                          onClick={handleOptionClick}
                        />
                      ))}
                  {/* <div
                    className="text-xs font-medium text-black ml-2 px-4 py-4 cursor-pointer flex flex-row h-8 items-center"
                    style={{
                      backgroundColor:
                        selectedOption === "User Group" ? "white" : "",
                      boxShadow:
                        selectedOption === "User Group"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius:
                        selectedOption === "User Group" ? "5px" : "5px",
                      padding: selectedOption === "User Group" ? "5px" : "5px",
                    }}
                    onClick={() => handleOptionClick("User Group")}
                  >
                    <img
                      src={
                        selectedOption === "User Group"
                          ? process.env.PUBLIC_URL +
                            "/purple-usergroup-icon.png"
                          : process.env.PUBLIC_URL + "/grayuser-group.png"
                      }
                      alt="Icon"
                      // className="w-4 h-5 mr-3"
                      className={`mr-3 ${
                        selectedOption === "User Group"
                          ? "w-4 h-3.5"
                          : "w-4 h-3.5"
                      }`}
                    />
                    User Group
                  </div>
                  <div
                    className="text-xs font-medium text-black ml-2 px-4 py-4 cursor-pointer flex flex-row h-8 items-center"
                    style={{
                      backgroundColor:
                        selectedOption === "Storage Container" ? "white" : "",
                      boxShadow:
                        selectedOption === "Storage Container"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius:
                        selectedOption === "Storage Container" ? "5px" : "5px",
                      padding:
                        selectedOption === "Storage Container" ? "5px" : "5px",
                    }}
                    onClick={() => handleOptionClick("Storage Container")}
                  >
                    <img
                      src={
                        selectedOption === "Storage Container"
                          ? process.env.PUBLIC_URL + "/purple-storage.png"
                          : process.env.PUBLIC_URL + "/graystorage-icon.png"
                      }
                      alt="Icon"
                      className={`mr-3 ${
                        selectedOption === "Storage Container"
                          ? "w-4 h-4"
                          : "w-4 h-4"
                      }`}
                    />
                    <div className="flex-1">Storage Container</div>
                    
                  </div>
                  <div
                    className="text-xs font-medium text-black ml-1.5 px-4 py-4 cursor-pointer flex flex-row h-8 items-center"
                    style={{
                      backgroundColor:
                        selectedOption === "File Share" ? "white" : "",
                      boxShadow:
                        selectedOption === "File Share"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius:
                        selectedOption === "File Share" ? "5px" : "5px",
                      padding: selectedOption === "File Share" ? "5px" : "5px",
                    }}
                    onClick={() => handleOptionClick("File Share")}
                  >
                    <img
                      src={
                        selectedOption === "File Share"
                          ? process.env.PUBLIC_URL +
                            "/purple-fileshare-icon.png"
                          : process.env.PUBLIC_URL + "/grayfile-share.png"
                      }
                      alt="Icon"
                      className={`mr-3 ${
                        selectedOption === "File Share"
                          ? "w-4 h-5 ml-0.5"
                          : "w-4 h-5 ml-0.5 "
                      }`}
                    />
                    <div className="flex-1">FileShare</div>
                    
                  </div>

                  <div
                    className={`text-xs font-medium text-black ml-1.5 px-4 py-6  cursor-pointer flex flex-row items-center rounded-lg`}
                    style={{
                      backgroundColor:
                        selectedOption === "Global Column Config"
                          ? "white"
                          : "",
                      boxShadow:
                        selectedOption === "Global Column Config"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius:
                        selectedOption === "Global Column Config"
                          ? "5px"
                          : "5px",
                      padding:
                        selectedOption === "Global Column Config"
                          ? "5px"
                          : "5px",
                    }}
                    onClick={() => handleOptionClick("Global Column Config")}
                  >
                    <img
                      src={
                        selectedOption === "Global Column Config"
                          ? process.env.PUBLIC_URL + "/purple-global.png"
                          : process.env.PUBLIC_URL + "/grayglobal-icon.png"
                      }
                      alt="Icon"
                      className="w-[21px] h-[21px] mr-2.5"
                    />
                    <div className="flex-1">Global Column Config</div>
                  </div>

                  <div
                    className={`text-xs font-medium text-black ml-1.5 px-4 py-6  cursor-pointer flex flex-row items-center rounded-lg`}
                    style={{
                      backgroundColor:
                        selectedOption === "Permanent Masking" ? "white" : "",
                      boxShadow:
                        selectedOption === "Permanent Masking"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius:
                        selectedOption === "Permanent Masking" ? "5px" : "5px",
                      padding:
                        selectedOption === "Permanent Masking" ? "5px" : "5px",
                    }}
                    onClick={() => handleOptionClick("Permanent Masking")}
                  >
                    <img
                      src={
                        selectedOption === "Permanent Masking"
                          ? process.env.PUBLIC_URL + "/purple-masking.png"
                          : process.env.PUBLIC_URL + "/gray-masking-icon.png"
                      }
                      alt="Icon"
                      className="w-[21px] h-[21px] mr-2.5"
                    />
                    <div className="flex-1">Permanent Masking</div>
                  </div>
                  <div
                    className={`text-xs font-medium text-black ml-2.5 px-4 py-6  cursor-pointer flex flex-row items-center rounded-lg`}
                    style={{
                      backgroundColor:
                        selectedOption === "Miscellaneous" ? "white" : "",
                      boxShadow:
                        selectedOption === "Miscellaneous"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius:
                        selectedOption === "Miscellaneous" ? "5px" : "5px",
                      padding:
                        selectedOption === "Miscellaneous" ? "5px" : "5px",
                    }}
                    onClick={() => handleOptionClick("Miscellaneous")}
                  >
                    <img
                      src={
                        selectedOption === "Miscellaneous"
                          ? process.env.PUBLIC_URL +
                            "/purple-miscellaneous-icon.png"
                          : process.env.PUBLIC_URL +
                            "/gray-miscellaneous-icon.png"
                      }
                      alt="Icon"
                      className="w-[21px] h-[21px] mr-2"
                    />
                    <div className="flex-1">Miscellaneous</div>
                  </div>
                  <div
                    className={`text-xs font-medium text-black ml-2.5 px-4 py-6  cursor-pointer flex flex-row items-center rounded-lg`}
                    style={{
                      backgroundColor:
                        selectedOption === "Alert" ? "white" : "",
                      boxShadow:
                        selectedOption === "Alert"
                          ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                          : "none",
                      borderRadius: selectedOption === "Alert" ? "5px" : "5px",
                      padding: selectedOption === "Alert" ? "5px" : "5px",
                    }}
                    onClick={() => handleOptionClick("Alert")}
                  >
                    <img
                      src={
                        selectedOption === "Alert"
                          ? process.env.PUBLIC_URL +
                            "/open-mail-alert.png"
                          : process.env.PUBLIC_URL + "/alerticon.png"
                      }
                      alt="Icon"
                      className="w-[21px] h-[23px] mr-2"
                    />
                    <div className="flex-1">Alerts</div>
                  </div> */}

                  {/* ************* */}
                </div>
              </div>

              <div
                className="flex flex-col bg-white justify-center rounded-r-lg shadow-md shadow-slate-500/30 items-center"
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
                  {selectedOption === "User Group" && (
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={` flex flex-row mt-2  bg-newgray items-center px-2 rounded-lg shadow-md shadow-slate-500/30 add-field-button
                          ${
                            showUploadPopup ||
                            isModalOpen || // Ensure to only apply when modal is open
                            isEditUserModalOpen ||
                            showChatbot ||
                            isTimezoneModalOpen ||
                            showProfileModal
                              ? " blur-effect pointer-events-none"
                              : ""
                          }`}
                        style={{
                          width: `${(subDataContainerWidth * 0.95).toFixed(
                            2
                          )}px`,
                          height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
                        }}
                      >
                        <button
                          className={` flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 add-field-button`}
                          onClick={() => {
                            handleUserPermissions();
                            setIsModalOpen(true);
                          }}
                          style={{
                            height: "2rem",
                            maxWidth: "100%",
                            maxHeight: "100%",
                            overflow: "hidden",
                          }}
                        >
                          Add New Field
                        </button>
                      </div>
                      <div
                        className="flex flex-col items-center  "
                        style={{
                          width: `${tableContainerWidth}px`,
                          height: `${tableContainerHight}px`,
                        }}
                      >
                        <div
                          className={`flex rounded-t-xl  ${
                            showUploadPopup ||
                            isModalOpen || // Ensure to only apply when modal is open
                            isEditUserModalOpen ||
                            showChatbot ||
                            isTimezoneModalOpen ||
                            showProfileModal
                              ? "blur-effect pointer-events-none"
                              : ""
                          } `}
                          style={{
                            width: `${(tableContainerWidth * 0.97).toFixed(
                              2
                            )}px`,
                            height: `${(tableContainerHight * 0.1).toFixed(
                              2
                            )}px`,
                          }}
                        >
                          <table className="table-design table-fixed w-full ">
                            <colgroup>
                              <col className="w-[60%]" />
                              <col className="w-[40%]" />
                            </colgroup>

                            <thead className="bg-purpleshade1 sticky top-0  rounded-t-lg text-white ">
                              <tr>
                                <th className="py-3 sticky top-0 font-medium text-xs border border-none px-16 rounded-tl-lg">
                                  User Group Name
                                </th>
                                <th className="py-3 z-20 sticky px-16 font-medium text-xs top-0 border border-none rounded-tr-lg">
                                  Action
                                </th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                        <div
                          className={`flex flex-col adjusted-margin-top rounded-b-xl shadow-md shadow-slate-500/30 bg-white  ${
                            showUploadPopup ||
                            isModalOpen || // Ensure to only apply when modal is open
                            isEditUserModalOpen ||
                            showChatbot ||
                            isTimezoneModalOpen ||
                            showProfileModal
                              ? "blur-effect pointer-events-none"
                              : ""
                          } `}
                          style={{
                            width: `${(tableContainerWidth * 0.97).toFixed(
                              2
                            )}px`,
                            height: `${(tableContainerHight * 0.8).toFixed(
                              2
                            )}px`,
                          }}
                        >
                          <div
                            className="py-1  overflow-auto "
                            style={{
                              width: `${(tableContainerWidth * 0.97).toFixed(
                                2
                              )}px`,
                              height: `${(tableContainerHight * 0.75).toFixed(
                                2
                              )}px`,
                              scrollbarWidth: "thin",
                            }}
                          >
                            <table className="table-design table-fixed w-full">
                              <colgroup>
                                <col className="w-[60%]" />
                                <col className="w-[40%]" />
                              </colgroup>
                              <tbody className=" sticky ">
                                {loading ? (
                                  <tr>
                                    <td
                                      colSpan="2"
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
                                  userGroupsData.map((group, index) => (
                                    <tr key={group.id} className="mt-4">
                                      <td className="w-[60%] font-light text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                        {group.name}
                                      </td>
                                      <td className="w-[40%] font-light  text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                        <div className="flex flex-row space-x-3">
                                          <button
                                            // className="bg-lightgray-100 text-white px-2 py-1 h-8 w-[100px]  rounded-lg font-semibold "
                                            className=" w-[30px] "
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click when button is clicked
                                              //   setIsModalOpen(true);
                                              // console.log("Clicked group:", group);
                                              setIsEditUserModalOpen(true);
                                              // handleUserPermissions();
                                              // setShowPreview(true);
                                              handleEditUserPermissions(
                                                group.id
                                              );
                                              // handleClick(group.id);
                                            }}
                                          >
                                            <img
                                              src="icon-edit-row.png"
                                              alt="Edit"
                                              className="w-4 h-4 max-w-full max-h-full rounded-lg"
                                            />
                                            {/* Edit */}
                                          </button>
                                          <button
                                            // className="bg-lightgray-100 text-white px-2 py-1 w-[100px] rounded-lg font-semibold"
                                            className="w-[30px] "
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click when button is clicked
                                              // handleDeleteClick(group.id);
                                              setSelectionUserGroupDeletion(
                                                group
                                              );
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
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOption === "Storage Container" && (
                    <div className={`w-full h-full  `}>
                      {renderStorageContainer()}
                    </div>
                  )}
                  {selectedOption === "File Share" && (
                    <div className="w-full h-full ">{renderFileShare()}</div>
                  )}
                  {selectedOption === "Miscellaneous" && (
                    <div className="w-full h-full ">
                      {renderMiscellaneous()}
                    </div>
                  )}
                  {selectedOption === "Global Column Config" && (
                    <div className="w-full h-full ">{renderGlobalComun()}</div>
                  )}

                  {selectedOption === "Permanent Masking" && (
                    <div className="w-full h-full ">
                      {renderPermanentMasking()}
                    </div>
                  )}
                  {selectedOption === "Alert" && (
                    <div className="w-full h-full ">
                      {renderAlertNotification()}
                    </div>
                  )}
                  {selectedOption === "S3 Storage" && (
                    <div className={`w-full h-full  `}>
                      <S3Accounts
                      selectedOption= {selectedOption}
                      />
                    </div>
                  )}
                  {selectedOption === "GCP" && (
                    <div className={`w-full h-full  `}>
                      <GCPAccounts
                      selectedOption= {selectedOption}
                      />
                    </div>
                  )}
                  {selectedOption === "User Activity Report" && (
                    <div className="flex flex-col space-y-2">
                      <div
                        className=" flex flex-row rounded-t-xl bg-white rounded-xl shadow-xl shadow-slate-500/30"
                        style={{
                          width: `${(subDataContainerWidth * 0.98).toFixed(
                            2
                          )}px`,
                          height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
                        }}
                      ></div>
                      <div
                        className="flex flex-col items-center bg-orange-600"
                        style={{
                          width: `${tableContainerWidth}px`,
                          height: `${tableContainerHight}px`,
                        }}
                      >
                        <div
                          className="flex rounded-t-xl bg-blue-500"
                          style={{
                            width: `${(tableContainerWidth * 0.95).toFixed(
                              2
                            )}px`,
                            height: `${(tableContainerHight * 0.1).toFixed(
                              2
                            )}px`,
                          }}
                        ></div>
                        <div
                          className="flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
                          style={{
                            width: `${(tableContainerWidth * 0.95).toFixed(
                              2
                            )}px`,
                            height: `${(tableContainerHight * 0.8).toFixed(
                              2
                            )}px`,
                          }}
                        >
                          <div
                            className="py-1 bg-slate-500 overflow-auto"
                            style={{
                              width: `${(tableContainerWidth * 0.95).toFixed(
                                2
                              )}px`,
                              height: `${(tableContainerHight * 0.75).toFixed(
                                2
                              )}px`,
                              scrollbarWidth: "thin",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <AddUserGroupModal
                    isOpen={isModalOpen}
                    closeModal={closePreviewModal}
                    // Pass metadata to the modal component
                    renderAddUserGroup={renderAddUserGroup}
                    showPreview={showPreview}
                  />

                  <EditUserModal
                    isOpen={isEditUserModalOpen}
                    closeModal={closePreviewModal}
                    // Pass metadata to the modal component
                    renderEditUserGroup={renderEditUserGroup}
                    editedUserGroup={editedUserGroup}
                    chosenItems={chosenItems}
                    showPreview={showPreview}
                  />

                  {selectedUserGroupDeletion && (
                    <div className="absolute inset-0 flex justify-center z-20 items-center">
                      <UserDeleteConfirmationPopup
                        context={selectedUserGroupDeletion}
                        onCancel={handleCancelDelete}
                        onConfirm={() =>
                          handleDeleteClick(selectedUserGroupDeletion.id)
                        }
                      />
                    </div>
                  )}

                  <div className="relative inline-block">
                    <TimezoneModal
                      isTimezoneModalOpen={isTimezoneModalOpen}
                      setIsTimezoneModalOpen={setIsTimezoneModalOpen}
                      closePreviewModal={handleCloseChatbot}
                      setSelectedNavbarOption={setSelectedNavbarOption}
                    />
                  </div>
                  <ErrorPopup
                    isOpen={isPopupOpen}
                    message={error}
                    onClose={closePreviewModal}
                  />
                  <div
                    className={`fixed z-[9999] ${
                      showUploadPopup ||
                      isModalOpen || // Ensure to only apply when modal is open
                      isEditUserModalOpen ||
                      showDownloadPopup ||
                      isNewFieldVisible ||
                      isNewFieldVisibleStorage ||
                      isNewFieldVisibleFileShare ||
                      isAlertNewFieldVisible ||
                      isNewFieldVisible ||
                      isTimezoneModalOpen ||
                      showProfileModal
                        ? "pointer-events-none"
                        : ""
                    }`}
                    style={{
                      right: "20px",
                      bottom: "30px",
                    }}
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/chat-icon.png"}
                      alt="Chat Icon"
                      className={`w-12 h-12 cursor-pointer animate-floating `}
                      onClick={handleChatbotIconClick}
                    />
                  </div>

                  {showChatbot && (
                    <Chatbot
                      onClose={handleCloseChatbot}
                      isOpen={showChatbot}
                    />
                  )}
                  {showProfileModal && (
                    <ProfileModal
                      isOpen={showProfileModal}
                      onClose={handleCloseChatbot}
                    />
                  )}
                </div>
              </div>
            </div>
            {selectedOption === "User Activity Report" && (
              <div
                className="flex flex-row bg-green-300"
                style={{
                  width: `${(containerWidth * 0.93).toFixed(2)}px`,
                  height: `${(containerHeight * 0.1).toFixed(2)}px`,
                }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewAdminPanel;
