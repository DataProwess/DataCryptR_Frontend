import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "./auth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { toast } from "react-toastify";
import { API_URL } from "./ApiConfig";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Chatbot from "./Chatbot";
import ProfileModal from "./ProfileModal";
import TimezoneModal from "./TimeZoneModal";
import ErrorPopup from "./ErrorPopup";
import { apiRequest } from "./csrfUtils";
import "./reports.css";
import { useUI } from "./Context/UIContext";
import { useAuth } from "./AuthContext";

// const API_URL = "http://74.235.117.56:80"
// const API_URL = "http://127.0.0.1:8000";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const Reports = () => {
  const { token, csrfToken, permissions } = useAuth();
  const { isDisabled, isBlurred } = useUI();
  const [filteredStartDate, setFilteredStartDate] = useState("");
  const [filteredEndDate, setFilteredEndDate] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [token, setToken] = useState(null);
  // const [csrfToken, setCsrfToken] = useState(null);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // eslint-disable-next-line
  // const [showDateFilter, setShowDateFilter] = useState(false);
  // eslint-disable-next-line
  const newFieldRef = useRef(null);
  // eslint-disable-next-line
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userInputQuery, setUserInputQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line
  const [isDataArray, setIsDataArray] = useState(false);

  // eslint-disable-next-line
  const [columnData, setColumnData] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Global Column Config");
  const [downloadConfigApiData, setDownloadConfigApiData] = useState(null);
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  // eslint-disable-next-line
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  // eslint-disable-next-line
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  // const [permissions, setPermissions] = useState([]);

  // eslint-disable-next-line
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [showChatbot, setShowChatbot] = useState(false);

  // eslint-disable-next-line
  const [viewportDimensions, setViewportDimensions] = useState(
    getViewportDimensions(),
  );

  // Update dimensions when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions(getViewportDimensions());
    };
    // Set CSS variables dynamically
    document.documentElement.style.setProperty(
      "--vw",
      `${window.innerWidth}px`,
    );
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight}px`,
    );

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // useEffect(() => {
  //   // Simulate a delay of 1000ms (1 second)
  //   const timer = setTimeout(() => {
  //     setLoading(false); // After 1 second, loading is false
  //   }, 3000);

  //   // Clean up the timer when the component unmounts
  //   return () => clearTimeout(timer);
  // }, []);

  // useEffect(() => {
  //   // Fetch the token and set it in the state
  //   const fetchToken = async () => {
  //     try {
  //       const fetchedToken = await authService.getToken();
  //       const dataObject = JSON.parse(fetchedToken);

  //       // Access the token property from the data object
  //       const token = dataObject.data.token;
  //       const permissions = dataObject.data.permissions;
  //       setToken(token);
  //       setPermissions(permissions);
  //       const csrfToken = authService.getCsrfToken();
  //       setCsrfToken(csrfToken)
  //     } catch (error) {
  //       console.error("Token error:", error);
  //     }
  //   };

  //   // Call the fetchToken
  //   fetchToken();
  // }, []);

  const SeeUserReports = permissions.includes("SeeUserReports");

  // eslint-disable-next-line
  const DownloadPopup = ({ onSelect, onClose }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white px-4 py-2 rounded-lg shadow-top z-50 w-72 h-36  flex flex-col space-y-3 ml-56 ">
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
            <p className="font-medium text-sm text-black">Download ?</p>
            <div className="flex space-x-4 justify-center">
              <button
                className="w-24  h-6 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
        justify-center items-center font-medium text-[13px] bg-purpleshade1
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
        justify-center items-center font-medium text-[13px] bg-purpleshade1
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
      </div>
    );
  };
  const handleDownloadButtonClick = () => {
    setShowDownloadPopup(true);
  };

  // eslint-disable-next-line
  const handlePopupClose = () => {
    
    setShowDownloadPopup(false);
  };
  // eslint-disable-next-line
  const handleDownloadOptionSelect = async (option) => {
    try {
      // Call the download function directly
      await handleDownloadOptionChange(option);

      // Close the popup
      setShowDownloadPopup(false);
    } catch (error) {
      console.error("Error in handleDownloadOptionSelect:", error);
      toast.error("Failed to initiate download");
    }
  };

  const handleDownloadOptionChange = async (selectedOption) => {
    try {
      let configType, requestBody;

      if (selectedOption === "Global") {
        configType = "global";
        requestBody = { config_type: configType };
      } else if (selectedOption === "Local") {
        configType = "file_specific";
        requestBody = { config_type: configType };
      }

      const response = await apiRequest(
        `${API_URL}/api/admin/download-column/`,
        "POST",
        requestBody,
      );

      // ✅ response is already a Blob
      const url = window.URL.createObjectURL(response);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `downloaded-${configType}-file.xlsx`);
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in handleDownloadOptionChange:", error);
      toast.error("Failed to initiate download");
    }
  };

  // eslint-disable-next-line
  const handleAddNewField = () => {
    if (!newFieldName.trim()) {
      return; // Don't add a new field if the field name is empty
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

    // Clear the input fields after adding/updating
    setNewFieldName("");
    setNewFieldIsMasked(false);
  };

  const handleUploadButtonClick = async () => {
    // Trigger the file input click
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files[0];

      if (!file) {
        // Handle case where no file is selected
        console.error("No file selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      // ✅ SECURE - Using apiRequest utility with automatic CSRF handling
      const response = await apiRequest(
        `${API_URL}/api/admin/upload-column/`,
        "POST",
        formData,
        {
          headers: {
            // Don't set Content-Type for FormData, let browser set it
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Handle successful upload
      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Error in handleFileChange:", error);
      toast.error("Failed to upload file");
    }
  };

  const fetchUserReport = async (
    page = currentPage,
    size = pageSize,
    start = startDate,
    end = endDate,
    query = userInputQuery,
  ) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ SECURE - Using apiRequest utility with automatic CSRF handling
      const responseData = await apiRequest(
        `${API_URL}/api/admin/get-user-reports/`,
        "POST",
        {
          page_number: page,
          page_size: size,
          start_date: start,
          end_date: end,
          search_query: query,
        },
      );

      const data = responseData.data || [];
      const total = data.length > 0 ? data[data.length - 1].total : 0;
      setData(data);
      setIsDataArray(true);
      setTotalPages(Math.ceil(total / size));
      setLoading(false);
      return data; // Return the data fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      return []; // Return an empty array on error
    }
  };

  useEffect(() => {
    const newTotalPages = Math.ceil(data.length / pageSize);
    setTotalPages(newTotalPages);
    // eslint-disable-next-line
  }, [pageSize]);

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to the first page when changing page size
    fetchUserReport(1, newSize, startDate, endDate, userInputQuery); // Pass newSize to fetchUserReport
  };

  const fetchDownloadConfigData = async (searchQuery = "") => {
    setLoading(true);
    try {
      // Simulate network delay for demonstration purposes
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ SECURE - Using apiRequest utility with automatic CSRF handling
      const downloadConfigData = await apiRequest(
        `${API_URL}/api/admin/list-global-column/`,
        "POST",
        { search_query: searchQuery },
      );

      const data = downloadConfigData.data || [];

      // Update state with fetched data
      setDownloadConfigApiData(data);
      const total = data.length > 0 ? data[data.length - 1].total : 0;
      setTotalPages(Math.ceil(total / pageSize));

      setLoading(false);
      return data; // Return data to be used by caller
    } catch (error) {
      console.error("Error in fetchDownloadConfigData:", error);
      setLoading(false);
      return []; // Return an empty array on error
    }
  };

  useEffect(() => {
    // Check if the "Global Column Config" tab is active before making the API call
    if (selectedOption === "Global Column Config") {
      fetchDownloadConfigData();
    }
    // eslint-disable-next-line
  }, [token, selectedOption]);
  
  // Ensure the page is updated when page size changes
  useEffect(() => {
    const newTotalPages = Math.ceil(data.length / pageSize);
    setTotalPages(newTotalPages);
    // Refetch data with new page size
    fetchUserReport(1, pageSize, startDate, endDate, userInputQuery);
    // eslint-disable-next-line
  }, [pageSize]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      fetchUserReport(
        nextPage,
        pageSize,
        filteredStartDate,
        filteredEndDate,
        userInputQuery,
      );
      return nextPage;
    });
  };

  // Handle Previous Page button click
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => {
      const previousPage = prevPage > 1 ? prevPage - 1 : 1;
      fetchUserReport(
        previousPage,
        pageSize,
        filteredStartDate,
        filteredEndDate,
        userInputQuery,
      );
      return previousPage;
    });
  };

  const handleDownloadConfigFieldChange = (index, field, value) => {
    setDownloadConfigApiData((prevData) => {
      const newData = prevData.map((config, i) => {
        if (i === index) {
          return {
            ...config,
            id: config.id, // Keep the same id
            [field]: value, // Update the specific field
          };
        }
        return config;
      });
      return newData;
    });
  };

  const handleDeleteField = (fieldId, fieldName) => {
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${fieldName}"?`)) {
      // Remove the field from the state
      setDownloadConfigApiData((prevData) =>
        prevData.filter((field) => field.id !== fieldId),
      );
    }
  };

  // const handleDownload = async () => {
  //   setIsDownloaded(false);
  //   const formattedStartDate = startDate ? startDate.format("YYYY-MM-DD") : "";
  //   const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : "";

  //   let payloadStartDate = formattedStartDate;
  //   let payloadEndDate = formattedEndDate;

  //   if (formattedStartDate === formattedEndDate) {
  //     payloadStartDate = "";
  //     payloadEndDate = "";
  //   }

  //   try {
  //     // ✅ SECURE - Using apiRequest utility with automatic CSRF handling
  //     const apiResponse = await apiRequest(
  //       `${API_URL}/api/admin/download-csv/`,
  //       "POST",
  //       {
  //         start_date: payloadStartDate,
  //         end_date: payloadEndDate,
  //         search_query: searchQuery,
  //       }
  //     );

  //     // Extracting keys ["user", "activity", "activity_time"] from the objects
  //     const headers = Object.keys(apiResponse.data[0]).filter(
  //       (key) => key !== "id"
  //     );

  //     const rowData = Object.values(apiResponse.data).map((obj) => {
  //       return headers.map((key) => obj[key]);
  //     });

  //     // Create CSV content
  //     const csvContent = [
  //       headers.join(","), // Header row
  //       ...rowData.map((row) => row.join(",")), // Data rows
  //     ].join("\n");

  //     // Create a Blob containing the CSV data
  //     const blob = new Blob([csvContent], { type: "text/csv" });

  //     // Create a download link
  //     const link = document.createElement("a");
  //     link.href = window.URL.createObjectURL(blob);
  //     link.download = "user_report.csv";

  //     // Trigger a click event to start the download
  //     link.click();
  //   } catch (error) {
  //     console.error("Error downloading CSV:", error);
  //   }
  //   setIsDownloaded(true);
  // };

  //   const handleDownload = async () => {
  //   setIsDownloaded(false);

  //   const payload = {
  //     start_date: filteredStartDate || "",
  //     end_date: filteredEndDate || "",
  //     search_query: userInputQuery || "",
  //   };

  //   console.log("Download payload:", payload);

  //   try {
  //     // const csrfToken = await getCSRFToken();
  //     // const token = localStorage.getItem("token");

  //     const response = await fetch(
  //       `${API_URL}/api/admin/download-csv/`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //           "X-CSRFToken": csrfToken,
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     console.log("Download response status:", response.status);
  //     console.log(
  //       "Download response content-type:",
  //       response.headers.get("content-type")
  //     );

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("Download failed:", errorText);
  //       throw new Error(`Download failed: ${response.status}`);
  //     }

  //     // Backend is returning CSV/file data
  //     const blob = await response.blob();

  //     console.log("Downloaded blob size:", blob.size);
  //     console.log("Downloaded blob type:", blob.type);

  //     if (!blob.size) {
  //       throw new Error("Downloaded file is empty.");
  //     }

  //     const url = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = "user_report.csv";

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);

  //     // Give browser time to start download before cleanup
  //     setTimeout(() => {
  //       window.URL.revokeObjectURL(url);
  //     }, 1000);

  //   } catch (error) {
  //     console.error("Error downloading user report:", error);
  //   } finally {
  //     setIsDownloaded(true);
  //   }
  // };

  const handleDownload = async (event) => {
    // Prevent form submission/navigation if the button is inside a form
    event?.preventDefault();
    event?.stopPropagation();

    // if (isDownloaded === false) {
    //   return;
    // }

    setIsDownloaded(false);

    const payload = {
      start_date: filteredStartDate || "",
      end_date: filteredEndDate || "",
      search_query: userInputQuery || "",
    };

    console.log("========== DOWNLOAD START ==========");
    console.log("Download payload:", payload);

    try {
      // const csrfToken = await getCSRFToken();
      // const token = localStorage.getItem("token");

      console.log("CSRF token available:", !!csrfToken);
      console.log("Auth token available:", !!token);

      const response = await fetch(`${API_URL}/api/admin/download-csv/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify(payload),
      });

      console.log("Download response received");
      console.log("Status:", response.status);
      console.log("OK:", response.ok);
      console.log("Content-Type:", response.headers.get("content-type"));
      console.log(
        "Content-Disposition:",
        response.headers.get("content-disposition"),
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Download API failed:", response.status, errorText);

        throw new Error(`Download failed with status ${response.status}`);
      }

      console.log("Reading CSV response...");

      const blob = await response.blob();

      console.log("Blob received:", blob.size, blob.type);

      if (!blob || blob.size === 0) {
        throw new Error("Downloaded CSV is empty.");
      }

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "user_activity_report.csv";

      link.style.display = "none";

      document.body.appendChild(link);

      console.log("Triggering browser download...");

      link.click();

      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        console.log("Download URL revoked");
      }, 2000);

      console.log("========== DOWNLOAD COMPLETE ==========");
    } catch (error) {
      console.error("========== DOWNLOAD ERROR ==========", error);

      toast.error("Failed to download user activity report.");
    } finally {
      setIsDownloaded(true);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle search button click and trigger API call
  // const handleGlobalSearchClick = () => {
  // fetchDownloadConfigData(searchQuery); // Pass the current search query to the API call
  // };

  //   const handleGlobalSearchClick = async () => {
  //     try {
  //       const result = await fetchDownloadConfigData(searchQuery); // Pass the current search query to the API call
  // console.log("fetch result",result);
  //       if (result && result.length > 0) {
  //         setSearchQuery(searchQuery);  // Set the search query in the state
  //         setIsPopupOpen(false);        // Ensure the popup is closed
  //         setError("");

  //       } else {
  //         setSearchQuery("");    // Clear any previous results
  //         setError('No data found for the search query.'); // Display no data found message
  //         setIsPopupOpen(true);
  //       }
  //     } catch (error) {
  //       setSearchQuery("");
  //       setError('An error occurred while searching. Please try again.'); // Handle potential API errors
  //       setIsPopupOpen(true);
  //     }
  //   };

  const handleGlobalSearchClick = async () => {
    try {
      const result = await fetchDownloadConfigData(searchQuery); // Pass the current search query to the API call

      if (result && Array.isArray(result) && result.length > 0) {
        setSearchQuery(searchQuery); // Set the search query in the state
        setIsPopupOpen(false); // Ensure the popup is closed
        setError("");
      } else {
        setSearchQuery(""); // Clear any previous results
        setError("No data found for the search query."); // Display no data found message
        setIsPopupOpen(true);
      }
    } catch (error) {
      setSearchQuery("");
      setError("An error occurred while searching. Please try again."); // Handle potential API errors
      setIsPopupOpen(true);
    }
  };

  const handleUserInputChange = (e) => {
    const inputText = e.target.value.toLowerCase();
    setUserInputQuery(inputText);
  };

  //   const handleSearchClick = async () => {
  //   try {
  //   const result= await fetchUserReport(
  //   1,
  //   10,
  //   "",
  //   "",
  //   userInputQuery // Use the current input value
  //   );
  //   if (result && Array.isArray(result) && result.length > 0) {
  //     setUserInputQuery(userInputQuery);  // If data is found, set it to state
  //     setError(""); // Display no data found message
  //     setIsPopupOpen(false);

  //   } else {
  //     setUserInputQuery("");    // Clear any previous results
  //     setError('No data found for the search query.'); // Display no data found message
  //     setIsPopupOpen(true);
  //   }
  // } catch (error) {
  //   setUserInputQuery("");
  //   setError('An error occurred while searching. Please try again.'); // Handle potential API errors
  //   setIsPopupOpen(true);
  // }
  //   };

  // const handleSearchClick = async () => {
  //   try {
  //     // Log the search query to debug
  //     console.log("Searching for:", userInputQuery);
  //   //  const result= fetchUserReport(userInputQuery);

  //     // Fetch the data based on the search query
  //     const result = await fetchUserReport(
  //       1,                // Fetch data from the first page
  //       10,               // Page size
  //       "",        // Use the start date from state
  //       "",          // Use the end date from state
  //       userInputQuery    // Use the current search input value
  //     );

  //     // Log the result to debug
  //     console.log("Search result:", result);

  //     // Check if the result has data
  //     if (result && Array.isArray(result) && result.length > 0) {
  //       setUserInputQuery(userInputQuery); // Keep the query in state
  //       setError("");             // Clear any previous error messages
  //       setIsPopupOpen(false);    // Ensure the popup is closed
  //     } else {

  //       // setUserInputQuery("");    // Clear any previous results
  //       console.log("popup",isPopupOpen);
  //       setError('No data found for the search query.'); // Display no data found message
  //       setIsPopupOpen(true);     // Open the popup
  //     }
  //   } catch (error) {
  //     console.error("Error occurred during search:", error);
  //     setUserInputQuery("");              // Clear the data in case of error
  //     setError('An error occurred while searching. Please try again.'); // Handle potential API errors
  //     setIsPopupOpen(true);       // Open the popup
  //   }
  // }

  const handleSearchClick = async () => {
    try {
      // Log the search query and parameters to debug
      setCurrentPage(1);
      // Fetch the data based on the search query
      const result = await fetchUserReport(
        1, // Fetch data from the first page
        10, // Page size
        startDate, // Use the start date from state
        endDate, // Use the end date from state
        userInputQuery, // Use the current search input value
      );

      // Check if the result has any valid data
      const hasValidData = result.some((item) => {
        // Modify this based on your actual data structure
        // Check if item contains data that matches the userInputQuery
        return (
          item &&
          Object.values(item).some(
            (value) =>
              typeof value === "string" && value.includes(userInputQuery),
          )
        );
      });

      // Check if the result has data that matches the query
      if (
        result &&
        Array.isArray(result) &&
        result.length > 0 &&
        hasValidData
      ) {
        setUserInputQuery(userInputQuery); // Keep the query in state
        setError(""); // Clear any previous error messages
        setIsPopupOpen(false); // Ensure the popup is closed
        setPageSize(10);
        // Process and display the data
        // For example: setData(result);
      } else {
        // Log that we're entering the "no data found" block

        // Ensure the state is updated before setting popup
        setUserInputQuery(""); // Clear any previous results
        setError("No matching data found"); // Display no data found message
        setIsPopupOpen(true); // Open the popup
      }
    } catch (error) {
      console.error("Error occurred during search:", error);
      setPageSize(10);
      setUserInputQuery(""); // Clear the data in case of error
      setError("An error occurred while searching. Please try again."); // Handle potential API errors
      setIsPopupOpen(true); // Open the popup
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDataOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleOptionClick = (value) => {
    if (value !== pageSize) {
      handlePageSizeChange(value);
      fetchUserReport(
        1,
        value,
        filteredStartDate,
        filteredEndDate,
        userInputQuery,
      );
    }
    setIsOpen(false);
  };

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

  const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
    // const toggleIsMasked = () => {
    //   onToggle(!isMasked);
    // };
    return (
      <div className="flex flex-row items-center space-x-2">
        <label className={`switch ${disabled ? "switch-disabled" : ""}`}>
          <img
            src={
              isMasked
                ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
                : process.env.PUBLIC_URL + "/noswitch-icon.png"
            }
            alt={isMasked ? "Yes" : "No"}
            // onClick={toggleIsMasked}
            style={{ width: "30px", height: "15px", cursor: "pointer" }}
          />
          <span className="slider round"></span>
        </label>
      </div>
    );
  };

  // const handleDateFilterOK = () => {
  // const formattedStartDate = selectionRange.startDate.toISOString();
  // const formattedEndDate = selectionRange.endDate.toISOString();

  // fetchUserReport(
  // 1, // Assuming you want to fetch the first page initially
  // 10, // Default page size
  // formattedStartDate, // Pass formatted start date
  // formattedEndDate, // Pass formatted end date
  // userInputQuery // Pass user input query
  // );
  // setShowDateFilter(false); // Close date filter dropdown after fetching reports
  // };

  const handleDateFilterOK = () => {
    const formattedStartDate = selectionRange.startDate.toISOString();
    const formattedEndDate = selectionRange.endDate.toISOString();

    // Update state with filtered dates
    setFilteredStartDate(formattedStartDate);
    setFilteredEndDate(formattedEndDate);

    // Fetch reports with the selected date range and reset to the first page
    fetchUserReport(
      1,
      pageSize,
      formattedStartDate,
      formattedEndDate,
      userInputQuery,
    );
    setShowDateFilter(false); // Close the date filter modal
  };

  // const handleDateFilterCancel = () => {
  // // Reset date filter values
  // setStartDate(null);
  // setEndDate(null);
  // fetchUserReport(
  //   1,          // Assuming you want to fetch the first page initially
  //   10,         // Default page size
  //   "",         // Pass empty string for start date (no date filter)
  //   "",         // Pass empty string for end date (no date filter)
  //   userInputQuery // Keep the user input query if it exists
  // );
  // setShowDateFilter(false); // Hide date filter modal
  // };

  const handleDateFilterCancel = () => {
    // Reset date filter values
    setStartDate(""); // Clear start date
    setEndDate(""); // Clear end date
    setFilteredStartDate("");
    setFilteredEndDate("");
    setCurrentPage(1);
    // Reset the selection range to a default (e.g., current date)
    setSelectionRange({
      startDate: new Date(), // Reset to current date
      endDate: new Date(), // Reset to current date
      key: "selection",
    });

    // Fetch user reports with default parameters (without date filters)
    fetchUserReport(
      1, // Assuming you want to fetch the first page initially
      10, // Default page size
      "", // Pass empty string for start date (no date filter)
      "", // Pass empty string for end date (no date filter)
      userInputQuery, // Keep the user input query if it exists
    );

    setShowDateFilter(false); // Hide date filter modal
    setPageSize(10);
  };
  // Open the date filter modal
  const openDateFilter = () => {
    setShowDateFilter(true);
  };

  const handleSelect = (ranges) => {
    setSelectionRange(ranges.selection);
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    setSelectedNavbarOption(null);
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

  //     const closeGlobalPreviewModal = () => {
  //       setIsPopupOpen(false);  // Close the popup
  //       setSearchQuery('');      // Clear the search input field
  //       fetchDownloadConfigData(''); // Trigger API call with empty input
  //     };
  //     const closeUserPreviewModal = () => {
  //       setIsPopupOpen(false);  // Close the popup
  //       setUserInputQuery(""); // Clear the input field
  // fetchUserReport("");
  //     };

  //     const handleClosePopup = () => {
  //       closeUserPreviewModal();       // Call the first function
  //       closeGlobalPreviewModal(); // Call the second function
  //     };

  const closeGlobalPreviewModal = () => {
    setIsPopupOpen(false); // Close the popup
    setSearchQuery(""); // Clear the search input field
    fetchDownloadConfigData(""); // Trigger API call with empty input
  };

  const closeUserPreviewModal = () => {
    setIsPopupOpen(false); // Close the popup
    setUserInputQuery("");

    fetchUserReport(1, 10, startDate, endDate, "");
    // Trigger API call with empty input
  };

  // Define a function to handle conditional logic
  const handleCloseModal = () => {
    if (selectedOption === "Global Column Config") {
      closeGlobalPreviewModal();
    } else if (selectedOption === "User Activity Report") {
      closeUserPreviewModal();
    }
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
  const subContainerHeight = `${(containerHeight * 0.8).toFixed(2)}`;

  const listItemsContainerWidth = `${(subContainerWidth * 0.2).toFixed(2)}`;
  const listItemsContainerHeight = `${(containerHeight * 0.8).toFixed(2)}`;
  const dataContainerWidth = `${subContainerWidth - listItemsContainerWidth}`;
  const subDataContainerWidth = `${(dataContainerWidth * 0.99).toFixed(2)}`;

  const tableContainerWidth = `${(subDataContainerWidth * 0.98).toFixed(2)}`;
  const tableContainerHight = `${(subContainerHeight * 0.84).toFixed(2)}`;

  return (
    <div
      className="bg-primary"
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
          className={` ${showChatbot ? " pointer-events-none" : ""} 
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
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
            className={`bg-white rounded-lg shadow-lg shadow-slate-500/50 ${showChatbot ? " pointer-events-none" : ""} 
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
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
            className=" bg-newgray flex flex-col  rounded-lg items-center  shadow-md shadow-slate-500/30 "
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: cMarginLeft,
            }}
          >
            <div
              className={`flex flex-row text-purpleshade1  items-center text-sm font-medium ml-9 
           ${showChatbot ? " pointer-events-none" : ""} 
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
              style={{
                width: `${(containerWidth * 0.98).toFixed(2)}px`,
                height: `${(containerHeight * 0.07).toFixed(2)}px`,
                marginTop: `${cMarginTop}px`,
              }}
            >
              {/* name */}
              <Link to="/home">Home</Link> &gt; Reports
            </div>
            <div
              className="flex flex-row "
              style={{
                width: `${subContainerWidth}px`,
                height: `${subContainerHeight}px`,
              }}
            >
              <div
                className="bg-newgray shadow-md shadow-slate-500/30 flex flex-col rounded-l-lg items-center justify-center"
                style={{
                  width: `${listItemsContainerWidth}px`,
                  height: `${listItemsContainerHeight}px`,
                }}
              >
                <div
                  className={`flex flex-col  overflow-y-auto space-y-2
           ${showChatbot ? " pointer-events-none" : ""} 
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
                  style={{
                    width: `${(listItemsContainerWidth * 0.97).toFixed(2)}px`,
                    height: `${(listItemsContainerHeight * 0.97).toFixed(2)}px`,
                    scrollbarWidth: "thin",
                  }}
                >
                  <div
                    // className="mt-2 text-xs font-[500] text-black ml-2 px-4 py-4 cursor-pointer flex flex-row h-8 items-center"
                    className={`text-xs font-medium text-black  ml-2 px-3 py-1 cursor-pointer flex flex-row items-center rounded-lg`}
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
                    onClick={() =>
                      handleDataOptionClick("Global Column Config")
                    }
                  >
                    {selectedOption === "Global Column Config" ? (
                      <img
                        src={process.env.PUBLIC_URL + "/purple-global.png"}
                        alt="Closed Folder"
                        className="w-5 h-5 mr-3"
                      />
                    ) : (
                      <img
                        src={process.env.PUBLIC_URL + "/grayglobal-icon.png"}
                        alt="icon"
                        className="w-5 h-5 mr-3"
                      />
                    )}
                    <div className="flex-1">Global Column Config</div>
                  </div>
                  <div>
                    {SeeUserReports ? (
                      <div
                        // className="mt-2 text-xs font-[500] text-black ml-2 px-4 py-4 cursor-pointer flex flex-row h-8 items-center"
                        className={`text-xs font-medium text-black  ml-2 px-3 py-1 cursor-pointer flex flex-row items-center rounded-lg`}
                        style={{
                          backgroundColor:
                            selectedOption === "User Activity Report"
                              ? "white"
                              : "",
                          boxShadow:
                            selectedOption === "User Activity Report"
                              ? "0px 2px 10px rgba(0, 0, 0, 0.3)"
                              : "none",
                          borderRadius:
                            selectedOption === "User Activity Report"
                              ? "5px"
                              : "5px",
                          padding:
                            selectedOption === "User Activity Report"
                              ? "5px"
                              : "5px",
                        }}
                        onClick={() =>
                          handleDataOptionClick("User Activity Report")
                        }
                      >
                        {selectedOption === "User Activity Report" ? (
                          <img
                            src={
                              process.env.PUBLIC_URL + "/purple-report-icon.png"
                            }
                            alt="Closed Folder"
                            className="w-3.5 h-4.5 mr-5"
                          />
                        ) : (
                          <img
                            src={
                              process.env.PUBLIC_URL + "/grayfile-report.png"
                            }
                            alt="icon"
                            className="w-3.5 h-4.5 mr-5"
                          />
                        )}
                        <div className="flex-1"> User Activity Report</div>
                      </div>
                    ) : (
                      // <div
                      //   className=" text-[15px] font-normal text-black ml-2 px-4 py-6  cursor-pointer opacity-50"
                      <div
                        className="mt-2 text-xs font-[500] text-black ml-2 px-4 py-6 cursor-not-allowed opacity-50 flex flex-row h-8 items-center"
                        style={{
                          backgroundColor:
                            selectedOption === "User Activity Report"
                              ? "#D4D4D4"
                              : "",
                          borderRadius:
                            selectedOption === "User Activity Report"
                              ? "5px"
                              : "5px",
                          padding:
                            selectedOption === "User Activity Report"
                              ? "5px"
                              : "5px",
                        }}
                      >
                        <img
                          src={process.env.PUBLIC_URL + "/grayfile-report.png"}
                          alt="icon"
                          className="w-5 h-5 mr-3"
                        />
                        User Activity Report
                      </div>
                    )}
                  </div>
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
                  {selectedOption === "Global Column Config" && (
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`flex flex-row mt-2 justify-between p-4 items-center bg-newgray rounded-lg shadow-md shadow-slate-500/30 
        ${showChatbot ? "blur-effect" : ""} ${
          showProfileModal ? "blur-effect" : ""
        }${isTimezoneModalOpen ? "blur-effect" : ""}
        ${showDownloadPopup ? "blur-effect" : ""}`}
                        style={{
                          width: `${(subDataContainerWidth * 0.95).toFixed(
                            2,
                          )}px`,
                          height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
                        }}
                      >
                        <div
                          className={`flex w-72 h-8 flex-row px-1 bg-white justify-between items-center  rounded-md shadow-md shadow-slate-500/30
       `}
                        >
                          <input
                            type="text"
                            placeholder="Search here"
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleGlobalSearchClick(); // Trigger API call on Enter key press
                              }
                            }}
                            className="outline-none  ml-0 h-6  font-light text-xs placeholder:text-[11px] "
                            value={searchQuery}
                          />
                          <div className="flex flex-row space-x-2">
                            <button
                              className="bg-background-100 text-2xl font-semibold "
                              onClick={() => {
                                setSearchQuery(""); // Clear the input field
                                fetchDownloadConfigData(""); // Fetch the data with an empty search query
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
                              style={{ width: "17px", height: "17px" }}
                              onClick={handleGlobalSearchClick} // Trigger API call on click
                            />
                          </div>
                        </div>

                        <button
                          className={`w-24 h-7 flex flex-row ml-2 px-2 rounded-md cursor-pointer justify-center
                      items-center font-medium text-xs bg-purpleshade1 text-white
                      ${showChatbot ? " pointer-events-none" : ""} 
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
                          onClick={handleDownloadButtonClick}
                          // onClick={setShowUploadPopup(true)}
                        >
                          Download
                        </button>
                      </div>
                      {/* <div className="flex flex-col items-center "
        style={{width:`${tableContainerWidth}px`,height:`${tableContainerHight}px`}}>
        <div className={`flex rounded-t-xl 
        ${showChatbot ? "blur-effect" : ""} ${showProfileModal ? "blur-effect" : ""}
        ${isTimezoneModalOpen ? "blur-effect" : ""}`}
        style={{width:`${(tableContainerWidth * 0.97).toFixed(2)}px`,
        height:`${(tableContainerHight * 0.09).toFixed(2)}px`,
        // height:"10px"

        }}
        >
        <table className="table-design table-fixed w-full ">
              <colgroup>
                <col className="w-[75%] h-6" />
                <col className="w-[25%] h-6" />
              </colgroup>
              <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white z-20">
                <tr>
                  <th className="py-3 sticky top-0 px-12 rounded-tl-lg font-medium text-xs  ">
                    Field Name
                  </th>
                  <th className="py-3 sticky top-0 rounded-tr-lg font-medium text-xs">
                    Is Masked
                  </th>
                </tr>
              </thead>
            </table>

        </div>
        <div className="flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
        style={{width:`${(tableContainerWidth * 0.97).toFixed(2)}px`,height:`${(tableContainerHight * 0.8).toFixed(2)}px`}}>
        <div className={`overflow-auto mt-2 ${showChatbot ? "blur-effect" : ""} ${showProfileModal ? "blur-effect" : ""}
        ${isTimezoneModalOpen ? "blur-effect" : ""}`} 
        style={{width:`${(tableContainerWidth * 0.97).toFixed(2)}px`,height:`${(tableContainerHight * 0.75).toFixed(2)}px`,
        // marginTop:`${(((tableContainerHight)-(tableContainerHight * 0.09)) *0.02).toFixed(2)}px`,
        scrollbarWidth:"thin"}}>
        <table className="table-design  table-fixed w-full ">
                <tbody>
                  {loading ? (
                    <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-20">
                      <img
                        src={
                          process.env.PUBLIC_URL + "/loadergif.gif"
                        }
                        alt="logo"
                        className="animate-spin w-6 h-6"
                      />
                      <p className="text-logintext font-[350] text-[11px] animate-pulse">
                        Just a moment...
                      </p>
                    </div>
                  ) : (
                    downloadConfigApiData &&
                    downloadConfigApiData.map((config, index) => (
                      <tr className="" key={index}>
                        <td className="w-[75%] font-light text-[11px] px-12 overflow-ellipsis whitespace-nowrap overflow-hidden">
                          <input
                            id={`config-input-${index}`}
                            //  className="configinput"
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
                        <td className="w-[25%] font-light text-xs px-3 overflow-ellipsis pl-4 whitespace-nowrap overflow-hidden">
                          <div className="flex flex-row  space-x-6 cursor-not-allowed ">
                            <IsMaskedSwitch
                              isMasked={
                                config.is_masked.toString() === "true"
                              }
                              onToggle={(isChecked) =>
                                handleDownloadConfigFieldChange(
                                  index,
                                  "is_masked",
                                  isChecked ? "true" : "false"
                                )
                              }
                              disabled={true}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
        </div>

        </div>

        </div> */}
                      <div
                        className={`flex flex-col items-center `}
                        style={{
                          width: `${tableContainerWidth}px`,
                          height: `${tableContainerHight}px`,
                        }}
                      >
                        <div
                          className={`flex rounded-t-xl
        ${showChatbot ? "blur-effect" : ""}
        ${showProfileModal ? "blur-effect" : ""}
        ${isTimezoneModalOpen ? "blur-effect" : ""}
        ${showDownloadPopup ? "blur-effect" : ""}`}
                          style={{
                            width: `${(tableContainerWidth * 0.97).toFixed(
                              2,
                            )}px`,
                            height: `${(tableContainerHight * 0.09).toFixed(
                              2,
                            )}px`,
                            position: "relative",
                          }}
                        >
                          <table className="table-design table-fixed w-full">
                            <colgroup>
                              <col className="w-[75%]" />
                              <col className="w-[25%]" />
                            </colgroup>
                            <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white z-20">
                              <tr>
                                <th className="py-3 px-12 rounded-tl-lg font-medium text-xs">
                                  Field Name
                                </th>
                                <th className="py-3 rounded-tr-lg font-medium text-xs">
                                  Is Masked
                                </th>
                              </tr>
                            </thead>
                          </table>
                        </div>

                        <div
                          className="flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white"
                          style={{
                            width: `${(tableContainerWidth * 0.97).toFixed(
                              2,
                            )}px`,
                            height: `${(tableContainerHight * 0.8).toFixed(
                              2,
                            )}px`,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className={`overflow-auto adjusted-margin-top ${
                              showChatbot ? "blur-effect" : ""
                            }
          ${showProfileModal ? "blur-effect" : ""}
          ${isTimezoneModalOpen ? "blur-effect" : ""}
          ${showDownloadPopup ? "blur-effect" : ""}`}
                            style={{
                              width: `${(tableContainerWidth * 0.97).toFixed(
                                2,
                              )}px`,
                              height: `${(tableContainerHight * 0.7).toFixed(
                                2,
                              )}px`,
                              scrollbarWidth: "thin",
                            }}
                          >
                            <table className="table-design table-fixed w-full">
                              <tbody>
                                {loading ? (
                                  <tr>
                                    <td
                                      colSpan="2"
                                      className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-20"
                                    >
                                      <img
                                        src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                                        alt="Loading..."
                                        className="animate-spin  w-8 h-8"
                                      />
                                      <p className="text-logintext font-[350] text-[11px] animate-pulse">
                                        Just a moment...
                                      </p>
                                    </td>
                                  </tr>
                                ) : (
                                  downloadConfigApiData &&
                                  downloadConfigApiData.map((config, index) => (
                                    <tr key={index}>
                                      <td className="w-[75%] font-light text-[11px] px-12 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                        <input
                                          id={`config-input-${index}`}
                                          type="text"
                                          className="outline-none"
                                          value={config.name}
                                          onChange={(e) =>
                                            handleDownloadConfigFieldChange(
                                              index,
                                              "name",
                                              e.target.value,
                                            )
                                          }
                                          readOnly
                                        />
                                      </td>
                                      <td className="w-[25%] font-light text-xs px-3 overflow-ellipsis pl-4 whitespace-nowrap overflow-hidden">
                                        <div className="flex flex-row space-x-6 cursor-not-allowed">
                                          <IsMaskedSwitch
                                            isMasked={
                                              config.is_masked.toString() ===
                                              "true"
                                            }
                                            onToggle={(isChecked) =>
                                              handleDownloadConfigFieldChange(
                                                index,
                                                "is_masked",
                                                isChecked ? "true" : "false",
                                              )
                                            }
                                            disabled={true}
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {showDownloadPopup && (
                          <div className="absolute inset-0 flex justify-center z-20 items-center">
                            <DownloadPopup
                              onClose={handlePopupClose}
                              onSelect={handleDownloadOptionSelect}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedOption === "User Activity Report" && (
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className=" flex flex-row mt-2 rounded-t-md items-center px-4 bg-newgray rounded-lg shadow-md shadow-slate-500/30"
                        style={{
                          width: `${(subDataContainerWidth * 0.95).toFixed(
                            2,
                          )}px`,
                          height: `${(subContainerHeight * 0.11).toFixed(2)}px`,
                        }}
                      >
                        <div
                          className={`flex w-72 h-8 flex-row px-1 bg-white justify-between items-center  rounded-md shadow-md shadow-slate-500/30
        ${showChatbot ? "blur-effect pointer-events-none" : ""} 
        ${showProfileModal ? "blur-effect pointer-events-none" : ""}
        ${isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""}`}
                        >
                          <input
                            type="text"
                            placeholder="Search here"
                            onChange={handleUserInputChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSearchClick(); // Trigger API call on Enter key press
                              }
                            }}
                            className="outline-none ml-0 font-light text-xs placeholder:text-[11px] "
                            value={userInputQuery}
                          />
                          <div className="flex flex-row space-x-2">
                            <button
                              className="bg-background-100 text-2xl font-semibold "
                              onClick={() => {
                                setUserInputQuery(""); // Clear the input field
                                setPageSize(10);
                                setCurrentPage(1);
                                fetchUserReport(1, 10, startDate, endDate, "");
                                // fetchUserReport();
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
                              style={{ width: "17px", height: "17px" }}
                              // onClick={handleGlobalSearchClick} // Trigger API call on click
                              onClick={handleSearchClick}
                            />
                          </div>
                        </div>

                        <div
                          className={`relative ${
                            showChatbot ? "blur-effect pointer-events-none" : ""
                          } 
        ${showProfileModal ? "blur-effect pointer-events-none" : ""}
        ${isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""} `}
                        >
                          <button
                            className="w-24 h-7 flex flex-row ml-2 px-2 rounded-md cursor-pointer justify-center
                      items-center font-medium text-xs bg-purpleshade1 text-white"
                            onClick={openDateFilter}
                          >
                            Date Filter
                          </button>
                          {showDateFilter && (
                            <div className="absolute bg-white border border-gray-300 rounded shadow-md mt-1 p-4 flex flex-col space-y-4 z-50">
                              <DateRange
                                ranges={[selectionRange]}
                                onChange={handleSelect}
                                className="w-full"
                              />
                              <div className="flex space-x-4">
                                <button
                                  className="w-28 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center
                      items-center font-medium text-xs bg-purpleshade1 text-white"
                                  onClick={handleDateFilterOK}
                                >
                                  OK
                                </button>
                                <button
                                  className="w-28 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center
                      items-center font-medium text-xs bg-purpleshade1 text-white"
                                  onClick={handleDateFilterCancel}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-grow"></div>

                        <button
                          type="button"
                          className={`w-24 h-7 flex flex-row px-4 rounded-md cursor-pointer justify-center items-center font-medium text-xs bg-purpleshade1 text-white
        ${showChatbot ? "blur-effect pointer-events-none" : ""} 
        ${showProfileModal ? "blur-effect pointer-events-none" : ""}
        ${isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""}`}
                          onClick={handleDownload}
                        >
                          Download
                        </button>
                      </div>
                      {/* <div className="flex flex-col items-center" 
     style={{width: `${tableContainerWidth}px`, height: `${tableContainerHight}px`}}>
  
  <div className={`flex rounded-t-xl ${showChatbot ? "blur-effect" : ""} 
                  ${showProfileModal ? "blur-effect" : ""} 
                  ${isTimezoneModalOpen ? "blur-effect" : ""}`}
       style={{width: `${(tableContainerWidth * 0.97).toFixed(2)}px`, 
               height: `${(tableContainerHight * 0.1).toFixed(2)}px`}}>
    
    <table className="table-design table-fixed w-full">
      <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
        <tr>
          <th className="w-[20%] text-left py-2 px-2 rounded-tl-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
            Email
          </th>
          <th className="w-[14%] text-left py-2 px-3 font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
            Activity Type
          </th>
          <th className="w-[35%] text-left py-2 px-3 font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
            Activity Info
          </th>
          <th className="w-[13%] text-left py-2 rounded-tr-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
            Activity Time
          </th>
        </tr>
      </thead>
    </table>
  
  </div>
  
  <div className="flex flex-col overflow-auto rounded-b-xl shadow-md shadow-slate-500/30 bg-white scrollbar-thin"
       style={{width: `${(tableContainerWidth * 0.97).toFixed(2)}px`, 
               height: `${(tableContainerHight * 0.8).toFixed(2)}px`}}>
    
    <div className={`${showChatbot ? "blur-effect" : ""} 
                    ${showProfileModal ? "blur-effect" : ""} 
                    ${isTimezoneModalOpen ? "blur-effect" : ""}`}
         style={{width: `${(tableContainerWidth * 0.97).toFixed(2)}px`, 
                 height: `${(tableContainerHight * 0.75).toFixed(2)}px`}}>
      
      <table className="table-design table-fixed w-full">
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="w-full h-full flex flex-col justify-center items-center space-y-6 mt-20">
                <img src={`${process.env.PUBLIC_URL}/loadergif.gif`} alt="Loading..." className="animate-spin w-8 h-8" />
                <p className="text-logintext font-[350] text-[13px] animate-pulse">Just a moment...</p>
              </td>
            </tr>
          ) : (
            data.map((item) =>
              item.user || item.activity || item.activity_info || item.activity_time ? (
                <tr key={item.id}>
                  <td className="w-[20%] font-light text-left text-[11px] px-2 overflow-ellipsis whitespace-nowrap overflow-hidden">
                    {item.user}
                  </td>
                  <td className="w-[14%] font-light text-left text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                    {item.activity}
                  </td>
                  <td className="w-[35%] font-light text-left text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                    {item.activity_info}
                  </td>
                  <td className="w-[13%] font-light text-left text-[11px] px-2 overflow-ellipsis whitespace-nowrap overflow-hidden">
                    {item.activity_time}
                  </td>
                </tr>
              ) : null
            )
          )}
        </tbody>
      </table>
      
    </div>
    
  </div>
  
</div> */}

                      <div
                        className="flex flex-col items-center "
                        style={{
                          width: `${tableContainerWidth}px`,
                          height: `${tableContainerHight}px`,
                        }}
                      >
                        <div
                          className={`flex rounded-t-xl ${
                            showChatbot ? "blur-effect pointer-events-none" : ""
                          } 
        ${showProfileModal ? "blur-effect pointer-events-none" : ""}
        ${isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""}`}
                          style={{
                            width: `${(tableContainerWidth * 0.97).toFixed(
                              2,
                            )}px`,
                            height: `${(tableContainerHight * 0.1).toFixed(
                              2,
                            )}px`,
                          }}
                        >
                          <table className="table-design table-fixed w-full">
                            <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white ">
                              <tr>
                                <th className="w-[20%] text-left py-2 px-4 rounded-tl-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                                  Email
                                </th>
                                <th className="w-[14%] text-left py-2 px-3 font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                                  Activity Type
                                </th>
                                <th className="w-[40%] text-left py-2 px-3 font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                                  Activity Info
                                </th>
                                <th className="w-[13%] text-left py-2  rounded-tr-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                                  Activity Time
                                </th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                        <div
                          className="flex flex-col adjusted-margin-top  rounded-b-xl shadow-md shadow-slate-500/30 "
                          style={{
                            width: `${(tableContainerWidth * 0.97).toFixed(
                              2,
                            )}px`,
                            height: `${(tableContainerHight * 0.8).toFixed(
                              2,
                            )}px`,
                          }}
                        >
                          <div
                            className={`overflow -y-auto overflow-x-hidden
        ${showChatbot ? "blur-effect pointer-events-none" : ""} ${
          showProfileModal ? "blur-effect pointer-events-none" : ""
        }
        ${isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""}`}
                            style={{
                              width: `${(tableContainerWidth * 0.97).toFixed(
                                2,
                              )}px`,
                              height: `${(tableContainerHight * 0.74).toFixed(
                                2,
                              )}px`,
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
                                  data.map((item) =>
                                    item.user ||
                                    item.activity ||
                                    item.activity_info ||
                                    item.activity_time ? (
                                      <tr key={item.id}>
                                        <td className="w-[20%] font-light   text-left text-[11px] px-4 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                          {item.user}
                                        </td>
                                        <td className="w-[14%] font-light text-left text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                          {item.activity}
                                        </td>
                                        <td className="w-[40%] font-light text-left text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                          {item.activity_info &&
                                          typeof item.activity_info === "object"
                                            ? Object.entries(item.activity_info)
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(", ")
                                            : item.activity_info}
                                        </td>

                                        <td className="w-[13%] font-light text-left text-[11px]  overflow-ellipsis whitespace-nowrap overflow-hidden">
                                          {item.activity_time}
                                        </td>
                                      </tr>
                                    ) : null,
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedOption === "User Activity Report" && (
              <div
                className="flex flex-row "
                style={{
                  width: `${(containerWidth * 0.93).toFixed(2)}px`,
                  height: `${(containerHeight * 0.1).toFixed(2)}px`,
                }}
              >
                <div
                  className={`flex flex-row justify-between items-center
         ${showChatbot ? " pointer-events-none" : ""} 
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
                  style={{
                    width: `${(containerWidth * 0.93).toFixed(2)}px`,
                    height: `${(containerHeight * 0.09).toFixed(2)}px`,
                  }}
                >
                  <div className="flex  h-6 flex-row  space-x-4 ">
                    <span className="mt-1 h-6 font-light text-[11px]">
                      {" "}
                      {/* Page{currentPage}{" "} */}
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      className={`cursor-pointer ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/less-than.png"}
                        alt="Previous Page"
                        className="w-3 h-3"
                      />
                    </button>

                    <button
                      className={`cursor-pointer ${
                        data.length < pageSize
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={handleNextPage}
                      disabled={data.length < pageSize}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/more-than.png"}
                        alt="Next Page"
                        className="w-3 h-3"
                      />
                    </button>
                  </div>

                  {/* <div className="relative inline-block ">
                    <button
                      id="pageSizeDropdownButton"
                      onClick={toggleDropdown}
                      className="font-light rounded-lg text-[11px] px-3 py-1 text-center inline-flex items-center text-b;ack bg-[#E8E8E8]"
                      type="button"
                    >
                      Page Size: {pageSize}{" "}
                      <svg
                        className={`w-2.5 h-2.5 ms-3 ${
                          isOpen ? "rotate-180" : ""
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
                    </button> */}
                  <div className="relative inline-block ">
                    <button
                      id="pageSizeDropdownButton"
                      onClick={toggleDropdown}
                      className="font-light rounded-lg text-[11px] px-3 py-1 text-center inline-flex items-center text-b;ack bg-[#E8E8E8]"
                      type="button"
                    >
                      Page Size: {pageSize}{" "}
                      <svg
                        className={`w-2.5 h-2.5 ms-3 ${
                          isOpen ? "rotate-180" : ""
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

                    {/* Dropdown menu */}
                    {/* <div
                      className={`z-10 ${
                        isOpen ? "" : "hidden"
                      } bg-background-100 border divide-y text-white  divide-secondary rounded-lg shadow-top w-32
        dark:bg-primary absolute bottom-full mt-1`}
                    >
                      <ul
                        className="py-1 text-[11px] text-black dark:text-gray-200"
                        aria-labelledby="pageSizeDropdownButton"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(10)}
                             className="block px-2  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            10
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(25)}
                             className="block px-2  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            25
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(50)}
                            className="block px-2  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            50
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(100)}
                            className="block px-2  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            100
                          </button>
                        </li>
                      </ul>
                    </div> */}

                    <div
                      className={`z-10 ${
                        isOpen ? "" : "hidden"
                      } bg-background-100 border divide-y text-white  divide-secondary rounded-lg shadow-top w-28
        dark:bg-primary absolute bottom-full mt-1`}
                    >
                      <ul
                        className="py-1 text-[11px] text-black dark:text-gray-200"
                        aria-labelledby="pageSizeDropdownButton"
                      >
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
                            onClick={() => handleOptionClick(25)}
                            className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            25
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(50)}
                            className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            50
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleOptionClick(100)}
                            className="block px-3 py-0.5 text-start w-full text-black  hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            100
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <TimezoneModal
            isTimezoneModalOpen={isTimezoneModalOpen}
            setIsTimezoneModalOpen={setIsTimezoneModalOpen}
            closePreviewModal={handleCloseChatbot}
            setSelectedNavbarOption={setSelectedNavbarOption}
          />
          <ErrorPopup
            isOpen={isPopupOpen}
            message={error}
            // onClose={closePreviewModal}
            onClose={handleCloseModal}
          />
          <div
            className="absolute   "
            style={{
              marginLeft: `${(width * 0.95).toFixed(2)}px`,
              marginTop: `${(height * 0.74).toFixed(2)}px`,
            }}
          >
            <img
              src={process.env.PUBLIC_URL + "/chat-icon.png"}
              alt="Chat Icon"
              className={`w-12 h-12 cursor-pointer animate-floating   
         ${showProfileModal ? " pointer-events-none" : ""}
        ${isTimezoneModalOpen ? " pointer-events-none" : ""}`}
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
        </div>
      </div>
    </div>
  );
};

export default Reports;
