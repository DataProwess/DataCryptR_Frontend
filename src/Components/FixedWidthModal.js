

//   const handleFixedwidthSave = async () => {
//     try {
//       // Prepare the payload
      // const payload = {
      //   file_name: filename, // Assuming selectedFile is defined
      //   container_id: containerData, // Assuming selectedContainer is defined
      //   fixed_width_json: {}, // Initialize an empty object to store column widths
      // };

      // // Fill the fixed_width_json object with column names and widths
      // columnData.forEach((column) => {
      //   payload.fixed_width_json[column.field_name] =
      //     localColumnWidths[column.field_name] || null;
      // });
     

//       // Send the request to save column widths
//       const response = await fetch(`${API_URL}/api/blob/update_fixed_width/`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           "X-CSRFToken": csrfToken,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       // Show success message or handle other logic
//       console.log("Column widths saved successfully.");
//     } catch (error) {
//       console.error("Error saving column widths:", error);
//       // Handle error, show error message, etc.
//     }
//   };



import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import authService from "./auth";
import FullScreenPreview from "./FullScreenPreview";
import { API_URL } from "./ApiConfig";
import { secureApiCall } from "./csrfUtils";

// const API_URL = "http://127.0.0.1:8000";

const FixedWidthModal = ({
  columnData,
  closeModal,
  selectedFiles,
  // apiData,
  desiredHeight,
  desiredWidth,
  selectedStorageAccount,
  containerName
}) => {
  const location = useLocation();
  const containerData = location.state?.containerData;
  console.log("container", containerData);
  const fileShareId = location.state?.fileShareId;
  console.log("fileShareId", fileShareId);
  const [filename, setFilename] = useState("");
  const [localColumnWidths, setLocalColumnWidths] = useState({});
 
  const [apiData, setApiData] = useState([]);
  const [token, setToken] = useState(null);
  // eslint-disable-next-line 
  const [csrfToken, setCsrfToken] = useState(null);
  // eslint-disable-next-line 
  const [userEmail, setUserEmail] = useState("");
  // eslint-disable-next-line 
  const [permissions, setPermissions] = useState([]);
  // eslint-disable-next-line 
  const [userGroups, setUserGroups] = useState([]);
  // eslint-disable-next-line 
  const [selectedContainer, setSelectedContainer] = useState(containerData);
  // eslint-disable-next-line 
  const [selectedFileShare, setSelectedFileShare] = useState(fileShareId);
  // eslint-disable-next-line 
  const [isMasked, setIsMasked] = useState(localStorage.getItem("isMasked") === "true" || true );

  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      const firstSelectedFile = selectedFiles[0].file_name;
      setFilename(firstSelectedFile);
    }
    // eslint-disable-next-line 
  }, [selectedFiles, filename]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const fetchedToken = await authService.getToken();
        const userGroup = await authService.getUserGroup();
        const dataObject = JSON.parse(fetchedToken);

        const token = dataObject.data.token;
        const email = dataObject.data.email;
        const permissions = dataObject.data.permissions;

        setUserEmail(email);
        setPermissions(permissions);
        setToken(token);
        setUserGroups(userGroup);
        setUserEmail(email);
      } catch (error) {
        console.error("Token error:", error);
      }
    };
    fetchToken();
    // eslint-disable-next-line 
  }, []);

  useEffect(() => {
    const fetchColumnWidths = async () => {
      if (filename && selectedStorageAccount && containerName) {
        try {
          const data = await secureApiCall(
            `${API_URL}/api/core/get_fixed_width_from_blob/`,
            "POST",
            {
              storage_account_name: selectedStorageAccount,
              container_name: containerName,
              file_name: filename,
            }
          );
          console.log(data);
          console.log("trans",transformResponse);
          const transformedData = transformResponse(data);
          setLocalColumnWidths(transformedData);
          console.log("Local Column Widths:", transformedData); 
        } catch (error) {
          console.error("Error fetching column widths:", error);
        }
      }
    };

    fetchColumnWidths();
    // eslint-disable-next-line 
  }, [filename, selectedStorageAccount, containerName]);

  const transformResponse = (data) => {
    const transformedData = {};
    
    for (const [key, value] of Object.entries(data.column_widths)) {
      // Replace '|' characters and remove parentheses
      const transformedKey = key.replace(/\|/g, '_').replace(/[()]/g, '');
      transformedData[transformedKey] = value;
    }
    
    return transformedData;
  };
  
  
  useEffect(() => {
    console.log("Transformed Column Widths:", localColumnWidths);
  }, [localColumnWidths]);
  console.log("Column Data:", columnData);
console.log("Local Column Widths:", localColumnWidths);


