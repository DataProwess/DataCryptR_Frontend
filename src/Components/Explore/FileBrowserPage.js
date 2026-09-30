import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { API_URL } from "../ApiConfig";
import { apiRequest } from "../csrfUtils";
import FolderNoDataPopup from "../FolderNoDataPopup";
import DataLoader from "./DataLoader";

const FileBrowserPage = ({
  filteredFilesFolders,
  filteredFolders,
  handleFolderClick,
  handleSortAscending,
  handleSortDescending,
  handleFileRowClick,
  handleSearchOkClick,
  handleFileClick,
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
  isModalOpen,
  isMetaDataModalOpen,
  isColumnDataModalOpen,
}) => {
  const { containerData, bucketId } = useParams();
  const location = useLocation();

  console.log("i", selectedFiles);
  console.log("ii", filteredFilesFolders);

  const [folderTree, setFolderTree] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [noPattern, setNoPattern] = useState("");
  const [isNoDataPopupOpen, setIsNoDataPopupOpen] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");

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
  //   useEffect(() => {
  //     fetchS3BlobsForDirectory(
  //       currentPath,
  //       currentPage,
  //       rowsPerPage,
  //       searchPattern,
  //     );
  //   }, [currentPath, currentPage, rowsPerPage, searchPattern]);

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
  if (noPattern) {
    return (
      <FolderNoDataPopup
        isOpen={isNoDataPopupOpen}
        message={noPattern} // "No matching folders or files found."
        onClose={handleSearchOkClick}
      />
    );
  }

  // console.log("data before",filteredFilesFolders,filteredFolders)
  // Check if filteredFilesFolders and filteredFolders are empty
  if (!Array.isArray(filteredFilesFolders) || !Array.isArray(filteredFolders)) {
    return (
      <div className="w-full h-full flex items-center justify-center p-10">
        <div className="bg-white p-6 rounded-lg shadow-lg items-center w-80 h-32 flex flex-col space-y-8">
          <p className="font-medium text-xs text-[#5c5cff]">
            No Folders and Files Exist
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              className="w-16 h-6 text-black text-xs bg-gray font-medium border border-none rounded-lg"
              onClick={() => setNoDataMessage(false)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const isDataEmpty =
    (!filteredFolders || filteredFolders.length === 0) &&
    (!filteredFilesFolders || filteredFilesFolders.length === 0);

  const anyModalOpen =
    isModalOpen || isMetaDataModalOpen || isColumnDataModalOpen;

  return (
    <div className="layout-table  px-7   flex flex-col">
      {isTableView ? (
        <div className="layout-data-container table-margin   flex rounded-lg pt-0.5 pb-2 flex-col shadow-lg shadow-slate-500/50 overflow-hidden">
          {/* <div className="layout-breadcrums-container bg-purpleshade1 rounded-t-lg "> */}
          <div
            className={`layout-breadcrums-container bg-purpleshade1 rounded-t-lg ${anyModalOpen ? "relative z-0 blur-effect pointer-events-none select-none" : "relative z-10"}`}
          >
            <table className="table-design w-[100%] h-2 table-fixed ">
              <colgroup>
                <col className="w-[3%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
              </colgroup>
              {/* <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white"> */}
              <thead
                className={`bg-purpleshade1 sticky top-0 text-white text-xs ${anyModalOpen ? " blur-effect " : ""}`}
              >
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
          <div
            className={`layout-rows-container  flex-1 pt-2 pb-3 pr-2 border-t border-slate-100 overflow-y-auto overflow-x-hidden
           ${anyModalOpen ? " blur-effect " : ""}`}
            style={{ scrollbarWidth: "thin" }}
          >
            <table className="table-design table-fixed ">
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <div className="flex items-center justify-center h-48 w-full py-12">
                        <DataLoader />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Render Folders */}
                    {filteredFolders.map((folder, idx) => (
                      <tr
                        key={folder.id || `folder-${idx}`}
                        className="hover:bg-primary/10 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleFolderClick(folder.name)}
                      >
                        <td className="w-[3%] text-xs font-normal"></td>
                        <td className="w-[25%] truncate cursor-pointer py-1.5">
                          <span className="text-[11px] font-light text-black cursor-pointer flex items-center">
                            <div className="flex items-center mr-2 flex-shrink-0">
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/baseline-folder.png"
                                }
                                alt="Folder"
                                className="w-3.5 h-3.5"
                              />
                            </div>
                            <span className="truncate">{folder.name}</span>
                          </span>
                        </td>
                        <td className="w-[15%] text-[11px] font-light text-black px-3 truncate"></td>
                        <td className="w-[20%] text-[11px] font-light text-black px-3 truncate"></td>
                        <td className="w-[20%] text-[11px] font-light text-black px-3 truncate"></td>
                        <td className="w-[15%] text-[11px] font-light text-black px-3 truncate"></td>
                      </tr>
                    ))}

                    {/* Render Files */}
                    {filteredFilesFolders.map((file, i) => {
                      // const isSelected = file.isSelected || false;
                      const isSelected = selectedFiles.includes(file.file_name);
                      const fileNameDisplay = file.file_name
                        ? file.file_name.split("/").pop()
                        : file.name || "";

                      return (
                        <tr
                          key={file.file_id || `file-${i}`}
                          className={`cursor-pointer transition-colors duration-150 ease-in-out ${
                             isSelected
                  ? "bg-slate-200 ring-1 ring-primary/40 shadow-sm"
                  : "hover:bg-slate-100/80"
                          }`}
                          onClick={() => handleFileRowClick?.(file)}
                        >
                          <td className="w-[3%]"></td>
                          <td className="w-[25%] truncate cursor-pointer py-1.5">
                            <span className="text-[11px] font-normal text-black cursor-pointer flex flex-row items-center">
                              <div className="flex items-center relative mr-2 flex-shrink-0">
                                <img
                                  src={
                                    process.env.PUBLIC_URL + "/file-icon.png"
                                  }
                                  alt="File"
                                  className="w-3 h-3"
                                />
                              </div>
                              <span className="truncate">
                                {fileNameDisplay}
                              </span>
                            </span>
                          </td>
                          <td className="w-[15%] text-[11px] font-light pl-3 truncate">
                            {file.size}
                          </td>
                          <td className="w-[20%] text-[11px] font-light truncate">
                            {file.creation_time}
                          </td>
                          <td className="w-[20%] text-[11px] font-light truncate">
                            {file.modified_time}
                          </td>
                          <td className="w-[15%] text-[11px] font-light text-black px-3 truncate">
                            {file.file_path}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="layout-grid-container select-none flex flex-col grid-padding"
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
            {/* {displayedFolders.map((folder, index) => { */}
            {filteredFolders.map((folder, index) => {
              let folderName =
                typeof folder === "string"
                  ? folder
                  : folder?.name || folder?.folder_name;
              if (!folderName) folderName = `Folder-${index}`;

              // Drop trailing folder slashes if returned by S3 structure
              if (folderName.endsWith("/"))
                folderName = folderName.slice(0, -1);
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
            {/* {displayedFiles.map((file, index) => { */}
            {filteredFilesFolders.map((file, index) => {
              const rawFileName =
                typeof file === "string"
                  ? file
                  : file?.file_name || file?.name || `File-${index}`;
              const cleanFileName = rawFileName.split("/").pop() || rawFileName;
              const fileId = file?.file_id || file?.id || `file-${index}`;

              // Use parent calculated boolean validation property directly
              // const isSelected = file?.isSelected || false;
              const isSelected = selectedFiles.includes(file.file_name);

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
  );
};

export default FileBrowserPage;
