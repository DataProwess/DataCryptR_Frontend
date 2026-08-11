import React, { useEffect, useState } from "react";
import { API_URL } from "../ApiConfig";
import { useUI } from "../Context/UIContext";
import { useAuth } from "../AuthContext";

const Miscellaneous = ({selectedOption}) => {
     const { token, csrfToken } = useAuth();
      const { setShowPreview, showChatbot, isDisabled, isBlurred } = useUI();
    const [keyValue, setKeyValue] = useState("");
    const [dynamicOption, setDynamicOption] = useState("default");
    const [selectedTabState, setSelectedTabState] = useState({});
     const [showDynamicOptions, setShowDynamicOptions] = useState(false);
      const [loading, setLoading] = useState(true);

       const isInteractionDisabled = showChatbot;

        useEffect(() => {
           if (selectedOption === "Miscellaneous") {
             const fetchEncryptionType = async () => {
               try {
                 const response = await fetch(
                   `${API_URL}/api/admin/encryption-type/`,
                   {
                     method: "GET",
                     headers: {
                       Authorization: `Bearer ${token}`,
                       "X-CSRFToken": csrfToken,
                     },
                     credentials: "include",
                   }
                 );
       
                 // if (!response.ok) {
                 //   if (response.status === 401) {
                 //     const responseData = await response.json();
                 //     if (responseData.error === "Access token has expired") {
                 //       window.location.href = "/";
                 //       return;
                 //     }
                 //   }
                 //   throw new Error("Failed to fetch encryption type");
                 // }
       
                 if (!response.ok) {
                   // Check for token expiration
                   if (response.status === 401) {
                     try {
                       const responseData = await response.json();
                       if (responseData?.error === "Access token has expired") {
                         console.error("Token has expired. Redirecting to login...");
                         // Clear any relevant stored tokens
                         localStorage.removeItem("token");
                         sessionStorage.clear(); // Clear session storage if used
                         window.location.href = "/";
                         return; // Exit the function after redirect
                       }
                     } catch (jsonError) {
                       console.error("Failed to parse JSON response:", jsonError);
                     }
                   }
       
                   throw new Error("Failed to fetch encryption type");
                 }
       
                 const data = await response.json();
                 console.log("Full data response:", data);
       
                 const encryptionType = data?.data?.type;
       
                 if (encryptionType) {
                   console.log("Extracted encryption type:", encryptionType);
       
                   if (encryptionType === "dynamic" || encryptionType === "key") {
                     // Automatically select the Dynamic checkbox
                     setSelectedTabState("dynamic");
                     setShowDynamicOptions(true); // Ensure checkbox is activated
                     setDynamicOption(encryptionType);
       
                     // Set key value if the type is "key"
                     if (encryptionType === "key") {
                       setKeyValue(data?.data?.key || "");
                     }
                   } else if (encryptionType === "consistent") {
                     // Handle "consistent" type
                     setSelectedTabState("consistent");
                     setShowDynamicOptions(false); // Hide dynamic options
                   }
                 } else {
                   console.error(
                     "Encryption type is undefined or data structure is unexpected"
                   );
                 }
       
                 setLoading(false);
               } catch (error) {
                 console.error("Failed to fetch encryption type", error);
                 setLoading(false);
               }
             };
       
             fetchEncryptionType();
           }
         }, [selectedOption, token, csrfToken]);

    const handleTabClick = async (tabName, key = null) => {
        try {
          const type = tabName.toLowerCase();
    
          const bodyData = {
            id: "1", // Ensure the id is correct as per your API requirements
            type: type, // Set the type based on the selected tab
            key: tabName === "key" ? key : null, // Only include key if tab is "key"
          };
    
          // Call the API to update the tab state on the server
          const response = await fetch(
            `${API_URL}/api/admin/encryption-type/update/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify(bodyData),
            }
          );
    
          if (!response.ok) {
            throw new Error("Failed to update tab state on the server");
          }
    
          // Update the local state after a successful API call
          setSelectedTabState(tabName.toLowerCase());
          if (tabName === "key") {
            setKeyValue(key);
          }
        } catch (error) {
          console.error("Error updating tab state:", error);
        }
      };
   return (
       <div
        className={`options-data-container layout-gap flex flex-col items-center 
                            ${
                              isInteractionDisabled || isDisabled || isBlurred
                                ? " blur-effect pointer-events-none"
                                : ""
                            }`}
      >
        <div
          className={`button-container flex flex-row  px-2 items-center justify-between bg-newgray rounded-lg shadow-xl shadow-slate-500/30`}
        ></div>

        <div className={`miscellaneous-data-container flex flex-col items-center `}>
       
             <div
            className={`miscellaneous-tabular-data   flex flex-col rounded-xl shadow-md shadow-slate-500/30 bg-white`}
          >
            <div
              className={`miscellaneous-tabular-rows  py-1  overflow-auto `}
              style={{ scrollbarWidth: "thin" }}
            >
              <table className="table-design table-fixed w-full">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[60%]" />
                </colgroup>
                <tbody className=" sticky ">
                  {loading ? (
                     <tr>
                    <td
                      colSpan="4"
                      className="w-full h-full flex flex-col justify-center items-center space-y-6 mt-20"
                    >
                      <img
                        src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                        alt="Loading..."
                        className="animate-spin w-8 h-8"
                      />
                      <p className="text-logintext font-[350] text-[13px] animate-pulse">
                        Just a moment...
                      </p>
                    </td>
                  </tr>
                  ) : (
                    <tr className="mt-4">
                      <td
                        className="w-[40%] h-10  font-light   text-xs px-16 overflow-ellipsis
                       whitespace-nowrap overflow-hidden align-top"
                      >
                        <div className="mt-6">
                          {" "}
                          {/* Add top margin */}
                          Encryption Type
                        </div>
                      </td>
                      <td
                        className="w-[60%] h-30 font-light  
                      text-xs px-16 overflow-ellipsis whitespace-nowrap overflow-hidden"
                      >
                        {/* <div> */}
                        <div className="flex flex-col  ">
                          <label className="flex h-10 items-center ">
                            <input
                              type="checkbox"
                              name="encryptionType"
                              value="consistent"
                              checked={selectedTabState === "consistent"}
                              // onChange={() => handleTabClick("consistent")}
                              onChange={() => {
                                if (selectedTabState !== "consistent") {
                                  setSelectedTabState("consistent"); // Set to 'consistent'
                                  setShowDynamicOptions(false); // Hide dynamic options
                                  handleTabClick("consistent"); // API call for consistent
                                }
                              }}
                              className="mr-2 accent-purpleshade1"
                            />
                            <span className="text-xs font-normal">
                              Consistent
                            </span>
                          </label>
                          <div className="flex flex-col h-20 ">
                            <label>
                              <input
                                type="checkbox"
                                name="encryptionType"
                                value="dynamic"
                                checked={showDynamicOptions} // Reflects the dynamic option state
                                onChange={() => {
                                  const isChecked = !showDynamicOptions;
                                  setShowDynamicOptions(isChecked); // Toggle visibility
                                  if (isChecked) {
                                    setDynamicOption("dynamic"); // Automatically select 'Default' radio button
                                    handleTabClick("dynamic"); // Call API with dynamic tab
                                  }
                                }}
                                className="mr-2 accent-purpleshade1"
                              />
                              <span className="text-xs font-normal">
                                Dynamic
                              </span>
                            </label>

                            {/* <div className="flex dynamic-flex gap-4"> */}
                            {showDynamicOptions && (
                              <div className="flex flex-row h-10 ml-4 w-full  items-center  gap-4 ">
                                {/* Default Radio Button */}
                                <label className="flex items-center ">
                                  <input
                                    type="radio"
                                    // name="dynamicOption"
                                    // value="default"
                                    name="encryptionType"
                                    value="dynamic"
                                    checked={dynamicOption === "dynamic"}
                                    onChange={() => {
                                      setDynamicOption("dynamic"); // Update UI state
                                      handleTabClick("dynamic"); // Call API to update server
                                      setKeyValue("");
                                    }}
                                    className="mr-2 accent-purpleshade1"
                                  />
                                  <span className="text-xs font-normal">
                                    Default
                                  </span>
                                </label>

                                {/* Key Radio Button */}
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="dynamicOption"
                                    value="key"
                                    checked={dynamicOption === "key"}
                                    onChange={() => {
                                      setDynamicOption("key"); // Show input field
                                    }}
                                    className="mr-2 accent-purpleshade1"
                                  />
                                  <span className="text-xs font-normal">
                                    Key
                                  </span>
                                </label>

                                {/* Key Input Field */}
                                {dynamicOption === "key" && (
                                  <input
                                    type="text"
                                    placeholder="Enter Key"
                                    value={keyValue}
                                    onChange={(e) => {
                                      const newKey = e.target.value;
                                      setKeyValue(newKey);
                                      handleTabClick("key", newKey); // Pass the key to handleTabClick
                                    }}
                                    // onChange={(e) =>
                                    //   setKeyValue(e.target.value)
                                    // } // Update key value in state
                                    // onBlur={() =>
                                    //   handleTabClick("key", keyValue)
                                    // } // Update backend on blur
                                    className=" p-2 border rounded text-[11px] w-64
                                    font-light text-black px-3 overflow-ellipsis whitespace-nowrap overflow-hidden"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    );
}

export default Miscellaneous