import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "../auth";
import { useAuth } from "../AuthContext";
import "./reports1.css";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useUI } from "../Context/UIContext";
import { ReportsOptions_Config } from "./ReportsOptionsConfig";
import ReportsOptionsItems from "./ReportsOptionsItems";
import ReportsGlobalColumnConfig from "./ReportsGlobalColumnConfig";
import { API_URL } from "../ApiConfig";
import { apiRequest } from "../csrfUtils";
import { toast } from "react-toastify";
import UserActivityReports from "./UserActivityReports";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Chatbot from "../Chatbot";

const Reports = () => {
  const { token, permissions, csrfToken, userEmail, authLoading } = useAuth();
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
  const [selectedOption, setSelectedOption] = useState("Global Column Config");
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadConfigApiData, setDownloadConfigApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [filteredStartDate, setFilteredStartDate] = useState("");
  const [filteredEndDate, setFilteredEndDate] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userInputQuery, setUserInputQuery] = useState("");
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isDataArray, setIsDataArray] = useState(false);
  const [data, setData] = useState([]);
  const [newFieldIsMasked, setNewFieldIsMasked] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [columnData, setColumnData] = useState([]);
  const [isNewFieldVisible, setisNewFieldVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSeconds, setDownloadSeconds] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [downloadElapsed, setDownloadElapsed] = useState(0);
  const isInteractionDisabled = showChatbot ;

  // Track initial mount so pageSize effect doesn't trigger extra call on load
  const isMounted = useRef(false);

  const fetchDownloadConfigData = async (query = searchQuery) => {
    setLoading(true);
    try {
      const downloadConfigData = await apiRequest(
        `${API_URL}/api/admin/list-global-column/`,
        "POST",
        { search_query: query }
      );

      const resData = downloadConfigData?.data || [];
      setDownloadConfigApiData(resData);
      
      const total = resData.length > 0 ? (resData[resData.length - 1]?.total || resData.length) : 0;
      const calcPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
      setTotalPages(isNaN(calcPages) || calcPages < 1 ? 1 : calcPages);

      setLoading(false);
      return resData;
    } catch (error) {
      console.error("Error in fetchDownloadConfigData:", error);
      setLoading(false);
      return [];
    }
  };

  const fetchUserReport = async (
    page = currentPage,
    size = pageSize,
    start = filteredStartDate || startDate,
    end = filteredEndDate || endDate,
    query = userInputQuery
  ) => {
    try {
      setLoading(true);

      const responseData = await apiRequest(
        `${API_URL}/api/admin/get-user-reports/`,
        "POST",
        {
          page_number: page,
          page_size: size,
          start_date: start || "",
          end_date: end || "",
          search_query: query || "",
        }
      );

      const resData = responseData?.data || [];
      setData(resData);
      setIsDataArray(true);

      // Extract total safely
      const totalCount = resData.length > 0 ? Number(resData[resData.length - 1]?.total || 0) : 0;
      const validSize = Number(size) || 10;
      const calculatedPages = Math.ceil(totalCount / validSize);

      setTotalPages(isNaN(calculatedPages) || calculatedPages < 1 ? 1 : calculatedPages);
      setLoading(false);
      return resData;
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotalPages(1);
      setLoading(false);
      return [];
    }
  };

  // 1. SINGLE EFFECT FOR TAB SWITCHING & MOUNT
  useEffect(() => {
    if (selectedOption === "Global Column Config") {
      fetchDownloadConfigData();
    } else if (selectedOption === "User Activity Report") {
      setCurrentPage(1);
      fetchUserReport(1, pageSize, filteredStartDate || startDate, filteredEndDate || endDate, userInputQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, token]);

  // 2. PAGE SIZE CHANGE EFFECT (ONLY RUNS ON CHANGE WHILE IN USER ACTIVITY REPORT TAB)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (selectedOption === "User Activity Report") {
      fetchUserReport(1, pageSize, filteredStartDate || startDate, filteredEndDate || endDate, userInputQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const DownloadPopup = ({ onSelect, onClose }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white px-4 py-2 rounded-lg shadow-top z-50 w-72 h-36 flex flex-col space-y-3 ml-56 ">
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
                className="w-24 h-6 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center items-center font-medium text-[13px] bg-purpleshade1 text-secondary"
                onClick={() => {
                  onSelect("Global");
                  onClose();
                }}
              >
                Global
              </button>
              <button
                className="w-24 h-6 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center items-center font-medium text-[13px] bg-purpleshade1 text-secondary"
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

  const IsMaskedSwitch = ({ isMasked, onToggle, disabled }) => {
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
            style={{ width: "30px", height: "15px", cursor: "pointer" }}
          />
          <span className="slider round"></span>
        </label>
      </div>
    );
  };

  const handleDownloadConfigFieldChange = (index, field, value) => {
    setDownloadConfigApiData((prevData) => {
      const newData = prevData.map((config, i) => {
        if (i === index) {
          return {
            ...config,
            id: config.id,
            [field]: value,
          };
        }
        return config;
      });
      return newData;
    });
  };

  const handleSelectedOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleDownloadOptionSelect = async (option) => {
    try {
      await handleDownloadOptionChange(option);
      setShowDownloadPopup(false);
    } catch (error) {
      console.error("Error in handleDownloadOptionSelect:", error);
      toast.error("Failed to initiate download");
    }
  };

  const handleDownloadOptionChange = async (selectedOpt) => {
    try {
      let configType, requestBody;

      if (selectedOpt === "Global") {
        configType = "global";
        requestBody = { config_type: configType };
      } else if (selectedOpt === "Local") {
        configType = "file_specific";
        requestBody = { config_type: configType };
      }

      const response = await apiRequest(
        `${API_URL}/api/admin/download-column/`,
        "POST",
        requestBody
      );

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

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);

    const activeStartDate = filteredStartDate || startDate || "";
    const activeEndDate = filteredEndDate || endDate || "";

    fetchUserReport(
      1,
      newSize,
      activeStartDate,
      activeEndDate,
      userInputQuery
    );
  };

  const handlePopupClose = () => {
    setShowDownloadPopup(false);
  };

  const handleGlobalSearchClick = async () => {
    try {
      const result = await fetchDownloadConfigData(searchQuery);

      if (result && Array.isArray(result) && result.length > 0) {
        setSearchQuery(searchQuery);
        setIsPopupOpen(false);
        setError("");
      } else {
        setSearchQuery("");
        setError("No data found for the search query.");
        setIsPopupOpen(true);
      }
    } catch (error) {
      setSearchQuery("");
      setError("An error occurred while searching. Please try again.");
      setIsPopupOpen(true);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadButtonClick = () => {
    setShowDownloadPopup(true);
  };

  const handleSearchClick = async () => {
    try {
      setCurrentPage(1);
      const result = await fetchUserReport(
        1,
        pageSize,
        filteredStartDate || startDate,
        filteredEndDate || endDate,
        userInputQuery
      );

      if (result && Array.isArray(result) && result.length > 0) {
        setError("");
        setIsPopupOpen(false);
      } else {
        setUserInputQuery("");
        setError("No matching data found");
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("Error occurred during search:", error);
      setUserInputQuery("");
      setError("An error occurred while searching. Please try again.");
      setIsPopupOpen(true);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      fetchUserReport(
        nextPage,
        pageSize,
        filteredStartDate,
        filteredEndDate,
        userInputQuery
      );
      return nextPage;
    });
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => {
      const previousPage = prevPage > 1 ? prevPage - 1 : 1;
      fetchUserReport(
        previousPage,
        pageSize,
        filteredStartDate,
        filteredEndDate,
        userInputQuery
      );
      return previousPage;
    });
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleUserInputChange = (e) => {
    setUserInputQuery(e.target.value);
  };

  const formatDateForBackend = (date, isEndDate = false) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (isEndDate) {
      return `${year}-${month}-${day}T23:59:59.999999Z`;
    }

    return `${year}-${month}-${day}T00:00:00.000000Z`;
  };

  const handleDateFilterOK = () => {
    if (!selectionRange?.startDate || !selectionRange?.endDate) {
      return;
    }

    const start = new Date(selectionRange.startDate);
    const end = new Date(selectionRange.endDate);

    const formattedStart = formatDateForBackend(start, false);
    const formattedEnd = formatDateForBackend(end, true);

    setFilteredStartDate(formattedStart);
    setFilteredEndDate(formattedEnd);

    if (typeof setStartDate === "function") setStartDate(formattedStart);
    if (typeof setEndDate === "function") setEndDate(formattedEnd);

    fetchUserReport(
      1,
      pageSize,
      formattedStart,
      formattedEnd,
      userInputQuery
    );

    setShowDateFilter(false);
  };

  const handleDateFilterCancel = () => {
    setStartDate("");
    setEndDate("");
    setFilteredStartDate("");
    setFilteredEndDate("");
    setCurrentPage(1);
    setSelectionRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });

    fetchUserReport(
      1,
      pageSize,
      "",
      "",
      userInputQuery
    );

    setShowDateFilter(false);
  };

  const openDateFilter = () => {
    setShowDateFilter(true);
  };

  const handleSelect = (ranges) => {
    setSelectionRange(ranges.selection);
  };

  const handleDownload = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    setIsDownloaded(false);
    setIsDownloading(true);
    setDownloadCompleted(false);
    setDownloadSeconds(0);

    const payload = {
      start_date: filteredStartDate || "",
      end_date: filteredEndDate || "",
      search_query: userInputQuery || "",
    };

    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setDownloadSeconds(elapsedSeconds);
    }, 1000);

    try {
      const response = await apiRequest(
        `${API_URL}/api/admin/download-csv/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded CSV is empty.");
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "user_activity_report.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 2000);

      setDownloadCompleted(true);
      setFilteredStartDate("");
      setFilteredEndDate("");
      if (typeof setStartDate === "function") setStartDate("");
      if (typeof setEndDate === "function") setEndDate("");

      setSelectionRange({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      });

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadCompleted(false);
        setDownloadSeconds(0);
        clearInterval(timer);
      }, 2000);

      await fetchUserReport(1, pageSize, "", "", "");
    } catch (error) {
      console.error("========== DOWNLOAD ERROR ==========", error);
      toast.error("Failed to download user activity report.");
      setIsDownloading(false);
      setDownloadCompleted(false);
      setDownloadSeconds(0);
      clearInterval(timer);
    } finally {
      setIsDownloaded(true);
    }
  };

  const handleOptionClick = (value) => {
    if (value !== pageSize) {
      handlePageSizeChange(value);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleZoomChange = (event) => {
      if (event.ctrlKey) {
        if (event.code === "Equal" || event.code === "NumpadAdd") {
          if (zoomLevel < 200) {
            setZoomLevel((prevZoom) => Math.min(prevZoom + 10, 200));
            setShowZoomPopup(true);
          }
        } else if (event.code === "Minus" || event.code === "NumpadSubtract") {
          if (zoomLevel > 50) {
            setZoomLevel((prevZoom) => Math.max(prevZoom - 10, 100));
            setShowZoomPopup(true);
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
    const timer = setTimeout(() => {
      setShowZoomPopup(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showZoomPopup]);

  const handleChatbotIconClick = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <>
      <div className="reports-container">
        <div className={`reports-container-data bg-primary`}>
          <div className="w-full h-full flex flex-col items-center container-padding vertical-gap ">
            <div
              className={`reports-navbar-wrapper flex ${isDisabled || isBlurred || isInteractionDisabled || showDateFilter || showDownloadPopup ? " pointer-events-none" : ""}`}
            >
              <Navbar />
            </div>
            <div className={`reports-container-wrapper flex layout-gap`}>
              <div
                className={`reports-Sidebar-wrapper ${isDisabled || isBlurred || isInteractionDisabled || showDateFilter || showDownloadPopup? "pointer-events-none" : ""}`}
              >
                <Sidebar />
              </div>
              <div
                className={`subcontainer-wrapper bg-newgray padding rounded-lg shadow-xl shadow-slate-500/50 overflow-hidden sub-container-gap ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <div className={`reports-back-dashboard  flex items-center text-sm font-medium text-purpleshade1 `}>
                  <div>
                    <Link to="/home">Home</Link> &gt; Reports
                  </div>
                </div>
                <div className="reports-options-view  overflow-hidden ">
                  <div className="reports-data-container flex ">
                     <div className="reports-options-wrapper options-wrapper-padding bg-newgray shadow-md shadow-slate-500/30 flex flex-col rounded-l-xl items-center border-l-2 border-r-2 border-slate-200/100 z-10 ">
                    <div
                      className={`options-data-wrapper mt-2 min-h-0 space-y-1 flex flex-col overflow-auto ${isDisabled || isBlurred || isInteractionDisabled || showDateFilter || showDownloadPopup ? "pointer-events-none" : ""}`}
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {ReportsOptions_Config.map((item) => (
                        <ReportsOptionsItems
                          key={item.key}
                          item={item}
                          selectedOption={selectedOption}
                          onClick={handleSelectedOptionClick}
                        />
                      ))}
                    </div>
                  </div>
                 
                       {/* Right Column (Fluid 75%) */}
                  <div className={`options-data-view bg-white rounded-r-xl shadow-md shadow-slate-500/30 flex flex-col items-center py-2 px-2 `}>
                    {selectedOption === "Global Column Config" && (
                      <div className={`global-column-config-container flex flex-col items-center space-y-2 ${isInteractionDisabled ? "blur-effect" : ""}`}>
                        <div className={`global-search-container flex flex-row mt-2 justify-between p-4 items-center bg-newgray rounded-lg shadow-md shadow-slate-500/30 ${isInteractionDisabled ? "blur-effect" : ""}`}>
                          <div className={`flex search-bar flex-row px-2 bg-white justify-between items-center rounded-md shadow-md shadow-slate-500/30`}>
                            <input
                              type="text"
                              placeholder="Search here..."
                              onChange={handleInputChange}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleGlobalSearchClick();
                                }
                              }}
                              className="outline-none ml-0 h-6 font-light text-xs placeholder:text-[11px]"
                              value={searchQuery}
                            />
                            <div className="flex flex-row space-x-2">
                              <button
                                className="bg-background-100 text-2xl font-semibold "
                                onClick={() => {
                                  setSearchQuery("");
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
                                style={{ width: "17px", height: "17px" }}
                                onClick={handleGlobalSearchClick}
                              />
                            </div>
                          </div>
                          <button
                            className={`button flex flex-row ml-2 px-2 rounded-md cursor-pointer justify-center items-center font-medium text-xs bg-purpleshade1 text-white`}
                            onClick={handleDownloadButtonClick}
                          >
                            Download
                          </button>
                        </div>
                        <div className={`global-Column-config-data-container flex flex-col items-center space-y-0.75`}>
                          <div className={`global-Column-config-table-header flex rounded-t-xl `}>
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
                          <div className={`global-Column-config-table-container flex flex-col rounded-b-xl items-center shadow-md shadow-slate-500/30 bg-white`}>
                            <div
                              className={`global-Column-config-table-data overflow-auto adjusted-margin-top ${isInteractionDisabled ? "blur-effect" : ""}`}
                              style={{ scrollbarWidth: "thin" }}
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
                                          className="animate-spin w-8 h-8"
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
                                                e.target.value
                                              )
                                            }
                                            readOnly
                                          />
                                        </td>
                                        <td className="w-[25%] font-light text-xs px-3 overflow-ellipsis pl-4 whitespace-nowrap overflow-hidden">
                                          <div className="flex flex-row space-x-6 cursor-not-allowed">
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
                      <div className="global-column-config-container flex flex-col items-center space-y-2 ">
                        <div className={`global-search-container flex flex-row mt-2 justify-between p-4 items-center bg-newgray rounded-lg shadow-md shadow-slate-500/30 ${isInteractionDisabled ? "blur-effect" : ""}`}>
                          <div className={`flex search-bar flex-row px-2 bg-white justify-between items-center rounded-md shadow-md shadow-slate-500/30 ${showDateFilter || showDownloadPopup ? "pointer-events-none" : ""}`}>
                            <input
                              type="text"
                              placeholder="Search here"
                              onChange={handleUserInputChange}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSearchClick();
                                }
                              }}
                              className="outline-none ml-0 font-light text-xs placeholder:text-[11px]"
                              value={userInputQuery}
                            />
                            <div className="flex flex-row space-x-2">
                              <button
                                className="bg-background-100 text-2xl font-semibold "
                                onClick={() => {
                                  setUserInputQuery("");
                                  setPageSize(10);
                                  setCurrentPage(1);
                                  fetchUserReport(1, 10, startDate, endDate, "");
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
                                onClick={handleSearchClick}
                              />
                            </div>
                          </div>
                          <div className={`relative ${isInteractionDisabled || isDisabled || isBlurred ? "blur-effect pointer-events-none" : ""}`}>
                            <button
                              className="w-24 h-7 flex flex-row ml-2 px-2 rounded-md cursor-pointer justify-center items-center font-medium text-xs bg-purpleshade1 text-white"
                              onClick={openDateFilter}
                            >
                              Date Filter
                            </button>
                            {showDateFilter && (
                              <div className="fixed bg-white border-none shadow-xl shadow-slate-500/50 rounded mt-1 p-3 flex flex-col space-y-2 z-50">
                                <DateRange
                                  ranges={[selectionRange]}
                                  onChange={handleSelect}
                                  className="w-full "
                                />
                                <div className="flex space-x-4 ">
                                  <button
                                    className="w-28 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center items-center font-medium text-xs bg-purpleshade1 text-white"
                                    onClick={handleDateFilterOK}
                                  >
                                    OK
                                  </button>
                                  <button
                                    className="w-28 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center items-center font-medium text-xs bg-purpleshade1 text-white"
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
                            disabled={isDownloading}
                            className={`w-24 h-7 flex flex-row px-4 rounded-md justify-center items-center font-medium text-xs bg-purpleshade1 text-white ${
                              isDownloading ? "bg-purpleshade1 cursor-not-allowed" : "cursor-pointer"
                            } ${showDateFilter ? "pointer-events-none" : ""}`}
                            onClick={handleDownload}
                          >
                            {isDownloading ? "Downloading..." : "Download"}
                          </button>
                        </div>
                        <div className={`global-Column-config-data-container flex flex-col items-center space-y-0.75 ${isInteractionDisabled ? "blur-effect" : ""}`}>
                          <div className={`global-Column-config-table-header flex rounded-t-xl ${isInteractionDisabled ? "blur-effect" : ""}`}>
                            <table className="table-design table-fixed w-full">
                              <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
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
                                  <th className="w-[13%] text-left py-2 rounded-tr-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                                    Activity Time
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div>
                          <div className={`global-Column-config-table-container flex flex-col rounded-b-xl items-center shadow-md shadow-slate-500/30 bg-white`}>
                            <div
                              className={`global-Column-config-table-data overflow-auto adjusted-margin-top ${isInteractionDisabled ? "blur-effect" : ""}`}
                              style={{ scrollbarWidth: "thin" }}
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
                                          <td className="w-[20%] font-light text-left text-[11px] px-4 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                            {item.user}
                                          </td>
                                          <td className="w-[14%] font-light text-left text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                            {item.activity}
                                          </td>
                                          <td className="w-[40%] font-light text-left text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                            {item.activity_info && typeof item.activity_info === "object"
                                              ? Object.entries(item.activity_info)
                                                  .map(([k, v]) => `${k}: ${v}`)
                                                  .join(", ")
                                              : item.activity_info}
                                          </td>
                                          <td className="w-[13%] font-light text-left text-[11px] overflow-ellipsis whitespace-nowrap overflow-hidden">
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
                          {isDownloading && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center ">
                              <div className="w-60 rounded-xl bg-white px-4 py-3 shadow-2xl">
                                {!downloadCompleted ? (
                                  <>
                                    <div className="flex justify-center mb-4">
                                      <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin"></div>
                                    </div>
                                    <h3 className="text-center text-sm font-semibold text-gray-800">
                                      Downloading User Activity Report
                                    </h3>
                                    <p className="mt-2 text-center text-xs text-gray-500">
                                      Please wait while your report is being prepared.
                                    </p>
                                    <div className="mt-4 flex justify-center">
                                      <div className="rounded-lg bg-purple-50 px-5 py-2">
                                        <span className="text-sm font-semibold text-purpleshade1">
                                          {downloadSeconds}{" "}
                                          {downloadSeconds === 1 ? "second" : "seconds"}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="mt-3 text-center text-[11px] text-gray-400">
                                      Please do not close or refresh this page.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-center mb-4">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <span className="text-2xl text-green-600">✓</span>
                                      </div>
                                    </div>
                                    <h3 className="text-center text-sm font-semibold text-gray-800">
                                      Download Complete
                                    </h3>
                                    <p className="mt-2 text-center text-xs text-gray-500">
                                      User Activity Report has been downloaded successfully.
                                    </p>
                                    <div className="mt-4 flex justify-center">
                                      <div className="rounded-lg bg-green-50 px-5 py-2">
                                        <span className="text-sm font-semibold text-green-700">
                                          Completed in {downloadSeconds}{" "}
                                          {downloadSeconds === 1 ? "second" : "seconds"}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                  {/* Left Column (Fluid 25%) */}
                 

                  {selectedOption === "User Activity Report" && (
                  <div className="layout-page-container flex items-center justify-between px-3 ">
                    <div
                      className={`page-button-container flex flex-row justify-between items-center ${
                        isInteractionDisabled || showDateFilter || showDownloadPopup ? " pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex h-6 flex-row space-x-4">
                        <span className="mt-1 h-6 font-light text-[11px]">
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
                            data.length < pageSize || currentPage >= totalPages
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={handleNextPage}
                          disabled={data.length < pageSize || currentPage >= totalPages}
                        >
                          <img
                            src={process.env.PUBLIC_URL + "/more-than.png"}
                            alt="Next Page"
                            className="w-3 h-3"
                          />
                        </button>
                      </div>

                      <div className="relative inline-block ">
                        <button
                          id="pageSizeDropdownButton"
                          onClick={toggleDropdown}
                          className="font-light rounded-lg text-[11px] px-3 py-1 text-center inline-flex items-center text-black bg-[#E8E8E8]"
                          type="button"
                        >
                          Page Size: {pageSize}{" "}
                          <svg
                            className={`w-2.5 h-2.5 ms-3 ${isOpen ? "rotate-180" : ""}`}
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
                          className={`z-10 ${
                            isOpen ? "" : "hidden"
                          } bg-background-100 border divide-y text-white divide-secondary rounded-lg shadow-top w-28 dark:bg-primary absolute bottom-full mt-1`}
                        >
                          <ul
                            className="py-1 text-[11px] text-black dark:text-gray-200"
                            aria-labelledby="pageSizeDropdownButton"
                          >
                            {[10, 25, 50, 100].map((size) => (
                              <li key={size}>
                                <button
                                  type="button"
                                  onClick={() => handleOptionClick(size)}
                                  className="block px-3 py-0.5 text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                  {size}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                )}
                </div>

               
              </div>
            </div>
          </div>
        </div>

        <div className={`chatbot-margin ${isDisabled || isBlurred || isInteractionDisabled || showDateFilter || showDownloadPopup ? "pointer-events-none" : ""}`}>
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
            onClose={() => setShowChatbot(false)}
          />
        )}
      </div>
    </>
  );
};

export default Reports;
