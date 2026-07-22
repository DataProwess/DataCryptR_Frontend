import React, { useState, useEffect, useRef, useCallback } from "react";
import { Resizable } from "react-resizable";

const TabularPreview = ({
  data,
  localColumnWidths,
  handleColumnWidthChange,
  handleDownloadFile,
  handleSwitchChange,
  maskedData,
  selectedFiles,
  canSeeRealData,
  isLoading,
  tableHeaders,
  paginatedRows,
  closePreviewModal,
  handleDynamicPreview,
  previewData,
  isModalOpen,
}) => {
  const processPreviewData = (data) => {
    if (!data) return [];
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      return data;
    }
    if (typeof data === "string") {
      const lines = data.trim().split("\n");
      if (lines.length > 0) {
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
        return rows;
      }
    }
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
      const lines = data;
      if (lines.length > 0) {
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
        return rows;
      }
    }
    return [];
  };

  const safePreviewData = processPreviewData(previewData);

  const excludedColumns = ["0", "__extra__", "__id__", "__index__", "__row__"];

  const columnHeaders =
    safePreviewData.length > 0
      ? Object.keys(safePreviewData[0]).filter((key) => {
          return (
            !excludedColumns.includes(key) &&
            !key.startsWith("__") &&
            !key.startsWith("_")
          );
        })
      : [];

  const [totalPages, setTotalPages] = useState(0);
  const [currentRows, setCurrentRows] = useState([]);
  const containerRef = useRef(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [isOpenRows, setIsOpenRows] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showTableInput, setShowTableInput] = useState(false);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearchText, setTableSearchText] = useState("");
  const tableRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [highlightedTextCount, setHighlightedTextCount] = useState(0);
  const [searchTableInputText, setSearchTableInputText] = useState("");
  const [totalRows, setTotalRows] = useState(0);

  // Tracks precise metadata coordinates for every single text match instantiation
  const [matchCoordinates, setMatchCoordinates] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  useEffect(() => {
    const pages = Math.ceil(safePreviewData.length / rowsPerPage);
    setTotalPages(pages);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, safePreviewData.length);
    setCurrentRows(safePreviewData.slice(startIndex, endIndex));
  }, [safePreviewData, currentPage, rowsPerPage]);

  const handleTableSearchInputChange = (event) => {
    const searchText = event.target.value;
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Primary functional scanner engine to collect position markers
  useEffect(() => {
    if (!searchTableInputText.trim() || currentRows.length === 0) {
      setMatchCoordinates([]);
      setCurrentMatchIndex(-1);
      setHighlightedTextCount(0);
      return;
    }

    const query = searchTableInputText.toLowerCase().trim();
    const coords = [];
    let absoluteMatchCounter = 0;

    // Scan linearly through active viewport rows
    currentRows.forEach((row, rowIndex) => {
      columnHeaders.forEach((key) => {
        const cellValue = String(row[key] || "").toLowerCase();
        if (cellValue.includes(query)) {
          // Track exact frequency instances inside this cell string container
          const regex = new RegExp(
            searchTableInputText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "gi"
          );
          const internalMatches = cellValue.match(regex);
          
          if (internalMatches) {
            internalMatches.forEach(() => {
              coords.push({
                rowIndex,
                columnKey: key,
                matchInstanceIndex: absoluteMatchCounter,
              });
              absoluteMatchCounter++;
            });
          }
        }
      });
    });

    setMatchCoordinates(coords);
    setHighlightedTextCount(absoluteMatchCounter);
    setCurrentMatchIndex(absoluteMatchCounter > 0 ? 0 : -1);
  }, [currentRows, searchTableInputText]);

  // Automated scroll monitoring routine
  useEffect(() => {
    if (currentMatchIndex >= 0 && matchCoordinates[currentMatchIndex]) {
      const activeCoordinate = matchCoordinates[currentMatchIndex];
      setTimeout(() => {
        if (tableRef.current) {
          const targetedNode = tableRef.current.querySelector(
            `[data-match-idx="${activeCoordinate.matchInstanceIndex}"]`
          );
          if (targetedNode) {
            targetedNode.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }
      }, 50);
    }
  }, [currentMatchIndex, matchCoordinates]);

  const highlightTableNextMatch = useCallback(
    (direction) => {
      if (matchCoordinates.length === 0) return;

      setCurrentMatchIndex((prevIndex) => {
        let nextIndex = prevIndex + direction;
        if (nextIndex < 0) {
          nextIndex = matchCoordinates.length - 1;
        } else if (nextIndex >= matchCoordinates.length) {
          nextIndex = 0;
        }
        return nextIndex;
      });
    },
    [matchCoordinates]
  );

  const handleKeyPress = (e, direction) => {
    if (e.key === "Enter") {
      e.preventDefault();
      highlightTableNextMatch(direction);
    }
  };

  const handleNextButtonClick = () => {
    highlightTableNextMatch(1);
  };

  const handlePreviousButtonClick = () => {
    highlightTableNextMatch(-1);
  };

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

  // Dedicated component context variable references used within map loops
  let cellGlobalMatchIndexCounter = 0;

  const renderHighlightText = (text, searchInput, activeGlobalMatchIndex, cellRowIndex, cellColKey) => {
    const stringText = typeof text === "string" ? text : String(text);
    if (!stringText) return "";
    if (!searchInput.trim()) return stringText;

    const escapedSearchText = searchInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedSearchText})`, "gi");
    const parts = stringText.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          const isMatch = index % 2 === 1;
          if (isMatch) {
            const currentInstanceId = cellGlobalMatchIndexCounter;
            cellGlobalMatchIndexCounter++;

            const isCurrentFocusedMatch = currentInstanceId === activeGlobalMatchIndex;

            return (
              <span
                key={index}
                data-match-idx={currentInstanceId}
                style={{
                  backgroundColor: isCurrentFocusedMatch ? "orange" : "yellow",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  const selectOption = (value) => {
    handleRowsPerPageChange(value);
    setIsOpenRows(false);
  };

  useEffect(() => {
    if (typeof previewData === "object" && previewData !== null) {
      setTotalRows(Math.ceil(previewData.length / rowsPerPage));
    }
  }, [previewData, rowsPerPage]);

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
    setIsOpenRows(false);
  };

  useEffect(() => {
    setRows(safePreviewData);
    setTotalRows(Math.ceil(safePreviewData.length / rowsPerPage));
  }, [safePreviewData, rowsPerPage]);

  const toggleRowsDropdown = () => setIsOpenRows(!isOpenRows);

  const handletablePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handletableNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Reset match tracking index counter values when re-rendering rows layout
  cellGlobalMatchIndexCounter = 0;
  const startIndexOffset = (currentPage - 1) * rowsPerPage;

  return (
    <div className="w-[60vw] h-[70vh] flex flex-col items-center mt-1 px-3">
      <div className="w-[60vw] h-[10vh] flex flex-row gap-4 px-2 items-center">
        <div className="flex flex-row bg-white justify-between items-center w-72 h-9 rounded shadow-md px-3">
          <input
            value={searchTableInputText}
            onChange={handleTableSearchInputChange}
            onKeyDown={(e) => handleKeyPress(e, 1)}
            autoComplete="off"
            className="border border-none outline-none font-poppins w-full text-xs"
            placeholder="Type text to search..."
          />
          {highlightedTextCount > 0 && (
            <span className="text-[10px] text-gray-500 whitespace-nowrap mr-1 font-poppins">
              {currentMatchIndex + 1}/{highlightedTextCount}
            </span>
          )}
          <img
            src={process.env.PUBLIC_URL + "/search_icon.png"}
            alt="search"
            style={{ width: "18px", height: "18px", outline: "none" }}
          />
        </div>
        
        <div className="h-8 w-14 flex flex-row justify-between items-center px-1">
          <button
            className="w-5 h-4 cursor-pointer font-bold mt-1"
            onClick={handlePreviousButtonClick}
            title="Previous Match"
          >
            <img
              src={process.env.PUBLIC_URL + "/less-than.png"}
              alt="Previous Match"
              className="w-3 h-3"
            />
          </button>

          <button
            className="w-5 h-4 cursor-pointer font-bold mt-1"
            onClick={handleNextButtonClick}
            title="Next Match"
          >
            <img
              src={process.env.PUBLIC_URL + "/more-than.png"}
              alt="Next Match"
              className="w-3 h-3"
            />
          </button>
        </div>

        {canSeeRealData && (
          <div className="h-8 w-56 flex flex-row gap-3 items-center space-x-5">
            <label className="text-[12px] font-medium font-poppins text-black">
              Masked Data ?
            </label>
            {/* <div className="relative inline-block w-[32px] h-[20px] rounded-full cursor-pointer"> */}
              <img
                src={
                  maskedData
                    ? process.env.PUBLIC_URL + "/yesswitch-icon.png"
                    : process.env.PUBLIC_URL + "/noswitch-icon.png"
                }
                // alt={maskedData ? "Yes" : "No"}
                // onClick={handleSwitchChange}
                // style={{ width: "60px", height: "16px", cursor: "pointer" }}
                 alt="switch"
                  onClick={handleSwitchChange}
                  className="w-10 h-4 cursor-pointer"
              />
            {/* </div> */}
          </div>
        )}
        <div className="flex-grow"></div>
        <button
          className="w-28 h-8 flex flex-row font-poppins ml-4 px-4 rounded-md cursor-pointer justify-center items-center font-medium text-[13px] bg-purpleshade1 text-white"
          onClick={handleDownloadFile}
        >
          Download
        </button>
      </div>

      <div className="w-[60vw] h-10 flex flex-row mt-3 font-poppins px-5 text-black text-xs font-medium">
        {selectedFiles && selectedFiles.split(/[\\/]/).pop()}
      </div>

      <div className="w-[60vw] h-[70vh] bg-white flex justify-center mt-3 border border-lightgray-300 border-t-0 rounded-md shadow-md shadow-slate-500/30">
        {isLoading ? (
          <div className="w-[60vw] h-[58vh] flex flex-col justify-center items-center">
            <img
              src={process.env.PUBLIC_URL + "/loadergif.gif"}
              alt="loader"
              className="animate-spin w-6 h-6 items-center"
            />
          </div>
        ) : (
          <pre
            className="w-[59vw] h-[58vh] cursor-not-allowed  overflow-x-auto overflow-y-auto relative font-poppins select-text flex flex-col text-black"
            ref={containerRef}
            style={{
              scrollbarWidth: "thin",
              userSelect: "text",
            }}
          >
            {safePreviewData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full">
                <p className="text-gray-500 text-sm">No data available to display</p>
              </div>
            ) : (
              <table
                className="table-design1 w-full rounded-tl-xl rounded-tr-xl"
                ref={tableRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <thead className="bg-purpleshade1 sticky -top-1 h-10 font-light text-sm rounded-tl-xl rounded-tr-xl z-10">
                  <tr className="h-6 font-light text-sm font-poppins w-32 text-white rounded-tl-xl rounded-tr-xl">
                    {columnHeaders.map((key) => (
                      <ResizableHeader
                        key={key}
                        column={{
                          field: key,
                          headerName: key,
                          width: columnWidths[key] || 200,
                        }}
                        handleResizeStart={handleColumnResizeStart}
                        handleResizeStop={handleColumnResizeStop}
                        handleResize={handleColumnResize}
                      />
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(currentRows) &&
                    currentRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="font-poppins font-light text-[11px] border-b border-gray-100"
                      >
                        {columnHeaders.map((key) => (
                          <ResizableCell
                            key={key}
                            width={columnWidths[key] || 200}
                            cellValue={row[key] || ""}
                            columnField={key}
                            highlightedText={renderHighlightText(
                              row[key] || "",
                              searchTableInputText,
                              currentMatchIndex,
                              rowIndex,
                              key
                            )}
                          />
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </pre>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="h-6 w-[98%] font-poppins flex items-center text-xs justify-end space-x-4 mt-5 mr-3">
        <button onClick={handletablePrevPage} disabled={currentPage === 1} className="p-1 disabled:opacity-30">
          &lt;
        </button>
        <span className="font-light text-xs">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handletableNextPage} disabled={currentPage === totalPages} className="p-1 disabled:opacity-30">
          &gt;
        </button>

        <div className="relative inline-block">
          <button
            onClick={toggleRowsDropdown}
            className="text-black font-light rounded-lg border border-slate-700 text-xs font-poppins px-3 py-1  text-center inline-flex items-center"
            type="button"
          >
            No.of Rows: {rowsPerPage}
            <svg
              className={`w-2.5 h-2 ms-3 ${isOpenRows ? "rotate-180" : ""}`}
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

          <div
            className={`z-10 ${isOpenRows ? "" : "hidden"} bg-white border border-gray-200 font-poppins rounded-lg shadow w-32 absolute bottom-full mb-1`}
          >
            <ul className="py-1 text-xs font-normal text-black">
              <li>
                <button
                  type="button"
                  onClick={() => selectOption(20)}
                  className="block px-3 py-1 text-start w-full hover:bg-purpleshade1 hover:text-white"
                >
                  20
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => selectOption(50)}
                  className="block px-3 py-1 text-start w-full hover:bg-purpleshade1 hover:text-white"
                >
                  50
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => selectOption(100)}
                  className="block px-3 py-1 text-start text-black w-full hover:bg-purpleshade1 hover:text-white"
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
}) => (
  <th
    className="cursor-col-resize"
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
      <div className="text-left px-2 font-poppins font-normal text-xs whitespace-nowrap overflow-hidden text-ellipsis">
        {column.headerName}
      </div>
    </Resizable>
  </th>
);

const ResizableCell = ({ width, cellValue, highlightedText }) => {
  return (
    <td
      style={{ width: width, minWidth: width, maxWidth: width }}
      className="whitespace-normal break-words h-auto align-top p-2 overflow-visible"
    >
      <div className="block whitespace-normal break-words clear-both">
        {highlightedText || cellValue}
      </div>
    </td>
  );
};

export default TabularPreview;