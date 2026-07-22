import React, { useState, useEffect } from "react";
import authService from "./auth";
import "./userreport.css";
import Sidebar from "./Sidebar";
import { css } from "@emotion/react";
import { RingLoader } from "react-spinners";
import { API_URL } from "./ApiConfig"
import { getCSRFToken } from "./csrfUtils";

// const API_URL = "http://74.235.117.56:80"
// const API_URL = "http://127.0.0.1:8000"

const UserReport = () => {
  // eslint-disable-next-line 
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);
  const [data, setData] = useState([]); // API response data
  const [pageSize, setPageSize] = useState(25); // Number of rows per page
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [startDate, setStartDate] = useState(""); // Start date for filtering
  const [endDate, setEndDate] = useState(""); // End date for filtering
  const [showDateFilter, setShowDateFilter] = useState(false); // Show/hide date filter modal
  // eslint-disable-next-line 
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // eslint-disable-next-line 

  const override = css`
  display: block;
  margin: 0 auto;
  border-color: red; // You can customize the color
`;
  

  useEffect(() => {
    // Fetch the token and set it in the state
    const fetchToken = async () => {
      try {
        const fetchedToken = await authService.getToken();
        const dataObject = JSON.parse(fetchedToken);

        // Access the token property from the data object
        const token = dataObject.data.token;
        setToken(token);
      } catch (error) {
        console.error("Token error:", error);
      }
    };

    // Call the fetchToken
    fetchToken();
   
  }, []);

  useEffect(() => {
    fetchUserReport();
    // eslint-disable-next-line 
  }, [currentPage, pageSize, token, searchQuery]);

  const fetchUserReport = async () => {
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(
        `${API_URL}/api/admin/get-user-reports/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            page_number: currentPage,
            page_size: pageSize,
            start_date: startDate,
            end_date: endDate,
            search_query: searchQuery,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      setData(responseData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to the first page when changing page size
  };

  // Handle next page click
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Handle previous page click
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  // Handle date filter OK button click
  const handleDateFilterOK = () => {
    setShowDateFilter(false);
    fetchUserReport(); // Hide date filter modal
  };

  // Handle date filter cancel button click
  const handleDateFilterCancel = () => {
    // Reset date filter values
    setStartDate("");
    setEndDate("");
    setShowDateFilter(false); // Hide date filter modal
  };

  // Open the date filter modal
  const openDateFilter = () => {
    setShowDateFilter(true);
  };

  // Check if data is an array before mapping
  const isDataArray = Array.isArray(data);

  const handleDownload = async () => {
    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(
        `${API_URL}/api/admin/download-csv/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ start_date: startDate, end_date: endDate, search_query: searchQuery }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiResponse = await response.json();

      // Extracting keys ["user", "activity", "activity_time"] from the objects
      const headers = Object.keys(apiResponse.data[0]).filter(
        (key) => key !== "id"
      );

      const rowData = Object.values(apiResponse.data).map((obj) => {
        return headers.map((key) => obj[key]);
      });

      // Create CSV content
      const csvContent = [
        headers.join(","), // Header row
        ...rowData.map((row) => row.join(",")), // Data rows
      ].join("\n");

      // Create a Blob containing the CSV data
      const blob = new Blob([csvContent], { type: "text/csv" });

      // Create a download link
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "user_report.csv";

      // Trigger a click event to start the download
      link.click();
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
    setIsDownloaded(true);
  };


  const handleInputChange = async (e) => {
    const inputText = e.target.value.toLowerCase();
    setSearchQuery(inputText);
  };

  

  return (
    <div className="flex items-center justify-center h-screen">
    {loading ? (
      <RingLoader
        color={"#123abc"}
        loading={loading}
        css={override}
        size={25}
      />
    ) : (
    <div className="flex flex-row w-screen h-screen overflow-x-hidden  overflow-y-hidden">

     <div className="flex fixed">
        <Sidebar />
      </div>
      

      <div className="pagedropdown">
        <label htmlFor="pageSizeDropdown">Page Size:</label>
        <select
          id="pageSizeDropdown"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        >
          <option value={5}>25</option>
          <option value={10}>50</option>
          <option value={20}>100</option>
        </select>
      </div>

      

      {/* <div className="download-button"> */}

      {/* </div> */}

      

      <div className="table-container">
      <div className="usercalender">
        <button className="calenderbutton" onClick={openDateFilter}>Date Filter</button>
        {showDateFilter && (
          <div className="calendar-container">
            <div className="calendar">
              {/* Calendar content (replace with your calendar component) */}
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button className="calenderbutton" onClick={handleDateFilterOK}>OK</button>
              <button className="calenderbutton" onClick={handleDateFilterCancel}>Cancel</button>
            </div>
          </div>
        )}

<div className="usersearch">
                    <input
                      type="text"
                      placeholder="Search "
                      onChange={handleInputChange}
                      className="inputtext"
                      value={searchQuery}
                    />
                    <img
                      src="search_icon.png"
                      alt="search"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </div>
        
        {/* <div className="search-box">
        <label htmlFor="searchInput">Search:</label> */}
        {/* <input
          type="text"
          id="searchInput"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        /> */}
      {/* </div> */}
        {/* </div> */}
        <button className="userdownload" onClick={handleDownload}>
          <img
          
            src="download-icon.svg"
            alt="Open Folder"
            style={{ width: "25px", height: "25px" }}
          />
          Click to download
        </button>
        {/* <button className={`download ${isDownloaded ? 'downloaded' : ''}`} onClick={handleDownload}>
      {isDownloaded ? (
        <img
          src="tick.png"  // Replace with the path to your tick icon
          alt="Downloaded"
          style={{ width: '25px', height: '25px' , background: "white"}}
        />
      ) : (
        <img
          src="download-icon.svg"
          alt="Download"
          style={{ width: '25px', height: '25px' }}
        />
      )}
    </button> */}
      </div>
        
        {isDataArray && data.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Activity Type</th>
                <th>Activity Info</th>
                <th>Activity Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.user}</td>
                  <td>{item.activity}</td>
                  <td>
                    {item.activity_info && item.activity_info.query_params !== null
                      ? JSON.stringify(item.activity_info)
                      : "—"}
                  </td>
                  <td>{item.activity_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No data</p>
        )}
      </div>

      {/* <div className="user-pagination"> */}
      <div className="buttoncontainer">
      <button
        className="userbutton"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="span"> Page {currentPage} </span>

      <button
        className="userbutton"
        onClick={handleNextPage}
        disabled={data.length < pageSize}
      >
        Next
      </button>
      </div>
      
    </div>
    )}
    </div>
  );
};

export default UserReport;
