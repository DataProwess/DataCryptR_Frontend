import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "./auth";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHurricane } from "@fortawesome/free-solid-svg-icons";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "./V1_Sidebar";
import { API_URL } from "./ApiConfig";
import Chatbot from "./Chatbot";
import ProfileModal from "./ProfileModal";
import TimezoneModal from "./TimeZoneModal";
import "./tasks.css";
import ErrorPopup from "./ErrorPopup";
import { apiRequest } from "./csrfUtils";
import { useUI } from "./Context/UIContext";

library.add(faCheck, faTimes, faSpinner, faHurricane, faAsterisk);
// const getZoomLevel = () => Math.round(window.devicePixelRatio * 100);
const getZoomLevel = () => {
  // Calculate zoom level as a percentage
  const zoomPercentage = Math.round(
    (window.innerWidth / document.documentElement.clientWidth) * 100,
  );
  return zoomPercentage;
};

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const Tasks = () => {
  const {isDisabled,isBlurred} =useUI()
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // eslint-disable-next-line
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  // const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line
  const [isDataArray, setIsDataArray] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  // eslint-disable-next-line
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(getZoomLevel());
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

  useEffect(() => {
    const updateZoomLevel = () => {
      setZoomLevel(getZoomLevel());
    };

    // Add event listener for resize to detect zoom changes
    window.addEventListener("resize", updateZoomLevel);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateZoomLevel);
    };
  }, []);

  useEffect(() => {
    const calculateZoomLevel = () => {
      // Calculate zoom level based on clientWidth and outerWidth
      const clientWidth = document.documentElement.clientWidth;
      const outerWidth = window.outerWidth;

      // Calculate zoom percentage
      const zoom = Math.round((outerWidth / clientWidth) * 100);

      setZoomLevel(zoom);
    };

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
      calculateZoomLevel(); // Recalculate zoom on resize
    };

    window.addEventListener("resize", handleResize);

    // Initial calculation
    calculateZoomLevel();

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

  const fetchToken = useCallback(async () => {
    try {
      const fetchedToken = await authService.getToken();
      const dataObject = JSON.parse(fetchedToken);
      const token = dataObject.data.token;
      setToken(token);
      const csrfToken = authService.getCsrfToken();
      setCsrfToken(csrfToken);
    } catch (error) {
      console.error("Token error:", error);
    }
  }, []);

  const fetchTaskReport = useCallback(
    async (token, currentPage = 1, pageSize = 10, searchQuery = "") => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

        // ✅ SECURE - Using apiRequest utility with automatic CSRF handling
        const responseData = await apiRequest(
          `${API_URL}/api/blob/list_tasks/`,
          "POST",
          {
            page_number: currentPage,
            page_size: pageSize,
            search_query: searchQuery,
          },
        );

        const tasks = responseData.mytasks || [];

        if (Array.isArray(tasks)) {
          const total = responseData.total || 0;
          setData(tasks);
          setIsDataArray(true);

          // Update the totalPages based on search result and total count
          const totalPages = Math.ceil(total / pageSize);
          setTotalPages(totalPages);

          setLoading(false);
          return tasks; // Return the tasks array
        } else {
          console.error("Invalid API response:", responseData);
          setLoading(false);
          return []; // Return an empty array if the response is invalid
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        return []; // Return an empty array on error
      }
    },
    // eslint-disable-next-line
    [],
  );

  useEffect(() => {
    if (token) {
      fetchTaskReport(token, currentPage, pageSize, searchQuery);
    }
    // eslint-disable-next-line
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handlePageSizeChange = async (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      await fetchTaskReport(token, 1, newSize, searchQuery); // Use newSize and page 1
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      try {
        await fetchTaskReport(token, nextPage, pageSize);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1) {
      const previousPage = currentPage - 1;
      setCurrentPage(previousPage);

      try {
        await fetchTaskReport(token, previousPage, pageSize);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (value) => {
    handlePageSizeChange(value);
    setIsOpen(false);
  };

  const handleInputChange = async (e) => {
    const inputText = e.target.value.toLowerCase();
    setSearchQuery(inputText);
  };

  const handleTaskSearchClick = async () => {
    try {
      const result = await fetchTaskReport(token, 1, pageSize, searchQuery); // Pass pageSize

      if (result && result.length > 0) {
        setData(result); // Populate the data in the UI
        setError(""); // Clear any previous error messages
        setIsPopupOpen(false);
        setCurrentPage(1); // Reset to the first page for new search
        setPageSize(10);
      } else {
        setSearchQuery(""); // Clear any previous search results
        setError("No data found for the search query."); // Display no data found message
        setIsPopupOpen(true); // Open the popup to display the error message
      }
    } catch (error) {
      setSearchQuery("");
      setError("An error occurred while searching. Please try again."); // Handle potential API errors
      setIsPopupOpen(true); // Open the popup to display the error message
    }
  };

  const closePreviewModal = () => {
    setIsPopupOpen(false); // Close the popup
    setSearchQuery(""); // Clear the search input field

    fetchTaskReport(token, currentPage, pageSize);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "Blue";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <FontAwesomeIcon icon={faCheck} color="green" className="ml-1" />
        );
      case "failed":
        return <FontAwesomeIcon icon={faTimes} color="red" className="ml-1" />;
      default:
        return (
          <img
            src={process.env.PUBLIC_URL + "/loader.png"}
            alt="loader"
            className="w-4 h-4 inline-block align-middle animate-spin"
            style={{ verticalAlign: "middle" }}
          />
        );
    }
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

  const { width, height } = getViewportDimensions();
  const { vw, vh } = getViewportDimensions();
  const navWidth = (width * 0.98).toFixed(2);
  const navHeight = (height * 0.09).toFixed(2);
  const navMarginTop = (height * 0.02).toFixed(2);
  const containerWidth = (width * 0.91).toFixed(2);
  const containerHeight = (height * 0.85).toFixed(2);
  const containerMTop = (height * 0.13).toFixed(2);
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
  const subContainerWidth = `${(containerWidth * 0.97).toFixed(2)}`;
  const subContainerHeight = `${(containerHeight * 0.8).toFixed(2)}`;
  const folderContainerHeight = `${(subContainerHeight * 0.8).toFixed(2)}`;
  const folderSunContainerHeight = `${(folderContainerHeight * 0.92).toFixed(
    2,
  )}`;

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
          className={` ${showChatbot ? "pointer-events-none" : ""} 
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
          className="flex flex-row  "
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
              <Link to="/home">Home</Link> &gt; Tasks
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
                        fetchTaskReport(token, currentPage, pageSize); // Fetch the data with an empty search query
                        setCurrentPage(1);
                        setPageSize(10);
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
                  <table className="table-design table-fixed w-full">
                    <colgroup>
                      <col className="w-[55%]" />
                      <col className="w-[35%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead className="bg-purpleshade1 sticky top-0 rounded-tr-lg rounded-tl-lg text-white ">
                      <tr>
                        <th className="py-2 sticky top-0 px-10 rounded-tl-lg font-medium text-xs ">
                          Task Name
                        </th>
                        <th className="py-2 sticky  top-0 font-medium text-xs ">
                          Created At
                        </th>
                        <th className="py-2 sticky top-0 rounded-tr-lg font-medium text-xs">
                          Status
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <div
                    className={`flex flex-col items-center bg-white rounded-b-lg shadow-md shadow-slate-500/30 mt-1
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
                      className={`flex flex-col items-center  overflow-auto `}
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
                            data.map((task) =>
                              task.task_name || task.status ? (
                                <tr key={task.id} title={task.help_text}>
                                  <td className="w-[55%] font-light text-[11px] text-center px-10 overflow-ellipsis whitespace-nowrap overflow-hidden">
                                    {task.task_name}
                                  </td>
                                  <td className="w-[35%] font-light text-[11px] overflow-ellipsis whitespace-nowrap overflow-hidden">
                                    {task.created_at}
                                  </td>
                                  <td
                                    className="w-[15%] font-light text-[11px] px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"
                                    style={{
                                      color: getStatusColor(task.status),
                                    }}
                                  >
                                    {getStatusIcon(task.status)}
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
            </div>

            <div
              className=" flex flex-row items-center justify-between p-2 "
              style={{
                width: `${(containerWidth * 0.98).toFixed(2)}px`,
                height: `${(containerHeight * 0.08).toFixed(2)}px`,
                marginTop: `${cMarginTop}px`,
              }}
            >
              <div
                className={`flex flex-row items-center ml-2 space-x-4
                  ${showChatbot ? "pointer-events-none" : ""} 
                  ${showProfileModal ? "pointer-events-none" : ""}
                  ${isTimezoneModalOpen ? "pointer-events-none" : ""}`}
              >
                <span className="font-light text-[11px]">
                  {currentPage} of {totalPages}
                </span>
                <button
                  className={`w-3 h-3 font-bold m-0.5 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/less-than.png"}
                    alt="Previous Page"
                    className="w-3 h-3 mt-0.5"
                  />
                </button>

                <button
                  className={`cursor-pointer ${
                    data.length < pageSize ? "opacity-50 " : ""
                  }`}
                  onClick={handleNextPage}
                  disabled={data.length < pageSize}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/more-than.png"}
                    alt="Next Page"
                    className="w-3 h-3 mt-0.5"
                  />
                </button>
              </div>

              <div
                className={`relative inline-block
              ${showChatbot ? "pointer-events-none" : ""} 
              ${showProfileModal ? "pointer-events-none" : ""}
              ${isTimezoneModalOpen ? "pointer-events-none" : ""}`}
              >
                <button
                  id="pageSizeDropdownButton"
                  onClick={toggleDropdown}
                  className="text-black font-light text-[11px] rounded-lg  px-3 py-1 text-center inline-flex items-center bg-gray"
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

                {/* Dropdown menu */}
                <div
                  className={`z-10 ${isOpen ? "" : "hidden"} ${
                    showChatbot ? "pointer-events-none" : ""
                  } 
                ${showProfileModal ? "pointer-events-none" : ""}
                ${
                  isTimezoneModalOpen ? "pointer-events-none" : ""
                } bg-background-100 divide-y divide-secondary rounded-lg shadow-top w-28
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
                        // className="block px-2 py-1 text-start w-full hover:bg-purpleshade10 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        10
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleOptionClick(25)}
                        // className="block px-2 py-1 text-start w-full hover:bg-purpleshade10 dark:hover:bg-gray-600 dark:hover:text-white"
                        className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        25
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleOptionClick(50)}
                        // className="block px-2 py-1 text-start w-full hover:bg-purpleshade10 dark:hover:bg-gray-600 dark:hover:text-white"
                        className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        50
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleOptionClick(100)}
                        className="block px-3 py-0.5  text-start text-black w-full hover:bg-purpleshade1 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        100
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`
               ${showProfileModal ? "pointer-events-none" : ""}`}
            style={{
              marginLeft: `${(width * 0.95).toFixed(2)}px`,
              marginTop: `${(height * 0.72).toFixed(2)}px`,
              position: "absolute",
              // zIndex: 1000,
            }}
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
            onClose={closePreviewModal}
            // onClose={handleClosePopup}
          />
        </div>
      </div>

      {showZoomPopup && (
        <div className="fixed top-8 bg-white border border-gray-300 rounded p-2 shadow ">
          <p>Zoom Level: {zoomLevel}%</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
