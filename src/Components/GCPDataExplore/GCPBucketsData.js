import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../auth";
import { API_URL } from "../ApiConfig";
import ErrorPopup from "../ErrorPopup";
import { apiRequest } from "../csrfUtils";
import { useAuth } from "../AuthContext";

const GCPBucketsData = ({
  selectedOption,
  selectedgcpId,
  selectedGcpAccountName,
  isDownloadStorage,
 
}) => {
    console.log("gcp",selectedgcpId,selectedGcpAccountName)
   const { token, csrfToken } = useAuth();
    const [gcpbuckets, setGcpBuckets] = useState([]);
    const [loadingGcpBuckets, setLoadingGcpBuckets] = useState(false);
    const [gcperror, setGcpError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [loadingGcpBucketFiles, setLoadingGcpBucketFiles] = useState(false);
    //  const [loadingGcpBucketFiles, setLoadingGcpBucketFiles] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState();


    useEffect(() => {
        if (selectedgcpId) {
          fetchGCPBuckets(selectedgcpId);
        } else {
          setGcpBuckets([]); // Clear out lists if no active selection exists
        }
      }, [selectedgcpId, token]);
    
      const fetchGCPBuckets = async (accountId) => {
        console.log(accountId);
        if (!token) return;
    
        setLoadingGcpBuckets(true);
        setGcpError(null);
    
        try {
          // 🚀 Hits exactly: GET /api/s3/buckets/?s3_account_id=X
          const response = await apiRequest(
            `${API_URL}/api/gcp/buckets/?gcp_account_id=${accountId}`,
            "GET",
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            },
          );
    
          if (!response) return;
    
          // Unwraps response array depending on whether it's wrapped in a data property
          const fetchedBuckets = response.data || response || [];
          setGcpBuckets(fetchedBuckets);
        } catch (err) {
          console.error("Error fetching S3 buckets:", err);
          setGcpError("Failed to load GCP buckets. Please try again.");
          setIsPopupOpen(true);
        } finally {
          setLoadingGcpBuckets(false);
        }
      };

  
const handleGcpBucketClick = async(gcpbucket) => {
    console.log("🎯 GCP Bucket clicked:", gcpbucket.name);
    
      setLoadingGcpBucketFiles(true);
      setError("");
    
      const requestBody = {
        gcp_bucket_id: gcpbucket.id,
        folder_pattern: "",
        pattern: "",
        page_number: 1,
        page_size: 100,
        sort_by: {
            sort_string: "name",
            order_by: "asc"

       
        },
      };
    
      try {
        const response = await apiRequest(
          `${API_URL}/api/gcp/files/`,
          "POST",
          requestBody,
        );
    
        if (!response) {
          console.warn("⚠️ No response object returned from server.");
          return;
        }
    
        console.log("📁 Full API Response wrapper:", response);
    
        // ⚡ THE FIX: Safely extract the inner data object returned by your backend payload
        const innerData = response.data || response;
        
        const folders = innerData.folder_list || [];
        const blobs = innerData.blob_list || [];
    
        console.log("🔍 Extracted folder_list:", folders);
        console.log("🔍 Extracted blob_list:", blobs);
    
        // Check the actual length of the extracted arrays
        if (blobs.length === 0 && folders.length === 0) {
          setGcpError("No Folders and Files Found");
          setIsPopupOpen(true);
        } else {
          console.log("🚀 Navigating with payload:", {
            gcpbucketId: gcpbucket.id,
            gcpbucketName: gcpbucket.name,
            selectedOption,
            selectedGcpAccountName,
            isDownloadStorage,
            selectedgcpId,
            folders,
            blobs
          });
    
          console.log(selectedgcpId)
          navigate(`/gcp-files/${gcpbucket.id}`, {
            state: {
              gcpbucketId: gcpbucket.id,
              gcpbucketName: gcpbucket.name,
              selectedOption: selectedOption,
              selectedGcpAccountName: selectedGcpAccountName,
              isDownloadStorage: isDownloadStorage,
              initialFiles: blobs,
              initialFolders: folders,
             gcpAccountId: selectedgcpId,
            },
          });
        }
      } catch (error) {
        console.error("API Fetch Exception routing GCP context:", error.message);
        setError(
          error.message || "An authentication or CSRF validation error occurred.",
        );
        setIsPopupOpen(true);
      } finally {
        setLoadingGcpBucketFiles(false);
      }

}
 

  const handleCloseChatbot = () => {
    setIsPopupOpen(false);
  };

  // eslint-disable-next-line
//   const handleViewChange = (type) => {
//     setViewType(type);
//   };

  const renderGcpBucketsList = () => {
    if (!selectedGcpAccountName) {
      return (
        <p className="font-normal text-xs">
          Please click on GCP account.
        </p>
      );
    } else {
      return (
        <div className="">
          {/* <ul
            // className={`w-full flex flex-row flex-wrap space-x-9`}>
            className="w-full h-full items-baseline grid gap-0 "
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px",
              overflow: "auto",
              scrollbarWidth: "thin",
              alignContent: "start",
              marginleft: "15px",
            }}
          > */}
          <ul
            className="w-full grid gap-2 overflow-y-auto "
            // style={{
            //   gridTemplateColumns: "repeat(auto-fill, minmax(100px, 2fr))",
            // }}
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gridAutoRows: "80px", // Adjust this pixel value up or down to get the exact row size you want
            }}
          >
            {gcpbuckets.map((gcpbucket) => (
              // <li
              //   key={container.id}
              //   onClick={() => handleContainerClick(container)}
              //   className={``}
              // >
              //   <div
              //     // className={`w-14 h-9 flex  flex-col items-center space-y-1 cursor-pointer`}
              //     className="flex flex-col items-center cursor-pointer w-14 h-9 m-0 p-0 mb-5 md:mb-10 lg:mb-20"
              //   >
              //     <img
              //       src={process.env.PUBLIC_URL + "/container-icon-bg.png"}
              //       alt="Closed Folder"
              //       className="w-6 h-6 "
              //     />
              //     <span className=" text-black items-center font-normal text-[11px] ">
              //       {container.name}
              //     </span>
              //   </div>
              // </li>

              <li
                key={gcpbucket.id}
                onClick={() => handleGcpBucketClick(gcpbucket)}
                className="flex justify-center"
              >
                <div className="flex flex-col items-center cursor-pointer px-2 py-2 rounded-md  transition-all duration-200">
                  <img
                    src={process.env.PUBLIC_URL + "/container-icon-bg.png"}
                    alt="Container"
                    className="w-6 h-6 mb-1"
                  />
                  <span className="text-[10px] text-black text-center break-all leading-tight">
                    {gcpbucket.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return (
    /* Main background shell - using flexbox to control child element spaces */
    <div className="w-[95%] h-[95%] flex flex-col gap-4 items-center  overflow-hidden">
      {/* Header banner block */}
      <div className="w-full h-9 flex items-center bg-white rounded-lg shadow-md border-t border-slate-200/70 p-1 flex-shrink-0">
        <div className="flex flex-row items-center gap-1">
          <img
            src={process.env.PUBLIC_URL + "/container-icon.jpeg"}
            alt="Closed Folder"
            className="w-6 h-6 object-contain"
          />
          <h2 className="font-normal text-xs text-black truncate max-w-[200px] sm:max-w-[300px]">
            {selectedGcpAccountName || "Selected"} buckets:
          </h2>
        </div>
      </div>

      {/* 🔄 THE CONTAINER AREA (Formerly Pink):
      - Changed bg-pink to a production-ready color (or keep it if needed for testing)
      - Added 'flex-1 min-h-0' so it fills the remaining room exactly without expanding.
      - Changed 'overflow-visible' to 'overflow-y-auto' to anchor scroll mechanics inside.
    */}
      <div
        className="w-full flex-1 min-h-0 bg-transparent overflow-y-auto p-1.5"
        style={{ scrollbarWidth: "thin" }}
      >
        {loadingGcpBuckets ? (
          <div className="w-full h-48 flex flex-col justify-center items-center space-y-4">
            <img
              src={process.env.PUBLIC_URL + "/loader.png"}
              alt="logo"
              className="animate-spin w-8 h-8 object-contain"
            />
            <p className="text-logintext font-[350] text-[13px] animate-pulse">
              Just a moment...
            </p>
          </div>
        ) : (
          renderGcpBucketsList()
        )}
      </div>

      <ErrorPopup
        isOpen={isPopupOpen}
        message={gcperror}
        onClose={handleCloseChatbot}
      />
    </div>
  );
};

export default GCPBucketsData;