const handleDynamicPreview = (
  selectionId,
  selectionType,
  selectedStorageAccount
) => {
  return new Promise((resolve, reject) => {
    if (selectedFiles.length === 0) {
      // Show toast notification and return
      // toast.error("Please select a file before previewing.");
      return;
    }

    const requestBody = {
      storage_account: selectedStorageAccount,
      blob_name: selectedFiles[0].file_name, // Assuming you're processing only the first selected file
      is_masked: isMasked,
      line: "3",
    };

    // Set the appropriate id in the request body based on the selectionType
    if (selectionType === "container") {
      requestBody.container_id = selectionId;
    } else if (selectionType === "fileShare") {
      requestBody.file_share_id = selectionId;
    }
    console.log("sssssss", selectionId, selectionType);
    fetch(`${API_URL}/api/blob/blob_content/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("data",data)
        if (data) {
          setApiData(data);
          // setSelectedData(data);
          // setModalVisible(true);
          document.body.style.overflow = "hidden";
          // setIsFullScreenPreview(true);
          // setShowPreview(true);
          // setDataType("API");
          resolve(data);
        } else {
          console.error("No data received from API for Preview.");
          reject("No data received from API for Preview.");
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
        reject(error);
      });
  });
};

useEffect(() => {
  if (containerData) {
    console.log("sssssssssssd", containerData);
    handleDynamicPreview(containerData, "container", selectedStorageAccount)
      .then((response) => {
        // Handle response data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (fileShareId) {
    handleDynamicPreview(fileShareId, "fileShare")
      .then((response) => {
        // Handle response data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  // eslint-disable-next-line 
}, [containerData, fileShareId, token, selectedStorageAccount]);


const handleWidthChange = (e, columnName) => {
  const { value } = e.target;
  setLocalColumnWidths((prevWidths) => ({
    ...prevWidths,
    [columnName]: value,
  }));
  // Call handleColumnWidthChange to trigger the API call
  handleColumnWidthChange(columnName, value);
};



const handleColumnWidthChange = async (columnName, width) => {
  try {
    // // Update local state with the new column width
    setLocalColumnWidths((prevWidths) => ({
      ...prevWidths,
      [columnName]: width,
    }));

    

    const payload = {
      file_name: filename, // Assuming selectedFile is defined
      container_id: containerData, // Assuming selectedContainer is defined
      fixed_width_json: {}, // Initialize an empty object to store column widths
    };

    // // Fill the fixed_width_json object with column names and widths
    // columnData.forEach((column) => {
    //   payload.fixed_width_json[column.field_name] =
    //     localColumnWidths[column.field_name] || null;
    // });

    columnData.forEach((column) => {
      if (column.field_name === columnName) {
        payload.fixed_width_json[column.field_name] = parseInt(width);
      } else {
        payload.fixed_width_json[column.field_name] =
          localColumnWidths[column.field_name] || null;
      }
    });

    // Make a POST request to the API endpoint
    const response = await fetch(`${API_URL}/api/blob/update_fixed_width/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("Column width updated successfully.");
    await handleDynamicPreview(containerData, "container", selectedStorageAccount);
  } catch (error) {
    console.error("Error updating column width:", error);
  }
};

  return (
    <div>
      <div>
        <div className="fixed top-0 left-[62%] transform -translate-x-1/2 p-2 border border-black z-50 w-[76%] h-[91.5%] overflow-y-auto cursor-pointer mt-[57px] shadow-md overflow-x-hidden bg-white">
          <div className="w-full flex justify-end fixed">
            <button className="bg-white text-2xl font-semibold mr-4 " onClick={closeModal}>
              &times;
            </button>
          </div>
          <div className="w-[1050px] h-full px-6 py-8 flex flex-col ml-8">
            <div className="w-full h-full flex flex-col px-6 space-y-2 mb-6 overflow-y-auto overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
              {columnData.map((column, index) => (
                <div className="w-full h-16 items-center flex flex-row space-x-3" key={index}>
                  <div className="w-60 px-4 text-justify border border-none 
                  pb-2 h-8 whitespace-nowrap overflow-hidden overflow-ellipsis font-normal text-sm">
                    {column.field_name}
                  </div>
                  <div>:</div>
                  <div>
                  {/* <input
  className="w-auto px-4 pt-2 text-justify border pb-2 border-lightgray-200 h-8 font-normal text-sm"
  type="text"
  placeholder="Enter width"
  name={`Column ${index + 1}`}
  value={localColumnWidths[column.field_name.replace(/\|/g, '_').replace(/[()]/g, '')] || ""}
  onFocus={(e) => e.target.select()}
  // onChange={(e) => handleColumnWidthChange(e, column.field_name.replace(/\|/g, '_').replace(/[()]/g, ''))}
  onChange={(e) => handleWidthChange(e, column.field_name.replace(/\|/g, '_').replace(/[()]/g, ''))}

  style={{ border: "1px solid #ccc", padding: "5px", marginLeft: "20px" }}
/> */}

<input
  className="w-auto px-4 pt-2 text-justify border pb-2 border-lightgray-200 h-8 font-normal text-sm"
  type="text"
  placeholder="Enter width"
  name={`Column ${index + 1}`}
  value={localColumnWidths[column.field_name.replace(/\|/g, '_').replace(/[()]/g, '')] || ""}
  onFocus={(e) => e.target.select()}
  onChange={(e) => handleWidthChange(e, column.field_name.replace(/\|/g, '_').replace(/[()]/g, ''))}
  onKeyDown={(e) => handleWidthChange(e, column.field_name.replace(/\|/g, '_').replace(/[()]/g, ''))} // Handle key press event
  // onChange={(e) => handleColumnWidthChange(e, column.field_name.replace(/\|/g, '_').replace(/[()]/g, ''))}
  // onKeyDown={(e) => handleColumnWidthChange(e, column.field_name.replace(/\|/g, '_').replace(/[()]/g, ''))} 
  style={{ border: "1px solid #ccc", padding: "5px", marginLeft: "20px" }}
/>


                  </div>
                </div>
              ))}
            </div>
            <div>
              {/* <FullScreenPreview
                apiData={apiData}
                width={desiredWidth}
                height={desiredHeight}
                localColumnWidths={localColumnWidths}
                onColumnWidthChange={handleColumnWidthChange} 
                
              /> */}
              {/* <FullScreenPreview
  apiData={apiData}
  width={desiredWidth}
  height={desiredHeight}
  // localColumnWidths={localColumnWidths}
  onColumnWidthChange={handleColumnWidthChange} // Pass the callback function
/> */}
 {Object.keys(localColumnWidths).length > 0 && (
          <FullScreenPreview
            apiData={apiData}
            width={desiredWidth}
            height={desiredHeight}
            localColumnWidths={localColumnWidths}
            onColumnWidthChange={handleColumnWidthChange} // Pass the callback function
          />
        )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedWidthModal;


