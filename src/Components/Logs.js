import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { css } from "@emotion/react";
import authService from "./auth";
import Sidebar from "./Sidebar";
import { API_URL } from "./ApiConfig";
import Chatbot from "./Chatbot";
import ProfileModal from "./ProfileModal";
import TimezoneModal from "./TimeZoneModal";
import ErrorPopup from "./ErrorPopup";
import { useUI } from "./Context/UIContext";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const Logs = () => {
  const {isDisabled,isBlurred} = useUI()
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [token, setToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
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
        event.preventDefault();

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await authService.getToken();
        const dataObject = JSON.parse(fetchedToken);
        const token = dataObject.data.token;
        setToken(token);
        const csrfToken = authService.getCsrfToken();
        setCsrfToken(csrfToken);
        fetchSystemStatus(token);
      } catch (error) {
        console.error("Token error:", error);
      }
    };

    fetchToken();
  }, []);

  // Auto-refresh system status every 30 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchSystemStatus(token);
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const fetchSystemStatus = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/system-status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          const responseData = await response.json();
          if (responseData.error === "Access token has expired") {
            window.location.href = "/";
            return;
          }
        }
        throw new Error("Failed to fetch system status");
      }

      const data = await response.json();
      setSystemStatus(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching system status:", error);
      setError("No logs Found");
      setIsPopupOpen(true);
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case "healthy":
        return "#28a745";
      case "warning":
        return "#ffc107";
      case "critical":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case "healthy":
        return "✅";
      case "warning":
        return "⚠️";
      case "critical":
        return "🚨";
      default:
        return "❓";
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false);
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    setSelectedNavbarOption(null);
  };

  const handleChatbotIconClick = () => {
    setShowChatbot(!showChatbot);
  };

  const handleOptionSelect = (option) => {
    setSelectedNavbarOption(option);

    if (option === "Profile") {
      setShowProfileModal(true);
      setIsTimezoneModalOpen(false);
    } else if (option === "Select Time Zone") {
      setIsTimezoneModalOpen(true);
      setShowProfileModal(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value) => {
    // Handle page size change if needed
    setIsOpen(false);
  };

  const handleInputChange = async (e) => {
    const inputText = e.target.value.toLowerCase();
    setSearchQuery(inputText);
  };

  const handleTaskSearchClick = async () => {
    // Handle search functionality
    fetchSystemStatus(token);
  };

  const { width, height } = getViewportDimensions();

  const marginLeft = (width * 13) / 1440;
  const navWidth = (width * 0.98).toFixed(2);
  const navHeight = (height * 0.09).toFixed(2);
  const navMarginTop = (height * 0.02).toFixed(2);
  const containerWidth = (width * 0.91).toFixed(2);
  const containerHeight = (height * 0.85).toFixed(2);
  const containerMTop = (height * 0.13).toFixed(2);
  const cMarginTop = `${(containerMTop - (parseFloat(navHeight) + parseFloat(navMarginTop))).toFixed(2)}`;
  const PContainerHeight = `${(height - (parseFloat(navHeight) + parseFloat(navMarginTop))).toFixed(2)}`;
  const sidebarWidth = `${(width * 0.06).toFixed(2)}`;
  const sidebarHeight = `${(height * 0.98).toFixed}`;
  const sidebarLMargin = `${(width * 0.01).toFixed(2)}`;
  const containerMarginLeft = `${(width * 0.081).toFixed(2)}`;
  const cMarginLeft = `${(containerMarginLeft - (parseFloat(sidebarWidth) + parseFloat(sidebarLMargin))).toFixed(2)}px`;
  const subContainerWidth = `${(containerWidth * 0.97).toFixed(2)}`;
  const subContainerHeight = `${(containerHeight * 0.83).toFixed(2)}`;
  const subContainerTMargin = `${(containerHeight * 0.12 - parseFloat(cMarginTop)).toFixed(2)}`;
  const routeContainerHeight = `${(containerHeight * 0.07).toFixed(2)}`;
  const folderContainerHeight = `${(subContainerHeight * 0.8).toFixed(2)}`;
  const folderSunContainerHeight = `${(folderContainerHeight * 0.92).toFixed(2)}`;

  return (
    <div
      className="bg-primary"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className="flex flex-col items-center "
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className={`${showChatbot ? "pointer-events-none" : ""} 
                    ${showProfileModal ? "pointer-events-none" : ""}
                    ${isTimezoneModalOpen ? "pointer-events-none" : ""}`}
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
            className={`bg-white rounded-lg shadow-lg shadow-slate-500/50 ${showChatbot ? "pointer-events-none" : ""} 
                    ${showProfileModal ? "pointer-events-none" : ""}
                    ${isTimezoneModalOpen ? "pointer-events-none" : ""}`}
            style={{
              width: `${sidebarWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: `${sidebarLMargin}px`,
            }}
          >
            <Sidebar isSidebarOpen={isSidebarOpen} />
          </div>
          {/* <div
            className={`w-[6vw] min-w-[80px] max-w-[100px] h-full flex-shrink-0 py-1 ${isDisabled || isBlurred ? "pointer-events-none" : ""}`}
          >
            {/* Inner Sidebar Card - This handles the background color, rounding, and shadow */}
            {/* <div className="w-full h-full bg-white rounded-lg shadow-lg shadow-slate-400/50 flex items-center justify-center py-4">
              <Sidebar />
            </div>
          </div> */} 
          <div
            className=" bg-white flex flex-col  rounded-lg items-center  shadow-md shadow-slate-500/30 "
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              marginTop: `${cMarginTop}px`,
              marginLeft: cMarginLeft,
            }}
          >
            <div
              className={` flex flex-row text-purpleshade1  items-center text-sm font-medium ml-4  
                  ${showChatbot ? "pointer-events-none" : ""} 
                    ${showProfileModal ? "pointer-events-none" : ""}
                    ${isTimezoneModalOpen ? "pointer-events-none" : ""}`}
              style={{
                width: `${(containerWidth * 0.98).toFixed(2)}px`,
                height: `${(containerHeight * 0.07).toFixed(2)}px`,
                marginTop: `${cMarginTop}px`,
              }}
            >
              {/* name */}
              <Link to="/home">Home</Link> &gt; Error Logs
            </div>
            <div
              className="rounded-lg flex flex-col bg-newgray shadow-md shadow-slate-500/30"
              style={{
                width: `${subContainerWidth}px`,
                height: `${subContainerHeight}px`,
              }}
            >
              {/* <div className="" style={{width:`${subContainerWidth}px`,height:`${(subContainerHeight * 0.07).toFixed(2)}px`}}></div> */}

              <div
                className="bg-newgray rounded-t-lg flex flex-row items-center px-8"
                style={{
                  width: `${subContainerWidth}px`,
                  height: `${(subContainerHeight * 0.15).toFixed(2)}px`,
                }}
              >
                <div
                  className={`flex flex-row justify-between items-center w-72 h-9 rounded  p-1 shadow-md shadow-slate-500/30  bg-white
                    ${showChatbot ? "blur-effect pointer-events-none" : ""} 
                    ${showProfileModal ? "blur-effect pointer-events-none" : ""}
                    ${
                      isTimezoneModalOpen
                        ? "blur-effect pointer-events-none"
                        : ""
                    }`}
                >
                  <input
                    type="text"
                    placeholder="Search here"
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTaskSearchClick(); // Trigger API call on Enter key press
                      }
                    }}
                    className="outline-none ml-3 font-[350] text-[12px] w-[250px]  bg-white "
                    value={searchQuery}
                  />
                  <div className="flex flex-row space-x-2">
                    <button
                      className="bg-background-100 text-2xl font-semibold "
                      onClick={() => {
                        setSearchQuery(""); // Clear the input field
                        fetchSystemStatus(token); // Fetch the data with an empty search query
                      }}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/closefile.png"}
                        alt="close"
                        className="h-[16px] w-[17px]"
                      />
                    </button>
                    <img
                      src={process.env.PUBLIC_URL + "/search_icon.png"}
                      alt="search"
                      className="w-4 h-4 "
                      onClick={handleTaskSearchClick}
                    />
                  </div>
                </div>
              </div>

              <div
                className="flex flex-col items-center px-6 "
                style={{
                  width: `${subContainerWidth}px`,
                  height: `${folderContainerHeight}px`,
                }}
              >
                <div
                  className={`flex flex-col items-center ${
                    showChatbot ? "blur-effect pointer-events-none" : ""
                  } 
                   ${
                     showProfileModal ? "blur-effect pointer-events-none" : ""
                   }${
                     isTimezoneModalOpen
                       ? "blur-effect pointer-events-none"
                       : ""
                   }`}
                  style={{
                    width: `${(subContainerWidth * 0.95).toFixed(2)}px`,
                    height: `${folderSunContainerHeight}px`,
                  }}
                >
                  <table className="table-design table-fixed w-full border-collapse">
                    <colgroup>
                      <col className="w-[18%]" />
                      <col className="w-[12%]" />
                      <col className="w-[70%]" />
                    </colgroup>
                    <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white shadow-sm">
                      <tr>
                        <th className="py-3 sticky top-0 px-6 rounded-tl-lg font-semibold text-sm text-left">
                          File Name
                        </th>
                        <th className="py-3 sticky top-0 px-6 font-semibold text-sm text-left">
                          Timestamp
                        </th>
                        <th className="py-3 sticky top-0 px-6 rounded-tr-lg font-semibold text-sm text-left">
                          Error Line
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <div
                    className={`flex flex-col items-center bg-white rounded-b-lg shadow-lg shadow-slate-500/20 mt-1
                    ${showChatbot ? "blur-effect" : ""} 
                    ${showProfileModal ? "blur-effect" : ""}
                    ${isTimezoneModalOpen ? "blur-effect" : ""}`}
                    style={{
                      width: `${(subContainerWidth * 0.95).toFixed(2)}px`,
                      height: `${(folderSunContainerHeight * 0.9).toFixed(
                        2,
                      )}px`,
                      scrollbarWidth: "thin",
                    }}
                  >
                    <div
                      className={`flex flex-col items-center overflow-y-auto scrollbar-thin scrollbar-thumb-purpleshade1 scrollbar-track-gray-100 hover:scrollbar-thumb-purpleshade1/80`}
                      style={{
                        width: `${(subContainerWidth * 0.95).toFixed(2)}px`,
                        height: `${(
                          folderSunContainerHeight *
                          0.9 *
                          0.95
                        ).toFixed(2)}px`,
                        scrollbarWidth: "thin",
                      }}
                    >
                      <table className="table-design table-fixed w-full border-collapse">
                        <tbody>
                          {loading ? (
                            <tr>
                              <td
                                colSpan="3"
                                className="w-full h-full flex flex-col justify-center items-center space-y-4 py-16"
                              >
                                <img
                                  src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                                  alt="Loading..."
                                  className="animate-spin w-10 h-10"
                                />
                                <p className="text-logintext font-medium text-sm animate-pulse">
                                  Loading error logs...
                                </p>
                              </td>
                            </tr>
                          ) : systemStatus &&
                            systemStatus.error_logs &&
                            systemStatus.error_logs.length > 0 ? (
                            systemStatus.error_logs.map((log, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50/80 transition-colors duration-200"
                              >
                                <td className="w-[18%] font-medium text-xs px-6 py-4 text-left overflow-hidden text-ellipsis whitespace-nowrap text-purpleshade1">
                                  {log.log_file}
                                </td>
                                <td className="w-[12%] font-medium text-xs px-6 py-4 text-left overflow-hidden text-ellipsis whitespace-nowrap text-gray-600">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="w-[70%] font-normal text-xs px-6 py-4 text-left leading-relaxed text-gray-800">
                                  {log.line}
                                </td>
                              </tr>
                            ))
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute ${
              showProfileModal ? "pointer-events-none" : ""
            }
                    ${isTimezoneModalOpen ? "pointer-events-none" : ""}  `}
            style={{
              marginLeft: `${(width * 0.94).toFixed(2)}px`,
              marginTop: `${(height * 0.75).toFixed(2)}px`,
            }}
          >
            <img
              src={process.env.PUBLIC_URL + "/chat-icon.png"}
              alt="Chat Icon"
              className="w-12 h-12 cursor-pointer animate-floating "
              onClick={handleChatbotIconClick}
            />
          </div>
        </div>

        <TimezoneModal
          isTimezoneModalOpen={isTimezoneModalOpen}
          closePreviewModal={handleCloseChatbot}
          setIsTimezoneModalOpen={setIsTimezoneModalOpen}
          setSelectedNavbarOption={setSelectedNavbarOption}
        />

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
          onClose={handleClosePopup}
        />
      </div>
    </div>
  );
};

export default Logs;
