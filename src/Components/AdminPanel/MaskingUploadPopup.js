import React from "react";

const MaskingUploadPopup = ({
  handleUploadPopupClose,
  handleMaskedBrowseClick,
  handleMaskedSampleFileDownload,
  selectedMaskedFileName,
  handleClearSelectedFile,
  handleMaskedUploadFile,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="download-popup relative bg-white flex flex-col shadow-md shadow-slate-500/30 rounded-lg p-4 min-w-[320px]">
         <div className="flex justify-end">
          <button
            className="text-2xl font-semibold"
            onClick={() => {
              handleUploadPopupClose();
            }}
          >
            <img
              src={process.env.PUBLIC_URL + "/closefile.png"}
              alt="close"
              className="h-4 w-4"
            />
          </button>
        </div>

         <div className="flex justify-center items-center mb-3">
          <p className="text-sm font-medium">Upload</p>
        </div>
       <div className="flex flex-col items-center">
          <div className="rounded-lg items-center flex flex-col space-y-4 w-full">
             <div className="bg-purpleshadeL border border-dashed border-gray-300 flex flex-col items-center px-8 py-6 space-y-3 rounded-md w-full">
              <img
                src={process.env.PUBLIC_URL + "/Upload-icon.png"}
                alt="uploadicon"
                className=" h-14 w-14 mt-6"
              />
              <p className="text-sm mt-5">
                Drag & drop files or{" "}
                <span
                  className="text-blue-800 underline"
                  onClick={handleMaskedBrowseClick}
                >
                  Browse
                </span>
              </p>
              <p className="text-[10px]">Supported formats: xlsx</p>
            </div>

             {/* Controls Section */}
            <div className="flex flex-col items-center py-2 space-y-3 rounded w-full">
              
              {/* Sample Download */}
              <div className="flex flex-row items-center justify-center rounded">
                <p className="text-xs">
                  Download Sample xlsx
                  <span
                    className="text-blue-800 underline ml-1"
                    onClick={handleMaskedSampleFileDownload}
                  >
                    Files
                  </span>
                </p>
              </div>

            <div className="text-sm flex bg-white flex-row border border-[#11AF22] rounded px-2 py-1 items-center justify-between w-full">
                <input
                  type="text"
                  className="outline-none"
                  placeholder="your-file-here.xlsx"
                  value={selectedMaskedFileName}
                  readOnly
                />

                <button onClick={handleClearSelectedFile}>
                  <img
                    src={process.env.PUBLIC_URL + "/closefile.png"}
                    alt="close"
                    className="h-3 w-3"
                  />
                </button>
              </div>
              <div className="flex flex-row bg-purpleshade1 cursor-pointer items-center justify-center w-full py-2 rounded">
                <button
                  className="  px-4 rounded-sm 
                           justify-center items-center font-medium text-sm bg-purpleshade1
                          text-white  "
                  onClick={handleMaskedUploadFile}
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

export default MaskingUploadPopup;
