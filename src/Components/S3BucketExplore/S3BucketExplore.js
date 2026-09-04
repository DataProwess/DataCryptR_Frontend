import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Modal from "react-modal";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../csrfUtils";
import { API_URL } from "../ApiConfig";
import { useUI } from "../Context/UIContext";
// import Navbar from "../Navbar";
import Navbar from "../Navbar/Navbar";
// import Sidebar from "../Sidebar";
import Sidebar from "../Sidebar/Sidebar";
import ErrorPopup from "../ErrorPopup";
import Chatbot from "../Chatbot";
import FilesPlainView from "./FilesPlainView";
import FolderTabularView from "./FolderTabularView";
import S3FileBrowserPage from "./S3FileBrowserPage";
import S3PreviewDataModel from "./S3PreviewDataModel";
import ColumnDefinition from "./ColumnDefinition";
import MetaData from "./MetaData";
import "./s3explore.css";
import useDisplayProfiler from "../hooks/useDisplayProfiler";


const S3BucketExplore = () => {
   const {zoom,  isInspectMode ,pixels, zoomLevel, width, height} = useDisplayProfiler()
  const [modalStyles, setModalStyles] = useState({
    marginTop: "110px",
    maxHeight: `calc(100% - 110px)`,
  });
  const { token, csrfToken, permissions } = useAuth();

  const location = useLocation();
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
  const { id } = useParams();

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 2. Extract state metadata parameters passed via the navigation router transition hook

  // Destructure with clean fallback safeties so the layout won't break on a hard page refresh
  const {
    bucketId,
    bucketName,
    selectedOption,
    selectedS3AccountName,
    initialFiles,
    initialFolders,
    s3AccountId,
     isDownloadStorage,
  } = location.state || {};
  // Verify your tracking parameters
  console.log("🎯 S3 Context Loaded in Explorer:", {
    s3AccountId,
    bucketId,
    bucketName,
    selectedS3AccountName,
    isDownloadStorage
  });

  console.log("📁 Payload Files/Folders:", { initialFiles, initialFolders });
  const [currentPath, setCurrentPath] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(s3AccountId, bucketId);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [selectedS3BucketFolder, setSelectedS3BucketFolder] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMetaDataModalOpen, setMetaDataModalOpen] = useState(false);
  const [isColumnDataModalOpen, setIsColumnDataModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTableView, setIsTableView] = useState(true);
  // const [totalPages, setTotalPages] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(100);
  const [loadingS3BucketFiles, setLoadingS3BucketFiles] = useState(false);
  const [sharedFolders, setSharedFolders] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  //  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100); // Set default matching your backend (100)
  const [serverTotalItems, setServerTotalItems] = useState(0);
  const [isdropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchPattern, setSearchPattern] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [columnData, setColumnData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [dataType, setDataType] = useState(null);
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const newFieldRef = useRef(null);
  const [isColumnDataFetched, setIsColumnDataFetched] = useState(false);
  console.log("1", sharedFiles, sharedFolders);
  const [fileSeparator, setFileSeparator] = useState("");
  const [isHeaderAvailable, setIsHeaderAvailable] = useState(false);
  const [prefixText, setPrefixText] = useState("");
  const [rowDataStartNumber, setRowDataStartNumber] = useState(null);
  const totalItemsCount = serverTotalItems; // e.g., 181
  const totalPages = Math.ceil(totalItemsCount / rowsPerPage) || 1; // e.g., Math.ceil(181 / 100) = 2
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const [selectedFormat, setSelectedFormat] = useState("plain_text");
  const [metaData, setMetaData] = useState(null);
  const [isMetaDataLoading, setIsMetaDataLoading] = useState(false);
  const [metaDataError, setMetaDataError] = useState("");
  const [filePath, setFilePath] = useState("");
  const [filePrefixId, setFilePrefixId] = useState(null);
  const [, setFileKey] = useState(null);
  const [, setBucketName] = useState("");
  const [, setLastModified] = useState("");
  const [, setContentType] = useState("");
  const [, setEtag] = useState("");
  const [, setStorageClass] = useState("");
  const [, setFileMetadata] = useState({});
  const [, setFileSize] = useState(null);

  const isZoomed = !isInspectMode && zoom > 100; 
  
  useEffect(() => {
    const existingWidth = document.getElementById("width-css");
    const existingExplore = document.getElementById("explore-css");
    
    if (existingWidth) existingWidth.remove();
    if (existingExplore) existingExplore.remove();
  
    const link = document.createElement("link");
    link.rel = "stylesheet";
  
    if (isZoomed) {
      link.id = "explore-css";
      link.href = "/explore.css"; 
    } else {
      link.id = "width-css";
      link.href = "/width.css"; 
    }
  
    document.head.appendChild(link);
  
    return () => {
      const activeLink = document.getElementById(link.id);
      if (activeLink) activeLink.remove();
    };
  }, [isZoomed]);

  console.log(selectedFiles[0]);

  const isInteractionDisabled =
    isPopupOpen || isModalOpen || isColumnDataModalOpen || isMetaDataModalOpen;

  let targetFile = selectedFiles[0];
  // 2. Build the full path and file name safely
  let fullS3Key = "";

  if (typeof targetFile === "string") {
    fullS3Key = targetFile;
  } else {
    // 🛠️ Guarding against empty values with fallbacks
    const path = targetFile?.file_path || "";
    const name = targetFile?.file_name || "";

    console.log(path);

    if (path && !path.endsWith("/")) {
      fullS3Key = `${path}/${name}`;
    } else {
      fullS3Key = `${path}${name}`;
    }
  }

  console.log(fullS3Key);

  const handleDynamicPreview = async () => {
    console.log("clicked", isMenuOpen);

    // 1. Guard check: Make sure a file is selected
    if (!selectedFiles || selectedFiles.length === 0 || !selectedFiles[0]) {
      throw new Error("No file selected for preview.");
    }

    const targetFile = selectedFiles[0];

    try {
      setError("");
      setLoadingS3BucketFiles(true);

      // const payload = {
      //   s3_bucket_id: bucketId,
      //   bucket_name: bucketName,
      //   file_key: targetFile,

      // };
      const payload = {
        s3_account_id: s3AccountId, // Required (int)
        s3_bucket_id: bucketId, // Optional (int) — for masking column lookup
        bucket_name: bucketName, // Required (str)
        file_key: targetFile, // Required (str)
        // max_bytes: 2100000,                                              // Optional (int) — matching backend default
        // is_masked: typeof newFieldIsMasked !== "undefined" ? !!newFieldIsMasked : false, // Optional (bool) — defaults to False
        // format: targetFileKey.endsWith(".csv") ? "plain_text" : "json"  // Optional (str) — infers format based on extension
      };

      console.log("🚀 Dispatched Payload to Backend View:", payload);

      // 2. Trigger the api request
      // (apiRequest already returns the JSON object or throws an error)
      const response = await apiRequest(
        `${API_URL}/api/s3/files/content/`,
        "POST",
        payload,
      );

      // 3. If apiRequest returned null (handled inside your utility e.g. 404, 401 redirection)
      if (!response) {
        throw new Error("No data returned from preview pipeline.");
      }

      if (response.error) {
        throw new Error(response.error);
      }

      console.log("✅ Data successfully loaded from S3:", response);

      // setPreviewData(response);
      if (response.error) throw new Error(response.error);

      const cleanPreviewData = response.data || response;

      // 2. 🛠️ Save properties & lock screen background context *before* launching layout components
      setPreviewData(cleanPreviewData);
      setDataType("PreviewData");
      document.body.style.overflow = "hidden"; // Locks parent scrolling immediately

      // 3. 🛠️ Mount modal views concurrently now that cache constraints are satisfied
      setIsModalOpen(true);
      setShowPreview(true);
      setIsFullScreenPreview(true);
      setIsMenuOpen(true);

      return cleanPreviewData;
    } catch (err) {
      console.error(err);
      setError(err?.message);
      throw err; // 🎯 CRITICAL: Must throw so the onClick catch block knows it failed!
    } finally {
      setLoadingS3BucketFiles(false);
    }
    //   return response;

    // } catch (err) {
    //   console.error("❌ Catch Block Triggered Inside handleDynamicPreview:");
    //   console.dir(err); // This prints the raw error structure to your developer tools console

    //   // 🎯 REVEAL THE ACTUAL BACKEND ERROR:
    //   // If your apiRequest helper threw a detailed Error object, use its description
    //   const errorMessage = err?.message || (typeof err === 'string' ? err : "Preview service temporarily unavailable.");

    //   // Update your component state to show the real error on screen
    //   setError(errorMessage);

    //   throw new Error(errorMessage);
    // } finally {
    //   setLoadingS3BucketFiles(false);
    // }
  };

  // const handleDynamicMetadata = () => {};

  const handleDynamicMetadata = async () => {
    const targetFile = selectedFiles[0];
    if (!targetFile) return;

    // Safely extract the file path string if targetFile is an object
    const targetFileKey =
      typeof targetFile === "object" ? targetFile.file_key : targetFile;

    try {
      // 🛠️ Mount the modal frame overlay container instantly to run our inner loading spinner state
      setMetaDataModalOpen(true);
      setIsMetaDataLoading(true);
      setMetaDataError("");
      setMetaData(null); // Purge historical execution remnants cleanly

      const payload = {
        s3_account_id: s3AccountId,
        bucket_name: bucketName,
        file_key: targetFileKey,
      };

      console.log("📨 Fetching Metadata with payload:", payload);

      const response = await apiRequest(
        `${API_URL}/api/s3/files/details/`,
        "POST",
        payload,
      );

      if (response && !response.error) {
        // 🛠️ Extract from response.data to match your exact backend payload shape
        const dataPayload = response.data || response;

        if (!dataPayload || Object.keys(dataPayload).length === 0) {
          throw new Error("Metadata response structure resolved empty.");
        }

        // Save the complete object cache
        setMetaData(dataPayload);
        document.body.style.overflow = "hidden";

        if (typeof setDataType === "function") setDataType("Metadata");

        // 🎯 Route the specific response keys to your state variables exactly
        if (typeof setFileKey === "function") setFileKey(dataPayload.file_key);
        if (typeof setBucketName === "function")
          setBucketName(dataPayload.bucket);
        if (typeof setFileSize === "function") setFileSize(dataPayload.size);
        if (typeof setLastModified === "function")
          setLastModified(dataPayload.last_modified);
        if (typeof setContentType === "function")
          setContentType(dataPayload.content_type);
        if (typeof setEtag === "function") setEtag(dataPayload.etag);
        if (typeof setStorageClass === "function")
          setStorageClass(dataPayload.storage_class);
        if (typeof setFileMetadata === "function")
          setFileMetadata(dataPayload.metadata || {});

        // Fallback handlers if your layout still expects old mock state parameters
        if (typeof setFilePath === "function")
          setFilePath(dataPayload.file_key);
        if (typeof setFilePrefixId === "function")
          setFilePrefixId(dataPayload.bucket);
      } else {
        throw new Error(
          response?.error || "Failed to retrieve metadata details.",
        );
      }
    } catch (error) {
      console.error("Exception caught while fetching Metadata:", error);
      if (typeof setMetaDataError === "function")
        setMetaDataError(error?.message || "Service unavailable.");
    } finally {
      setIsMetaDataLoading(false);
    }
  };

  const handleFileDefinition = async () => {
    console.log("clicked");
    if (!selectedFiles || selectedFiles.length === 0 || !selectedFiles[0]) {
      throw new Error("No file selected for preview.");
    }

    const targetFile = selectedFiles[0];

    try {
      setFileError("");
      setIsColumnDataFetched(false);
      setLoadingS3BucketFiles(true); // Turn loader ON

      const payload = {
        s3_bucket_id: bucketId,
        file_key: targetFile,
      };

      console.log("🚀 Dispatched Payload to Backend View:", payload);

      const response = await apiRequest(
        `${API_URL}/api/s3/column_definition/`,
        "POST",
        payload,
      );

      if (!response) {
        throw new Error("No data returned from preview pipeline.");
      }

      if (response.error) {
        throw new Error(response.error);
      }

      console.log("✅ Data successfully loaded from S3:", response);

      const finalDataArray = Array.isArray(response)
        ? response
        : response.data || response.columns || [];

      setColumnData(finalDataArray);

      document.body.style.overflow = "hidden";

      // 🛠️ THE CRITICAL FIX: Turn loading OFF right here *before* showing the modal!
      setLoadingS3BucketFiles(false);

      // Now trigger the display states safely
      setIsColumnDataFetched(true);
      setShowPreview(true);
      setIsColumnDataModalOpen(true);

      return response;
    } catch (err) {
      console.error("Column Data Exception caught in Component View:", err);
      setFileError(
        err?.message || "Column Definition service temporarily unavailable.",
      );
      setIsPopupOpen(true);
      setIsColumnDataFetched(false);
      setLoadingS3BucketFiles(false); // Turn loader OFF on error
      throw err;
    }
    // ⚠️ Removed the 'finally' block so it doesn't execute out of order during state batching
  };
  console.log(columnData);

  // Add a tracker to handle the empty validation state trigger

  //   const handleSave = async () => {
  //   // 1. Validate the local input field text if a new row is active
  //   if (isNewFieldVisible && !newFieldName.trim()) {
  //     setSaveButtonClicked(true);
  //     const inputElement = document.getElementById("newFieldNameInput");
  //     inputElement?.focus();
  //     return; // Stop execution if the field is empty
  //   }

  //   try {
  //     setLoadingS3BucketFiles(true);
  //     setSaveButtonClicked(false);

  //     // 2. Build the field list payload array dynamically
  //     let updatedPayloadFields = columnData
  //       .filter(col => col.field_name || col.field_id) // Exclude old, empty placeholder objects
  //       .map((col) => ({
  //         field_id: col.field_id || null,
  //         field_name: col.field_name,
  //         is_masked: col.is_masked,
  //         blob_prefix: col.blob_prefix || ""
  //       }));

  //     // 3. Append your new custom entry directly to the payload if it exists
  //     if (isNewFieldVisible && newFieldName.trim()) {
  //       const existingBlobPrefix = columnData && columnData.length > 0 ? columnData[0].blob_prefix : "";
  //       updatedPayloadFields.push({
  //         field_id: null, // Indicates a new entry to the backend
  //         field_name: newFieldName.trim(),
  //         is_masked: newFieldIsMasked,
  //         blob_prefix: existingBlobPrefix
  //       });
  //     }

  //     const payload = {
  //       s3_bucket_id: parseInt(bucketId, 10),
  //       file_key: selectedFiles[0],
  //       columns: updatedPayloadFields
  //     };

  //     console.log("📨 Dispatching Request Payload to S3:", payload);

  //     const response = await apiRequest(
  //       `${API_URL}/api/s3/update_file_column_definition/`,
  //       "POST",
  //       payload
  //     );

  //     if (response && !response.error) {
  //       console.log("🎉 Layout definitions saved successfully!", response);

  //       // 4. Update the state immediately on success
  //       const freshDataArray = response.columns || response.data || updatedPayloadFields;
  //       setColumnData(freshDataArray);

  //       // Reset local and UI visibility states
  //       setNewFieldName("");
  //       setNewFieldIsMasked(false);
  //       setisNewFieldVisible(false);
  //       setIsColumnDataModalOpen(false);
  //       document.body.style.overflow = "auto";
  //     } else {
  //       throw new Error(response?.error || "Failed to commit changes safely.");
  //     }
  //   } catch (error) {
  //     console.error("Exception caught inside Save Pipeline:", error);
  //     setFileError(error?.message || "Service temporarily unavailable.");
  //     setIsPopupOpen(true);
  //   } finally {
  //     setLoadingS3BucketFiles(false);
  //   }
  // };

  const handleSave = async () => {
    // Safe extraction variables with explicit fallbacks
    const currentNewName = (newFieldName || "").trim();
    const currentMaskState = !!newFieldIsMasked;

    const targetFile = selectedFiles[0];

    console.log("savenew", currentNewName, currentMaskState, isNewFieldVisible);

    // 1. Validation: Ensure field isn't empty if a new row layout is active
    if (isNewFieldVisible && !currentNewName) {
      setSaveButtonClicked(true);
      const inputElement = document.getElementById("newFieldNameInput");
      inputElement?.focus();
      return;
    }

    try {
      setLoadingS3BucketFiles(true);
      setSaveButtonClicked(false);

      // 2. Map existing valid records to match backend expectations exactly
      let updatedPayloadFields = (Array.isArray(columnData) ? columnData : [])
        .filter((col) => {
          const hasValidId =
            col.field_id !== null &&
            col.field_id !== undefined &&
            col.field_id !== "";
          const hasValidName = col.field_name && col.field_name.trim() !== "";
          return hasValidId || hasValidName;
        })
        .map((col) => ({
          field_id: col.field_id,
          // 🛠️ BACKEND COMPATIBILITY FIX:
          // Your backend view loop expects exactly these properties.
          field_data_type: col.field_data_type || "text",
          is_masked:
            typeof col.is_masked === "string"
              ? JSON.parse(col.is_masked)
              : !!col.is_masked,
        }));

      // 3. Append the structural new entry field if it's currently active
      // 3. Structural mapping layer for new addition entries
      if (isNewFieldVisible && currentNewName) {
        // Find the highest numeric field_id currently in the table
        const maxId = (Array.isArray(columnData) ? columnData : []).reduce(
          (max, col) => {
            const idNum = parseInt(col.field_id, 10);
            return !isNaN(idNum) && idNum > max ? idNum : max;
          },
          0,
        );

        updatedPayloadFields.push({
          field_id: maxId + 1, // 👉 Dynamically assigns the next numeric position (e.g., 3)
          field_name: currentNewName,
          is_masked: currentMaskState,
          field_data_type: "text",
        });
      }

      // 4. Build payload including both Prefix parameters and columns array
      const payload = {
        s3_bucket_id: bucketId,
        file_key: targetFile,

        // 🛠️ NEW PREFIX INTEGRATION: Bind state values from your parent components
        file_separator:
          selectedFormat === "csv"
            ? ","
            : selectedFormat === "tsv"
              ? "\t"
              : ",", // fallback example
        is_header_available: true, // Bind directly to your structural React state variable here
        row_data_start_number: 2, // Bind directly to your structural React state variable here

        columns: updatedPayloadFields,
      };

      console.log("📨 Dispatching FULL Payload to S3 Backend:", payload);

      const response = await apiRequest(
        `${API_URL}/api/s3/update_file_column_definition/`,
        "POST",
        payload,
      );

      if (response && !response.error) {
        console.log("🎉 Layout definitions updated successfully!", response);

        // Target your backend's "data" response key array directly
        let freshDataArray = response.data || response.columns || [];

        // 5. LOCAL WORKAROUND INJECTION:
        // Since backend lacks database creation tools, we force re-add 'abc' locally
        const checkNewSaved = freshDataArray.some(
          (col) => col.field_name === currentNewName,
        );
        if (isNewFieldVisible && currentNewName && !checkNewSaved) {
          const existingBlobPrefix =
            columnData && columnData.length > 0
              ? columnData[0].blob_prefix || 249
              : 249;

          freshDataArray = [
            ...freshDataArray,
            {
              field_id: `temp_${Date.now()}`,
              field_name: currentNewName,
              is_masked: currentMaskState,
              field_data_type: "text",
              blob_prefix: existingBlobPrefix,
            },
          ];
        }

        // Update local storage state variable to update UI instantly
        setColumnData(freshDataArray);

        // Reset temporary working states safely
        setNewFieldName("");
        setNewFieldIsMasked(false);
        setisNewFieldVisible(false);
        // setIsColumnDataModalOpen(false);
        // setSelectedFiles([]);
        document.body.style.overflow = "auto";
      } else {
        throw new Error(response?.error || "Failed to commit changes safely.");
      }
    } catch (error) {
      console.error("Exception caught inside Save Pipeline:", error);
      setFileError(error?.message || "Service temporarily unavailable.");
      setIsPopupOpen(true);
    } finally {
      setLoadingS3BucketFiles(false);
    }
  };

  const renderBreadcrumbs = () => {};

  const renderTableFilesAndSubfolders = () => {};

  const handleDownload = () => {};
  const PageClick = () => {};

  const renderFolders = () => {
    console.log(initialFiles, initialFolders);
  };

  const renderTableFolders = () => {};

  const renderFilesAndSubfolders = () => {};

  const handleTableView = () => {
    setIsTableView(true);
    setCurrentPage(1);
    setRowsPerPage(100);
    setSearchPattern("");
    setIsDropdownOpen(false);
    // setTotalPages(totalPages);
    // setIsRenderTableView(true);
  };

  const handlePlainView = () => {
    setIsTableView(false);
    setRowsPerPage(100);
    setSearchPattern("");
    setIsDropdownOpen(false);
    // setIsRenderTableView(false);
    setCurrentPage(1);
    // setTotalPages(totalPages);
  };

  const handleBackToDashboard = () => {
    // Navigate back to the home/container page
    // and explicitly pass the target active tab name in the state
    navigate("/container-data", {
      state: {
        activeTabFallback: "s3Storage",
      },
    });
  };

  const getZoomScale = () => {
    const width = window.innerWidth;

    if (width >= 1600) return 1;
    if (width >= 1400) return 1;
    if (width >= 1200) return 1;
    if (width >= 1000) return 1;
    if (width >= 800) return 1;
    // if (width >= 700) return 1;
    // if (width >= 600) return 1;
    return 1;
  };

  // State to track scale dynamically on resize
  const [scale, setScale] = useState(getZoomScale());

  useEffect(() => {
    const handleResize = () => setScale(getZoomScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  window.addEventListener("resize", () => {
    // Calculate approximate zoom level
    const zoomLevel = Math.round((window.outerWidth / window.innerWidth) * 100);

    if (zoomLevel > 125 || zoomLevel < 75) {
      console.warn(`Optimized for 75%-125% zoom. Current zoom: ${zoomLevel}%`);
      // You can trigger a UI banner or modal here
    }
  });

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

  const handleDropdownChange = async (e) => {
    const selectedPage = parseInt(e.target.value, 10);
    // setSelectedPageSize(selectedPage);
    setRowsPerPage(selectedPage);
    setCurrentPage(1);
  };

  const handleOptionClick = (value) => {
    const syntheticEvent = { target: { value } };
    handleDropdownChange(syntheticEvent);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closePreviewModal = () => {
    // Close the modal
    // setMaskedData(true);
    setSelectedFormat("plain_text");
    // setIsOpen(false);
    // setSearchInputText("");
    // setIsFixedModalOpen(false);
    // setisNewFieldVisible(false);
    setIsModalOpen(false);

    document.body.style.overflow = "visible";
    setSelectedFiles([]);
  };
  

  return (
    <>
    {/* <div className="fixed bottom-3 right-3 z-50 bg-slate-950/90 text-white font-mono text-[10px] px-3 py-2 rounded-md border border-slate-700/50 shadow-2xl flex flex-col gap-0.5 pointer-events-none">
        <div>🔍 Zoom Level: <span className="text-emerald-400 font-bold">{zoom}%</span></div>
        <div>🖥️ Inspect Panel: <span className={`font-bold ${isInspectMode ? 'text-amber-400' : 'text-slate-400'}`}>{isInspectMode ? "OPENED / RESIZED" : "CLOSED / BASE"}</span></div>
        <p>🔍 Detected Zoom Engine: {zoom}%</p>
        <p>🖥️ Available Layout Width: {pixels.width}px</p>
        {console.log({})}
        <p>📐 Available Layout Height: {pixels.height}px</p>
        <p>💻 DevTools Open: {isInspectMode ? "YES" : "NO"}</p>
      </div> */}
      <div className="s3explore-container">
      <div className=" app-container bg-primary">
        <div className="w-full h-full flex flex-col items-center container-padding layout-vertical-gap ">
          <div
            className={` s3-navbar-wrapper  flex ${isDisabled || isBlurred || isInteractionDisabled ? "  pointer-events-none" : ""}`}>
            <Navbar />
          </div>
          <div className="s3-container layout-gap ">
            <div
              className={`s3-sidebar
                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}>
              <Sidebar />
            </div>
            <div
              className={`sub-container bg-white layout-padding  rounded-lg shadow-xl shadow-slate-400/50 overflow-hidden sub-container-gap
                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
            >
              {/* <div
                className={`origin-center transition-transform relative  ${isInteractionDisabled ? "blur-effect pointer-events-none" : ""}`}
                style={{
                  transform: `scale(${scale})`,
                  width: `${100 / scale}%`,
                  height: `${100 / scale}%`,
                }}
              > */}
                <div
                  className="layout-backdashboard py-1 items-center px-2 flex gap-2 bucketname-text font-[400] text-purpleshade1 cursor-pointer"
                  onClick={handleBackToDashboard}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/purple-storage-icon.png"}
                    alt="red icon"
                    className="w-4 h-4 mr-1 ml-2 "
                  />
                  {selectedS3AccountName || "Loading..."}
                </div>
                <div
                  className={`flex-1 h-[95%]   rounded-lg flex flex-col gap-2 items-center px-4 py-2`}
                >
                  <div className="data-container items-center bg-primary rounded-lg shadow-md shadow-slate-500/50 sub-container-gap">
                    <div className="layout-button-container  flex items-center justify-between sub-container-gap flex-shrink-0 ">
                      <div className="layout-search-container flex items-center gap-2 rounded px-2 shadow-sm shadow-slate-500/50 bg-white flex-shrink-0">
                        <input
                          className="outline-none font-[350] text-[13px] w-full bg-transparent"
                          type="text"
                          placeholder="Search for files....."
                          onChange={(e) => setSearchPattern(e.target.value)}
                          // value={inputValue}
                          value={searchPattern}
                          onFocus={() => {
                            setRowsPerPage(100);
                            setCurrentPage(1);
                          }}
                        />
                        <img
                          src={process.env.PUBLIC_URL + "/search_icon.png"}
                          alt="search"
                          className="w-4 h-4 ml-1 flex-shrink-0"
                        />
                      </div>

                      {/* Right Side: Functional Control Button Deck (Self-adjusting gaps) */}
                      <div className="layout-button-wrapper  flex gap-2 items-center justify-end  px-2 py-1 flex-shrink-0">
                        <button
                          className={`layout-button items-center justify-center font-medium button-text rounded-md transition-all 
                                ${
                                  !selectedFiles ||
                                  selectedFiles.length === 0 ||
                                  isModalOpen ||
                                  isMetaDataModalOpen ||
                                  isColumnDataModalOpen
                                    ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 bg-white"
                                    : "bg-purpleshade1 text-white hover:bg-opacity-90 cursor-pointer"
                                }`}
                          disabled={
                            !selectedFiles ||
                            selectedFiles.length === 0 ||
                            isModalOpen ||
                            isMetaDataModalOpen ||
                            isColumnDataModalOpen
                          }
                          onClick={() => {
                            handleDynamicPreview()
                              .then((response) => {
                                if (response) {
                                  setShowPreview(true);
                                  setIsModalOpen(true);
                                }
                              })
                              .catch((error) => {
                                console.error(
                                  "Preview Exception caught in Component View:",
                                  error,
                                );
                                setError(
                                  error?.message ||
                                    "Preview service temporarily unavailable.",
                                );
                                setIsPopupOpen(true);
                              });
                          }}
                          style={{
                            cursor:
                              !selectedFiles ||
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
                          className={`layout-button items-center justify-center font-medium button-text rounded-md transition-all 
                            ${
                              selectedFiles.length === 0 || isModalOpen || isColumnDataModalOpen
                                ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 font-medium text-[13px] bg-white"
                                : "bg-purpleshade1 text-white hover:bg-opacity-90 cursor-pointer"
                            }`}
                          disabled={
                            selectedFiles.length === 0 ||
                            isModalOpen ||
                            isColumnDataModalOpen
                          }
                          onClick={handleDynamicMetadata} // 🛠️ FIX: Fire pipeline directly instead of just opening modal blindly
                        >
                          Metadata
                        </button>

                        <button
                          className={`layout-button items-center justify-center font-medium button-text rounded-md transition-all ${
                            selectedFiles.length === 0 ||
                            isModalOpen ||
                            isMetaDataModalOpen
                              ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 font-medium text-[13px] bg-white"
                              : "bg-purpleshade1 text-white hover:bg-opacity-90 cursor-pointer"
                          }`}
                          disabled={
                            selectedFiles.length === 0 ||
                            isModalOpen ||
                            isMetaDataModalOpen
                          }
                          onClick={handleFileDefinition} // Handled entirely inside the async wrapper safely
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

                    <div className={`layout-table-structure rounded-lg shadow-md shadow-slate-500/50 overflow-hidden bg-white flex-1 flex flex-col 
                       ${isInteractionDisabled ? "blur-effect pointer-events-none" : ""}`}>
                        <div className="layout-breadcrums-container bg-purpleshade1 flex items-center justify-between px-4 py-2 text-white text-[13px] font-medium">
                        <div className=" flex items-center gap-2 text-xs text-white ">
                          <button
                            onClick={() => {
                              setCurrentPath([]);
                              setSelectedFiles([]);

                            }}
                            className="font-medium"
                          >
                            {bucketName || "Root"}
                          </button>
                          {currentPath.map((segment, idx) => (
                            <span key={idx} className="flex items-center gap-2">
                              <span> &gt;</span>
                              <button
                                onClick={() =>
                                  {
                                    setCurrentPath(currentPath.slice(0, idx + 1));
                                    setSelectedFiles([]);
                                  }
                                }
                                className="hover:text-white font-medium"
                              >
                                {segment}
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-nowrap items-center gap-2 sm:gap-3 flex-shrink-0">
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

                      <S3FileBrowserPage
                        handlePlainView={handlePlainView}
                        handleTableView={handleTableView}
                        isTableView={isTableView} // Let the child know which view layout state to render
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        serverTotalItems={serverTotalItems}
                        setServerTotalItems={setServerTotalItems}
                        currentPath={currentPath}
                        setCurrentPath={setCurrentPath}
                        searchPattern={searchPattern}
                        setSearchPattern={setSearchPattern}
                        isModalOpen={isModalOpen}
                        isMetaDataModalOpen={isMetaDataModalOpen}
                        isColumnDataModalOpen={isColumnDataModalOpen}
                      />
                    </div>

                    <Modal
                      isOpen={isModalOpen} // Controls visibility of this wrapper container
                      onRequestClose={closePreviewModal}
                      contentLabel="Modal"
                      overlayClassName="overlay-blur"
                      className="fixed bg-white rounded-lg shadow shadow-slate-500/30 items-center 
                          overflow-y-auto cursor-pointer border-solid border-ccc z-1000 transition-right-0.3s ease-in-out modal-custom-dimensions scrollbar-thin"
                      style={{ ...modalStyles }}
                      onAfterOpen={() => {
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

                      {showPreview &&
                      dataType === "PreviewData" &&
                      previewData ? (
                        <S3PreviewDataModel
                          // 🎯 FIX 2: Swapped 'isMenuOpen' to 'isModalOpen' to align state keys

                          isModalOpen={isModalOpen}
                          setIsModalOpen={setIsModalOpen}
                          previewData={previewData}
                          selectedFormat={selectedFormat}
                          selectedFiles={selectedFiles}
                          s3AccountId={s3AccountId}
                          bucketId={bucketId}
                          isModalOpen={isModalOpen}
                          isMetaDataModalOpen={isMetaDataModalOpen}
                          isColumnDataModalOpen={isColumnDataModalOpen}
                          selectedS3AccountName={selectedS3AccountName}
                           isDownloadStorage={isDownloadStorage}
                        />
                      ) : (
                        /* This loader handles the async delay smoothly while previewData mounts */
                        <div className="w-full h-48 flex flex-col justify-center items-center text-black">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purpleshade1 mb-2"></div>
                          <p className="text-sm italic text-gray-500">
                            Parsing response cache data...
                          </p>
                        </div>
                      )}
                    </Modal>

                    {isColumnDataModalOpen && (
                      <ColumnDefinition
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
                        closePreviewModal={closePreviewModal}
                        newFieldRef={newFieldRef}
                        isColumnDataFetched={isColumnDataFetched}
                      />
                    )}

                    {isMetaDataModalOpen && (
                      <MetaData
                        isOpen={isMetaDataModalOpen}
                        closePreviewModal={closePreviewModal} // 🛠️ Simple callback to reset the boolean trigger state
                        metaData={metaData}
                        selectedFiles={selectedFiles}
                        loading={isMetaDataLoading} // 🛠️ Pass parent loading state accurately down to target child
                        setMetaDataModalOpen={setMetaDataModalOpen}
                        setSelectedFiles={setSelectedFiles}
                      />
                    )}
                  </div>

                  {/* pagination */}
                  <div className="layout-page-container mt-2 flex items-center  justify-between px-7">
                    {/* <div className="w-full h-11 px-4 flex items-center bg-slate-800 justify-between flex-shrink-0 text-xs text-slate-500"> */}
                    <div className="flex flex-row space-x-4 ">
                      <div className="flex flex-row items-center space-x-4">
                        <span className="h-4 text-[11px] font-normal text-black">
                          {currentPage} of {totalPages}
                        </span>

                        <button
                          className={`w-5 h-4 rounded-lg cursor-pointer font-bold text-sm mt-1 `}
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          style={{
                            cursor:
                              currentPage === 1 ? "not-allowed" : "pointer",
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
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          style={{
                            cursor:
                              currentPage === totalPages
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
                      {/* ) : null} */}
                    </div>
                    <div
                      className={`relative inline-block z-1000 ${
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
                        Page Size: {rowsPerPage}
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
                        className={`z-1000 ${isdropdownOpen ? "" : "hidden"} ${
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
                              onClick={() => handleOptionClick(100)}
                              // value={100}
                              // onChange={(e) => setRowsPerPage(Number(e.target.value))}
                              className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              100
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => handleOptionClick(50)}
                              // value={50}
                              // onChange={(e) => setRowsPerPage(Number(e.target.value))}
                              className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              50
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              // value={25}
                              // onChange={(e) => setRowsPerPage(Number(e.target.value))}
                              onClick={() => handleOptionClick(25)}
                              className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              25
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              //             value={10}
                              // onChange={(e) => setRowsPerPage(Number(e.target.value))}
                              onClick={() => handleOptionClick(10)}
                              className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              10
                            </button>
                          </li>
                        </ul>
                      </div>

                      {/* </div> */}
                    </div>
                    {/* </div> */}
                  </div>
                </div>
                {/* </div> */}
                {/* </div> */}
                {/* End of Scale Container */}
              {/* </div>{" "} */}
              {/* End of Scale Wrapper */}
            </div>
          </div>
        </div>
      </div>
      

      <div
        className={`chatbot-margin  ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""} `}
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
          onClose={handleCloseChatbot} // Pass handleCloseChatbot to Chatbot
        />
      )}

      <ErrorPopup
        isOpen={isPopupOpen}
        message={error}
        onClose={handleCloseChatbot}
      />
      </div>
    </>
  );
};

export default S3BucketExplore;
