import React from "react";
import "./admin.css";

const UploadPopup = ({
  handleUploadPopupClose,
  handleBrowseClick,
  handleSampleFileDownload,
  selectedFileName,
  handleClearSelectedFile,
  handleUploadFile,
}) => {
  return (
    // Fixed inset-0 overlay naturally centers its child vertically & horizontally
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="download-popup relative bg-white flex flex-col shadow-md shadow-slate-500/30 rounded-lg p-4 min-w-[320px]">
        
        {/* Header / Close Button */}
        <div className="flex justify-end">
          <button
            className="text-2xl font-semibold"
            onClick={handleUploadPopupClose}
          >
            <img
              src={process.env.PUBLIC_URL + "/closefile.png"}
              alt="close"
              className="h-4 w-4"
            />
          </button>
        </div>

        {/* Title */}
        <div className="flex justify-center items-center mb-3">
          <p className="text-sm font-medium">Upload</p>
        </div>

        {/* Content Body */}
        <div className="flex flex-col items-center">
          <div className="rounded-lg items-center flex flex-col space-y-4 w-full">
            
            {/* Drag & Drop Area */}
            <div className="bg-purpleshadeL border border-dashed border-gray-300 flex flex-col items-center px-8 py-6 space-y-3 rounded-md w-full">
              <img
                src={process.env.PUBLIC_URL + "/Upload-icon.png"}
                alt="uploadicon"
                className="h-12 w-12"
              />
              <p className="text-sm">
                Drag & drop files or{" "}
                <span
                  className="text-blue-800 underline cursor-pointer"
                  onClick={handleBrowseClick}
                >
                  Browse
                </span>
              </p>
              <p className="text-[10px] text-gray-500">Supported formats: xlsx</p>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col items-center py-2 space-y-3 rounded w-full">
              
              {/* Sample Download */}
              <div className="flex flex-row items-center justify-center rounded">
                <p className="text-xs">
                  Download Sample xlsx
                  <span
                    className="text-blue-800 underline ml-1 cursor-pointer"
                    onClick={handleSampleFileDownload}
                  >
                    Files
                  </span>
                </p>
              </div>

              {/* File Input Preview */}
              <div className="text-sm flex bg-white flex-row border border-[#11AF22] rounded px-2 py-1 items-center justify-between w-full">
                <input
                  type="text"
                  className="outline-none text-xs w-full bg-transparent"
                  placeholder="your-file-here.xlsx"
                  value={selectedFileName || ""}
                  readOnly
                />
                <button onClick={handleClearSelectedFile} className="ml-2">
                  <img
                    src={process.env.PUBLIC_URL + "/closefile.png"}
                    alt="close"
                    className="h-3 w-3"
                  />
                </button>
              </div>

              {/* Upload Action Button */}
              <div className="flex flex-row bg-purpleshade1 cursor-pointer items-center justify-center w-full py-2 rounded">
                <button
                  className="font-medium text-sm text-white w-full"
                  onClick={handleUploadFile}
                >
                  Upload
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UploadPopup;