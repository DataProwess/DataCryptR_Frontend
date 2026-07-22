import React, { useState, useEffect, useRef, useCallback } from "react";
import { Resizable } from "react-resizable";

const FullScreenPreview = ({
  apiData,
  data,
  localColumnWidths,
  handleColumnWidthChange,
  // searchTableInputText,
  handleDownload,
  handleSwitchChange,
  maskedData,
  selectedFiles,
  canSeeRealData,
  width,
  height,
  isLoading,

}) => {
  // Ensure apiData is always an array and handle different data formats
  const processApiData = (data) => {
    if (!data) return [];

    // If it's already an array of objects, return as is
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      return data;
    }

    // If it's a string (CSV-like data), try to parse it
    if (typeof data === 'string') {
      const lines = data.trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        return rows;
      }
    }

    // If it's an array of strings (CSV-like), parse it
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      const lines = data;
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        return rows;
      }
    }

    return [];
  };

  const safeApiData = processApiData(apiData);
  console.log("Original apiData:", apiData);
  console.log("Processed safeApiData:", safeApiData);
  console.log("safeApiData[0]", safeApiData[0]);

  // Define columns to exclude from display
  const excludedColumns = [
    "0",           // Numeric key
    "__extra__",   // System extra column
    "__id__",      // System ID column
    "__index__",   // System index column
    "__row__",     // System row column
  ];

  // Get column headers in consistent order
  const columnHeaders = safeApiData.length > 0
    ? Object.keys(safeApiData[0]).filter((key) => {
      // Filter out system/internal columns
      return !excludedColumns.includes(key) &&
        !key.startsWith("__") &&
        !key.startsWith("_");
    })
    : [];

  if (safeApiData.length > 0) {
    console.log("All available columns:", Object.keys(safeApiData[0]));
    console.log("Filtered column headers:", columnHeaders);
    console.log("First row data:", safeApiData[0]);
    console.log("Column alignment check:");
    columnHeaders.forEach((header, index) => {
      console.log(`Column ${index}: "${header}" = "${safeApiData[0][header]}"`);
    });
  }
 
  
  const [totalPages, setTotalPages] = useState(0);
  const [currentRows, setCurrentRows] = useState([]);
  // eslint-disable-next-line
  const containerRef = useRef(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [isOpenRows, setIsOpenRows] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  // const [currentRows, setCurrentRows] = useState([]);
  // eslint-disable-next-line
  const [showTableInput, setShowTableInput] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line
  const [tableSearchText, setTableSearchText] = useState("");
  // const [searchInputText, setSearchInputText] = useState(''); // Define searchInputText state
  const tableRef = useRef(null);
  const [rows, setRows] = useState([]);
 // eslint-disable-next-line
  const isTabularFormat = Array.isArray(apiData);
  // eslint-disable-next-line
  const [highlightedTextCount, setHighlightedTextCount] = useState(0);
  // eslint-disable-next-line
  const [highlightedElements, setHighlightedElements] = useState([]);
  // eslint-disable-next-line
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  // eslint-disable-next-line
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  // const [searchTableInputText, setSearchTableInputText] = useState("");
  const [searchTableInputText, setSearchTableInputText] = useState("");
  // eslint-disable-next-line
  const rowdata = Array.isArray(apiData) ? apiData : [];
  // eslint-disable-next-line
  const [totalRows, setTotalRows] = useState(0);
 

  useEffect(() => {
    const pages = Math.ceil(safeApiData.length / rowsPerPage);
    setTotalPages(pages);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, safeApiData.length);
    setCurrentRows(safeApiData.slice(startIndex, endIndex));
    console.log("rows", currentRows);
    // eslint-disable-next-line
  }, [safeApiData, currentPage, rowsPerPage]);

  const handleTableSearchInputChange = (event) => {
    const searchText = event.target.value.trim().toLowerCase();
    setSearchTableInputText(searchText);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "f") {
       
        event.preventDefault(); 

        setShowTableInput(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // eslint-disable-next-line
  const handletableClearInput = () => {
    console.log("gg");
    setShowTableInput(false); // Hide the table search input field
    setTableSearchText(""); // Clear table search input text
    // setSearchTableInputText("");
  };

  const findMatchingTableIndexes = useCallback((searchText) => {
    if (!searchTableInputText || typeof searchTableInputText !== "string")
      return [];

    const indexes = [];
    const matches = [];

    safeApiData.forEach((item, index) => {
      const rowData = Object.values(item).join(" ").toLowerCase(); // Combine all values in item for search
      if (rowData.includes(searchTableInputText.toLowerCase().trim())) {
        indexes.push(index);
        matches.push(item);
      }
    });

    console.log("indexes:", indexes);
    console.log("matches:", matches);

    return matches;
    // eslint-disable-next-line
  }, [safeApiData, searchTableInputText]);

  useEffect(() => {
    const matches = findMatchingTableIndexes(searchTableInputText);
    console.log("matches", matches.length);
    if (matches.length > 0) {
      setCurrentMatchIndex(0); // Start highlighting from the first match
      setMatchedIndexes(matches); // Update matchedIndexes
    } else {
      setCurrentMatchIndex(-1); // No matches found
      setMatchedIndexes([]); // Clear matchedIndexes
    }
    // eslint-disable-next-line
  }, [safeApiData, searchTableInputText, findMatchingTableIndexes]);

  useEffect(() => {
    console.log("currentMatchIndex:", currentMatchIndex);
    console.log("matchedIndexes", matchedIndexes);
  }, [currentMatchIndex, matchedIndexes]);

  const highlightTableNextMatch = useCallback(
    (direction) => {
      console.log("dir", direction);
      if (matchedIndexes.length === 0) return; // No matches to highlight

      setCurrentMatchIndex((prevIndex) => {
        let nextIndex = prevIndex + direction;
        if (nextIndex < 0) {
          nextIndex = matchedIndexes.length - 1;
        } else if (nextIndex >= matchedIndexes.length) {
          nextIndex = 0;
        }

        return nextIndex;
      });

      // Scroll to the matched text
      if (tableRef.current) {
        const matchedElement = tableRef.current.querySelector(
          `[data-index="${currentMatchIndex}"]`
        );
        if (matchedElement) {
          matchedElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }
    },
    [matchedIndexes, currentMatchIndex]
  );

  useEffect(() => {
    setColumnWidths(localColumnWidths || {});
  }, [localColumnWidths]);

  const handleColumnResize = (column, newWidth) => {
    newWidth = Math.max(newWidth, 32);
    const updatedColumnWidths = { ...columnWidths, [column.field]: newWidth };
    setColumnWidths(updatedColumnWidths);

    if (handleColumnWidthChange) {
      handleColumnWidthChange(column.field, newWidth);
    }
  };

  const handleColumnResizeStart = (column, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setResizingColumn({ ...column, left: rect.left });
  };

  const handleColumnResizeStop = () => {
    setResizingColumn(null);
  };

  const handleMouseMove = (e) => {
    if (resizingColumn) {
      const mouseX = e.clientX;
      const newWidth = mouseX - resizingColumn.left;
      handleColumnResize(resizingColumn, newWidth);
    }
  };

  const handleMouseUp = () => {
    if (resizingColumn) {
      handleColumnResizeStop();
    }
  };

// eslint-disable-next-line
  let matchIndex = -1; // Initialize matchIndex outside of the function


  // const highlightText = (text, searchTableInputText, currentMatchIndex) => {
  //   if (text == null) {
  //     return null; // Return null if text is null or undefined
  //   }

  //   if (!searchTableInputText) {
  //     return text; // Return the cell value as it is if there's no search input
  //   }

  //   const escapedSearchText = searchTableInputText.replace(
  //     /[.*+?^${}()|[\]\\]/g,
  //     "\\$&"
  //   );
  //   const regex = new RegExp(`(${escapedSearchText})`, "gi");
  //   const parts = text.split(regex);

  //   let matchIndex = -1; // Initialize matchIndex outside forEach loop

  //   return (
  //     <>
  //       {parts.map((part, index) => {
  //         const isMatch = index % 2 === 1;
  //         if (isMatch) {
  //           matchIndex++;
  //         }
  //         {
  //           console.log("matchedIndex", matchIndex);
  //         }
  //         const isCurrentMatch = matchIndex === currentMatchIndex;

  //         return isMatch ? (
  //           <span
  //             key={index}
  //             style={{
  //               backgroundColor: isCurrentMatch ? "orange" : "yellow",
  //               fontWeight: "500",
  //               cursor: "pointer",
  //             }}
  //           >
  //             {part}
  //           </span>
  //         ) : (
  //           part
  //         );
  //       })}
  //     </>
  //   );
  // };

  const highlightText = (text, searchTableInputText, currentMatchIndex) => {
    // Ensure text is a string
    const stringText = typeof text === 'string' ? text : String(text);
  
    if (stringText == null) {
      return null; // Return null if text is null or undefined
    }
  
    if (!searchTableInputText) {
      return stringText; // Return the cell value as it is if there's no search input
    }
  
    const escapedSearchText = searchTableInputText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(`(${escapedSearchText})`, "gi");
    const parts = stringText.split(regex);
  
    let matchIndex = -1; // Initialize matchIndex outside forEach loop
  
    return (
      <>
        {parts.map((part, index) => {
          const isMatch = index % 2 === 1;
          if (isMatch) {
            matchIndex++;
          }
          console.log("matchedIndex", matchIndex);
          const isCurrentMatch = matchIndex === currentMatchIndex;
  
          return isMatch ? (
            <span
              key={index}
              style={{
                backgroundColor: isCurrentMatch ? "orange" : "yellow",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {part}
            </span>
          ) : (
            part
          );
        })}
      </>
    );
  };
  

 

  useEffect(() => {
    const elements = document.querySelectorAll(".highlighted-text");
    setHighlightedElements(Array.from(elements));
  }, [apiData]);

  // eslint-disable-next-line
  const handleKeyPress = (e, direction) => {
    console.log("dire", direction);
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
          `[data-index="${currentMatchIndex}"]`
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
  // eslint-disable-next-line

  useEffect(() => {
    // Calculate total count of highlighted text
    let totalCount = 0;
    if (apiData && Array.isArray(apiData)) {
      apiData.forEach((row) => {
        Object.values(row).forEach((value) => {
          if (
            typeof value === "string" &&
            value.trim() &&
            searchTableInputText.trim()
          ) {
            const regex = new RegExp(`(${searchTableInputText})`, "gi");
            const matches = value.match(regex);
            if (matches) {
              totalCount += matches.length;
            }
          }
        });
      });
    }
    setHighlightedTextCount(totalCount);
  }, [apiData, searchTableInputText]);

  const handleNextButtonClick = () => {
    highlightTableNextMatch(1);
  };

  // Add this function to handle the previous button click
  const handlePreviousButtonClick = () => {
    highlightTableNextMatch(-1);
  };

  const selectOption = (value) => {
    handleRowsPerPageChange(value);
    setIsOpenRows(false); // Close the dropdown after selecting an option
  };
  const indexOfLastRow = currentTablePage * rowsPerPage;
  // eslint-disable-next-line
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // const displayedRows = apiData.slice(indexOfFirstRow, indexOfLastRow); // Slice the rows based on pagination
  const displayedRows = rows.slice(
    (currentTablePage - 1) * rowsPerPage,
    currentTablePage * rowsPerPage
  );
  console.log("rows", displayedRows);
  // rows = apiData.slice(0, rowsPerPage);
  console.log("rows", rows);

  useEffect(() => {
    if (typeof apiData === "object") {
      const calculatedTotalRows = Math.ceil(apiData.length / rowsPerPage);
      console.log("totalrows", calculatedTotalRows);

      setTotalRows(calculatedTotalRows);
      console.log("totalRows", calculatedTotalRows);
    }
    // eslint-disable-next-line
  }, [apiData]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  // console.log("start", startIndex);
  // eslint-disable-next-line
  const endIndex = startIndex + rowsPerPage;
  // console.log("end", endIndex);


  useEffect(() => {
    // Calculate the total number of pages
    const pages = Math.ceil(safeApiData.length / rowsPerPage);
    setTotalPages(pages);

    // Calculate the current rows to display
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, safeApiData.length);
    setCurrentRows(safeApiData.slice(startIndex, endIndex));
    console.log("data", currentRows);
    // eslint-disable-next-line
  }, [safeApiData, currentPage, rowsPerPage]);

  // eslint-disable-next-line
  const handlePreviousButton = () => {
    console.log("clicked");
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // eslint-disable-next-line
  const handleNextButton = () => {
    // alert('Next button clicked');
    console.log("clicked");
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

 

  useEffect(() => {
    // Reset to first page when rowsPerPage changes
    setCurrentTablePage(1);
  }, [rowsPerPage]);

  // const handleRowsPerPageChange = (value) => {
  //   setRowsPerPage(value);
  //   setIsOpenRows(false); // Close the dropdown after selecting an option
  // };
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Reset currentPage to 1 whenever rowsPerPage changes
    setIsOpenRows(false); // Close the dropdown after selecting an option
  };
 

  useEffect(() => {
    // Ensure `safeApiData` is an array
    setRows(safeApiData);
    setTotalRows(Math.ceil(safeApiData.length / rowsPerPage));
  }, [safeApiData, rowsPerPage]);
  const perviewWidth = (width * 0.64).toFixed(2);
  const previewHeight = (height * 0.8).toFixed(2);
  const plainContainerWidth = (perviewWidth * 0.96).toFixed(2);
  const plainContainerHeight = (previewHeight * 0.88).toFixed(2);
  const plainDataWidth = (plainContainerWidth * 0.98).toFixed(2);
  const plainDataHeight = (plainContainerHeight * 0.83).toFixed(2);

  const toggleRowsDropdown = () => setIsOpenRows(!isOpenRows);

  // const handletableNextPage = () => {
  //   const nextPage = currentTablePage + 1;
  //   setCurrentTablePage(nextPage);
  //   setPreviousTableButtonDisabled(false); // Enable previous button when moving to next page
  //   if (nextPage >= totalRows) {
  //     setNextTableButtonDisabled(true); // Disable next button on reaching the last page
  //   }
  // };

  // const handletablePrevPage = () => {
  //   const prevPage = currentTablePage - 1;
  //   setCurrentTablePage(prevPage);
  //   setNextTableButtonDisabled(false); // Enable next button when moving to previous page
  //   if (prevPage === 1) {
  //     setPreviousTableButtonDisabled(true); // Disable previous button when on the first page
  //   }
  // };

  useEffect(() => {
    // Calculate the total number of pages
    const pages = Math.ceil(safeApiData.length / rowsPerPage);
    setTotalPages(pages);

    // Calculate the current rows to display
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, safeApiData.length);
    setCurrentRows(safeApiData.slice(startIndex, endIndex));
  }, [safeApiData, currentPage, rowsPerPage]);
  
  const handletablePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  
  const handletableNextPage = () => {
    console.log("clicked")
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div
      className="flex  flex-col items-center mt-1 px-3"
      style={{
        width: `${plainContainerWidth}px`,
        height: `${plainContainerHeight}px`,
      }}
    >
      <div
        className=" flex flex-row space-x-2 px-2"
        style={{
          width: `${plainContainerWidth}px`,
          height: `${(plainContainerHeight * 0.1).toFixed(2)}px`,
        }}
      >
        <div className="flex flex-row bg-white justify-between items-center w-72 h-9 rounded shadow-md px-3">
          <input
            // id="tableinputId"

            value={searchTableInputText}
            onChange={handleTableSearchInputChange}
            onKeyDown={(e) => handleKeyPress(e, 1)}
            autoComplete="off"
            autoFocus="cursor"
            className="border border-none  outline-none font-poppins"
          />
          <img
            src={process.env.PUBLIC_URL + "/search_icon.png"}
            alt="search"
            style={{ width: "18px", height: "18px", outline: "none" }}
          />
        </div>
        <div className="h-8 w-10 flex flex-row justify-between items-center">
          <button
            className={`w-5 h-4  rounded-lg  cursor-pointer font-bold text-sm mt-1 `}
            onClick={handlePreviousButtonClick}
          >
            <img
              src={process.env.PUBLIC_URL + "/less-than.png"}
              alt="Closed Folder"
              className="w-3 h-3"
            />
            {/* Previous */}
          </button>

          <button
            className={`w-5 h-4  rounded-lg  cursor-pointer font-bold mt-1 text-sm `}
            onClick={handleNextButtonClick}
          >
            {/* Next */}
            <img
              src={process.env.PUBLIC_URL + "/more-than.png"}
              alt="Closed Folder"
              className="w-3 h-3"
            />
          </button>
        </div>
        {canSeeRealData && (
          <div className=" h-8 w-36 flex flex-row justify-between items-center space-x-5">
            <label className="text-[12px] font-medium font-poppins text-black">
              Masked Data ?
            </label>
            <div className="relative  inline-block w-[32px] h-[20px] rounded-full cursor-pointer">
              <img
                src={
                  maskedData
                    ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
                    : process.env.PUBLIC_URL + "/noswitch-icon.png"
                }
                alt={maskedData ? "Yes" : "No"}
                onClick={handleSwitchChange}
                style={{ width: "70px", height: "16px", cursor: "pointer" }}
              />
            </div>
          </div>
        )}
        <div className="flex-grow"></div>
        <button
          className="w-28 h-8 flex flex-row font-poppins ml-4 px-4 rounded-md cursor-pointer justify-center items-center
                       font-medium text-[13px] bg-purpleshade1 text-white"
          onClick={handleDownload}
        >
          Download
        </button>
        {/* Blue div content here */}
      </div>
      <div
        className="flex flex-row mt-3 font-poppins px-5 text-black text-xs font-medium"
        style={{
          width: `${plainContainerWidth}px`,
          height: `${(plainContainerHeight * 0.05).toFixed(2)}px`,
        }}
      >
        {/* {selectedFiles} */}
        {selectedFiles && selectedFiles.split(/[\\/]/).pop()}
      </div>
      <div
        className="bg-white flex justify-center mt-3 border border-lightgray-300 border-t-0 rounded-md shadow-md shadow-slate-500/30"
        style={{ width: `${plainDataWidth}px`, height: `${plainDataHeight}px` }}
      >
        {isLoading ? (
          <div className=" flex flex-col justify-center items-center"
          style={{
            width: `${plainDataWidth}px`,
            height: `${(plainDataHeight * 0.99).toFixed(2)}px`,
            scrollbarWidth: "thin",
            caretColor: "red",
            userSelect: "none",
          }}>
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
          <pre
            className=" overflow-x-auto overflow-y-auto relative  font-poppins  
                 select-text cursor-not-allowed   flex flex-col  space-y-5 text-black "
            ref={containerRef}
            style={{
              width: `${plainDataWidth}px`,
              height: `${(plainDataHeight * 0.99).toFixed(2)}px`,
              scrollbarWidth: "thin",
              caretColor: "red",
              userSelect: "none",
            }}
          >
              {safeApiData.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <p className="text-gray-500 text-sm">No data available to display</p>
                  <p className="text-gray-400 text-xs mt-2">Data format: {typeof apiData}</p>
                </div>
              ) : (
                  <table
                    className="table-design1 w-full rounded-tl-xl rounded-tr-xl "
                    ref={tableRef}
                    // ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <thead className="bg-purpleshade1 sticky -top-1  h-10 font-light text-sm rounded-tl-xl rounded-tr-xl">
                      <tr className="h-6 font-light text-sm  font-poppins w-32 rounded-e-md text-white rounded-tl-xl rounded-tr-xl">
                        {columnHeaders.map((key) => (
                          <ResizableHeader
                            key={key}
                            column={{
                              field: key,
                              headerName: key,
                              width: columnWidths[key] || 100, // Default width if not specified
                            }}
                            handleResizeStart={handleColumnResizeStart}
                            handleResizeStop={handleColumnResizeStop}
                            handleResize={handleColumnResize}
                            highlightText={highlightText}
                            searchTableInputText={searchTableInputText}
                          />
                        ))}
                      </tr>
                    </thead>

              <tbody>
                {isLoading ? (
                  <div className="w-full h-full flex-col flex justify-center items-center">
                    <img
                      src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                      alt="Loading..."
                      className="animate-spin w-6 h-6 mt-32"
                    />
                    <p className="text-logintext text-[13px]  animate-pulse">
                      Just a moment...
                    </p>
                  </div>
                ) : (
                          Array.isArray(currentRows) &&
                          currentRows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="font-poppins font-light text-[11px]"
                            >
                              {columnHeaders.map((key) => (
                                <ResizableCell
                                  key={key}
                                  width={columnWidths[key] || 200}
                                  cellValue={row[key] || ''}
                                  columnField={key}
                                  highlightedText={highlightText(
                             row[key] || '',
                             searchTableInputText,
                             currentMatchIndex
                           )}
                                />
                              ))}
                            </tr>
                          ))
                )}
              </tbody>
            </table>
              )}
          </pre>
        )}
      </div>

      <div className="h-6 w-[98%] font-poppins flex items-center text-xs justify-end space-x-4 mt-5 mr-3 ">
           
           <button onClick={handletablePrevPage} disabled={currentPage === 1}>
             &lt; 
           </button>
           <span className="font-light text-xs">Page {currentPage} of {totalPages}</span>
           <button onClick={handletableNextPage} disabled={currentPage === totalPages}>
              &gt;
           </button>
               
                         <div className="relative inline-block">
                     <button
                       // id="pageSizeDropdownButton"
                       onClick={toggleRowsDropdown}
                       className="  text-black  font-light rounded-lg text-xs font-poppins px-3 py-1 bg-gray
                      text-center inline-flex items-center "
                       type="button">
                       No.of Rows: {rowsPerPage} 
                       <svg
                         className={`w-2.5 h-2 ms-3 ${
                           isOpenRows ? "rotate-180" : ""
                         }`}
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
   
         {/* {isOpenRows && (
           <div className="absolute mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
             <div className="py-1">
               <button
                 onClick={() => selectOption(20)}
                 className="block w-full text-left px-4 py-2 text-sm hover:bg-primary"
               >
                 20
               </button>
               <button
                 onClick={() => selectOption(50)}
                 className="block w-full text-left px-4 py-2 text-sm hover:bg-primary"
               >
                 50
               </button>
               <button
                 onClick={() => selectOption(100)}
                 className="block w-full text-left px-4 py-2 text-sm hover:bg-primary"
               >
                 100
               </button>
             </div>
           </div>
          )}  */}
          <div
                       className={`z-10 ${
                         isOpenRows ? "" : "hidden"
                       }  bg-background-100 border border-primary font-poppins divide-y divide-secondary rounded-lg shadow w-32
                      dark:bg-primary absolute bottom-full mt-1`}
                     >
                       <ul
                         className="py-1 text-xs font-normal text-black dark:text-gray-200"
                         aria-labelledby="pageSizeDropdownButton"
                       >
                         <li>
                           <button
                             type="button"
                             onClick={() => selectOption(20)}
                              className="block px-2  text-start w-full hover:bg-primary dark:hover:bg-gray-600 dark:hover:text-white"
                           >
                             20
                           </button>
                         </li>
                         <li>
                           <button
                             type="button"
                             onClick={() => selectOption(50)}
                              className="block px-2  text-start w-full hover:bg-primary dark:hover:bg-gray-600 dark:hover:text-white"
                           >
                             50
                           </button>
                         </li>
                         <li>
                           <button
                             type="button"
                             onClick={() => selectOption(100)}
                             className="block px-2 text-start w-full hover:bg-primary dark:hover:bg-gray-600 dark:hover:text-white"
                           >
                             100
                           </button>
                         </li>
                         
                       </ul>
                     </div>
       
             </div>
             </div>
      
    </div>
  );
};
const ResizableHeader = ({
  column,
  handleResizeStart,
  handleResize,
  handleResizeStop,
  highlightText,
  searchTableInputText,
}) => (
  <th
    className="cursor-col-resize "
    onMouseDown={(e) => handleResizeStart(column, e)}
  >
    <Resizable
      width={column.width || 150}
      height={0}
      axis="x"
      onResizeStart={(e) => e.stopPropagation()}
      onResize={(e, { size }) => handleResize(column, size.width)}
      onResizeStop={handleResizeStop}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <div className="text-left px-2 font-poppins font-normal text-xs">
        {/* {highlightText(column.headerName, searchTableInputText)} */}
        {/* {highlightText(column.headerName).highlightedText} */}
        {column.headerName}
      </div>
    </Resizable>
  </th>
);

const ResizableCell = ({ width, cellValue, children, highlightedText }) => (
  <td className="text-center w-6 whitespace-nowrap overflow-hidden overflow-ellipsis font-light text-xs px-2 py-1.5 ">
    <div
      className="text-left whitespace-nowrap overflow-hidden overflow-ellipsis px-2"
      style={{ width }}
    >
      {/* { cellValue}  */}
      {highlightedText}
      {/* {highlightedText.highlightedText} */}
    </div>
  </td>
);

export default FullScreenPreview;

