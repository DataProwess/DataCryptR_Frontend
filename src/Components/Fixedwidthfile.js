// eslint-disable-next-line 
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Ruler from "./Ruler";
import "./fixedwidth.css";
import authService from "./auth";
// eslint-disable-next-line 
import Modal from "react-modal";
import ModalComponent from "./ModalComponent";
import { API_URL } from "./ApiConfig"

// const API_URL = "http://127.0.0.1:8000";

const Fixedwidthfile = () => {
  const location = useLocation();
  // const apiData = location.state?.apiData || [];
  const containerId = location.state?.container_id || null;
  // eslint-disable-next-line 
  const [selectedFiles, setSelectedFiles] = useState( location.state?.selectedFiles || null);
    // eslint-disable-next-line 
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const [adjustingColumn, setAdjustingColumn] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [resetRuler, setResetRuler] = useState(false);
  const charactersPerInterval = 1;
  // eslint-disable-next-line 
  const [rulerWidthInPixels, setRulerWidthInPixels] = useState(0);
  const [allColumnWidths, setAllColumnWidths] = useState([]);
  const [csrfToken, setCsrfToken] = useState(null);
  // eslint-disable-next-line 
  const [userEmail, setUserEmail] = useState("");
  // eslint-disable-next-line 
  const [userGroups, setUserGroups] = useState([]);
  const [token, setToken] = useState(null);

  const [isEditing, setIsEditingState] = useState(false);
  // eslint-disable-next-line 
  const [columnSettings, setColumnSettings] = useState({});
// eslint-disable-next-line 
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  // eslint-disable-next-line 
  const [updatedWidths, setUpdatedWidths] = useState([]);
  const initialApiData = location.state?.apiData || [];
  const [apiData, setApiData] = useState(initialApiData);

  const headers = Object.keys(apiData[0]);

  useEffect(() => {
    setApiData(location.state?.apiData || []);
  }, [location.state?.apiData]);

  //   const [rulerWidthInPixels, setRulerWidthInPixels] = useState(0);

  // console.log("res", selectedFiles, containerId, token);

  useEffect(() => {
    // Fetch container options on component mount
    const getCsrfTokenFromCookie = () => {
      const cookieArray = document.cookie.split(";");
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
          setCsrfToken(decodeURIComponent(value));
        }
      }
    };

    // Get CSRF token
    getCsrfTokenFromCookie();
    // fetchContainerOptions();
    // eslint-disable-next-line 
  }, [token]);

  useEffect(() => {
    // Fetch the token and set it in the state
    const fetchToken = async () => {
      try {
        const fetchedToken = await authService.getToken();
        const userGroup = await authService.getUserGroup();
        const dataObject = JSON.parse(fetchedToken);

        // Access the token property from the data object
        const token = dataObject.data.token;
        const email = dataObject.data.email;

        console.log("email ", email);

        setUserEmail(email);

        setToken(token);
        setUserGroups(userGroup);
        setUserEmail(email);
      } catch (error) {
        console.error("Token error:", error);
      }
    };
    // Call the fetchToken function
    fetchToken();
  }, []);

  
  // const applyColumnWidths = (newWidths) => {
  //   const newColumnWidths = {};
  //   newWidths.forEach((width) => {
  //     const [columnName, value] = width.split(":");
  //     newColumnWidths[columnName.trim()] = value.trim();
  //   });
  //   setColumnWidths(newColumnWidths);
  // };
  
  // const applyColumnWidths = (newWidths) => {
  //   // Assuming newWidths is already an object
  //   const newColumnWidths = {};
  
  //   for (const [columnName, value] of Object.entries(newWidths)) {
  //     newColumnWidths[columnName.trim()] = value.trim();
  //   }
  
  //   setColumnWidths(newColumnWidths);  // Assuming setColumnWidths is a state setter function
  // };

  // const applyColumnWidths = (newWidths) => {
  //   if (!newWidths || (Array.isArray(newWidths) && newWidths.length === 0)) {
  //     console.error("Invalid newWidths format. Expected an array with data.");
  //     return;
  //   }
  
  //   const newColumnWidths = {};
  
  //   if (Array.isArray(newWidths)) {
  //     // If newWidths is an array of strings
  //     newWidths.forEach((width) => {
  //       const [columnName, value] = width.split(":");
  //       newColumnWidths[columnName.trim()] = isNaN(value.trim()) ? value.trim() : parseInt(value.trim(), 10);
  //     });
  //   } else if (typeof newWidths === 'object' && newWidths !== null) {
  //     // If newWidths is an object
  //     for (const [columnName, value] of Object.entries(newWidths)) {
  //       newColumnWidths[columnName.trim()] = isNaN(value) ? value : parseInt(value, 10);
  //     }
  //   } else {
  //     console.error("Invalid newWidths format. Expected an array or object.");
  //     return;
  //   }
  
  //   setColumnWidths(newColumnWidths);  // Assuming setColumnWidths is a state setter function
  // };
  
  const applyWidth = (value, width, header) => {
    // Check if width is a valid number
    if (isNaN(width) || typeof width === 'undefined') {
      console.error(`Invalid width for header ${header}:`, width);
      // You may want to provide a default width or handle this case differently
      return value;
    }
  
    // Assuming width is a valid number representing character width
    const characterWidth = Math.round(width * 20);
  
    // Applying the width to the value (you might need to adjust this based on your specific requirements)
    return value.toString().padEnd(characterWidth);
  };
  
  const applyColumnWidths = (newWidths, source) => {
    if (!newWidths || (Array.isArray(newWidths) && newWidths.length === 0)) {
      console.error("Invalid newWidths format. Expected an array with data.");
      return;
    }
  
    setColumnWidths((prevWidths) => {
      const newColumnWidths = { ...prevWidths };
  
      if (Array.isArray(newWidths)) {
        newWidths.forEach((width) => {
          const [columnName, value] = width.split(":");
          const trimmedColumnName = columnName.trim(); // Trim the column name
          const trimmedValue = value.trim();
  
          const numericValue = !isNaN(trimmedValue) ? parseInt(trimmedValue, 10) : trimmedValue;
          newColumnWidths[trimmedColumnName] = numericValue;
        });
      } else if (typeof newWidths === 'object' && newWidths !== null) {
        for (const [columnName, value] of Object.entries(newWidths)) {
          const trimmedColumnName = columnName.trim(); // Trim the column name
          const trimmedValue = value.toString().trim();
  
          const numericValue = !isNaN(trimmedValue) ? parseInt(trimmedValue, 10) : trimmedValue;
          newColumnWidths[trimmedColumnName] = numericValue;
        }
      } else {
        console.error("Invalid newWidths format. Expected an array or object.");
      }
  
      return newColumnWidths;
    });
  
    setApiData((prevApiData) => {
      return prevApiData.map((item) => {
        const newItem = {};
  
        for (const [columnName, value] of Object.entries(item)) {
          newItem[columnName] = applyWidth(value, columnWidths[columnName], columnName);
        }
        return newItem;
      });
    });
  };
  
  
  const handleModalSubmit = (updatedColumnSettings) => {
    console.log("updatedColumn", updatedColumnSettings);
    // Check if all widths are defined before applying
    if (Object.values(updatedColumnSettings).every((width) => typeof width !== 'undefined')) {
      applyColumnWidths(updatedColumnSettings);
    } else {
      console.error('Invalid width values:', updatedColumnSettings);
      // Handle this case based on your specific requirements
    }
    setIsEditing(false);
  };
  
  
  
  const setIsEditing = (value) => {
    // Assuming setIsEditing is a state setter function
    setIsEditingState(value);
  };
  
 

