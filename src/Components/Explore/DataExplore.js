import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { API_URL } from "../ApiConfig";
import { apiRequest } from "../csrfUtils";
import FilesPlainView from "../S3BucketExplore/FilesPlainView";
// import "./width.css";
import "./explore.css";


const DataExplore = ({
  handlePlainView,
  handleTableView,
  isTableView,
  selectedFiles,
  setSelectedFiles,

  // 📄 New lifted pagination hooks
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  serverTotalItems,
  setServerTotalItems,
  setParentFolders,
  setParentFiles,
  searchPattern,
  setSearchPattern,
  currentPath,
  setCurrentPath,
}) => {
  const { bucketId } = useParams();
  const location = useLocation();

  // 1. Fallbacks from React Router navigation state (sent during bucket click)
  const {
    bucketName,
    initialFolders = [],
    initialFiles = [],
  } = location.state || {};

  // 2. Navigation state hooks

  console.log("i", selectedFiles);

  const [folderTree, setFolderTree] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);

  // 📄 RE-ENGINEERED BACKEND PAGINATION BINDINGS
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [rowsPerPage, setRowsPerPage] = useState(100); // Set default matching your backend (100)
  //   const [serverTotalItems, setServerTotalItems] = useState(0); // Binds directly to data.total from API response

  const [tableHeights, setTableHeights] = useState({
    container: "auto",
    body: "auto",
  });

  // Reset pagination to page 1 whenever directory path changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentPath]);

  // Network Trigger Synchronization: Fires whenever path changes, page switches, or row size updates
  useEffect(() => {
    fetchS3BlobsForDirectory(
      currentPath,
      currentPage,
      rowsPerPage,
      searchPattern,
    );
  }, [currentPath, currentPage, rowsPerPage, searchPattern]);

  useEffect(() => {
    const logicalWidth = window.innerWidth;
    const physicalWidth = window.outerWidth;
    const hardwareDevicePixelRatio = window.devicePixelRatio || 1;

    const screenBaseline =
      physicalWidth / logicalWidth / hardwareDevicePixelRatio;

    const checkZoomLevel = () => {
      let actualZoomPercentage = 1;
      if (window.outerWidth && window.innerWidth) {
        actualZoomPercentage =
          (window.outerWidth / window.innerWidth) * screenBaseline;
      } else {
        actualZoomPercentage = window.devicePixelRatio || 1;
      }

      if (actualZoomPercentage >= 1.5) {
        setTableHeights({ container: "auto", body: "auto" });
      } else if (actualZoomPercentage >= 1.2) {
        setTableHeights({ container: "auto", body: "auto" });
      } else if (actualZoomPercentage <= 0.7) {
        setTableHeights({ container: "auto", body: "auto" });
      } else if (actualZoomPercentage <= 0.85) {
        setTableHeights({ container: "auto", body: "auto" });
      } else {
        setTableHeights({ container: "auto", body: "auto" });
      }
    };

    checkZoomLevel();
    window.addEventListener("resize", checkZoomLevel);

    const matchMediaList = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );
    try {
      matchMediaList.addEventListener("change", checkZoomLevel);
    } catch (err) {
      matchMediaList.addListener(checkZoomLevel);
    }

    return () => {
      window.removeEventListener("resize", checkZoomLevel);
      try {
        matchMediaList.removeEventListener("change", checkZoomLevel);
      } catch (err) {
        matchMediaList.removeItemListener(checkZoomLevel);
      }
    };
  }, []);

  // --- FETCH THE COMPREHENSIVE FOLDER TREE ON MOUNT ---
  useEffect(() => {
    const fetchTreeStructure = async () => {
      try {
        const response = await apiRequest(
          `${API_URL}/api/s3/files/folders/`,
          "POST",
          {
            s3_bucket_id: bucketId,
          },
        );
        const data = response?.data || response;
        setFolderTree(data.folder_tree || data);
      } catch (err) {
        console.error(
          "Failed fetching comprehensive structural folder tree:",
          err,
        );
      }
    };
    fetchTreeStructure();
  }, [bucketId, API_URL]);

  // --- 🌐 DYNAMIC API INTEGRATION LINKED TO BACKEND PAGINATION ---
  const fetchS3BlobsForDirectory = async (
    pathArray,
    targetPage,
    targetPageSize,
    targetPattern,
  ) => {
    setIsLoading(true);
    try {
      const prefixPath =
        pathArray.length === 0 ? "" : pathArray.join("/") + "/";

      // Sending exact parameters expected by your backend API engine
      const response = await apiRequest(`${API_URL}/api/s3/files/`, "POST", {
        s3_bucket_id: bucketId,
        folder_pattern: prefixPath,
        pattern: targetPattern,
        page_number: targetPage,
        page_size: targetPageSize,
      });

      const data = response?.data || response;

      // Map backend counter tracking properties cleanly ("total": 181, etc.)
      if (data && data.total !== undefined) {
        setServerTotalItems(data.total);
      }

      // Map out backend raw directory list arrays
      const rawFolders = data.folder_list || [];
      const formattedFolders = rawFolders
        .filter(Boolean)
        .map((folderName, index) => {
          const cleanName = folderName.endsWith("/")
            ? folderName.slice(0, -1)
            : folderName;
          const shortName = cleanName.split("/").pop();
          return {
            id: `dir-${pathArray.join("-")}-${shortName}-${index}`,
            name: shortName,
          };
        });

      // Map out backend raw file/blob list object arrays
      const rawFiles = data.blob_list || [];
      const formattedFiles = rawFiles.map((file, index) => ({
        id: file.id || file.file_id || `file-${index}`,
        file_name: file.file_name,
        name: file.file_name ? file.file_name.split("/").pop() : "Unknown File",
        size:
          file.size !== undefined && file.size !== null
            ? `${(file.size / 1024).toFixed(2)} KB`
            : "—",
        file_path: file.file_path || "—",
        creation_time: file.creation_time || "—",
        modified_time: file.last_modified || "—",
      }));

      setAllFolders(formattedFolders);
      setAllFiles(formattedFiles);

      if (setParentFolders) setParentFolders(formattedFolders);
      if (setParentFiles) setParentFiles(formattedFiles);
    } catch (err) {
      console.error(
        "Error fetching paginated data from API server target:",
        err,
      );
      setAllFolders([]);
      setAllFiles([]);
      setServerTotalItems(0);
      if (setParentFolders) setParentFolders([]);
      if (setParentFiles) setParentFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 📈 PAGINATION CALCULATIONS MATCHING API METRICS ---
  const totalItemsCount = serverTotalItems; // e.g., 181
  const totalPages = Math.ceil(totalItemsCount / rowsPerPage) || 1; // e.g., Math.ceil(181 / 100) = 2

  // Render arrays containing item objects fetched exclusively inside this page chunk
  const paginatedItems = [
    ...allFolders.map((f) => ({ ...f, isFolder: true })),
    ...allFiles.map((f) => ({ ...f, isFile: true })),
  ];

  // Mathematical start-offset alignment indices for display strings
  const startIndex = (currentPage - 1) * rowsPerPage;

  const displayedFolders = allFolders.map((folder) => ({
    ...folder,
    isFolder: true,
  }));
  // const displayedFiles = allFiles.map((file) => ({ ...file, isFile: true }));
  const displayedFiles = allFiles.map((file) => {
    // 1. Build the unique clean path key here once
    const path = file.file_path || "";
    const name = file.file_name || "";
    let fullS3PathKey = path.endsWith("/")
      ? `${path}${name}`
      : `${path}/${name}`;
    fullS3PathKey = fullS3PathKey.replace(/\/+/g, "/").replace(/^\//, "");

    return {
      ...file,
      isFile: true,
      fullS3PathKey, // 🎯 Attach the calculated unique path key
      isSelected: selectedFiles.includes(fullS3PathKey), // 🎯 Attach selection state boolean
    };
  });

  // --- CLICK ACTION HANDLERS ---
  const handleFolderClick = (folderObj) => {
    setCurrentPath((prev) => [...prev, folderObj.name]);
  };

  //   const handleFileRowClick = (file) => {
  //     setSelectedFiles((prevSelected) => {
  //       if (prevSelected.includes(file.file_name)) {
  //         return prevSelected.filter((name) => name !== file.file_name);
  //       } else {
  //         return [...prevSelected, file.file_name];
  //       }
  //     });
  //     console.log(selectedFiles)
  //   };

  const handleFileRowClick = (file) => {
    // 1. Build the full path and file name string safely
    const path = file.file_path || "";
    const name = file.file_name || "";

    // Ensure we combine them with a single dividing slash without duplicating slashes
    let fullS3PathKey = path.endsWith("/")
      ? `${path}${name}`
      : `${path}/${name}`;
    fullS3PathKey = fullS3PathKey.replace(/\/+/g, "/").replace(/^\//, ""); // Clean up double or leading slashes

    setSelectedFiles((prevSelected) => {
      // 2. Check if this combined path key is already selected
      if (prevSelected.includes(fullS3PathKey)) {
        // Remove it from selections if clicked again
        return prevSelected.filter((pathKey) => pathKey !== fullS3PathKey);
      } else {
        // Add the combined path key string to the selection state array
        return [...prevSelected, fullS3PathKey];
      }
    });
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset back to first page window to prevent matrix element index overflow
  };

  const handleSortAscending = (sortKey) => {
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;
      if (typeof aVal === "string" && typeof bVal === "string")
        return aVal.localeCompare(bVal);
      if (typeof aVal === "number" && typeof bVal === "number")
        return aVal - bVal;
      return 0;
    };
    setAllFolders([...allFolders].sort(sortFunction));
    setAllFiles([...allFiles].sort(sortFunction));
  };

  const handleSortDescending = (sortKey) => {
    const sortFunction = (a, b) => {
      const aVal = a[sortKey] || a.file_name || a.name;
      const bVal = b[sortKey] || b.file_name || b.name;
      if (typeof aVal === "string" && typeof bVal === "string")
        return bVal.localeCompare(aVal);
      if (typeof aVal === "number" && typeof bVal === "number")
        return bVal - aVal;
      return 0;
    };
    setAllFolders([...allFolders].sort(sortFunction));
    setAllFiles([...allFiles].sort(sortFunction));
  };


  return(
    
    
    <div className="layout-table  px-7  flex flex-col">
        {isTableView ? (
        <div className="layout-data-container flex rounded-lg pt-0.5 pb-2 flex-col shadow-lg shadow-slate-500/50 overflow-hidden">
        <div className="layout-breadcrums-container bg-purpleshade1 rounded-t-lg ">
            <table className="table-design w-[100%] h-2 table-fixed ">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
              <tr>
                <th className="py-2 sticky top-0 rounded-tl-lg font-normal text-xs"></th>

                <th className="py-2 sticky top-0 font-normal text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                  Name
                  <span
                    onClick={() => handleSortAscending("name")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("name")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                  Size (bytes)
                  <span
                    onClick={() => handleSortAscending("size")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("size")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                  Created Date
                  <span
                    onClick={() => handleSortAscending("creation_time")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("creation_time")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                  Modified Date
                  <span
                    onClick={() => handleSortAscending("modified_time")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("modified_time")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 rounded-tr-lg font-normal text-xs overflow-ellipsis whitespace-nowrap overflow-hidden">
                  File Path
                </th>
              </tr>
            </thead>
          </table>

        </div>
        <div className="layout-rows-container flex-1 pt-2 pb-3 border-t border-slate-100 overflow-y-auto overflow-x-hidden" 
        style={{ scrollbarWidth: "thin" }}>
            <table className="table-design table-fixed ">
              <tbody>
                {displayedFolders.map((folder) => (
                  <tr
                    key={folder.id}
                    className="hover:bg-primary rounded-md cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <td className="w-[3%] text-xs font-normal overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      //   onClick={() => handleFileRowClick(folder.name)}
                    >
                      <span className="text-[11px] font-light text-black cursor-pointer text-center flex items-center">
                        <div className="flex items-center mr-2">
                          <img
                            src={
                              process.env.PUBLIC_URL + "/baseline-folder.png"
                            }
                            alt="Folder"
                            className="w-3 h-3"
                          />
                        </div>
                        <span className="truncate">{folder.name}</span>
                      </span>

                      {/* {folder.name} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                  </tr>
                ))}
                {displayedFiles.map((file, i) => (
                  <tr
                    key={file.file_id || i}
                    // className={` ${
                    //   selectedFiles.includes(file.file_name)
                    //     ? "bg-primary rounded-md "
                    //     : ""
                    // }`}
                    className={`cursor-pointer transition-colors duration-150 ease-in-out
                    ${
                      file.isSelected ? "hover:bg-primary " : "hover:bg-primary text-black" // 🎯 Tailwind still handles the dynamic hover event here
                    }`}
                    onClick={() => handleFileRowClick(file)}
                  >
                    <td className="w-[3%]"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      // onClick={() => handleFileRowClick(file)}
                    >
                      <span className="text-[11px] font-normal text-black cursor-pointer text-center flex flex-row items-center">
                        <div className="flex items-center relative mr-2 mt-1 flex-shrink-0">
                          <img
                            src={process.env.PUBLIC_URL + "/file-icon.png"}
                            alt="File"
                            className="w-3 h-3 "
                          />
                          {/* {selectedFiles.includes(file.file_name) && (
                            <img
                              src={process.env.PUBLIC_URL + "/tick-icon.png"}
                              alt="Selected"
                              className="absolute w-4 h-4 -top-2 -right-1"
                            />
                          )} */}
                        </div>
                        <span className="truncate">
                          {file.file_name
                            ? file.file_name.split("/").pop()
                            : file.name}
                        </span>
                      </span>
                      {/* {file.file_name ? file.file_name.split("/").pop() : ""} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light  pl-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.size}
                    </td>
                    <td className="w-[20%] text-[11px] font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.creation_time}
                    </td>
                    <td className="w-[20%] text-[11px]  font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.modified_time}
                    </td>
                    {/* <td className="w-[15%] bg-green-500 text-[11px] flex item-center font-light overflow-ellipsis whitespace-nowrap overflow-hidden"> */}
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.file_path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

        </div>

        </div>

   
    ):(
         <div
      className="layout-grid-container select-none flex flex-col "
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <div
        className="layout-grid grid items-start gap-4 overflow-y-auto mt-1 "
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          scrollbarWidth: "thin",
          alignContent: "start",
        }}
      >
        {/* 📁 LIVE FOLDER DISPLAY ENGINE */}
        {displayedFolders.map((folder, index) => {
          let folderName = typeof folder === "string" ? folder : folder?.name || folder?.folder_name;
          if (!folderName) folderName = `Folder-${index}`;

          // Drop trailing folder slashes if returned by S3 structure
          if (folderName.endsWith("/")) folderName = folderName.slice(0, -1);
          const folderId = folder?.id || `folder-${index}`;

          return (
            <div
              key={folderId}
              className="flex flex-col items-center justify-start cursor-pointer w-full group"
              onClick={() => handleFolderClick(folder)} // 🎯 Trigger parent path updates
            >
              <div className="flex flex-col items-center space-y-1 w-full justify-center p-1 rounded-md transition-all group-hover:bg-slate-100/80 text-center">
                <div className="w-14 h-14 flex items-center ">
                  <img
                    src={process.env.PUBLIC_URL + "/baseline-folder.png"}
                    alt="Folder"
                    className="w-12 h-12 object-contain"
                    title={folderName}
                  />
                </div>
                <span
                  className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5"
                  title={folderName}
                >
                  {folderName}
                </span>
              </div>
            </div>
          );
        })}

        {/* 📄 LIVE FILE DISPLAY ENGINE */}
        {displayedFiles.map((file, index) => {
          const rawFileName = typeof file === "string" ? file : file?.file_name || file?.name || `File-${index}`;
          const cleanFileName = rawFileName.split("/").pop() || rawFileName;
          const fileId = file?.file_id || file?.id || `file-${index}`;
          
          // Use parent calculated boolean validation property directly
          const isSelected = file?.isSelected || false; 

          return (
            <div
              key={fileId}
              className={`flex flex-col items-center justify-start cursor-pointer w-full group p-1 transition-all rounded-md ${
                isSelected
                  ? "bg-slate-200 ring-1 ring-primary/40 shadow-sm"
                  : "hover:bg-slate-100/80"
              }`}
              onClick={() => handleFileRowClick(file)} // 🎯 Match parent selection state functions
            >
              <div className="flex flex-col items-center space-y-1 w-full text-center relative">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={process.env.PUBLIC_URL + "/file-icon.png"}
                    alt="File"
                    className="w-10 h-12 object-contain"
                    title={cleanFileName}
                  />
                </div>
                <span
                  className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5 cursor-pointer"
                  title={cleanFileName}
                >
                  {cleanFileName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    )}
    </div>
  )

  return (
    <div className="w-full h-full flex flex-col  rounded-lg bg-white ">
      <div className="w-full bg-purpleshade1 h-10 flex rounded-t-lg flex-nowrap gap-3 items-center justify-between flex-shrink-0  p-2 ">
        <div className=" flex items-center gap-2 text-xs text-white ">
          <button onClick={() => setCurrentPath([])} className="font-medium">
            {bucketName || "Root"}
          </button>
          {currentPath.map((segment, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span> &gt;</span>
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))}
                className="hover:text-white font-medium"
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
                isTableView
                  ? process.env.PUBLIC_URL + "/bg-tableformat.png"
                  : process.env.PUBLIC_URL + "/tableformat.png"
              }
              alt="Table"
              className={
                isTableView
                  ? "w-6 h-7 rounded-lg  py-1 "
                  : "w-6 h-7 rounded-lg  py-1 "
              }
            />
          </button>
          <button type="button" onClick={handlePlainView}>
            <img
              src={
                !isTableView
                  ? process.env.PUBLIC_URL + "/bg-plainformat-icon.png"
                  : process.env.PUBLIC_URL + "/plainformat-icon.png"
              }
              alt="Plain"
              className={
                !isTableView
                  ? "w-6 h-7  rounded-lg  py-1 "
                  : "w-5 h-7  rounded-lg  py-1 "
              }
            />
          </button>
        </div>
      </div>
 

      {/* MAIN TABLE CONTAINER HOOK */}
      {isTableView ? (
      <div className="w-full flex-1 flex flex-col min-h-0 rounded-lg overflow-hidden  mt-1 px-5">
        <div
          className="w-full max-h-[45vh] min-h-[270px] rounded-lg shadow-lg bg-white shadow-slate-500/50 flex flex-col overflow-hidden"
          style={
            {
              // height: isHighZoom ? '120px' : '400px'
              // height: tableHeights.container
            }
          }
        >
          <table className="table-design w-[100%] table-fixed ">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
              <tr>
                <th className="py-2 sticky top-0 rounded-tl-lg font-normal text-xs"></th>

                <th className="py-2 sticky top-0 font-normal text-xs">
                  Name
                  <span
                    onClick={() => handleSortAscending("name")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("name")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Size (bytes)
                  <span
                    onClick={() => handleSortAscending("size")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("size")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Created Date
                  <span
                    onClick={() => handleSortAscending("creation_time")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("creation_time")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 font-normal text-xs">
                  Modified Date
                  <span
                    onClick={() => handleSortAscending("modified_time")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleSortDescending("modified_time")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 rounded-tr-lg font-normal text-xs">
                  File Path
                </th>
              </tr>
            </thead>
          </table>
          {/* <div
            className="overflow-auto mt-0.5 "
            style={{
              scrollbarWidth: "thin",
            //   height: isHighZoom ? '80px' : '350px'
            height: tableHeights.body
            }}
          > */}
          <div
            className="max-h-[15vh] min-h-[210px] overflow-y-auto overflow-x-hidden mt-1.5 flex-1 border-t border-slate-100"
            style={{ scrollbarWidth: "thin" }}
          >
            <table className="table-design table-fixed w-full">
              <tbody>
                {displayedFolders.map((folder) => (
                  <tr
                    key={folder.id}
                    className="hover:bg-primary rounded-md cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <td className="w-[3%] text-xs font-normal overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      //   onClick={() => handleFileRowClick(folder.name)}
                    >
                      <span className="text-[11px] font-light text-black cursor-pointer text-center flex items-center">
                        <div className="flex items-center mr-2">
                          <img
                            src={
                              process.env.PUBLIC_URL + "/baseline-folder.png"
                            }
                            alt="Folder"
                            className="w-3 h-3"
                          />
                        </div>
                        <span className="truncate">{folder.name}</span>
                      </span>

                      {/* {folder.name} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                  </tr>
                ))}
                {displayedFiles.map((file, i) => (
                  <tr
                    key={file.file_id || i}
                    // className={` ${
                    //   selectedFiles.includes(file.file_name)
                    //     ? "bg-primary rounded-md "
                    //     : ""
                    // }`}
                    className={`cursor-pointer transition-colors duration-150 ease-in-out
                    ${
                      file.isSelected ? "hover:bg-primary " : "hover:bg-primary text-black" // 🎯 Tailwind still handles the dynamic hover event here
                    }`}
                    onClick={() => handleFileRowClick(file)}
                  >
                    <td className="w-[3%]"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      // onClick={() => handleFileRowClick(file)}
                    >
                      <span className="text-[11px] font-normal text-black cursor-pointer text-center flex flex-row items-center">
                        <div className="flex items-center relative mr-2 mt-1 flex-shrink-0">
                          <img
                            src={process.env.PUBLIC_URL + "/file-icon.png"}
                            alt="File"
                            className="w-3 h-3 "
                          />
                          {/* {selectedFiles.includes(file.file_name) && (
                            <img
                              src={process.env.PUBLIC_URL + "/tick-icon.png"}
                              alt="Selected"
                              className="absolute w-4 h-4 -top-2 -right-1"
                            />
                          )} */}
                        </div>
                        <span className="truncate">
                          {file.file_name
                            ? file.file_name.split("/").pop()
                            : file.name}
                        </span>
                      </span>
                      {/* {file.file_name ? file.file_name.split("/").pop() : ""} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light  pl-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.size}
                    </td>
                    <td className="w-[20%] text-[11px] font-light  overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.creation_time}
                    </td>
                    <td className="w-[20%] text-[11px]  font-light overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.modified_time}
                    </td>
                    {/* <td className="w-[15%] bg-green-500 text-[11px] flex item-center font-light overflow-ellipsis whitespace-nowrap overflow-hidden"> */}
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.file_path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ):(
      //   <FilesPlainView
      //   isTableView={isTableView}
      //   handlePlainView={handlePlainView}
      //   handleTableView={handleTableView}
      //   currentPath={currentPath}
      //   setCurrentPath={setCurrentPath}
      //   bucketName={bucketName}
      //   displayedFolders={displayedFolders} // Pass your local calculated array
      //   displayedFiles={displayedFiles}     // Pass your local calculated array
      //   handleFolderClick={handleFolderClick}
      //   handleFileRowClick={handleFileRowClick}
      //   isLoading={isLoading}
      // />
      <div
      className="w-full h-full select-none flex flex-col"
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <div
        className="w-full max-h-72  grid items-start gap-4 overflow-y-auto p-5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          scrollbarWidth: "thin",
          alignContent: "start",
        }}
      >
        {/* 📁 LIVE FOLDER DISPLAY ENGINE */}
        {displayedFolders.map((folder, index) => {
          let folderName = typeof folder === "string" ? folder : folder?.name || folder?.folder_name;
          if (!folderName) folderName = `Folder-${index}`;

          // Drop trailing folder slashes if returned by S3 structure
          if (folderName.endsWith("/")) folderName = folderName.slice(0, -1);
          const folderId = folder?.id || `folder-${index}`;

          return (
            <div
              key={folderId}
              className="flex flex-col items-center justify-start cursor-pointer w-full group"
              onClick={() => handleFolderClick(folder)} // 🎯 Trigger parent path updates
            >
              <div className="flex flex-col items-center space-y-1 w-full text-center">
                <div className="w-14 h-14 flex items-center justify-center p-1 rounded-md transition-all group-hover:bg-slate-100/80">
                  <img
                    src={process.env.PUBLIC_URL + "/baseline-folder.png"}
                    alt="Folder"
                    className="w-12 h-12 object-contain"
                    title={folderName}
                  />
                </div>
                <span
                  className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5"
                  title={folderName}
                >
                  {folderName}
                </span>
              </div>
            </div>
          );
        })}

        {/* 📄 LIVE FILE DISPLAY ENGINE */}
        {displayedFiles.map((file, index) => {
          const rawFileName = typeof file === "string" ? file : file?.file_name || file?.name || `File-${index}`;
          const cleanFileName = rawFileName.split("/").pop() || rawFileName;
          const fileId = file?.file_id || file?.id || `file-${index}`;
          
          // Use parent calculated boolean validation property directly
          const isSelected = file?.isSelected || false; 

          return (
            <div
              key={fileId}
              className={`flex flex-col items-center justify-start cursor-pointer w-full group p-1 transition-all rounded-md ${
                isSelected
                  ? "bg-primary/20 ring-1 ring-primary/40 shadow-sm"
                  : "hover:bg-slate-100/80"
              }`}
              onClick={() => handleFileRowClick(file)} // 🎯 Match parent selection state functions
            >
              <div className="flex flex-col items-center space-y-1 w-full text-center relative">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={process.env.PUBLIC_URL + "/file-icon.png"}
                    alt="File"
                    className="w-10 h-12 object-contain"
                    title={cleanFileName}
                  />
                </div>
                <span
                  className="text-[11px] sm:text-[12px] font-medium text-black block w-full truncate px-0.5 cursor-pointer"
                  title={cleanFileName}
                >
                  {cleanFileName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      )}
    </div>
  );
};

export default DataExplore;
