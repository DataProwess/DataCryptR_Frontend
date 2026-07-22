import React, { useState, useEffect, useRef } from "react";
import "./style.css";
import "./folder.css";
import Modal from "react-modal";
import authService from "./auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MetadataModal from "./MetaDataModal";
import Jsontimezones from "./TimeZones";
import { useNavigate, useLocation, Link } from "react-router-dom";
import TimezoneModal from "./TimeZoneModal";
import FullScreenPreview from "./FullScreenPreview";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
// eslint-disable-next-line
import FixedWidthModal from "./FixedWidthModal";
import { API_URL } from "./ApiConfig";
import FileDefinitionModal from "./FileDefinitionModal";
import Chatbot from "./Chatbot";
import ProfileModal from "./ProfileModal";
import ErrorPopup from "./ErrorPopup";
import FolderNoDataPopup from "./FolderNoDataPopup";
import SubFolderSearchErrorPopup from "./SubFloderSearchErrorPopup";
import debounce from 'lodash/debounce';
import { secureApiCall, apiRequest, getCSRFToken, getAuthToken } from "./csrfUtils";
import { useUI } from "./Context/UIContext";


const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const Explore = (props) => {
  // Assuming you're using React hooks
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


  const { width, height } = getViewportDimensions();
  const folderId = "";
  const containerRef = useRef(null);
  const [showChatbot, setShowChatbot] = useState(false);
   // eslint-disable-next-line
  const [noDataMessage, setNoDataMessage] = useState("");
   // eslint-disable-next-line
  const [noFolderDataMessage, setNoFolderDataMessage] = useState(false);
   // eslint-disable-next-line
  const [noSubFolderDataMessage, setNoSubFolderDataMessage] = useState(false);
  const [noPattern, setNoPattern] = useState("");
  // eslint-disable-next-line
  const [matchedElements, setMatchedElements] = useState([]);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
   // eslint-disable-next-line
  const [subfolders, setSubfolders] = useState([]);
   // eslint-disable-next-line
  const [files, setFiles] = useState([]);
   // eslint-disable-next-line
  const [sortedItems, setSortedItems] = useState([]);
  // eslint-disable-next-line
  const [currentMatchTableIndex, setCurrentMatchTableIndex] = useState(-1);
  const [isMetaDataModalOpen, setMetaDataModalOpen] = useState(false);
  const [isColumnDataModalOpen, setIsColumnDataModalOpen] = useState(false);
  const [isContainerClick, setIsContainerClick] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const containerData = location.state?.containerData;
  const containerName = location.state?.containerName;
  const fileShareId = location.state?.fileShareId;

  // const fileShareName = location.state?.fileShareName;
  const initialFileShareName =
    location.state?.fileShareName || "DefaultFileShareName";
  const initialSelectedStorageAccountName =
    location.state?.selectedStorageAccountName || "DefaultStorageAccountName";
  const initialSelectedOption =
    location.state?.selectedOption || "DefaultSelectedOption";
  // const selectedOption = location.state?.selectedOption;
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption);
  const [fileShareName, setFileShareName] = useState(initialFileShareName);
  // eslint-disable-next-line
  const [selectedStorageAccountName, setSelectedStorageAccountName] = useState(
    initialSelectedStorageAccountName
  );

  // eslint-disable-next-line
  const [permissions, setPermissions] = useState([]);
  /* eslint-disable no-unused-vars */
  const [selectionId, setSelectionId] = useState(
    containerData ? containerData : fileShareId
  );
  // eslint-disable-next-line
  const [selectionType, setSelectionType] = useState(
    containerData ? "container" : "fileShare"
  );
  const [showPopup, setShowPopup] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [searchInputText, setSearchInputText] = useState("");
  const [searchTableInputText, setSearchTableInputText] = useState("");
  const newFieldRef = useRef(null);
  const [folders, setFolders] = useState({});
  const [isOpen, setIsOpen] = useState({});
  const [isOpenRows, setIsOpenRows] = useState(false);
  const [isdropdownOpen, setIsDropdownOpen] = useState(false);
  const [customerFiles, setCustomerFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isTableView, setIsTableView] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isMetaDataModalOpen, setMetaDataIsModalOpen] = useState(false);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  // eslint-disable-next-line
  const [replaceText, setReplaceText] = useState("");
  // eslint-disable-next-line
  const [selectedData, setSelectedData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filePrefixId, setFilePrefixId] = useState(null);
  const [prefixText, setPrefixText] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileSeparator, setFileSeparator] = useState("");
  const [isHeaderAvailable, setIsHeaderAvailable] = useState(false);
  const [rowDataStartNumber, setRowDataStartNumber] = useState(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState("");
  const [filteredFilesFolders, setFilteredFilesFolders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [subFolderTotalPages, setSubFolderTotalPages] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [pattern, setPattern] = useState("");
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);
  const [previousTableButtonDisabled, setPreviousTableButtonDisabled] =
    useState(true);
  const [nextTableButtonDisabled, setNextTableButtonDisabled] = useState(false);
  const [columnData, setColumnData] = useState([]);
  const [token, setToken] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  // const [modalTopMargin, setModalTopMargin] = useState("110px");
  const [modalStyles, setModalStyles] = useState({
    marginTop: "110px",
    maxHeight: `calc(100% - 110px)`,
  });
  // const [isMasked, setIsMasked] = useState(true);
  const [isMasked, setIsMasked] = useState(
    localStorage.getItem("isMasked") === "true" || true
  );
  const [searchResults, setSearchResults] = useState(null);
  // const indexOfLastRow = currentTablePage * rowsPerPage;
  // const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [containerOptions, setContainerOptions] = useState([]);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [storageAccountOptions, setStorageAccountOptions] = useState([]);

  const [selectedContainer, setSelectedContainer] = useState(containerData);
  const [selectedFileShare, setSelectedFileShare] = useState(fileShareId);
  const [searchInput, setSearchInput] = useState("");
  const [csrfToken, setCsrfToken] = useState(null);
  const [selectedSortCriteria, setSelectedSortCriteria] =
    useState("creation_time");
  const [selectedSortOrder, setSelectedSortOrder] = useState("des");

  const [userEmail, setUserEmail] = useState("");
  // const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  // const [selectedStorageAccount, setSelectedStorageAccount] = useState("");
  const [selectedStorageAccount, setSelectedStorageAccount] = useState(
    location.state?.selectedStorageAccount || null
  );
  const [subFoldersAndFiles, setSubFoldersAndFiles] = useState({});
  // const [selectedTimeZone, setSelectedTimeZone] = useState({
  //   label: "Select Timezone",
  //   value: null,
  // });

  const [popupFolderName, setPopupFolderName] = useState("");
  const [timezoneOptions, setTimezoneOptions] = useState([
    { label: "Time Zone", value: null },
    { label: "UTC", value: "UTC" },
    { label: "Australia/Sydney", value: "Australia/Sydney" },
    // Add other timezones here
  ]);
  const [selectedTimeZone, setSelectedTimeZone] = useState(timezoneOptions[0]);
  // Initially set to null
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [maskedData, setMaskedData] = useState(true);
  const [isContainerDropdownOpen, setIsContainerDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("plain_text");
  const [showInput, setShowInput] = useState(false);
  const [showReplaceInput, setShowReplaceInput] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [istableDropdownOpen, setIstableDropdownOpen] = useState(false);
  const [itemOffset, setItemOffset] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20); // Default rows per page
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [autoTimezone, setAutoTimezone] = useState(false);
  const [showTableInput, setShowTableInput] = useState(true);
  const [tableSearchText, setTableSearchText] = useState("");
  const [currentHighlightedIndex, setCurrentHighlightedIndex] = useState(-1);
  const [displayedRows, setDisplayedRows] = useState([]);
  const inputRef = useRef(null);
  const [viewType, setViewType] = useState("table"); // Default to 'plain' or 'table'
  const [tableData, setTableData] = useState({ subfolders: [], files: [] });
  const [plainData, setPlainData] = useState({ subfolders: [], files: [] });

  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  // const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFolderPopup, setIsFolderPopup] = useState(false);
  const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);
  const [folderNoMatchingData, setFolderNoMatchingData] = useState(false);
  const [noFolderData, setNoFolderData] = useState(false);

  // Add this at the top of the component (after hooks)
  const debouncedSaveMasking = useRef();
  if (!debouncedSaveMasking.current) {
    debouncedSaveMasking.current = debounce(
      async (fieldId, value, column, blob_name, containerData, fileShareId) => {
        const payload = {
          blob_name,
          columns: [
            {
              ...column,
              is_masked: value,
            },
          ],
        };
        if (containerData) {
          payload.container_id = containerData;
        } else if (fileShareId) {
          payload.file_share_id = fileShareId;
        }
        try {
          const data = await secureApiCall(
            `${API_URL}/api/blob/update_prefix_column_defination/`,
            "POST",
            payload
          );

          if (data.message !== "success") {
            // Optionally revert UI if failed
            setColumnData((prev) =>
              prev.map((col) =>
                col.field_id === fieldId ? { ...col, is_masked: !value } : col
              )
            );
            setError("Failed to update masking: " + (data.message || "Unknown error"));
            setIsPopupOpen(true);
          }
        } catch (error) {
          setColumnData((prev) =>
            prev.map((col) =>
              col.field_id === fieldId ? { ...col, is_masked: !value } : col
            )
          );
          setError("Error updating masking: " + error.message);
          setIsPopupOpen(true);
        }
      },
      500 // 500ms debounce
    );
  }

  useEffect(() => {
    localStorage.setItem("isMasked", isMasked);
  }, [isMasked]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false); // Set loading to false after 1000ms (1 second)
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

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
        const permissions = dataObject.data.permissions;
        console.log("🔑 Token fetched successfully:", token ? "Token available" : "No token");
        console.log("📧 Email:", email);
        console.log("🔐 Permissions:", permissions);
        setUserEmail(email);
        setPermissions(permissions);
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

  const canSeeRealData = permissions.includes("SeeRealData");
  // const [canSeeUserReports, setCanSeeUserReports] = useState(false);
  // setCanSeeUserReports(permissions.includes("SeeUserReports"));
  // setCanSeeUserReports(permissions.includes("SeeUserReports"));
  const canSeeUserReports = permissions.includes("SeeUserReports");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log("🔄 Token changed, current token:", token ? "Available" : "Not available");

    if (!token) {
      console.log("⏳ Waiting for token to be available...");
      return;
    }

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

    console.log("🚀 Token available, fetching storage accounts and containers...");
    fetchStorageAccountOptions();
    fetchContainerOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchStorageAccountOptions = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const storageAccountDetails = await secureApiCall(
        `${API_URL}/api/admin/list-storage-accounts/`,
        "GET"
      );

      if (storageAccountDetails && storageAccountDetails.data) {
        setStorageAccountOptions(storageAccountDetails.data);
      }
    } catch (error) {
      console.error("Error fetching storage accounts:", error.message);
    }
  };

  const handleStorageAccountChange = (event) => {
    const storageAccountName = event.target.value;
    setSelectedStorageAccount(storageAccountName);
    setSelectedContainer(""); // Reset container selection when storage account changes

    // Find the storage account id based on the selected name
    const selectedStorageAccountObject = storageAccountOptions.find(
      (account) => account.account_name === storageAccountName
    );

    if (selectedStorageAccountObject) {
      // Fetch containers for the selected storage account id
      fetchContainerOptions(selectedStorageAccountObject.id);
    }
  };

  // useEffect to make an API call when isMasked changes
  useEffect(() => {
    handleDynamicPreview(selectionId, selectionType, selectedStorageAccount);
    // eslint-disable-next-line
  }, []);

  //Selected Files Preview (Plain And Tabular strucutre) Data Download Button Functionality

  const handleDownload = async () => {
    const blobName = selectedFiles[0];
    try {
      const requestBody = {
        blob_name: blobName,
        is_masked: maskedData,
      };
      if (containerData) {
        requestBody.container_id = containerData;
      } else if (fileShareId) {
        requestBody.file_share_id = fileShareId;
      } else {
        // Handle the case where neither containerData nor fileShareId is available
        console.error("Neither containerData nor fileShareId is available.");
        return;
      }

      const responsemsg = await secureApiCall(
        `${API_URL}/api/blob/download_blob/`,
        "POST",
        requestBody
      );

      setError("Download has been moved to My Task");
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error downloading blob:", error);
      if (error.message) {
        toast.error(error.message);
      }
    }
  };

  const fetchContainerOptions = async (storageAccountId) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      const data = await secureApiCall(
        `${API_URL}/api/blob/list_containers/`,
        "POST",
        {
          storage_account_id: storageAccountId,
        }
      );

      if (data) {
        setContainerOptions(data);
      }
    } catch (error) {
      console.error("Error fetching containers:", error.message);
    }
  };

  useEffect(() => {}, [containerOptions]);

  // Listing all the Folders as per the selected Container
  const fetchDataFromApi = async (selectionType, selectionId) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }
      let requestBody = {};

      // Construct the request body based on the selection type
      if (selectionType === "container") {
        requestBody = {
          container_id: selectionId,
        };
      } else if (selectionType === "fileShare") {
        requestBody = {
          file_share_id: selectionId, // Corrected property name
        };
      }

      const data = await secureApiCall(
        `${API_URL}/api/blob/list_blob_folders/`,
        "POST",
        requestBody
      );

      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Determine which type of selection is available and fetch data accordingly
    console.log("🔍 Explore component received containerData:", containerData);
    console.log("🔍 Explore component received fileShareId:", fileShareId);

    if (containerData) {
      console.log("📂 Fetching data for container ID:", containerData);
      fetchDataFromApi("container", containerData)
        .then((response) => {
          //   const folderData = response.blob_list;
          const folderData = transformData(response.blob_list);
          console.log("📁 Folder data received:", folderData);
          setFolders(folderData);
          setSelectedContainer(containerData);
          setIsContainerClick(containerData);
          setSelectedFileShare(null);
          //   setIsOpen(initializeIsOpenState(folderData));
        })
        .catch((error) => {
          // console.error("Error fetching data:", error);
        });
    } else if (fileShareId) {
      console.log("📂 Fetching data for file share ID:", fileShareId);
      fetchDataFromApi("fileShare", fileShareId)
        .then((response) => {
          //   const folderData = response.blob_list;
          const folderData = transformData(response.blob_list);
          setFolders(folderData);
          setSelectedFileShare(fileShareId);
          setSelectedContainer(null);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerData, fileShareId, token]);

  const transformData = (data) => {
    // Transform the data into the required format
    const transformed = Object.keys(data).map((key) => ({
      id: key,
      name: key,
      files: [], // Initialize with an empty files array
      subfolders: data[key], // Assume data[key] contains subfolders
    }));
    return transformed;
  };

  const handleDropdownChange = async (e) => {
    const selectedPage = parseInt(e.target.value, 10);
    setSelectedPageSize(selectedPage);
    setCurrentPage(1);
  };

 
  const timeoutPromise = (ms) => {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    );
  };

  

  /* This function is designed to fetch files from an API based on the provided parameters 
like searchInput as pattern, SelectedFolder as folderPattern, Current page number for pagination as page ,
Number of items per page as pageSize, Type of selection (container or file share) as selectionType,
ID of the selected container or file share as selectionId, and  Name or ID of the selected storage account selectedStorageAccount.
first checks if the token is available. If not, it logs an error and returns early.
constructs the request body for the API call based on the provided parameters and the selectionType
makes a POST request to the API to fetch the blobs (files and folders).
checks for common error responses (401 for unauthorized access, 404 for no data found) and handles them appropriately.
If a 401 error occurs, it redirects to the login page. For other errors, it throws an error.
processes the response data, handles pagination,sets state variables for files and folders, and handles the loading state */

  const fetchFilesFromApi = async (
    pattern = "",
    folderPattern = "",
    page = 1,
    pageSize = selectedPageSize,
    selectionType,
    selectionId,
    selectedStorageAccount
  ) => {
    if (!token) {
      console.error("Token is not available.");
      return;
    }

    console.log("🌐 fetchFilesFromApi called with:", {
      pattern,
      folderPattern,
      page,
      pageSize,
      selectionType,
      selectionId,
      selectedStorageAccount
    });

    try {
      let requestBody = {
        storage_account: selectedStorageAccount,
        pattern: pattern,
        folder_pattern: folderPattern,
        page_number: page,
        page_size: pageSize,
        sort_by: {
          sort_string: selectedSortCriteria,
          order_by: selectedSortOrder,
        },
      };

      if (selectionType === "container") {
        requestBody.container_id = selectionId;
      } else if (selectionType === "fileShare") {
        requestBody.file_share_id = selectionId;
      }

      console.log("📤 API request body:", requestBody);

      const data = await secureApiCall(
        `${API_URL}/api/blob/list_blobs/`,
        "POST",
        requestBody
      );

      console.log("📥 API response data:", data);
      console.log("📁 Folders found:", data.folder_list);
      console.log("📄 Files found:", data.blob_list);

      const isEmpty = !data.blob_list.length && !data.folder_list.length;

      // Condition 1: If both folderPattern and pattern are empty and no data, show ErrorPopup
      if (!folderPattern && !pattern && isEmpty) {
        setNoFolderDataMessage("No folders or files found.");
        setIsFolderPopup(true); // Open the error popup
        setLoading(false);
        return null;
      }

      // Condition 2: If folderPattern is provided but no data, fetch the parent folder
      if (!folderPattern && pattern && isEmpty) {
        const parentFolderPattern = folderPattern.substring(
          0,
          folderPattern.lastIndexOf("/")
        );
        setNoPattern("No matching folders or files found.");
        setIsNoDataPopupOpen(true); // Open the folder no data popup
        return null;
      }

      if (folderPattern && pattern && isEmpty) {
        const parentFolderPattern = folderPattern.substring(
          0,
          folderPattern.lastIndexOf("/")
        );
        setNoFolderDataMessage("No subfolders or files found.");
        setNoFolderData(true); // Open the subfolder error popup
        return null;
      }

      const calculatedTotalPages = Math.ceil(parseInt(data.total) / pageSize);

      if (calculatedTotalPages === 1) {
        setNextButtonDisabled(true);
        setPreviousButtonDisabled(true);
      }

      setPreviousButtonDisabled(page <= 1);
      setNextButtonDisabled(page >= calculatedTotalPages);
      setTotalPages(calculatedTotalPages);
      setCustomerFiles(data);
      setFilteredFilesFolders(data.blob_list);

      const sortedFiles = sortData(
        data.blob_list,
        selectedSortCriteria,
        selectedSortOrder
      );
      const sortedFolders = sortData(
        data.folder_list.map((folder, index) => ({
          id: index,
          name: folder,
        })),
        selectedSortCriteria,
        selectedSortOrder
      );

      setFilteredFilesFolders(sortedFiles);
      setFilteredFolders(sortedFolders);

      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      throw error;
    }
  };

  const sortData = (data, sortCriteria, sortOrder) => {
    if (!Array.isArray(data)) return data;

    return data.sort((a, b) => {
      const aValue = a[sortCriteria];
      const bValue = b[sortCriteria];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // const fetchFilesFromApi = async (
  //   pattern = "",
  //   folderPattern = "",
  //   page = 1,
  //   pageSize = selectedPageSize,
  //   selectionType,
  //   selectionId,
  //   selectedStorageAccount
  // ) => {
  //   if (!token) {
  //     console.error("Token is not available.");
  //     return;
  //   }

  //   try {
  //     let requestBody = {
  //       storage_account: selectedStorageAccount,
  //       pattern: pattern || "",
  //       folder_pattern: folderPattern || "",
  //       page_number: page,
  //       page_size: pageSize,
  //       sort_by: {
  //         sort_string: selectedSortCriteria,
  //         order_by: selectedSortOrder,
  //       },
  //     };

  //     if (selectionType === "container") {
  //       requestBody.container_id = selectionId;
  //     } else if (selectionType === "fileShare") {
  //       requestBody.file_share_id = selectionId;
  //     }

  //     const response = await fetch(`${API_URL}/api/blob/list_blobs/`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //         "X-CSRFToken": csrfToken,
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     if (!response.ok) {
  //       if (response.status === 401) {
  //         const responseData = await response.json();
  //         if (responseData.error === "Access token has expired") {
  //           window.location.href = "/";
  //           return;
  //         }
  //       }

  //       if (response.status === 404) {

  //         // Case 1: Pattern is empty, show no data popup
  //         if (!pattern) {
  //           setNoFolderDataMessage("No folders or files found.");
  //           setIsFolderPopup(true);  // Open the error popup
  //         }
  //         // Case 2: Pattern has value, show no pattern match popup
  //         else {
  //           setNoPattern("No matching folders or files found.");
  //           setIsNoDataPopupOpen(true);  // Open the folder no data popup
  //         }

  //         return null;
  //       } else {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //     }

  //     const data = await response.json();
  //     const isEmpty = !data.blob_list.length && !data.folder_list.length;

  //     // Handle empty data case
  //     if (data.message === "No blob found on selected container/file share" || isEmpty) {

  //       if (!pattern ) {
  //         setNoFolderDataMessage("No folders or  any files found.");
  //         setIsFolderPopup(true);  // Show popup for no data
  //       } else {
  //         setNoPattern("No matching folders or files found.");
  //         setIsNoDataPopupOpen(true);  // Show popup for no pattern
  //       }

  //       return null;
  //     }

  //     // Process valid data
  //     setFilteredFilesFolders(data.blob_list);

  //     const formattedFolders = data.folder_list.map((folder, index) => ({
  //       id: index,
  //       name: folder,
  //     }));

  //     setFilteredFolders(formattedFolders);
  //     setIsNoDataPopupOpen(false);  // Close the popup if data exists
  //     setIsPopupOpen(false);        // Close the other popup
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     throw error;
  //   }
  // };

  // useEffect(() => {}, [filteredFilesFolders]);

  // useEffect(() => {}, [filteredFolders]);

  /*This hook triggers whenever one of its dependencies changes 
(such as token, csrfToken, pattern, containerData, fileShareId, etc.). 
It checks if containerData or fileShareId is available and calls fetchFilesFromApi 
accordingly to fetch the files and folders for the selected container or file share.*/

  useEffect(() => {
    if (containerData) {
      fetchFilesFromApi(
        pattern,
        selectedFolderPath,
        1, // Assuming initial page number is 1
        selectedPageSize,
        "container",
        containerData,
        selectedStorageAccount,
        selectedSortCriteria,
        selectedSortOrder
      );
    } else if (fileShareId) {
      fetchFilesFromApi(
        pattern,
        selectedFolderPath,
        1, // Assuming initial page number is 1
        selectedPageSize,
        "fileShare",
        fileShareId,
        selectedStorageAccount,
        selectedSortCriteria,
        selectedSortOrder
      );
    } else {
      console.error("No containerData or fileShareId available");
    }
    // eslint-disable-next-line
  }, [
    token,
    csrfToken,
    pattern,
    containerData,
    fileShareId,
    selectedPageSize,
    selectedFolderPath,
    selectedStorageAccount,
    selectedSortCriteria,
    selectedSortOrder,
  ]);

  useEffect(() => {}, [totalPages]);

  /* This function is typically used in an input field's onChange event to dynamically search and display files and Folders
  based on the user's input and the selected folder. The API call is made each time the user types in the input field, 
  ensuring the displayed files are filtered according to the current input and folder context.*/
  const handleInputChange = async (e) => {
    setSearchResults(null);
    const folderPattern = folderId;

    // Clear previous search results
    setCurrentPage(1);
    const inputText = e.target.value.toLowerCase();
    setSearchInput(inputText);
    setInputValue(inputText); // Set search input value

    // const pageSize = inputText === '' ? 1 : currentPage;
    const pageNumber = 1;
    const pageSize = selectedPageSize;

    // setInputValue(inputText);
    // console.log("i want the search text in folders",inputText)

    try {
      await fetchFilesFromApi(
        inputText,
        folderPattern,
        pageNumber,
        pageSize,
        // selectedPageSize,
        selectionType,
        selectionId,
        selectedStorageAccount,
        selectedSortCriteria,
        selectedSortOrder
      );
    } catch (error) {
      console.error("Error fetching Files:", error);
    }
  };

  
  const handleFolderInputChange = async (e, folderId) => {
    const inputText = e.target.value.toLowerCase();
    setSearchInput(inputText);
    setInputValue(inputText); // Set search input value

    setSearchResults(null); // Clear previous search results
    setCurrentPage(1);

    // const pageSize = inputText === '' ? 1 : currentPage;
    const pageNumber = 1;
    const pageSize = selectedPageSize;

    try {
      // Fetch subfolders and files based on the input pattern and folder ID
      // let response = await fetchSubfoldersAndFiles(inputText, folderId, pageSize, selectedPageSize);
      let response = await fetchSubfoldersAndFiles(
        inputText,
        folderId,
        pageNumber,
        pageSize
      );

      if (!response) {
        setSearchResults(null); // Reset search results if no response
        return;
      }

      // Update the search results with subfolders and files
      setSearchResults({
        subfolders: response.subfolders || [],
        files: response.files || [],
      });

      // Handle empty results (if no subfolders or files match the search)
      // if (response.subfolders.length === 0 && response.files.length === 0) {
      //   setNoPattern("No matching folders or files found."); // Set message for no matches
      //   setFolderNoMatchingData(true); // Trigger popup for no matching data
      // }
    } catch (error) {
      console.error("Error fetching Files:", error);
    }
  };

  /*This function is typically used in a paginated interface where users can navigate through multiple pages of files and folders.
 When the user clicks on a page number, the function updates the state and fetches the corresponding data for that page, 
 ensuring that the displayed files and folders are relevant to the current page and the user's search criteria,selectedFolder */

  const handlePageClick = (currentPage) => {
    // Update the current page state
    setCurrentPage(currentPage);

    // Fetch data for the clicked page (e.g., fetch files from API)
    fetchFilesFromApi(
      inputValue,
      selectedFolderPath,
      currentPage,
      containerData ? "container" : "fileShare",
      containerData ? containerData : fileShareId,
      selectedStorageAccount
    );
  };

  /* Both  handleNext and handleTableNext Checks respectively as files and folders will Plain format or table format , 
  if there is a next page to navigate to by comparing the current page number with the total number of pages
Calculates the next page number.Updates the component state to reflect the new current page number.
Calls fetchFilesFromApi to fetch the files for the next page based on the current search input, selected folder path, 
page size, selection type, selection ID, selected storage account, and sort criteria
Handles the data response and updates any other state variables if necessary,Catches and logs any errors that occur during the API call*/

  

  const handlePrevious = async () => {
    if (currentPage > 1) {
      const previousPage = currentPage - 1;

      try {
        const searchPattern = searchInput || ""; // Use the searchInput state

        let response;

        // Fetch data based on whether a pattern is provided and folder selection
        if (searchPattern !== "") {
          if (selectedFolder) {
            // Fetch subfolders and files with the search pattern
            response = await fetchSubfoldersAndFiles(
              searchPattern,
              selectedFolder,
              previousPage,
              selectedPageSize
            );
          } else {
            // Fetch files with the search pattern and other parameters
            response = await fetchFilesFromApi(
              searchPattern,
              selectedFolderPath,
              previousPage,
              selectedPageSize,
              selectionType,
              selectionId,
              selectedStorageAccount,
              selectedSortCriteria,
              selectedSortOrder
            );
          }
        } else {
          // Handle case when no pattern is provided
          if (selectedFolder) {
            response = await fetchSubfoldersAndFiles(
              "",
              selectedFolder,
              previousPage,
              selectedPageSize
            ); // Use empty string for pattern
          } else {
            response = await fetchFilesFromApi(
              "",
              selectedFolderPath,
              previousPage,
              selectedPageSize,
              selectionType,
              selectionId,
              selectedStorageAccount,
              selectedSortCriteria,
              selectedSortOrder
            ); // Use empty string for pattern
          }
        }

        setSearchResults({
          subfolders: response.subfolders || [],
          files: response.files || [],
        });

        // After data is fetched, update the page state
        setCurrentPage(previousPage);

        // Update button states based on new page values
        setPreviousButtonDisabled(previousPage <= 1);
        setNextButtonDisabled(previousPage >= totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
   
  };

 

  const handleNext = async () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;

      try {
        // Ensure pattern is not null but an empty string if not set
        const searchPattern = searchInput || ""; // Use the searchInput state

        let response;

        // Fetch data based on whether a pattern is provided and folder selection
        if (searchPattern !== "") {
          if (selectedFolder) {
            // Fetch subfolders and files with the search pattern
            response = await fetchSubfoldersAndFiles(
              searchPattern,
              selectedFolder,
              nextPage,
              selectedPageSize
            );
          } else {
            // Fetch files with the search pattern and other parameters
            response = await fetchFilesFromApi(
              searchPattern,
              selectedFolderPath,
              nextPage,
              selectedPageSize,
              selectionType,
              selectionId,
              selectedStorageAccount,
              selectedSortCriteria,
              selectedSortOrder
            );
          }
        } else {
          // Handle case when no pattern is provided
          if (selectedFolder) {
            response = await fetchSubfoldersAndFiles(
              "",
              selectedFolder,
              nextPage,
              selectedPageSize
            ); // Use empty string for pattern
          } else {
            response = await fetchFilesFromApi(
              "",
              selectedFolderPath,
              nextPage,
              selectedPageSize,
              selectionType,
              selectionId,
              selectedStorageAccount,
              selectedSortCriteria,
              selectedSortOrder
            ); // Use empty string for pattern
          }
        }

        setSearchResults({
          subfolders: response.subfolders || [],
          files: response.files || [],
        });

        // After data is fetched, update the page state
        setCurrentPage(nextPage);

        // Update button states based on new page values
        setPreviousButtonDisabled(nextPage <= 1);
        setNextButtonDisabled(nextPage >= totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      // setCurrentPage(1);
    }
  };

  useEffect(() => {
    handleNext();
     // eslint-disable-next-line
  }, []);

  const handleTableNext = async () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;

      try {
        // Fetch subfolders or files based on folder selection
        if (selectedFolder) {
          await fetchSubfoldersAndFiles(
            pattern,
            selectedFolder,
            nextPage,
            selectedPageSize
          );
        } else {
          await fetchFilesFromApi(
            pattern,
            selectedFolderPath,
            nextPage,
            selectedPageSize,
            selectionType,
            selectionId,
            selectedStorageAccount,
            selectedSortCriteria,
            selectedSortOrder
          );
        }

        // After data is fetched, update the page state
        setCurrentPage(nextPage);

        // Update button states based on new page values
        setPreviousButtonDisabled(nextPage <= 1);
        setNextButtonDisabled(nextPage >= totalPages); // Fix here
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  /*Both handlePrevious and handleTablePrevious Checks respectively as files and folders will Plain format or table format
if there is a previous page to navigate to by comparing the current page number with 1.Calculates the previous page number
Updates the component state to reflect the new current page number Calls fetchFilesFromApi to fetch the files for the previous page based
 on the current search input, selected folder path, page size, selection type, selection ID, selected storage account, and sort criteria. 
 Handles the data response and updates any other state variables if necessary,Catches and logs any errors that occur during the API call. */

 

  const handleTablePrevious = async () => {
    if (currentPage > 1) {
      const previousPage = currentPage - 1;

      try {
        if (selectedFolder) {
          await fetchSubfoldersAndFiles(
            pattern,
            selectedFolder,
            previousPage,
            10
          ); // Pass previousPage
        } else {
          await fetchFilesFromApi(
            pattern,
            selectedFolderPath,
            previousPage,
            selectedPageSize,
            selectionType,
            selectionId,
            selectedStorageAccount,
            selectedSortCriteria,
            selectedSortOrder
          );
        }
        setCurrentPage(previousPage);

        // Update button states after fetching new data
        setPreviousButtonDisabled(previousPage <= 1);
        setNextButtonDisabled(previousPage >= totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  /*This functionality is responsible for fetching column definitions for the selected files from an API. 
  It accepts two parameters: selectionId and selectionType (like containerData, fileShareId)
  The request body is constructed with the blob_name and either container_id or file_share_id based on the selectionType
  the column definitions are fetched from the API, and the application state is updated accordingly to display the data in a modal.
   Any errors encountered during this process are logged to the console for debugging purposes*/

  const handleFileDefinition = (selectionId, selectionType) => {
    return new Promise(async (resolve, reject) => {
      if (selectedFiles.length === 0) {
        console.error(new Error("No files selected."));
        return;
      }

      try {
        // Map selectedFiles to promises for API calls
        const promises = selectedFiles.map(async (selectedFile) => {
          const blobName = selectedFile;
          const requestBody = {
            blob_name: blobName,
          };

          // Set the appropriate id in the request body based on selectionType
          if (selectionType === "container") {
            requestBody.container_id = selectionId;
          } else if (selectionType === "fileShare") {
            requestBody.file_share_id = selectionId;
          }

          return await secureApiCall(
            `${API_URL}/api/blob/column_defination/`,
            "POST",
            requestBody
          );
        });

        const data = await Promise.all(promises);

        // Check if data is not empty
        if (data.length > 0) {
          setColumnData(data[0]);
          setSelectedData(data[0]);
          setModalVisible(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("ColumnData");
          resolve(data[0]); // Resolve with the first data element
        } else {
          console.error("No data received from API for Preview.");
          reject(new Error("No data received from API for Preview."));
        }
      } catch (error) {
        setError(`No Data Exist in the '${selectedFiles[0]}'`);
        setIsPopupOpen(true);
        console.error("Error fetching API data:", error);
        reject(error);
      }
    });
  };

  useEffect(() => {
    if (containerData) {
      handleFileDefinition(containerData, "container")
        .then((response) => {
          // Handle response data
          setSelectedContainer(containerData);
          setSelectedFileShare(null);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else if (fileShareId) {
      handleFileDefinition(fileShareId, "fileShare")
        .then((response) => {
          setSelectedContainer(null);
          setSelectedFileShare(fileShareId);
          // Handle response data
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerData, fileShareId, token, selectedFiles]);

  const handleDynamicPreview = (
    selectionId,
    selectionType,
    selectedStorageAccount
  ) => {
    setApiLoading(true);
    return new Promise(async (resolve, reject) => {
      if (selectedFiles.length === 0) {
        setApiLoading(false);
        return;
      }

      const fullPath = selectedFiles[0];
      const filename = fullPath.substring(fullPath.lastIndexOf("/") + 1);
      let dataFormat;
      if (selectedFormat === "tabular") {
        dataFormat = "table";
      } else {
        dataFormat = "plain_text";
      }

      const requestBody = {
        storage_account: selectedStorageAccount,
        blob_name: selectedFiles[0], // Assuming you're processing only the first selected file
        is_masked: maskedData,
        line: null,
        format: dataFormat,
      };

      if (selectionType === "container") {
        requestBody.container_id = selectionId;
      } else if (selectionType === "fileShare") {
        requestBody.file_share_id = selectionId;
      }

      try {
        const data = await secureApiCall(
          `${API_URL}/api/blob/blob_content/`,
          "POST",
          requestBody
        );

        if (data) {
          setApiData(data);
          setSelectedData(data);
          setModalVisible(true);
          document.body.style.overflow = "hidden";
          setIsFullScreenPreview(true);
          setShowPreview(true);
          setDataType("API");
          resolve(data);
          setApiLoading(false);
        } else {
          setError(`No Data Exist in the '${selectedFiles[0]}'`);
          setIsPopupOpen(true);
          setLoading(false);
        }
      } catch (error) {
        setError(`No Data Exist in the '${filename}'`);
        setIsPopupOpen(true);
        setLoading(false);
        console.error("Error fetching API data:", error);
        reject(error);
      } finally {
        setLoading(false); // Stop loading after fetch completes
      }
    });
  };

  useEffect(() => {
    if (typeof apiData === "object" && apiData !== null) {
      // If apiData is an object and not null
      if (Array.isArray(apiData.rows)) {
      } else {
      }
    } else if (typeof apiData === "string") {
      // If apiData is a string
      // console.log("apiData is a string. Length:", apiData.length);
    } else {
      // console.log("apiData is of an unexpected type:", typeof apiData);
    }
  }, [apiData]);

  useEffect(() => {
    if (containerData) {
      handleDynamicPreview(
        containerData,
        "container",
        selectedStorageAccount,
        selectedFormat,
        maskedData
      ) // Pass selectedFormat
        .then((response) => {
          // Handle response data
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else if (fileShareId) {
      handleDynamicPreview(
        fileShareId,
        "fileShare",
        null,
        selectedFormat,
        maskedData
      ) // Pass selectedFormat
        .then((response) => {
          // Handle response data
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerData,
    fileShareId,
    token,
    selectedStorageAccount,
    selectedFormat,
  ]);

  const handleDynamicMetadata = async (selectionId, selectionType) => {
    if (selectedFiles.length === 0) {
      return; // Exit the function if no files are selected
    }

    const blobName = selectedFiles[0];

    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      let requestBody = {
        blob_name: blobName,
      };

      if (selectionType === "container") {
        requestBody.container_id = selectionId;
      } else if (selectionType === "fileShare") {
        requestBody.file_share_id = selectionId;
      }

      const data = await secureApiCall(
        `${API_URL}/api/blob/get_blob_prefix/`,
        "POST",
        requestBody
      );

      if (data && data.length > 0) {
        setMetadata(data[0]);
        setModalVisible(true);
        document.body.style.overflow = "hidden";
        setDataType("Metadata");
        setFilePath(data[0].file_path);
        setFilePrefixId(data[0].file_prefix_id);
        setFileSeparator(data[0].file_separator);
        setIsHeaderAvailable(data[0].is_header_available);
        setPrefixText(data[0].prefix_text);
        setRowDataStartNumber(data[0].row_data_start_number);
      } else {
        console.error("No metadata received from API.");
      }
    } catch (error) {
      setError(`No MetaData Exist in the '${selectedFiles[0]}'`);
      setIsPopupOpen(true);
      console.error("Error fetching metadata:", error);
    }
  };

  useEffect(() => {
    if (containerData) {
      handleDynamicMetadata(containerData, "container")
        .then((response) => {
          // Handle response data
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else if (fileShareId) {
      handleDynamicMetadata(fileShareId, "fileShare")
        .then((response) => {
          // Handle response data
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerData, fileShareId, token, selectedFiles]);

  const isFileSelected = (fileIdentifier, files) => {
    return (
      Array.isArray(files) &&
      files.some((file) => file.file_id === fileIdentifier)
    );
  };

  const closePreviewModal = () => {
    // Close the modal
    setMaskedData(true);
    setSelectedFormat("plain_text");
    setIsOpen(false);
    setSearchInputText("");
    setIsFixedModalOpen(false);
    setisNewFieldVisible(false);
    setIsModalOpen(false);
    setMetaDataModalOpen(false);
    setIsColumnDataModalOpen(false);
    document.body.style.overflow = "visible";
    setSelectedFiles([]);
    setApiData([]);
    setMetadata([]);
    setColumnData([]);
    setShowPopup(false);

    // Remove selection from any selected row
    const selectedRow = document.querySelector(".selected-row");
    if (selectedRow) {
      selectedRow.classList.remove("selected-row");
    }
  };

  useEffect(() => {
    setIsOpen(initializeIsOpenState(folders));
  }, [folders]);

  const initializeIsOpenState = (folders) => {
    const isOpenState = {};
    Object.keys(folders).forEach((key) => {
      isOpenState[key] = false; // Set all top-level keys to closed initially
    });
    return isOpenState;
  };


  useEffect(() => {
    setSelectedPageSize(10);
  }, []);

  const handleFolderClick = async (folderId, inputValue = "") => {
    console.log("📂 Folder clicked:", folderId);
    console.log("🔍 Current selected folder path:", selectedFolderPath);

    setSearchResults(null); // Clear the search results when navigating folders
    setInputValue("");
    setSearchInput("");
    setIsDropdownOpen(false);
    // const newPageSize = 10;
    // setSelectedPageSize(newPageSize);

    // Reset `currentPage` to 1
    setCurrentPage(1);

    // if (selectedPageSize !== 10) {
    //   setSelectedPageSize(10); // Reset page size to default (0)
    // }

    const newPageSize = 10;
    setSelectedPageSize(newPageSize);

    const pattern = inputValue ? inputValue.toLowerCase() : ""; // Use inputValue as search pattern
    const folderPattern = folderId;

    // Manage subfolder and file state
    setSubFoldersAndFiles((prevState) => {
      const newPageSize = 10;
      setSelectedPageSize(newPageSize);
      const folderKeys = Object.keys(prevState);

      // Find the index of the folder pattern in the existing folder structure
      const index = folderKeys.indexOf(folderPattern);

      // If folderPattern exists, remove all subsequent folder paths
      if (index !== -1) {
        const filteredEntries = folderKeys.slice(0, index + 1); // Keep only up to the selected folder
        const newState = filteredEntries.reduce((acc, key) => {
          acc[key] = prevState[key];
          return acc;
        }, {});

        return newState;
      }

      return prevState;
    });

    if (!subFoldersAndFiles[folderPattern]) {
      // Fetch the subfolders and files for the current folder
      try {
        const newPageSize = 10;
        setSelectedPageSize(newPageSize);
        const result = await fetchSubfoldersAndFiles(
          pattern,
          folderPattern,
          pageNumber,
          10
        );
        const { subfolders, files } = result;

        setSubFoldersAndFiles((prevState) => ({
          ...prevState,
          [folderPattern]: { subfolders, files },
        }));

        // Show popup if no subfolders or files are found
        if (subfolders.length === 0 && files.length === 0) {
          setPopupFolderName(folderId);
          setShowPopup(true);
          return; // Prevent navigation to the empty folder
        } else {
          setShowPopup(false);
        }

        setInputValue(""); // Reset input value after folder click
      } catch (error) {
        console.error("Error handling folder click:", error);
        return; // Stop further execution in case of an error
      }
    }
    // setSelectedPageSize(10);
    // setCurrentPage(1)
    setSelectedFolder(folderId); // Set the folder as selected
    setSelectedFiles([]); // Clear selected files
    // renderFilesAndSubfolders(folderId);
  };

  

  const fetchSubfoldersAndFiles = async (
    pattern,
    folderPattern,
    currentPage,
    selectedPageSize
  ) => {
    console.log("🔍 fetchSubfoldersAndFiles called with:", {
      pattern,
      folderPattern,
      currentPage,
      selectedPageSize,
      selectionType,
      selectionId,
      selectedStorageAccount
    });

    try {
      const response = await fetchFilesFromApi(
        pattern,
        folderPattern,
        currentPage,
        selectedPageSize, // Pass the pageSize parameter
        selectionType,
        selectionId,
        selectedStorageAccount,
        selectedSortCriteria,
        selectedSortOrder
      );

      if (!response) {
        throw new Error("Invalid API response");
      }

      console.log("📥 fetchSubfoldersAndFiles response:", response);
      console.log("📁 Subfolder data:", response.folder_list);
      console.log("📄 Files data:", response.blob_list);
      console.log("📊 Total count:", response.total);

      const subfolderData = response.folder_list || [];
      const filesData = response.blob_list || [];
      const totalCount = parseInt(response.total, 10);

      if (isNaN(totalCount) || totalCount < 0) {
        throw new Error("Invalid total count in API response");
      }

      // Calculate total pages based on totalCount and pageSize
      const calculatedTotalPages = Math.ceil(totalCount / selectedPageSize);

      // Update state
      setSubFolderTotalPages(calculatedTotalPages); // Update total pages before setting the button state

      // Now that totalPages is updated, set button disabled states based on the updated values
      setPreviousButtonDisabled(currentPage <= 1);
      // setNextButtonDisabled(currentPage >= calculatedTotalPages); // Compare with the updated total pages
      setNextButtonDisabled(
        calculatedTotalPages <= 1 || currentPage >= calculatedTotalPages
      );

      if (viewType === "table") {
        setTableData({ subfolders: subfolderData, files: filesData });
      } else {
        setPlainData({ subfolders: subfolderData, files: filesData });
      }

      // Set subfolder and file data
      setSubFoldersAndFiles((prevState) => ({
        ...prevState,
        [folderPattern]: { subfolders: subfolderData, files: filesData },
      }));

      return { subfolders: subfolderData, files: filesData };
    } catch (error) {
      console.error("Error fetching subfolders and files:", error);
      return { subfolders: [], files: [] };
    }
  };

 

  useEffect(() => {
    if (selectedFolderPath) {
      fetchSubfoldersAndFiles(
        pattern, // Replace with actual pattern if needed
        selectedFolderPath,
        currentPage,
        selectedPageSize // Use selected page size from state
      );
    }
     // eslint-disable-next-line
  }, ["", selectedFolderPath, currentPage, selectedPageSize]);

  

  const handlePopupOkClick = () => {
    setShowPopup(false); // Close the popup
    // Optionally, you could trigger a refresh or leave the current state unchanged
    // depending on how you want to handle this interaction.
  };

  const handleOkClick = () => {
    // Hide the no data message
    setNoFolderDataMessage(false);

    // Construct the new path with updated state values
    const newPath = `/container-data?selectedOption=${selectedOption}&fileShareName=${fileShareName}&selectedStorageAccount=${selectedStorageAccount}`;

    // Redirect to the new path
    window.location.href = newPath;
  };
  //   const handleSubFolderOkClick = (folderPattern) => {
  //     // Hide the no data message
  //     setNoFolderDataMessage(false);

  //     // Fetch subfolders and files for the current folder pattern
  //     fetchSubfoldersAndFiles("", folderPattern, currentPage);
  // };

  const handleSubFolderOkClick = (folderPattern) => {
    // Hide the no data message popup
    setNoSubFolderDataMessage(false);

    // Fetch subfolders and files for the current folder pattern without navigating
    fetchSubfoldersAndFiles("", folderPattern, currentPage)
      .then((result) => {
        const { subfolders, files } = result;

        // Check if any subfolders or files were found
        if (subfolders.length === 0 && files.length === 0) {
          // No data found, just close the popup and stay on the current
        } else {
          setSubFoldersAndFiles((prevState) => ({
            ...prevState,
            [folderPattern]: { subfolders, files },
          }));
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching subfolders and files on OK click:",
          error
        );
      });
  };

  const handleSearchOkClick = async () => {
    setInputValue(""); // Clear the input field
    setNoPattern(""); // Reset the noPattern state
    setIsNoDataPopupOpen(false); // Close the popup
    setCurrentPage(1);
    try {
      // Re-fetch all folders and files without the pattern
      fetchFilesFromApi(
        "",
        "",
        1,
        selectedPageSize,
        selectionType,
        selectionId,
        selectedStorageAccount
      );
    } catch (error) {
      console.error("Error fetching Files:", error);
    }
  };

  

  const renderFolders = () => {
  
    if (noPattern) {
      return (
        <FolderNoDataPopup
          isOpen={isNoDataPopupOpen}
          message={noPattern} // "No matching folders or files found."
          onClose={handleSearchOkClick}
        />
      );
    }

    // console.log("data before",filteredFilesFolders,filteredFolders)
    // Check if filteredFilesFolders and filteredFolders are empty
    if (
      !Array.isArray(filteredFilesFolders) ||
      !Array.isArray(filteredFolders)
    ) {
      return (
        <div className="w-full h-full flex items-center justify-center p-10">
          <div className="bg-white p-6 rounded-lg shadow-lg items-center w-80 h-32 flex flex-col space-y-8">
            <p className="font-medium text-xs text-[#5c5cff]">
              No Folders and Files Exist
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                className="w-16 h-6 text-black text-xs bg-gray font-medium border border-none rounded-lg"
                onClick={() => setNoDataMessage(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render the folders and files list
    return (
      <div className={`w-full h-full flex flex-row items-center pl-4 pt-4 pb-4 `}
      style={{userSelect: "none",
        WebkitUserSelect: "none" /* Safari */,
        MozUserSelect: "none" /* Firefox */,
        msUserSelect: "none"}}>
        <div
          className="w-full h-full items-baseline grid gap-0 "
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "8px",
            overflow: "auto",
            scrollbarWidth: "thin",
            alignContent: "start",
            marginleft: "10px",
          }}
        >
          {/* {console.log("datagghgh",filteredFilesFolders,filteredFolders)} */}
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className="flex flex-col items-center cursor-pointer w-20 h-20 m-0 p-0 mb-5 md:mb-10 lg:mb-20"
              style={{
                width: "100%",
                maxWidth: "80px",
                height: "90px",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => handleFolderClick(folder.name)}
            >
              <div className="flex flex-col items-center space-y-1">
                <img
                  src={process.env.PUBLIC_URL + "/baseline-folder.png"}
                  alt="Closed Folder"
                  className="w-12 h-12"
                  title={folder.name}
                />

                <span
                  className="text-[12px] font-medium text-black block text-center cursor-pointer"
                  style={{
                    width: "80px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={folder.name}
                >
                  {folder.name}
                </span>
              </div>
            </div>
          ))}
          {filteredFilesFolders.map((file) => (
            <div
              key={file.file_id}
              className={`flex flex-col items-center cursor-pointer w-20 h-auto p-0 m-0 mb-5 md:mb-10 lg:mb-20 
                 ${
                   selectedFiles.includes(file.file_name)
                     ? "bg-primary rounded-md shadow-md"
                     : ""
                 }`}
              style={{
                width: "100%",
                maxWidth: "80px",
                height: "90px",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => handleFileClick(`${file.file_name}`)}
            >
              <div className={`flex flex-col  items-center space-y-1 relative`}>
                <img
                  src={process.env.PUBLIC_URL + "/file-icon.png"}
                  alt="File"
                  className="w-12 h-14"
                  title={file.file_name.split("/").pop()}
                />
                {/* {selectedFiles[0] === file.file_name && (
                  <img
                    src={process.env.PUBLIC_URL + "/tick-icon.png"}
                    alt="Selected"
                    className="absolute w-4 h-4 -top-3 right-4"
                  />
                )} */}
                <span className="relative w-full overflow-hidden text-center">
                  <span
                    className="text-[12px] font-medium text-black block text-center cursor-pointer"
                    style={{
                      width: "80px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={file.file_name.split("/").pop()}
                  >
                    {file.file_name.split("/").pop()}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSortAscending = (sortKey) => {
    // Helper function to handle sorting based on the type of the field
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal; // Numeric comparison for size
      } else if (
        new Date(aVal) instanceof Date &&
        !isNaN(new Date(aVal)) &&
        new Date(bVal) instanceof Date &&
        !isNaN(new Date(bVal))
      ) {
        return new Date(aVal) - new Date(bVal); // Date comparison for creation/modified date
      }
      return 0; // Default return for non-comparable values
    };

    // Sort folders
    const sortedFolders = [...filteredFolders].sort(sortFunction);

    // Sort files
    const sortedFiles = [...filteredFilesFolders].sort(sortFunction);

    setFilteredFolders(sortedFolders);
    setFilteredFilesFolders(sortedFiles);
  };

  const handleSortDescending = (sortKey) => {
    // Helper function to handle sorting based on the type of the field
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return bVal.localeCompare(aVal); // Reverse alphabetical order
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return bVal - aVal; // Reverse numeric comparison
      } else if (
        new Date(aVal) instanceof Date &&
        !isNaN(new Date(aVal)) &&
        new Date(bVal) instanceof Date &&
        !isNaN(new Date(bVal))
      ) {
        return new Date(bVal) - new Date(aVal); // Reverse date comparison
      }
      return 0; // Default return for non-comparable values
    };

    // Sort folders
    const sortedFolders = [...filteredFolders].sort(sortFunction);

    // Sort files
    const sortedFiles = [...filteredFilesFolders].sort(sortFunction);

    setFilteredFolders(sortedFolders);
    setFilteredFilesFolders(sortedFiles);
  };

  const renderTableFolders = () => {
    
    if (noPattern) {
      return (
        <FolderNoDataPopup
          isOpen={isNoDataPopupOpen}
          message={noPattern} // "No matching folders or files found."
          onClose={handleSearchOkClick}
        />
      );
    }

    // if (!Array.isArray(folders) || !Array.isArray(filteredFilesFolders)) return null; // Defensive check
    if (!Array.isArray(filteredFilesFolders) || !Array.isArray(filteredFolders))
      //  return null;
      return (
        <div className="w-full h-full flex items-center justify-center p-10">
          {/* <p className="text-center text-primary">No Folders and Files Exist</p> */}{" "}
          <div className="bg-white p-6 rounded-lg shadow-lg items-center w-80 h-32 flex flex-col space-y-8">
            <p className="font-normal text-xs text-black">
              No Folders and Files Exist
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                className="w-16 h-6 text-black text-xs bg-gray font-normal border border-none rounded-lg"
                // onClick={() => setNoDataMessage(false)}
                onClick={() => {
                  setNoDataMessage(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );

    const handleFileRowClick = (file) => {
      if (file.file_id) {
        handleFileClick(file.file_name);
      } else {
        handleFolderClick(file);
      }
    };
    return (
      <div
        className=" flex  justify-center overflow-auto"
        style={{
          width: `${(folderContainerWidth * 0.98).toFixed(2)}px`,
          height: `${(folderSunContainerHeight * 0.95).toFixed(2)}px`,
          scrollbarWidth: "thin",
          userSelect: "none",
        WebkitUserSelect: "none" /* Safari */,
        MozUserSelect: "none" /* Firefox */,
        msUserSelect: "none",
        }}
      >
        <div
          className="rounded-b-lg  shadow-md shadow-slate-500\/30 mt-1"
          style={{
            width: `${(folderContainerWidth * 0.98 * 0.98).toFixed(2)}px`,
            height: `${((folderSunContainerHeight * 0.95 )* 0.93).toFixed(2)}px`,
          }}
        >
          <table className="table-design w-[100%] table-fixed ">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
              <tr>
                <th className="py-2 sticky top-0 rounded-tl-lg font-normal text-xs"></th>
              
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Name
                  <span
                    onClick={() => handleSortAscending("name")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("name")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Size (bytes)
                  <span
                    onClick={() => handleSortAscending("size")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("size")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Created Date
                  <span
                    onClick={() => handleSortAscending("creation_time")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("creation_time")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Modified Date
                  <span
                    onClick={() => handleSortAscending("modified_time")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("modified_time")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 rounded-tr-lg font-normal text-xs">
                  File Path
                </th>
              </tr>
            </thead>
          </table>
          <div
            className="overflow-auto  mt-0.5"
            style={{
              width: `${(folderContainerWidth * 0.98 * 0.98).toFixed(2)}px`,
              height: `${((
                folderSunContainerHeight *
                0.95 *
                0.93 )*
                0.8
              ).toFixed(2)}px`,
              scrollbarWidth: "thin",
            }}
          >
            <table className="table-design table-fixed w-full">
              <tbody>
                {filteredFolders.map((folder) => (
                  <tr key={folder.id}>
                    <td className="w-[3%] text-xs font-normal overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      onClick={() => handleFileRowClick(folder.name)}
                    >
                      <span className="text-[11px] font-light text-black cursor-pointer text-center flex items-center">
                        <div className="flex items-center mr-2">
                          <img
                            src={
                              process.env.PUBLIC_URL + "/baseline-folder.png"
                            }
                            alt="Folder"
                            className="w-3 h-3"
                          />
                        </div>
                        <span className="truncate">{folder.name}</span>
                      </span>

                      {/* {folder.name} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                  </tr>
                ))}
                {filteredFilesFolders.map((file) => (
                  <tr
                    key={file.file_id}
                    className={` ${
                      selectedFiles.includes(file.file_name)
                        ? "bg-primary rounded-md "
                        : ""
                    }`}
                    onClick={() => handleFileRowClick(file)}

                  >
                    <td className="w-[3%]"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      // onClick={() => handleFileRowClick(file)}
                    >
                      <span className="text-[11px] font-normal text-black cursor-pointer text-center flex flex-row items-center">
                        <div className="flex items-center relative mr-2 mt-1 flex-shrink-0">
                          <img
                            src={process.env.PUBLIC_URL + "/file-icon.png"}
                            alt="File"
                            className="w-3 h-3 "
                          />
                          {/* {selectedFiles.includes(file.file_name) && (
                            <img
                              src={process.env.PUBLIC_URL + "/tick-icon.png"}
                              alt="Selected"
                              className="absolute w-4 h-4 -top-2 -right-1"
                            />
                          )} */}
                        </div>
                        <span className="truncate">
                          {file.file_name
                            ? file.file_name.split("/").pop()
                            : file.name}
                        </span>
                      </span>
                      {/* {file.file_name ? file.file_name.split("/").pop() : ""} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light  pl-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.size}
                    </td>
                    <td className="w-[20%] text-[11px] font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.creation_time}
                    </td>
                    <td className="w-[20%] text-[11px]  font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.modified_time}
                    </td>
                    {/* <td className="w-[15%] bg-green-500 text-[11px] flex item-center font-light overflow-ellipsis whitespace-nowrap overflow-hidden"> */}
                     <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.file_path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Blue div content here */}
        </div>
      </div>
    );
  };

  const combinedItems = [
    ...(Array.isArray(folders) ? folders : []),
    ...(Array.isArray(filteredFilesFolders) ? filteredFilesFolders : []),
  ];

  const totalnoPages = Math.ceil(combinedItems.length / 10);

  const Pagination = ({ currentPage, totalnoPages, goToPage }) => (
    <div className="flex flex-row items-center space-x-4">
      <span className="text-[13px] font-bold">
        {currentPage} of {totalnoPages}
      </span>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-3 h-3 font-bold m-0.5 ${
          currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "bg-background-100"
        }`}
      >
        <img
          src={process.env.PUBLIC_URL + "/less-than.png"}
          alt="Previous Page"
          className="w-3 h-3 mt-0.5"
        />
      </button>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalnoPages}
        className={`w-3 h-3 m-0.5 ${
          currentPage === totalnoPages
            ? "opacity-50 cursor-not-allowed"
            : "bg-background-100"
        }`}
      >
        <img
          src={process.env.PUBLIC_URL + "/more-than.png"}
          alt="Next Page"
          className="w-3 h-3 mt-0.5"
        />
      </button>
    </div>
  );

  const handleFileClick = (file) => {
    setSelectedFiles([file]); // Ensure it sets an array with the selected file
  };

  const NoFilesSubfoldersPopup = ({ onClose, folderName }) => {
    const handleClose = () => {
      onClose(); // Call onClose function provided by parent component to close the popup
    };

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-80 h-32 flex flex-col space-y-8 ml-56 mt-11">
          <p className="font-medium text-xs text-red-500">
            No files and subfolders found
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              className="w-16 h-6 text-black text-xs bg-lightgray-300 font-medium border border-none rounded-lg"
              onClick={handleClosePopup}
            >
              ok
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  

  useEffect(() => {
    renderFilesAndSubfolders(folderId);
     // eslint-disable-next-line
  }, [searchResults]);

  const renderFilesAndSubfolders = (folderId) => {
    // Fallback to searchResults or specific folder data
    // console.log("search results ", searchResults);
    const currentData = searchResults || subFoldersAndFiles[folderId];

    if (!currentData) return null;

    const { subfolders = [], files = [] } = currentData;

    // Check for no data in the folder and show popup
    // if (noSubFolderDataMessage) {
    //   return (
    //     <SubFolderErrorPopup
    //       isOpen={noFolderData}
    //       message={noSubFolderDataMessage || "No folders or files found."}
    //       onClose={() => handleSubFolderOkClick(folderId)} // Handle closing and fetching data without navigation
    //     />
    //   );
    // }

    // // Popup for no matching data
    // if (noPattern) {
    //   return (
    //     <SubFolderSearchErrorPopup
    //       isOpen={folderNoMatchingData}
    //       message={noPattern || "No matching folders or files found."}
    //       onClose={handleSearchOkClick} // Close function for FolderNoDataPopup
    //     />
    //   );
    // }

    // Render files and subfolders
    return (
      <div className={`w-full h-full flex flex-row items-center pt-4 pl-4 pb-4 relative`}
      style={{userSelect: "none",
        WebkitUserSelect: "none" /* Safari */,
        MozUserSelect: "none" /* Firefox */,
        msUserSelect: "none"}}>
        <div
          className="w-full h-full items-baseline grid gap-0"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "8px",
            overflow: "auto",
            scrollbarWidth: "thin",
            alignContent: "start",
          }}
        >
          {/* {showPopup && (
            <NoFilesSubfoldersPopup
              folderName={popupFolderName}
              onClose={handleClosePopup}
            />
          )} */}
          {subfolders.map((subfolder) => (
            <div
              key={subfolder}
              className={`flex flex-col items-center cursor-pointer w-20 h-auto p-0 m-0 mb-5 md:mb-10 lg:mb-20`}
              onClick={() => handleFolderClick(`${folderId}/${subfolder}`)}
              style={{
                width: "100%",
                maxWidth: "80px",
                height: "90px",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="flex flex-col items-center space-y-1">
                <img
                  src={process.env.PUBLIC_URL + "/baseline-folder.png"}
                  alt="Closed Folder"
                  className="w-12 h-12"
                  title={subfolder}
                />
                <span
                  className="text-[12px] font-medium text-black block text-center cursor-pointer"
                  style={{
                    width: "80px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={subfolder}
                >
                  {subfolder}
                </span>
              </div>
            </div>
          ))}
          {files.map((file) => (
            <div
              key={file.file_id}
              className={`flex flex-col items-center cursor-pointer w-20 h-auto p-0 m-0 mb-5 md:mb-10 lg:mb-20
                 ${
                   selectedFiles.includes(file.file_name)
                     ? "bg-primary rounded-md "
                     : ""
                 }`}
              onClick={() => handleFileClick(`${file.file_name}`)}
              style={{
                width: "100%",
                maxWidth: "80px",
                height: "90px",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="flex flex-col items-center space-y-1 relative">
                <img
                  src={process.env.PUBLIC_URL + "/file-icon.png"}
                  alt="File"
                  className="w-12 h-14"
                  title={file.file_name.split("/").pop()}
                />
                {/* {selectedFiles[0] === file.file_name && (
                  <img
                    src={process.env.PUBLIC_URL + "/tick-icon.png"}
                    alt="Selected"
                    className="absolute w-4 h-4 -top-3 right-3"
                  />
                )} */}
                <span className="relative w-full overflow-hidden text-center">
                  <span
                    className="relative group text-[12px] font-medium text-black block text-center cursor-pointer"
                    style={{
                      width: "80px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={file.file_name.split("/").pop()}
                  >
                    {file.file_name.split("/").pop()}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // const combineAndSortItems = (subfolders, files, selectedSortCriteria, selectedSortOrder) => {
  //   const combinedItems = [
  //     ...subfolders.map(subfolder => ({ name: subfolder, type: 'subfolder' })),
  //     ...files.map(file => ({
  //       ...file,
  //       name: file.file_name ? file.file_name.split("/").pop() : "",
  //       type: 'file'
  //     })),
  //   ];

  //   combinedItems.sort((a, b) => {
  //     const getValue = (item, criteria) => {
  //       switch (criteria) {
  //         case 'name':
  //           return item.name || '';
  //         case 'size':
  //           return item.size || 0;
  //         case 'creation_time':
  //           return item.creation_time;
  //         case 'modified_time':
  //           return item.modified_time;
  //         default:
  //           return '';
  //       }
  //     };

  //     const valueA = getValue(a, selectedSortCriteria);
  //     const valueB = getValue(b, selectedSortCriteria);

  //     if (valueA < valueB) return selectedSortOrder === 'asc' ? -1 : 1;
  //     if (valueA > valueB) return selectedSortOrder === 'asc' ? 1 : -1;
  //     return 0;
  //   });

  //   return combinedItems;
  // };

  const combineAndSortItems = (
    subfolders,
    files,
    selectedSortCriteria,
    selectedSortOrder
  ) => {
    const combinedItems = [
      ...subfolders.map((subfolder) => ({
        name: subfolder,
        type: "subfolder",
      })),
      ...files.map((file) => ({
        ...file,
        name: file.file_name ? file.file_name.split("/").pop() : "",
        type: "file",
      })),
    ];

    combinedItems.sort((a, b) => {
      const getValue = (item, criteria) => {
        switch (criteria) {
          case "name":
            return item.name || "";
          case "size":
            return item.size || 0;
          case "creation_time":
            return item.creation_time;
          case "modified_time":
            return item.modified_time;
          default:
            return "";
        }
      };

      const valueA = getValue(a, selectedSortCriteria);
      const valueB = getValue(b, selectedSortCriteria);

      if (valueA < valueB) return selectedSortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return selectedSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return combinedItems;
  };

  const handleFolderSortAscending = async (sortKey) => {
    const pattern = inputValue ? inputValue.toLowerCase() : "";

    if (!selectedFolder) {
      console.error("Selected folder path is empty or not defined.");
      return;
    }

    // Ensure folder data is fetched and available
    if (!subFoldersAndFiles[selectedFolder]) {
      try {
        const result = await fetchSubfoldersAndFiles(
          pattern,
          selectedFolder,
          1,
          selectedPageSize
        );
        const { subfolders, files } = result;

        setSubFoldersAndFiles((prevState) => ({
          ...prevState,
          [selectedFolder]: { subfolders, files },
        }));
      } catch (error) {
        console.error("Error fetching subfolders and files:", error);
        return;
      }
    }

    // Get the folder data for the selected path
    const { subfolders = [], files = [] } =
      subFoldersAndFiles[selectedFolder] || {};

    if (subfolders.length === 0 && files.length === 0) {
      console.warn("No subfolders or files to sort.");
      return;
    }

    // Helper function to handle sorting based on the type of the field
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal;
      } else if (!isNaN(new Date(aVal)) && !isNaN(new Date(bVal))) {
        return new Date(aVal) - new Date(bVal);
      }
      return 0;
    };

    // Sort subfolders and files
    const sortedFolders = [...subfolders].sort(sortFunction);
    const sortedFiles = [...files].sort(sortFunction);

    // Update state with sorted data
    setSubFoldersAndFiles((prevState) => ({
      ...prevState,
      [selectedFolder]: { subfolders: sortedFolders, files: sortedFiles },
    }));
  };

  const handleFolderSortDescending = async (sortKey) => {
    const pattern = inputValue ? inputValue.toLowerCase() : "";

    if (!selectedFolder) {
      console.error("Selected folder path is empty or not defined.");
      return;
    }

    // Ensure folder data is fetched and available
    if (!subFoldersAndFiles[selectedFolder]) {
      try {
        const result = await fetchSubfoldersAndFiles(
          pattern,
          selectedFolder,
          1,
          selectedPageSize
        );
        const { subfolders, files } = result;

        setSubFoldersAndFiles((prevState) => ({
          ...prevState,
          [selectedFolder]: { subfolders, files },
        }));
      } catch (error) {
        console.error("Error fetching subfolders and files:", error);
        return;
      }
    }

    // Get the folder data for the selected path
    const { subfolders = [], files = [] } =
      subFoldersAndFiles[selectedFolder] || {};

    if (subfolders.length === 0 && files.length === 0) {
      console.warn("No subfolders or files to sort.");
      return;
    }

    // Helper function to handle sorting based on the type of the field
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return bVal.localeCompare(aVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return bVal - aVal;
      } else if (!isNaN(new Date(aVal)) && !isNaN(new Date(bVal))) {
        return new Date(bVal) - new Date(aVal);
      }
      return 0;
    };

    // Sort subfolders and files
    const sortedFolders = [...subfolders].sort(sortFunction);
    const sortedFiles = [...files].sort(sortFunction);

    // Update state with sorted data
    setSubFoldersAndFiles((prevState) => ({
      ...prevState,
      [selectedFolder]: { subfolders: sortedFolders, files: sortedFiles },
    }));
  };

  useEffect(() => {
    handleFolderSortDescending();
     // eslint-disable-next-line
  }, [selectedFolder]);

  useEffect(() => {
    if (selectedFolder && currentPage) {
      fetchSubfoldersAndFiles(
        pattern,
        selectedFolder,
        currentPage,
        selectedPageSize
      );
    }
     // eslint-disable-next-line
  }, [pattern,selectedFolder, currentPage, selectedPageSize]);

  useEffect(() => {
    const sortedItems = combineAndSortItems(
      subfolders,
      files,
      selectedSortCriteria,
      selectedSortOrder
    );
    setSortedItems(sortedItems);
  }, [selectedSortCriteria, selectedSortOrder, subfolders, files]);

  const handleFolderSort = async (sortKey, sortOrder) => {
    if (!["asc", "desc"].includes(sortOrder)) {
      console.error("Invalid sort order:", sortOrder);
      return;
    }

    const pattern = inputValue ? inputValue.toLowerCase() : "";

    if (!selectedFolder) {
      console.error("Selected folder path is empty or not defined.");
      return;
    }

    // Ensure folder data is fetched and available
    if (!subFoldersAndFiles[selectedFolder]) {
      try {
        const result = await fetchSubfoldersAndFiles(
          pattern,
          selectedFolder,
          1,
          selectedPageSize
        );
        const { subfolders, files } = result;

        setSubFoldersAndFiles((prevState) => ({
          ...prevState,
          [selectedFolder]: { subfolders, files },
        }));
      } catch (error) {
        console.error("Error fetching subfolders and files:", error);
        return;
      }
    }

    // Get the folder data for the selected path
    const { subfolders = [], files = [] } =
      subFoldersAndFiles[selectedFolder] || {};

    if (subfolders.length === 0 && files.length === 0) {
      console.warn("No subfolders or files to sort.");
      return;
    }

    // Combine and sort items
    const sortedItems = combineAndSortItems(
      subfolders,
      files,
      sortKey,
      sortOrder
    );

    // Separate sorted items back into folders and files
    const sortedFolders = sortedItems
      .filter((item) => item.type === "subfolder")
      .map((item) => item.name);
    const sortedFiles = sortedItems.filter((item) => item.type === "file");

    // Update state with sorted data
    setSubFoldersAndFiles((prevState) => ({
      ...prevState,
      [selectedFolder]: { subfolders: sortedFolders, files: sortedFiles },
    }));
  };

  const renderTableFilesAndSubfolders = (folderId) => {
    const currentData = subFoldersAndFiles[folderId] || {
      subfolders: [],
      files: [],
    };

    const { subfolders = [], files = [] } = currentData;

    if (!currentData) return null;

    // Combine and map subfolders and files with their respective types
    // const combineAndSortItems = (subfolders, files) => {
    //   const combinedItems = [
    //     ...subfolders.map(subfolder => ({ name: subfolder, type: 'subfolder' })),
    //     ...files.map(file => ({
    //       ...file,
    //       name: file.file_name ? file.file_name.split("/").pop() : "", // Ensure name is set for files
    //       type: 'file'
    //     })),
    //   ];

    //   return combinedItems; // Sorted based on your existing logic
    // };

    const sortedItems = combineAndSortItems(
      subfolders,
      files,
      selectedSortCriteria,
      selectedSortOrder
    );

    const handleFileRowClick = (file) => {
      handleFileClick(`${file.file_name}`);
    };

    // const { subfolders, files } = currentData;

    // if (!subfolders.length && !files.length) {
    //   fetchSubfoldersAndFiles(pattern, selectedFolderPath, currentPage, selectedPageSize);
    // }

    // if (subfolders.length === 0 && files.length === 0) {

    //   return (

    //     <div className="bg-white p-6 rounded-lg shadow-lg items-center w-80 h-32 flex flex-col space-y-8">
    //       <p className="font-medium text-xs text-[#5c5cff]">
    //         No folders or files found in {folderId}
    //       </p>
    //       <div className="flex space-x-4 justify-center">
    //         <button
    //           className="w-16 h-6 text-black text-xs bg-gray font-medium border border-none rounded-lg"
    //           onClick={() => {
    //             setNoDataMessage(false);
    //           }}
    //         >
    //           OK
    //         </button>
    //       </div>
    //     </div>
    //   );
    // }

    if (noPattern) {
      return (
        <SubFolderSearchErrorPopup
          isOpen={folderNoMatchingData}
          message={noPattern || "No matching folders or files found."}
          onClose={handleSearchOkClick} // Close function for FolderNoDataPopup
        />
      );
    }

    return (
      <div
        className=" flex justify-center overflow-auto"
        style={{
          width: `${(folderContainerWidth * 0.98).toFixed(2)}px`,
          height: `${(folderSunContainerHeight * 0.95).toFixed(2)}px`,
          scrollbarWidth: "thin",
          userSelect: "none",
        WebkitUserSelect: "none" /* Safari */,
        MozUserSelect: "none" /* Firefox */,
        msUserSelect: "none",
        }}
      >
        <div
          className="rounded-b-lg shadow-md shadow-slate-500\/30 mt-2"
          style={{
            width: `${(folderContainerWidth * 0.98 * 0.98).toFixed(2)}px`,
            height: `${((folderSunContainerHeight * 0.95 )* 0.92).toFixed(2)}px`,
          }}
        >
          <table className="table-design table-fixed w-full">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
              <tr>
                <th className="py-2 sticky top-0 rounded-tl-lg text-xs font-normal"></th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Name
                  <span
                    onClick={() => handleFolderSort("name", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("name", "desc")}
                    className="cursor-pointer"
                  >
                    {/* {isAscending ? 'Sort Descending' : 'Sort Ascending'} */}
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Size (bytes)
                  <span
                    onClick={() => handleFolderSort("size", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("size", "desc")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Created Date
                  <span
                    onClick={() => handleFolderSort("creation_time", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("creation_time", "desc")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Modified Date
                  <span
                    onClick={() => handleFolderSort("modified_time", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("modified_time", "desc")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 rounded-tr-lg text-xs font-normal">
                  File Path
                </th>
              </tr>
            </thead>
          </table>
          <div
            className="overflow-auto mt-0.5 "
            style={{
              width: `${((folderContainerWidth * 0.98 )* 0.98).toFixed(2)}px`,
              height: `${((
                folderSunContainerHeight *
                0.95 *
                0.93) *
                0.78
              ).toFixed(2)}px`,
              scrollbarWidth: "thin",
            }} >
            <table className="table-design table-fixed w-full">
              <tbody>
                {subfolders.map((folder) => (
                  <tr key={folder.file_id}>
                    <td className="w-[3%] text-xs font-normal overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      onClick={() => handleFolderClick(`${folderId}/${folder}`)}
                    >
                      <span className="text-[11px] font-light text-black cursor-pointer text-center flex items-center">
                        <div className="flex items-center mr-2">
                          <img
                            src={
                              process.env.PUBLIC_URL + "/baseline-folder.png"
                            }
                            alt="Folder"
                            className="w-3 h-3"
                          />
                        </div>
                        <span className="truncate">{folder}</span>
                      </span>

                      {/* {folder.name} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-center text-black px-6 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                  </tr>
                ))}
                {files.map((file) => (
                  <tr
                    key={file.file_id}
                    className={` ${
                      selectedFiles.includes(file.file_name)
                        ? "bg-primary rounded-md "
                        : ""
                    }`}
                    onClick={() => handleFileRowClick(file)}
                  >
                    <td className="w-[3%]"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      // onClick={() => handleFileRowClick(file)}
                    >
                      <span className="text-[11px] font-normal text-black cursor-pointer text-center flex flex-row items-center">
                        <div className="flex items-center relative mr-2 mt-1 flex-shrink-0">
                          <img
                            src={process.env.PUBLIC_URL + "/file-icon.png"}
                            alt="File"
                            className="w-3 h-3 "
                          />
                          {/* {selectedFiles.includes(file.file_name) && (
                            <img
                              src={process.env.PUBLIC_URL + "/tick-icon.png"}
                              alt="Selected"
                              className="absolute w-4 h-4 -top-2 -right-1"
                            />
                          )} */}
                        </div>
                        <span className="truncate">
                          {file.file_name
                            ? file.file_name.split("/").pop()
                            : file.name}
                        </span>
                      </span>
                      {/* {file.file_name ? file.file_name.split("/").pop() : ""} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black pl-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.size}
                    </td>
                    <td className="w-[20%] text-[11px] font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.creation_time}
                    </td>
                    <td className="w-[20%] text-[11px] font-light text-black overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.modified_time}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.file_path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Blue div content here */}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isNewFieldVisible) {
      // Set the ref immediately after setting isNewFieldVisible
      newFieldRef.current = document.getElementById("newRow");
    }
  }, [isNewFieldVisible]);

  useEffect(() => {
    if (isNewFieldVisible && newFieldRef.current) {
      // Scroll to the new row after the rendering is complete
      newFieldRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [isNewFieldVisible, columnData]);

  const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
    const toggleIsMasked = () => {
      if (!disabled) {
        onToggle(!isMasked);
      }
      // const toggleIsMasked = () => {
      //   onToggle(!isMasked);
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
          style={{ width: "30px", height: "15px", cursor: "pointer" }}
        />
      </div>
    );
  };

  const handleToggleSwitch = (value, fieldId) => {
    setColumnData((prev) =>
      prev.map((column) =>
        column.field_id === fieldId ? { ...column, is_masked: value } : column
      )
    );
    const column = columnData.find((col) => col.field_id === fieldId);
    if (!column) return;
    const blob_name = selectedFiles[0];
    debouncedSaveMasking.current(fieldId, value, column, blob_name, containerData, fileShareId);
  };

  const handleNewSwitchChange = (value) => {
    setNewFieldIsMasked(value);
  };
  const CmodalWidth = (width * 0.35).toFixed(2);
  const CmodalHeight = (height * 0.9).toFixed(2);
  const CcontainerWidth = (CmodalWidth * 0.95).toFixed(2);
  const CcontainerHeight = (CmodalHeight * 0.95).toFixed(2);
  const CbuttonWidth = (CcontainerWidth * 0.95).toFixed(2);
  const CbuttonHeight = (CcontainerHeight * 0.09).toFixed(2);
  const Cdatacontainewidth = (CmodalWidth * 0.9).toFixed(2);
  const CdatacontainerHeight = (CmodalHeight * 0.78).toFixed(2);

  const renderColumnData = (columnData) => {
    if (!columnData || !Array.isArray(columnData) || columnData.length === 0) {
      return <p className="font-poppins">No data available</p>;
    }

    const handleAddNewField = () => {
      if (!newFieldName.trim()) {
        return; // Don't add a new field if the field name is empty
      }
      const defaultBlobPrefix = ""; // Replace this with your default value
      const existingBlobPrefix =
        columnData.length > 0 ? columnData[0].blob_prefix : defaultBlobPrefix;

      const newField = {
        field_id: "",
        blob_prefix: existingBlobPrefix,
        field_name: newFieldName,
        is_masked: newFieldIsMasked,
        showDeleteButton: true,
        // Add any other properties you might need for a new field
      };

      setColumnData((prevColumnData) => [...prevColumnData, newField]);

      // Clear input values after adding a new field
      setNewFieldName("");
      setNewFieldIsMasked(false);
      setisNewFieldVisible(true);
      newFieldRef.current = document.getElementById("newRow");

      // Scroll to the new row after the rendering is complete
      newFieldRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    };

    const handleDeleteField = (fieldId, fieldName) => {
      setColumnData((prevColumnData) =>
        prevColumnData.filter(
          (column) =>
            column.field_id !== fieldId ||
            (column.field_id === "" && column.field_name !== fieldName)
        )
      );
    };
    return (
      <div
        className=" flex flex-col  items-center"
        style={{
          width: `${CcontainerWidth}px`,
          height: `${CcontainerHeight}px`,
        }}
      >
        <div
          className=" flex flex-row  items-center  "
          style={{ width: `${CbuttonWidth}px`, height: `${CbuttonHeight}px` }}
        >
          {permissions.includes("SeeUserReports") && (
            <div>
              <button
                className="w-32 h-7 rounded cursor-pointer font-medium font-poppins text-xs  bg-purpleshade1 text-white shadow"
                onClick={() => {
                  setisNewFieldVisible(true);
                  handleAddNewField();
                }}
              >
                Add New Field
                <div ref={newFieldRef}></div>
              </button>
            </div>
          )}
          <div className="flex-grow"></div>
          <div className="flex ">
            <button
              className=" text-2xl font-semibold  mr-2 "
              onClick={closePreviewModal}
            >
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
            </button>
          </div>
        </div>
        <div
          className=" mt-1 flex flex-row items-center justify-between text-xs font-medium "
          style={{
            width: `${CbuttonWidth}px`,
            height: `${(CbuttonHeight * 0.7).toFixed(2)}px`,
          }}
        >
          {selectedFiles[0] && selectedFiles[0].split(/[\\/]/).pop()}
        </div>
        <div
          className="bg-white mb-4 mt-1 font-poppins   rounded-lg !important"
          style={{
            width: `${Cdatacontainewidth}px`,
            height: `${CdatacontainerHeight}px`,
          }}
        >
          <table className="table-design table-fixed w-full">
            <colgroup>
              <col className="w-[70%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead className="bg-purpleshade1 text-white sticky top-0 rounded-tr-lg rounded-tl-lg  ">
              <tr>
                <th className="py-2 sticky top-0 px-7 rounded-tl-lg text-sm font-medium  ">
                  Field Name
                </th>
                <th className="py-2 sticky top-0  rounded-tr-lg text-sm font-medium ">
                  Is Masked
                </th>
              </tr>
            </thead>
          </table>
          <div
            className=" pr-3 py-3   border border-lightgray-200  font-poppins  scrollbar-thin overflow-y-auto rounded-b-lg !important"
            style={{
              width: `${Cdatacontainewidth}px`,
              height: `${CdatacontainerHeight * 0.9}px`,
            }}
          >
            <table className="table-design table-fixed w-full">
              <tbody className="border-none">
                {isNewFieldVisible && (
                  <tr id="newRow">
                    <td className="w-[70%] text-[11px] font-poppins font-[350] px-7  overflow-hidden">
                      <input
                        className="h-6 border border-black w-56 placeholder:text-black "
                        type="text"
                        placeholder="Enter Field Name"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                      />
                    </td>
                    <td className="w-[30%] text-[13px] font-poppins font-[350] px-6">
                      <div className="flex flex-row space-x-3 mt-1 mr-3  items-center">
                        <IsMaskedSwitch
                          isMasked={newFieldIsMasked}
                          onToggle={handleNewSwitchChange}
                          disabled={!permissions.includes("SeeUserReports")}
                        />
                        {!saveButtonClicked && (
                          <button
                            className=" text-xl font-semibold mr-3 "
                            onClick={() => {
                              handleDeleteField("", newFieldName);
                              setisNewFieldVisible(false);
                            }}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

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
                  columnData.map((column, index) => (
                    <tr key={index} className="border-none mt-1">
                      <td className="w-[70%] text-[11px] font-[350] font-poppins text-black px-7 overflow-ellipsis whitespace-nowrap overflow-hidden">
                        {column.field_name}
                      </td>
                      <td className="w-[30%] text-[11px] font-[350] font-poppins px-6 overflow-ellipsis whitespace-nowrap overflow-hidden">
                        {/* <div className="flex flex-row space-x-3   mr-3 items-center"> */}
                        <IsMaskedSwitch
                          isMasked={column.is_masked}
                          onToggle={(value) =>
                            handleToggleSwitch(value, column.field_id)
                          }
                          disabled={!permissions.includes("SeeUserReports")}
                        />
                        {column.showDeleteButton && (
                          <button
                            className=" text-xl font-medium font-poppins ml-2"
                            onClick={() =>
                              handleDeleteField(
                                column.field_id,
                                column.field_name
                              )
                            }
                          >
                            &times;
                          </button>
                        )}
                        {/* </div> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className=" flex flex-row space-x-4 justify-end"
          style={{ width: `${CbuttonWidth}px`, height: `${CbuttonHeight}px` }}
        >
          {permissions.includes("SeeUserReports") && (
            <div>
              <button
                className="w-16 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          )}
          <div>
            {/* <button
                className="w-16 h-7 rounded cursor-pointer font-medium font-poppins text-xs bg-purpleshade1 text-white shadow"
                onClick={closePreviewModal}
              >
                Cancel
              </button> */}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {}, [columnData]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // const handleSave = async () => {
  //   console.log(token);

  //   if (newFieldName.trim() === "") {
  //     // setError("Field Name cannot be empty");
  //     // setIsPopupOpen(true); // Open the popup to show the error message
  //     return; // Exit the function early
  //   }
  //   if (selectedFiles.length > 0) {
  //     const selectedFile = selectedFiles[0];
  //     const blobName = selectedFile;
  //     console.log("blobname", blobName);
  //     const blobPrefix = selectedFile.prefix || ""; // Use an empty string as a fallback
  //     console.log("blob", blobPrefix);

  //     // Prepare the data to be sent in the request
  //     const requestData = {
  //       blob_name: blobName,
  //       columns: [
  //         ...columnData.map((column) => ({
  //           field_id: column.field_id,
  //           field_name: column.field_name,
  //           is_masked: JSON.parse(column.is_masked), // Convert to boolean
  //           blob_prefix: column.blob_prefix,
  //         })),
  //         // Add the new field to the requestData only if it has non-empty values
  //         ...(newFieldName.trim() !== ""
  //           ? [
  //               {
  //                 field_id: "", // Set field_id to an empty string for the new field
  //                 field_name: newFieldName,
  //                 is_masked: newFieldIsMasked,
  //                 blob_prefix: blobPrefix, // Example, adjust as needed
  //               },
  //             ]
  //           : []),
  //       ],
  //     };

  //     // Determine the container ID based on the presence of containerData or fileShareId
  //     if (containerData) {
  //       requestData.container_id = containerData;
  //     } else if (fileShareId) {
  //       requestData.file_share_id = fileShareId;
  //     } else {
  //       console.error("Neither containerData nor fileShareId is available.");
  //       return; // Abort the function if neither containerData nor fileShareId is available
  //     }
  //     // Make the API request to save changes using fetch
  //     fetch(`${API_URL}/api/blob/update_prefix_column_defination/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(requestData),
  //     })
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! Status: ${response.status}`);
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  // setError("Save successful");
  // setIsPopupOpen(true); // Open the popup
  //         // alert(`Save successful`);
  //         // toast.success("Save successful");
  //         // You can handle success, e.g., show a success message or update state
  //         handleFileDefinition(
  //           containerData || fileShareId,
  //           containerData ? "container" : "fileShare"
  //         ).then((response) => {
  //           // Handle response data
  //           if (containerData) {
  //             setSelectedContainer(containerData);
  //             setSelectedFileShare(null);
  //           } else if (fileShareId) {
  //             setSelectedContainer(null);
  //             setSelectedFileShare(fileShareId);
  //           }
  //         });
  //       })
  //       .catch((error) => {
  //         toast.error("Save unsuccessful");
  //         // You can handle errors, e.g., show an error message
  //       });
  //   } else {
  //     console.log("No selected files");
  //   }

  //   setNewFieldName("");
  //   setNewFieldIsMasked(false);
  //   setisNewFieldVisible(false);
  //   await delay(1000);
  //   setIsModalOpen(false);
  // };/

  const handleSave = async () => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      const blobName = selectedFile;

      const blobPrefix = selectedFile.prefix || ""; // Use an empty string as a fallback

      // Prepare the data to be sent in the request
      const requestData = {
        blob_name: blobName,
        columns: [
          ...columnData.map((column) => ({
            field_id: column.field_id,
            field_name: column.field_name,
            is_masked: JSON.parse(column.is_masked), // Convert to boolean
            blob_prefix: column.blob_prefix,
          })),
          // Add the new field to the requestData only if it has non-empty values
          ...(newFieldName.trim() !== ""
            ? [
                {
                  field_id: "", // Set field_id to an empty string for the new field
                  field_name: newFieldName,
                  is_masked: newFieldIsMasked,
                  blob_prefix: blobPrefix, // Example, adjust as needed
                },
              ]
            : []),
        ],
      };

      // Determine the container ID based on the presence of containerData or fileShareId
      if (containerData) {
        requestData.container_id = containerData;
      } else if (fileShareId) {
        requestData.file_share_id = fileShareId;
      } else {
        // console.error("Neither containerData nor fileShareId is available.");
        return; // Abort the function if neither containerData nor fileShareId is available
      }
      // Make the API request to save changes using fetch
      fetch(`${API_URL}/api/blob/update_prefix_column_defination/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setError("Save successful");
          setIsPopupOpen(true); // Open the popup
          // alert(`Save successful`);
          // toast.success("Save successful");
          // You can handle success, e.g., show a success message or update state
          handleFileDefinition(
            containerData || fileShareId,
            containerData ? "container" : "fileShare"
          ).then((response) => {
            // Handle response data
            if (containerData) {
              setSelectedContainer(containerData);
              setSelectedFileShare(null);
            } else if (fileShareId) {
              setSelectedContainer(null);
              setSelectedFileShare(fileShareId);
            }
          });
        })
        .catch((error) => {
          toast.error("Save unsuccessful");
          // You can handle errors, e.g., show an error message
        });
    } else {
      // console.log("No selected files");
    }

    setNewFieldName("");
    setNewFieldIsMasked(false);
    setisNewFieldVisible(false);
    await delay(1000);
    setIsModalOpen(false);
  };

  const handleButtonClick = () => {
    setSelectedFormat(selectedFormat === "tabular" ? "plain_text" : "tabular");
    setShowInput(false); // Hide any active search input field when format is switched
    setShowTableInput(false); // Hide table search input field when format is switched
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "f") {
        // inputRef.current.focus(); // Focus on the input field
        event.preventDefault(); // Prevent default browser search behavior
        setShowInput(true); // Show the input field when ctrl+f is pressed
        setShowTableInput(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClearInput = () => {
    setShowInput(false); // Hide the input field
    setShowReplaceInput(false);
    setReplaceText("");
    setShowTableInput(false); // Hide the table search input field
    setTableSearchText(""); // Clear table search input text
    setSearchInputText(""); // Clear plain text search input text
  };

  const countTotalHighlightedMatches = (data, searchText) => {
    if (!searchText || !searchText.trim() || !Array.isArray(data)) {
      // if (!searchText) {
      return 0;
    }

    let totalCount = 0;

    // Loop through each row in the data
    data.forEach((row) => {
      for (const key in row) {
        if (
          Object.prototype.hasOwnProperty.call(row, key) &&
          typeof row[key] === "string"
        ) {
          const regex = new RegExp(`(${searchText})`, "gi");
          const matches = row[key].match(regex);
          if (matches) {
            // Increment total count by the number of matches in the current row
            totalCount += matches.length;
          }
        }
      }
    });

    return totalCount;
  };

  const highlightText = (rowData, index, currentMatchIndex, matchedIndexes) => {
    // Check if the search input text exists
    if (!searchInputText) {
      return <div className="text-xs font-light  space-y-10">{rowData}</div>;
    }

    // Construct a regular expression to match the search input text
    const escapedSearchText = searchInputText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(`(${escapedSearchText})`, "gi");

    // Use split method to divide the rowData into parts before and after each match
    const parts = rowData.split(regex);

    // Initialize an array to hold the highlighted parts
    const highlightedParts = [];

    // Initialize a counter to keep track of the current match index
    let matchIndex = 0;

    // Iterate over the parts array
    parts.forEach((part, i) => {
      // Check if the current part is a match
      const isMatch = i % 2 === 1;

      // If it's a match, create a JSX element with highlighting
      if (isMatch) {
        // Check if this match corresponds to the current match index
        const isCurrentMatch = matchIndex === currentMatchIndex;

        // Increment the match index counter
        matchIndex++;
        highlightedParts.push(
          <span
            key={`${index}-${i}`}
            data-index={matchIndex - 1}
            style={{
              backgroundColor: isCurrentMatch ? "orange" : "Yellow",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {part}
          </span>
        );
      } else {
        // If it's not a match, simply push the part as-is
        highlightedParts.push(part);
      }
    });

    // Return the highlighted text as a single JSX element
    return (
      <div className="text-sm font-light space-y-10" key={index}>
        {highlightedParts}
      </div>
    );
  };

  const updateMatchIndex = (index) => {
    setCurrentMatchIndex(index);
  };

  const highlightNextMatch = (direction) => {
    if (matchedIndexes.length === 0) return; // No matches to highlight

    setCurrentMatchIndex((prevIndex) => {
      let nextIndex = prevIndex + direction;

      // Ensure nextIndex stays within bounds
      if (nextIndex < 0) {
        nextIndex = matchedIndexes.length - 1;
      } else if (nextIndex >= matchedIndexes.length) {
        nextIndex = 0;

        // Scroll to the top
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }

      return nextIndex;
    });

    // Scroll to the matched text
    if (containerRef.current) {
      const matchedElement = containerRef.current.querySelector(
        `[data-index="${currentMatchIndex}"]`
      );
      if (matchedElement) {
        // Calculate the position of the matched element relative to the container
        const topOffset =
          matchedElement.offsetTop - containerRef.current.offsetTop;

        // Scroll the container to bring the matched text into view
        containerRef.current.scrollTo({
          top: topOffset,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    // Scroll to the matching row when currentMatchIndex changes
    scrollToMatchingRow(matchedIndexes[currentMatchIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatchIndex]);

  const scrollToMatchingRow = (index) => {
    setTimeout(() => {
      const element = document.getElementById(`row-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100); // Adjust the delay time as needed
  };

  // Effect to scroll to the corresponding matched row when currentMatchIndex changes
  useEffect(() => {
    if (currentMatchIndex !== -1 && matchedIndexes.length > 0) {
      scrollToMatchingRow(matchedIndexes[currentMatchIndex]);
    }
  }, [currentMatchIndex, matchedIndexes]);

  const findMatchingIndexes = (data, searchInputText) => {
    if (!searchInputText || typeof data !== "string") return [];

    const indexes = [];
    const matches = [];
    const searchRegex = new RegExp(searchInputText, "gi");

    let match;
    while ((match = searchRegex.exec(data)) !== null) {
      indexes.push(match.index);
      matches.push(match[0]);
    }
    setMatchedIndexes(indexes);
    return matches;
  };

  useEffect(() => {
    const matches = findMatchingIndexes(apiData, searchInputText);
    if (matches.length > 0) {
      setCurrentMatchTableIndex(0); // Start highlighting from the first match
      // console.log("current1",currentMatchIndex)
    } else {
      setCurrentMatchTableIndex(-1); // No matches found
      // console.log("current2",currentMatchIndex)
    }
  }, [apiData, searchInputText]);

  useEffect(() => {}, [currentMatchIndex]);

  useEffect(() => {
    const indexes = findMatchingIndexes(apiData, searchInputText);
    const matches = findMatchingIndexes(apiData, searchInputText);
    setMatchedIndexes(indexes);
  }, [apiData, searchInputText]);

  useEffect(() => {}, [matchedIndexes]);

  const handleSearchInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchInputText(inputValue);
  };

  const handleKeyPress = (e, direction) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default behavior of the Enter key

      if (matchedIndexes.length === 0) return; // No matches to highlight

      setCurrentMatchIndex((prevIndex) => {
        let nextIndex = prevIndex + direction;

        // Ensure nextIndex stays within bounds
        if (nextIndex < 0) {
          nextIndex = matchedIndexes.length - 1;
        } else if (nextIndex >= matchedIndexes.length) {
          nextIndex = 0;

          // Scroll to the top
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }

        return nextIndex;
      });

      // Scroll to the matched text
      if (containerRef.current) {
        const matchedElement = containerRef.current.querySelector(
          `[data-index="${currentMatchIndex}"]`
        );
        if (matchedElement) {
          // Calculate the position of the matched element relative to the container
          const topOffset =
            matchedElement.offsetTop - containerRef.current.offsetTop;

          // Scroll the container to bring the matched text into view
          containerRef.current.scrollTo({
            top: topOffset,
            behavior: "smooth",
          });
        }
      }
    }
  };

  useEffect(() => {
    const elements = document.querySelectorAll(".highlighted-text");
    setMatchedElements(Array.from(elements));
    // setCurrentMatchIndex(-1); // Reset currentMatchIndex when matched elements change
  }, [apiData, searchTableInputText, currentMatchIndex, displayedRows]);

  useEffect(() => {}, [searchTableInputText]);

  useEffect(() => {}, [searchInputText]); // Log the current search input text when it changes

  useEffect(() => {
    setCurrentHighlightedIndex(-1);
  }, [searchTableInputText]);

  const totalRows = Math.ceil(apiData.length / rowsPerPage);

  const tableRef = useRef(null);

  // Calculate the index range for displayed rows
  const indexOfLastRow = currentTablePage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const rows = apiData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    // setCurrentMatchIndex(-1); // Reset match index on API data change
  }, [apiData]);

  useEffect(() => {
    setMatchedIndexes([]);
    // setCurrentMatchIndex(-1);
  }, [apiData]);

  const countHighlightedText = (data, searchText) => {
    let totalCount = 0;

    // Check if data is an array before attempting to iterate over it
    if (Array.isArray(data)) {
      data.forEach((row) => {
        Object.values(row).forEach((value) => {
          if (typeof value === "string") {
            const regex = new RegExp(`(${searchText})`, "gi");
            const matches = value.match(regex);
            if (matches) {
              totalCount += matches.length;
            }
          }
        });
      });
    }

    return totalCount;
  };

  const handletableNextPage = () => {
    const nextPage = currentTablePage + 1;
    setCurrentTablePage(nextPage);
    setPreviousTableButtonDisabled(false); // Enable previous button when moving to next page
    if (nextPage >= totalRows) {
      setNextTableButtonDisabled(true); // Disable next button on reaching the last page
    }
  };

  const handletablePrevPage = () => {
    const prevPage = currentTablePage - 1;
    setCurrentTablePage(prevPage);
    setNextTableButtonDisabled(false); // Enable next button when moving to previous page
    if (prevPage === 1) {
      setPreviousTableButtonDisabled(true); // Disable previous button when on the first page
    }
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentTablePage(1); // Reset to first page when changing rows per page
    setPreviousTableButtonDisabled(true); // Disable previous button on reset
    setNextTableButtonDisabled(false); // Enable next button on reset
  };

  const handlePageSizeChange = (pageSize) => {
    setRowsPerPage(pageSize);
    handleRowsPerPageChange(pageSize);
    setIstableDropdownOpen(false); // Close the dropdown after selecting an option
  };

  const findMatchingTableIndexes = (apiData, searchTableInputText) => {
    if (!searchTableInputText || typeof searchTableInputText !== "string")
      return [];

    const indexes = [];
    const matches = [];

    apiData.forEach((item, index) => {
      const rowData = Object.values(item).join(" ").toLowerCase(); // Combine all values in item for search
      if (rowData.includes(searchTableInputText.toLowerCase().trim())) {
        indexes.push(index);
        matches.push(item);
      }
    });

    return matches;
  };

  useEffect(() => {
    const matches = findMatchingTableIndexes(apiData, searchTableInputText);

    if (matches.length > 0) {
      setCurrentMatchIndex(0); // Start highlighting from the first match
      setMatchedIndexes(matches); // Update matchedIndexes
    } else {
      setCurrentMatchIndex(-1); // No matches found
      setMatchedIndexes([]); // Clear matchedIndexes
    }
    // eslint-disable-next-line
  }, [apiData, searchTableInputText]);

  useEffect(() => {
    // console.log("currentMatchIndex:", currentMatchIndex);
    // console.log("matchedIndexes", matchedIndexes);
  }, [currentMatchIndex, matchedIndexes]);

  const handleSwitchChange = async () => {
    setMaskedData((prevMaskedData) => !prevMaskedData);
  };

  useEffect(() => {
    if (
      selectionId &&
      selectionType &&
      selectedStorageAccount &&
      selectedFormat
    ) {
      setApiLoading(true);
      handleDynamicPreview(
        selectionId,
        selectionType,
        selectedStorageAccount,
        selectedFormat,
        maskedData
      )
        .then((response) => {
          setApiLoading(false);
        })
        .catch((error) => {
          setApiLoading(false);
          console.error("Error fetching data:", error);
        });
    } else {
      console.error("Required parameters for preview are not defined");
    }
    // eslint-disable-next-line
  }, [
    maskedData,
    selectionId,
    selectionType,
    selectedStorageAccount,
    selectedFormat,
  ]);

  useEffect(() => {}, [maskedData]);

  useEffect(() => {
    if (itemOffset > totalRows) {
      setItemOffset(totalRows);
    }
  }, [totalRows, itemOffset]);

  const getPageNumbers = () => {
    const totalpages = "";
    const maxPageNumbers = 5;
    let startPage = 1;
    let endPage = Math.min(totalpages, maxPageNumbers);

    if (currentTablePage > 3) {
      startPage = currentTablePage - 2;
      endPage = Math.min(currentTablePage + 2, totalpages);

      if (endPage - startPage < maxPageNumbers - 1) {
        startPage = Math.max(endPage - maxPageNumbers + 1, 1);
      }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const selectOption = (value) => {
    handleRowsPerPageChange(value);
    setIsOpenRows(false); // Close the dropdown after selecting an option
  };

  const toggleRowsDropdown = () => setIsOpenRows(!isOpenRows);
  const renderPreviewData = (apiData) => {
    // if (apiLoading) {
    //   return (
    //     <div className="w-full h-[90%] flex flex-col justify-center items-center space-y-6">
    //       <img
    //         src={process.env.PUBLIC_URL + "/loadergif.gif"}
    //         alt="Loading..."
    //         className="w-10 h-10 animate-spin"
    //       />
    //       <p className="text-logintext font-[350] text-[13px] animate-pulse">Loading data...</p>
    //     </div>
    //   );
    // }
    const perviewWidth = (width * 0.64).toFixed(2);
    const previewHeight = (height * 0.8).toFixed(2);
    const plainContainerWidth = (perviewWidth * 0.96).toFixed(2);
    const plainContainerHeight = (previewHeight * 0.88).toFixed(2);
    const plainDataWidth = (plainContainerWidth * 0.98).toFixed(2);
    const plainDataHeight = (plainContainerHeight * 0.83).toFixed(2);

    if (!apiData || apiData.length === 0) {
      return <p>No data available</p>;
    }

    const isCsvFile = (fileName) => {
      // return fileName && fileName.toLowerCase().endsWith(".csv");
      // return fileName && (fileName.toLowerCase().endsWith(".csv") || fileName.toLowerCase().endsWith(".txt"));
      return (
        fileName &&
        (fileName.toLowerCase().endsWith(".csv") ||
          fileName.toLowerCase().endsWith(".txt") ||
          fileName.toLowerCase().endsWith(".xls") ||
          fileName.toLowerCase().endsWith(".xlsx") ||
          fileName.toLowerCase().endsWith(".prn"))
      );
    };

    const isExcelFile = (fileName) => {
      return (
        fileName &&
        (fileName.toLowerCase().endsWith(".xls") ||
          fileName.toLowerCase().endsWith(".xlsx"))
      );
    };

    // const headers = Object.keys(apiData[0]);
    const headers =
      Array.isArray(apiData) && apiData[0] && typeof apiData[0] === "object"
        ? Object.keys(apiData[0])
        : [];
    return (
      <div
        className="  flex flex-col px-6"
        style={{ width: `${perviewWidth}px`, height: `${previewHeight}px` ,
        userSelect: "none",
        WebkitUserSelect: "none" /* Safari */,
        MozUserSelect: "none" /* Firefox */,
        msUserSelect: "none",}}
      >
        {selectedFormat === "tabular" ? (
          <pre>
            <FullScreenPreview
              isLoading={apiLoading}
              setIsLoading={setApiLoading}
              data={apiData}
              // apiData={rows}
              apiData={apiData}
              handlePageClick={handlePageClick}
              handleDownload={handleDownload}
              closePreviewModal={closePreviewModal}
              handleSwitchChange={handleSwitchChange}
              maskedData={maskedData}
              isMasked={isMasked}
              selectedFiles={selectedFiles[0]}
              canSeeRealData={canSeeRealData}
              pageNumbers={pageNumbers}
              handletablePrevPage={handletablePrevPage}
              handletableNextPage={handletableNextPage}
              handleRowsPerPageChange={handleRowsPerPageChange}
              width={width}
              height={height}
            />
          </pre>
        ) : (
          <div
            className="flex  flex-col items-center mt-1 px-3"
            style={{
              width: `${plainContainerWidth}px`,
              height: `${plainContainerHeight}px`,
            }}
          >
            <div
              className=" flex flex-row space-x-2 px-2"
              style={{
                width: `${plainContainerWidth}px`,
                height: `${(plainContainerHeight * 0.1).toFixed(2)}px`,
              }}
            >
              <div className="flex flex-row bg-white justify-between items-center w-72 h-9 rounded shadow-md px-3">
                <input
                  type="text"
                  value={searchInputText}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => handleKeyPress(e, 1)}
                  autoComplete="off"
                  autoFocus="cursor"
                  className="border border-none outline-none text-black"
                />
                <img
                  src={process.env.PUBLIC_URL + "/search_icon.png"}
                  alt="search"
                  style={{
                    width: "18px",
                    height: "18px",
                    outline: "none",
                  }}
                />
              </div>
              <div className="h-8 w-10 flex flex-row justify-between items-center">
                <button
                  className={`rounded-lg cursor-pointer font-bold text-sm mt-1`}
                  onClick={() => highlightNextMatch(-1)}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/less-than.png"}
                    alt="Closed Folder"
                    className="w-3 h-3 font-poppins"
                  />
                </button>

                <button
                  className={`rounded-lg cursor-pointer font-bold mt-1 text-sm`}
                  onClick={() => highlightNextMatch(1)}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/more-than.png"}
                    alt="Closed Folder"
                    className="w-3 h-3"
                  />
                </button>
              </div>
              {canSeeRealData && (
                <div className="h-8 w-36 flex flex-row justify-between items-center">
                  <label className="text-[12px] font-poppins font-medium text-black">
                    Masked Data ?
                  </label>
                  <div className="relative inline-block w-[32px] h-[20px] rounded-full cursor-pointer">
                    <img
                      src={
                        maskedData
                          ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
                          : process.env.PUBLIC_URL + "/noswitch-icon.png"
                      }
                      alt={maskedData ? "Yes" : "No"}
                      onClick={handleSwitchChange}
                      style={{
                        width: "70px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex-grow"></div>
              <button
                className="w-28 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center
                       items-center font-medium text-[13px] bg-purpleshade1 text-white"
                onClick={handleDownload}
              >
                Download
              </button>
              {/* Blue div content here */}
            </div>
            <div
              className="flex flex-row  px-5  text-black text-xs font-medium"
              style={{
                width: `${plainContainerWidth}px`,
                height: `${(plainContainerHeight * 0.05).toFixed(2)}px`,
              }}
            >
              {/* {selectedFiles[0]} */}
              {selectedFiles[0] && selectedFiles[0].split(/[\\/]/).pop()}
            </div>
            <div
              className="bg-white flex justify-center border border-lightgray-300 rounded-md shadow-md shadow-slate-500\/30"
              style={{
                width: `${plainDataWidth}px`,
                height: `${plainDataHeight}px`,
              }}
            >
              {apiLoading ? (
                <div className="w-full h-full flex flex-col justify-center items-center">
                  <img
                    src={process.env.PUBLIC_URL + "/loadergif.gif"}
                    alt="loader"
                    className="animate-spin w-6 h-6 items-center"
                  />
                  {/* <p className="text-logintext font-[350] text-[13px] animate-pulse">
                            Just a moment...
                          </p> */}
                </div>
              ) : (
                <pre
                  className=" overflow-x-auto overflow-y-auto relative  font-poppins  
                select-text cursor-not-allowed   flex flex-col  space-y-5 text-black pl-2 pt-0.5"
                  ref={containerRef}
                  style={{
                    width: `${(plainDataWidth * 0.995).toFixed(2)}px`,
                    height: `${(plainDataHeight * 0.98).toFixed(2)}px`,
                    scrollbarWidth: "thin",
                    caretColor: "red",
                    userSelect: "none",
                  }}
                >
                  {Array.isArray(apiData) ? (
                    apiData.map((item, index) => (
                      <div
                        key={`item-${index}`}
                        className="mb-5 border-b border-primary text-black "
                        style={{ userSelect: "none" }}
                      >
                        {Array.isArray(item)
                          ? item.map((rowData, subIndex) => (
                              <div key={`subrow-${subIndex}`}>
                                {typeof rowData === "object"
                                  ? JSON.stringify(rowData)
                                  : highlightText(
                                      rowData,
                                      subIndex,
                                      currentMatchIndex,
                                      matchedIndexes
                                    )}
                              </div>
                            ))
                          : typeof item === "string"
                          ? highlightText(
                              item,
                              index,
                              currentMatchIndex,
                              matchedIndexes
                            )
                          : Object.values(item).map((value, subIndex) => (
                              <div
                                key={`value-${subIndex}`}
                                className="border-b border-primary"
                              >
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : highlightText(
                                      value,
                                      subIndex,
                                      currentMatchIndex,
                                      matchedIndexes
                                    )}
                              </div>
                            ))}
                      </div>
                    ))
                  ) : (
                    <div>
                      {typeof apiData === "object"
                        ? JSON.stringify(apiData)
                        : highlightText(
                            apiData,
                            0,
                            currentMatchIndex,
                            matchedIndexes
                          )}
                    </div>
                  )}
                </pre>
              )}
            </div>
          </div>
        )}

        {isCsvFile(selectedFiles[0]) && (
          <div
            className="flex justify-between items-center px-3 flex-row "
            style={{
              width: `${perviewWidth * 0.3}px`,
              height: `${(previewHeight * 0.08).toFixed(2)}px`,
            }}
          >
            <button
              className="w-32 h-8 flex flex-row font-poppins  px-4 rounded-md cursor-pointer justify-center items-center
                       font-medium text-[13px] bg-purpleshade1 text-white"
              onClick={handleButtonClick}
            >
              {selectedFormat === "tabular" ? "Plain Text" : "Preview"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const metadatamodalWidth = (width * 0.4).toFixed(2);
  const metadatamodalHeight = (height * 0.75).toFixed(2);

  const renderMetadata = (metadata) => {
    if (!metadata) {
      return <p className="font-poppins">No metadata available</p>;
    }

    return (
      <div
        className="flex justify-center items-center"
        style={{
          width: `${metadatamodalWidth}px`,
          height: `${metadatamodalHeight}px`,
        }}
      >
        <div
          className="flex flex-col   items-center  overflow-y-auto scrollbar-thin  "
          style={{
            width: `${(metadatamodalWidth * 0.95).toFixed(2)}px`,
            height: `${(metadatamodalHeight * 0.9).toFixed(2)}px`,
          }}
        >
          <div
            className="text-xs font-medium flex items-center"
            style={{
              width: `${(metadatamodalWidth * 0.95).toFixed(2)}px`,
              height: `${(metadatamodalHeight * 0.9 * 0.1).toFixed(2)}px`,
            }}
          >
            {selectedFiles[0] && selectedFiles[0].split(/[\\/]/).pop()}
          </div>
          <div
            className=" flex flex-col   space-y-4  items-center justify-center  "
            style={{
              width: `${(metadatamodalWidth * 0.94).toFixed(2)}px`,
              height: `${(metadatamodalHeight * 0.9 * 0.96).toFixed(2)}px`,
            }}
          >
            {loading ? (
              <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 ">
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
              Object.entries(metadata).map(([property, value], index) => (
                <div key={index} className="flex space-x-4">
                  {/* <div className=" px-4 pt-2 w-80 items-center pb-2 bg-[#F2F2F3] h-8 overflow-ellipsis"> */}
                  {/* <strong>{property}</strong> */}
                  <input
                    type="text"
                    className=" px-4 pt-2 text-justify font-normal text-xs font-poppins text-black bg-secondary pb-2  h-8 overflow-ellipsis cursor-default"
                    value={property}
                    title={property}
                    style={{
                      width: `${(metadatamodalWidth * 0.95 * 0.4).toFixed(
                        2
                      )}px`,
                    }}
                  />
                  {/* </div> */}
                  <div>:</div>
                  {/* <div className="w-80 px-4 pt-2 text-justify  pb-2 bg-[#F2F2F3] h-8 overflow-ellipsis cursor-default"> */}
                  {/* {JSON.stringify(value)} */}
                  <input
                    type="text"
                    className="px-4 pt-2 text-justify font-normal text-xs font-poppins text-black bg-secondary  pb-2  h-8 overflow-ellipsis cursor-default"
                    value={JSON.stringify(value)}
                    title={JSON.stringify(value)}
                    style={{
                      width: `${(metadatamodalWidth * 0.95 * 0.4).toFixed(
                        2
                      )}px`,
                    }}
                  />
                  {/* </div> */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleFixedwidthFile = async () => {
    try {
      // Check if there are selected files
      if (selectedFiles.length === 0) {
        console.error("No files selected.");
        return;
      }

      const FixedData = await handleDynamicPreview(
        selectionId,
        selectionType,
        selectedStorageAccount,
        selectedFiles[0]
      );

      if (FixedData !== null) {
        // Update the state directly
        setApiData(FixedData);

        navigate("/fixedwidth", {
          state: {
            apiData: FixedData,
            container_id: containerData,
            selectedFiles: selectedFiles,
          },
        });
      } else {
        console.error("No data received from handleDynamicPreview.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const options = Jsontimezones.map((timezone) => ({
      value: timezone,
      label: timezone,
    }));
    setTimezoneOptions(options);
  }, []);

  useEffect(() => {
    handleTimeZoneChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeZone]);

  useEffect(() => {
    if (selectedTimeZone) {
    }
  }, [selectedTimeZone]);

  const handleTimeZoneChange = async () => {
    if (selectedTimeZone) {
      try {
        const response = await fetch(`${API_URL}/update-usertimezone/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({
            email: userEmail,
            timezone: selectedTimeZone.value,
          }),
        });

        if (response.ok) {
          await updateDatesBasedOnTimezone(selectedTimeZone.value);
          setIsTimezoneModalOpen(false);
        } else {
          console.error("Failed to update timezone:", response.status);
        }
      } catch (error) {
        console.error("Error updating timezone:", error);
      }
    }
  };

  const updateDatesBasedOnTimezone = async (timezone) => {
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
    return new Date(dateTime).toLocaleString("en-US", {
      timeZone: timezone,
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // const handleOptionClick = (value) => {
  //   const syntheticEvent = { target: { value } };
  //   handleDropdownChange(syntheticEvent);
  //   setIsDropdownOpen(false);
  // };

  const handleOptionClick = async (value) => {
    const syntheticEvent = { target: { value } };
    handleDropdownChange(syntheticEvent); // Update the page size state
    setIsDropdownOpen(false); // Close the dropdown

    setSearchResults(null);
    setSearchInput("");

    const searchPattern = searchInput || ""; // Use the searchInput state

    try {
      let response;
      // Wait for the page size state to update before making fetch calls
      await new Promise((resolve) => setTimeout(resolve, 1));

      if (searchPattern !== "") {
        if (selectedFolder) {
          // Fetch subfolders and files with the search pattern
          response = await fetchSubfoldersAndFiles(
            searchPattern,
            selectedFolder,
            1,
            value
          );
        } else {
          // Fetch files with the search pattern and other parameters
          response = await fetchFilesFromApi(
            searchPattern,
            selectedFolderPath,
            1,
            value,
            selectionType,
            selectionId,
            selectedStorageAccount,
            selectedSortCriteria,
            selectedSortOrder
          );
        }
      } else {
        // Handle case when no pattern is provided
        if (selectedFolder) {
          response = await fetchSubfoldersAndFiles(
            "",
            selectedFolder,
            1,
            value
          ); // Use empty string for pattern
        } else {
          response = await fetchFilesFromApi(
            "",
            selectedFolderPath,
            1,
            value,
            selectionType,
            selectionId,
            selectedStorageAccount,
            selectedSortCriteria,
            selectedSortOrder
          ); // Use empty string for pattern
        }
      }

      setSearchResults({
        subfolders: response.subfolders || [],
        files: response.files || [],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Close the dropdown when the component mounts
  useEffect(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleSortClick = (criteria) => {
    // Toggle between ascending and descending order
    const newSortOrder =
      selectedSortCriteria === criteria && selectedSortOrder === "asc"
        ? "des"
        : "asc";

    // Update the state
    setSelectedSortCriteria(criteria);
    setSelectedSortOrder(newSortOrder);
  };

  // Function to determine visibility of arrow symbols for a specific column
  const isArrowVisible = (criteria, order) => {
    return selectedSortCriteria === criteria && selectedSortOrder === order;
  };

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

  const tableHeight = Math.max(0, viewportHeight);

  function isBookmarkBarVisible() {
    const expectedHeight = window.outerHeight - window.innerHeight;
    // Assuming 100px difference means the bookmark bar is visible
    return expectedHeight > 100;
  }

  useEffect(() => {
    const adjustModalStyles = () => {
      if (isBookmarkBarVisible()) {
        setModalStyles({
          marginTop: "130px",
          maxHeight: `calc(100% - 130px)`,
        });
      } else {
        setModalStyles({
          marginTop: "110px",
          maxHeight: `calc(100% - 110px)`,
        });
      }
    };

    adjustModalStyles();
    window.addEventListener("resize", adjustModalStyles);

    return () => {
      window.removeEventListener("resize", adjustModalStyles);
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
  }, []); // Empty dependency array to run effect once

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

  const handleSearchInputKeyPress = (e) => {
    if (e.key === "Enter") {
      // Logic to navigate through highlighted text
      const elements = document.querySelectorAll(".highlighted-text");
      const searchText = searchTableInputText.toLowerCase();

      if (elements.length > 0) {
        let found = false;
        elements.forEach((element) => {
          if (element.textContent.toLowerCase().includes(searchText)) {
            element.scrollIntoView({ behavior: "smooth" });
            found = true;
            return;
          }
        });

        if (!found) {
          setError("New field name cannot be empty");
          setIsPopupOpen(true); // Open the popup to show the error message
          return;
        }
      }
    }
  };

  const handlePlainView = () => {
    setIsTableView(false);
    // setIsRenderTableView(false);
    // setCurrentPage(1);
    setTotalPages(totalPages);
  };

  const handleTableView = () => {
    setIsTableView(true);
    // setCurrentPage(1);
    setTotalPages(totalPages);
    // setIsRenderTableView(true);
  };

  //   const handlePlainView = async () => {
  //     setIsTableView(false);
  //     // Reset or fetch data based on the plain view
  //     if(selectedFolder){
  //     await fetchSubfoldersAndFiles(pattern, selectedFolder, currentPage, selectedPageSize,selectedSortOrder ,'plain');
  //   }else{
  //     await fetchFilesFromApi(
  //       pattern,
  //       selectedFolderPath,
  //       currentPage,
  //       selectedPageSize,
  //       selectionType,
  //       selectionId,
  //       selectedStorageAccount,
  //       selectedSortCriteria,
  //       selectedSortOrder
  //     );
  //   }
  //     setCurrentPage(1); // Optional: Reset page to 1 on view change
  // };

  // const handleTableView = async () => {
  //     setIsTableView(true);
  //     // Reset or fetch data based on the table view
  //     if(selectedFolder){
  //     await fetchSubfoldersAndFiles(pattern, selectedFolder, currentPage, selectedPageSize,selectedSortOrder ,'table');
  //     }else{
  //       await fetchFilesFromApi(
  //         pattern,
  //         selectedFolderPath,
  //         currentPage,
  //         selectedPageSize,
  //         selectionType,
  //         selectionId,
  //         selectedStorageAccount,
  //         selectedSortCriteria,
  //         selectedSortOrder
  //       );

  //     }
  //     setCurrentPage(1); // Optional: Reset page to 1 on view change
  // };

  const handleBreadcrumbClick = (folderPath) => {
    handleFolderClick(folderPath);
    // setSelectedPageSize(10);
    if (!folderPath || folderPath === "/") {
      // Reset the page size to 10
      const newPageSize = 10;
      setSelectedPageSize(newPageSize); // Reset page size

      // Fetch root folders and files with the updated page size
      fetchFilesFromApi(
        pattern,
        selectedFolderPath,
        1, // Reset to the first page
        newPageSize,
        selectionType,
        selectionId,
        selectedStorageAccount,
        selectedSortCriteria,
        selectedSortOrder
      );
      // Clear search input and results if navigating to root or top-level folder
      setInputValue("");
      setSearchResults(null);
      setSearchInput("");
      // selectedPageSize(10);
    } else {
      const newPageSize = 10;
      setSelectedPageSize(newPageSize);
      // Fetch subfolders and files
      fetchSubfoldersAndFiles(
        pattern,
        folderPath, // Update to use the current folder path
        currentPage,
        newPageSize // Pass the new page size to fetchSubfoldersAndFiles
      );
    }
    // Clear input value when navigating back to a parent folder or when folderPath is empty
    if (folderPath !== selectedFolder || !selectedFolder) {
      setInputValue("");
      setSearchResults(null); // Clear search results
      setSearchInput("");
    }
  };

  const renderBreadcrumbs = () => {
    if (!selectedFolder) return null;

    const folderPaths = selectedFolder.split("/");

    const breadcrumbs = folderPaths.map((path, index) => {
      const fullPath = folderPaths.slice(0, index + 1).join("/");

      // setInputValue("");
      return (
        <span
          key={fullPath}
          onClick={() => {
            handleBreadcrumbClick(fullPath);
            // setInputValue("")
          }}
          style={{ cursor: "pointer" }}
        >
          {path}
          {index < folderPaths.length - 1 && " > "}
        </span>
      );
    });

    return <div className="folder-navigation">{breadcrumbs}</div>;
  };

  const handleContainerClick = async (containerData) => {
    try {
      await fetchFilesFromApi(
        pattern,
        selectedFolderPath,
        currentPage,
        selectedPageSize,
        selectionType,
        selectionId,
        selectedStorageAccount,
        selectedSortCriteria,
        selectedSortOrder
      );
    } catch (error) {
      console.error("Error fetching Files:", error);
    }
    setIsContainerClick(true);
    setSelectedFolder(null);
    setSelectedFiles([]);
    setInputValue("");
    setSelectedPageSize(10);
    setCurrentPage(1);
  };

  useEffect(() => {}, [isContainerClick]);

  const handleLinkClick = (option) => {
    setSelectedOption(option);

    // Optionally, update fileShareName and selectedStorageAccountName based on option
    if (option === "fileShares") {
      setFileShareName("ExampleFileShareName");
    } else {
      setSelectedStorageAccountName("ExampleStorageAccountName");
    }
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setShowProfileModal(false);
    setIsTimezoneModalOpen(false);
    setSelectedNavbarOption(null);
    setIsPopupOpen(false);
    setIsNoDataPopupOpen(false);
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

  const maodalWidth = (width * 0.8).toFixed(2);
  const modalHeight = (height * 0.6).toFixed(2);
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
  const sidebarHeight = `${(height * 0.98).toFixed}`;
  const sidebarLMargin = `${(width * 0.01).toFixed(2)}`;
  const containerMarginLeft = `${(width * 0.081).toFixed(2)}`;
  const cMarginLeft = `${(
    containerMarginLeft -
    (parseFloat(sidebarWidth) + parseFloat(sidebarLMargin))
  ).toFixed(2)}px`;
  const subContainerWidth = `${(containerWidth * 0.97).toFixed(2)}`;
  const subContainerHeight = `${(containerHeight * 0.8).toFixed(2)}`;
  const subContainerTMargin = `${(
    containerHeight * 0.1 -
    parseFloat(cMarginTop)
  ).toFixed(2)}`;
  const listItemsContainerWidth = `${(subContainerWidth * 0.2).toFixed(2)}`;
  const listItemsContainerHeight = `${(containerHeight * 0.75).toFixed(2)}`;
  const dataContainerWidth = `${subContainerWidth - listItemsContainerWidth}`;
  const subDataContainerWidth = `${(dataContainerWidth * 0.99).toFixed(2)}`;
  const folderContainerWidth = `${(subContainerWidth * 0.98).toFixed(2)}`;
  const folderContainerHeight = `${(subContainerHeight * 0.8).toFixed(2)}`;
  const folderSunContainerHeight = `${(folderContainerHeight * 0.92).toFixed(
    2
  )}`;
  const subDataContainerHeight = `${(listItemsContainerHeight * 0.98).toFixed(
    2
  )}`;
  const tableContainerWidth = `${(subDataContainerWidth * 0.98).toFixed(2)}`;
  const tableContainerHight = `${(subContainerHeight * 0.84).toFixed(2)}`;
  const buttonWidth = `${(subContainerWidth * 0.95).toFixed(2)}`;
  const buttonMHeight = `${(subContainerHeight * 0.07).toFixed(2)}`;
  const buttonHeight = `${(subContainerHeight * 0.1).toFixed(2)}`;
  const marginTop = `${(
    parseFloat(subContainerTMargin * 0.1) + parseFloat(buttonMHeight)
  ).toFixed(2)}`;
  const routeContainerHeight = `${(containerHeight * 0.07).toFixed(2)}`;

  return (
    <div
      className="bg-primary"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {(selectedContainer || selectedFileShare) && (
        <div
          className="flex flex-col items-center "
          style={{ height: "100%", width: "100%" }}
        >
          <div
            className={`${isColumnDataModalOpen ? "pointer-events-none" : ""}
            ${isModalOpen ? " pointer-events-none" : ""}
            ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
            ${showProfileModal ? "pointer-events-none" : ""}
            ${isMetaDataModalOpen ? "pointer-events-none" : ""} 
            ${showChatbot ? "pointer-events-none" : ""}`}
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
            className="flex flex-row  "
            style={{ width: `${width}px`, height: `${PContainerHeight}px` }}
          >
            <div
              className={`bg-white rounded-lg shadow-lg shadow-slate-500/50 ${isColumnDataModalOpen ? "pointer-events-none" : ""}
              ${isModalOpen ? " pointer-events-none" : ""}
              ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
              ${showProfileModal ? "pointer-events-none" : ""}
              ${isMetaDataModalOpen ? "pointer-events-none" : ""}
              ${showChatbot ? "pointer-events-none" : ""}`}
              style={{
                width: `${sidebarWidth}px`,
                height: `${containerHeight}px`,
                marginTop: `${cMarginTop}px`,
                marginLeft: `${sidebarLMargin}px`,
              }}
            >
              <Sidebar isSidebarOpen={isSidebarOpen} />
            </div>

           
            <div
              className=" bg-white flex flex-col  rounded-lg items-center  shadow-md shadow-slate-500\/30 "
              style={{
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                marginTop: `${cMarginTop}px`,
                marginLeft: cMarginLeft,
              }}
            >
              <div
                className=""
                style={{
                  width: `${(containerWidth * 0.98).toFixed(2)}px`,
                  height: `${(containerHeight * 0.07).toFixed(2)}px`,
                  marginTop: `${cMarginTop}px`,
                }}
              >
                {/* name */}
                <div
                  className={`w-full h-7 flex flex-row  items-center text-sm font-medium 
                   ${isColumnDataModalOpen ? "pointer-events-none" : ""}
                  ${isModalOpen ? " pointer-events-none" : ""}
                  ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
                  ${showProfileModal ? "pointer-events-none" : ""}
                  ${isMetaDataModalOpen ? "pointer-events-none" : ""} 
                  ${showChatbot ? "pointer-events-none" : ""}`}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/purple-storage-icon.png"}
                    alt="red icon"
                    className="w-4 h-4 mr-1 ml-2 mt-1"
                  />

                  <Link
                    className="text-purpleshade1"
                    // to="/container-data"
                    to={`/container-data?selectedOption=${selectedOption}&fileShareName=${fileShareName}&selectedStorageAccount=${selectedStorageAccount}`}
                    // onClick={() => handleLinkClick(selectedOption, fileShareName, selectedStorageAccount)}
                    onClick={() =>
                      handleLinkClick(
                        selectedOption === "fileShares"
                          ? "fileShares"
                          : "selectedStorageAccount",
                      )
                    }
                  >
                    {selectedOption === "fileShares"
                      ? fileShareName
                      : selectedStorageAccount}
                  </Link>
                </div>
              </div>
              <div
                className={`rounded-lg flex flex-col bg-newgray shadow-md shadow-slate-500/30
                 
                `}
                style={{
                  width: `${subContainerWidth}px`,
                  height: `${subContainerHeight}px`,
                }}
              >
                {/* <div className="" style={{width:`${subContainerWidth}px`,height:`${(subContainerHeight * 0.07).toFixed(2)}px`}}></div> */}

                <div
                  className={`bg-newgray rounded-t-lg flex flex-row items-center px-4  
                    ${
                      isColumnDataModalOpen
                        ? "blur-effect pointer-events-none"
                        : ""
                    }
                ${isModalOpen ? "blur-effect pointer-events-none" : ""}
                ${
                  isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""
                } ${
                  showProfileModal ? "blur-effect  pointer-events-none" : ""
                }${isMetaDataModalOpen ? "blur-effect pointer-events-none" : ""}
                ${showChatbot ? "blur-effect pointer-events-none" : ""}`}
                  style={{
                    width: `${subContainerWidth}px`,
                    height: `${(subContainerHeight * 0.15).toFixed(2)}px`,
                  }}
                >
                  <div className="flex flex-row justify-between items-center w-72 h-9 rounded  p-1 shadow-lg shadow-lightgray-100/30  bg-white">
                    <input
                      className="outline-none ml-0 font-[350] text-[13px] w-[250px]  bg-white "
                      type="text"
                      placeholder="Search for files....."
                      // onChange={(e) => handleInputChange(e, selectedFolder)}
                      onChange={(e) => {
                        if (selectedFolder) {
                          handleFolderInputChange(e, selectedFolder);
                        } else {
                          handleInputChange(e);
                        }
                      }}
                      value={inputValue}
                    />
                    <img
                      src={process.env.PUBLIC_URL + "/search_icon.png"}
                      alt="search"
                      className="w-4 h-4 "
                    />
                  </div>
                  <div className="flex-grow"></div>
                  <div className="flex flex-row space-x-3">
                    <button
                      className={`button-base ${
                        selectedFiles.length === 0 ||
                        isMetaDataModalOpen ||
                        isColumnDataModalOpen
                          ? "text-purpleshade1 cursor-not-allowed  rounded-md shadow-md shadow-slate-500/30 ml-8 h-8 w-24 font-medium  text-[13px] bg-white"
                          : "button-enabled"
                      }`}
                      // onClick={() => {
                      //   handleDynamicPreview(
                      //     selectionId,
                      //     selectionType,
                      //     selectedStorageAccount
                      //   );
                      //   setIsModalOpen(true);
                      // }}
                      onClick={() => {
                        handleDynamicPreview(
                          selectionId,
                          selectionType,
                          selectedStorageAccount,
                        )
                          .then(() => {
                            setIsModalOpen(true); // Open modal only if data is valid
                          })
                          .catch((error) => {
                            console.error("Preview Error:", error);
                            console.error("🔍 API Error Details:", {
                              endpoint: "/api/blob/blob_content/",
                              status: "500 Internal Server Error",
                              message:
                                "Backend server error - check backend logs",
                            });

                            // Show user-friendly error
                            setError(
                              "Preview service temporarily unavailable. Please try again later.",
                            );
                            setIsPopupOpen(true);
                            // Handle any other errors here
                          });
                      }}
                      disabled={
                        selectedFiles.length === 0 ||
                        isMetaDataModalOpen ||
                        isColumnDataModalOpen
                      }
                      style={{
                        cursor:
                          selectedFiles.length === 0 ||
                          isModalOpen ||
                          isMetaDataModalOpen
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Preview
                    </button>

                    <button
                      className={`button-base ${
                        selectedFiles.length === 0 ||
                        isModalOpen ||
                        isColumnDataModalOpen
                          ? "text-purpleshade1 cursor-not-allowed  rounded-md shadow-md shadow-slate-500/30 ml-8 h-8 w-24 font-medium  text-[13px] bg-white"
                          : "button-enabled"
                      }`}
                      onClick={() => {
                        handleDynamicMetadata(selectionId, selectionType);
                        // setIsModalOpen(true);
                        // openMetaDataModal();
                        setMetaDataModalOpen(true);
                      }}
                      disabled={
                        selectedFiles.length === 0 ||
                        isModalOpen ||
                        isColumnDataModalOpen
                      }
                      style={{
                        cursor:
                          selectedFiles.length === 0 ||
                          isModalOpen ||
                          isMetaDataModalOpen
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Metadata
                    </button>

                    <button
                      className={`button-base ${
                        selectedFiles.length === 0 ||
                        isModalOpen ||
                        isMetaDataModalOpen
                          ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 ml-8 h-8 w-24 font-medium text-[13px] bg-white"
                          : "button-enabled"
                      }`}
                      onClick={() => {
                        handleFileDefinition(selectionId, selectionType);
                        setIsColumnDataModalOpen(true);
                      }}
                      disabled={
                        selectedFiles.length === 0 ||
                        isModalOpen ||
                        isMetaDataModalOpen
                      }
                      style={{
                        cursor:
                          selectedFiles.length === 0 ||
                          isModalOpen ||
                          isMetaDataModalOpen
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      CDefinition
                    </button>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-center ${
                    isColumnDataModalOpen
                      ? "blur-effect pointer-events-none"
                      : ""
                  }
                  ${isModalOpen ? "blur-effect pointer-events-none" : ""}
                  ${
                    isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""
                  } 
                  ${showProfileModal ? "blur-effect pointer-events-none" : ""}
                  ${
                    isMetaDataModalOpen ? "blur-effect pointer-events-none" : ""
                  }
                  ${showChatbot ? "blur-effect pointer-events-none" : ""}`}
                  style={{
                    width: `${subContainerWidth}px`,
                    height: `${folderContainerHeight}px`,
                  }}
                >
                  <div
                    className="bg-purpleshade1 rounded-t-lg flex flex-row text-white p-4 items-center justify-between"
                    style={{
                      width: `${folderContainerWidth}px`,
                      height: `${(folderContainerHeight * 0.1).toFixed(2)}px`,
                    }}
                  >
                    <div className="flex text-xs font-normal">
                      <div
                        className="cursor-pointer mr-1 text-white"
                        onClick={() => handleContainerClick(containerData)}
                      >
                        {/* {containerName} Container */}
                        {containerName
                          ? `${containerName}`
                          : `${fileShareName}`}
                        {/* <Link to="/container-data"> {containerName ? `${containerName} Container` : `${fileShareName}`}</Link> */}
                      </div>
                      <span className="mr-1"> &gt; </span> {renderBreadcrumbs()}
                    </div>
                    <div className="flex flex-row space-x-3 w-16 items-center">
                      <button type="button" onClick={handleTableView}>
                        <img
                          src={
                            isTableView
                              ? process.env.PUBLIC_URL + "/bg-tableformat.png"
                              : process.env.PUBLIC_URL + "/tableformat.png"
                          }
                          alt="Table"
                          className={
                            isTableView
                              ? "w-6 h-7 rounded-lg  py-1 "
                              : "w-6 h-7 rounded-lg  py-1 "
                          }
                        />
                      </button>
                      <button type="button" onClick={handlePlainView}>
                        <img
                          src={
                            !isTableView
                              ? process.env.PUBLIC_URL +
                                "/bg-plainformat-icon.png"
                              : process.env.PUBLIC_URL + "/plainformat-icon.png"
                          }
                          alt="Plain"
                          className={
                            !isTableView
                              ? "w-6 h-7  rounded-lg  py-1 "
                              : "w-5 h-7  rounded-lg  py-1 "
                          }
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    className="bg-white rounded-b-lg shadow  flex justify-center shadow-slate-500\/30 "
                    style={{
                      width: `${folderContainerWidth}px`,
                      height: `${folderSunContainerHeight}px`,
                    }}
                  >
                    <div
                      className={` flex overflow-auto  ${
                        showChatbot ? "admin-blur-effect" : ""
                      }`}
                      style={{
                        width: `${(folderContainerWidth * 0.98).toFixed(2)}px`,
                        height: `${(folderSunContainerHeight * 0.98).toFixed(
                          2,
                        )}px`,
                        scrollbarWidth: "thin",
                      }}
                    >
                      {loading ? (
                        <div
                          className={`w-full h-[85%] flex flex-col justify-center items-center space-y-6  `}
                        >
                          <img
                            src={process.env.PUBLIC_URL + "/loadergif.gif"}
                            alt="logo"
                            className="animate-spin w-8 h-8"
                          />
                          <p className="text-logintext font-[350] text-[13px] animate-pulse">
                            Just a moment...
                          </p>
                        </div>
                      ) : isTableView ? (
                        selectedFolder ? (
                          renderTableFilesAndSubfolders(
                            selectedFolder,
                            currentPage,
                            selectedPageSize,
                          )
                        ) : (
                          // : renderTableFolders(folders, currentPage, 10)
                          renderTableFolders()
                        )
                      ) : selectedFolder ? (
                        renderFilesAndSubfolders(
                          selectedFolder,
                          currentPage,
                          selectedPageSize,
                        )
                      ) : (
                        renderFolders()
                      )}
                    </div>
                  </div>

                  {/* green ends */}
                </div>
                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={closePreviewModal}
                  contentLabel="Modal"
                  overlayClassName="overlay-blur"
                  className="fixed bg-white rounded-lg shadow shadow-slate-500\/30 items-center 
                  overflow-y-auto cursor-pointer border-solid border-ccc z-50 transition-right-0.3s ease-in-out modal-custom-dimensions scrollbar-thin"
                  style={{ ...modalStyles }}
                  // style={{width:`${(width * 0.9).toFixed(2)}px`,height:`${(height * 0.65).toFixed(2)}px`,
                  // marginLeft:`${(width * 0.06).toFixed(2)}px`, marginTop:`${(height * 0.2).toFixed(2)}px`}}
                  onAfterOpen={() => {
                    // Focus on the radio button when the modal opens
                    const tabularRadio = document.getElementById("tabular");
                    if (tabularRadio) {
                      tabularRadio.focus();
                    }
                  }}
                >
                  <div className="flex justify-end">
                    <button
                      className="bg-background-100 text-2xl font-semibold mr-6 mt-2 "
                      onClick={closePreviewModal}
                    >
                      {/* &times; */}
                      <img
                        src={process.env.PUBLIC_URL + "/closefile.png"}
                        alt="close"
                        className="h-4 w-4 mt-2"
                      />
                    </button>
                  </div>
                  {showPreview && dataType === "API" && (
                    <div>{renderPreviewData(apiData)}</div>
                  )}

                  {!showPreview && <p>No data available</p>}
                </Modal>
                <MetadataModal
                  isOpen={isMetaDataModalOpen}
                  closeModal={closePreviewModal}
                  metadata={metadata}
                  metadatamodalWidth={metadatamodalWidth}
                  metadatamodalHeight={metadatamodalHeight}
                  renderMetadata={renderMetadata}
                  showPreview={showPreview}
                />
                <FileDefinitionModal
                  isOpen={isColumnDataModalOpen}
                  closeModal={closePreviewModal}
                  columnData={columnData}
                  renderColumnData={renderColumnData}
                  modalWidth={CmodalWidth}
                  modalHeight={CmodalHeight}
                  showPreview={showPreview}
                />
                {/* blue Ends */}
              </div>

              <div
                className={`flex flex-row items-center justify-between p-4  ${
                  isColumnDataModalOpen ? "pointer-events-none" : ""
                }
                  ${isModalOpen ? " pointer-events-none" : ""} ${
                    showChatbot ? "pointer-events-none" : ""
                  }
                
                  ${showProfileModal ? "pointer-events-none" : ""}${
                    isMetaDataModalOpen ? "pointer-events-none" : ""
                  }`}
                style={{
                  width: `${(containerWidth * 0.98).toFixed(2)}px`,
                  height: `${(containerHeight * 0.08).toFixed(2)}px`,
                  marginTop: `${cMarginTop}px`,
                }}
              >
                <div className="flex flex-row space-x-4 ">
                  {isTableView ? (
                    <div className="flex flex-row items-center space-x-4">
                      <span className="h-4 text-[11px] font-normal">
                        {currentPage} of {totalPages}
                      </span>

                      <button
                        className={`w-5 h-4 rounded-lg cursor-pointer font-bold text-sm mt-1`}
                        onClick={handlePrevious}
                        disabled={previousButtonDisabled}
                        style={{
                          cursor: previousButtonDisabled
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <img
                          src={process.env.PUBLIC_URL + "/less-than.png"}
                          alt="Closed Folder"
                          className="w-3 h-3"
                        />
                      </button>
                      <button
                        className={`w-5 h-4 rounded-lg cursor-pointer font-bold mt-1 text-sm`}
                        onClick={handleNext}
                        disabled={nextButtonDisabled}
                        style={{
                          cursor: nextButtonDisabled
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <img
                          src={process.env.PUBLIC_URL + "/more-than.png"}
                          alt="Closed Folder"
                          className="w-3 h-3"
                        />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-row items-center space-x-4 ${
                        isColumnDataModalOpen ? "pointer-events-none" : ""
                      }
                    ${isModalOpen ? " pointer-events-none" : ""} ${
                      showChatbot ? "pointer-events-none" : ""
                    }
                  
                    ${showProfileModal ? "pointer-events-none" : ""}${
                      isMetaDataModalOpen ? "pointer-events-none" : ""
                    }`}
                    >
                      <span className="h-4 text-[11px] font-normal">
                        {/* {currentPage} of {totalPages} */}
                        {selectedFolder
                          ? ` ${currentPage} of ${subFolderTotalPages}`
                          : ` ${currentPage} of ${totalPages}`}
                      </span>

                      <button
                        className={`w-5 h-4 rounded-lg cursor-pointer font-bold text-sm mt-1  `}
                        onClick={handlePrevious}
                        disabled={previousButtonDisabled}
                        style={{
                          cursor: previousButtonDisabled
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <img
                          src={process.env.PUBLIC_URL + "/less-than.png"}
                          alt="Closed Folder"
                          className="w-3 h-3"
                        />
                      </button>
                      <button
                        className={`w-5 h-4 rounded-lg cursor-pointer font-bold mt-1 text-sm `}
                        onClick={handleNext}
                        disabled={nextButtonDisabled}
                        style={{
                          cursor: nextButtonDisabled
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <img
                          src={process.env.PUBLIC_URL + "/more-than.png"}
                          alt="Closed Folder"
                          className="w-3 h-3"
                        />
                      </button>
                    </div>
                  )}
                </div>

                {selectedFolder ? (
                  <div
                    className={`relative inline-block ${
                      isModalOpen ? "pointer-events-none" : ""
                    } ${showChatbot ? "pointer-events-none" : ""}}`}
                  >
                    <button
                      id="pageSizeDropdownButton"
                      onClick={toggleDropdown}
                      className="  text-black  text-[11px] font-normal rounded-lg  px-3 py-1 bg-gray
          text-center inline-flex items-center "
                      type="button"
                    >
                      Page Size: {selectedPageSize} {/* {totalPages > 1 && ( */}
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
                      {/* )} */}
                    </button>

                    <div
                      className={`z-50 ${isdropdownOpen ? "" : "hidden"} ${
                        isModalOpen ? "pointer-events-none" : ""
                      } bg-background-100 border border-primary divide-y divide-secondary rounded-lg shadow w-32
          dark:bg-primary absolute bottom-full mt-1`}
                    >
                      <ul
                        className="py-1 text-[11px] font-normal text-black dark:text-gray-200"
                        aria-labelledby="pageSizeDropdownButton"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(5)}
                            className="block px-2  text-start text-black w-full hover:bg-purpleshade1 
                            dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            5
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(10)}
                            className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            10
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(15)}
                            className="block px-3 py-0.5 text-start w-full text-black hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            15
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(20)}
                            className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            20
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* </div> */}
                  </div>
                ) : (
                  <div
                    className={`relative inline-block ${
                      isModalOpen ? "pointer-events-none" : ""
                    } ${showChatbot ? "pointer-events-none" : ""}}`}
                  >
                    <button
                      id="pageSizeDropdownButton"
                      onClick={toggleDropdown}
                      className="  text-black  text-[11px] font-normal rounded-lg  px-3 py-1 bg-gray
                   text-center inline-flex items-center "
                      type="button"
                    >
                      Page Size: {selectedPageSize}
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
                      {/* )} */}
                    </button>

                    <div
                      className={`z-50 ${isdropdownOpen ? "" : "hidden"} ${
                        isModalOpen ? "pointer-events-none" : ""
                      } bg-background-100 border border-primary divide-y divide-secondary rounded-lg shadow w-28
                   dark:bg-primary absolute bottom-full mt-1`}
                    >
                      <ul
                        className="py-1 text-[11px] font-normal text-black dark:text-gray-200"
                        aria-labelledby="pageSizeDropdownButton"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(5)}
                            className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            5
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(10)}
                            className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            10
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(15)}
                            className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            15
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(20)}
                            className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            20
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* </div> */}
                  </div>
                )}
              </div>
            </div>
            <div className="relative inline-block">
              <TimezoneModal
                isTimezoneModalOpen={isTimezoneModalOpen}
                setIsTimezoneModalOpen={setIsTimezoneModalOpen}
                closePreviewModal={handleCloseChatbot}
                setSelectedNavbarOption={setSelectedNavbarOption}
              />
            </div>

            <div
              style={{
                marginLeft: `${(width * 0.95).toFixed(2)}px`,
                marginTop: `${(height * 0.72).toFixed(2)}px`,
                position: "absolute",
                // zIndex: 1000,
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/chat-icon.png"}
                alt="Chat Icon"
                className={`w-12 h-12 cursor-pointer animate-floating
                  ${isColumnDataModalOpen ? "pointer-events-none" : ""}
                  ${isModalOpen ? "pointer-events-none" : ""}
                  ${isTimezoneModalOpen ? "pointer-events-none" : ""} 
                  ${showProfileModal ? "pointer-events-none" : ""}${
                    isMetaDataModalOpen ? "pointer-events-none" : ""
                  } `}
                onClick={handleChatbotIconClick}
              />
            </div>
            {showChatbot && (
              <Chatbot onClose={handleCloseChatbot} isOpen={showChatbot} />
            )}
            {showProfileModal && (
              <ProfileModal
                isOpen={showProfileModal}
                onClose={handleCloseChatbot}
              />
            )}
            <ErrorPopup
              isOpen={isPopupOpen}
              message={error}
              onClose={handleCloseChatbot}
            />
            <FolderNoDataPopup
              isOpen={isNoDataPopupOpen}
              message={noPattern}
              onClose={handleCloseChatbot}
            />
          </div>
        </div>
      )}
      {showZoomPopup && (
        <div className="fixed top-8 bg-white border border-gray-300 rounded p-2 shadow ">
          <p>Zoom Level: {zoomLevel}%</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
