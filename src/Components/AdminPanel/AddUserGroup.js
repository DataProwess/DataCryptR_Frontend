import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { API_URL } from "../ApiConfig";
import { secureApiCall } from "../csrfUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleRight, faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import "./modal.css";

const AddUserGroup = ({
  isOpen,
  setIsAddUserGroup,
  closeModal,
  showPreview = true,
  inputValue1,
  handleModalInputChange1,
  inputValue2,
  setIsModalOpen,
  handleModalInputChange2,
  availableItems,
  chosenItems,
  selectedItems,
  handleItemClick,
  handleChooseAll,
  handleRemoveAll,
  handleMoveToRight,
  handleAddMoveToLeft,
  handleUserGroupSave,
  isSaveDisabled,
  tooltipMessage,
}) => {

  
   
  // 3. EARLY RETURN PLACED AFTER ALL HOOKS
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      // onRequestClose={closeModal}
      contentLabel="User Group Modal"
      // Backdrop / Overlay Setup
      overlayClassName="fixed inset-0 z-[9999] bg-black/40 flex justify-center items-center backdrop-blur-sm"
      // Modal Box Setup (p-0 allows header color to fill corners correctly)
      className="bg-[#F0F4FB] rounded-xl shadow-2xl border border-gray-200 
                  overflow-y-auto outline-none flex 
                 p-0 relative z-[10000] scrollbar-thin justify-center items-center "
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#a0a0a0 #f0f0f0",
      }}
    >
      {showPreview ? (
        <div className="admin-data">
        <div
                className="userGroup-modal flex flex-col items-center">
                <div
                  className="input-container bg-purpleshade1  flex flex-row justufy-between items-center">
                  <div
                    className="newfeild-container  flex flex-row justify-between items-center px-3">
                    <h2 className="font-[400] text-white text-xs">Add UserGroup</h2>
                    <div className="flex flex-row items-center space-x-5 ">
                      <label className="text-xs text-white">Name</label>
        
                      <input
                        className="outline-none p-1 font-base text-xs rounded-sm  input-feild"
                        type="text"
                        name="name"
                        value={inputValue1}
                        onChange={handleModalInputChange1}
                        autoFocus="cursor"
                        autoComplete="off"
                      />
                      {/* {input1Error && <div className="error-message">{input1Error}</div>} */}
                      <button
                        className=" text-2xl font-semibold text-white "
                        // onClick={closePreviewModal}
                        onClick={()=>setIsModalOpen(false)}
                      >
                        &times;
                      </button>
                      {/**/}
                    </div>
                  </div>
                </div>
                <div
                  className=" permission-lable flex flex-row justify-between items-center  px-10"
                
                >
                  <h1 className=" font-[400] text-xs ">Permissions</h1>
                  {/* <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: "14px" }} /> */}
                </div>
        
                <div
                  className="permission-container  flex flex-col justify-between items-center px-3 mt-2"
                  // style={{
                  //   width: `${permissionsContainerWidth}px`,
                  //   height: `${permissionContainerHeight}px`,
                  // }}
                >
                  <div
                    className="flex flex-col space-y-2">
                    <div
                      className="flex flex-row items-center justify-evenly space-x-6 ">
                      <div className="flex flex-col">
                        <div>
                          <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-lg bg-purpleshade1 ">
                            <h1 className=" p-1 text-white text-xs">
                              Available Permission
                            </h1>
                          </div>
                          <div
                            className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                            style={{ scrollbarWidth: "thin" }}
                          >
                            {availableItems.map((item, index) => (
                              <div
                                className="flex flex-col space-y-3 font-light py-0.5 text-xs "
                                key={index}
                                onClick={(event) => handleItemClick(item, event)}
                                style={{
                                  cursor: "pointer",
        
                                  background: selectedItems.includes(item)
                                    ? "#E5E9F2"
                                    : "transparent",
                                }}
                              >
                                {item.description}
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* <button
                        className="w-28 h-6  rounded  cursor-pointe mt-4 font-semibold text-xs bg-gray text-black"
                        onClick={handleChooseAll}
                      >
                        Choose All
                      </button>{" "} */}
                        <div className="flex justify-end w-68 items-center h-8  ">
                          <button
                            className="w-28 h-6  rounded  cursor-pointer mt-1 font-medium text-xs bg-white text-black"
                            onClick={handleChooseAll}
                          >
                            Choose All
                          </button>{" "}
                        </div>
                      </div>
                      <div className="flex flex-col h-80 w-5  space-y-4 items-center justify-center ">
                        <button className="arrow-buttons" onClick={handleMoveToRight}>
                          <FontAwesomeIcon icon={faCircleRight} size="lg" />
                        </button>
                        <button className="arrow-buttons" onClick={handleAddMoveToLeft}>
                          <FontAwesomeIcon icon={faCircleLeft} size="lg" />
                        </button>
                      </div>
                      <div className="flex flex-col  ">
                        <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-md bg-purpleshade1 text-white ">
                          <h1 className=" p-1 text-white text-xs">Chosen Permission</h1>
                        </div>
                        <div
                          className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          {chosenItems &&
                            Array.isArray(chosenItems) &&
                            chosenItems.map((item, index) => (
                              <div
                                className="flex flex-col space-y-3 font-light p-0.5 text-xs "
                                key={index}
                                onClick={(event) => handleItemClick(item, event)}
                                style={{
                                  cursor: "pointer",
                                  background: selectedItems.includes(item)
                                    ? "#E5E9F2"
                                    : "transparent",
                                }}
                              >
                                {item.description}
                              </div>
                            ))}
                        </div>
                        <div className="w-68 h-9 justify-end flex">
                          <button
                            className="w-28 h-6  rounded  cursor-pointer mt-1 font-medium text-xs bg-white text-black"
                            onClick={handleRemoveAll}
                          >
                            Remove All
                          </button>
                        </div>
                      </div>
                    </div>
                    <hr className="w-[98%]  bg-[#C0C0C0]  ml-2" />
                  </div>
                </div>
        
                <div
                  className="authentication-container  flex flex-col space-y-2"
                  // style={{
                  //   width: `${authContainerWidth}px`,
                  //   height: `${authContainerHeight}px`,
                  // }}
                >
                  <h2 className="font-normal text-sm   px-8">SAML Authentication</h2>
                  <div className="flex flex-row space-x-5 mt-3  px-8">
                    <label className="text-xs">Azure Group</label>
                    <div>:</div>
                    <input
                      className="border border-[#D9DADF] outline-none p-1 font-light text-xs 
                        w-[80%]  pt-2 text-justify  pb-2 h-8 overflow-ellipsis cursor-default"
                      type="text"
                      name="name"
                      value={inputValue2}
                      onChange={(e) => handleModalInputChange2(e)}
                      textarea={true}
                    />
                  </div>
                </div>
                <div className="save-button-wrapper flex justify-end mt-3  mr-4">
                  <button
                    className={`save-button items-end rounded-lg cursor-pointer font-semibold text-xs bg-purpleshade1 text-white
                       save-button ${isSaveDisabled ? "disabled" : ""}`}
                    onClick={handleUserGroupSave} // Ensure handleSave is bound here
                    // onClick={handleAddSaveClick}
                    disabled={isSaveDisabled} // Disable button based on form validation
                    // title={isSaveDisabled ? 'Name required' : ''}
                    title={isSaveDisabled ? tooltipMessage : ""}
                  >
                    Save
                  </button>
                </div>
              </div>
              </div>
        // <div className="flex flex-col w-full h-full justify-between pb-4">
          
        //   {/* --- HEADER BAR --- */}
        //   <div className="bg-purpleshade1 flex flex-row justify-between items-center px-6 py-3 rounded-t-xl">
        //     <h2 className="font-normal text-white text-xs">Add UserGroup</h2>
        //     <div className="flex flex-row items-center space-x-3">
        //       <label className="text-xs text-white">Name</label>
        //       <input
        //         className="outline-none p-1 font-base text-xs rounded-sm h-6 text-black"
        //         type="text"
        //         name="name"
        //         value={inputValue1}
        //         onChange={handleModalInputChange1}
        //         autoFocus
        //         autoComplete="off"
        //       />
        //       <button
        //         className="text-xl font-semibold text-white leading-none hover:opacity-80 ml-2 cursor-pointer"
        //         // onClick={closeModal}
        //         onClick={()=>setIsModalOpen(false)}
        //       >
        //         &times;
        //       </button>
        //     </div>
        //   </div>

        //   {/* --- SECTION TITLE --- */}
        //   <div className="px-6 pt-3 pb-1">
        //     <h1 className="font-normal text-xs text-gray-700">Permissions</h1>
        //   </div>

        //   {/* --- PERMISSIONS DUAL LISTBOX AREA --- */}
        //   <div className="flex-1 flex flex-col items-center px-6">
        //     <div className="flex flex-row items-center justify-center space-x-6 w-full py-2">
              
        //       {/* Available Permissions Box */}
        //       <div className="flex flex-col">
        //         <div className="flex flex-row w-64 items-center justify-center h-8 rounded-t-lg bg-purpleshade1">
        //           <h1 className="p-1 text-white text-xs">Available Permission</h1>
        //         </div>
        //         <div
        //           className="p-3 w-64 h-48 bg-white flex flex-col overflow-y-auto border border-[#C0C0C0] rounded-b-md"
        //           style={{ scrollbarWidth: "thin" }}
        //         >
        //           {/* {availableItems.map((item, index) => ( */}
        //            {availableItems.map((item, index) => (
        //             <div
        //               className="flex flex-col space-y-3 font-light py-0.5 text-xs select-none"
        //               key={index}
        //               onClick={(event) => handleItemClick && handleItemClick(item, event)}
        //               style={{
        //                 cursor: "pointer",
        //                 background: selectedItems.includes(item) ? "#E5E9F2" : "transparent",
        //               }}
        //             >
        //               {item.description || item.name || item}
        //             </div>
        //           ))}
        //         </div>
        //         <div className="flex justify-end w-64 items-center h-8">
        //           <button
        //             className="w-24 h-6 rounded cursor-pointer mt-1 font-medium text-xs bg-white text-black border border-gray-300 hover:bg-gray-50"
        //             onClick={handleChooseAll}
        //           >
        //             Choose All
        //           </button>
        //         </div>
        //       </div>

        //       {/* Transfer Arrow Buttons */}
        //       <div className="flex flex-col space-y-4 items-center justify-center">
        //         <button 
        //           className="arrow-buttons text-purpleshade1 hover:scale-110 transition-transform cursor-pointer" 
        //           onClick={handleMoveToRight}
        //         >
        //           <FontAwesomeIcon icon={faCircleRight} size="lg" />
        //         </button>
        //         <button 
        //           className="arrow-buttons text-purpleshade1 hover:scale-110 transition-transform cursor-pointer" 
        //           onClick={handleAddMoveToLeft}
        //         >
        //           <FontAwesomeIcon icon={faCircleLeft} size="lg" />
        //         </button>
        //       </div>

        //       {/* Chosen Permissions Box */}
        //       <div className="flex flex-col">
        //         <div className="flex flex-row w-64 items-center justify-center h-8 rounded-t-md bg-purpleshade1 text-white">
        //           <h1 className="p-1 text-white text-xs">Chosen Permission</h1>
        //         </div>
        //         <div
        //           className="p-3 w-64 h-48 bg-white flex flex-col overflow-y-auto border border-[#C0C0C0] rounded-b-md"
        //           style={{ scrollbarWidth: "thin" }}
        //         >
        //           {chosenItems &&
        //             Array.isArray(chosenItems) &&
        //             chosenItems.map((item, index) => (
        //               <div
        //                 className="flex flex-col space-y-3 font-light p-0.5 text-xs select-none"
        //                 key={index}
        //                 onClick={(event) => handleItemClick && handleItemClick(item, event)}
        //                 style={{
        //                   cursor: "pointer",
        //                   background: selectedItems.includes(item) ? "#E5E9F2" : "transparent",
        //                 }}
        //               >
        //                 {item.description || item.name || item}
        //               </div>
        //             ))}
        //         </div>
        //         <div className="flex justify-end w-64 items-center h-8">
        //           <button
        //             className="w-24 h-6 rounded cursor-pointer mt-1 font-medium text-xs bg-white text-black border border-gray-300 hover:bg-gray-50"
        //             onClick={handleRemoveAll}
        //           >
        //             Remove All
        //           </button>
        //         </div>
        //       </div>
        //     </div>

        //     <hr className="w-full bg-[#C0C0C0] my-3" />
        //   </div>

        //   {/* --- AUTHENTICATION SECTION --- */}
        //   <div className="flex flex-col space-y-2 px-6">
        //     <h2 className="font-normal text-sm text-gray-800">SAML Authentication</h2>
        //     <div className="flex flex-row items-center space-x-3">
        //       <label className="text-xs min-w-[80px]">Azure Group</label>
        //       <span>:</span>
        //       <input
        //         className="border border-[#D9DADF] outline-none p-2 font-light text-xs w-full h-8 rounded-sm bg-white"
        //         type="text"
        //         name="name"
        //         value={inputValue2}
        //         onChange={handleModalInputChange2}
        //       />
        //     </div>
        //   </div>

        //   {/* --- FOOTER ACTION BUTTONS --- */}
        //   <div className="w-full flex justify-end px-6 mt-4">
        //     <button
        //       className={`w-20 h-7 rounded-lg font-semibold text-xs bg-purpleshade1 text-white save-button ${
        //         isSaveDisabled 
        //           ? "opacity-50 cursor-not-allowed" 
        //           : "cursor-pointer hover:opacity-90"
        //       }`}
        //       onClick={handleUserGroupSave}
        //       disabled={isSaveDisabled}
        //       title={isSaveDisabled ? tooltipMessage : ""}
        //     >
        //       Save
        //     </button>
        //   </div>

        // </div>
        
      ) : (
        /* Fallback if showPreview is false */
        <div className="w-full h-64 flex items-center justify-center text-gray-500">
          <p>No preview available</p>
        </div>
      )}
    </Modal>
  );
};

export default AddUserGroup;
