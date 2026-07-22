import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import authService from "./auth";
import NewFieldPopup from "./NewField";
// eslint-disable-next-line
// import Switch from "react-switch";
import { RingLoader } from "react-spinners";
import "./scroll.css";
import { css } from "@emotion/react";
import Jsontimezones from "./TimeZones";
// eslint-disable-next-line
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// eslint-disable-next-line
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
// eslint-disable-next-line
import Modal from "react-modal";
// import { faCircleRight, faCircleLeft } from '@fortawesome/free-duotone-svg-icons';
import { faCircleRight, faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
// eslint-disable-next-line
import { Resizable } from "react-resizable";
// import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { API_URL } from "./ApiConfig";
import EditUserModal from "./EditUserModal";
import AddUserGroupModal from "./AddUserGroupModal";
import StorageContainerModal from "./StorageContainerModal";
import GlobalColumnConfigModal from "./GlobalColumnConfigModal";
import FileShareModal from "./FileShareModal";
import MiscellaneousModal from "./MiscellaneousModal";
import NewFileShareModal from "./NewFileShareModal";
import TimezoneModal from "./TimeZoneModal";
import {
  secureApiCall,
  apiRequest,
  getCSRFToken,
  getAuthToken,
  fetchAndStoreCSRFToken,
} from "./csrfUtils";

// const API_URL = "http://127.0.0.1:8000";

const AdminPanel = () => {
  const [token, setToken] = useState(null);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [autoTimezone, setAutoTimezone] = useState(false);
  // eslint-disable-next-line
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line
  const [isModalVisible, setModalVisible] = useState(false);
  // eslint-disable-next-line
  const [isOpen, setIsOpen] = useState(false);
   // eslint-disable-next-line
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customerFiles, setCustomerFiles] = useState([]);
  // eslint-disable-next-line
  const [isAddUserGroup, setIsAddUserGroup] = useState(false);
  const [userGroupsData, setUserGroupsData] = useState([]);
  const [containerData, setContainerData] = useState([]);
  const [fileShareData, setFileShareData] = useState([]);
  // const [selectedTimeZone, setSelectedTimeZone] = useState(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState({
    label: "Select Timezone",
    value: null,
  });
  const [isFileSizeUnitDropdownOpen, setIsFileSizeUnitDropdownOpen] =
    useState(false);
  const [timeZones, setTimeZones] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  // eslint-disable-next-line
  const [activeTab, setActiveTab] = useState("userGroup");
  const [downloadFileSize, setDownloadFileSize] = useState("");
  const [fileSizeUnit, setFileSizeUnit] = useState("Bytes");
  const [inputValue, setInputValue] = useState("");
  // eslint-disable-next-line
  const [texinputValue, setTextInputValue] = useState("");
  // eslint-disable-next-line
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [downloadConfigApiData, setDownloadConfigApiData] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  // eslint-disable-next-line
  const [isAddNewFieldDisabled, setIsAddNewFieldDisabled] = useState(false);
  const [columnData, setColumnData] = useState([]);
  // eslint-disable-next-line
  const [pageSize, setPageSize] = useState(10);
  const newFieldRef = useRef(null);
  // eslint-disable-next-line
  const [selectedContainers, setSelectedContainers] = useState([]);
   // eslint-disable-next-line
  const [selectedContainer, setSelectedContainer] = useState(null);
  // eslint-disable-next-line
  const [selectedFileShareRow, setSelectedFileShareRow] = useState(null);
   // eslint-disable-next-line
  const [selectedUserGroup, setSelectedUserGroup] = useState(null);
  // eslint-disable-next-line
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  // eslint-disable-next-line
  const [showAccountKey, setShowAccountKey] = useState(true);
  // const [chosenItems, setChosenItems] = useState(new Set());
  const [chosenItems, setChosenItems] = useState([]);

  // eslint-disable-next-line
  const [newField, setNewField] = useState({});
  // eslint-disable-next-line
  const [totalPages, setTotalPages] = useState(1);
   // eslint-disable-next-line
  const [dataType, setDataType] = useState(null);
  const [newAccountKey, setNewAccountKey] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  // eslint-disable-next-line
  const [syncStatus, setSyncStatus] = useState("");
  // eslint-disable-next-line
  const [containerSyncStatus, setContainerSyncStatus] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [editedUserGroup, setEditedUserGroup] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  // const [availableItems, setAvailableItems] = useState[Item1,Item2,Item3,Item4,Item5]
  // eslint-disable-next-line
  const [dcGroups, setDcGroups] = useState([]);
  // eslint-disable-next-line
  const [responseMessage, setResponseMessage] = useState("");
  const [inputValue1, setInputValue1] = useState([]);
  const [inputValue2, setInputValue2] = useState([]);
  // eslint-disable-next-line
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewFieldVisibleStorage, setisNewFieldVisibleStorage] = useState(false);
   // eslint-disable-next-line
    const [isNewFieldVisibleStorageacc, setisNewFieldVisibleStorageacc] = useState(false);
    const [loading, setLoading] = useState(true);
  const [isNewFieldVisibleFileShare, setisNewFieldVisibleFileShare] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
   // eslint-disable-next-line
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  // eslint-disable-next-line
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [selectedOption, setSelectedOption] = useState("User Group");
  const [modifiedFileShares, setModifiedFileShares] = useState([]);
  // eslint-disable-next-line
  const [newFileShares, setNewFileShares] = useState([]);
  // eslint-disable-next-line
  const [currentPage, setCurrentPage] = useState(1);
  const [fileShareSyncStatus, setFileShareSyncStatus] = useState({});
  // eslint-disable-next-line
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(true);
  const [selectedFileShareForDeletion, setSelectedFileShareForDeletion] =useState(null);
  const [selectedUserGroupDeletion,setSelectionUserGroupDeletion] = useState(null);
   // eslint-disable-next-line
  const [selectedStorageAccountDeletion,setSelectionStorageAccountDeletion] = useState(null);
  // eslint-disable-next-line
  const [selectedStorageRowForDeletion, setSelectedStorageRowForDeletion] = useState(null);
  const [storageContainerSyncStatus, setStorageContainerSyncStatus] = useState( {});
  // eslint-disable-next-line
  const [isdropdownOpen, setIsDropdownOpen] = useState(false);
   // eslint-disable-next-line
  const [selectedStorageContainerRow, setSelectedStorageContainerRow] =useState(null);
   // eslint-disable-next-line
  const [selectedFileShare, setSelectedFileShare] = useState([]);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
   // eslint-disable-next-line
  const [isFileShareModal, setIsFileShareModal] = useState(false);
  // eslint-disable-next-line
  const [isMiscellaneousModal, setIsMiscellaneousModal] = useState(false);
  // eslint-disable-next-line
  const [isGlobalColumnModal, setIsGlobalColumnModal] = useState(false);
  const [activeModal, setActiveModal] = useState();
  // eslint-disable-next-line
  const [isGlobalContainerModal, setIsGlobalContainerModal] = useState(false);
  // eslint-disable-next-line
  const [isStorageContainerModal, setIsStorageContainerModal] = useState(false);
  // eslint-disable-next-line
  const [isFileContainerModal, setIsFileContainerModal] = useState(false);
  // eslint-disable-next-line
  const [isMisContainerModal, setIsMisContainerModal] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [timezoneOptions, setTimezoneOptions] = useState([
    { label: 'Time Zone', value: null },
    { label: 'UTC', value: 'UTC' },
    { label: 'Australia/Sydney', value: 'Australia/Sydney' },
    // Add other timezones here
  ]);

  // const API_URL = "http://74.235.117.56:80"

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red; // You can customize the color
  `;

  useEffect(() => {
    console.log("timezones",Jsontimezones);
    // Instead of fetching from the API, use the imported JSON file
    const options = Jsontimezones.map((timezone) => ({
      value: timezone,
      label: timezone,
    }));
    setTimezoneOptions(options);
  }, []); 


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "=") {
        console.log("ZoomedIn: true");
        setIsZoomedIn(true);
      } else if (event.ctrlKey && event.key === "-") {
        console.log("ZoomedIn: false");
        setIsZoomedIn(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array to run effect once

  useEffect(() => {
    const handleZoomChange = (event) => {
      if (event.ctrlKey) {
        event.preventDefault(); // Prevent default browser zoom behavior

        if (event.code === "Equal" || event.code === "NumpadAdd") {
          // Zoom in by 10% when Ctrl+"=" or Ctrl+"+" is pressed
          if (zoomLevel < 200) {
            console.log("zoomlevel", zoomLevel);
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

  // eslint-disable-next-line
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Handle previous page click
  // eslint-disable-next-line
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  // eslint-disable-next-line
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // eslint-disable-next-line
  const toggleDownLoadDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
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

  // eslint-disable-next-line
  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // eslint-disable-next-line
  const scroll = () => {
    window.scrollTo({
      top: newFieldRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      // console.log("modal", isModalOpen);
      try {
        // Fetch the token and set it in the state
        const fetchedToken = await authService.getToken();
        const dataObject = JSON.parse(fetchedToken);

        const token = dataObject.data.token;
        const email = dataObject.data.email;
        setToken(token);
        setUserEmail(email);
        // eslint-disable-next-line
        const fetchedpermissions = authService.getPermissions();
        const permissions = dataObject.data.permissions;
        setPermissions(permissions);
        console.log("perm", permissions);
        setLoading(false);

        await fetchAndStoreCSRFToken();

        // Fetch user groups data
        // const userGroupsResponse = await fetch("http://127.0.0.1:8000/api/admin/get-dc-groups/", {
        // const userGroupsResponse = await fetch(
        //   `${API_URL}/api/admin/get-dc-groups/`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        const userGroupsData = await secureApiCall(
          `${API_URL}/api/core/blob-groups/`,
          "GET"
        );
        // setUserGroupsData(prevState => [...prevState, data]);
        setUserGroupsData(userGroupsData);
       
        setLoading(false)
        
        console.log("usergroup", userGroupsData);

        const timeZonesResponse = await fetch(
          "http://worldtimeapi.org/api/timezone"
        );
        const timeZonesData = await timeZonesResponse.json();
        setTimeZones(timeZonesData);
        setLoading(false)
        console.log("time", timeZones);
      } catch (error) {
        console.error("Fetch data error:", error);
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [token]);

  // eslint-disable-next-line
  const handleUserGroupsChange = (index, value) => {
    setUserGroupsData((prevUserGroups) => {
      const updatedGroups = [...prevUserGroups];
      updatedGroups[index].user_groups = value;
      return updatedGroups;
    });
  };

  const updateDatesBasedOnTimezone = async (timezone) => {
    console.log("1", timezone);

    // Update the creation_time and modified_time properties based on the selected timezone
    const updatedCustomerFiles = customerFiles.map((file) => ({
      ...file,
      creation_time: convertTimezone(file.creation_time, timezone),
      modified_time: convertTimezone(file.modified_time, timezone),
    }));

    // Update the state with the modified data
    setCustomerFiles(updatedCustomerFiles);
  };

  const convertTimezone = (dateTime, timezone) => {
    // Use your preferred library or method to convert the timezone
    // In this example, assuming dateTime is in 'YYYY-MM-DDTHH:mm:ss' format
    return new Date(dateTime).toLocaleString("en-US", {
      timeZone: timezone,
    });
  };

  const handleAutoTimezoneChange = () => {
    setAutoTimezone(!autoTimezone);
  };

  // eslint-disable-next-line
 

  useEffect(() => {
    handleTimeZoneChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeZone]);
  useEffect(() => {
    if (selectedTimeZone) {
      // Handle timezone change logic here
    }
  }, [selectedTimeZone]);

  const handleTimeZoneChange = async () => {
    if (selectedTimeZone) {
      try {
        const response = await fetch(`${API_URL}/update-usertimezone/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            email: userEmail,
            timezone: selectedTimeZone.value,
          }),
        });

        if (response.ok) {
          console.log("Timezone updated successfully");

          // Wait for the updateDatesBasedOnTimezone to complete before proceeding
          await updateDatesBasedOnTimezone(selectedTimeZone.value);
          setIsTimezoneModalOpen(false)
        } else {
          console.error("Failed to update timezone:", response.status);
        }
      } catch (error) {
        console.error("Error updating timezone:", error);
      }
    }
  };

 

  const handleFileSizeUnitChange = (unit) => {
    setFileSizeUnit(unit);
    setIsFileSizeUnitDropdownOpen(false); // Close dropdown after selection
  };

  const handleDownloadFileSizeChange = (e) => {
    setDownloadFileSize(e.target.value);
  };

  // eslint-disable-next-line
  const handleSaveButtonClick = async () => {
    try {
      
      const userGroupsResponse = await fetch(
        `${API_URL}/api/admin/update-dc-group/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dcgroups: userGroupsData }),
        }
      );

      // Make API call to update container data
      // const containerResponse = await fetch("http://127.0.0.1:8000/api/admin/update-containers/", {
      // const containerResponse = await fetch(
      //   `${API_URL}/api/admin/update-containers/`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ containers: containerData }),
      //   }
      // );

      let sizeInBytes = parseFloat(downloadFileSize);
      if (fileSizeUnit === "kilobytes") {
        sizeInBytes *= 1024;
      } else if (fileSizeUnit === "megabytes") {
        sizeInBytes *= 1024 * 1024;
      }

      // const response = await fetch("http://127.0.0.1:8000/api/admin/allowed-download-file-size/", {
      // eslint-disable-next-line
      const response = await fetch(`${API_URL}/api/admin/allowed-download-file-size/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alloweddownloadfilesize: sizeInBytes }),
        }
      );

      // Make API call to update selected timezone
      if (selectedTimeZone) {
        // const timezoneResponse = await fetch("http://127.0.0.1:8000/api/admin/update-timezone/", {
        const timezoneResponse = await fetch(`${API_URL}/api/admin/update-timezone/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: userEmail,
              timezone: selectedTimeZone.value,
            }),
          }
        );

        if (!timezoneResponse.ok) {
          console.error("Error updating timezone:", timezoneResponse.status);
          toast.error("Failed to update timezone");
        }
      }

      if (userGroupsResponse.ok) {
        console.log("Data updated successfully");
        toast.success("Data updated successfully");
      } else {
        console.error(
          "Error updating user groups or container data:",
          userGroupsResponse.status
          // containerResponse.status
        );
        toast.error("Failed to update data");
      }
      try {
        // Create a copy of containerData excluding any rows with isEditing flag
        const requestBody = {
          global_column_config: [
            ...containerData.map((container) => ({
              id: container.id,
              account_name: container.account_name,
              account_key: container.account_key,
              is_download_storage: false,
            })),
            ...(newFieldName.trim() !== ""
              ? [
                  {
                    id: null, // Set field_id to an empty string for the new field
                    account_name: newFieldName,
                    account_key: newAccountKey,
                    is_download_storage: false,
                  },
                ]
              : []),
          ],
        };

       
        console.log("datatosave", requestBody);
        setLoading(false)

       
      } catch (error) {
        console.error("Save button error:", error);
        toast.error("Failed to update storage accounts");
      }
    } catch (error) {
      console.error("Save button error:", error);
      toast.error("Failed to update user groups or container data");
    }
  };

  const fetchDownloadConfigData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/list-global-column/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(),
      });

      console.log("API response:", response);

      if (response.ok) {
        const downloadConfigData = await response.json();
        console.log("downloadConfigData:", downloadConfigData);

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

        console.log("Updated downloadConfigApiData:", downloadConfigData.data);
      } else {
        console.error("Error fetching global columns:", response.status);
        toast.error("Failed to fetch global columns");
      }
    } catch (error) {
      console.error("Error in fetchDownloadConfigData:", error);
      toast.error("Failed to update data");
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (activeModal === "Global Column Config") {
      fetchDownloadConfigData();
    }
    // eslint-disable-next-line
  }, [token, activeModal]);

  useEffect(() => {
    console.log("Updated downloadConfigApiData:", downloadConfigApiData);
  }, [downloadConfigApiData]);

  const handleDownloadConfigFieldChange = (index, field, value) => {
    console.log("index", index);
    setDownloadConfigApiData((prevData) => {
      const newData = prevData.map((config, i) => {
        console.log("i", i);
        if (i === index) {
          return {
            ...config,
            id: config.id, // Keep the same id
            name: field === "name" ? value : config.name, // Update the name if field is 'name'
            is_masked:
              field === "is_masked" ? value === "true" : config.is_masked, // Keep the same is_masked
          };
        }
        console.log("22", config.name);
        return config;
      });

      return newData;
    });
  };

 
  const handleInputChange = (e) => {
    const inputValue = e.target.value.toLowerCase();
    setInputValue(inputValue);
    console.log("input", inputValue);
  };

  const handleModalInputChange1 = (e) => {
    setInputValue1(e.target.value);
  };

  // Event handler for the second input
  const handleModalInputChange2 = (e) => {
    setInputValue2(e.target.value);
  };

  const handleAccountNameChange = (e) => {
    const accName = e.target.value.toLowerCase();
    setNewFieldName(accName);
  };

  const handleAccountKeyChange = (e) => {
    const accKey = e.target.value;
    setNewAccountKey(accKey);
  };

  const handleFilePathChange = (e) => {
    const accKey = e.target.value.toLowerCase();
    setNewFilePath(accKey);
    // setNewFilePath(saveButtonClicked ? "*".repeat(accKey.length) : accKey);
  };
  const handleUploadButtonClick = async () => {
    setShowUploadPopup(true);
    // try {
    //   const fileInput = document.createElement("input");
    //   fileInput.type = "file";
    //   fileInput.onchange = handleFileChange;
    //   fileInput.click();
    //   setShowUploadPopup(true);
    // } catch (error) {
    //   console.error("Error in handleUploadButtonClick:", error);
    //   toast.error("Failed to upload file");
    // }
  };
  const toggleTimezoneModal = () => {
    setIsTimezoneModalOpen(!isTimezoneModalOpen);
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

 
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFileName) {
      toast.error("No file selected");
      return;
    }

    const browseFile = new FormData();
    browseFile.append("file", selectedFileName);

    try {
      const response = await fetch(`${API_URL}/api/admin/upload-column/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: browseFile,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success("File uploaded successfully");
      handleClearSelectedFile(); // Clear the selected file after successful upload
      setLoading(false)
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  const fetchStorageContainerData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/list-storage-accounts/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // You may need to pass some data in the body if required by the API
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setContainerData(responseData.data);
        setIsStorageContainerModal(true);
        setShowPreview(true);
        setLoading(false);
        console.log("containerData:", responseData.data);
      } else {
        console.error(
          "Error fetching storage container data:",
          responseData.message
        );
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (activeModal === "Storage Container") {
      fetchStorageContainerData();
    }
    // eslint-disable-next-line
  }, [token, activeModal]);

  useEffect(() => {
    console.log("Updated ContainerData:", containerData);
  }, [containerData]);

  // const handleContainerDataChange = (index, field, value) => {
  //   // Update the account key in the local state
  //   const updatedContainerData = [...containerData];
  //   updatedContainerData[index][field] = value;
  //   setContainerData(updatedContainerData);
  // };

  const handleDownloadOptionChange = async (selectedOption) => {
    console.log("22", selectedOption);
    console.log("selectedoptions", selectedOption);
    try {
      setShowDownloadOptions(false); // Hide the download options dropdown

      let configType, requestBody;

      if (selectedOption === "Global") {
        configType = "global";
        requestBody = { config_type: configType };
      } else if (selectedOption === "Local") {
        configType = "file_specific";
        requestBody = { config_type: configType };
      }

      console.log("configtype", configType, requestBody);

      const response = await fetch(`${API_URL}/api/admin/download-column/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log(`Download request for ${configType} succeeded`);

        // Create a URL for the blob
        const url = window.URL.createObjectURL(await response.blob());

        // Create a hidden anchor element
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `downloaded-${configType}-file.xlsx`); // Set the desired file name
        document.body.appendChild(link);

        // Trigger a click on the anchor element to initiate the download
        link.click();

        // Remove the anchor element
        document.body.removeChild(link);
        setLoading(false);
      } else {
        console.error(
          `Error in download request for ${configType}:`,
          response.status
        );
        toast.error(`Failed to initiate download for ${configType}`);
      }
    } catch (error) {
      console.error("Error in handleDownloadOptionChange:", error);
      toast.error("Failed to initiate download");
    }
  };

  // eslint-disable-next-line
  const handleCheckboxChange = (container) => {
    setSelectedContainer(container);
    console.log("selected container", container.name);
  };

  // const handleFileCheckboxChange = (fileshare) => {
  //   setSelectedFileShareRow(fileshare);
  //   console.log("selected Fle Share Name", fileshare.name);
  // };
  // eslint-disable-next-line
  const handleFileCheckboxChange = (fileShare) => {
    setSelectedFileShare(fileShare);
    // ... rest of your code
  };

  // eslint-disable-next-line
  const handleuserCheckboxChange = (group) => {
    setSelectedUserGroup(group);
  };

  // eslint-disable-next-line
  const handleMouseLeaveDownloadContainer = () => {
    // Hide the download options dropdown when the mouse leaves the container
    setShowDownloadOptions(false);
  };

  const handleDownloadSaveButtonClick = async () => {
    try {
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
                  id: "", // Set field_id to an empty string for the new field
                  name: newFieldName,
                  is_masked: newFieldIsMasked,
                  // blob_prefix: blobPrefix, // Example, adjust as needed
                },
              ]
            : []),
        ],
      };
      console.log("new", newFieldName);
      console.log("requstbody", requestBody);

      // Make the API call
      const response = await fetch( `${API_URL}/api/admin/update-global-column/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Parse the response
      const responseData = await response.json();
      console.log("1", responseData);

      // Check if the request was successful
      if (response.ok) {
        console.log(responseData.message); // Display success message
        // Update the state with the latest data
        setDownloadConfigApiData(responseData.updatedColumnData);
        setLoading(false);
        console.log(":", downloadConfigApiData);
        // if (userGroupsResponse.ok && containerResponse.ok) {
        //   console.log("Data updated successfully");
        //   toast.success("Data updated successfully");
        // if (selectedOption === "Global Column Config") {
        fetchDownloadConfigData();
        // }
        // showDeleteButton(false);

        setNewFieldName("");
        setNewFieldIsMasked(false);

        // Hide the new field row
        setisNewFieldVisible(false);
        // }
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

  useEffect(() => {
    // fetchDownloadConfigData();
    console.log("Updated downloadConfigApiData:", downloadConfigApiData);
  }, [downloadConfigApiData]); // Run this effect whenever downloadConfigApiData changes

  const handleAddNewField = () => {
    if (!newFieldName.trim()) {
      return; // Don't add a new field if the field name is empty
    }

    // Check if there is an existing row being edited
    const existingRowIndex = downloadConfigApiData.findIndex(
      (column) => column.isEditing
    );
    console.log("existing", existingRowIndex);

    if (existingRowIndex !== -1) {
      // If there is an existing row, update it with new values
      const updatedColumnData = [...downloadConfigApiData];
      const existingRow = updatedColumnData[existingRowIndex];
      console.log("1", updatedColumnData);
      console.log("2", existingRow);
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
      console.log("new", newField);

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
      const response = await fetch(`${API_URL}/api/admin/list-file-shares/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // You may need to pass some data in the body if required by the API
      });

      const responseData = await response.json();

      if (response.ok) {
        setFileShareData(responseData.data);
        setIsFileContainerModal(true);
        setShowPreview(true);
        setLoading(false);
      
        console.log("containerData:", responseData.data);
      } else {
        console.error(
          "Error fetching storage container data:",
          responseData.message
        );
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  };

  useEffect(() => {
    // Check if the "DownloadConfigContainer" tab is active before making the API call
    if (activeModal === "File Share") {
      fetchFileSharesData();
    }
    // eslint-disable-next-line
  }, [token, activeModal]);

   // eslint-disable-next-line
  const handleAddFileShareNewField = async () => {
    try {
      if (!newFieldName.trim()) {
        return; // Don't add a new field if the field name is empty
      }

      // Check if there is an existing row being edited
      const existingRowIndex = fileShareData.findIndex(
        (fileShare) => fileShare.isEditing
      );

      if (existingRowIndex !== -1) {
        // If there is an existing row, update it with new values
        const updatedFileShareData = [...fileShareData];
        const existingRow = updatedFileShareData[existingRowIndex];
        existingRow.name = newFieldName;
        existingRow.filepath = newFilePath; // Assuming you have newFilePath state
        existingRow.sync_status = "NOT_STARTED";
        existingRow.sync_start_time = "18:00:00";
        existingRow.sync_end_time = "19:00:00";
        existingRow.isEditing = false;
        setFileShareData(updatedFileShareData);
      } else {
        // If there is no existing row, add a new row with a new ID
        const newField = {
          id: fileShareData.length + 1, // Incremental numeric ID
          name: newFieldName,
          filepath: newFilePath, // Assuming you have newFilePath state
          sync_status: "NOT_STARTED",
          sync_start_time: "18:00:00",
          sync_end_time: "19:00:00",
          showDeleteButton: true,
          // Add any other properties you might need for a new field
        };

        setFileShareData((prevFileShareData) => [
          ...prevFileShareData,
          newField,
        ]);
      }
      console.log("newFileShare", newFilePath);

      // Clear input values after adding/updating a new field
      setNewFieldName("");
      setNewFilePath(""); // Assuming you have newFilePath state
      setisNewFieldVisibleFileShare(true);
    } catch (error) {
      console.error("Add new storage field error:", error);
      toast.error("Failed to add/update storage field");
    }
  };

  const handleFileShareDataChange = (index, field, value) => {
    // Update modifiedFileShares based on the changes
    const updatedModifiedFileShares = [...modifiedFileShares];
    updatedModifiedFileShares[index] = {
      ...updatedModifiedFileShares[index],
      [field]: value,
    };
    setModifiedFileShares(updatedModifiedFileShares);
  };

  
  const handleStorageAccountSave = async () => {
    try {
      if (!newFieldName.trim() || !newAccountKey.trim()) {
        toast.error("Please enter values for Field Name and Account key.");
        return;
      }
  
      const newField = {
        id: null,
        account_name: newFieldName,
        account_key: newAccountKey,
        is_download_storage: false,
      };
  
      const requestBody = {
        storage_account_data: [
          ...containerData.map((container) => ({
            id: container.id,
            account_name: container.account_name,
            account_key: container.account_key,
            is_download_storage: false,
          })),
          newField,
        ],
      };
  
      // Make API call to update storage accounts
      const response = await fetch(
        `${API_URL}/api/admin/update-storage-accounts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storage_account: requestBody.storage_account_data,
          }),
        }
      );
  
      const data = await response.json();
  
      if (Array.isArray(data.data)) {
        setContainerData(data.data);
        setModifiedFileShares([]);
        setisNewFieldVisibleStorage(false);
        setIsDeleteButtonVisible(false);
        setLoading(false);
      } else {
        console.error("Invalid storage_account_data:", data.data);
      }
  
      setIsSaveClicked(true);
      console.log("datatosave", requestBody);
    } catch (error) {
      console.error("Error saving storage accounts:", error);
    }
  };
  
  
  const handleFileShareSaveButtonClick = async () => {
    console.log("new", newFieldName, newFilePath);
    try {
      // Check if required fields are empty
      if (!newFieldName.trim() || !newFilePath.trim()) {
        toast.error("Please enter values for Field Name and File Path.");
        return;
      }
  
      const requestBody = {
        file_shares: [
          ...fileShareData.map((fileshare) => ({
            id: fileshare.id,
            name: fileshare.name,
            filepath: fileshare.filepath,
            sync_status: "NOT_STARTED",
            sync_start_time: "",
            sync_end_time: "",
          })),
          {
            id: null,
            name: newFieldName,
            filepath: newFilePath,
            sync_status: "NOT_STARTED",
            sync_start_time: "",
            sync_end_time: "",
          },
        ],
      };
  
      console.log("request", requestBody);
  
      const response = await fetch(`${API_URL}/api/admin/update-file-shares/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      console.log("data", data);
  
      if (Array.isArray(data.data)) {
        // Set the new file share data
        setFileShareData(data.data);
  
        // Clear the new field inputs
        setNewFieldName("");
        setNewFilePath("");
  
        setModifiedFileShares([]);
        setNewFileShares([]);
        setIsDeleteButtonVisible(false);
        setLoading(false);
        setNewFilePath("")
  
        // Set newFilePath to asterisks only if the save button is clicked
        setNewFilePath((prevFilePath) =>
          saveButtonClicked ? "*".repeat(prevFilePath.length) : prevFilePath
        );
  
        setSaveButtonClicked(true);
        setisNewFieldVisibleFileShare(false)
      } else {
        console.error("Invalid file_shares data:", data.file_shares);
      }
    } catch (error) {
      console.error("Error saving file shares:", error);
    }
  };
  

  useEffect(() => {
    console.log("fileshare",fileShareData);
  },[fileShareData])

  // const handleFileShareSaveButtonClick = async () => {
  //   try {
  //     if (!newFieldName.trim() || !newFilePath.trim()) {
  //       toast.error("Please enter values for Field Name and File Path.");
  //       return;
  //     }
  
  //     const newFileShare = {
  //       id: null,
  //       name: newFieldName,
  //       filepath: newFilePath,
  //       sync_status: "NOT_STARTED",
  //       sync_start_time: "",
  //       sync_end_time: "",
  //     };
  
  //     const requestBody = {
  //       file_shares: [
  //         ...fileShareData,
  //         newFileShare,
  //       ],
  //     };
  //     console.log("req",requestBody);
  
  //     const response = await fetch(`${API_URL}/api/admin/update-file-shares/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(requestBody),
  //     });
  
  //     const data = await response.json();
  //     console.log("data",data);
  
  //     if (Array.isArray(data.file_shares)) {
  //       setFileShareData(data.file_shares);
  //       setisNewFieldVisibleFileShare(false);
  //       setSaveButtonClicked(true);
  //     } else {
  //       console.error("Invalid file_shares data:", data.file_shares);
  //     }
  //   } catch (error) {
  //     console.error("Error saving file shares:", error);
  //   }
  // };
  

  const handleFileShareRefresh = async (fileshare) => {
    console.log("dd",fileshare)
    try {
      // Assuming you are making a POST request to start the sync
      const response = await fetch( `${API_URL}/api/admin/sync-file-shares/${fileshare.id}/`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Sync started successfully, update sync status for File Share
        setFileShareSyncStatus((prev) => ({
          ...prev,
          [fileshare.id]: "pending",
        }));

        // You might want to wait for the sync to complete and update the status accordingly
        // After sync completion, update the status
        setFileShareSyncStatus((prev) => ({
          ...prev,
          [fileshare.id]: "success", // Update based on your actual logic
        }));
      } else {
        // Failed to start sync, update sync status for File Share
        setFileShareSyncStatus((prev) => ({
          ...prev,
          [fileshare.id]: "failed",
        }));
      }
    } catch (error) {
      console.error("Error during sync:", error);
      // Handle error if necessary
    }
  };

  const handleRefresh = async () => {
    try {
      const requestBody = {
        storage_account_name: "azuredatasec",
      };
      await secureApiCall(
        `${API_URL}/api/core/refresh_storage_account/`,
        "POST",
        requestBody
      );
      setStorageContainerSyncStatus((prev) => ({
        ...prev,
      }));
    } catch (error) {
      console.error("Error during sync:", error);
      setStorageContainerSyncStatus((prev) => ({
        ...prev,
      }));
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
    console.log("selected storage", container.account_name);
    // Display a toast message when a row is clicked
    toast.info(`Selected storage: ${container.account_name}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  // eslint-disable-next-line
  const handleFileShareRowClick = (fileshare) => {
    setSelectedContainer(fileshare);
    // Trigger the checkbox click
    const checkbox = document.getElementById(`checkbox-${fileshare.id}`);
    if (checkbox) {
      checkbox.click();
    }
    console.log("selected storage", fileshare.name);
    // Display a toast message when a row is clicked
    toast.info(`Selected storage: ${fileshare.name}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
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

    toast.info(`Selected group: ${clickedGroup.group_name}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  // const handleFileShareRefresh = async (fileshare) => {

  //     try {
  //       // Assuming you are making a POST request to start the sync
  //       const response = await fetch(
  //         // `http://127.0.0.1:8000/api/admin/sync-file-shares/${fileshare.id}/`,
  //         `${API_URL}/api/admin/sync-file-shares/${fileshare.id}/`,
  //         {
  //           method: "POST",
  //         }
  //       );

  //       if (response.ok) {
  //         // Sync started successfully, update sync status
  //         setSyncStatus((prev) => ({
  //           ...prev,
  //           [fileshare.id]: "pending",
  //         }));

  //         // You might want to wait for the sync to complete and update the status accordingly
  //         // You can use a setTimeout or any other mechanism for this

  //         // After sync completion, update the status
  //         setSyncStatus((prev) => ({
  //           ...prev,
  //           [fileshare.id]: "success", // Update based on your actual logic
  //         }));
  //       } else {
  //         // Failed to start sync, update sync status
  //         setSyncStatus((prev) => ({
  //           ...prev,
  //           [fileshare.id]: "failed",
  //         }));
  //       }
  //     } catch (error) {
  //       console.error("Error during sync:", error);
  //       // Handle error if necessary
  //     }
  //   };

  const handleDeleteClick = async (userGroupId) => {
    console.log("index",userGroupId)
    // const groupToDelete = userGroupsData[index];

    try {
      await secureApiCall(
        `${API_URL}/api/core/blob-groups/${userGroupId}/`,
        "DELETE"
      );
      const updatedUserGroups = userGroupsData.filter(
        (group) => group.id !== userGroupId
      );
      setUserGroupsData(updatedUserGroups);
      setSelectionUserGroupDeletion(null);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred during delete:", error);
    }
  };

  // eslint-disable-next-line
  const handleRadioChange = (event, fieldId) => {
    const updatedColumnData = columnData.map((column) => {
      if (column.field_id === fieldId) {
        return {
          ...column,
          is_masked: event.target.value === "true",
        };
      }
      return column;
    });

    setColumnData(updatedColumnData);
  };

  const handleDeleteField = (fieldId, fieldName) => {
    console.log(fieldId, fieldName);
    setDownloadConfigApiData((prevDownloadApiData) => {
      console.log("1", prevDownloadApiData);
      // Check if prevDownloadApiData is not null before applying filter
      if (prevDownloadApiData) {
        // Check if newField is not null before applying filter
        const filteredData = prevDownloadApiData.filter((field) => {
          return !(field.id === fieldId && field.name === fieldName);
        });
        console.log("2", filteredData);

        // Make sure to handle any side effects related to filteredData
        // (e.g., updating state, making API calls, etc.) as needed

        return filteredData;
      } else {
        // If prevDownloadApiData is null, return an empty array or handle it as needed
        return [];
      }
    });
  };

  // const toggleAccountKeyVisibility = () => {
  //   setShowAccountKey((prevShowAccountKey) => !prevShowAccountKey);
  // };

  const handleContainerDataChange = (index, field, value) => {
    setContainerData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  // const handleFileShareDataChange = (index, field, value) => {
  //   setFileShareData((prevData) => {
  //     const newData = [...prevData];
  //     newData[index] = { ...newData[index], [field]: value };
  //     return newData;
  //   });
  // };

  // Update toggleAccountKeyVisibility function to toggle showActualKey for a specific container
  // const toggleAccountKeyVisibility = (index) => {
  //   console.log("index",index);
  //   setContainerData((prevData) => {
  //     const newData = [...prevData];
  //     newData[index] = { ...newData[index], showActualKey: !newData[index].showActualKey };
  //     console.log("newdata",newData);
  //     return newData;
  //   });
  // };

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
  // Close the modal and reset state variables
  const closePreviewModal = () => {
    document.body.style.overflow = "visible";
    setIsModalOpen(false);
    setShowPreview(false);
    setDataType(null);
    setIsEditUserModalOpen(false);
    setIsStorageContainerModal(false);
    setIsFileShareModal(false);
    setIsMiscellaneousModal(false);
    setIsGlobalColumnModal(false);
    setisNewFieldVisibleStorage(false);
    // setSelectedOption("")
  };

  // eslint-disable-next-line
  const handleAzureInputChange = (e) => {
    //
    console.log("New input value:", e.target.value);
    setTextInputValue(e.target.value);
  };
  const handleEditModalInputChange = (e) => {
    const updatedUserGroup = { ...editedUserGroup, name: e.target.value };
    setEditedUserGroup(updatedUserGroup);
  };

  // eslint-disable-next-line
  const handleListUsergroups = () => {
    secureApiCall(`${API_URL}/api/core/blob-groups/`, "GET")
      .then((data) => {
        console.log("2", data);
        if (data && Array.isArray(data) && data.length > 0) {
          setAvailableItems(data);
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

  

  // const handleItemClick = (item, event) => {
  //   console.log("clickesitem",item)
  //   setChosenItems((prevChosenItems) => {
  //     const updatedChosenItems = new Set(prevChosenItems);
  //     const isCtrlPressed = event.ctrlKey || event.metaKey;

  //     if (isCtrlPressed) {
  //       if (updatedChosenItems.has(item)) {
  //         updatedChosenItems.delete(item);
  //       } else {
  //         updatedChosenItems.add(item);
  //       }
  //     } else {
  //       updatedChosenItems.clear();
  //       updatedChosenItems.add(item);
  //     }

  //     return updatedChosenItems;
  //   });
  // };

  const handleItemClick = (item, event) => {
    console.log("ee", item);
    // Check if the Ctrl key is pressed
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
    console.log("selecteditems",selectedItems);
  };

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted.current) {
      console.log("selectedItems:", selectedItems);
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

  const handleMoveToRight = () => {
    // Check if there are selected items
    if (selectedItems.length > 0) {
      // Use a callback function for state updates to ensure the latest state
      setChosenItems((prevChosenItems) => {
        // Combine the existing and newly selected permissions
        const updatedChosenItems = [...prevChosenItems, ...selectedItems];

        // Convert the array to a Set to remove duplicates, then convert it back to an array
        const uniqueChosenItems = Array.from(new Set(updatedChosenItems));

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
    setTimeout(() => {
      console.log("Chosen Items Updated:", chosenItems);
    }, 0);
  };

  const handleUserPermissions = () => {
    secureApiCall(`${API_URL}/api/core/blob-roles/`, "GET")
      .then((data) => {
        console.log("2", data);
        if (data && Array.isArray(data) && data.length > 0) {
          setAvailableItems(data);
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

  useEffect(() => {
    console.log("Available Items Updated:", availableItems);
  }, [availableItems]);

  useEffect(() => {
    console.log("Chosen Items Updated:", chosenItems);
  }, [chosenItems]);

  useEffect(() => {
    // Fetch available permissions when the component mounts
    handleUserPermissions();
    // eslint-disable-next-line
  }, []);


  // const handleMoveToLeft = () => {
  //   // Check if there are selected items
  //   console.log("selected", selectedItems);
  //   if (selectedItems.length > 0) {
  //     // Update editedUserGroup with the selected items removed
  //     setEditedUserGroup((prevEditedUserGroup) => {
  //       // Ensure that roles is initialized as an array
  //       const prevRoles = Array.isArray(prevEditedUserGroup.roles) ? prevEditedUserGroup.roles : [];
  
  //       // Filter out the selected items from the roles
  //       const updatedRoles = prevRoles.filter((role) => !selectedItems.some((selectedItem) => selectedItem.id === role.id));
  
  //       return {
  //         ...prevEditedUserGroup,
  //         roles: updatedRoles,
  //       };
  //     });
  
  //     // Update availableItems by adding the selected items and removing duplicates
  //     setAvailableItems((prevAvailableItems) => {
  //       // Combine the existing available items with the selected items
  //       const updatedAvailableItems = [...prevAvailableItems, ...selectedItems];
  
  //       // Convert the array to a Set to remove duplicates, then convert it back to an array
  //       const uniqueAvailableItems = Array.from(new Set(updatedAvailableItems.map(item => item.id)))
  //         .map(id => updatedAvailableItems.find(item => item.id === id));
  
  //       // Filter out the selected items from the available items
  //       return uniqueAvailableItems.filter(item => !selectedItems.some(selectedItem => selectedItem.id === item.id));
  //     });
  
  //     // Update chosenItems by filtering out the selected items
  //     setChosenItems((prevChosenItems) => {
  //       // Ensure that prevChosenItems is always an array
  //       const currentChosenItems = Array.isArray(prevChosenItems) ? prevChosenItems : [];
  
  //       // Filter out the selected items from the chosen items
  //       const updatedChosenItems = currentChosenItems.filter((item) => !selectedItems.some((selectedItem) => selectedItem.id === item.id));
  
  //       return updatedChosenItems;
  //     });
  
  //     // Clear the selection
  //     setSelectedItems([]);
  //   }
  
  //   // Log updated states
  //   setTimeout(() => {
  //     console.log("Available Items Updated:", availableItems);
  //     console.log("Chosen Items Updated:", chosenItems);
  //   }, 0);
  // };
  
  // // Add useEffect to monitor availableItems changes
  // useEffect(() => {
  //   console.log("Available Items Updated:", availableItems);
  // }, [availableItems]);
  
  /////////////////////////////////////////////////////////////////


  // const handleMoveToLeft = () => {
  //   // Ensure that chosenItems is initialized as an array
  //   const currentChosenItems = Array.isArray(chosenItems) ? chosenItems : [];

  //   // Remove duplicates from selectedItems
  //   const uniqueSelectedItems = selectedItems.filter(
  //     (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  //   );

  //   // Move only unique selected items to the left container
  //   setAvailableItems((prevAvailableItems) => {
  //     // Filter out items that are already present in availableItems
  //     const itemsToAdd = uniqueSelectedItems.filter(
  //       (selectedItem) =>
  //         !prevAvailableItems.some((item) => item.id === selectedItem.id)
  //     );
  //     return [...prevAvailableItems, ...itemsToAdd];
  //   });

  //   // Remove the moved items from the Chosen Permission container
  //   setChosenItems((prevChosenItems) =>
  //     Array.isArray(prevChosenItems)
  //       ? prevChosenItems.filter((item) => !selectedItems.includes(item))
  //       : currentChosenItems
  //   );

  //   // Update editedUserGroup with the selected items removed
  //   setEditedUserGroup((prevEditedUserGroup) => {
  //     // Ensure that roles is initialized as an array
  //     const prevRoles = Array.isArray(prevEditedUserGroup.roles)
  //       ? prevEditedUserGroup.roles
  //       : [];

  //     // Filter out the selected items from the roles
  //     const updatedRoles = prevRoles.filter(
  //       (role) =>
  //         !selectedItems.some((selectedItem) => selectedItem.id === role.id)
  //     );

      // console.log("updated", updatedRoles);
      // console.log("prevRole", prevRoles);
      // console.log("edited", prevEditedUserGroup.roles);

  //     return {
  //       ...prevEditedUserGroup,
  //       roles: updatedRoles,
  //     };
  //   });

  //   // Clear the selection
  //   setSelectedItems([]);
  // };

//   const handleMoveToLeft = () => {
//     // Check if there are selected items
//     if (selectedItems.length > 0) {
//         // Update editedUserGroup with the selected items removed
//         setEditedUserGroup((prevEditedUserGroup) => {
//             // Ensure that roles is initialized as an array
//             const prevRoles = Array.isArray(prevEditedUserGroup.roles) ? prevEditedUserGroup.roles : [];

//             // Filter out the selected items from the roles
//             const updatedRoles = prevRoles.filter((role) => !selectedItems.some((selectedItem) => selectedItem.id === role.id));

//             return {
//                 ...prevEditedUserGroup,
//                 roles: updatedRoles,
//             };
//         });

//         // Use a callback function for state updates to ensure the latest state
//         setChosenItems((prevChosenItems) => {
//             // Ensure that prevChosenItems is always an array
//             const currentChosenItems = Array.isArray(prevChosenItems) ? prevChosenItems : [];
            
//             // Filter out the selected items from the chosen items
//             return currentChosenItems.filter((item) => !selectedItems.includes(item));
//         });

//         // Use a callback function for state updates to ensure the latest state
//         setAvailableItems((prevAvailableItems) => {
//             // Combine the existing available items with the selected items
//             const updatedAvailableItems = [...prevAvailableItems, ...selectedItems];

//             // Convert the array to a Set to remove duplicates, then convert it back to an array
//             const uniqueAvailableItems = Array.from(new Set(updatedAvailableItems));

//             return uniqueAvailableItems;
//         });

//         // Clear the selection
//         setSelectedItems([]);
//     }

//     // Move console.log here
//     setTimeout(() => {
//         console.log("Chosen Items Updated:", chosenItems);
//     }, 0);
// };

const handleMoveToLeft = () => {
  console.log("selected", selectedItems);
  if (selectedItems.length > 0) {
    // Update editedUserGroup with the selected items removed
    setEditedUserGroup((prevEditedUserGroup) => {
      const prevRoles = Array.isArray(prevEditedUserGroup?.roles) ? prevEditedUserGroup.roles : [];
console.log("roles",prevRoles);
      // Filter out the selected items from the roles
      const updatedRoles = prevRoles.filter((role) => !selectedItems.some((selectedItem) => selectedItem.id === role.id));
      console.log("updated",updatedRoles);

      return {
        ...prevEditedUserGroup,
        roles: updatedRoles,
      };
    });

    console.log("editedUserGroup after update", editedUserGroup);

    // Update availableItems by removing the selected items
    setAvailableItems((prevAvailableItems) => {
      const filteredAvailableItems = prevAvailableItems.filter(
        (item) => !selectedItems.some((selectedItem) => selectedItem.id === item.id)
      );
      console.log("filterd",filteredAvailableItems);

      // Combine the filtered available items with the selected items
      const updatedAvailableItems = [...filteredAvailableItems, ...selectedItems];

      // Ensure there are no duplicates by converting to a Set and back to an array
      const uniqueAvailableItems = Array.from(new Set(updatedAvailableItems.map(item => item.id)))
        .map(id => updatedAvailableItems.find(item => item.id === id));

      console.log("updatedAvailableItems", uniqueAvailableItems);
      return uniqueAvailableItems;
    });

    // Update chosenItems by filtering out the selected items
    setChosenItems((prevChosenItems) => {
      const currentChosenItems = Array.isArray(prevChosenItems) ? prevChosenItems : [];
      const updatedChosenItems = currentChosenItems.filter((item) => !selectedItems.some((selectedItem) => selectedItem.id === item.id));

      console.log("updatedChosenItems", updatedChosenItems);
      return updatedChosenItems;
    });
    

    // Clear the selection
    setSelectedItems([]);
  }

  console.log("Available Items Updated:", availableItems);

  // Log the updated chosen items asynchronously
  setTimeout(() => {
    console.log("Chosen Items Updated:", chosenItems);
  }, 0);
};


useEffect(() => {
  console.log("Chosen Items Updated:", chosenItems);
}, [chosenItems]);


useEffect(() => {
  console.log("Available Items Updated:", availableItems);
}, [availableItems]);


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
      console.error("Invalid groupId:", groupId);
    }
  };

  const handleEditUserPermissions = (groupId) => {
    console.log("1", groupId);
    secureApiCall(`${API_URL}/api/core/blob-groups/${groupId}/`, "GET")
      .then((data) => {
        console.log("2", data);
        if (data && typeof data === "object") {
          setEditedUserGroup(data);
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

  const handleEditDcGroupsChange = (index, value) => {
    setEditedUserGroup((prevEditedUserGroupsData) => {
      const updatedEditedUserGroupsData = [...prevEditedUserGroupsData];
      updatedEditedUserGroupsData[index].dcgroups = value;
      return updatedEditedUserGroupsData;
    });
  };

  

  const handleSave = async () => {
    try {
      const url =
        editedUserGroup && editedUserGroup?.id
          ? `${API_URL}/api/core/blob-groups/${editedUserGroup.id}/`
          : `${API_URL}/api/core/blob-groups/create/`;
  
      const method = editedUserGroup && editedUserGroup?.id ? "PUT" : "POST";
  
      let dcgroupsValue = method === "POST" ? inputValue2 : editedUserGroup?.dcgroups;
  
      console.log("dc", dcgroupsValue);
  
      // Ensure dcgroupsValue is an array
      if (!Array.isArray(dcgroupsValue)) {
        dcgroupsValue = [dcgroupsValue];
      }
  
      // Ensure selectedItems is an array
      const selectedItemsArray = Array.isArray(selectedItems) ? selectedItems : [];
      console.log("selected", selectedItemsArray);
  
      // Ensure chosenItems is an array
      const chosenItemsArray = Array.isArray(chosenItems) ? chosenItems : Array.from(chosenItems);
      console.log("choose", chosenItemsArray);
  
      // Combine chosenItemsArray and selectedItemsArray and ensure uniqueness
      const uniqueSelectedItems = Array.from(new Set([...chosenItemsArray, ...selectedItemsArray]));
      console.log("unique", uniqueSelectedItems);

      const data = await secureApiCall(url, method, {
        roles: uniqueSelectedItems,
        name: method === "POST" ? inputValue1 : editedUserGroup.name,
        description: "admin",
        dcgroups: dcgroupsValue.join(","),
      });

      console.log("res", data);
      localStorage.setItem("chosenItems", JSON.stringify(uniqueSelectedItems));

      if (data && data.message) {
        setResponseMessage(data.message);
        console.log("data", data);
  
        // Ensure userGroupsData is always an array before updating
        setUserGroupsData((prevState) => {
          const prevData = Array.isArray(prevState) ? prevState : [];
          console.log("prev", prevData);
  
          // Check if data.data is defined and is an array
          if (data.data && Array.isArray(data.data)) {
            // Find the index of the edited user group in the previous data array
            const editedIndex = prevData.findIndex(group => group.id === editedUserGroup?.id);
  
            if (editedIndex !== -1) {
              // If the edited user group exists in the previous data, update it
              const updatedData = [...prevData];
              updatedData[editedIndex] = data.data[data.data.length - 1];
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
      }
    } catch (error) {
      console.error("Error occurred during save:", error);
      setResponseMessage("Error: Something went wrong.");
    }
  };
  
  useEffect(() => {
    console.log("user", userGroupsData);
  }, [userGroupsData]);
  
  

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

  const handleTimezoneOptionClick = (option) => {
    setSelectedTimeZone(option);
    setIsTimezoneDropdownOpen(false);
    // Additional logic if needed on selecting a timezone
  };

  const handleAddMoveToLeft = () => {
    // Move selected items from chosen to available
    setAvailableItems([...availableItems, ...selectedItems]);
    setChosenItems(chosenItems.filter(item => !selectedItems.includes(item)));
    setSelectedItems([]);
  };
  const renderAddUserGroup = () => {
    console.log("input", inputValue);

    return (
      <div className="w-full h-full   flex flex-col ">
        <div className="w-full h-10 bg-[#D9D9D9] rounded-tl-md rounded-tr-md flex flex-row items-center justify-between py-2 px-8 ">
          <h2 className="font-[500] text-[14px]">Add UserGroup</h2>
          <div className="flex flex-row items-center space-x-5 ">
            <label className="[14px] ">Name</label>

            <input
              className="outline-none p-1 font-normal text-sm rounded-sm h-6"
              type="text"
              name="name"
              value={inputValue1}
              onChange={handleModalInputChange1}
            />
            {/* <button
              className=" text-2xl font-semibold "
              onClick={closePreviewModal}
            >
              &times;
            </button> */}
          </div>
        </div>
        <div className="w-full h-8 flex flex-row items-center justify-between px-8 mt-3 ">
          <h1 className=" font-[500] text-[16px] ">Permissions</h1>
          <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: "14px" }} />
        </div>
        <div className="w-full h-[400px] ">
          <div className="flex flex-row justify-evenly space-x-6 mt-4">
            <div className="flex flex-col">
              <div>
                <div className="flex flex-row w-72 space-x-1 items-center justify-center h-8 rounded-t-lg bg-[#C0C0C0] ">
                  <h1 className=" p-1">Available Permission</h1>
                </div>
                <div
                  className="p-3 w-72 h-[250px] flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {availableItems.map((item, index) => (
                    <div
                      className="flex flex-col space-y-3 font-normal text-sm "
                      key={index}
                      onClick={(event) => handleItemClick(item, event)}
                      style={{
                        cursor: "pointer",
                        // background: selectedItems.includes(item)
                        //   ? "gray"
                        //   : "transparent",
                        background: selectedItems.includes(item)
                          ? "gray"
                          : "transparent",
                      }}
                    >
                      {item.description}
                      {/* Assuming you want to display the 'name' property */}
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="w-28 h-6  rounded  cursor-pointe mt-4 font-semibold text-xs bg-[#F5F5F5] text-secondary"
                onClick={handleChooseAll}
              >
                Choose All
              </button>{" "}
            </div>
            <div className="flex flex-col h-80 w-5  space-y-4 items-center justify-center ">
              <button className="arrow-buttons" onClick={handleMoveToRight}>
                <FontAwesomeIcon icon={faCircleRight} size="lg" />
              </button>
              <button className="arrow-buttons" onClick={handleAddMoveToLeft}>
                <FontAwesomeIcon icon={faCircleLeft} size="lg" />
              </button>
            </div>
            {/* <div className="flex flex-col"> */}
            <div className="flex flex-col  ">
              <div className="flex flex-row w-72 space-x-1 items-center justify-center h-8 rounded-t-md bg-[#C0C0C0] ">
                <h1 className=" p-1">Chosen Permission</h1>
              </div>
              <div
                className="p-3 w-72 h-[250px] flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                style={{ scrollbarWidth: "thin" }}
              >
                {console.log("chosenitems:", chosenItems)}
                {/* {chosenItems && chosenItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={(event) => handleItemClick(item, event)}
                    style={{
                      cursor: "pointer",
                      background: selectedItems.includes(item)
                        ? "lightblue"
                        : "transparent",
                    }}
                  >
                    {item.description}
                  </div>
                ))}   */}
                {console.log("chosenpermission1612:", chosenItems)}
                {/* {Array.from(chosenItems).map((item, index) => ( */}
                {chosenItems && Array.isArray(chosenItems) && chosenItems.map((item, index) => (
                  <div
                    className="flex flex-col space-y-3 font-normal text-sm "
                    key={index}
                    onClick={(event) => handleItemClick(item, event)}
                    style={{
                      cursor: "pointer",
                      background: selectedItems.includes(item)
                        ? "gray"
                        : "transparent",
                    }}
                  >
                    {item.description}
                  </div>
                ))}
              </div>
              <button
                className="w-28 h-6  rounded  cursor-pointe mt-4 font-semibold text-xs bg-[#F5F5F5] text-secondary"
                onClick={handleRemoveAll}
              >
                Remove All
              </button>
            </div>
          </div>
          {/* </div> */}
        </div>
        <hr className="w-[98%] h-[1.4px] bg-[#C0C0C0] mt-5 ml-2" />
        <div className="w-full h-32  flex flex-col mt-4">
          <h2 className="font-medium text-base  ml-3 px-8">SAML Authentication</h2>
          <div className="flex flex-row space-x-5 mt-3 ml-3 px-8">
            <label className="text-sm">Azure Group</label>
            <div>:</div>
            <input
              className="border border-[#D9DADF] outline-none p-1 font-normal 
              text-xs  w-[80%]  pt-2 text-justify  pb-2 h-8 overflow-ellipsis cursor-default"
              type="text"
              name="name"
              value={inputValue2}
              onChange={(e) => handleModalInputChange2(e)}
              textarea={true}
            />
          </div>
          <div className="w-[96%] h-7 flex justify-end mt-3  mr-4">
            <button
              className="w-20 h-6 items-end rounded-lg cursor-pointer font-semibold text-xs bg-[#F4F4F4] text-secondary"
              onClick={handleSave} // Ensure handleSave is bound here
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // eslint-disable-next-line
  const handleEditChooseAll = () => {
    // Move all items from availableItems to chosenItems
    setChosenItems([...chosenItems, ...availableItems]);
    // Clear availableItems array
    setAvailableItems([]);
    // Clear selectedItems array
    setSelectedItems([]);
  };

  // eslint-disable-next-line
  const handleEditRemoveAll = () => {
    // Logic to remove all chosen items and add them back to available items
    const updatedAvailableItems = [
      ...availableItems,
      ...chosenItems.filter(
        (chosenItem) =>
          !editedUserGroup.roles.some((role) => role.id === chosenItem.id)
      ),
    ];

    setChosenItems([]);
    setAvailableItems(updatedAvailableItems);
  };

  // // useEffect to log the updated state
  // useEffect(() => {
  //   console.log("Chosen Items Updated:", chosenItems);
  //   console.log("Available Items Updated:", availableItems);
  // }, [chosenItems, availableItems]);

  const renderEditUserGroup = () => {
    console.log("input", inputValue);
    // eslint-disable-next-line
    let item = {};

    return (
      <div className="w-full h-full   flex flex-col ">
        {editedUserGroup && (
          <>
            <div>
              <div
                className="w-full h-10 bg-[#D9D9D9] rounded-tl-md rounded-tr-md flex 
            flex-row items-center justify-between py-2 px-8"
              >
                <h2 className="font-[500] text-[14px]">Edit UserGroup</h2>
                <div className="flex flex-row items-center space-x-5 ">
                  <label>Name</label>
                  <div>:</div>
                  <input
                    className="outline-none p-1 font-normal text-sm rounded-sm h-6"
                    type="text"
                    name="name"
                    value={editedUserGroup.name}
                    onChange={handleEditModalInputChange}
                  />
                  <button
                    className=" text-2xl font-semibold "
                    onClick={closePreviewModal}
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="w-full h-8 flex flex-row items-center justify-between px-8 mt-4 ">
                <h1 className=" font-[500] text-[16px] ">Permissions</h1>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="w-full h-[380px]  ">
                <div className="flex flex-row justify-evenly space-x-6 mt-6">
                  <div className="flex flex-col">
                    <div>
                      <div className="flex flex-row w-72 space-x-1 items-center justify-center h-8 rounded-t-lg bg-[#C0C0C0] ">
                        <h1 className=" p-1">Available Permission</h1>
                      </div>
                      <div
                        className="p-3 w-72 h-[250px] flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                        style={{ scrollbarWidth: "thin" }}
                      >
                        {console.log("gg", availableItems)}
                        {console.log("hh", editedUserGroup)}
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
                                  className="flex flex-col space-y-3 font-normal text-sm "
                                  onClick={(event) =>
                                    handleItemClick(item, event)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    // background: selectedItems.includes(item)
                                    //   ? "lightblue"
                                    //   : "transparent",
                                    background: selectedItems.includes(item)
                                      ? "gray"
                                      : "transparent",
                                  }}
                                >
                                  {item.description}
                                </div>
                              ))
                          : availableItems.map((item, index) => (
                              <div
                                key={index}
                                className="flex flex-col space-y-3 font-normal text-sm "
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
                                    ? "gray"
                                    : "transparent",
                                }}
                              >
                                {item.description}
                              </div>
                            ))}

                        {console.log("bb", availableItems)}
                      </div>
                    </div>
                    <button
                      className="w-28 h-6  rounded  cursor-pointe mt-4 font-semibold text-xs bg-[#F5F5F5] text-secondary"
                      onClick={handleChooseAll}
                    >
                      Choose All
                    </button>{" "}
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
                  {/* <div className="flex flex-col"> */}
                  <div className="flex flex-col  ">
                    <div className="flex flex-row w-72 space-x-1 items-center justify-center h-8 rounded-t-md bg-[#C0C0C0] ">
                      <h1 className=" p-1">Chosen Permission</h1>
                    </div>
                    <div
                      className="p-3 w-72 h-[250px] flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {[...chosenItems].map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col space-y-3 font-normal text-sm "
                          onClick={(event) => handleItemClick(item, event)}
                          style={{
                            cursor: "pointer",
                            background: selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id
                            )
                              ? "gray"
                              : "transparent",
                            // background: selectedItems.includes(item) ? "gray" : "transparent",
                          }}
                        >
                          {item.description}
                        </div>
                      ))}
                    </div>
                    <button
                      className="w-28 h-6  rounded  cursor-pointe mt-4 font-semibold text-xs bg-[#F5F5F5] text-secondary"
                      onClick={handleRemoveAll}
                    >
                      Remove All
                    </button>
                  </div>
                </div>
                {/* </div> */}
                <hr className="w-[98%] h-[1.4px] bg-[#C0C0C0] mt-5 ml-2" />
                <div className="w-full h-28  flex flex-col mt-4">
                  {Array.isArray(editedUserGroup.dcgroups) ? (
                    editedUserGroup.dcgroups.map((groupId, index) => (
                      <div key={index}>
                        <label className="text-sm">Azure Group</label>
                        <div>:</div>
                        <input
                          className="border border-solid outline-none p-1 font-normal text-xs"
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
                    <div>
                      <h1 className="font-medium text-base ml-3 px-8">
                        SAML Authentication{" "}
                      </h1>
                      <div className="flex flex-row space-x-5 mt-3 ml-3 px-8">
                        <label className="text-sm">Azure Group</label>
                        <div>:</div>
                        <input
                          className="border w-[80%] border-lightgrya-100 outline-none p-1 font-normal text-xs"
                          type="text"
                          name="dcgroups"
                          textarea={true}
                          value={editedUserGroup.dcgroups || ""}
                          onChange={(e) =>
                            handleEditDcGroupsChange(0, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div className="w-[96%] h-7 flex justify-end mt-3 mr-4">
                    <button
                      className="w-20 h-6 items-end rounded-lg cursor-pointer font-semibold text-xs bg-[#F4F4F4] text-secondary"
                      onClick={handleSave} // Ensure handleSave is bound here
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const closeModal = () => {
    setActiveModal(null);
  };
  const openModal = (modalType) => {
    setActiveModal((prevModal) => {
      // Close the modal if the same type is clicked, otherwise switch to the new modal
      if (prevModal === modalType) {
        return null;
      }
      return modalType;
    });
  };

  const renderContent = () => {
    console.log("Active", activeModal);
    switch (activeModal) {
      case "Storage Container":
        return (
          <StorageContainerModal
            isOpen={true}
            renderContent={renderStorageContainer}
            showPreview={true}
            activeModal={activeModal}
            closeModal={closeModal}
          />
        );
      case "File Share":
        return (
          <FileShareModal
            isOpen={true}
            renderContent={renderFileShare}
            showPreview={true}
            closeModal={closeModal}
          />
        );
      case "Miscellaneous":
        return (
          <MiscellaneousModal
            isOpen={true}
            renderContent={renderMiscellaneous}
            showPreview={true}
            closeModal={closeModal}
          />
        );
      case "Global Column Config":
        return (
          <GlobalColumnConfigModal
            isOpen={true}
            renderContent={renderGlobalComun}
            showPreview={true}
            closeModal={closeModal}
            showUploadPopup={showUploadPopup}
            UploadPopup={UploadPopup}
          />
        );
      default:
        return null;
    }
  };


  useEffect(() => {
    if (isEditing) {
      setChosenItems(new Set(editedUserGroup.roles || []));
    } else {
      const storedChosenItems = localStorage.getItem("chosenItems");
      if (storedChosenItems) {
        setChosenItems(new Set(JSON.parse(storedChosenItems)));
      } else {
        setChosenItems(new Set());
      }
    }
    // eslint-disable-next-line
  }, [isEditing, editedUserGroup]);

  // eslint-disable-next-line
  const IsMaskedRadioButtons = ({ isMasked, fieldId, onRadioChange }) => {
    const handleRadioChangeInternal = (event) => {
      onRadioChange(event, fieldId);
    };

    return (
      <div className="labelcontainer">
        <label className="label">
          <input
            type="radio"
            value="true"
            checked={isMasked}
            onChange={handleRadioChangeInternal}
          />
          Yes
        </label>
        <label className="label">
          <input
            type="radio"
            value="false"
            checked={!isMasked}
            onChange={handleRadioChangeInternal}
          />
          No
        </label>
      </div>
    );
  };

  // const toggleDropdown = (dropdownType) => {
  //   setDropdownOpen((prevState) =>
  //     prevState === dropdownType ? !prevState : true
  //   );
  // };

  // eslint-disable-next-line
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // eslint-disable-next-line
  const handleHamburgerClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // eslint-disable-next-line
  const onResizeStop = (event, { size }) => {
    setSidebarWidth(size.width);
  };
  // const handleOptionClick = (option) => {
  //   setSelectedOption(option);
  //   console.log("1", selectedOption);
  // };
  // const handleOptionClick = (option) => {
  //   console.log("Selected Option (Inside Click Handler):", option);
  //   setSelectedOption(option);
  // };

  const handleOptionClick = (option) => {
    if (selectedOption === option) {
      // If the same option is clicked, toggle the modal
      setActiveModal(activeModal ? null : option);
    } else {
      // If a different option is clicked, set the new active modal
      setSelectedOption(option);
      setActiveModal(option);
    }
  };

  useEffect(() => {
    console.log("Selected Option:", selectedOption);
  }, [selectedOption]);

  const DownloadPopup = ({ onSelect, onClose }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-72 h-[120px] items-center flex flex-col space-y-4">
          <p className="font-medium text-sm text-red-500 ">
             You want to Download
          </p>
          <div className="flex space-x-4 justify-center">
          <button
             className="w-24  h-6 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
             justify-center items-center font-medium text-[13px] bg-[#EEEEEE]
            text-secondary  "
              onClick={() => {
                onSelect("Global");
                onClose();
              }}
            >
              Global
            </button>
            <button
             className="w-24  h-6 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
             justify-center items-center font-medium text-[13px] bg-[#EEEEEE]
            text-secondary  "
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
    );
   
  };

  // const handleDownloadButtonClick = () => {
  //   // Show the download options dropdown when the button is clicked
  //   setShowDownloadOptions(true);
  // };
  const handlePopupClose = () => {
    console.log("1");
    setShowDownloadPopup(false);
  };

  const handleDownloadButtonClick = () => {
    setShowDownloadPopup(true);
  };
 

  const handleDownloadOptionSelect = async (option) => {
    try {
      // Handle the selected download option (Global, Local, etc.)
      console.log("Selected option:", option);

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
        <div className="bg-white p-6 rounded-lg shadow-lg z-50 w-[350px] h-[120px] flex flex-col space-y-4">
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

  const UserDeleteConfirmationPopup = ({
    //  userGroupIndex, 
    context,
     onCancel, 
     onConfirm }) => {
      console.log("context",context);
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg z-50 w-[350px] h-[120px] flex flex-col space-y-4">
          <p className="font-medium text-sm text-red-500">
            Are You Sure You want to Delete ?
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
  };

  const handleUploadPopupClose = () => {
    setShowUploadPopup(false);

  }

  // eslint-disable-next-line
  const UploadPopup = ({}) => {
    return (
      // <div className="fixed inset-0 flex justify-center items-center blur-none">
      <div
        className="fixed left-[55%] transform -translate-x-1/2 bg-white border-1 border-solid border-ccc
        w-[42%] h-[500px]  mt-[90px] cursor-pointer  transition-right-0.3s ease-in-out shadow-top p-8 "
      >
        <div className="flex w-full justify-end">
        <button onClick={handleUploadPopupClose}>
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
            </button>

        </div>


        <div className="flex flex-col w-full h-full  items-center space-y-8">
       
          <p>Upload</p>
          <div className="w-full h-52 bg-[#FDF2E1] border border-dashed border-gray-100 flex flex-col items-center space-y-4 ">
            <img
              src={process.env.PUBLIC_URL + "/Upload-icon.png"}
              alt="uploadicon"
              className=" h-20 w-18 mt-6"
            />
            <p className="text-base mt-5">
              Drag & drop files or{" "}
              <span
                className="text-blue-800 underline"
                onClick={handleBrowseClick}
              >
                Browse
              </span>
            </p>
            <p className="text-[10px]">
              Supported formates: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
            </p>
          </div>
          <div className="w-full h-10 flex flex-row border border-lightgray-200 rounded px-2 py-1 items-center justify-between">
            <input
              type="text"
              className="w-full h-8 outline-none"
              placeholder="your-file-here.PDF"
              value={selectedFileName}
              readOnly
            />

            <button onClick={handleClearSelectedFile}>
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
            </button>
          </div>

          <button
            className="w-full  h-8 flex flex-row  px-4 rounded-sm cursor-pointer
                           justify-center items-center font-medium text-sm bg-loginbg
                          text-white  "
            onClick={handleUploadFile}
          >
            Upload
          </button>
        </div>
      </div>
      // </div>
    );
  };

  // const handleFileshareDeleteClick = (index) => {
  //   const fileshare = fileShareData[index];
  //   setSelectedFileShareForDeletion(fileshare);
  // };

  // eslint-disable-next-line
  const handleFileshareDeleteClick = (fileShare) => {
    // Set the selected file share for deletion
    setSelectedFileShareForDeletion(fileShare);

    // Optionally, you can show a confirmation dialog or directly call handleConfirmDelete
    handleConfirmDelete(fileShare);
  };



  const handleCancelDelete = () => {
    setSelectedFileShareForDeletion(null);
    setSelectionUserGroupDeletion(null);
    setSelectedStorageRowForDeletion(null);
    showDownloadPopup(false)
  };

  const handleConfirmStorageDelete = async (storageaccountId) => {
    console.log("id",storageaccountId)
    try {
      const response = await fetch(
        // `http://127.0.0.1:8000/api/admin/delete-file-shares/${fileShareId}/`,
        `${API_URL}/api/admin/delete-storage-accounts/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storage_account_id: storageaccountId,
          }),
        }
      );

      if (response.ok) {
        // Handle successful deletion
        console.log(`${storageaccountId} deleted successfully.`);

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
      if (fileShareId === null) {
        // If the file share ID is null, it's a newly added field, so remove it directly from the UI
        setFileShareData((prevData) =>
          prevData.filter((fileshare) => fileshare.id !== fileShareId)
        );
        setSelectedFileShareForDeletion(null);
        return; // Exit the function early
      }
  
      const response = await fetch(`${API_URL}/api/admin/delete-file-shares/${fileShareId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.ok) {
        console.log(`File share ${fileShareId} deleted successfully.`);
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
  const toggleTimezoneDropdown = () => {
    setIsTimezoneDropdownOpen((prev) => !prev);
  };

  const toggleFileSizeUnitDropdown = () => {
    setIsFileSizeUnitDropdownOpen((prev) => !prev);
  };

  const renderStorageContainer = () => {
    // console.log("input", inputValue);

    return (
      <div className="w-full h-full flex flex-col focus:outline-none ">
        <div className="w-full h-14 flex flex-row px-4 items-center justify-between rounded-br-lg">
          <button
            className="w-32  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer items-center font-medium text-sm bg-[#F5F5F5]
                        text-secondary  "
            // onClick={() => {
            //   setisNewFieldVisibleStorage(true);
            //   handleAddStorageNewField();
            
            // }}
            onClick={() => setisNewFieldVisibleStorage(true)}
          >
            Add New Field
          </button>
          {/* <div className=" flex  items-center  mr-4 space-x-7">
            <button
              className="w-20 h-6 flex flex-row items-center rounded-md cursor-pointer justify-center font-medium text-sm bg-[#F5F5F5]
                        text-secondary  "
              // onClick={
              //   // {handleSaveButtonClick}
              //   handleStorageAccountSave
              // }
            >
              Save
            </button>
            {/* <button
              className=" text-2xl font-semibold "
              onClick={() => {
                setisNewFieldVisibleStorage(false);
                closePreviewModal()
              }}
            >
              &times;
            </button> */}
          {/* </div>  */}
        </div>
        <div className="w-full h-full  rounded-t-sm admin-shadow-top border border-none">
          <div
            // className="w-full h-[350px] mt-6 p-6 overflow-y-auto overflow-x-hidden "
            className="w-full h-[95%]  overflow-y-auto overflow-x-hidden !important "
            style={{ scrollbarWidth: "thin" }}
          >
            <table className="table-design table-fixed w-full ">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[25%]" />
                <col className="w-[55%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="bg-loginbg sticky top-0 z-10 rounded-t-lg">
                <tr>
                  <th className="py-2 sticky top-0 border border-none rounded-tl-lg"></th>
                  <th className="py-2 sticky top-0 border border-l-0 border-r-0 text-[15px] text-white font-medium">
                    Storage Account Name
                  </th>
                  <th className="py-2 sticky top-0 text-[15px] text-white font-medium">
                    Storage Account Key
                  </th>
                  <th className="py-2 sticky top-0 text-[15px] text-white font-medium rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
              {containerData &&
    containerData.map((container, index) => (
     
                    <tr
                      key={container.id}
                      onClick={() => handleRowClick(container)}
                      style={{ cursor: "pointer" }}
                      // className="border  border-l-0 border-r-0 border-lightgray-200 "
                    >
                      <td className="text-[13px] font-[350] py-0.5 px-3">
                        {/* <input
                          // className="admin-checkbox"
                          type="checkbox"
                          onChange={() => handleCheckboxChange(container)}
                          checked={selectedContainer === container}
                        /> */}
                      </td>
                      <td className="text-[13px] font-[350] px-2">
                        <input
                          type="text"
                          value={container.account_name}
                          // onChange={(e) => setNewFieldName(e.target.value)}
                          readOnly
                        />
                      </td>
                      <div className="w-full">
                        <td className="text-[13px] font-[350]">
                          {showAccountKey ? (
                            <React.Fragment>
                              <input
                                className="w-full outline-none border-none h-6 cursor-pointer text-lightgray-100"
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
                                className="ml-[20px] text-[13px] font-light  border-none"
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
                                className="w-full outline-none border-none h-6 cursor-pointer text-lightgray-100"
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
                                className="ml-[20px] text-xs font-light border-none"
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
                      </div>

                      <td className="text-[13px] font-[350]">
                        <div className="flex flex-row space-x-3">
                          <button
                            className="text-xs font-light border-none  w-14 items-center justify-center
                                      rounded-md flex h-6 space-x-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefresh(container);
                            }}
                            // disabled={selectedStorageContainerRow !== container}
                          >
                            {/* <span className="text-xs font-semibold">Sync</span> */}
                            {/* <FontAwesomeIcon icon={faSyncAlt} /> */}
                            <img
                              src="sync-icon.png"
                              alt="sync"
                              //   className="w-4 h-4 rounded-lg font-semibold"
                            />
                          </button>
                          <button
                            // className="bg-lightgray-100 text-white px-2 py-1 w-[100px] rounded-lg font-semibold"
                            className="w-[20px] "
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click when button is clicked
                              setSelectedStorageRowForDeletion(container)
                            }}
                          >
                            <img
                              src="icon-delete.png"
                              alt="delete"
                              className="w-4 h-4 rounded-lg"
                            />

                            {/* Delete */}
                          </button>
                          {storageContainerSyncStatus[container.id] && (
                            <span
                              className={`status ${
                                storageContainerSyncStatus[
                                  container.id
                                ].toLowerCase() === "pending"
                                  ? "text-blue-500"
                                  : storageContainerSyncStatus[
                                      container.id
                                    ].toLowerCase() === "failed"
                                  ? "text-red-500"
                                  : storageContainerSyncStatus[
                                      container.id
                                    ].toLowerCase() === "success"
                                  ? "text-green-500"
                                  : ""
                              }`}
                            >
                              {storageContainerSyncStatus[container.id]}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

              
              </tbody>
            </table>
          </div>
        </div>
       
       {isNewFieldVisibleStorage && (
        <NewFieldPopup
          newFieldName={newFieldName}
          newAccountKey={newAccountKey}
          handleAccountNameChange={handleAccountNameChange}
          handleAccountKeyChange={handleAccountKeyChange}
          onCancel={() => setisNewFieldVisibleStorage(false)}
          handleStorageAccountSave={handleStorageAccountSave}
        />
      )}


        {selectedStorageRowForDeletion && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            <UserDeleteConfirmationPopup
              context={selectedStorageRowForDeletion}
              onCancel={handleCancelDelete}
              onConfirm={() => handleConfirmStorageDelete(selectedStorageRowForDeletion.id)}
            />
          </div>
        )}
      </div>
    );
  };

  const renderFileShare = () => {
    console.log("input", inputValue);

    return (
      <div className=" w-full h-full flex flex-col ">
        <div
          className={`w-full h-full flex flex-col  ${
            selectedFileShareForDeletion ? "admin-blur-effect" : ""
          }`}
        >
          <div className="w-full h-14 flex flex-row px-4 items-center justify-between rounded-br-lg">
            <button
              className="w-32 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer items-center font-medium text-sm bg-[#F5F5F5] text-secondary"
              onClick={() => {
                setisNewFieldVisibleFileShare(true);
                // handleAddFileShareNewField();
              }}
            >
              Add New Field
            </button>
            {/* <div className="flex items-center mr-4 space-x-7">
              <button
                className="w-20 h-6 flex flex-row items-center rounded-md cursor-pointer justify-center font-medium text-sm bg-[#F5F5F5] text-secondary"
                onClick={handleFileShareSaveButtonClick}
              >
                Save
              </button>
            </div> */}
          </div>
          <div className="w-full h-full rounded-t-sm admin-shadow-top border border-none">
            <div
              className="w-full h-[95%] overflow-y-auto overflow-x-hidden !important"
              style={{ scrollbarWidth: "thin" }}
            >
              <table className="table-design table-fixed w-full">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[45%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead className="bg-loginbg sticky top-0 z-10 rounded-t-lg">
                  <tr>
                    <th className="py-2 sticky top-0 border border-none rounded-tl-lg"></th>
                    <th className="py-2 sticky top-0 border border-l-0 border-r-0 text-[15px] text-white font-medium">
                      File Share Name
                    </th>
                    <th className="py-2 sticky top-0 text-[15px] text-white font-medium">
                      File Share Path
                    </th>
                    <th className="py-2 sticky top-0 text-[15px] text-white font-medium rounded-tr-lg px-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fileShareData &&
                    fileShareData.map((fileshare, index) => (
                      <tr
                        key={fileshare.id}
                        onClick={() => handleFileShareRowClick(fileshare)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="text-[14px] font-[350] py-0.5 px-3">
                          {/* <input
                            type="checkbox"
                            onChange={() => handleFileCheckboxChange(fileshare)}
                            checked={selectedFileShare === fileshare}
                          /> */}
                        </td>
                        <td className="text-[14px] font-[350]">
                          <input
                            className="w-[200px] mr-[12px]"
                            type="text"
                            value={fileshare.name}
                            // onChange={(e) => setNewFieldName(e.target.value)}
                            readOnly
                          />
                        </td>
                        <td className="text-[14px] font-[350]">
                          {showAccountKey ? (
                            <React.Fragment>
                              <input
                                className="w-[300px] outline-none border-none h-6 cursor-pointer text-lightgray-100"
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
                                  handleFileShareDataChange(
                                    index,
                                    "filepath",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                className="ml-[5px] text-xs font-light border-none"
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
                                className="w-[300px] outline-none border-none h-6 cursor-pointer text-lightgray-100"
                                type="text"
                                value={fileshare.filepath || ""}
                                onChange={(e) =>
                                  handleFileShareDataChange(
                                    index,
                                    "filepath",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                className="ml-[5px] text-xs font-light border-none"
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
                        <td className="text-[14px] font-[350] px-6">
                          <div className="flex flex-row space-x-3">
                            <button
                              className="text-xs font-light border-none w-14 items-center justify-center rounded-md flex h-6 space-x-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileShareRefresh(fileshare);
                              }}
                              // disabled={selectedFileShareRow !== fileshare}
                            >
                              <img src="Sync-icon.png" alt="sync" />
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
                            {fileShareSyncStatus[fileshare.id] && (
                              <span
                                className={`status ${
                                  fileShareSyncStatus[
                                    fileshare.id
                                  ].toLowerCase() === "pending"
                                    ? "text-blue-500"
                                    : fileShareSyncStatus[
                                        fileshare.id
                                      ].toLowerCase() === "failed"
                                    ? "text-red-500"
                                    : fileShareSyncStatus[
                                        fileshare.id
                                      ].toLowerCase() === "success"
                                    ? "text-green-500"
                                    : ""
                                }`}
                              >
                                {fileShareSyncStatus[fileshare.id]}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                 
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
              onConfirm={() => handleConfirmDelete(selectedFileShareForDeletion.id)}
            />
          </div>
        )}

{isNewFieldVisibleFileShare && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            <NewFileShareModal
              newFieldName={newFieldName}
              newAccountKey={newFilePath}
              handleAccountNameChange={handleAccountNameChange}
              handleFilePathChange={handleFilePathChange}
              onCancel={() => setisNewFieldVisibleFileShare(false)}
              handleFileShareSaveButtonClick={handleFileShareSaveButtonClick}
            />
          </div>
        )}
      </div>
    );
  };

  const renderMiscellaneous = () => {
    return (
      <div className="w-full h-full flex flex-col pl-12 ">
        <div className="w-[98%] h-8 flex justify-end mt-3"></div>
        <div className="w-full h-[90%] flex flex-row space-x-44 mt-8  ">
          <div className="flex flex-col space-y-5 ">
            <h2>Download File Size Allowed</h2>
            <div className="flex flex-row justify-between mt-8 p-1 w-40 h-7  rounded border  border-black ">
              <input
                type="text"
                placeholder="Enter download file size"
                className="outline-none ml-0 font-[350] text-[13px] "
                value={downloadFileSize}
                onChange={handleDownloadFileSizeChange}
              />
            </div>

            <div className="relative inline-block mt-6">
      <button
        id="fileSizeUnitDropdownButton"
        onClick={toggleFileSizeUnitDropdown}
        className="text-black w-40 border border-lightgray-100 bg-white font-normal rounded text-sm px-2 py-1.5 text-center inline-flex items-center"
        type="button"
      >
         <span className="truncate">{fileSizeUnit}</span>
         <svg
          className={`w-3 h-3 ml-1 ${isFileSizeUnitDropdownOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
          style={{ marginLeft: 'auto' }} // Ensure SVG stays at the end of the button
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div
        className={`absolute z-10 ${isFileSizeUnitDropdownOpen ? '' : 'hidden'} bg-background-100 border border-lightgray-100 divide-y divide-secondary rounded shadow w-40 dark:bg-primary mt-1`}
      >
        <ul className="py-1 text-sm text-secondary dark:text-gray-200" aria-labelledby="fileSizeUnitDropdownButton">
          <li>
            <button
              type="button"
              onClick={() => handleFileSizeUnitChange('Bytes')}
              className="block px-2 py-1 text-start w-full hover:bg-loginbg dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Bytes
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => handleFileSizeUnitChange('kilobytes')}
              className="block px-2 py-1 text-start w-full hover:bg-loginbg dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Kilobytes
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => handleFileSizeUnitChange('megabytes')}
              className="block px-2 py-1 text-start w-full hover:bg-loginbg dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Megabytes
            </button>
          </li>
        </ul>
      </div>
    </div>
          </div>

          <div className="flex flex-col space-y-5">
            <h2 className="">Select Time Zone</h2>
            <div className="relative inline-block mt-6">
              <button
                id="timezoneDropdownButton"
                // onClick={toggleTimezoneDropdown}
                onClick={toggleTimezoneModal}
                className="text-black bg-white border border-lightgray-100 w-40
                     font-normal rounded text-sm px-3 py-1.5 text-center inline-flex items-center"
                type="button"
              >
                {selectedTimeZone.label}{" "}
                <svg
          className={`w-3 h-3 ml-1 ${isFileSizeUnitDropdownOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
          style={{ marginLeft: 'auto' }} // Ensure SVG stays at the end of the button
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
              </button>
              <TimezoneModal
        isTimezoneModalOpen={isTimezoneModalOpen}
        toggleTimezoneModal={toggleTimezoneModal}
        autoTimezone={autoTimezone}
        handleAutoTimezoneChange={handleAutoTimezoneChange}
        selectedTimeZone={selectedTimeZone}
        timezoneOptions={timezoneOptions}
        handleTimezoneOptionClick={handleTimezoneOptionClick}
      />

              {/* Dropdown menu */}
              {/* <div
                className={`z-10 ${
                  isTimezoneDropdownOpen ? "" : "hidden"
                } bg-background-100 border h-36 overflow-y-auto border-lightgray-100 divide-y
                     divide-secondary shadow w-40 dark:bg-primary absolute`}
                style={{
                  scrollbarWidth: "thin", // For Firefox
                  // scrollbarColor: "darkgray lightgray", // For Firefox
                }}
              >
                <ul
                  className="py-1 text-sm text-secondary dark:text-gray-200"
                  aria-labelledby="timezoneDropdownButton"
                >
                  {timeZones.map((timezone) => (
                    <li key={timezone}>
                      {/* Your JSX content */}
                      {/* <button
                        onClick={() => handleTimezoneOptionClick(timezone)}
                        className="block px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        {timezone}
                      </button>
                    </li>
                  ))}
                </ul>
              </div> */} 
            </div>
          </div>
        </div>
      </div>
    );
  };

  //   const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
  //     const toggleSwitch = () => {
  //       onToggle(!isMasked);
  //     };

  //     // return (
  //     //   <div
  //     //     className={`relative w-[39.5px] h-[19.5px] rounded-full cursor-pointer bg-gray-200 duration-300 shadow-xl  ${
  //     //       isMasked ? "bg-gray-400" : "bg-green-500 "
  //     //     }
  //     //      ${disabled ? "opacity-50" : ""}
  //     //     `}
  //     //     onClick={toggleSwitch}
  //     //   >
  //     //      <span className={`absolute left-[2px] top-0.5 text-[11px] font-[500] text-black`}>Yes</span>
  //     //   <span className={`absolute right-1 top-0.5 text-[11px] font-[500] text-black`}>No</span>
  //     //     <div
  //     //       className={`absolute w-[18.5px] h-[18.5px] bg-white border-2 border-gray-200 rounded-full transform transition-transform shadow-xl ${
  //     //         isMasked ? "translate-x-5" : ""
  //     //       }`}

  //     //     >

  //     //     </div>
  //     //   </div>
  //     // );
  //     return (
  //         <div
  //           className={`relative w-[41px] h-[18px] rounded-full cursor-pointer duration-100  shadow-xl ${
  //             isMasked ? "bg-[#d2d6d2]" : "bg-[#48f542] "
  //           } ${disabled ? "opacity-50" : ""}`}
  //           onClick={toggleSwitch}
  //         //   style={{ border: "1px solid rgba(0, 0, 0, 0.2)" }}
  //         style={{
  //             boxShadow: isMasked
  //               ? "inset 0px 2px 5px rgba(0, 0, 0, 0.5)"
  //               : "inset 0px 2px 5px rgba(0, 0, 0, 0.5)",
  //               transition: "box-shadow 0.2s ease-in-out",
  //           }}
  //         >
  //           <span
  //             className="absolute left-[3.5px] top-[1px] text-[11px] font-[500] text-black"
  //             // style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.2)" }}
  //           >
  //             Yes
  //           </span>
  //           <span
  //             className="absolute right-1 top-0 text-[11px] font-[500] text-black"
  //             // style={{ textShadow: "inset 10px -8px 10px rgba(0, 0, 0, 0.2)" }}
  //           >
  //             No
  //           </span>
  //           <div
  //             className={`absolute w-[17px] h-[15px] bg-white top-[1px] left-[1.5px] right-[1.5px] rounded-full transform transition-transform shadow-xl ${
  //               isMasked ? "translate-x-[21px]" : ""
  //             }`}
  //             style={{
  //                 transition: "box-shadow 0.2s ease-in-out",
  //               }}

  //           ></div>
  //         </div>
  //       );
  //   };

  const IsMaskedSwitch = ({ isMasked, onToggle }) => {
    const toggleIsMasked = () => {
      onToggle(!isMasked);
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
          style={{ width: "30px", height: "20px", cursor: "pointer" }}
        />
      </div>
    );
  };

  const renderGlobalComun = () => {
    
    return (
      <div
        className={`relative w-full h-full flex flex-col border border-none  outline-none `}
      >
        <div
          className={`w-full h-24 bg-white rounded-br-lg rounded-bl-lg  p-3 flex flex-col space-y-3 
            ${showUploadPopup ? "blur-[5px]" : "blur-none"}
            ${showDownloadPopup ? "admin-blur-effect" : ""}
            `}
        >
          <div className="w-full flex flex-row justify-between  ">
            <div className="flex flex-row justify-between ml-5  w-80 h-7  rounded border  border-[#D9D9D9]">
              <input
                type="text"
                placeholder="Search here"
                onChange={handleInputChange}
                className="outline-none ml-2 font-[350] text-[13px] "
                value={inputValue}
              />
              <img
                src="search_icon.png"
                alt="search"
               className="w-4 h-4 mt-1.5 mr-1"
              />
            </div>
          </div>
          <div className="w-full flex flex-row  justify-between ">
            <div className="w-full flex flex-row space-x-5 px-3 ">
              {/* <button
                className="w-32  h-8 flex flex-row    rounded-md cursor-pointer justify-center 
                          items-center font-medium text-sm bg-[#EEEEEE]
                          text-secondary  "
                onClick={handleDownloadButtonClick}
              >
                Download
              </button>
              {showDownloadPopup && (
                <DownloadPopup
                  onClose={handlePopupClose}
                  onSelect={handleDownloadOptionSelect}
                />
              )} */}
              <button
                className="w-32  h-8 flex flex-row   px-4 rounded-md cursor-pointer 
                          items-center justify-center font-medium text-[13px] bg-[#EEEEEE]
                          text-secondary  "
                onClick={() => {
                  setisNewFieldVisible(true);
                  handleAddNewField();
                  // Check if newFieldRef is set before scrolling
                  // if (newFieldRef && newFieldRef.current) {
                  //   scroll();
                  // }
                }}
              >
                Add New Field
              </button>
              <button
                className="w-28  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                           justify-center items-center font-medium text-[13px] bg-[#EEEEEE]
                          text-secondary  "
                onClick={handleUploadButtonClick}
                // onClick={setShowUploadPopup(true)}
              >
                Upload
              </button>
              <button
                className="w-28  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                           justify-center items-center font-medium text-[13px] bg-[#EEEEEE]
                          text-secondary  "
                          onClick={handleDownloadButtonClick}
                // onClick={setShowUploadPopup(true)}
              >
                Download
              </button>
              {/* {showDownloadPopup && (
                          <DownloadPopup
                            onClose={handlePopupClose}
                            onSelect={handleDownloadOptionSelect}
                          />
                        )} */}
              {/* <div className="relative inline-block z-50">
              <button
                    id="pageSizeDropdownButton"
                    onClick={toggleDownLoadDropdown}
                    className="  text-black   rounded-lg text-[13px] font-medium px-3 py-1.5
                   text-center inline-flex items-center bg-[#EEEEEE]"
                    type="button"
                   
                  >
                    Download
                    <svg
                      className={`w-2.5 h-2 ms-3 ${
                        isdropdownOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>

       
        <div
                    className={` absolute z-50 top-full ${
                      isdropdownOpen ? "" : "hidden"
                    }  bg-background-100 border border-primary divide-y divide-secondary rounded-lg shadow w-32
                   dark:bg-primary absolute `}
                  >
                    <ul
                      className="py-1 text-sm text-secondary dark:text-gray-200"
                      aria-labelledby="pageSizeDropdownButton"
                    >
                      <li>
                        <button
                          type="button"
                          onClick={() => handleDownloadOptionChange('Global')}
                          className="block px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Global
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleDownloadOptionChange('Local')}
                          className="block px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Local
                        </button>
                      </li>
                      
                    </ul>
                  </div>
                </div>
               */}
              
              
            </div>
      
            <button
              className="w-28 h-7 flex flex-row    rounded-md cursor-pointer 
                          items-center justify-center font-medium text-[13px] bg-[#EEEEEE]
                          text-secondary  "
              onClick={handleDownloadSaveButtonClick}
            >
              {/* <img
                            // src="icon-hamburger-menu.png"
                            src={process.env.PUBLIC_URL + "/icon-save.png"}
                            alt="save"
                            style={{ width: "20px", height: "20px" }}
                          /> */}
              Save
            </button>
          </div>
        </div>

        <div
          className={`z-10 w-full h-[89%] bg-white mt-2 rounded-lg shadow-md admin-shadow-top overflow-y-auto 
                    overflow-x-hidden !important ${
                      isZoomedIn ? "overflow-x-auto " : ""
                    } ${showUploadPopup ? "blur-[5px]" : "blur-none"}  ${showDownloadPopup ? "admin-blur-effect" : ""}`}
        >
          <table className="w-full table-design ">
            <colgroup>
              <col className="w-[75%]" />
              <col className="w-[25%]" />
            </colgroup>
            <thead className="bg-loginbg sticky top-0 rounded-tr-lg rounded-tl-lg text-white ">
              <tr>
                <th className="py-2 sticky top-0 px-28 ">Field Name</th>
                <th className="py-2 sticky top-0">Is Masked</th>
              </tr>
            </thead>
            <tbody>
              {downloadConfigApiData &&
                downloadConfigApiData.map((config, index) => (
                  <tr key={index}>
                    <td className="text-[13px] font-[350] py-1.5 text-[#7A7A7A] px-28">
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
                    <td className="text-[13px] font-[350]">
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
                              handleDeleteField(config.field_id, config.name)
                            }
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {isNewFieldVisible && (
                <tr>
                  <td className="text-[13px] font-[350] py-1.5 px-28">
                    <input
                      className="newinput"
                      type="text"
                      placeholder="Enter Field Name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                    />
                  </td>
                  <td className="text-[13px] font-[350]">
                    <div className="flex flex-row space-x-6 px-4">
                      <IsMaskedSwitch
                        isMasked={newFieldIsMasked}
                        onToggle={(isChecked) => setNewFieldIsMasked(isChecked)}
                      />
                      {!saveButtonClicked && (
                        <button
                          className="ml-4 font-semibold text-xl"
                          onClick={() => {
                            setisNewFieldVisible(false);
                            handleDeleteField("", newFieldName);
                          }}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showUploadPopup && (
          <div
            className={`absolute top-20 left-0 w-full h-full flex justify-center items-center z-50 
         ${showUploadPopup ? "blur-none" : ""}`}
          >
            <UploadPopup />
          </div>
        )}
        {showDownloadPopup && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
           <DownloadPopup
           onClose={handlePopupClose}
            onSelect={handleDownloadOptionSelect}
           />
          </div>
        )}
      </div>
    );
  };

  // const handleOptionClick = (option) => {
  //   closePreviewModal(); // Close all modals before opening a new one
  //   setSelectedOption(option);
  //   switch (option) {
  //     case 'User Group':
  //       // setIsModalOpen(true);
  //       break;
  //     case 'Storage Container':
  //       setIsStorageContainerModal(true);
  //       break;
  //     case 'File Share':
  //       setIsFileShareModal(true);
  //       break;
  //     case 'Miscellaneous':
  //       setIsMiscellaneousModal(true);
  //       break;
  //     case 'Global Column Config':
  //       setIsGlobalColumnModal(true);
  //       break;
  //     default:setIsModalOpen(true);
  //       break;
  //   }
  // };

  return (
    <div className="flex items-center justify-center h-screen ">
    {loading ? (
      <RingLoader
        color={"#3b3737"}
        loading={loading}
        css={override}
        size={20}
      />
    ) : (

    <div
      className={`flex flex-col w-screen h-screen p-4 ${
        zoomLevel ? "overflow-y-auto overflow-x-auto bg-appimage" : ""
      }`}
      style={{
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: "top left",
        scrollbarWidth: "thin",
        background: "bg-appimage",
        // Add more styles as needed
      }}
    >
      <style>
        {`
          /* Custom scrollbar styles */
          ::-webkit-scrollbar {
            width: 8px;
          }
    
          ::-webkit-scrollbar-thumb {
            background-color: #a0a0a0;
            border-radius: 4px;
          }
    
          ::-webkit-scrollbar-track {
            background-color: #f0f0f0;
          }
        `}
      </style>
      <div className="flex justify-center ">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>
      <div className="flex flex-row w-full h-full mt-4 space-x-4">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className="w-full h-full bg-white rounded-lg shadow-md p-4">
          <div className="w-full h-5 flex flex-row  items-center text-sm font-medium ml-1"> <Link to="/">Home</Link>  &gt; Admin Panel</div>
          <div className="w-full h-full flex flex-row mt-2">
            <div className="w-[23%] h-[90%] bg-[#EEEEEE] rounded-l-md p-2 flex flex-col shadow-sm ">
              <div
                className="text-[15px] font-[500] text-black ml-2 px-4 py-6 cursor-pointer flex flex-row h-8 items-center"
                style={{
                  backgroundColor:
                    selectedOption === "User Group" && !activeModal
                      ? "#D9D9D9"
                      : "",
                  borderRadius: "5px",
                  padding: "5px",
                }}
                onClick={() => handleOptionClick("User Group")}
              >
                <img
                  src={
                    selectedOption === "User Group" && !activeModal
                      ? process.env.PUBLIC_URL + "/user-group.png"
                      : process.env.PUBLIC_URL + "/grayuser-group.png"
                  }
                  alt="Icon"
                  className="w-5 h-5 mr-3"
                />
                User Group
              </div>
              <div
                className="mt-2 text-[15px] font-[500] text-black ml-2 px-4 py-6 cursor-pointer flex flex-row h-8 items-center"
                style={{
                  backgroundColor:
                    activeModal === "Storage Container" ? "#D9D9D9" : "",
                  borderRadius: "5px",
                  padding: "5px",
                }}
                // onClick={() => handleOptionClick("Storage Container")

                // }
              >
                <img
                  src={
                    activeModal === "Storage Container"
                      ? process.env.PUBLIC_URL + "/storage-icon.png"
                      : process.env.PUBLIC_URL + "/graystorage-icon.png"
                  }
                  alt="Icon"
                  className="w-5 h-5 mr-3"
                />

                <button onClick={() => openModal("Storage Container")}>
                  Storage Container
                </button>
              </div>
              <div
                className="mt-2 text-[15px] font-[500] text-black ml-2 px-4 py-6 cursor-pointer flex flex-row h-8 items-center"
                style={{
                  backgroundColor:
                    activeModal === "File Share" ? "#D9D9D9" : "",
                  borderRadius: "5px",
                  padding: "5px",
                }}
                // onClick={() => handleOptionClick("File Share")}
              >
                <img
                  src={
                    activeModal === "File Share"
                      ? process.env.PUBLIC_URL + "/file-share-icon.png"
                      : process.env.PUBLIC_URL + "/grayfile-share.png"
                  }
                  alt="Icon"
                  // className="w-5 h-5 mr-3"
                  className={`mr-3 ${activeModal === "File Share" ? 'w-4 h-4' : 'w-6 h-5'}`}
                  
                />
                
                {/* File Share */}
                <button onClick={() => openModal("File Share")}>
                  File Share
                </button>
              </div>

              <div
                className="mt-2 text-[15px] font-[500] text-black ml-2 px-4 py-6 cursor-pointer flex flex-row h-8 items-center"
                style={{
                  backgroundColor:
                    activeModal === "Miscellaneous" ? "#D9D9D9" : "",
                  borderRadius: "5px",
                  padding: "5px",
                }}
                // onClick={() => handleOptionClick("Miscellaneous")}
              >
                <img
                  src={
                    activeModal === "Miscellaneous"
                      ? process.env.PUBLIC_URL + "/miscellaneous-services.png"
                      : process.env.PUBLIC_URL + "/graymiscellaneous-services.png"
                  }
                  alt="Icon"
                  className="w-6 h-6 mr-3"
                />
                {/* Miscellaneous */}
                <button onClick={() => setActiveModal("Miscellaneous")}>
                  Miscellaneous{" "}
                </button>
              </div>
              <div
                className="mt-2 text-[15px] font-[500] text-black px-4 py-6 ml-2 cursor-pointer flex flex-row h-8 items-center"
                style={{
                  backgroundColor:
                    activeModal === "Global Column Config" ? "#D9D9D9" : "",
                  borderRadius: "5px",
                  padding: "5px",
                }}
                // onClick={() => handleOptionClick("Global Column Config")}
              >
                <img
                  src={
                    activeModal === "Global Column Config"
                      ? process.env.PUBLIC_URL + "/global-icon.png"
                      : process.env.PUBLIC_URL + "/grayglobal-icon.png"
                  }
                  alt="Icon"
                  className="w-5 h-5 mr-3"
                />
                {/* Global Column Config */}
                <button
                  onClick={() => {
                    setActiveModal("Global Column Config");
                  }}
                >
                  Global Column Config{" "}
                </button>
              </div>
              
            </div>

            {/* {selectedOption === "User Group" && ( */}
            <div
              className={`w-[75%] h-[90%] bg-[#F4F4F4] flex flex-col p-4 rounded-r-lg shadow-sm relative `}
            >
              <div
                className={`w-[60%] h-12 rounded-lg bg-white shadow-md flex items-center 
                 ${activeModal ? "admin-blur-effect" : ""} 
                 ${isModalOpen ? "admin-blur-effect" : ""} 
                 ${isEditUserModalOpen ? "admin-blur-effect" : ""} 
                 ${selectedUserGroupDeletion ? "admin-blur-effect" : ""} 
                 ${showDownloadPopup ? "admin-blur-effect" : ""} 
                 `}
              >
                <button
                  className="w-32  h-8 flex flex-row  ml-4 px-4 rounded-md cursor-pointer items-center font-medium text-sm bg-[#F5F5F5]
                        text-secondary  "
                  onClick={() => {
                    handleUserPermissions();
                    setIsModalOpen(true);
                  }}
                >
                  Add New Field
                </button>
              </div>
              <div
                className={`w-[60%] h-[90%] bg-white mt-1 shadow-lg rounded-lg  
                  ${activeModal ? "admin-blur-effect" : ""} 
                  ${isModalOpen ? "admin-blur-effect" : ""} 
                  ${isEditUserModalOpen ? "admin-blur-effect" : ""} 
                  ${selectedUserGroupDeletion ? "admin-blur-effect" : ""} 
                  ${showDownloadPopup ? "admin-blur-effect" : ""} 
                   `}
                style={{ scrollbarWidth: "thin" }}
              >
                <table className="table-design table-fixed w-full ">
                  <colgroup>
                    <col className="w-[60%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead className="bg-loginbg sticky top-0 z-10 rounded-t-lg text-white">
                    <tr>
                      <th className="py-2 sticky top-0 border border-none px-6 rounded-tl-lg">
                        User Group Name
                      </th>
                      <th className="py-2 sticky top-0 border border-none rounded-tr-lg">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className=" sticky ">
                    {userGroupsData.map((group, index) => (
                      <tr key={group.id} className="">
                        <td className="text-[14px] font-[350] px-6">
                          {group.name}
                        </td>
                        <td className="text-[14px] font-[350]">
                          <div className="flex  space-x-2">
                            <button
                              // className="bg-lightgray-100 text-white px-2 py-1 h-8 w-[100px]  rounded-lg font-semibold "
                              className=" w-[30px] "
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click when button is clicked
                                //   setIsModalOpen(true);
                                setIsEditUserModalOpen(true);
                                // setShowPreview(true);
                                // handleEditUserPermissions();
                                handleClick(group.id);
                              }}
                            >
                              <img
                                src="icon-edit-row.png"
                                alt="Edit"
                                className="w-4 h-4 rounded-lg"
                              />
                              {/* Edit */}
                            </button>
                            <button
                              // className="bg-lightgray-100 text-white px-2 py-1 w-[100px] rounded-lg font-semibold"
                              className="w-[30px] "
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click when button is clicked
                                // handleDeleteClick(index);
                                setSelectionUserGroupDeletion(group);
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
                    ))}
                  </tbody>
                </table>
              </div>

              <AddUserGroupModal
                isOpen={isModalOpen}
                closeModal={closePreviewModal}
                // Pass metadata to the modal component
                renderAddUserGroup={renderAddUserGroup} // Pass the renderMetadata function to the modal component
                showPreview={showPreview} // Pass showPreview state to the modal component
              />

              <EditUserModal
                isOpen={isEditUserModalOpen}
                closeModal={closePreviewModal}
                // Pass metadata to the modal component
                renderEditUserGroup={renderEditUserGroup} // Pass the renderMetadata function to the modal component
                showPreview={showPreview} // Pass showPreview state to the modal component
              />

{selectedUserGroupDeletion && (
          <div className="absolute inset-0 flex justify-center z-20 items-center">
            <UserDeleteConfirmationPopup
              context={selectedUserGroupDeletion}
              onCancel={handleCancelDelete}
              onConfirm={() => handleDeleteClick(selectedUserGroupDeletion.id)}
            />
          </div>
        )}
              <div className="absolute -bottom-3 -right-3">
                <img
                  src={process.env.PUBLIC_URL + "/chat-icon.png"} // Replace with the path to your chat icon
                  alt="Chat Icon"
                  className="w-12 h-12 cursor-pointer animate-floating"
                />
              </div>
            </div>
            {/* )} */}
          </div>
          {activeModal && <div>{renderContent()}</div>}
        </div>
      </div>
    

      {/* <ToastContainer /> */}
    </div>
    )}
    </div>
  );
};

export default AdminPanel;
