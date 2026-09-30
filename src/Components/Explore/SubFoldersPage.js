import React from "react";

const SubFoldersPage = ({
  selectedFolder,
  subfolders = [],
  files = [],
  selectedFiles,
  setSelectedFiles,
  handleFolderClick,
  handleFileClick,
  handleFolderSort,
  handleFileRowClick,
  anyModalOpen,
  isTableView,
  folderId,
}) => {
  return (
    <div className="layout-table  px-7   flex flex-col">
      {isTableView ? (
        <div className="layout-data-container table-margin  flex rounded-lg pt-0.5 pb-2 flex-col shadow-lg shadow-slate-500/50 overflow-hidden">
          <div
            className={`layout-breadcrums-container bg-purpleshade1 rounded-t-lg ${anyModalOpen ? "relative z-0 blur-effect pointer-events-none select-none" : "relative z-10"}`}
          >
            <table className="table-design table-fixed w-full">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead className="bg-purpleshade1 sticky top-0 z-10 rounded-tr-lg rounded-tl-lg text-white">
              <tr>
                <th className="py-2 sticky top-0 rounded-tl-lg text-xs font-normal"></th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Name
                  <span
                    onClick={() => handleFolderSort("name", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("name", "desc")}
                    className="cursor-pointer"
                  >
                    {/* {isAscending ? 'Sort Descending' : 'Sort Ascending'} */}
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Size (bytes)
                  <span
                    onClick={() => handleFolderSort("size", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("size", "desc")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Created Date
                  <span
                    onClick={() => handleFolderSort("creation_time", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("creation_time", "desc")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 text-xs font-normal">
                  Modified Date
                  <span
                    onClick={() => handleFolderSort("modified_time", "asc")}
                    className="ml-1 cursor-pointer"
                  >
                    &uarr;
                  </span>
                  <span
                    onClick={() => handleFolderSort("modified_time", "desc")}
                    className="cursor-pointer"
                  >
                    &darr;
                  </span>
                </th>
                <th className="py-2 sticky top-0 rounded-tr-lg text-xs font-normal">
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
                {subfolders.map((folder) => (
                  <tr key={folder.file_id}>
                    <td className="w-[3%] text-xs font-normal overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td
                      className="w-[25%]  truncate cursor-pointer"
                      onClick={() => handleFolderClick(`${folderId}/${folder}`)}
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
                        <span className="truncate">{folder}</span>
                      </span>

                      {/* {folder.name} */}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-center text-black px-6 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[20%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"></td>
                  </tr>
                ))}
                {files.map((file) => (
                  <tr
                    key={file.file_id}
                    className={` ${
                      selectedFiles.includes(file.file_name)
                        ? "bg-primary rounded-md "
                        : ""
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
                    <td className="w-[15%] text-[11px] font-light text-black pl-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.size}
                    </td>
                    <td className="w-[20%] text-[11px] font-light text-black  overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.creation_time}
                    </td>
                    <td className="w-[20%] text-[11px] font-light text-black overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.modified_time}
                    </td>
                    <td className="w-[15%] text-[11px] font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {file.file_path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
          
        </div>
      ) : (
        <div
          className="w-full h-full flex flex-row items-center pt-4 pl-4 pb-4 relative"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <div
            className="w-full h-full items-baseline grid gap-0"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "8px",
              overflow: "auto",
              scrollbarWidth: "thin",
              alignContent: "start",
            }}
          >
            {/* ================= SUBFOLDERS ================= */}

            {subfolders.map((subfolder) => (
              <div
                key={subfolder}
                className="flex flex-col items-center cursor-pointer w-20 h-auto p-0 m-0 mb-5 md:mb-10 lg:mb-20"
                onClick={() =>
                  handleFolderClick(`${selectedFolder}/${subfolder}`)
                }
                style={{
                  width: "100%",
                  maxWidth: "80px",
                  height: "90px",
                  marginBottom: "20px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="flex flex-col items-center space-y-1">
                  <img
                    src={process.env.PUBLIC_URL + "/baseline-folder.png"}
                    alt="Closed Folder"
                    className="w-12 h-12"
                    title={subfolder}
                  />

                  <span
                    className="text-[12px] font-medium text-black block text-center cursor-pointer"
                    style={{
                      width: "80px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={subfolder}
                  >
                    {subfolder}
                  </span>
                </div>
              </div>
            ))}

            {/* ================= FILES ================= */}

           {files.map((file) => (
            <div
              key={file.file_id}
              className={`flex flex-col items-center cursor-pointer w-20 h-auto p-0 m-0 mb-5 md:mb-10 lg:mb-20
                 ${
                   selectedFiles.includes(file.file_name)
                     ? "bg-primary rounded-md "
                     : ""
                 }`}
              onClick={() => handleFileClick(`${file.file_name}`)}
              style={{
                width: "100%",
                maxWidth: "80px",
                height: "90px",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="flex flex-col items-center space-y-1 relative">
                <img
                  src={process.env.PUBLIC_URL + "/file-icon.png"}
                  alt="File"
                  className="w-12 h-14"
                  title={file.file_name.split("/").pop()}
                />
                {/* {selectedFiles[0] === file.file_name && (
                  <img
                    src={process.env.PUBLIC_URL + "/tick-icon.png"}
                    alt="Selected"
                    className="absolute w-4 h-4 -top-3 right-3"
                  />
                )} */}
                <span className="relative w-full overflow-hidden text-center">
                  <span
                    className="relative group text-[12px] font-medium text-black block text-center cursor-pointer"
                    style={{
                      width: "80px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={file.file_name.split("/").pop()}
                  >
                    {file.file_name.split("/").pop()}
                  </span>
                </span>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubFoldersPage;
