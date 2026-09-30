
import { useState, useEffect, useRef, useMemo } from "react";
import TabularPreviewData from "./TabularPreviewData";
import { useAuth } from "../AuthContext";
import { apiRequest, makeAuthenticatedRequest } from "../csrfUtils";
import { API_URL } from "../ApiConfig";
import { toast } from "react-toastify";
import { secureApiCall } from "../csrfUtils";


// const parseCSV = (csv) => {
//   if (!csv || typeof csv !== "string") {
//     return [];
//   }

//   const lines = csv.trim().split(/\r?\n/);

//   if (lines.length < 2) {
//     return [];
//   }

//   const headers = lines[0]
//     .split(",")
//     .map((header) => header.trim());

//   return lines.slice(1).map((line) => {
//     const values = line.split(",");

//     const row = {};

//     headers.forEach((header, index) => {
//       row[header] = values[index]?.trim() ?? "";
//     });

//     return row;
//   });
// };
const parseCSV = (csv, hasHeader = true) => {
  if (!csv || typeof csv !== "string") {
    return [];
  }

  const lines = csv
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return [];
  }

  // =====================================================
  // NO HEADER FILE
  // Keep every row as DATA
  // =====================================================
  if (!hasHeader) {
    const columnCount = lines[0].split(",").length;

    return lines.map((line) => {
      const values = line.split(",");

      const row = {};

      for (let index = 0; index < columnCount; index++) {
        row[`__column_${index}`] = values[index]?.trim() ?? "";
      }

      return row;
    });
  }

  // =====================================================
  // HEADER FILE
  // Existing behavior
  // =====================================================
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });

    return row;
  });
};
const FilePreviewDataModal = ({
  isModalOpen,
  setIsModalOpen,
  containerData,
  apiData,
  selectedFormat,
  setSelectedFormat,
  selectedFiles,
  fileShareId,
  fileShareName,
  apiLoading,
  setApiLoading,
  selectedStorageAccountId,
  containerName,
  isMetaDataModalOpen,
  isColumnDataModalOpen,
  selectedStorageAccount,
  isDownloadStorage,
  selectedAccountKey,
   selectionId,
    selectionType,
    isHeaderAvailable,
    setIsHeaderAvailable,
 
  handleDynamicPreview,
}) => {
    console.log("apiData", apiData, typeof(apiData));
   const safeApiData = useMemo(() => {
  if (!apiData) {
    return [];
  }

  if (Array.isArray(apiData)) {
    return apiData;
  }

  if (typeof apiData === "string") {
    return parseCSV(apiData, isHeaderAvailable);
  }

  if (typeof apiData === "object") {
    if (Array.isArray(apiData.data)) {
      return apiData.data;
    }

    if (Array.isArray(apiData.rows)) {
      return apiData.rows;
    }

    if (Array.isArray(apiData.results)) {
      return apiData.results;
    }

    return [apiData];
  }

  return [];
}, [apiData, isHeaderAvailable]);

console.log("safeApiData:", safeApiData);
  const { token, csrfToken, permissions } = useAuth();
  const containerRef = useRef(null);
//   const [apiLoading, setApiLoading] = useState(true);
  const [isDownloadStorageState, setIsDownloadStorageState] = useState(
    Boolean(isDownloadStorage),
  );
  const [isMasked, setIsMasked] = useState(
    localStorage.getItem("isMasked") === "true" || true,
  );
  // 3. Keep local state in sync if the incoming prop updates
  useEffect(() => {
    setIsDownloadStorageState(Boolean(isDownloadStorage));
  }, [isDownloadStorage]);
  const canSeeRealData = permissions.includes("SeeRealData");
  const [maskedData, setMaskedData] = useState(true);
  const [matchedElements, setMatchedElements] = useState([]);
  const [searchInputText, setSearchInputText] = useState("");
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [isOpenRows, setIsOpenRows] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [itemOffset, setItemOffset] = useState(0);
  const [searchTableInputText, setSearchTableInputText] = useState("");
  const [istableDropdownOpen, setIstableDropdownOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);
  const [previousTableButtonDisabled, setPreviousTableButtonDisabled] =
    useState(true);
  const [nextTableButtonDisabled, setNextTableButtonDisabled] = useState(false);
  const [currentHighlightedIndex, setCurrentHighlightedIndex] = useState(-1);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [showReplaceInput, setShowReplaceInput] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showTableInput, setShowTableInput] = useState(true);
  const [tableSearchText, setTableSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [currentMatchTableIndex, setCurrentMatchTableIndex] = useState(-1);

   useEffect(() => {
      if (typeof apiData === "object" && apiData !== null) {
        // If apiData is an object and not null
        if (Array.isArray(apiData.rows)) {
        } else {
        }
      } else if (typeof apiData === "string") {
        // If apiData is a string
        // console.log("apiData is a string. Length:", apiData.length);
      } else {
        // console.log("apiData is of an unexpected type:", typeof apiData);
      }
    }, [apiData]);

  const isCsvFile = (fileName) => {
    // return fileName && fileName.toLowerCase().endsWith(".csv");
    // return fileName && (fileName.toLowerCase().endsWith(".csv") || fileName.toLowerCase().endsWith(".txt"));
    return (
      fileName &&
      (fileName.toLowerCase().endsWith(".csv") ||
        fileName.toLowerCase().endsWith(".txt") ||
        fileName.toLowerCase().endsWith(".xls") ||
        fileName.toLowerCase().endsWith(".xlsx") ||
        fileName.toLowerCase().endsWith(".prn"))
    );
  };
  const isExcelFile = (fileName) => {
    return (
      fileName &&
      (fileName.toLowerCase().endsWith(".xls") ||
        fileName.toLowerCase().endsWith(".xlsx"))
    );
  };

  // const headers = Object.keys(apiData[0]);
//   const headers =
//     Array.isArray(apiData) && apiData[0] && typeof apiData[0] === "object"
//       ? Object.keys(apiData[0])
//       : [];

// const headers =
//   safeApiData.length > 0 && typeof safeApiData[0] === "object"
//     ? Object.keys(safeApiData[0])
//     : [];

const columnKeys =
  safeApiData.length > 0 && typeof safeApiData[0] === "object"
    ? Object.keys(safeApiData[0])
    : [];

const headers = isHeaderAvailable
  ? columnKeys
  : columnKeys.map(() => "");

    console.log(headers);

//   const handleButtonClick = () => {
//     setSelectedFormat(selectedFormat === "tabular" ? "plain_text" : "tabular");
//     setShowInput(false); // Hide any active search input field when format is switched
//     setShowTableInput(false); // Hide table search input field when format is switched
//   };
const handleButtonClick = () => {
  const switchingToTabular = selectedFormat !== "tabular";

  if (switchingToTabular) {
    // Show loader immediately before changing the view
    setApiLoading(true);

    // Reset table state
    setCurrentTablePage(1);
    setCurrentMatchIndex(-1);
    setCurrentMatchTableIndex(-1);
    setMatchedIndexes([]);
    setSearchInputText("");
    setSearchTableInputText("");
  }

  setSelectedFormat(
    switchingToTabular ? "tabular" : "plain_text"
  );

  setShowInput(false);
  setShowTableInput(false);
};

useEffect(() => {
  if (
    selectedFormat === "tabular" &&
    Array.isArray(safeApiData) &&
    safeApiData.length > 0
  ) {
    setApiLoading(false);
  }
}, [selectedFormat, safeApiData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "f") {
        // inputRef.current.focus(); // Focus on the input field
        event.preventDefault(); // Prevent default browser search behavior
        setShowInput(true); // Show the input field when ctrl+f is pressed
        setShowTableInput(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClearInput = () => {
    setShowInput(false); // Hide the input field
    setShowReplaceInput(false);
    setReplaceText("");
    setShowTableInput(false); // Hide the table search input field
    setTableSearchText(""); // Clear table search input text
    setSearchInputText(""); // Clear plain text search input text
  };

  const countTotalHighlightedMatches = (data, searchText) => {
    if (!searchText || !searchText.trim() || !Array.isArray(data)) {
      // if (!searchText) {
      return 0;
    }

    let totalCount = 0;

    // Loop through each row in the data
    data.forEach((row) => {
      for (const key in row) {
        if (
          Object.prototype.hasOwnProperty.call(row, key) &&
          typeof row[key] === "string"
        ) {
          const regex = new RegExp(`(${searchText})`, "gi");
          const matches = row[key].match(regex);
          if (matches) {
            // Increment total count by the number of matches in the current row
            totalCount += matches.length;
          }
        }
      }
    });

    return totalCount;
  };

  const highlightText = (rowData, index, currentMatchIndex, matchedIndexes) => {
    // Check if the search input text exists
    if (!searchInputText) {
      return <div className="text-xs font-light  space-y-10">{rowData}</div>;
    }

    // Construct a regular expression to match the search input text
    const escapedSearchText = searchInputText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const regex = new RegExp(`(${escapedSearchText})`, "gi");

    // Use split method to divide the rowData into parts before and after each match
    const parts = rowData.split(regex);

    // Initialize an array to hold the highlighted parts
    const highlightedParts = [];

    // Initialize a counter to keep track of the current match index
    let matchIndex = 0;

    // Iterate over the parts array
    parts.forEach((part, i) => {
      // Check if the current part is a match
      const isMatch = i % 2 === 1;

      // If it's a match, create a JSX element with highlighting
      if (isMatch) {
        // Check if this match corresponds to the current match index
        const isCurrentMatch = matchIndex === currentMatchIndex;

        // Increment the match index counter
        matchIndex++;
        highlightedParts.push(
          <span
            key={`${index}-${i}`}
            data-index={matchIndex - 1}
            style={{
              backgroundColor: isCurrentMatch ? "orange" : "Yellow",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {part}
          </span>,
        );
      } else {
        // If it's not a match, simply push the part as-is
        highlightedParts.push(part);
      }
    });

    // Return the highlighted text as a single JSX element
    return (
      <div className="text-sm font-light space-y-10" key={index}>
        {highlightedParts}
      </div>
    );
  };

  const updateMatchIndex = (index) => {
    setCurrentMatchIndex(index);
  };

  const highlightNextMatch = (direction) => {
    if (matchedIndexes.length === 0) return; // No matches to highlight

    setCurrentMatchIndex((prevIndex) => {
      let nextIndex = prevIndex + direction;

      // Ensure nextIndex stays within bounds
      if (nextIndex < 0) {
        nextIndex = matchedIndexes.length - 1;
      } else if (nextIndex >= matchedIndexes.length) {
        nextIndex = 0;

        // Scroll to the top
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }

      return nextIndex;
    });

    // Scroll to the matched text
    if (containerRef.current) {
      const matchedElement = containerRef.current.querySelector(
        `[data-index="${currentMatchIndex}"]`,
      );
      if (matchedElement) {
        // Calculate the position of the matched element relative to the container
        const topOffset =
          matchedElement.offsetTop - containerRef.current.offsetTop;

        // Scroll the container to bring the matched text into view
        containerRef.current.scrollTo({
          top: topOffset,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    // Scroll to the matching row when currentMatchIndex changes
    scrollToMatchingRow(matchedIndexes[currentMatchIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatchIndex]);

  const scrollToMatchingRow = (index) => {
    setTimeout(() => {
      const element = document.getElementById(`row-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100); // Adjust the delay time as needed
  };

  // Effect to scroll to the corresponding matched row when currentMatchIndex changes
  useEffect(() => {
    if (currentMatchIndex !== -1 && matchedIndexes.length > 0) {
      scrollToMatchingRow(matchedIndexes[currentMatchIndex]);
    }
  }, [currentMatchIndex, matchedIndexes]);

  const findMatchingIndexes = (data, searchInputText) => {
    if (!searchInputText || typeof data !== "string") return [];

    const indexes = [];
    const matches = [];
    const searchRegex = new RegExp(searchInputText, "gi");

    let match;
    while ((match = searchRegex.exec(data)) !== null) {
      indexes.push(match.index);
      matches.push(match[0]);
    }
    setMatchedIndexes(indexes);
    return matches;
  };

//   useEffect(() => {
//     const matches = findMatchingIndexes(apiData, searchInputText);
//     if (matches.length > 0) {
//       setCurrentMatchTableIndex(0); // Start highlighting from the first match
//       // console.log("current1",currentMatchIndex)
//     } else {
//       setCurrentMatchTableIndex(-1); // No matches found
//       // console.log("current2",currentMatchIndex)
//     }
//   }, [apiData, searchInputText]);

//   useEffect(() => {}, [currentMatchIndex]);

//   useEffect(() => {
//     const indexes = findMatchingIndexes(apiData, searchInputText);
//     const matches = findMatchingIndexes(apiData, searchInputText);
//     setMatchedIndexes(indexes);
//   }, [apiData, searchInputText]);

//   useEffect(() => {}, [matchedIndexes]);

useEffect(() => {
  if (!searchInputText) {
    setMatchedIndexes([]);
    setCurrentMatchTableIndex(-1);
    return;
  }

  const indexes = [];

  safeApiData.forEach((row, rowIndex) => {
    const rowText = Object.values(row)
      .map((value) => String(value))
      .join(" ");

    if (
      rowText
        .toLowerCase()
        .includes(searchInputText.toLowerCase().trim())
    ) {
      indexes.push(rowIndex);
    }
  });

  setMatchedIndexes(indexes);

  if (indexes.length > 0) {
    setCurrentMatchTableIndex(0);
  } else {
    setCurrentMatchTableIndex(-1);
  }
}, [safeApiData, searchInputText]);

  const handleSearchInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchInputText(inputValue);
  };

  const handleKeyPress = (e, direction) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default behavior of the Enter key

      if (matchedIndexes.length === 0) return; // No matches to highlight

      setCurrentMatchIndex((prevIndex) => {
        let nextIndex = prevIndex + direction;

        // Ensure nextIndex stays within bounds
        if (nextIndex < 0) {
          nextIndex = matchedIndexes.length - 1;
        } else if (nextIndex >= matchedIndexes.length) {
          nextIndex = 0;

          // Scroll to the top
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }

        return nextIndex;
      });

      // Scroll to the matched text
      if (containerRef.current) {
        const matchedElement = containerRef.current.querySelector(
          `[data-index="${currentMatchIndex}"]`,
        );
        if (matchedElement) {
          // Calculate the position of the matched element relative to the container
          const topOffset =
            matchedElement.offsetTop - containerRef.current.offsetTop;

          // Scroll the container to bring the matched text into view
          containerRef.current.scrollTo({
            top: topOffset,
            behavior: "smooth",
          });
        }
      }
    }
  };

//   useEffect(() => {
//     const elements = document.querySelectorAll(".highlighted-text");
//     setMatchedElements(Array.from(elements));
//     // setCurrentMatchIndex(-1); // Reset currentMatchIndex when matched elements change
//   }, [apiData, searchTableInputText, currentMatchIndex, displayedRows]);

//   useEffect(() => {}, [searchTableInputText]);

//   useEffect(() => {}, [searchInputText]); // Log the current search input text when it changes

  useEffect(() => {
    setCurrentHighlightedIndex(-1);
  }, [searchTableInputText]);

  const totalRows = Math.ceil(safeApiData.length / rowsPerPage);

  const tableRef = useRef(null);

  // Calculate the index range for displayed rows
  const indexOfLastRow = currentTablePage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const rows = safeApiData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    // setCurrentMatchIndex(-1); // Reset match index on API data change
  }, [safeApiData]);

  useEffect(() => {
    setMatchedIndexes([]);
    // setCurrentMatchIndex(-1);
  }, [safeApiData]);

  const countHighlightedText = (data, searchText) => {
    let totalCount = 0;

    // Check if data is an array before attempting to iterate over it
    if (Array.isArray(data)) {
      data.forEach((row) => {
        Object.values(row).forEach((value) => {
          if (typeof value === "string") {
            const regex = new RegExp(`(${searchText})`, "gi");
            const matches = value.match(regex);
            if (matches) {
              totalCount += matches.length;
            }
          }
        });
      });
    }

    return totalCount;
  };

  const handletableNextPage = () => {
    const nextPage = currentTablePage + 1;
    setCurrentTablePage(nextPage);
    setPreviousTableButtonDisabled(false); // Enable previous button when moving to next page
    if (nextPage >= totalRows) {
      setNextTableButtonDisabled(true); // Disable next button on reaching the last page
    }
  };

  const handletablePrevPage = () => {
    const prevPage = currentTablePage - 1;
    setCurrentTablePage(prevPage);
    setNextTableButtonDisabled(false); // Enable next button when moving to previous page
    if (prevPage === 1) {
      setPreviousTableButtonDisabled(true); // Disable previous button when on the first page
    }
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentTablePage(1); // Reset to first page when changing rows per page
    setPreviousTableButtonDisabled(true); // Disable previous button on reset
    setNextTableButtonDisabled(false); // Enable next button on reset
  };

  const handlePageSizeChange = (pageSize) => {
    setRowsPerPage(pageSize);
    handleRowsPerPageChange(pageSize);
    setIstableDropdownOpen(false); // Close the dropdown after selecting an option
  };

  const findMatchingTableIndexes = (apiData, searchTableInputText) => {
    if (!searchTableInputText || typeof searchTableInputText !== "string")
      return [];

    const indexes = [];
    const matches = [];

    apiData.forEach((item, index) => {
      const rowData = Object.values(item).join(" ").toLowerCase(); // Combine all values in item for search
      if (rowData.includes(searchTableInputText.toLowerCase().trim())) {
        indexes.push(index);
        matches.push(item);
      }
    });

    return matches;
  };

  useEffect(() => {
    const matches = findMatchingTableIndexes(safeApiData, searchTableInputText);

    if (matches.length > 0) {
      setCurrentMatchIndex(0); // Start highlighting from the first match
      setMatchedIndexes(matches); // Update matchedIndexes
    } else {
      setCurrentMatchIndex(-1); // No matches found
      setMatchedIndexes([]); // Clear matchedIndexes
    }
    // eslint-disable-next-line
  }, [safeApiData, searchTableInputText]);

  useEffect(() => {
    // console.log("currentMatchIndex:", currentMatchIndex);
    // console.log("matchedIndexes", matchedIndexes);
  }, [currentMatchIndex, matchedIndexes]);

  const handleSwitchChange = async () => {
    setMaskedData((prevMaskedData) => !prevMaskedData);
  };

  

  useEffect(() => {}, [maskedData]);

  useEffect(() => {
    if (itemOffset > totalRows) {
      setItemOffset(totalRows);
    }
  }, [totalRows, itemOffset]);

  const getPageNumbers = () => {
    const totalpages = "";
    const maxPageNumbers = 5;
    let startPage = 1;
    let endPage = Math.min(totalpages, maxPageNumbers);

    if (currentTablePage > 3) {
      startPage = currentTablePage - 2;
      endPage = Math.min(currentTablePage + 2, totalpages);

      if (endPage - startPage < maxPageNumbers - 1) {
        startPage = Math.max(endPage - maxPageNumbers + 1, 1);
      }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const selectOption = (value) => {
    handleRowsPerPageChange(value);
    setIsOpenRows(false); // Close the dropdown after selecting an option
  };

  const handleCheckboxChange = async () => {
    const updatedValue = !isDownloadStorageState;

    // Optimistically update UI
    setIsDownloadStorageState(updatedValue);

    try {
      // 1. Find current storage account object to preserve existing account_key

      const payload = {
        storage_account: [
          {
            id: selectedStorageAccountId,
            account_name: selectedStorageAccount,
            // 👈 Pass existing key if present; do NOT hardcode ""
            account_key: selectedAccountKey || undefined,
            is_download_storage: updatedValue,
          },
        ],
      };

      const response = await apiRequest(
        `${API_URL}/api/admin/update-storage-accounts/`,
        "POST",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        },
      );

      if (response && response.data && response.data.length > 0) {
        setIsDownloadStorageState(
          Boolean(response.data[0].is_download_storage),
        );
      }
    } catch (error) {
      console.error("Failed to update download storage state:", error);
      setIsDownloadStorageState(!updatedValue); // Revert on failure
      alert("Failed to update storage settings. Please try again.");
    }
  };
  const handleDownload = async () => {
    const blobName = selectedFiles[0];
    try {
      const requestBody = {
        blob_name: blobName,
        is_masked: maskedData,
      };
      if (containerData) {
        requestBody.container_id = containerData;
      } else if (fileShareId) {
        requestBody.file_share_id = fileShareId;
      } else {
        // Handle the case where neither containerData nor fileShareId is available
        console.error("Neither containerData nor fileShareId is available.");
        return;
      }

      const responsemsg = await secureApiCall(
        `${API_URL}/api/blob/download_blob/`,
        "POST",
        requestBody,
      );

      setError("Download has been moved to My Task");
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error downloading blob:", error);
      if (error.message) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div
      className="w-[65vw] h-[80vh] flex flex-col px-6 z-1000"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* {selectedFormat === "tabular" ? (
        // <div className="w-full h-full flex flex-col">
        <pre>
          <TabularPreviewData
            isLoading={apiLoading}
            setIsLoading={setApiLoading}
            data={safeApiData}
            // apiData={rows}
            safeApiData={safeApiData}
            apiData={apiData}
            //   handlePageClick={handlePageClick}
            handleDownload={handleDownload}
            //   closePreviewModal={closePreviewModal}
            handleSwitchChange={handleSwitchChange}
            maskedData={maskedData}
            isMasked={isMasked}
            selectedFiles={selectedFiles[0]}
            canSeeRealData={canSeeRealData}
            pageNumbers={pageNumbers}
            handletablePrevPage={handletablePrevPage}
            handletableNextPage={handletableNextPage}
            handleRowsPerPageChange={handleRowsPerPageChange}
            handleCheckboxChange={handleCheckboxChange}
            isDownloadStorageState={isDownloadStorageState}
            selectedStorageAccount={selectedStorageAccount}
            apiLoading={apiLoading}
          />
          </pre>
        // </div> */}
        {selectedFormat === "tabular" ? (
  <div className="w-full h-full flex flex-col">
    
      <TabularPreviewData
        isLoading={apiLoading}
        setIsLoading={setApiLoading}
        data={safeApiData}
        safeApiData={safeApiData}
        apiData={apiData}
        handleDownload={handleDownload}
        handleSwitchChange={handleSwitchChange}
        maskedData={maskedData}
        isMasked={isMasked}
        selectedFiles={selectedFiles[0]}
        canSeeRealData={canSeeRealData}
        pageNumbers={pageNumbers}
        handletablePrevPage={handletablePrevPage}
        handletableNextPage={handletableNextPage}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handleCheckboxChange={handleCheckboxChange}
        isDownloadStorageState={isDownloadStorageState}
        selectedStorageAccount={selectedStorageAccount}
        apiLoading={apiLoading}
          headers={headers}
  columnKeys={columnKeys}
  isHeaderAvailable={isHeaderAvailable}
      />
    
      </div>
      ) : (
        <div className="w-[60vw] h-[78vh] flex flex-col items-center mt-1 px-3 ">
          {/* Header Action Menu strip */}
          <div className="w-[60vw] h-[10vh] flex flex-row gap-4 px-2 items-center ">
            <div className="flex flex-row bg-white justify-between items-center w-72 h-9 rounded shadow-md shadow-slate-500/30 px-3">
              <input
                type="text"
                value={searchInputText}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => handleKeyPress(e, 1)}
                autoComplete="off"
                autoFocus="cursor"
                className="border border-none outline-none text-black"
              />
              <img
                src={process.env.PUBLIC_URL + "/search_icon.png"}
                alt="search"
                style={{
                  width: "18px",
                  height: "18px",
                  outline: "none",
                }}
              />
            </div>
            <div className="h-8 w-14 flex flex-row justify-between items-center px-1">
              <button
                className={`rounded-lg cursor-pointer font-bold text-sm mt-1`}
                onClick={() => highlightNextMatch(-1)}
              >
                <img
                  src={process.env.PUBLIC_URL + "/less-than.png"}
                  alt="Closed Folder"
                  className="w-3 h-3 font-poppins"
                />
              </button>

              <button
                className={`rounded-lg cursor-pointer font-bold mt-1 text-sm`}
                onClick={() => highlightNextMatch(1)}
              >
                <img
                  src={process.env.PUBLIC_URL + "/more-than.png"}
                  alt="Closed Folder"
                  className="w-3 h-3"
                />
              </button>
            </div>

            {canSeeRealData && (
              <div className="h-8 w-56 flex flex-row gap-3 items-center ml-2">
                <label className="text-[12px] font-poppins font-medium text-black">
                  Masked Data ?
                </label>
                <div className="relative inline-block w-[32px] h-[20px] rounded-full cursor-pointer">
                  <img
                    src={
                      maskedData
                        ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
                        : process.env.PUBLIC_URL + "/noswitch-icon.png"
                    }
                    alt={maskedData ? "Yes" : "No"}
                    onClick={handleSwitchChange}
                    style={{
                      width: "70px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex-grow"></div>
            <button
              className="w-28 h-8 flex flex-row ml-4 px-4 rounded-md cursor-pointer justify-center
                       items-center font-medium text-[13px] bg-purpleshade1 text-white"
              onClick={handleDownload}
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
            <div className="w-1/2 flex  ">
              {selectedFiles[0] && selectedFiles[0].split(/[\\/]/).pop()}
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

                <div className="">{selectedStorageAccount || "Loading..."}</div>
              </div>
            )}
          </div>

          {/* Flat Plain CSV View Text Area */}
          <div className="w-[60vw] h-[75vh] flex justify-center border border-lightgray-300 rounded-md shadow-md shadow-slate-500/30 bg-white">
            {apiLoading ? (
              <div className="w-full h-full flex flex-col justify-center items-center">
                <img
                  src={process.env.PUBLIC_URL + "/loadergif.gif"}
                  alt="loader"
                  className="animate-spin w-6 h-6 items-center"
                />
                {/* <p className="text-logintext font-[350] text-[13px] animate-pulse">
                            Just a moment...
                          </p> */}
              </div>
            ) : (
              <div
                className="w-[59vw] h-[68vh] cursor-not-allowed  overflow-auto font-poppins text-black p-4 select-text text-xs leading-normal whitespace-pre tracking-normal"
                ref={containerRef}
                style={{ scrollbarWidth: "thin" }}
              >
                {/* Header Row String without lowercasing or lines */}
                {/* <div className="font-medium text-[12px] text-gray-900 pb-1">
                      {highlightText(tableHeaders.join(","))}
                    </div> */}

                {/* Data Rows */}
                 {/* {typeof apiData === "string" ? (
    highlightText(
      apiData,
      0,
      currentMatchIndex,
      matchedIndexes
    )
  ) : (
    JSON.stringify(safeApiData, null, 2)
  )} */}
  {typeof apiData === "string" && apiData
  ? highlightText(
      apiData,
      0,
      currentMatchIndex,
      matchedIndexes
    )
  : null}
                {/* {Array.isArray(safeApiData) ? (
                  safeApiData.map((item, index) => (
                    <div
                      key={`item-${index}`}
                      className="mb-5 border-b border-primary text-black "
                      style={{ userSelect: "none" }}
                    >
                      {Array.isArray(item)
                        ? item.map((rowData, subIndex) => (
                            <div key={`subrow-${subIndex}`}>
                              {typeof rowData === "object"
                                ? JSON.stringify(rowData)
                                : highlightText(
                                    rowData,
                                    subIndex,
                                    currentMatchIndex,
                                    matchedIndexes,
                                  )}
                            </div>
                          ))
                        : typeof item === "string"
                          ? highlightText(
                              item,
                              index,
                              currentMatchIndex,
                              matchedIndexes,
                            )
                          : Object.values(item).map((value, subIndex) => (
                              <div
                                key={`value-${subIndex}`}
                                className="border-b border-primary"
                              >
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : highlightText(
                                      value,
                                      subIndex,
                                      currentMatchIndex,
                                      matchedIndexes,
                                    )}
                              </div>
                            ))}
                    </div>
                  ))
                ) : (
                  <div>
                    {typeof safeApiData === "object"
                      ? JSON.stringify(safeApiData)
                      : highlightText(
                          safeApiData,
                          0,
                          currentMatchIndex,
                          matchedIndexes,
                        )}
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
      )}

      {isCsvFile(selectedFiles[0]) && (
        <div className="w-[60vw] h-14 flex flex-row items-center justify-between mt-4 px-2 ">
          <div className="w-32 h-8 flex items-center justify-center flex-shrink-0">
            <button
              className="w-32 h-8 flex flex-row font-poppins  px-4 rounded-md cursor-pointer justify-center items-center
                       font-medium text-[13px] bg-purpleshade1 text-white"
              onClick={handleButtonClick}
            >
              {selectedFormat === "tabular" ? "Plain Text" : "Preview"}
            </button>
          </div>

          {/* Right Side: Empty space keeper 
          Maintains the exact same structural row footprint so the flexbox centerline never jumps.
        */}
          <div className="h-8 w-1 flex-shrink-0" aria-hidden="true" />
        </div>
      )}
      {/* <ErrorPopup
            isOpen={isPopupOpen}
            message={s3Error}
            onClose={() => setIsPopupOpen(false)}
          /> */}
    </div>
  );
};

export default FilePreviewDataModal;
