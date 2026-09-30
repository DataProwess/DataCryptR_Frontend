import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import "./newexplore.css";
import { toast } from "react-toastify";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useUI } from "../Context/UIContext";
import { useAuth } from "../AuthContext";
import Modal from "react-modal";
import { API_URL } from "../ApiConfig";
import { secureApiCall } from "../csrfUtils";
import FileBrowserPage from "./FileBrowserPage"; // Import the new FileBrowserPage component
import SubFoldersPage from "./SubFoldersPage"; // Import the new SubFoldersPage component
import FilePreviewDataModal from "./FilePreviewDataModal"; // Import the new FilePreviewDataModal component
import FileMetaData from "./FileMetaData"; // Import the new MetadataModal component
import FileColumnDefinition from "./FileColumnDefinition"; // Import the new FileColumnDefinition component
import FolderNoDataPopup from "../FolderNoDataPopup";
import Chatbot from "../Chatbot";
import ErrorPopup from "../ErrorPopup";

const FileExplore = () => {
  const {
    isDisabled,
    isBlurred,
    isTimezoneModalOpen,
    showProfileModal,
    setIsTimezoneModalOpen,
    setShowProfileModal,
    showChatbot,
    setShowChatbot,
  } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    containerData,
    selectedStorageAccount,
    selectedStorageAccountId,
    containerName,
    selectedOption,
    isDownloadStorage,
    selectedAccountKey,
    fileShareId,
    fileShareName,
  } = location.state || {};

  console.log("FileExplore Props:", {
    containerData,
    selectedStorageAccount,
    selectedStorageAccountId,
    containerName,
    selectedOption,
    isDownloadStorage,
    selectedAccountKey,
    fileShareId,
    fileShareName,
  });
  const { token, csrfToken, permissions } = useAuth();
  const newFieldRef = useRef(null);
  const { id } = useParams();
  const [selectedFolderPath, setSelectedFolderPath] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  const [selectionId, setSelectionId] = useState(
    containerData ? containerData : fileShareId,
  );
  // eslint-disable-next-line
  const [selectionType, setSelectionType] = useState(
    containerData ? "container" : "fileShare",
  );
  const [selectedSortCriteria, setSelectedSortCriteria] =
    useState("creation_time");
  const [selectedSortOrder, setSelectedSortOrder] = useState("des");
  const [plainData, setPlainData] = useState({ subfolders: [], files: [] });
  const [selectedFolder, setSelectedFolder] = useState("");
  const [pattern, setPattern] = useState("");
  const folderId = "";
  const [subFolderTotalPages, setSubFolderTotalPages] = useState(0);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);
  const [viewType, setViewType] = useState("table");
  const [tableData, setTableData] = useState({ subfolders: [], files: [] });
  const [subFoldersAndFiles, setSubFoldersAndFiles] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [customerFiles, setCustomerFiles] = useState([]);
  const [filteredFilesFolders, setFilteredFilesFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noFolderDataMessage, setNoFolderDataMessage] = useState(false);
  const [isFolderPopup, setIsFolderPopup] = useState(false);
  const [noPattern, setNoPattern] = useState("");
  const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);
  const [noFolderData, setNoFolderData] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [isMetaDataModalOpen, setMetaDataModalOpen] = useState(false);
  const [isColumnDataModalOpen, setIsColumnDataModalOpen] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTableView, setIsTableView] = useState(true);
  const [isContainerClick, setIsContainerClick] = useState(false);
  const [isdropdownOpen, setIsDropdownOpen] = useState(false);
  const [popupFolderName, setPopupFolderName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20); // Default rows per page
  const [dataType, setDataType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("plain_text");
  const [modalStyles, setModalStyles] = useState({
    marginTop: "110px",
    maxHeight: `calc(100% - 110px)`,
  });
  const [maskedData, setMaskedData] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [filePath, setFilePath] = useState("");
  const [filePrefixId, setFilePrefixId] = useState(null);
  const [fileSeparator, setFileSeparator] = useState("");
  const [isHeaderAvailable, setIsHeaderAvailable] = useState(false);
  const [prefixText, setPrefixText] = useState("");
  const [rowDataStartNumber, setRowDataStartNumber] = useState(null);
  const [selectedData, setSelectedData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [columnData, setColumnData] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(containerData);
  const [selectedFileShare, setSelectedFileShare] = useState(fileShareId);

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

  const fetchFilesFromApi = async (
    pattern = "",
    folderPattern = "",
    page = 1,
    pageSize = selectedPageSize,
    selectionType,
    selectionId,
    selectedStorageAccount,
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
      selectedStorageAccount,
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
        requestBody,
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
          folderPattern.lastIndexOf("/"),
        );
        setNoPattern("No matching folders or files found.");
        setIsNoDataPopupOpen(true); // Open the folder no data popup
        return null;
      }

      if (folderPattern && pattern && isEmpty) {
        const parentFolderPattern = folderPattern.substring(
          0,
          folderPattern.lastIndexOf("/"),
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
        selectedSortOrder,
      );
      const sortedFolders = sortData(
        data.folder_list.map((folder, index) => ({
          id: index,
          name: folder,
        })),
        selectedSortCriteria,
        selectedSortOrder,
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
        selectedSortOrder,
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
        selectedSortOrder,
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
        selectedStorageAccount,
      );
    } catch (error) {
      console.error("Error fetching Files:", error);
    }
  };

  const fetchSubfoldersAndFiles = async (
    pattern,
    folderPattern,
    currentPage,
    selectedPageSize,
  ) => {
    console.log("🔍 fetchSubfoldersAndFiles called with:", {
      pattern,
      folderPattern,
      currentPage,
      selectedPageSize,
      selectionType,
      selectionId,
      selectedStorageAccount,
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
        selectedSortOrder,
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
        calculatedTotalPages <= 1 || currentPage >= calculatedTotalPages,
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
        selectedPageSize, // Use selected page size from state
      );
    }
    // eslint-disable-next-line
  }, ["", selectedFolderPath, currentPage, selectedPageSize]);

  const handleBackToDashboard = () => {
    const params = new URLSearchParams();

    if (selectedOption === "fileShares") {
      params.set("selectedOption", "fileShares");
      params.set("fileShareName", fileShareName);
    } else {
      params.set("selectedOption", "storageAccount");
      params.set("selectedStorageAccount", selectedStorageAccount);
    }

    navigate(`/container-data?${params.toString()}`, {
      state: {
        activeTabFallback:
          selectedOption === "fileShares" ? "fileShares" : "storageAccount",
      },
    });
  };

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
        selectedSortOrder,
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
        pageSize,
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
  const handleFileDefinition = (selectionId, selectionType) => {
    return new Promise(async (resolve, reject) => {
      if (selectedFiles.length === 0) {
        console.error(new Error("No files selected."));
        return;
      }

      const fullPath = selectedFiles[0];

    // Get only the file name from the complete path
    const filename = fullPath.split(/[\\/]/).pop();

    // Truncate only the name shown in the popup
    const displayFilename =
      filename.length > 30
        ? `${filename.substring(0, 27)}...`
        : filename;

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
            requestBody,
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
        setError(`No Data Exist in the '${displayFilename}'`);
        setIsPopupOpen(true);
        console.error("Error fetching API data:", error);
        reject(error);
      }
    });
  };

 

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
        requestBody,
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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        credentials: "include",
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
            containerData ? "container" : "fileShare",
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
        selectedSortOrder,
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
        newPageSize, // Pass the new page size to fetchSubfoldersAndFiles
      );
    }
    // Clear input value when navigating back to a parent folder or when folderPath is empty
    if (folderPath !== selectedFolder || !selectedFolder) {
      setInputValue("");
      setSearchResults(null); // Clear search results
      setSearchInput("");
    }
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
        selectedSortOrder,
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
          10,
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

  console.log("filteredFolders", filteredFolders);
  console.log("filteredFilesFolders", filteredFilesFolders);
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

  const handleFileRowClick = (file) => {
    if (file.file_id) {
      handleFileClick(file.file_name);
    } else {
      handleFolderClick(file);
    }
  };
  const handleFileClick = (file) => {
    setSelectedFiles([file]); // Ensure it sets an array with the selected file
  };



  const currentFolderData = searchResults ||
    subFoldersAndFiles[selectedFolder] || {
      subfolders: [],
      files: [],
    };

  const combineAndSortItems = (
    subfolders,
    files,
    selectedSortCriteria,
    selectedSortOrder,
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
          selectedPageSize,
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
      sortOrder,
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

  const handleDynamicPreview = (
    selectionId,
    selectionType,
    selectedStorageAccount,
  ) => {
    setApiLoading(true);
    return new Promise(async (resolve, reject) => {
      if (selectedFiles.length === 0) {
        setApiLoading(false);
        return;
      }

      const fullPath = selectedFiles[0];
      const filename = fullPath.split(/[\\/]/).pop();

// Truncate only for displaying in the popup
const displayFilename =
  filename.length > 30
    ? `${filename.substring(0, 27)}...`
    : filename;

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
          requestBody,
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
          setError(`No Data Exist in the '${displayFilename}'`);
          setIsPopupOpen(true);
          setLoading(false);
        }
      } catch (error) {
        setError(`No Data Exist in the '${displayFilename}'`);
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
            value,
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
            selectedSortOrder,
          );
        }
      } else {
        // Handle case when no pattern is provided
        if (selectedFolder) {
          response = await fetchSubfoldersAndFiles(
            "",
            selectedFolder,
            1,
            value,
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
            selectedSortOrder,
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
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

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
              selectedPageSize,
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
              selectedSortOrder,
            );
          }
        } else {
          // Handle case when no pattern is provided
          if (selectedFolder) {
            response = await fetchSubfoldersAndFiles(
              "",
              selectedFolder,
              previousPage,
              selectedPageSize,
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
              selectedSortOrder,
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
              selectedPageSize,
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
              selectedSortOrder,
            );
          }
        } else {
          // Handle case when no pattern is provided
          if (selectedFolder) {
            response = await fetchSubfoldersAndFiles(
              "",
              selectedFolder,
              nextPage,
              selectedPageSize,
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
              selectedSortOrder,
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

  const handleDropdownChange = async (e) => {
    const selectedPage = parseInt(e.target.value, 10);
    setSelectedPageSize(selectedPage);
    setCurrentPage(1);
  };

   const handleChatbotIconClick = () => {
    setShowChatbot(!showChatbot); // Toggle the showChatbot state
  };

  const isInteractionDisabled =
    isPopupOpen || isModalOpen || isColumnDataModalOpen || isMetaDataModalOpen;

  return (
    <>
      <div className="explore-container">
        <div className="app-container bg-primary">
          <div className="w-full h-full flex flex-col items-center container-padding layout-vertical-gap ">
            <div
              className={` explore-navbar-wrapper  flex ${isDisabled || isBlurred || isModalOpen || isColumnDataModalOpen || isMetaDataModalOpen ? "  pointer-events-none" : ""}`}
            >
              <Navbar />
            </div>
            <div className="explore-container layout-gap ">
              <div
                className={`explore-sidebar
                                ${isDisabled || isBlurred || isModalOpen || isColumnDataModalOpen || isMetaDataModalOpen ? "pointer-events-none" : ""}`}
              >
                <Sidebar />
              </div>
              <div
                className={`sub-container bg-white layout-padding  rounded-lg shadow-xl shadow-slate-400/50 overflow-hidden sub-container-gap
                ${isDisabled || isBlurred ? "pointer-events-none" : ""}`}
              >
                <div
                  className="layout-backdashboard py-1 items-center px-2 flex gap-2 bucketname-text font-[400] text-purpleshade1 cursor-pointer"
                  onClick={handleBackToDashboard}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/purple-storage-icon.png"}
                    alt="storage icon"
                    className="w-4 h-4 mr-1 ml-2 mt-1"
                  />

                  <span className="text-purpleshade1">
                    {selectedOption === "fileShares"
                      ? fileShareName
                      : selectedStorageAccount}
                  </span>
                </div>

                <div
                  className={`flex-1 h-[95%]   rounded-lg flex flex-col gap-2 items-center px-4 py-2`}
                >
                  <div className="data-container items-center bg-primary rounded-lg shadow-md shadow-slate-500/50 sub-container-gap">
                    <div className="layout-button-container   flex items-center justify-between sub-container-gap flex-shrink-0 ">
                      <div className="layout-search-container flex items-center gap-2 rounded px-2 shadow-sm shadow-slate-500/50 bg-white flex-shrink-0">
                        {/* <div className="flex flex-row justify-between items-center w-72 h-9 rounded  p-1 shadow-lg shadow-lightgray-100/30  bg-white"> */}
                        <input
                          className="outline-none ml-0 font-[350] text-[13px] search-bar   "
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
                        {/* </div> */}
                      </div>
                      <div className="flex-grow"></div>
                      <div className="layout-button-wrapper space-x-1   flex gap-2 items-center justify-end  px-2 py-1 flex-shrink-0">
                        <button
                          className={`button-base ${
                            selectedFiles.length === 0 ||
                            isMetaDataModalOpen ||
                            isColumnDataModalOpen
                              ? "text-purpleshade1 cursor-not-allowed  rounded-md shadow-md shadow-slate-500/30  font-medium  text-[13px] bg-white"
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
                      className={`layout-table-structure rounded-lg shadow-md shadow-slate-500/50 overflow-hidden bg-white flex-1 flex flex-col ${isInteractionDisabled ? "blur-effect pointer-events-none" : ""} `}
                    >
                      <div className={`layout-breadcrums-container bg-purpleshade1 flex items-center justify-between px-4 py-2 text-white text-[13px] font-medium`}>
                        <div className={` flex items-center gap-2 text-xs text-white `}>
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
                          <span className={`mr-1 `}> &gt; </span>{" "}
                          {renderBreadcrumbs()}
                        </div>
                        <div className={`flex flex-nowrap items-center gap-2 sm:gap-3 flex-shrink-0 ${isDisabled || isBlurred || isModalOpen || isColumnDataModalOpen || isMetaDataModalOpen ? "pointer-events-none" : ""}`}>
                          <button type="button" onClick={handleTableView}>
                            <img
                              src={
                                isTableView
                                  ? process.env.PUBLIC_URL +
                                    "/bg-tableformat.png"
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
                                  : process.env.PUBLIC_URL +
                                    "/plainformat-icon.png"
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
                      {/* {loading ? (
                        <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6">
                          <img
                            src={process.env.PUBLIC_URL + "/loadergif.gif"}
                            alt="Loading"
                            className="animate-spin w-8 h-8"
                          />

                          <p className="text-logintext font-[350] text-[13px] animate-pulse">
                            Just a moment...
                          </p>
                        </div> */}
                      {selectedFolder ? (
                        <SubFoldersPage
                          selectedFolder={selectedFolder}
                          subfolders={currentFolderData.subfolders}
                          files={currentFolderData.files}
                          selectedFiles={selectedFiles}
                          setSelectedFiles={setSelectedFiles}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          isTableView={isTableView}
                          handleTableView={handleTableView}
                          handlePlainView={handlePlainView}
                          handleFolderClick={handleFolderClick}
                          handleFileClick={handleFileClick}
                          handleFileRowClick={handleFileRowClick}
                          handleSortAscending={handleSortAscending}
                          handleSortDescending={handleSortDescending}
                          totalPages={subFolderTotalPages}
                          handleFolderSort={handleFolderSort}
                          folderId={selectedFolder}
                        />
                      ) : (
                        <FileBrowserPage
                          filteredFilesFolders={filteredFilesFolders}
                          filteredFolders={filteredFolders}
                          handleFolderClick={handleFolderClick}
                          handlePlainView={handlePlainView}
                          handleTableView={handleTableView}
                          isTableView={isTableView}
                          selectedFiles={selectedFiles}
                          setSelectedFiles={setSelectedFiles}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          rowsPerPage={rowsPerPage}
                          setRowsPerPage={setRowsPerPage}
                          handleSortAscending={handleSortAscending}
                          handleSortDescending={handleSortDescending}
                          totalPages={totalPages}
                          handleFileRowClick={handleFileRowClick}
                          handleFileClick={handleFileClick}
                          handleSearchOkClick={handleSearchOkClick}
                          isModalOpen={isModalOpen}
                          isMetaDataModalOpen={isMetaDataModalOpen}
                          isColumnDataModalOpen={isColumnDataModalOpen}
                        />
                      )}
                    </div>

                    <Modal
                      isOpen={isModalOpen}
                      onRequestClose={() => {
                        setIsModalOpen(false);
                        setShowPreview(false);
                        setSelectedFiles([]);
                      }}
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
                          className="bg-background-100 text-2xl font-semibold mr-4 mt-1 mb-1"
                          onClick={() => {
                            // 🎯 FIX 1: Explicitly force both state controls to false on click
                            setIsModalOpen(false);
                            setShowPreview(false);
                            setSelectedFiles([]);
                          }}
                        >
                          <img
                            src={process.env.PUBLIC_URL + "/closefile.png"}
                            alt="close"
                            className="h-4 w-4 mt-2"
                          />
                        </button>
                      </div>

                      {showPreview && dataType === "API" && (
                        <FilePreviewDataModal
                          // 🎯 FIX 2: Swapped 'isMenuOpen' to 'isModalOpen' to align state keys

                          isModalOpen={isModalOpen}
                          setIsModalOpen={setIsModalOpen}
                          apiData={apiData}
                          selectedFormat={selectedFormat}
                          setSelectedFormat={setSelectedFormat}
                          selectedFiles={selectedFiles}
                          selectedStorageAccountId={selectedStorageAccountId}
                          containerName={containerName}
                          containerData={containerData}
                          isMetaDataModalOpen={isMetaDataModalOpen}
                          isColumnDataModalOpen={isColumnDataModalOpen}
                          selectedStorageAccount={selectedStorageAccount}
                          isDownloadStorage={isDownloadStorage}
                          fileShareId={fileShareId}
                          fileShareName={fileShareName}
                          selectedAccountKey={selectedAccountKey}
                          selectionId={selectionId}
                          selectionType={selectionType}
                          handleDynamicPreview={handleDynamicPreview}
                          apiLoading={apiLoading}
                          setApiLoading={setApiLoading}
                          isHeaderAvailable={isHeaderAvailable}
                          setIsHeaderAvailable={setIsHeaderAvailable}
                        />
                      )}
                    </Modal>
                    <FileMetaData
                      isOpen={isMetaDataModalOpen}
                      closeModal={() => setMetaDataModalOpen(false)}
                      metaData={metadata}
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                      loading={loading}
                    />
                    {/* <FileColumnDefinition
                      isOpen={isColumnDataModalOpen}
                      closeModal={() => setIsColumnDataModalOpen(false)}
                      columnData={columnData}
                      showPreview={showPreview}
                    /> */}
                    {isColumnDataModalOpen && (
                      <FileColumnDefinition
                        isColumnDataModalOpen={isColumnDataModalOpen}
                        setIsColumnDataModalOpen={setIsColumnDataModalOpen}
                        columnData={columnData}
                        showPreview={showPreview}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        permissions={permissions}
                        loading={loading}
                        isNewFieldVisible={isNewFieldVisible}
                        setisNewFieldVisible={setisNewFieldVisible}
                        setColumnData={setColumnData}
                        // 🛠️ SYNCHRONIZED PARENT STATE BINDINGS:
                        newFieldName={newFieldName}
                        setNewFieldName={setNewFieldName}
                        newFieldIsMasked={newFieldIsMasked} // 🛠️ FIX: Now correctly referencing the value variable, not the function setter!
                        setNewFieldIsMasked={setNewFieldIsMasked}
                        handleSave={handleSave}
                        saveButtonClicked={saveButtonClicked}
                        // closePreviewModal={is}
                        setError={setError}
                        error={error}
                        isPopupOpen={isPopupOpen}
                        setIsPopupOpen={setIsPopupOpen}
                        newFieldRef={newFieldRef}
                        // isColumnDataFetched={isColumnDataFetched}
                      />
                    )}
                  </div>

                  <div
                    className={`layout-page-container  mt-2 flex items-center  justify-between px-2 `}
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
                          Page Size: {selectedPageSize}{" "}
                          {/* {totalPages > 1 && ( */}
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
              </div>
            </div>
          </div>
        </div>
        <div
          className={`chatbot-margin  ${isDisabled || isBlurred || isModalOpen || isColumnDataModalOpen || isMetaDataModalOpen ? "pointer-events-none" : ""} `}
          // style={{
          //   right: "20px",
          //   bottom: "80px",
          // }}
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
            onClose={()=> setShowChatbot(false)} // Pass handleCloseChatbot to Chatbot
          />
        )}

        <ErrorPopup
          isOpen={isPopupOpen}
          message={error}
          onClose={() => {
    setIsPopupOpen(false);
    setSelectedFiles([]);
  }}
        />
        <FolderNoDataPopup
          isOpen={isNoDataPopupOpen}
          message={noPattern}
          onClose={() => setIsNoDataPopupOpen(false)}
        />
      </div>
    </>
  );
};

export default FileExplore;
