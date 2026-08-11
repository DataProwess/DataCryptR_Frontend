import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../csrfUtils";
import ErrorPopup from "../ErrorPopup"
import { API_URL } from "../ApiConfig";
import { useNavigate } from "react-router-dom";

const S3BucketsData = ({
  selectedS3storageAccountId,
  selectedS3AccountName,
  selectedOption,
}) => {
  console.log("1",selectedS3storageAccountId,selectedS3AccountName)
  const { token, csrfToken } = useAuth();
  const [buckets, setBuckets] = useState([]);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [s3error, setS3Error] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loadingBucketFiles, setLoadingBucketFiles] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState();

  useEffect(() => {
    if (selectedS3storageAccountId) {
      fetchS3Buckets(selectedS3storageAccountId);
    } else {
      setBuckets([]); // Clear out lists if no active selection exists
    }
  }, [selectedS3storageAccountId, token]);

  const fetchS3Buckets = async (accountId) => {
    console.log(accountId);
    if (!token) return;

    setLoadingBuckets(true);
    setS3Error(null);

    try {
      // 🚀 Hits exactly: GET /api/s3/buckets/?s3_account_id=X
      const response = await apiRequest(
        `${API_URL}/api/s3/buckets/?s3_account_id=${accountId}`,
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
      setBuckets(fetchedBuckets);
    } catch (err) {
      console.error("Error fetching S3 buckets:", err);
      setS3Error("Failed to load S3 buckets. Please try again.");
      setIsPopupOpen(true);
    } finally {
      setLoadingBuckets(false);
    }
  };

  // const handleS3BucketClick = async (bucket) => {
  //   console.log("🎯 S3 Bucket clicked:", bucket.name);

  //   setLoadingBucketFiles(true);
  //   setError("");

  //   // Create a minimal body payload containing the ID expected by your backend
  //   const requestBody = {
  //     s3_bucket_id: bucket.id, // Passing the exact parameter key required by your server
  //     folder_pattern: "",
  //     pattern: "",
  //     page_number: 1,
  //     page_size: 10,
  //     sort_by: {
  //       sort_string: "name",
  //       order_by: "asc",
  //     },
  //   };

  //   try {
  //     /* ✅ PASS THE MINIMAL PAYLOAD BODY:
  //      Instead of null, pass the requestBody object as the 3rd argument.
  //      Your apiRequest utility will convert it into the correct format for the server.
  //   */
  //     const data = await apiRequest(
  //       `${API_URL}/api/s3/files/`,
  //       "POST",
  //       requestBody,
  //     );

  //     if (!data) {
  //       console.warn("⚠️ No data object returned from server.");
  //       return;
  //     }

  //     console.log("📁 Files/folders found in S3 bucket:", data);

  //     if (!data.blob_list?.length && !data.folder_list?.length) {
  //       setError("No Folders and Files Found");
  //       setIsPopupOpen(true);
  //     } else {
  //       console.log("🚀 Navigating with payload:", {
  //         bucketId: bucket.id,
  //         bucketName: bucket.name,
  //         selectedOption,
  //         selectedS3AccountName, // Ensuring this is exact)
  //        data,
         
  //       });
  //       console.log("i am",data.folder_list, typeof(data))

  //       navigate(`/s3-files/${bucket.id}`, {
  //         state: {
  //           bucketId: bucket.id,
  //           //   selectedStorageAccountId: selectedStorageAccountId,
  //           bucketName: bucket.name,
  //           selectedOption: selectedOption,
  //           selectedS3AccountName: selectedS3AccountName,
  //          initialFiles: data.data?.blob_list || data.blob_list || [],
  //   initialFolders: data.data?.folder_list || data.folder_list || [],
  //         },
          
  //       });
        
  //     }
  //   } catch (error) {
  //     console.error("API Fetch Exception routing S3 context:", error.message);
  //     setError(
  //       error.message || "An authentication or CSRF validation error occurred.",
  //     );
  //     setIsPopupOpen(true);
  //   } finally {
  //     setLoadingBucketFiles(false);
  //   }
  // };


  const handleS3BucketClick = async (bucket) => {
  console.log("🎯 S3 Bucket clicked:", bucket.name);

  setLoadingBucketFiles(true);
  setError("");

  const requestBody = {
    s3_bucket_id: bucket.id,
    folder_pattern: "",
    pattern: "",
    page_number: 1,
    page_size: 10,
    sort_by: {
      sort_string: "name",
      order_by: "asc",
    },
  };

  try {
    const response = await apiRequest(
      `${API_URL}/api/s3/files/`,
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
      setError("No Folders and Files Found");
      setIsPopupOpen(true);
    } else {
      console.log("🚀 Navigating with payload:", {
        bucketId: bucket.id,
        bucketName: bucket.name,
        selectedOption,
        selectedS3AccountName,
        selectedS3storageAccountId,
        folders,
        blobs
      });

      console.log(selectedS3storageAccountId)
      navigate(`/s3-files/${bucket.id}`, {
        state: {
          bucketId: bucket.id,
          bucketName: bucket.name,
          selectedOption: selectedOption,
          selectedS3AccountName: selectedS3AccountName,
          initialFiles: blobs,
          initialFolders: folders,
         s3AccountId: selectedS3storageAccountId ||  1,
        },
      });
    }
  } catch (error) {
    console.error("API Fetch Exception routing S3 context:", error.message);
    setError(
      error.message || "An authentication or CSRF validation error occurred.",
    );
    setIsPopupOpen(true);
  } finally {
    setLoadingBucketFiles(false);
  }
};

  const handleCloseChatbot = () => {
    setIsPopupOpen(false);
  };

  const renderS3BucketsList = () => {
    if (!selectedS3AccountName) {
      return <p className="font-normal text-xs">Please click on S3 Buckets.</p>;
    } else {
      return (
        <div>
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
            className="w-full grid gap-2  overflow-y-auto "
            // style={{
            //   gridTemplateColumns: "repeat(auto-fill, minmax(100px, 2fr))",
            // }}
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gridAutoRows: "80px", // Adjust this pixel value up or down to get the exact row size you want
            }}
          >
            {buckets.map((bucket) => (
              <li
                key={bucket.id}
                onClick={() => handleS3BucketClick(bucket)}
                className="flex justify-center"
              >
                <div className="flex flex-col items-center cursor-pointer px-2 py-2 rounded-md  transition-all duration-200">
                  <img
                    src={process.env.PUBLIC_URL + "/container-icon-bg.png"}
                    alt="Container"
                    className="w-6 h-6 mb-1"
                  />
                  <span className="text-[10px] text-black text-center break-all leading-tight">
                    {bucket.name}
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
            {selectedS3AccountName || "Selected"} buckets:
          </h2>
        </div>
      </div>

      {/* 🔄 THE CONTAINER AREA :
      - Changed bg-pink to a production-ready color (or keep it if needed for testing)
      - Added 'flex-1 min-h-0' so it fills the remaining room exactly without expanding.
      - Changed 'overflow-visible' to 'overflow-y-auto' to anchor scroll mechanics inside.
    */}
      <div
        className="w-full flex-1 min-h-0 bg-transparent overflow-y-auto p-1.5"
        style={{ scrollbarWidth: "thin" }}
      >
        {loadingBuckets ? (
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
          renderS3BucketsList()
        )}
      </div>
      <ErrorPopup
        isOpen={isPopupOpen}
        message={s3error}
        onClose={handleCloseChatbot}
      />
    </div>
  );
};

export default S3BucketsData;