const handleColumnSelection = (columnName) => {
  const columnIndex = headers.indexOf(columnName);

  if (columnIndex !== -1) {
    const selectedColumnLabel = `Column ${columnIndex + 1}`;
    console.log("Selected column label:", selectedColumnLabel);

    // Clear the previous selection when a new column is selected
    setSelectedRange({ start: null, end: null });
    setAdjustingColumn(columnName);
    console.log(adjustingColumn);
    setResetRuler((prevReset) => !prevReset);
  }
};




  // const handleColumnWidthAdjustment = (start, end) => {
  //   setSelectedRange({ start, end });

  //   if (apiData[0]) {
  //     setColumnWidths((prevWidths) => {
  //       const newColumnWidths = { ...prevWidths };
  //       console.log("new",newColumnWidths);

  //       if (adjustingColumn) {
  //         console.log("Adj",adjustingColumn);
  //         const columnWidth = end - start;

  //         // Use adjustingColumn directly, which contains the adjusted column name
  //         newColumnWidths[adjustingColumn] = columnWidth;

  //         setAllColumnWidths((prevAllWidths) => ({
  //           ...prevAllWidths,
  //           [adjustingColumn]: columnWidth,
  //         }));
  //       }

  //       return newColumnWidths;
  //     });
  //   }
  // };

  //*************************************************************************************** */
  
  const handleColumnWidthAdjustment = (start, end, rulerWidthInPixels, source, newWidths) => {
    setSelectedRange({ start, end });
  
    if (apiData[0]) {
      setColumnWidths((prevWidths) => {
        const newColumnWidths = { ...prevWidths };
  
        if (adjustingColumn) {
          const columnWidth = end - start;
  
          // Use adjustingColumn directly, which contains the adjusted column name
          newColumnWidths[adjustingColumn] = columnWidth;
  
          setAllColumnWidths((prevAllWidths) => ({
            ...prevAllWidths,
            [adjustingColumn]: columnWidth,
          }));
        }
  
        if (source === 'ruler') {
          // Handle adjustments from the ruler
          // For example, you might want to apply a specific multiplier
          const adjustedColumn = adjustingColumn;
          const rulerMultiplier = 1; // You can adjust this value
          const adjustedWidth = rulerMultiplier * (end - start);
  
          newColumnWidths[adjustedColumn] = adjustedWidth;
        } else if (source === 'modal') {
          // Handle adjustments from the ModalComponent
          // Convert the widths from strings to numbers before applying
          for (const [columnName, width] of Object.entries(newWidths)) {
            newColumnWidths[columnName] = parseInt(width, 10);
          }
        }
  
        return newColumnWidths;
      });
    }
  };
  
  // const handleFormSubmit = (newWidths) => {
  //   console.log("widths", newWidths);
    
  
  //   // Apply form data to the column widths
  //   applyColumnWidths(newWidths);
  //   console.log(applyColumnWidths);
    
  
  //   // Apply local widths directly
  //   // setColumnWidths(localWidths);
  
  //   setIsEditing(false);
  // };
  

  // eslint-disable-next-line 
  const handleFormSubmit = (newWidths) => {
    console.log("294",newWidths)
    applyColumnWidths(newWidths, 'modal');
    setIsEditing(false);
  };
  

  // useEffect(() => {
  //   if (
  //     apiData[0] &&
  //     adjustingColumn &&
  //     selectedRange.start !== null &&
  //     selectedRange.end !== null
  //   ) {
  //     setColumnWidths((prevWidths) => {
  //       console.log("1", columnWidths);
  //       const newColumnWidths = { ...prevWidths };
  //       // console.log(newColumnWidths);
  //       // const columnIndex = headers.indexOf(adjustingColumn);
  //       const columnIndex = adjustingColumn;
  //       console.log("204",columnIndex);
  //       if (columnIndex !== -1) {
  //         const columnStart =
  //           selectedRange.start +
  //           (selectedRange.end - selectedRange.start) *
  //             (columnIndex / headers.length);

  //         const columnEnd =
  //           selectedRange.start +
  //           (selectedRange.end - selectedRange.start) *
  //             (columnIndex / headers.length);

  //         // newColumnWidths[adjustingColumn] = columnEnd - columnStart;
  //         newColumnWidths[columnIndex + 1] = columnEnd - columnStart;
  //         console.log(newColumnWidths);
  //       }
  //       return newColumnWidths;
  //     });
  //   }
  //   console.log("Send to server:", columnWidths);
  //   // eslint-disable-next-line
  // }, [charactersPerInterval, adjustingColumn]);

  useEffect(() => {
    // Convert the selected column indexes to an array
    // const selectedColumnIndexes = Object.keys(newColumnWidths);

    // Send the array of selected column indexes to the server
    // You can replace the following line with your actual server API call
    console.log("Send to server:", columnWidths);
  }, [columnWidths]);

  if (!apiData || apiData.length === 0) {
    return <p>No data available</p>;
  }

  //

  const handleSendToServer = async () => {
    // Check if selectedFiles is an array and has at least one element
    if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
      // Access the file_name property from the first element
      const blobName = selectedFiles[0].file_name;

      console.log(blobName);
      console.log(token);

      // Rest of your code remains unchanged
      return fetch(`${API_URL}/api/blob/fixedwidthfile/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          blob_name: blobName,
          container_id: containerId,
          columnWidths: allColumnWidths,
        }),
      }).then((response) => response.json());
    } else {
      // Handle the case where selectedFiles is not an array or is empty
      console.error("Invalid selectedFiles:", selectedFiles);
      return Promise.resolve({});
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // const handleEditClick = () => {
  //   // Check if column widths have been set
  //   if (Object.keys(allColumnWidths).length > 0) {
  //     setIsEditing(true);
  //   } else {
  //     // Display a message or handle the case where column widths are not set
  //     console.log("Please set column widths first.");
  //     // You can also display a message to the user or use a state variable to show/hide a message in the UI
  //   }
  // };

  // const handleModalSubmit = (updatedColumnSettings) => {
  //   setColumnWidths(updatedColumnSettings);
  //   setAllColumnWidths(updatedColumnSettings);
  //   setIsEditing(false);
  // };

  // const handleModalSubmit = (updatedColumnSettings) => {
  //   applyColumnWidths(updatedColumnSettings);
  //   setIsEditing(false);
  // };
  return (
    <div className="fixedwidthcontainer">
      <div className="fixedwidthformatter">
        <div className="fixedruler">
          
          {/* <Ruler
            onRangeSelect={(start, end) =>
              handleColumnWidthAdjustment(start, end, rulerWidthInPixels)
            }
            resetRuler={resetRuler}
            charactersPerInterval={charactersPerInterval}
            columnWidths={columnWidths}
            apiData={apiData}
          /> */}

<Ruler
  onRangeSelect={(start, end) =>
    handleColumnWidthAdjustment(start, end, rulerWidthInPixels, 'ruler')
  }
  resetRuler={resetRuler}
  charactersPerInterval={charactersPerInterval}
  columnWidths={columnWidths}
  apiData={apiData}
/>

        </div>

        <div></div>
        {/* <div className="dataformat" style={{ display: "flex" }}>
          {headers.map((header, index) => (
            <div
              key={index}
              style={{
                width: `${columnWidths[header]}ch`,
                cursor: "pointer",
                border: adjustingColumn === header ? "2px solid red" : "none", 
              }}
              onClick={() => handleColumnSelection(header)}
            >
              {header}
            </div>
          ))}
        </div>

       
        {apiData.map((item, index) => (
          <div key={index} style={{ display: "flex" }}>
            {headers.map((header, columnIndex) => (
              <div
                key={columnIndex}
                style={{ width: `${columnWidths[header]}ch` }}
              >
                {item[header]}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div> */}

        {/* <div className="dataformat" style={{ display: "flex" }}> */}
        {/* <div className="dataformat" style={{ display: "flex" }}>
  {((headers && headers.length > 0) || (apiData[0] && apiData[0]?.length > 0)
    ? headers || Array(apiData[0].length).fill(null)
    : []).map((header, index) => (
      <div
        key={index}
        style={{
          width: `${
            columnWidths[header] || columnWidths[index]
          }ch` || "auto",
          cursor: "pointer",
          border: adjustingColumn === header ? "2px solid red" : "none",
        }}
        onClick={() => handleColumnSelection(header)}
      >
        {header || `Column ${index + 1}`}
      </div>
  ))}
</div> */}

<div className="dataformat" style={{ display: "flex" }}>
  {headers.map((header, index) => (
    <div
      key={index}
      style={{
        width: `${columnWidths[header]}ch`,
        cursor: "pointer",
        border: adjustingColumn === header ? "2px solid red" : "none",
      }}
      onClick={() => handleColumnSelection(header)}
    >
      {header}
    </div>
  ))}
</div>

{apiData.map((item, index) => (
  <div key={index} style={{ display: "flex" }}>
    {headers.map((header, columnIndex) => (
      <div
        key={columnIndex}
        style={{ width: `${columnWidths[header]}ch` }}
      >

{/* {applyWidth(item[header], columnWidths[header])} */}
        {item[header]}
      </div>
    ))}
  </div>
))}
</div>

        {/* Render data */}
        {/* {apiData.map((item, index) => (
  <div key={index} style={{ display: "flex" }}>
    {(headers.length > 0
      ? headers
      : Array(apiData[0]?.length).fill(null)
    ).map((header, columnIndex) => (
      <div
        key={columnIndex}
        style={{
          width: `${
            columnWidths[header] || columnWidths[columnIndex]
          }ch`,
        }}
      >
        {item && item[header] !== undefined ? item[header] : item && item[columnIndex]}
      </div>
    ))}
  </div>
))}


      </div>  */}



{/* Render data */}
{console.log("Column Widths in JSX:", columnWidths)}

{/* Render data */}
{/* {apiData.map((item, index) => (
  <div key={index} style={{ display: "flex" }}>
    {(headers.length > 0
      ? headers
      : Array(apiData[0]?.length).fill(null)
    ).map((header, columnIndex) => (
      <div
        key={columnIndex}
        style={{
          width: `${
            columnWidths[header] || columnWidths[columnIndex] || "auto"
          }ch`,
        }}
      >
        {item && item[header] !== undefined ? item[header] : item && item[columnIndex]}
      </div>
    ))}
  </div>
))}
</div> */}

      <div>
        {/* Add a button to trigger the data send to the server */}
        <button onClick={handleSendToServer}>Send to Server</button>
        <button onClick={handleEditClick}>Edit</button>
      </div>
      {isEditing && (
        <ModalComponent
          isOpen={isEditing}
          headers={headers}
          columnWidths={columnWidths}
          applyColumnWidths={applyColumnWidths}  
          setIsEditing={setIsEditing} 
          onSubmit={handleModalSubmit} 
          onCancel={() => setIsEditing(false)}
          shouldCloseOnOverlayClick={false}
        />
      )}
    </div>
  );
};

export default Fixedwidthfile;
