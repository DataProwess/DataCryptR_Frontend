import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { API_URL } from "../ApiConfig";
import { secureApiCall } from "../csrfUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleRight, faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import "./modal.css";

const EditUserGroup = ({
  isOpen,
  setIsAddUserGroup,
  setIsEditUserGroup,
  editedUserGroup,
  dcgroups,
  setDcGroups,
  loading,
  isEditing,
  closeModal,
  showPreview = true,
  inputValue1,
  handleModalInputChange1,
  handleEditModalInputChange,
  dcgroupsState,
  setDcgroupsState,
  handleEditDcGroupsChange,
  inputValue2,
  editUserInput,
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
  handleMoveToLeft,
  handleEditRemoveAll,
}) => {
  let item = {};

  // Convert chosenItems safely to array
  const chosenList = Array.isArray(chosenItems)
    ? chosenItems
    : Array.from(chosenItems || []);

  // Filter out any item that is already in chosenList (Chosen Permissions)
  const unselectedAvailableItems = availableItems.filter(
    (availItem) => !chosenList.some((chosen) => chosen.id === availItem.id),
  );

  if (!editedUserGroup) {
    return;
    // <div>Error: No user group data available</div>;
  }

  // eslint-disable-next-line
  const filteredItems = isEditing
    ? availableItems.filter(
        (item) => !editedUserGroup.roles.some((role) => role.id === item.id),
      )
    : availableItems;

  // eslint-disable-next-line
  const items = Array.isArray(chosenItems) ? chosenItems : [];

  // 3. EARLY RETURN PLACED AFTER ALL HOOKS
  if (!isOpen) return null;
  console.log(editUserInput);

  return (
    <Modal
      isOpen={isOpen}
      // onRequestClose={closeModal}
      contentLabel="User Group Modal"
      // Backdrop / Overlay Setup
      overlayClassName="fixed inset-0 z-[9999] flex justify-center items-center "
      // Modal Box Setup (p-0 allows header color to fill corners correctly)
      className="bg-[#F0F4FB] rounded-xl shadow-2xl border border-gray-200 
                  overflow-y-auto outline-none flex 
                 p-0 relative z-[10000] scrollbar-thin justify-center items-center "
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#a0a0a0 #f0f0f0",
      }}
    >
      {/* {showPreview ? ( */}
      {editedUserGroup ? (
        <div className="admin-data">
          {/* {loading ? (
          <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-6 mt-10">
            <img
              src={process.env.PUBLIC_URL + "/loadergif.gif"}
              alt="logo"
              className="animate-spin w-4 h-4"
            />
            <p className="text-logintext font-[350] text-[13px] animate-pulse">
              Just a moment...
            </p>
          </div>
        ) : ( */}

          <div className="userGroup-modal flex flex-col items-center">
            <div className="input-container bg-purpleshade1  flex flex-row justufy-between items-center">
              <div className="newfeild-container  flex flex-row justify-between items-center px-3">
                <h2 className="font-[400] text-white text-xs">
                  Edit UserGroup
                </h2>
                <div className="flex flex-row items-center space-x-5 ">
                  <label className="text-xs text-white">Name</label>

                  <input
                    className="outline-none p-1 font-light text-xs rounded-sm h-6"
                    type="text"
                    name="name"
                    value={editUserInput}
                    onChange={handleEditModalInputChange}
                    title={isSaveDisabled ? "Name required" : ""}
                  />
                  {/* {input1Error && <div className="error-message">{input1Error}</div>} */}
                  <button
                    className=" text-2xl font-semibold text-white "
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                  {/**/}
                </div>
              </div>
            </div>
            <div className=" permission-lable flex flex-row justify-between items-center  px-10">
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
              <div className="permission-data flex flex-col space-y-2">
                <div className="flex flex-row items-center justify-evenly space-x-6 ">
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
                        {/* {isEditing
                              ? availableItems
                                  .filter(
                                    (item) =>
                                      !editedUserGroup.roles.some(
                                        (role) => role.id === item.id
                                      )
                                  )
                                  .map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-col space-y-3 font-light text-xs p-0.5 "
                                      onClick={(event) =>
                                        handleItemClick(item, event)
                                      }
                                      style={{
                                        cursor: "pointer",
                                        // background: selectedItems.includes(item)
                                        //   ? "lightblue"
                                        //   : "transparent",
                                        background: selectedItems.includes(item)
                                          ? "#E5E9F2"
                                          : "transparent",
                                      }}
                                    >
                                      {item.description}
                                    </div>
                                  ))
                              : availableItems.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col space-y-3 font-light text-xs p-0.5 "
                                    id={`available-${item.id}`}
                                    onClick={(event) =>
                                      handleItemClick(item, event)
                                    }
                                    style={{
                                      cursor: "pointer",
                                      // background: selectedItems.includes(item)
                                      //   ? "lightblue"
                                      //   : "transparent",
                                      background: selectedItems.includes(item)
                                        ? "#DCD9FF"
                                        : "transparent",
                                    }}
                                  >
                                    {item.description}
                                  </div>
                                ))} */}
                        {unselectedAvailableItems.map((item, index) => {
                          const isSelected = selectedItems.some(
                            (s) => s.id === item.id,
                          );
                          return (
                            <div
                              key={item.id || index}
                              className="flex flex-col space-y-3 font-light text-xs p-0.5"
                              onClick={(event) => handleItemClick(item, event)}
                              style={{
                                cursor: "pointer",
                                background: isSelected
                                  ? "#DCD9FF"
                                  : "transparent",
                              }}
                            >
                              {item.description || item.name}
                            </div>
                          );
                        })}
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
                    <button
                      className="arrow-buttons"
                      onClick={handleMoveToRight}
                    >
                      <FontAwesomeIcon icon={faCircleRight} size="lg" />
                    </button>
                    <button
                      className="arrow-buttons"
                      onClick={handleMoveToLeft}
                    >
                      <FontAwesomeIcon icon={faCircleLeft} size="lg" />
                    </button>
                  </div>
                  <div className="flex flex-col  ">
                    <div className="flex flex-row w-64 space-x-1 items-center justify-center h-8 rounded-t-md bg-purpleshade1 text-white ">
                      <h1 className=" p-1 text-white text-xs">
                        Chosen Permission
                      </h1>
                    </div>
                    <div
                      className="p-3 w-64 h-[220px] bg-white flex flex-col overflow-y-auto overflow-x-auto border border-[#C0C0C0] rounded-b-md"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {[...chosenItems].map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col space-y-3 font-light p-0.5 text-xs "
                          onClick={(event) => handleItemClick(item, event)}
                          style={{
                            cursor: "pointer",
                            background: selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id,
                            )
                              ? "#E5E9F2"
                              : "transparent",
                            // background: selectedItems.includes(item) ? "gray" : "transparent",
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                    <div className="w-68 h-9 justify-end flex">
                      <button
                        className="w-28 h-6  rounded  cursor-pointer mt-1 font-medium text-xs bg-white text-black"
                        onClick={handleEditRemoveAll}
                      >
                        Remove All
                      </button>
                    </div>
                  </div>
                </div>
                <hr className="w-[98%]  bg-[#C0C0C0]  ml-2" />
              </div>
            </div>

            <div className="authentication-container  flex flex-col space-y-2">
              <h2 className="font-normal text-sm px-8">SAML Authentication</h2>

              {Array.isArray(dcgroupsState) && dcgroupsState.length > 0 ? (
                dcgroupsState.map((groupId, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-center space-x-5 px-8"
                  >
                    <label className="text-xs">Azure Group</label>
                    <div>:</div>
                    <input
                      className="border w-[80%] border-lightgray-100 outline-none p-1 font-light text-xs"
                      type="text"
                      name={`dcgroups-${index}`}
                      value={groupId || ""}
                      onChange={(e) =>
                        handleEditDcGroupsChange(index, e.target.value)
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-row items-center space-x-5 px-8">
                  <label className="text-xs">Azure Group</label>
                  <div>:</div>
                  <input
                    className="border w-[80%] border-lightgray-100 outline-none p-1 font-light text-xs"
                    type="text"
                    name="dcgroups"
                    value={dcgroupsState?.[0] || ""}
                    onChange={(e) =>
                      handleEditDcGroupsChange(0, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
            <div className="save-button-wrapper flex justify-end mt-3  mr-4">
              <button
                className={`w-20 h-6 items-end rounded-lg cursor-pointer font-semibold text-xs bg-purpleshade1 text-white
                    save-button ${isSaveDisabled ? "disabled" : ""}`}
                onClick={handleUserGroupSave} // Ensure handleSave is bound here
                // title={isSaveDisabled ? 'Name required' : ''}
                title={isSaveDisabled ? tooltipMessage : ""}
              >
                Save
              </button>
            </div>
          </div>

          {/* )} */}
        </div>
      ) : (
        /* Fallback if showPreview is false */
        <div className="w-full h-64 flex items-center justify-center text-gray-500">
          <p>No preview available</p>
        </div>
      )}
    </Modal>
  );
};

export default EditUserGroup;
