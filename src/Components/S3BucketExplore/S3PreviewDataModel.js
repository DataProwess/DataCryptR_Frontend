import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import FullScreenPreview from "../FullScreenPreview";
import { useAuth } from "../AuthContext";
import TabularPreview from "./TabularPreview";
import { apiRequest, makeAuthenticatedRequest } from "../csrfUtils";
import { API_URL } from "../ApiConfig";
import ErrorPopup from "../ErrorPopup";

const S3PreviewDataModel = ({
  selectedFiles,
  handleDownload,
  closePreviewModal,
  handleDynamicPreview,
  previewData,
  isModalOpen,
  s3AccountId,
  bucketId,
  selectedS3AccountName,
  isDownloadStorage,
}) => {
  console.log(
    "Current Preview Data Container State:",

    selectedFiles,
  );

  const { token, csrfToken, permissions } = useAuth();
  const location = useLocation();
  const [itemOffset, setItemOffset] = useState(0);
  const [isOpenRows, setIsOpenRows] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("plain_text");
  const [showInput, setShowInput] = useState(false);
  const [showTableInput, setShowTableInput] = useState(true);
  const [selectedStorageAccount, setSelectedStorageAccount] = useState(
    location.state?.selectedStorageAccount || null,
  );
  const containerData = location.state?.containerData;
  const fileShareId = location.state?.fileShareId;
  const [s3Error, setS3Error] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [previousTableButtonDisabled, setPreviousTableButtonDisabled] =
    useState(true);
  const [nextTableButtonDisabled, setNextTableButtonDisabled] = useState(false);
  const [searchInputText, setSearchInputText] = useState("");
  const [maskedData, setMaskedData] = useState(true);
  const [isMasked, setIsMasked] = useState(
    localStorage.getItem("isMasked") === "true" || true,
  );

  const canSeeRealData = permissions?.includes("SeeRealData");
  const [downlloading, setDownloading] = useState(true);
  const containerRef = useRef(null);
  const matchRefs = useRef([]);

  const [selectionId, setSelectionId] = useState(
    containerData ? containerData : fileShareId,
  );
  const [selectionType, setSelectionType] = useState(
    containerData ? "container" : "fileShare",
  );

  const [dataLoading, setDataLoading] = useState(!previewData);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl + F (or Cmd + F on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        setShowInput(true);
        setShowTableInput(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Clean up perfectly every time dependencies change or component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Keep empty safely now because it doesn't read state; if it reads state later, add them here!

  const getFormattedTableData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;

    let parsedPayload = null;

    if (typeof data === "string") {
      try {
        parsedPayload = JSON.parse(data);
      } catch (e) {
        const lines = data.split("\n").filter((line) => line.trim() !== "");
        if (lines.length === 0) return [];
        const headers = lines[0].split(",");
        return lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || "";
          });
          return obj;
        });
      }
    } else if (typeof data === "object") {
      parsedPayload = data;
    }

    if (parsedPayload) {
      let geoJson = null;

      if (parsedPayload.data && typeof parsedPayload.data === "string") {
        try {
          geoJson = JSON.parse(parsedPayload.data);
        } catch (e) {}
      } else if (parsedPayload.data && typeof parsedPayload.data === "object") {
        geoJson = parsedPayload.data;
      } else if (parsedPayload.features) {
        geoJson = parsedPayload;
      }

      if (geoJson && Array.isArray(geoJson.features)) {
        return geoJson.features.map((feature) => {
          let rawCoords = feature.geometry?.coordinates
            ? JSON.stringify(feature.geometry.coordinates)
            : "";
          let cleanedCoordinates = rawCoords
            .replace(/[\[\]]/g, "")
            .split(/,(?=-?\d+\.)/)
            .map((coord) => coord.trim())
            .filter(Boolean)
            .join(" | ");

          return {
            ID: feature.id || "N/A",
            Type: feature.type || "Feature",
            Name: feature.properties?.name || "N/A",
            "Geometry Type": feature.geometry?.type || "N/A",
            Coordinates: cleanedCoordinates || "N/A",
          };
        });
      }

      return Array.isArray(parsedPayload) ? parsedPayload : [parsedPayload];
    }

    return [];
  };

  const handleButtonClick = () => {
    setSelectedFormat(selectedFormat === "tabular" ? "plain_text" : "tabular");
    setShowInput(false);
    setShowTableInput(false);
    setSearchInputText("");
    setCurrentMatchIndex(-1);
    setMatchedIndexes([]);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault();
        setShowInput(true);
        setShowTableInput(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Tracks global cross-row index assignments cleanly
  let globalMatchTracker = 0;

  const highlightText = (rowData) => {
    if (!searchInputText) {
      return <span>{rowData}</span>;
    }

    const escapedSearchText = searchInputText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const regex = new RegExp(`(${escapedSearchText})`, "gi");
    const parts = rowData.split(regex);

    return parts.map((part, i) => {
      const isMatch = i % 2 === 1;
      if (isMatch) {
        const matchIdx = globalMatchTracker;
        globalMatchTracker++;
        const isCurrentMatch = matchIdx === currentMatchIndex;

        return (
          <span
            key={i}
            ref={(el) => (matchRefs.current[matchIdx] = el)}
            style={{
              backgroundColor: isCurrentMatch ? "orange" : "yellow",
              fontWeight: "bold",
              color: "black",
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const highlightNextMatch = (direction) => {
    if (matchedIndexes.length === 0) return;

    setCurrentMatchIndex((prevIndex) => {
      let nextIndex = prevIndex + direction;
      if (nextIndex < 0) {
        nextIndex = matchedIndexes.length - 1;
      } else if (nextIndex >= matchedIndexes.length) {
        nextIndex = 0;
      }

      // Auto-scroll match point target directly into container views
      setTimeout(() => {
        if (matchRefs.current[nextIndex]) {
          matchRefs.current[nextIndex].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 50);

      return nextIndex;
    });
  };

  // Build out matching index payload metrics
  const rebuildCSVTextContent = () => {
    const headersStr = tableHeaders.join(",");
    const rowsStr = paginatedRows
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return tableHeaders
            .map((h) => String(item[h] || "").replace(/\s*\|\s*/g, ", "))
            .join(",");
        }
        return String(item);
      })
      .join("\n");
    return `${headersStr}\n${rowsStr}`;
  };

  useEffect(() => {
    matchRefs.current = [];
    if (!searchInputText) {
      setMatchedIndexes([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const fullText = rebuildCSVTextContent();
    const searchRegex = new RegExp(
      searchInputText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    const matches = [...fullText.matchAll(searchRegex)];

    if (matches.length > 0) {
      setMatchedIndexes(matches.map((_, i) => i));
      setCurrentMatchIndex(0); // Default first matched element to orange highlight
    } else {
      setMatchedIndexes([]);
      setCurrentMatchIndex(-1);
    }
  }, [searchInputText, previewData, currentTablePage, rowsPerPage]);

  const handleSearchInputChange = (event) => {
    setSearchInputText(event.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      highlightNextMatch(1);
    }
  };

  const tableData = getFormattedTableData(previewData);
  const tableHeaders =
    tableData.length > 0
      ? Object.keys(tableData[0])
      : ["ID", "Type", "Name", "Geometry Type", "Coordinates"];

  const totalRows = tableData ? Math.ceil(tableData.length / rowsPerPage) : 0;
  const indexOfLastRow = currentTablePage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  const handletableNextPage = () => {
    const nextPage = currentTablePage + 1;
    setCurrentTablePage(nextPage);
    setPreviousTableButtonDisabled(false);
    if (nextPage >= totalRows) setNextTableButtonDisabled(true);
  };

  const handletablePrevPage = () => {
    const prevPage = currentTablePage - 1;
    setCurrentTablePage(prevPage);
    setNextTableButtonDisabled(false);
    if (prevPage === 1) setPreviousTableButtonDisabled(true);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentTablePage(1);
    setPreviousTableButtonDisabled(true);
    setNextTableButtonDisabled(false);
  };

  const handleSwitchChange = async () => {
    setMaskedData((prevMaskedData) => !prevMaskedData);
  };

  // const handleDownloadFile = async () => {
  //   // Guard Clause: Ensure a valid file index exists
  //   if (!selectedFiles || !selectedFiles[0]) {
  //     alert("⚠️ No files selected for download compilation.");
  //     return;
  //   }

  //   try {
  //     setDownloading(true);

  //     const fileKey = selectedFiles[0];

  //     // Construct strict explicit integer structures for Django models
  //     const payload = {
  //       s3_account_id: parseInt(s3AccountId, 10),
  //       s3_bucket_id: parseInt(bucketId, 10),
  //       file_key: fileKey,
  //       is_masked: Boolean(maskedData)
  //     };

  //     console.log("[S3 Download Pipeline] Dispatching task request payload...", payload);

  //     /* * 🚀 `apiRequest` naturally handles auth headers, checks CSRF validity,
  //      * stringifies data, and returns the raw parsed JSON object automatically.
  //      */
  //    const responseData = await apiRequest(
  //       `${API_URL}/api/s3/files/download/`,
  //       "POST",
  //       payload,
  //       {
  //         headers: {
  //           "Authorization": `Bearer ${token}`,
  //           "X-CSRFToken": csrfToken
  //         }
  //       }
  //     );

  //     // Guard Clause: Validate that the backend returned a successful message
  //     if (responseData && responseData.message) {
  //       alert(`✅ ${responseData.message}! You can monitor progress inside your Tasks profile tab.`);
  //     } else if (responseData && responseData.error) {
  //       throw new Error(responseData.error);
  //     } else {
  //       throw new Error("No validation acknowledgment received from cloud task engine.");
  //     }

  //   } catch (error) {
  //     console.error("[S3 Download Pipeline Error]:", error);

  //     // Graceful production alert system parsing
  //     if (error.message.includes("504") || error.message.toLowerCase().includes("timeout")) {
  //       alert(
  //         "⚠️ Gateway Timeout (504):\nThe server took too long to queue this task. " +
  //         "Please check your Celery broker terminal logs to see if workers are hanging."
  //       );
  //     } else {
  //       alert(`Failed to compile cloud download streams: ${error.message}`);
  //     }
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  // Helper to safely extract CSRF token directly from cookies if state is empty
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleDownloadFile = async () => {
    if (!selectedFiles || !selectedFiles[0]) {
      alert("⚠️ No files selected for download compilation.");
      return;
    }

    try {
      setDownloading(true);

      const fileKey = selectedFiles[0];

      const payload = {
        s3_account_id: parseInt(s3AccountId, 10),
        s3_bucket_id: parseInt(bucketId, 10),
        file_key: fileKey,
        is_masked: Boolean(maskedData),
      };

      console.log(
        "[S3 Download Pipeline] Dispatching task request payload...",
        payload,
      );

      // Get active CSRF token (fallback to reading cookie directly)
      const activeCsrfToken = csrfToken || getCookie("csrftoken");

      const responseData = await apiRequest(
        `${API_URL}/api/s3/files/download/`,
        "POST",
        payload,
        {
          credentials: "include", // 👈 CRITICAL: Sends session cookies required by @csrf_protect_api
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": activeCsrfToken || "", // 👈 Ensured token value
          },
        },
      );

      // if (responseData && responseData.message) {
      if (responseData && (responseData.task_id || responseData.message)) {
        const taskIdMsg = responseData.task_id
          ? ` (Task ID: ${responseData.task_id})`
          : "";
        // alert(`✅ ${responseData.message}! You can monitor progress inside your Tasks profile tab.`);
        setS3Error(
          `✅ ${responseData.message || "Download task queued successfully"}${taskIdMsg}! Check your Tasks tab for progress.`,
        );
        setIsPopupOpen(true);
      } else if (responseData && responseData.error) {
        throw new Error(responseData.error);
      } else {
        throw new Error(
          "No validation acknowledgment received from cloud task engine.",
        );
      }
    } catch (error) {
      console.error("[S3 Download Pipeline Error]:", error);
      // alert(`Failed to compile cloud download streams: ${error.message}`);
      setS3Error(`Failed to compile cloud download streams: ${error.message}`);
      setIsPopupOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  // useEffect(() => {
  //   if (
  //     selectionId &&
  //     selectionType &&
  //     selectedStorageAccount &&
  //     selectedFormat
  //   ) {
  //     setDataLoading(true);
  //     handleDynamicPreview(
  //       selectionId,
  //       selectionType,
  //       selectedStorageAccount,
  //       selectedFormat,
  //       maskedData,
  //     )
  //       .then(() => setDataLoading(false))
  //       .catch((error) => {
  //         setDataLoading(false);
  //         console.error("Error fetching data:", error);
  //       });
  //   }
  // }, [
  //   maskedData,
  //   selectionId,
  //   selectionType,
  //   selectedStorageAccount,
  //   selectedFormat,
  // ]);

  const toggleRowsDropdown = () => {
    setIsOpenRows((prev) => !prev);
  };

  const handleCheckboxChange = (event) => {};

  const [isDownloadStorageState, setIsDownloadStorageState] = useState(
    Boolean(isDownloadStorage),
  );

  // Keep state synced if prop updates from parent
  useEffect(() => {
    setIsDownloadStorageState(Boolean(isDownloadStorage));
  }, [isDownloadStorage]);

  console.log("downloadingstate", isDownloadStorageState);

  // Selection handler for setting rows per page
  const selectOption = (value) => {
    handleRowsPerPageChange(value);
    setIsOpenRows(false);
  };

  return (
    <div
      className="w-[65vw] h-[80vh] flex flex-col px-6 z-1000"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {selectedFormat === "tabular" ? (
        tableData.length > 0 ? (
          <div className="w-full h-full flex flex-col">
            <TabularPreview
              isLoading={dataLoading}
              setIsLoading={setDataLoading}
              previewData={paginatedRows}
              data={paginatedRows}
              headers={tableHeaders}
              // handlePageClick={handlePageClick}
              handleDownloadFile={handleDownloadFile}
              handleSwitchChange={handleSwitchChange}
              maskedData={maskedData}
              isMasked={isMasked}
              selectedFiles={selectedFiles ? selectedFiles[0] : ""}
              canSeeRealData={canSeeRealData}
              pageNumbers={[]}
              handletablePrevPage={handletablePrevPage}
              handletableNextPage={handletableNextPage}
              handleRowsPerPageChange={handleRowsPerPageChange}
              tableHeaders={tableHeaders}
              paginatedRows={paginatedRows}
            />
          </div>
        ) : (
          <div className="w-full text-center py-12 text-gray-400 italic text-sm">
            No dynamic table records found.
          </div>
        )
      ) : (
        <div className="w-[60vw] h-[70vh] flex flex-col items-center mt-1 px-3 ">
          {/* Header Action Menu strip */}
          <div className="w-[60vw] h-[10vh] flex flex-row gap-4 px-2 items-center ">
            <div className="flex flex-row bg-white justify-between items-center w-72 h-9 rounded shadow-md shadow-slate-500/30 px-3">
              <input
                type="text"
                placeholder="Search text..."
                value={searchInputText}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyPress}
                autoComplete="off"
                className="border-none outline-none text-black w-full text-sm"
              />
              <img
                src={process.env.PUBLIC_URL + "/search_icon.png"}
                alt="search"
                className="w-4 h-4"
              />
            </div>
            <div className="h-8 w-14 flex flex-row justify-between items-center px-1">
              <button
                onClick={() => highlightNextMatch(-1)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Previous Match"
              >
                <img
                  src={process.env.PUBLIC_URL + "/less-than.png"}
                  alt="prev"
                  className="w-3 h-3"
                />
              </button>
              <button
                onClick={() => highlightNextMatch(1)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Next Match"
              >
                <img
                  src={process.env.PUBLIC_URL + "/more-than.png"}
                  alt="next"
                  className="w-3 h-3"
                />
              </button>
            </div>

            {canSeeRealData && (
              <div className="h-8 w-56 flex flex-row gap-3 items-center ml-2">
                <label className="text-[12px] font-medium text-black">
                  Masked Data?
                </label>
                <img
                  src={
                    maskedData
                      ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
                      : process.env.PUBLIC_URL + "/noswitch-icon.png"
                  }
                  alt="switch"
                  onClick={handleSwitchChange}
                  className="w-10 h-4 cursor-pointer"
                />
              </div>
            )}
            <div className="flex-grow"></div>
            <button
              className="w-28 h-8 flex rounded-md cursor-pointer justify-center items-center font-medium text-[13px] bg-purpleshade1 text-white"
              onClick={handleDownloadFile}
            >
              Download
            </button>
          </div>

          {/* <div className="w-[60vw] h-10 flex flex-row px-2 items-center text-black text-xs font-medium">
            {selectedFiles &&
              selectedFiles[0] &&
              selectedFiles[0].split(/[\\/]/).pop()}
          </div> */}
          <div className="w-[60vw] h-10 flex flex-row px-2 items-center text-black text-xs font-medium">
            <div className="w-1/2 flex ">
              {selectedFiles &&
                selectedFiles[0] &&
                selectedFiles[0].split(/[\\/]/).pop()}
            </div>
            {canSeeRealData && (
              <div className="w-1/2 h-10  flex space-x-1 items-center justify-end">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={handleCheckboxChange}
                    checked={isDownloadStorageState}
                    className="ml-2 cursor-pointer"
                  />
                </div>
                <div className="">{selectedS3AccountName || "Loading..."}</div>
              </div>
            )}
          </div>

          {/* Flat Plain CSV View Text Area */}
          <div className="w-[60vw] h-[70vh] flex justify-center border border-lightgray-300 rounded-md shadow-md shadow-slate-500/30 bg-white">
            {dataLoading ? (
              <div className="w-full h-full flex flex-col justify-center items-center">
                <img
                  src={process.env.PUBLIC_URL + "/loadergif.gif"}
                  alt="loading..."
                  className="w-8 h-8 opacity-75"
                />
              </div>
            ) : tableData.length === 0 ? (
              <div className="w-full h-full flex flex-col justify-center items-center text-gray-400 italic text-sm">
                Awaiting file pipeline streaming content...
              </div>
            ) : (
              <div
                className="w-w-[59vw] h-[58vh] cursor-not-allowed  overflow-auto font-poppins text-black p-4 select-text text-xs leading-normal whitespace-pre tracking-normal"
                ref={containerRef}
                style={{ scrollbarWidth: "thin" }}
              >
                {/* Header Row String without lowercasing or lines */}
                <div className="font-medium text-[12px] text-gray-900 pb-1">
                  {highlightText(tableHeaders.join(","))}
                </div>

                {/* Data Rows */}
                {paginatedRows.map((item, index) => {
                  let csvRowLine = "";
                  if (typeof item === "object" && item !== null) {
                    csvRowLine = tableHeaders
                      .map((header) => {
                        let value = item[header] || "";
                        return String(value).replace(/\s*\|\s*/g, ", ");
                      })
                      .join(",");
                  } else {
                    csvRowLine = String(item);
                  }

                  return (
                    <div
                      key={`row-${index}`}
                      className="py-0.5 hover:bg-slate-50"
                    >
                      {highlightText(csvRowLine)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedFiles && selectedFiles[0] && (
        <div className="w-[60vw] h-14 flex flex-row items-center justify-between mt-4 px-2">
          <div className="w-32 h-8 flex items-center justify-center flex-shrink-0">
            <button
              className="w-full h-full flex rounded-md cursor-pointer justify-center items-center font-medium text-[12px] bg-purpleshade1 text-white shadow-sm hover:opacity-90 transition-opacity"
              onClick={handleButtonClick}
            >
              {selectedFormat === "tabular" ? "Plain Text" : "Tabular Preview"}
            </button>
          </div>

          {/* Right Side: Empty space keeper 
      Maintains the exact same structural row footprint so the flexbox centerline never jumps.
    */}
          <div className="h-8 w-1 flex-shrink-0" aria-hidden="true" />
        </div>
      )}
      <ErrorPopup
        isOpen={isPopupOpen}
        message={s3Error}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default S3PreviewDataModel;
