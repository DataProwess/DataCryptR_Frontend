import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "../auth";
import { API_URL } from "../ApiConfig";
import { useAuth } from "../AuthContext";
// import { useGcpAccount } from "../Context/S3AccountContext";
import { secureApiCall } from "../csrfUtils";
import { useUI } from "../Context/UIContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import NewGlobalField from "./NewGlobalField";
import ErrorPopup from "../ErrorPopup";
import { toast } from "react-toastify";
import UploadPopup from "./UploadPopup";
import DownloadPopup from "./DownloadPopup";
import "./admin.css";

const GlobalColumnConfig = ({
  selectedOption,
  isNewFieldVisible,
  setisNewFieldVisible,
  showUploadPopup,
  setShowUploadPopup,
  showDownloadPopup,
  setShowDownloadPopup,
}) => {
  const { token,csrfToken} = useAuth();
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
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  const popupRef = useRef(null);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [downloadConfigApiData, setDownloadConfigApiData] = useState(null);
  const [loadingGlobalCoumnConfig, setLoadingGlobalCoumnConfig] =
    useState(true);
  const [inputValue, setInputValue] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedMaskedFileName, setSelectedMaskedFileName] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isGlobalColumnModal, setIsGlobalColumnModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [fileName, setFileName] = useState("");
  const [showMaskingUploadPopup, setShowMaskingUploadPopup] = useState(false);
  const [columnData, setColumnData] = useState([]);
  const newFieldRef = useRef(null);
  const [isGlobalChecked, setIsGlobalChecked] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const isInteractionDisabled = showChatbot;

  const fetchGlobalFileSetting = async () => {
    setLoadingGlobalCoumnConfig(true);
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
        },
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
            responseData.message,
          );
          return;
        }
      }

      // setIsChecked(responseData.data.mask_similar_files);
      setIsGlobalChecked(responseData.data.mask_similar_files);
      setLoadingGlobalCoumnConfig(false);
    } catch (error) {
      console.error("An error occurred:", error.message);
      setLoadingGlobalCoumnConfig(false);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFileName("");
    setSelectedMaskedFileName("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setFileName(file);
    }
  };

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
        requestBody,
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
      setLoadingGlobalCoumnConfig(false);
    } catch (error) {
      console.error("Error in handleDownloadOptionChange:", error);
      toast.error("Failed to initiate download");
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value.toLowerCase();
    setInputValue(inputValue);
  };

  const fetchDownloadConfigData = async (inputValue = "") => {
    setLoadingGlobalCoumnConfig(true);
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
        },
      );

      const data = downloadConfigData.data || [];

      if (downloadConfigData.data.length === 0) {
        setNoDataMessage("No data is available");
        setDownloadConfigApiData([]);
        setLoadingGlobalCoumnConfig(false);
        setShowPreview(false); // Hide the preview if no data is available
        setTotalPages(0);
        return;
      }

      // Set the state with all fetched data
      setDownloadConfigApiData(downloadConfigData.data);
      setIsGlobalColumnModal(true);
      setLoadingGlobalCoumnConfig(false);
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

  //   const handleUploadFile = async () => {
  //     try {
  //       if (!token) {
  //         console.error("Token is not available.");
  //         return;
  //       }

  //       if (!fileName) {
  //         setError("No file selected");
  //         setIsPopupOpen(true);
  //         return;
  //       }

  //       const browseFile = new FormData();
  //       browseFile.append("file", fileName);

  //       const response = await secureApiCall(
  //         `${API_URL}/api/admin/upload-column/`,
  //         "POST",
  //         browseFile,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await response.json();
  //       const message = "File uploaded successfully";
  //       setIsPopupOpen(true);
  //       setError(message);
  //       handleClearSelectedFile();
  //       setLoadingGlobalCoumnConfig(false);
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //       setError("Failed to upload file");
  //       setIsPopupOpen(true);
  //       setLoadingGlobalCoumnConfig(false);
  //     }
  //   };

  // const handleUploadFile = async () => {
  //     console.log("clicked")
  //   try {
  //     if (!token) {
  //       console.error("Token is not available.");
  //       return;
  //     }

  //     if (!fileName) {
  //       setError("No file selected");
  //       setIsPopupOpen(true);
  //       return;
  //     }

  //     const browseFile = new FormData();
  //     browseFile.append("file", fileName);

  //     // ✅ CORRECT: Combine method, headers, and body into a single options object
  //     const response = await secureApiCall(
  //       `${API_URL}/api/admin/upload-column/`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           // Note: Do NOT manually set 'Content-Type': 'multipart/form-data'
  //           // Browser automatically sets boundary header when passing FormData
  //         },
  //         body: browseFile,
  //       }
  //     );

  //     const data = await response.json();

  //     if (response.ok) {
  //       setIsPopupOpen(true);
  //       setError("File uploaded successfully");
  //       handleClearSelectedFile();
  //       setShowUploadPopup(false); // Close modal on success
  //       fetchDownloadConfigData(); // Refresh list to reflect uploaded data
  //     } else {
  //       setError(data.message || "Failed to upload file");
  //       setIsPopupOpen(true);
  //     }
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     setError("Failed to upload file");
  //     setIsPopupOpen(true);
  //   } finally {
  //     setLoadingGlobalCoumnConfig(false);
  //   }
  // };

  const handleUploadFile = async () => {
    console.log("Upload button clicked");
    try {
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        setIsPopupOpen(true);
        return;
      }

      // Ensure 'fileName' is actually the File object from <input type="file">
      if (!fileName) {
        setError("No file selected.");
        setIsPopupOpen(true);
        return;
      }

      if (!csrfToken) {
        setError("CSRF token is missing. Please refresh the page.");
        setIsPopupOpen(true);
        return;
      }

      const browseFile = new FormData();
      // Verify whether your Django endpoint expects "file" or "excel_file"
      browseFile.append("file", fileName);

      // Call secureApiCall with correct argument positions:
      // secureApiCall(url, method, data, options)
      const result = await secureApiCall(
        `${API_URL}/api/admin/upload-column/`,
        "POST",
        browseFile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken, // Ensure CSRF token is attached
          },
        },
      );

      // Handling response (Handles both parsed JSON and raw Response objects)
      let isSuccess = false;
      let responseData = result;

      if (result instanceof Response) {
        isSuccess = result.ok;
        try {
          responseData = await result.json();
        } catch (e) {
          responseData = {};
        }
      } else {
        // apiRequest already parsed the JSON response
        isSuccess = result && !result.error && result.status !== "error";
      }

      if (isSuccess) {
        setError("File uploaded successfully");
        setIsPopupOpen(true);
        handleClearSelectedFile();
        setShowUploadPopup(false); // Close upload modal
        if (typeof fetchDownloadConfigData === "function") {
          fetchDownloadConfigData(); // Refresh list/table
        }
      } else {
        setError(
          responseData?.message ||
            responseData?.detail ||
            responseData?.error ||
            "Failed to upload file",
        );
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file: " + (error.message || "Forbidden"));
      setIsPopupOpen(true);
    } finally {
      if (typeof setLoadingGlobalCoumnConfig === "function") {
        setLoadingGlobalCoumnConfig(false);
      }
    }
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

  const handleUploadPopupClose = () => {
    setShowUploadPopup(false);
    setShowMaskingUploadPopup(false);
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
        },
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

  const handleDownloadButtonClick = () => {
    setShowDownloadPopup(true);
  };

  const handleUploadButtonClick = async () => {
    setShowUploadPopup(true);
    setShowMaskingUploadPopup(true);
    // setError(true);
  };

  const handleAddNewField = () => {
    if (!newFieldName || newFieldName.trim() === "") {
      // Handle the error if needed, e.g., set error state
      return;
    }

    // Check if there is an existing row being edited
    const existingRowIndex = downloadConfigApiData.findIndex(
      (column) => column.isEditing,
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
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      setIsGlobalChecked(!newCheckedState); // Revert state on error
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
  const handlePopupClose = () => {
    setShowDownloadPopup(false);
  };

  //   const handleDownloadSaveButtonClick = async () => {
  //     try {
  //       if (!token) {
  //         console.error("Token is not available.");
  //         // navigate("/")
  //         return;
  //       }
  //       if (!Array.isArray(downloadConfigApiData)) {
  //         console.error("Invalid downloadConfigApiData format");
  //         return;
  //       }

  //       // Prepare the request body
  //       const requestBody = {
  //         global_column_config: [
  //           ...downloadConfigApiData.map((config) => ({
  //             id: config.id,
  //             name: config.name,
  //             is_masked: JSON.parse(config.is_masked),
  //           })),
  //           ...(newFieldName.trim() !== ""
  //             ? [
  //                 {
  //                   id: "",
  //                   name: newFieldName,
  //                   is_masked: newFieldIsMasked,
  //                 },
  //               ]
  //             : []),
  //         ],
  //       };

  //       // Make the API call
  //       const response = await secureApiCall(
  //         `${API_URL}/api/admin/update-global-column/`,
  //         {
  //           method: "POST",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "X-CSRFToken": csrfToken,
  //             "Content-Type": "application/json",
  //           },
  //           credentials: "include",
  //           body: JSON.stringify(requestBody),
  //         },
  //       );

  //       // Parse the response
  //       const responseData = await response.json();

  //       // Check if the request was successful
  //       if (response.ok) {
  //         setError("Data saved successfully!");
  //         setIsPopupOpen(true);
  //         // Update the state with the latest data
  //         setDownloadConfigApiData(responseData.updatedColumnData);
  //         setLoadingGlobalCoumnConfig(false);

  //         fetchDownloadConfigData();
  //         setNewFieldName("");
  //         setNewFieldIsMasked(false);
  //         // Hide the new field row
  //         setisNewFieldVisible(false);
  //       } else {
  //         console.error(
  //           "Error updating global column config:",
  //           responseData.message,
  //         );
  //       }
  //     } catch (error) {
  //       console.error("An error occurred:", error.message);
  //     }
  //   };

  const handleDownloadSaveButtonClick = async () => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }
      if (!Array.isArray(downloadConfigApiData)) {
        console.error("Invalid downloadConfigApiData format");
        return;
      }

      // Safely convert is_masked value to boolean without throwing JSON.parse errors
      const parseMaskedValue = (val) => {
        if (typeof val === "boolean") return val;
        if (typeof val === "string") return val.toLowerCase() === "true";
        return Boolean(val);
      };

      // Prepare the request body
      const requestBody = {
        global_column_config: [
          ...downloadConfigApiData.map((config) => ({
            id: config.id,
            name: config.name,
            is_masked: parseMaskedValue(config.is_masked),
          })),
          ...(newFieldName.trim() !== ""
            ? [
                {
                  id: "",
                  name: newFieldName.trim(),
                  is_masked: Boolean(newFieldIsMasked),
                },
              ]
            : []),
        ],
      };

      // Make the API call using correct secureApiCall argument sequence:
      // secureApiCall(url, method, data, options)
      const result = await secureApiCall(
        `${API_URL}/api/admin/update-global-column/`,
        "POST",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
        },
      );

      // Parse response safely
      let responseData = result;
      let isOk = false;

      if (result instanceof Response) {
        isOk = result.ok;
        responseData = await result.json();
      } else {
        isOk = result && !result.error;
      }

      if (isOk) {
        setError("Data saved successfully!");
        setIsPopupOpen(true); // Confirmation alert popup

        // Update UI table state immediately with server return data or fallback
        if (responseData?.updatedColumnData) {
          setDownloadConfigApiData(responseData.updatedColumnData);
        }

        // Re-fetch list data to keep everything in sync
        if (typeof fetchDownloadConfigData === "function") {
          fetchDownloadConfigData();
        }

        // Reset form state & CLOSE popup
        setNewFieldName("");
        setNewFieldIsMasked(false);

        // Close the modal popup (call your state toggle or onCancel prop)
        if (typeof setisNewFieldVisible === "function") {
          setisNewFieldVisible(false);
        }
        //   if (typeof setShowNewGlobalFieldModal === "function") {
        //     setShowNewGlobalFieldModal(false);
        //   }
      } else {
        console.error(
          "Error updating global column config:",
          responseData?.message || responseData?.detail,
        );
        setError(
          responseData?.message ||
            responseData?.detail ||
            "Failed to save configuration",
        );
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("An error occurred while saving:", error.message);
      setError("Error saving data: " + error.message);
      setIsPopupOpen(true);
    } finally {
      if (typeof setLoadingGlobalCoumnConfig === "function") {
        setLoadingGlobalCoumnConfig(false);
      }
    }
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

  return (
    <>
      <div
        className={`options-data-container layout-gap flex flex-col items-center ${
          isInteractionDisabled || isDisabled || isBlurred
            ? "blur-effect pointer-events-none"
            : ""
        }`}
      >
        {/* Top Header & Toolbar Section */}
        {/* Removed overflow-y-auto, added flex-shrink-0 to prevent height collapse */}
        <div
          className={`globalbutton-container justify-center  flex flex-col flex-shrink-0 w-full  px-3 py-1 bg-newgray rounded-lg shadow-xl shadow-slate-500/30 space-y-1
        ${isNewFieldVisible || showUploadPopup || showDownloadPopup ? "blur-effect " : ""}`}
        >
          {/* Search & Checkbox Row */}
          <div className="globalcolumn-search-wrapper flex items-center justify-between  ">
            <div className="globalcolumn-search-container flex items-center px-1 bg-white rounded-md shadow-md shadow-slate-500/30 ">
              <input
                type="text"
                placeholder="Search here"
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGlobalSearchClick();
                }}
                className="globalcolumn-searchbar  outline-none ml-1 font-light text-xs flex-grow "
                value={inputValue}
                // style={{ height: "2rem" }}
              />
              <div className="flex flex-row space-x-2 items-center pr-2">
                <button
                  className="bg-background-100 text-2xl font-semibold"
                  onClick={() => {
                    setInputValue("");
                    fetchDownloadConfigData("");
                  }}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/closefile.png"}
                    alt="close"
                    className="h-4 w-4"
                  />
                </button>
                <img
                  src="search_icon.png"
                  alt="search"
                  className="cursor-pointer"
                  style={{ width: "17px", height: "17px" }}
                  onClick={handleGlobalSearchClick}
                />
              </div>
            </div>

            <div className="flex items-center px-1 rounded-md global-mask-field">
              <label className="flex h-10 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGlobalChecked}
                  onChange={handleChange}
                  disabled={loadingGlobalCoumnConfig}
                  className="mr-2 accent-purpleshade1"
                />
                <span className="text-xs font-normal">
                  Mask Similar Column Name
                </span>
              </label>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="globalcolumn-button-wrapper flex items-center  ">
            <div className="w-full flex flex-row space-x-4 items-center">
              <button
                className="add-new-button h-8 px-3 flex justify-center text-xs rounded-md cursor-pointer items-center font-medium text-white bg-purpleshade1"
                onClick={() => {
                  setisNewFieldVisible(true);
                  handleAddNewField();
                }}
              >
                Add New Field
              </button>

              <button
                className={`w-20 h-8 flex rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white ${
                  isInteractionDisabled || isDisabled || isBlurred
                    ? "blur-effect"
                    : ""
                }`}
                onClick={handleUploadButtonClick}
              >
                Upload
              </button>

              <button
                className={`w-20 h-8 flex rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white ${
                  isInteractionDisabled || isDisabled || isBlurred
                    ? "blur-effect"
                    : ""
                }`}
                onClick={handleDownloadButtonClick}
              >
                Download
              </button>

              <div className="flex-grow"></div>

              <button
                className={`w-20 h-8 flex rounded-md cursor-pointer justify-center items-center font-normal text-xs bg-purpleshade1 text-white ${
                  isInteractionDisabled || isDisabled || isBlurred
                    ? "blur-effect"
                    : ""
                }`}
                onClick={handleDownloadSaveButtonClick}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Main Column Data Table Container */}
        <div
          className={`globalcolumn-data-container flex flex-col items-center layout-gap ${isNewFieldVisible || showUploadPopup || showDownloadPopup ? "blur-effect " : ""}`}
        >
          <div className={`globalcolumn-data-header rounded-t-xl`}>
            <table className="table-design table-fixed w-full">
              <colgroup>
                <col className="w-[75%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white">
                <tr>
                  <th className="py-3 sticky top-0 px-16 rounded-tl-lg font-normal text-xs">
                    Field Name
                  </th>
                  <th className="py-3 sticky top-0 rounded-tr-lg font-normal text-xs">
                    Is Masked
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <div
            className={`globalcolumn-tabular-data  flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
          >
            <div
              className={`globalcolumn-tabular-rows py-1  overflow-auto `}
              style={{ scrollbarWidth: "thin" }}
            >
              <table
                className="table-design table-fixed w-full"
                style={{
                  // height: `calc(90% )`, // Adjust based on the desired height
                  scrollbarWidth: "thin",
                }}
              >
                <tbody className="sticky  mt-3 px-6">
                  {loadingGlobalCoumnConfig ? (
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
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="w-[25%] font-light text-xs px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <div className="flex flex-row space-x-6 px-4 items-center">
                            <IsMaskedSwitch
                              isMasked={config.is_masked.toString() === "true"}
                              onToggle={(isChecked) =>
                                handleDownloadConfigFieldChange(
                                  index,
                                  "is_masked",
                                  isChecked ? "true" : "false",
                                )
                              }
                            />
                            {config.showDeleteButton && (
                              <button
                                className="bg-background-100 text-2xl font-semibold mr-4"
                                onClick={() =>
                                  handleDeleteField(
                                    config.field_id,
                                    config.name,
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
          </div>
        </div>

        {/* Render Popups Directly */}
        {showUploadPopup && (
          <UploadPopup
            handleUploadPopupClose={handleUploadPopupClose}
            handleBrowseClick={handleBrowseClick}
            handleSampleFileDownload={handleSampleFileDownload}
            selectedFileName={selectedFileName}
            handleClearSelectedFile={handleClearSelectedFile}
            handleUploadFile={handleUploadFile}
          />
        )}

        <ErrorPopup
          isOpen={isPopupOpen}
          message={error}
          onClose={() => setIsPopupOpen(false)}
        />

        {showDownloadPopup && (
          <div className="fixed inset-0 flex justify-center z-50 items-center ">
            <DownloadPopup
              onClose={handlePopupClose}
              onSelect={handleDownloadOptionSelect}
              popupRef={popupRef}
              handlePopupClose={handlePopupClose}
            />
          </div>
        )}

        {isNewFieldVisible && (
          <div className="fixed inset-0 flex justify-center z-50 items-center ">
            <NewGlobalField
              onCancel={() => setisNewFieldVisible(false)}
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
    </>
  );
};

export default GlobalColumnConfig;
