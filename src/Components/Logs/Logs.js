import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Navbar from "./Navbar";
import Navbar from "../Navbar/Navbar";
import { css } from "@emotion/react";
import authService from "../auth";
// import Sidebar from "./Sidebar";
import Sidebar from "../Sidebar/Sidebar";
import { API_URL } from "../ApiConfig";
import Chatbot from "../Chatbot";
import ProfileModal from "../ProfileModal";
import TimezoneModal from "../TimeZoneModal";
import ErrorPopup from "../ErrorPopup";
import { useUI } from "../Context/UIContext";
import "./logs.css";
// import "./logsstyle.css";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../csrfUtils";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const Logs = () => {
   const { token, csrfToken, permissions } = useAuth();
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

 

  // Auto-refresh system status every 30 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchSystemStatus(token);
    }, 300000);

    return () => clearInterval(interval);
  }, [token]);

  const fetchSystemStatus = async (token) => {
    try {
      const response = await apiRequest(`${API_URL}/api/admin/system-status/`, 
        "POST",
        {},
      );

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

 

  const isInteractionDisabled = isPopupOpen ||  showChatbot;

 return (
  <>
   <div className="log-container">
           <div className="log-app-container bg-primary">
             <div className="w-full h-full flex flex-col items-center vertical-gap container-padding ">
               <div
                 className={`log-navbar-wrapper  flex ${isDisabled || isBlurred || isInteractionDisabled ? "  pointer-events-none" : ""}`}
               >
                 <Navbar />
               </div>
               <div className="log-wrapper horizantal-gap">
            <div
              className={`log-sidebar ${
                isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""
              }`}
            >
              <Sidebar />
            </div>
            
            {/* If you have a log console display, place it here next to the sidebar */}
            <div className={`log-sub-container  bg-white items-center  rounded-lg shadow-xl shadow-slate-400/50 overflow-hidden 
                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}>
             <div
              className={`navigate-home navigate-text flex flex-row text-purpleshade1  items-center text-sm font-medium px-4 `} 
                 
            >
              {/* name */}
              <Link to="/home">Home</Link> &gt; Error Logs
            </div>
             <div
              className={`log-data-wrapper rounded-lg flex flex-col bg-newgray shadow-md shadow-slate-500/30`}>
                <div
                  className={` log-search-wrapper  flex items-center `}
                >
                    <div className={`log-search-container bg-white flex flex-row justify-between items-center  rounded  px-0.5 py-1 shadow-md shadow-slate-500/30  
                    ${isDisabled || isBlurred || isInteractionDisabled ? "blur-effect pointer-events-none" : ""}`}>
                  <input
                    type="text"
                    placeholder="Search here..."
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTaskSearchClick(); // Trigger API call on Enter key press
                      }
                    }}
                    className="outline-none ml-3 font-[350] text-[12px] log-search-bar-width  bg-white "
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
                        className="log-search-image"
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
                <div className={`logs-table-container flex flex-col items-center  `}>
                    <div className={`logs-table flex flex-col items-center 
                        ${isDisabled || isBlurred || isInteractionDisabled ? "blur-effect pointer-events-none" : ""}`}>
                        <div className={`logs-table-header flex items-center  bg-purpleshade1 rounded-t-lg `}>
                            <table className="table-design table-fixed w-full">
                    <colgroup>
                      <col className="w-[30%]" />
                      <col className="w-[15%]" />
                      <col className="w-[45%]" />
                    </colgroup>
                    <thead className="bg-purpleshade1 sticky top-0 rounded-t-lg text-white shadow-sm items-center">
                      <tr>
                        <th className=" py-2 sticky top-0 px-10 rounded-tl-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                          File Name
                        </th>
                        <th className="py-2 sticky top-0 font-normal text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                          Timestamp
                        </th>
                        <th className="py-2 sticky top-0 rounded-tr-lg font-medium text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                          Error Line
                        </th>
                      </tr>
                    </thead>
                  </table>

                        </div>
                        <div className={`logs-table-data flex flex-col items-center bg-white rounded-b-lg shadow-lg shadow-slate-500/20 mt-1 ${isInteractionDisabled ? "blur-effect pointer-events-none" : ""}`}>
                            <div className={`logs-data flex flex-col items-center overflow-y-auto scrollbar-thin scrollbar-thumb-purpleshade1 scrollbar-track-gray-100 hover:scrollbar-thumb-purpleshade1/80`}
                      style={{
                       scrollbarWidth: "thin",
                      }}>
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
                                  className="animate-spin w-8 h-8"
                                />
                                <p className="text-logintext font-normal text-xs animate-pulse">
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
                                <td className="w-[30%] font-medium text-xs px-6 py-4 text-left overflow-ellipsis whitespace-nowrap overflow-hidden text-purpleshade1">
                                  {log.log_file}
                                </td>
                                <td className="w-[15%] font-medium text-xs px-6 py-4 text-left overflow-hidden text-ellipsis whitespace-nowrap text-gray-600">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="w-[45%] font-normal text-xs px-6 py-4 text-left leading-relaxed text-gray-800 overflow-ellipsis whitespace-nowrap overflow-hidden">
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
          </div>

        </div>
      </div>
       <div
                className={`chatbot-margin  ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""} `}
              >
                <img
                  src={process.env.PUBLIC_URL + "/chat-icon.png"} // Replace with the path to your chat icon
                  alt="Chat Icon"
                  className="w-12 h-12 cursor-pointer animate-floating "
                  onClick={handleChatbotIconClick}
                />
              </div>
              {showChatbot && (
                <Chatbot
                  onClose={handleCloseChatbot} // Pass handleCloseChatbot to Chatbot
                  isOpen={showChatbot} // Pass isOpen state to Chatbot
                />
              )}
              {showProfileModal && (
                <ProfileModal
                  isOpen={showProfileModal}
                  onClose={handleCloseChatbot}
                />
              )}
              <TimezoneModal
                isTimezoneModalOpen={isTimezoneModalOpen}
                closePreviewModal={handleCloseChatbot}
                setIsTimezoneModalOpen={setIsTimezoneModalOpen}
                setSelectedNavbarOption={setSelectedNavbarOption}
              />
      
              <ErrorPopup
                isOpen={isPopupOpen}
                message={error}
                // onClose={closePreviewModal}
                onClose={handleClosePopup}
              />
    </div>
  </>
);
  
};

export default Logs;
