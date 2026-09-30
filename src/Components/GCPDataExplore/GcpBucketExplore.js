import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Modal from "react-modal";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useAuth } from "../AuthContext";
import { useUI } from "../Context/UIContext";
import "./gcpexplore.css";
import GcpFIleBrowserPage from "./GcpFIleBrowserPage";
import GcpPreviewDataModal from "./GcpPreviewDataModal";
import useDisplayProfiler from "../hooks/useDisplayProfiler";
import { apiRequest } from "../csrfUtils";
import { API_URL } from "../ApiConfig";
import GcpMetaData from "./GcpMetaData";
import GcpColumnDefinition from "./GcpColumnDefinition";

const GcpBucketExplore = () => {
  const { zoom, isInspectMode, pixels, zoomLevel, width, height } =
    useDisplayProfiler();
  const [modalStyles, setModalStyles] = useState({
    marginTop: "110px",
    maxHeight: `calc(100% - 110px)`,
  });
  const { token, csrfToken, permissions } = useAuth();
  const navigate = useNavigate();
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
  const {
    gcpbucketId,
    gcpbucketName,
    selectedOption,
    selectedGcpAccountName,
    initialFiles,
    initialFolders,
    gcpAccountId,
    isDownloadStorage,
  } = location.state || {};
  console.log("here", gcpbucketId);
  console.log("isDownloadStorage", isDownloadStorage);
  const gcpnewFieldRef = useRef(null);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [isGcpdropdownOpen, setIsGcpDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [gcpSearchPattern, setGcpSearchPattern] = useState("");
  const [gcpCurrentPage, setGcpCurrentPage] = useState(1);
  const [gcpRowsPerPage, setGcpRowsPerPage] = useState(100);
  const [gcpServerTotalItems, setGcpServerTotalItems] = useState(0);
  const totalItemsCount = gcpServerTotalItems; // e.g., 181
  const totalPages = Math.ceil(totalItemsCount / gcpRowsPerPage) || 1; // e.g., Math.ceil(181 / 100) = 2
  const [gcpSelectedFiles, setGcpSelectedFiles] = useState([]);
  const [isGcpModalOpen, setIsGcpModalOpen] = useState(false);
  const [isGcpMetaDataModalOpen, setGcpMetaDataModalOpen] = useState(false);
  const [isGcpColumnDataModalOpen, setIsGcpColumnDataModalOpen] =
    useState(false);
  const [showGcpPreview, setShowGcpPreview] = useState(false);
  const [gcpError, setGcpError] = useState("");
  const [gcpCurrentPath, setGcpCurrentPath] = useState([]);
  const [isGcpTableView, setIsGcpTableView] = useState(true);

  const [selectedFormat, setSelectedFormat] = useState("plain_text");
  const [dataType, setDataType] = useState(null);
  const [gcpPreviewData, setGcpPreviewData] = useState([]);
  const [isGcpMenuOpen, setIsGcpMenuOpen] = useState(false);
  const [loadingGcpBucketFiles, setLoadingGcpBucketFiles] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [metaGcpData, setMetaGcpData] = useState(null);
  const [isGcpMetaDataLoading, setIsGcpMetaDataLoading] = useState(false);
  const [, setGcpFileKey] = useState(null);
  const [, setGcpBucketName] = useState("");
  const [, setGcpFileSize] = useState(null);
  const [, setGcpLastModified] = useState("");
  const [, setGcpContentType] = useState("");
  const [, setGcpEtag] = useState("");
  const [, setGcpStorageClass] = useState("");
  const [, setGcpFileMetadata] = useState({});
  const [gcpMetaDataError, setGcpMetaDataError] = useState("");
  const [gcpFilePath, setGcpFilePath] = useState("");
  const [gcpFilePrefixId, setGcpFilePrefixId] = useState(null);
  const [isGcpColumnDataFetched, setIsGcpColumnDataFetched] = useState(false);
  const [gcpFileError, setGcpFileError] = useState("");
  const [gcpColumnData, setGcpColumnData] = useState([]);
  const [gcpNewFieldName, setGcpNewFieldName] = useState("");
  const [gcpNewFieldIsMasked, setGcpNewFieldIsMasked] = useState(false);
  const [gcpSaveButtonClicked, setGcpSaveButtonClicked] = useState(false);
  const [isGcpNewFieldVisible, setisGcpNewFieldVisible] = useState(false);
  const [gcpLoading, setGcpLoading] = useState(true);

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

  console.log(gcpSelectedFiles[0]);

  let targetFile = gcpSelectedFiles[0];
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

//   const handleGcpDynamicPreview = async () => {
//     console.log("clicked", isGcpMenuOpen);

//     // 1. Guard check: Make sure a file is selected
//     if (
//       !gcpSelectedFiles ||
//       gcpSelectedFiles.length === 0 ||
//       !gcpSelectedFiles[0]
//     ) {
//       throw new Error("No file selected for preview.");
//     }

//     const targetFile = gcpSelectedFiles[0];

//     try {
//       setGcpError("");
//       setLoadingGcpBucketFiles(true);

//       // const payload = {
//       //   s3_bucket_id: bucketId,
//       //   bucket_name: bucketName,
//       //   file_key: targetFile,

//       // };
//       const payload = {
//         gcp_account_id: gcpAccountId, // Required (int)
//         gcp_bucket_id: gcpbucketId, // Optional (int) — for masking column lookup
//         bucket_name: gcpbucketName, // Required (str)
//         file_key: targetFile, // Required (str)
//         max_bytes: 2100000,                                              // Optional (int) — matching backend default
//         is_masked: typeof newFieldIsMasked !== "undefined" ? !!newFieldIsMasked : false, // Optional (bool) — defaults to False
//         format: targetFileKey.endsWith(".csv") ? "plain_text" : "json"  // Optional (str) — infers format based on extension
//       };

//       console.log("🚀 Dispatched Payload to Backend View:", payload);

//       // 2. Trigger the api request
//       // (apiRequest already returns the JSON object or throws an error)
//       const response = await apiRequest(
//         `${API_URL}/api/gcp/files/content/`,
//         "POST",
//         payload,
//       );

//       // 3. If apiRequest returned null (handled inside your utility e.g. 404, 401 redirection)
//       if (!response) {
//         throw new Error("No data returned from preview pipeline.");
//       }

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       console.log("✅ Data successfully loaded from S3:", response);

//       // setPreviewData(response);
//       if (response.error) throw new Error(response.error);

//       const cleanPreviewData = response.data || response;

//       // 2. 🛠️ Save properties & lock screen background context *before* launching layout components
//       setShowGcpPreview(cleanPreviewData);
//       setDataType("PreviewData");
//       document.body.style.overflow = "hidden"; // Locks parent scrolling immediately

//       // 3. 🛠️ Mount modal views concurrently now that cache constraints are satisfied
//       setIsGcpModalOpen(true);
//       setShowGcpPreview(true);
//       setIsFullScreenPreview(true);
//       setIsGcpMenuOpen(true);

//       return cleanPreviewData;
//     } catch (err) {
//       console.error(err);
//       setGcpError(err?.message);
//       throw err; // 🎯 CRITICAL: Must throw so the onClick catch block knows it failed!
//     } finally {
//       setLoadingGcpBucketFiles(false);
//     }
//     //   return response;

//     // } catch (err) {
//     //   console.error("❌ Catch Block Triggered Inside handleDynamicPreview:");
//     //   console.dir(err); // This prints the raw error structure to your developer tools console

//     //   // 🎯 REVEAL THE ACTUAL BACKEND ERROR:
//     //   // If your apiRequest helper threw a detailed Error object, use its description
//     //   const errorMessage = err?.message || (typeof err === 'string' ? err : "Preview service temporarily unavailable.");

//     //   // Update your component state to show the real error on screen
//     //   setError(errorMessage);

//     //   throw new Error(errorMessage);
//     // } finally {
//     //   setLoadingGcpBucketFiles(false);
//     // }
//   };

// const handleGcpDynamicPreview = async () => {
//   console.log("clicked", isGcpMenuOpen);

//   // 1. Guard check: Make sure a file is selected
//   if (
//     !gcpSelectedFiles ||
//     gcpSelectedFiles.length === 0 ||
//     !gcpSelectedFiles[0]
//   ) {
//     throw new Error("No file selected for preview.");
//   }

//   // Extract the string key/name if targetFile is an object, or use as string directly
//   const targetFile = gcpSelectedFiles[0];
//   const fileKeyString = typeof targetFile === "object" ? (targetFile.key || targetFile.name) : targetFile;

//   try {
//     setGcpError("");
//     setLoadingGcpBucketFiles(true);

//     const payload = {
//       gcp_account_id: gcpAccountId, // Required (int)
//       gcp_bucket_id: gcpbucketId, // Optional (int)
//       bucket_name: gcpbucketName, // Required (str)
//       file_key: fileKeyString, // Required (str)
//       max_bytes: 2100000, // Optional (int)
      
//       // ✅ FIX 1: Safely check if newFieldIsMasked exists in scope/state or default to false
//       is_masked: typeof gcpNewFieldIsMasked !== "undefined" ? Boolean(gcpNewFieldIsMasked) : false,
      
//       // ✅ FIX 2: Replaced undefined `targetFileKey` with `fileKeyString`
//       format: (fileKeyString && fileKeyString.endsWith(".csv")) ? "plain_text" : "json"
//     };

//     console.log("🚀 Dispatched Payload to Backend View:", payload);

//     // 2. Trigger the API request
//     const response = await apiRequest(
//       `${API_URL}/api/gcp/files/content/`,
//       "POST",
//       payload,
//     );

//     if (!response) {
//       throw new Error("No data returned from preview pipeline.");
//     }

//     if (response.error) {
//       throw new Error(response.error);
//     }

//     console.log("✅ Data successfully loaded from GCP:", response);

//     const cleanPreviewData = response.data || response;

//     setGcpPreviewData(cleanPreviewData);
//     setDataType("PreviewData");
//     document.body.style.overflow = "hidden"; // Locks parent scrolling immediately

//     setIsGcpModalOpen(true);
//     setShowGcpPreview(true);
//     setIsFullScreenPreview(true);
//     setIsGcpMenuOpen(true);

//     return cleanPreviewData;
//   } catch (err) {
//     console.error(err);
//     setGcpError(err?.message);
//     throw err; 
//   } finally {
//     setLoadingGcpBucketFiles(false);
//   }
// };

const handleGcpDynamicPreview = async () => {
  console.log("clicked", isGcpMenuOpen);

  if (
    !gcpSelectedFiles ||
    gcpSelectedFiles.length === 0 ||
    !gcpSelectedFiles[0]
  ) {
    throw new Error("No file selected for preview.");
  }

  const targetFile = gcpSelectedFiles[0];
  const fileKeyString =
    typeof targetFile === "object"
      ? targetFile.key || targetFile.name
      : targetFile;

  try {
    setGcpError("");
    setLoadingGcpBucketFiles(true);

    const payload = {
      gcp_account_id: gcpAccountId,
      gcp_bucket_id: gcpbucketId,
      bucket_name: gcpbucketName,
      file_key: fileKeyString,
      max_bytes: 2100000,
      is_masked:
        typeof gcpNewFieldIsMasked !== "undefined"
          ? Boolean(gcpNewFieldIsMasked)
          : false,
      format:
        fileKeyString && fileKeyString.endsWith(".csv") ? "plain_text" : "json",
    };

    console.log("🚀 Dispatched Payload to Backend View:", payload);

    // const response = await apiRequest(
    //   `${API_URL}/api/gcp/files/content/`,
    //   "POST",
    //   payload
    // );

    // if (!response) {
    //   throw new Error("No data returned from preview pipeline.");
    // }

    // if (response.error) {
    //   throw new Error(response.error);
    // }

    // console.log("✅ Data successfully loaded from GCP:", response);

    // // 🎯 FIX 1: Pass the entire response object so file_key and data are preserved
    // setGcpPreviewData(response);
    
    // // 🎯 FIX 2: Fixed key from "PreviewData" -> "gcpPreviewData" to match Modal render check
    // setDataType("gcpPreviewData"); 
    
    // document.body.style.overflow = "hidden";

    // setIsGcpModalOpen(true);
    // setShowGcpPreview(true);
    // setIsFullScreenPreview(true);
    // setIsGcpMenuOpen(true);

    // return response;
    // Inside handleGcpDynamicPreview...
const response = await apiRequest(
  `${API_URL}/api/gcp/files/content/`,
  "POST",
  payload
);

if (!response) {
  throw new Error("No data returned from preview pipeline.");
}

if (response.error) {
  throw new Error(response.error);
}

// 🎯 FIX: Parse the inner stringified "data" property directly
let parsedContent = response.data || response;

if (typeof parsedContent === "string") {
  try {
    parsedContent = JSON.parse(parsedContent);
  } catch (e) {
    console.warn("Could not parse data as JSON, keeping raw string:", e);
  }
}

// Set state with ONLY the extracted data payload (excluding file_key)
setGcpPreviewData(parsedContent);
setDataType("gcpPreviewData");

document.body.style.overflow = "hidden";
setIsGcpModalOpen(true);
setShowGcpPreview(true);
setIsFullScreenPreview(true);
setIsGcpMenuOpen(true);

return parsedContent;
  } catch (err) {
    console.error(err);
    setGcpError(err?.message);
    throw err;
  } finally {
    setLoadingGcpBucketFiles(false);
  }
};

  // const handleDynamicMetadata = () => {};

  // const handleGcpDynamicMetadata = async () => {
  //   const targetFile = gcpSelectedFiles[0];
  //   if (!targetFile) return;

  //   // Safely extract the file path string if targetFile is an object
  //   const targetFileKey =
  //     typeof targetFile === "object" ? targetFile.file_key : targetFile;

  //   try {
  //     // 🛠️ Mount the modal frame overlay container instantly to run our inner loading spinner state
  //     setGcpMetaDataModalOpen(true);
  //     setIsGcpMetaDataLoading(true);
  //     setGcpMetaDataError("");
  //     setMetaGcpData(null); // Purge historical execution remnants cleanly

  //     const payload = {
  //       gcp_account_id: gcpAccountId,
  //       bucket_name: gcpbucketName,
  //       file_key: targetFileKey,
  //     };

  //     console.log("📨 Fetching GcpMetadata with payload:", payload);

  //     const response = await apiRequest(
  //       `${API_URL}/api/gcp/files/details/`,
  //       "POST",
  //       payload,
  //     );

  //     if (response && !response.error) {
  //       // 🛠️ Extract from response.data to match your exact backend payload shape
  //       const dataPayload = response.data || response;

  //       if (!dataPayload || Object.keys(dataPayload).length === 0) {
  //         throw new Error("GcpMetadata response structure resolved empty.");
  //       }

  //       // Save the complete object cache
  //       setMetaGcpData(dataPayload);
  //       document.body.style.overflow = "hidden";

  //       if (typeof setDataType === "function") setDataType("Metadata");

  //       // 🎯 Route the specific response keys to your state variables exactly
  //       if (typeof setGcpFileKey === "function")
  //         setGcpFileKey(dataPayload.file_key);
  //       if (typeof setBucketName === "function")
  //         setGcpBucketName(dataPayload.bucket);
  //       if (typeof setGcpFileSize === "function")
  //         setGcpFileSize(dataPayload.size);
  //       if (typeof setGcpLastModified === "function")
  //         setGcpLastModified(dataPayload.last_modified);
  //       if (typeof setGcpContentType === "function")
  //         setGcpContentType(dataPayload.content_type);
  //       if (typeof setGcpEtag === "function") setGcpEtag(dataPayload.etag);
  //       if (typeof setGcpStorageClass === "function")
  //         setGcpStorageClass(dataPayload.storage_class);
  //       if (typeof setGcpFileMetadata === "function")
  //         setGcpFileMetadata(dataPayload.metaGcpData || {});

  //       // Fallback handlers if your layout still expects old mock state parameters
  //       if (typeof setGcpFilePath === "function")
  //         setGcpFilePath(dataPayload.file_key);
  //       if (typeof setGcpFilePrefixId === "function")
  //         setGcpFilePrefixId(dataPayload.bucket);
  //     } else {
  //       throw new Error(
  //         response?.error || "Failed to retrieve metaGcpData details.",
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Exception caught while fetching GcpMetadata:", error);
  //     if (typeof setGcpMetaDataError === "function")
  //       setGcpMetaDataError(error?.message || "Service unavailable.");
  //   } finally {
  //     setIsGcpMetaDataLoading(false);
  //   }
  // };

  const handleGcpDynamicMetadata = async () => {
  const targetFile = gcpSelectedFiles[0];

  if (!targetFile) {
    console.warn("⚠️ No GCP file selected.");
    return;
  }

  const targetFileKey =
    typeof targetFile === "object"
      ? targetFile.file_key
      : targetFile;

  if (!gcpAccountId) {
    console.error("❌ Missing GCP account ID");
    setGcpMetaDataError("GCP account ID is missing.");
    setGcpMetaDataModalOpen(true);
    return;
  }

  if (!gcpbucketName) {
    console.error("❌ Missing GCP bucket name");
    setGcpMetaDataError("GCP bucket name is missing.");
    setGcpMetaDataModalOpen(true);
    return;
  }

  if (!targetFileKey) {
    console.error("❌ Missing GCP file key");
    setGcpMetaDataError("GCP file path is missing.");
    setGcpMetaDataModalOpen(true);
    return;
  }

  try {
    setGcpMetaDataModalOpen(true);
    setIsGcpMetaDataLoading(true);
    setGcpMetaDataError("");
    setMetaGcpData(null);

    const payload = {
      gcp_account_id: gcpAccountId,
      bucket_name: gcpbucketName,
      file_key: targetFileKey,
    };

    console.log("📨 GCP Metadata Payload:", payload);

    const response = await apiRequest(
      `${API_URL}/api/gcp/files/details/`,
      "POST",
      payload
    );

    console.log("📥 GCP Metadata Response:", response);

    if (!response) {
      throw new Error("Empty response received from GCP metadata API.");
    }

    if (response.error) {
      throw new Error(response.error);
    }

    const dataPayload = response.data || response;

    if (
      !dataPayload ||
      Object.keys(dataPayload).length === 0
    ) {
      throw new Error(
        "GCP metadata response is empty."
      );
    }

    console.log(
      "✅ GCP Metadata Data:",
      dataPayload
    );

    setMetaGcpData(dataPayload);

    document.body.style.overflow = "hidden";

    if (typeof setDataType === "function")
      setDataType("Metadata");

    if (typeof setGcpFileKey === "function")
      setGcpFileKey(dataPayload.file_key);

    if (typeof setBucketName === "function")
      setGcpBucketName(dataPayload.bucket);

    if (typeof setGcpFileSize === "function")
      setGcpFileSize(dataPayload.size);

    if (typeof setGcpLastModified === "function")
      setGcpLastModified(dataPayload.last_modified);

    if (typeof setGcpContentType === "function")
      setGcpContentType(dataPayload.content_type);

    if (typeof setGcpEtag === "function")
      setGcpEtag(dataPayload.etag);

    if (typeof setGcpStorageClass === "function")
      setGcpStorageClass(dataPayload.storage_class);

    // IMPORTANT: backend returns "metadata"
    if (typeof setGcpFileMetadata === "function")
      setGcpFileMetadata(dataPayload.metadata || {});

    if (typeof setGcpFilePath === "function")
      setGcpFilePath(dataPayload.file_key);

    if (typeof setGcpFilePrefixId === "function")
      setGcpFilePrefixId(dataPayload.bucket);

  } catch (error) {

    console.error(
      "❌ Exception caught while fetching GcpMetadata:",
      error
    );

    setGcpMetaDataError(
      error?.message ||
      "Failed to retrieve GCP metadata."
    );

  } finally {
    setIsGcpMetaDataLoading(false);
  }
};

  const handleGcpFileDefinition = async () => {
    console.log("clicked");
    if (
      !gcpSelectedFiles ||
      gcpSelectedFiles.length === 0 ||
      !gcpSelectedFiles[0]
    ) {
      throw new Error("No file selected for preview.");
    }

    const targetFile = gcpSelectedFiles[0];

    try {
      setGcpFileError("");
      setIsGcpColumnDataFetched(false);
      setLoadingGcpBucketFiles(true); // Turn loader ON

      const payload = {
        gcp_bucket_id: gcpbucketId,
        file_key: targetFile,
      };

      console.log("🚀 Dispatched Payload to Backend View:", payload);

      const response = await apiRequest(
        `${API_URL}/api/gcp/column_definition/`,
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

      setGcpColumnData(finalDataArray);

      document.body.style.overflow = "hidden";

      // 🛠️ THE CRITICAL FIX: Turn loading OFF right here *before* showing the modal!
      setLoadingGcpBucketFiles(false);

      // Now trigger the display states safely
      setIsGcpColumnDataFetched(true);
      setShowGcpPreview(true);
      setIsGcpColumnDataModalOpen(true);

      return response;
    } catch (err) {
      console.error("Column Data Exception caught in Component View:", err);
      setGcpFileError(
        err?.message || "Column Definition service temporarily unavailable.",
      );
      setIsPopupOpen(true);
      setIsGcpColumnDataFetched(false);
      setLoadingGcpBucketFiles(false); // Turn loader OFF on error
      throw err;
    }
    // ⚠️ Removed the 'finally' block so it doesn't execute out of order during state batching
  };
  console.log(gcpColumnData);

  // Add a tracker to handle the empty validation state trigger

  //   const handleSave = async () => {
  //   // 1. Validate the local input field text if a new row is active
  //   if (isGcpNewFieldVisible && !newFieldName.trim()) {
  //     setGcpSaveButtonClicked(true);
  //     const inputElement = document.getElementById("newFieldNameInput");
  //     inputElement?.focus();
  //     return; // Stop execution if the field is empty
  //   }

  //   try {
  //     setLoadingGcpBucketFiles(true);
  //     setGcpSaveButtonClicked(false);

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
  //     if (isGcpNewFieldVisible && newFieldName.trim()) {
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
  //       setisGcpNewFieldVisible(false);
  //       setIsColumnDataModalOpen(false);
  //       document.body.style.overflow = "auto";
  //     } else {
  //       throw new Error(response?.error || "Failed to commit changes safely.");
  //     }
  //   } catch (error) {
  //     console.error("Exception caught inside Save Pipeline:", error);
  //     setGcpFileError(error?.message || "Service temporarily unavailable.");
  //     setIsPopupOpen(true);
  //   } finally {
  //     setLoadingGcpBucketFiles(false);
  //   }
  // };

//   const handleSave = async () => {
//     // Safe extraction variables with explicit fallbacks
//     const currentNewName = (gcpNewFieldName || "").trim();
//     const currentMaskState = !!gcpNewFieldIsMasked;

//     const targetFile = gcpSelectedFiles[0];

//     console.log(
//       "savenew",
//       currentNewName,
//       currentMaskState,
//       isGcpNewFieldVisible,
//     );

//     // 1. Validation: Ensure field isn't empty if a new row layout is active
//     if (isGcpNewFieldVisible && !currentNewName) {
//       setGcpSaveButtonClicked(true);
//       const inputElement = document.getElementById("newFieldNameInput");
//       inputElement?.focus();
//       return;
//     }

//     try {
//       setLoadingGcpBucketFiles(true);
//       setGcpSaveButtonClicked(false);

//       // 2. Map existing valid records to match backend expectations exactly
//       let updatedPayloadFields = (
//         Array.isArray(gcpColumnData) ? gcpColumnData : []
//       )
//         .filter((col) => {
//           const hasValidId =
//             col.field_id !== null &&
//             col.field_id !== undefined &&
//             col.field_id !== "";
//           const hasValidName = col.field_name && col.field_name.trim() !== "";
//           return hasValidId || hasValidName;
//         })
//         .map((col) => ({
//           field_id: col.field_id,
//           // 🛠️ BACKEND COMPATIBILITY FIX:
//           // Your backend view loop expects exactly these properties.
//           field_data_type: col.field_data_type || "text",
//           is_masked:
//             typeof col.is_masked === "string"
//               ? JSON.parse(col.is_masked)
//               : !!col.is_masked,
//         }));

//       // 3. Append the structural new entry field if it's currently active
//       // 3. Structural mapping layer for new addition entries
//       if (isGcpNewFieldVisible && currentNewName) {
//         // Find the highest numeric field_id currently in the table
//         const maxId = (
//           Array.isArray(gcpColumnData) ? gcpColumnData : []
//         ).reduce((max, col) => {
//           const idNum = parseInt(col.field_id, 10);
//           return !isNaN(idNum) && idNum > max ? idNum : max;
//         }, 0);

//         updatedPayloadFields.push({
//           field_id: maxId + 1, // 👉 Dynamically assigns the next numeric position (e.g., 3)
//           field_name: currentNewName,
//           is_masked: currentMaskState,
//           field_data_type: "text",
//         });
//       }

//       // 4. Build payload including both Prefix parameters and columns array
//       const payload = {
//         gcp_bucket_id: gcpbucketId,
//         file_key: targetFile,

//         // 🛠️ NEW PREFIX INTEGRATION: Bind state values from your parent components
//         file_separator:
//           selectedFormat === "csv"
//             ? ","
//             : selectedFormat === "tsv"
//               ? "\t"
//               : ",", // fallback example
//         is_header_available: true, // Bind directly to your structural React state variable here
//         row_data_start_number: 2, // Bind directly to your structural React state variable here

//         columns: updatedPayloadFields,
//       };

//       console.log("📨 Dispatching FULL Payload to S3 Backend:", payload);

//       const response = await apiRequest(
//         `${API_URL}/api/gcp/update_file_column_definition/`,
//         "POST",
//         payload,
//       );

//       if (response && !response.error) {
//         console.log("🎉 Layout definitions updated successfully!", response);

//         // Target your backend's "data" response key array directly
//         let freshDataArray = response.data || response.columns || [];

//         // 5. LOCAL WORKAROUND INJECTION:
//         // Since backend lacks database creation tools, we force re-add 'abc' locally
//         const checkNewSaved = freshDataArray.some(
//           (col) => col.field_name === currentNewName,
//         );
//         if (isGcpNewFieldVisible && currentNewName && !checkNewSaved) {
//           const existingBlobPrefix =
//             gcpColumnData && gcpColumnData.length > 0
//               ? gcpColumnData[0].blob_prefix || 249
//               : 249;

//           freshDataArray = [
//             ...freshDataArray,
//             {
//               field_id: `temp_${Date.now()}`,
//               field_name: currentNewName,
//               is_masked: currentMaskState,
//               field_data_type: "text",
//               blob_prefix: existingBlobPrefix,
//             },
//           ];
//         }

//         // Update local storage state variable to update UI instantly
//         setGcpColumnData(freshDataArray);

//         // Reset temporary working states safely
//         setGcpNewFieldName("");
//         setGcpNewFieldIsMasked(false);
//         setisGcpNewFieldVisible(false);
//         // setIsColumnDataModalOpen(false);
//         // setSelectedFiles([]);
//         document.body.style.overflow = "auto";
//       } else {
//         throw new Error(response?.error || "Failed to commit changes safely.");
//       }
//     } catch (error) {
//       console.error("Exception caught inside Save Pipeline:", error);
//       setGcpFileError(error?.message || "Service temporarily unavailable.");
//       setIsPopupOpen(true);
//     } finally {
//       setLoadingGcpBucketFiles(false);
//     }
//   };

const handleSave = async () => {
  const currentNewName = (gcpNewFieldName || "").trim();
  const currentMaskState = !!gcpNewFieldIsMasked;
  const targetFile = gcpSelectedFiles[0];

  let sourceColumns = Array.isArray(gcpColumnData) ? [...gcpColumnData] : [];

  // If new field input exists, add it to columns list
  if (isGcpNewFieldVisible && currentNewName) {
    sourceColumns.push({
      field_id: null,
      field_name: currentNewName,
      is_masked: currentMaskState,
      field_data_type: "text",
    });
  }

  // 1. Clean and format column objects safely
  const updatedPayloadFields = sourceColumns
    .map((col) => {
      let cleanName = col.field_name || "";

      // Clean JSON stringified field names without mangling
      try {
        if (typeof cleanName === "string" && cleanName.trim().startsWith("{")) {
          const parsed = JSON.parse(cleanName);
          cleanName = parsed.type || parsed.name || cleanName;
        }
      } catch (e) {
        // Fallback cleanup if parsing fails
        cleanName = cleanName.replace(/[\{\}"\\]/g, "").trim();
      }

      const payloadItem = {
        is_masked: !!col.is_masked,
        field_data_type: col.field_data_type || "text",
      };

      // Attach field_id for existing fields
      if (col.field_id !== null && col.field_id !== undefined && col.field_id !== "") {
        payloadItem.field_id = col.field_id;
      }

      // Attach cleaned field_name (Ensure it's not a single bracket or empty)
      if (cleanName && cleanName !== "{" && cleanName !== "}") {
        payloadItem.field_name = cleanName;
      }

      return payloadItem;
    })
    // 2. Reject invalid items where field_name is missing/corrupted AND field_id is missing
    .filter((col) => col.field_id || (col.field_name && col.field_name.length > 0));

  // Determine delimiter based on file extension
  const isJsonFile = targetFile?.endsWith(".json");
  
  // 3. Build sanitized payload
  const payload = {
    gcp_bucket_id: Number(gcpbucketId),
    file_key: targetFile,
    file_separator: isJsonFile ? "" : selectedFormat === "tsv" ? "\t" : ",",
    is_header_available: isJsonFile ? false : true,
    row_data_start_number: 1,
    columns: updatedPayloadFields,
  };

  console.log("📨 Cleaned Payload Being Sent:", payload);

  try {
    setLoadingGcpBucketFiles(true);

    const response = await apiRequest(
      `${API_URL}/api/gcp/update_file_column_definition/`,
      "POST",
      payload
    );

    if (response && !response.error) {
      console.log("🎉 Successfully saved!", response);
      setGcpColumnData(response.data || response.columns || []);
      setGcpNewFieldName("");
      setisGcpNewFieldVisible(false);
    } else {
      throw new Error(response?.error || response?.message || "Failed to save column definitions.");
    }
  } catch (error) {
    console.error("Save Error:", error);
  } finally {
    setLoadingGcpBucketFiles(false);
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
    setIsGcpTableView(true);
    setGcpCurrentPage(1);
    setGcpRowsPerPage(100);
    setGcpSearchPattern("");
    setIsGcpDropdownOpen(false);
    // setTotalPages(totalPages);
    // setIsRenderTableView(true);
  };

  const handlePlainView = () => {
    setIsGcpTableView(false);
    setGcpRowsPerPage(100);
    setGcpSearchPattern("");
    setIsGcpDropdownOpen(false);
    // setIsRenderTableView(false);
    setGcpCurrentPage(1);
    // setTotalPages(totalPages);
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
    setGcpRowsPerPage(selectedPage);
    setGcpCurrentPage(1);
  };

  const handleOptionClick = (value) => {
    const syntheticEvent = { target: { value } };
    handleDropdownChange(syntheticEvent);
    setIsGcpDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsGcpDropdownOpen((prev) => !prev);
  };

  const handleBackToDashboard = () => {
    // Navigate back to the home/container page
    // and explicitly pass the target active tab name in the state
    navigate("/container-data", {
      state: {
        activeTabFallback: "gcp",
      },
    });
  };

  const closePreviewModal = () => {
    // Close the modal
    // setMaskedData(true);
    setSelectedFormat("plain_text");
    // setIsOpen(false);
    // setSearchInputText("");
    // setIsFixedModalOpen(false);
    // setisGcpNewFieldVisible(false);
    setIsGcpModalOpen(false);

    document.body.style.overflow = "visible";
    setGcpSelectedFiles([]);
  };

  const isInteractionDisabled = isPopupOpen;
  return (
    <>
      <div className="gcp-container">
        <div className={`app-container bg-primary`}>
          <div
            className={`w-full h-full flex flex-col items-center container-padding layout-vertical-gap `}
          >
            <div
              className={`gcp-navbar-wrapper flex ${isDisabled || isBlurred || isInteractionDisabled ? "  pointer-events-none" : ""}`}
            >
              <Navbar />
            </div>
            <div className="gcp-container gcp-layout-gap">
              <div
                className={`gcp-sidebar
                                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <Sidebar />
              </div>
              <div
                className={`gcp-sub-container bg-white layout-padding  rounded-lg shadow-xl shadow-slate-400/50 overflow-hidden gcp-sub-container-gap
                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <div
                  className={`gcp-layout-backdashboard py-1 items-center px-2 flex gap-2 bucketname-text font-[400] text-purpleshade1 cursor-pointer`}
                  onClick={handleBackToDashboard}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/purple-storage-icon.png"}
                    alt="red icon"
                    className="w-4 h-4 mr-1 ml-2 "
                  />
                  {selectedGcpAccountName || "Loading..."}
                </div>
                <div
                  className={`flex-1 h-[95%]   rounded-lg flex flex-col gap-2 items-center px-4 py-2`}
                >
                  <div className="gcp-data-container items-center bg-primary rounded-lg shadow-md shadow-slate-500/50 gcp-sub-container-gap">
                    <div className="gcp-button-container  flex items-center justify-between gcp-sub-container-gap flex-shrink-0 ">
                      <div className="gcp-search-container flex items-center gap-2 rounded px-2 shadow-sm shadow-slate-500/50 bg-white flex-shrink-0">
                        <input
                          className="outline-none font-[350] text-[13px] w-full bg-transparent"
                          type="text"
                          placeholder="Search for files....."
                          onChange={(e) => setGcpSearchPattern(e.target.value)}
                          // value={inputValue}
                          value={gcpSearchPattern}
                          onFocus={() => {
                            setGcpRowsPerPage(100);
                            setGcpCurrentPage(1);
                          }}
                        />
                        <img
                          src={process.env.PUBLIC_URL + "/search_icon.png"}
                          alt="search"
                          className="w-4 h-4 ml-1 flex-shrink-0"
                        />
                      </div>

                      {/* Right Side: Functional Control Button Deck (Self-adjusting gaps) */}
                      <div className="gcp-button-wrapper flex gap-2 items-center justify-end  px-2 py-1 flex-shrink-0">
                        <button
                          className={`gcp-layout-button items-center justify-center font-medium button-text rounded-md transition-all 
                                ${
                                  !gcpSelectedFiles ||
                                  gcpSelectedFiles.length === 0 ||
                                  isGcpModalOpen ||
                                  isGcpMetaDataModalOpen ||
                                  isGcpColumnDataModalOpen
                                    ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 bg-white"
                                    : "bg-purpleshade1 text-white hover:bg-opacity-90 cursor-pointer"
                                }`}
                          disabled={
                            !gcpSelectedFiles ||
                            gcpSelectedFiles.length === 0 ||
                            isGcpModalOpen ||
                            isGcpMetaDataModalOpen ||
                            isGcpColumnDataModalOpen
                          }
                          onClick={() => {
                            handleGcpDynamicPreview()
                              .then((response) => {
                                if (response) {
                                  setShowGcpPreview(true);
                                  setIsGcpModalOpen(true);
                                }
                              })
                              .catch((error) => {
                                console.error(
                                  "Preview Exception caught in Component View:",
                                  error,
                                );
                                setGcpError(
                                  error?.message ||
                                    "Preview service temporarily unavailable.",
                                );
                                setIsPopupOpen(true);
                              });
                          }}
                          style={{
                            cursor:
                              !gcpSelectedFiles ||
                              gcpSelectedFiles.length === 0 ||
                              isGcpModalOpen ||
                              isGcpMetaDataModalOpen
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          Preview
                        </button>

                        <button
                          className={`layout-button items-center justify-center font-medium button-text rounded-md transition-all 
                            ${
                              gcpSelectedFiles.length === 0 ||
                              isGcpModalOpen ||
                              isGcpColumnDataModalOpen
                                ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 font-medium text-[13px] bg-white"
                                : "bg-purpleshade1 text-white hover:bg-opacity-90 cursor-pointer"
                            }`}
                          disabled={
                            gcpSelectedFiles.length === 0 ||
                            isGcpModalOpen ||
                            isGcpColumnDataModalOpen
                          }
                          onClick={handleGcpDynamicMetadata} // 🛠️ FIX: Fire pipeline directly instead of just opening modal blindly
                        >
                          Metadata
                        </button>

                        <button
                          className={`layout-button items-center justify-center font-medium button-text rounded-md transition-all ${
                            gcpSelectedFiles.length === 0 ||
                            isGcpModalOpen ||
                            isGcpMetaDataModalOpen
                              ? "text-purpleshade1 cursor-not-allowed rounded-md shadow-md shadow-slate-500/30 font-medium text-[13px] bg-white"
                              : "bg-purpleshade1 text-white hover:bg-opacity-90 cursor-pointer"
                          }`}
                          disabled={
                            gcpSelectedFiles.length === 0 ||
                            isGcpModalOpen ||
                            isGcpMetaDataModalOpen
                          }
                          onClick={handleGcpFileDefinition} // Handled entirely inside the async wrapper safely
                          style={{
                            cursor:
                              gcpSelectedFiles.length === 0 ||
                              isGcpModalOpen ||
                              isGcpMetaDataModalOpen
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          CDefinition
                        </button>
                      </div>
                    </div>
                    <div
                      className={`gcp-table-structure rounded-lg shadow-md shadow-slate-500/50 overflow-hidden bg-white flex-1 flex flex-col 
                       ${isInteractionDisabled ? "blur-effect pointer-events-none" : ""}`}
                    >
                      <div className="gcp-breadcrums-container bg-purpleshade1 flex items-center justify-between px-4 py-2 text-white text-[13px] font-medium">
                        <div className="flex items-center gap-2 text-xs text-white">
                          {/* 🏠 Root Bucket Breadcrumb */}
                          <button
                            onClick={() => {
                              setGcpCurrentPath([]);
                              setGcpSelectedFiles([]); // 🧹 Clear selected files on root click
                              setGcpCurrentPage(1);
                              setGcpRowsPerPage(100);
                              setGcpSearchPattern("");
                              setIsGcpDropdownOpen(false);
                            }}
                            className="font-medium "
                          >
                            {gcpbucketName || "Root"}
                          </button>

                          {/* 📂 Dynamic Path Breadcrumbs */}
                          {gcpCurrentPath.map((segment, idx) => (
                            <span key={idx} className="flex items-center gap-2">
                              <span>&gt;</span>
                              <button
                                onClick={() => {
                                  setGcpCurrentPath(
                                    gcpCurrentPath.slice(0, idx + 1),
                                  );
                                  setGcpSelectedFiles([]); // 🧹 Clear selected files when stepping back/navigating
                                  setGcpCurrentPage(1);
                                  setGcpRowsPerPage(100);
                                  setGcpSearchPattern("");
                                  setIsGcpDropdownOpen(false);
                                }}
                                className="font-medium"
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
                                isGcpTableView
                                  ? process.env.PUBLIC_URL +
                                    "/bg-tableformat.png"
                                  : process.env.PUBLIC_URL + "/tableformat.png"
                              }
                              alt="Table"
                              className={
                                isGcpTableView
                                  ? "w-6 h-7 rounded-lg  py-1 "
                                  : "w-6 h-7 rounded-lg  py-1 "
                              }
                            />
                          </button>
                          <button type="button" onClick={handlePlainView}>
                            <img
                              src={
                                !isGcpTableView
                                  ? process.env.PUBLIC_URL +
                                    "/bg-plainformat-icon.png"
                                  : process.env.PUBLIC_URL +
                                    "/plainformat-icon.png"
                              }
                              alt="Plain"
                              className={
                                !isGcpTableView
                                  ? "w-6 h-7  rounded-lg  py-1 "
                                  : "w-5 h-7  rounded-lg  py-1 "
                              }
                            />
                          </button>
                        </div>
                      </div>
                      <GcpFIleBrowserPage
                        handlePlainView={handlePlainView}
                        handleTableView={handleTableView}
                        isGcpTableView={isGcpTableView} // Let the child know which view layout state to render
                        gcpSelectedFiles={gcpSelectedFiles}
                        setGcpSelectedFiles={setGcpSelectedFiles}
                        gcpCurrentPage={gcpCurrentPage}
                        setGcpCurrentPage={setGcpCurrentPage}
                        gcpRowsPerPage={gcpRowsPerPage}
                        setGcpRowsPerPage={setGcpRowsPerPage}
                        gcpServerTotalItems={gcpServerTotalItems}
                        setGcpServerTotalItems={setGcpServerTotalItems}
                        gcpCurrentPath={gcpCurrentPath}
                        setGcpCurrentPath={setGcpCurrentPath}
                        gcpSearchPattern={gcpSearchPattern}
                        setGcpSearchPattern={setGcpSearchPattern}
                        isGcpModalOpen={isGcpModalOpen}
                        isGcpMetaDataModalOpen={isGcpMetaDataModalOpen}
                        isGcpColumnDataModalOpen={isGcpColumnDataModalOpen}
                      />
                    </div>
                    <Modal
                      isOpen={isGcpModalOpen} // Controls visibility of this wrapper container
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
                            setIsGcpModalOpen(false);
                            setShowGcpPreview(false);
                            setGcpSelectedFiles([]);
                          }}
                        >
                          <img
                            src={process.env.PUBLIC_URL + "/closefile.png"}
                            alt="close"
                            className="h-4 w-4 mt-2"
                          />
                        </button>
                      </div>

                      {/* {showGcpPreview &&
                      dataType === "gcpPreviewData" &&
                      gcpPreviewData ? (
                        <GcpPreviewDataModal
                          // 🎯 FIX 2: Swapped 'isMenuOpen' to 'isModalOpen' to align state keys

                          isGcpModalOpen={isGcpModalOpen}
                          setIsGcpModalOpen={setIsGcpModalOpen}
                          gcpPreviewData={gcpPreviewData}
                          selectedFormat={selectedFormat}
                          gcpSelectedFiles={gcpSelectedFiles}
                          gcpAccountId={gcpAccountId}
                          gcpbucketId={gcpbucketId}
                          isGcpMetaDataModalOpen={isGcpMetaDataModalOpen}
                          isGcpColumnDataModalOpen={isGcpColumnDataModalOpen}
                        />
                      ) : (
                        
                        <div className="w-full h-48 flex flex-col justify-center items-center text-black">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purpleshade1 mb-2"></div>
                          <p className="text-sm italic text-gray-500">
                            Parsing response cache data...
                          </p>
                        </div>
                      )} */}

                      {showGcpPreview &&
(dataType === "gcpPreviewData" || dataType === "PreviewData") &&
gcpPreviewData ? (
  <GcpPreviewDataModal
    isGcpModalOpen={isGcpModalOpen}
    setIsGcpModalOpen={setIsGcpModalOpen}
    gcpPreviewData={gcpPreviewData}
    selectedFormat={selectedFormat}
    gcpSelectedFiles={gcpSelectedFiles}
    gcpAccountId={gcpAccountId}
    gcpbucketId={gcpbucketId}
    isGcpMetaDataModalOpen={isGcpMetaDataModalOpen}
    isGcpColumnDataModalOpen={isGcpColumnDataModalOpen}
    selectedGcpAccountName={selectedGcpAccountName}
    isDownloadStorage={isDownloadStorage}
  />
) : (
  <div className="w-full h-48 flex flex-col justify-center items-center text-black">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purpleshade1 mb-2"></div>
    <p className="text-sm italic text-gray-500">
      Parsing response cache data...
    </p>
  </div>
)}
                    </Modal>

                    {isGcpColumnDataModalOpen && (
                      <GcpColumnDefinition
                        isGcpColumnDataModalOpen={isGcpColumnDataModalOpen}
                        setIsGcpColumnDataModalOpen={
                          setIsGcpColumnDataModalOpen
                        }
                        gcpColumnData={gcpColumnData}
                        showGcpPreview={showGcpPreview}
                        gcpSelectedFiles={gcpSelectedFiles}
                        setGcpSelectedFiles={setGcpSelectedFiles}
                        permissions={permissions}
                        gcpLoading={gcpLoading}
                        isGcpNewFieldVisible={isGcpNewFieldVisible}
                        setisGcpNewFieldVisible={setisGcpNewFieldVisible}
                        setGcpColumnData={setGcpColumnData}
                        // 🛠️ SYNCHRONIZED PARENT STATE BINDINGS:
                        gcpNewFieldName={gcpNewFieldName}
                        setGcpNewFieldName={setGcpNewFieldName}
                        gcpNewFieldIsMasked={gcpNewFieldIsMasked} // 🛠️ FIX: Now correctly referencing the value variable, not the function setter!
                        setGcpNewFieldIsMasked={setGcpNewFieldIsMasked}
                        handleSave={handleSave}
                        gcpSaveButtonClicked={gcpSaveButtonClicked}
                        closePreviewModal={closePreviewModal}
                        gcpnewFieldRef={gcpnewFieldRef}
                        isGcpColumnDataFetched={isGcpColumnDataFetched}
                      />
                    )}

                    {isGcpMetaDataModalOpen && (
                      <GcpMetaData
                        isOpen={isGcpMetaDataModalOpen}
                        closePreviewModal={closePreviewModal} // 🛠️ Simple callback to reset the boolean trigger state
                        metaGcpData={metaGcpData}
                        gcpSelectedFiles={gcpSelectedFiles}
                        gcpLoading={isGcpMetaDataLoading} // 🛠️ Pass parent loading state accurately down to target child
                        setGcpMetaDataModalOpen={setGcpMetaDataModalOpen}
                        setGcpSelectedFiles={setGcpSelectedFiles}
                      />
                    )}
                  </div>

                  {/* pagination */}
                  <div className="layout-page-container mt-2 flex items-center  justify-between px-7">
                    {/* <div className="w-full h-11 px-4 flex items-center bg-slate-800 justify-between flex-shrink-0 text-xs text-slate-500"> */}
                    <div className="flex flex-row space-x-4 ">
                      <div className="flex flex-row items-center space-x-4">
                        <span className="h-4 text-[11px] font-normal text-black">
                          {gcpCurrentPage} of {totalPages}
                        </span>

                        <button
                          className={`w-5 h-4 rounded-lg cursor-pointer font-bold text-sm mt-1 `}
                          disabled={gcpCurrentPage === 1}
                          onClick={() =>
                            setGcpCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          style={{
                            cursor:
                              gcpCurrentPage === 1 ? "not-allowed" : "pointer",
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
                          disabled={gcpCurrentPage === totalPages}
                          onClick={() =>
                            setGcpCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          style={{
                            cursor:
                              gcpCurrentPage === totalPages
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
                        isGcpModalOpen ? "pointer-events-none" : ""
                      } ${showChatbot ? "pointer-events-none" : ""}}`}
                    >
                      <button
                        id="pageSizeDropdownButton"
                        onClick={toggleDropdown}
                        className="  text-black  text-[11px] font-normal rounded-lg  px-3 py-1 bg-gray
                   text-center inline-flex items-center "
                        type="button"
                      >
                        Page Size: {gcpRowsPerPage}
                        <svg
                          className={`w-2.5 h-2 ms-3 ${
                            isGcpdropdownOpen ? "rotate-180" : ""
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
                        className={`z-1000 ${isGcpdropdownOpen ? "" : "hidden"} ${
                          isGcpModalOpen ? "pointer-events-none" : ""
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GcpBucketExplore;
