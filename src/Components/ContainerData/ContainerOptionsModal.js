import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../auth";
import { API_URL } from "../ApiConfig";
import ErrorPopup from "../ErrorPopup";
import { apiRequest } from "../csrfUtils";
import { useAuth } from "../AuthContext";

const ContainerOptionsModal = ({
  selectedOption,
  containerOptions,
  fileShareOptions,
  onClose,
  selectedStorageAccount,
  containerName,
}) => {
  const { token, csrfToken } = useAuth();
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // eslint-disable-next-line
  const ContainerId = containerOptions.id;

  const navigate = useNavigate();
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [viewType, setViewType] = useState("details");

  // const handleContainerClick = async (container) => {
  //   console.log("🎯 Container clicked:", container);
  //   console.log("🎯 Container ID:", container.id);
  //   console.log("🎯 Container Name:", container.name);

  //   let requestBody = {
  //     storage_account: selectedStorageAccount,
  //     pattern: "",
  //     folder_pattern: "",
  //     page_number: 1,
  //     page_size: 10,
  //     container_id: container.id,
  //     sort_by: {
  //       sort_string: "creation_time",
  //       order_by: "des",
  //     },
  //   };

  //   const response = await fetch(`${API_URL}/api/blob/list_blobs/`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //       "X-CSRFToken": csrfToken,
  //     },
  //     credentials: "include",
  //     body: JSON.stringify(requestBody),
  //   });

  //   if (!response.ok) {
  //     if (response.status === 401) {
  //       const responseData = await response.json();
  //       if (responseData.error === "Access token has expired") {
  //         window.location.href = "/";
  //         return;
  //       }
  //     }
  //     if (response.status === 404) {
  //       console.error("Error: No data found.");
  //       setError(true);
  //       setLoading(false);
  //       return null;
  //     } else {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  //   }

  //   const data = await response.json();
  //   console.log("📁 Files/folders found in container:", data);
  //   console.log("📊 Container details:", {
  //     id: container.id,
  //     name: container.name,
  //     storage_account: container.storage_account,
  //     last_modified: container.last_modified,
  //   });

  //   if (!data.blob_list.length && !data.folder_list.length) {
  //     console.log(
  //       "⚠️ No files/folders found in container, but this might be a sync issue",
  //     );
  //     setError("No Folders and Files Found");
  //     setIsPopupOpen(true);
  //   } else {
  //     console.log(
  //       "🚀 Navigating to container:",
  //       container.id,
  //       "with name:",
  //       container.name,
  //     );
  //     navigate(`/files/${container.id}`, {
  //       state: {
  //         containerData: container.id,
  //         selectedStorageAccount: selectedStorageAccount,
  //         containerName: container.name,
  //         selectedOption: selectedOption,
  //       },
  //     });
  //   }
  // };

 const handleContainerClick = async (container) => {
  console.log("🎯 Container clicked:", container.name);
  
  setLoading(true);
  setError("");

  const requestBody = {
    storage_account: selectedStorageAccount,
    pattern: "",
    folder_pattern: "",
    page_number: 1,
    page_size: 10,
    container_id: container.id,
    sort_by: {
      sort_string: "creation_time",
      order_by: "des",
    },
  };

  try {
    /* ✅ FIX 1: Pass parameters exactly to match your utility signature:
      Arg 1: URL
      Arg 2: Method ("POST")
      Arg 3: Raw Data object (DO NOT JSON.stringify it here!)
      Arg 4: Extra Options (Leave empty or pass extra headers if needed)
    */
    const data = await apiRequest(
      `${API_URL}/api/blob/list_blobs/`,
      "POST",
      requestBody
    );

    // ✅ Note: Your apiRequest already handles response.ok parsing internally 
    // and directly returns parsed JSON data or null on 404!
    if (!data) {
      console.warn("⚠️ No data returned from server.");
      return;
    }

    console.log("📁 Files/folders found in container:", data);

    if (!data.blob_list?.length && !data.folder_list?.length) {
      setError("No Folders and Files Found");
      setIsPopupOpen(true);
    } else {
      navigate(`/files/${container.id}`, {
        state: {
          containerData: container.id,
          selectedStorageAccount: selectedStorageAccount,
          containerName: container.name,
          selectedOption: selectedOption,
        },
      });
    }
  } catch (error) {
    console.error("API Fetch Exception:", error.message);
    setError(error.message || "An authentication or CSRF error occurred.");
    setIsPopupOpen(true);
  } finally {
    setLoading(false);
  }
};

  const handleCloseChatbot = () => {
    setIsPopupOpen(false);
  };

  // eslint-disable-next-line
  const handleViewChange = (type) => {
    setViewType(type);
  };

  const renderContainerList = () => {
    if (!selectedStorageAccount) {
      return (
        <p className="font-normal text-xs">
          Please click on a storage account.
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
            {containerOptions.map((container) => (
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
                key={container.id}
                onClick={() => handleContainerClick(container)}
                className="flex justify-center"
              >
                <div className="flex flex-col items-center cursor-pointer px-2 py-2 rounded-md  transition-all duration-200">
                  <img
                    src={process.env.PUBLIC_URL + "/container-icon-bg.png"}
                    alt="Container"
                    className="w-6 h-6 mb-1"
                  />
                  <span className="text-[10px] text-black text-center break-all leading-tight">
                    {container.name}
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
            {selectedStorageAccount || "Selected"} containers:
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
        {loading ? (
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
          renderContainerList()
        )}
      </div>

      <ErrorPopup
        isOpen={isPopupOpen}
        message={error}
        onClose={handleCloseChatbot}
      />
    </div>
  );
};

export default ContainerOptionsModal;
