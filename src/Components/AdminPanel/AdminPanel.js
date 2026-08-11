import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import authService from "../auth";
import NewFieldPopup from "../NewField";
import AlertNewFieldPopup from "../AlertNewFieldPopup";
// import "./scroll.css";
import Jsontimezones from "../TimeZones";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { faCircleRight, faCircleLeft } from "@fortawesome/free-solid-svg-icons";
// import Navbar from "./Navbar";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
// import Sidebar from "./Sidebar";
import { API_URL } from "../ApiConfig";
import EditUserModal from "../EditUserModal";
import AddUserGroupModal from "../AddUserGroupModal";
import NewFileShareModal from "../NewFileShareModal";
import TimezoneModal from "../TimeZoneModal";
import NewGlobalField from "../NewGlobalField";
import { toast } from "react-toastify";
import Chatbot from "../Chatbot";
import ProfileModal from "../ProfileModal";
import ErrorPopup from "../ErrorPopup";
import debounce from "lodash/debounce";
// import "./admin.css";
import AddMaskingConfig from "../AddMaskingConfig";
import {
  secureApiCall,
  apiRequest,
  getCSRFToken,
  getAuthToken,
  fetchAndStoreCSRFToken,
} from "../csrfUtils";
import { useUI } from "../Context/UIContext";
import { useAuth } from "../AuthContext";
import { Options_Config } from "./OptionsConfig";
import OptionsItems from "./OptionsItems";
import S3Accounts from "./S3Accounts";
import GCPAccounts from "./GCPAccounts";
import "./admin.css";
import StorageContainers from "./StorageContainers";
import FileShareData from "./FileShareData";
import GlobalColumnConfig from "./GlobalColumnConfig";
import PermanenetMasking from "./PermanenetMasking";
import Alert from "./Alert";
import Miscellaneous from "./Miscellaneous";
import AddUserGroup from "./AddUserGroup";
import EditUserGroup from "./EditUserGroup";

const AdminPanel = () => {
  const { token, permissions, csrfToken, userEmail, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userGroupsData, setUserGroupsData] = useState([]);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserGroupDeletion, setSelectionUserGroupDeletion] =
    useState(null);
  const [editedUserGroup, setEditedUserGroup] = useState({
    name: "",
    description: "",
    dcgroups_id: [],
    roles: [],
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [dataType, setDataType] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  const {
    isTimezoneModalOpen,
    showProfileModal,
    setIsTimezoneModalOpen,
    setShowProfileModal,
    showChatbot,
    setShowChatbot,
    isDisabled,
    isBlurred,
  } = useUI();
  const [selectedOption, setSelectedOption] = useState("User Group");
  const [userGroupName, setUserGroupName] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [dcGroups, setDcGroups] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("");
  const [input1Error, setInput1Error] = useState("");
  const [dcgroupsState, setDcgroupsState] = useState([]);
  const [editUserInput, setEditUserInput] = useState(
    editedUserGroup.name || "",
  );
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [dynamicGroupValues, setDynamicGroupValues] = useState([]);
  const [isAddUserGroup, setIsAddUserGroup] = useState(false);
  const [chosenItems, setChosenItems] = useState([]);
  const [hasNameChanged, setHasNameChanged] = useState(false);
  const [selectedFileShareForDeletion, setSelectedFileShareForDeletion] =
    useState(null);
  const [texinputValue, setTextInputValue] = useState("");

  const closePreviewModal = () => {
    document.body.style.overflow = "visible";
    // setIsAlertNewFieldVisible(false);
    // setIsAddMaskingConfigOpen(false);
    setSelectedItems([]);
    // setNewFieldIsMasked(false);
    // setNewFilePath(null);
    // setIsPopupOpen(false);
    setIsModalOpen(false);
    // setIsChecked(false);
    setShowPreview(false);
    setDataType(null);
    setIsEditUserModalOpen(false);
    setIsAddUserGroup(false);
    // setIsStorageContainerModal(false);
    // setIsFileShareModal(false);
    // setIsMiscellaneousModal(false);
    // setIsGlobalColumnModal(false);
    // setisNewFieldVisibleStorage(false);
    // setIsTimezoneModalOpen(false);
    // setisNewFieldVisible(false);
    setInputValue1(null);
    setInputValue2(null);
    // setNewFieldName(null);
    // setEmail(null);
    // setNewFilePattern(null);
    // setIsAlertNewFieldVisible(false);
    // setNewFileShareFieldName(null);
    // setisNewFieldVisibleFileShare(false);
    setInput1Error(null);
    setEditUserInput(editedUserGroup.name || "");
    setChosenItems(new Set());
  };

  // 2. HELPER FUNCTIONS & EVENT HANDLERS
  const handleModalInputChange1 = (e) => {
    setInputValue1(e.target.value);
  };

  const handleModalInputChange2 = (e) => {
    setInputValue2(e.target.value);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (
      option === "User Group" ||
      option === "Storage Container" ||
      option === "File Share" ||
      option === "S3 Storage" ||
      option === "GCP" ||
      option === "Global Column Config" ||
      option === "Permanent Masking" ||
      option === "Alert"
    ) {
      //  setIsModalOpen(false);
      //  setIsAddUserGroup(false);
      //  setIsEditUserModalOpen(false);
      //  setSelectionUserGroupDeletion(false);
    }
  };

  const fetchData = async (token, csrfToken) => {
    try {
      console.log("Fetching user groups...");
      const userGroupsData = await secureApiCall(
        `${API_URL}/api/core/blob-groups/`,
        "GET",
      );

      const existingUserGroupNames = userGroupsData.map((group) =>
        group.name.toLowerCase(),
      );

      setUserGroupsData(userGroupsData);
      setUserGroupName(existingUserGroupNames);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log userGroupName whenever it changes
  }, [userGroupName]);

  useEffect(() => {
    if (selectedOption === "User Group") {
      fetchData();
    }
  }, [selectedOption]);
  const handleChatbotIconClick = () => {
    setShowChatbot(!showChatbot); // Toggle the showChatbot state
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    // setSelectedNavbarOption(null);
    // setIsPopupOpen(false);
  };

  //   const isInteractionDisabled = showChatbot;
  // const handleModalInputChange1 = (e) => {
  //     setInputValue1(e.target.value);
  //   };

  // const handleModalInputChange2 = (e) => {
  //   setInputValue2(e.target.value);
  // };

  // const handleChooseAll = () => {
  //   setChosenItems((prevChosen) => [...prevChosen, ...availableItems]);
  //   setAvailableItems([]);
  //   setSelectedItems([]);
  // };

  // const handleRemoveAll = () => {
  //   setAvailableItems((prevAvailable) => [...prevAvailable, ...chosenItems]);
  //   setChosenItems([]);
  //   setSelectedItems([]);
  // };

  // const handleAddMoveToLeft = () => {
  //   setAvailableItems((prevAvailable) => [...prevAvailable, ...selectedItems]);
  //   setChosenItems((prevChosen) =>
  //     prevChosen.filter((item) => !selectedItems.includes(item))
  //   );
  //   setSelectedItems([]);
  // };

  // const handleMoveToRight = () => {
  //   if (selectedItems.length > 0) {
  //     setChosenItems((prevChosen) => {
  //       const updatedChosenItems = [...prevChosen, ...selectedItems];
  //       return Array.from(new Set(updatedChosenItems));
  //     });

  //     setAvailableItems((prevAvailable) =>
  //       prevAvailable.filter((item) => !selectedItems.includes(item))
  //     );

  //     setSelectedItems([]);
  //   }
  // };

  // Called when "Add New Field" is clicked
  // const handleListUsergroups = () => {
  //   setIsModalOpen(true);
  //   setIsEditing(false);
  //   setShowPreview(true);

  //   fetch(`${API_URL}/api/core/blob-groups/`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //       "X-CSRFToken": csrfToken,
  //     },
  //     credentials: "include",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data) {
  //         setAvailableItems(Array.isArray(data) ? data : []);
  //         setModalVisible(true);
  //         document.body.style.overflow = "hidden";
  //         setDataType("AddUser");
  //       } else {
  //         console.error("No data received from API for Preview.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching API data:", error);
  //     });
  // };

  // const handleItemClick = (item, event) => {
  //   const isCtrlPressed = event.ctrlKey || event.metaKey;

  //   setSelectedItems((prevSelectedItems) => {
  //     if (isCtrlPressed) {
  //       if (prevSelectedItems.includes(item)) {
  //         return prevSelectedItems.filter(
  //           (selectedItem) => selectedItem !== item
  //         );
  //       } else {
  //         return [...prevSelectedItems, item];
  //       }
  //     } else {
  //       return [item];
  //     }
  //   });
  // };

  useEffect(() => {
    const chosenItemsArray = Array.from(chosenItems);

    // Filter availableItems to include only those that are not in chosenItems
    const filtered = availableItems.filter(
      (item) => !chosenItemsArray.some((chosen) => chosen.id === item.id),
    );

    setFilteredItems(filtered);
  }, [chosenItems, availableItems]);

  useEffect(() => {
    if (editedUserGroup && Array.isArray(editedUserGroup.roles)) {
      setChosenItems(new Set(editedUserGroup.roles));
    }
  }, [editedUserGroup]);

  useEffect(() => {}, [filteredItems]);

  useEffect(() => {
    if (editedUserGroup.dcgroups_id) {
      setDynamicGroupValues([...editedUserGroup.dcgroups_id]);
    }
  }, [editedUserGroup.dcgroups_id]);

  // const validateForm = () => {
  //   const isValidInputValue1 =
  //     typeof inputValue1 === "string" && inputValue1.trim() !== "";
  //   const isValidEditUserInput =
  //     typeof editUserInput === "string" && editUserInput.trim() !== "";

  //   const inputValue1Lower =
  //     typeof inputValue1 === "string" ? inputValue1.toLowerCase() : "";
  //   const isNameUnique = Array.isArray(userGroupName)
  //     ? !userGroupName.includes(inputValue1Lower)
  //     : true;

  //   const editUserInputLower =
  //     typeof editUserInput === "string" ? editUserInput.toLowerCase() : "";
  //   const isEditUserInputNameUnique = Array.isArray(userGroupName)
  //     ? !userGroupName.includes(editUserInputLower)
  //     : true;

  //   let tooltip = "";

  //   if (isEditing) {
  //     if (!hasNameChanged) {
  //       tooltip = "";
  //     } else if (!isValidEditUserInput) {
  //       tooltip = "Edit user input required";
  //     } else if (!isEditUserInputNameUnique) {
  //       tooltip = "Edit user name already exists";
  //     }
  //   } else {
  //     if (!isValidInputValue1) {
  //       tooltip = "Name required";
  //     } else if (!isNameUnique) {
  //       tooltip = "Name already exists";
  //     }
  //   }

  //   setTooltipMessage(tooltip);

  //   setIsSaveDisabled(
  //     (isEditing &&
  //       hasNameChanged &&
  //       (!isValidEditUserInput || !isEditUserInputNameUnique)) ||
  //       (!isEditing && (!isValidInputValue1 || !isNameUnique))
  //   );
  // };

  // useEffect(() => {
  //   validateForm();
  // }, [inputValue1, editUserInput, userGroupName]);

  // const handleUserGroupSave = async () => {
  //   if (isSaveDisabled) return;

  //   try {
  //     const url =
  //       editedUserGroup && editedUserGroup?.id
  //         ? `${API_URL}/api/core/blob-groups/${editedUserGroup.id}/`
  //         : `${API_URL}/api/core/blob-groups/create/`;

  //     const method = editedUserGroup && editedUserGroup?.id ? "PUT" : "POST";

  //     let dcgroupsValue =
  //       method === "POST" ? inputValue2 : dcgroupsState || [];
  //     if (!Array.isArray(dcgroupsValue)) {
  //       dcgroupsValue = [dcgroupsValue];
  //     }

  //     const selectedItemsArray = Array.isArray(selectedItems)
  //       ? selectedItems
  //       : [];
  //     const chosenItemsArray = Array.isArray(chosenItems)
  //       ? chosenItems
  //       : Array.from(chosenItems || []);

  //     const uniqueSelectedItems = Array.from(
  //       new Set([...chosenItemsArray, ...selectedItemsArray])
  //     );

  //     const data = await secureApiCall(url, method, {
  //       roles: uniqueSelectedItems,
  //       name: method === "POST" ? inputValue1 : editUserInput,
  //       description: "admin",
  //       dcgroups: dcgroupsValue.join(","),
  //     });

  //     localStorage.setItem("chosenItems", JSON.stringify(uniqueSelectedItems));

  //     setResponseMessage(data.message);
  //     fetchData();

  //     setUserGroupsData((prevState) => {
  //       const prevData = Array.isArray(prevState) ? prevState : [];
  //       if (data.data && Array.isArray(data.data)) {
  //         const editedIndex = prevData.findIndex(
  //           (group) => group.id === editedUserGroup?.id
  //         );

  //         if (editedIndex !== -1) {
  //           const updatedData = [...prevData];
  //           updatedData[editedIndex] = data.data[0];
  //           return updatedData;
  //         } else {
  //           return [...prevData, data.data[data.data.length - 1]];
  //         }
  //       } else {
  //         return prevData;
  //       }
  //     });

  //     setInputValue1("");
  //     setInputValue2("");
  //     setSelectedItems([]);
  //     setIsModalOpen(false);
  //     setChosenItems([]);
  //     setDcGroups([]);
  //     closePreviewModal();
  //     setIsEditUserModalOpen(false);
  //     setIsAddUserGroup(false);
  //   } catch (error) {
  //     console.error("Error occurred during save:", error);
  //     setResponseMessage("Error: Something went wrong.");
  //   }
  // };

  // const handleOptionClick = (option) => {
  //   setSelectedOption(option);
  // };

  // const fetchData = async () => {
  //   try {
  //     setLoading(true);
  //     const userGroups = await secureApiCall(
  //       `${API_URL}/api/core/blob-groups/`,
  //       "GET"
  //     );

  //     const existingUserGroupNames = Array.isArray(userGroups)
  //       ? userGroups.map((group) => group.name.toLowerCase())
  //       : [];

  //     setUserGroupsData(Array.isArray(userGroups) ? userGroups : []);
  //     setUserGroupName(existingUserGroupNames);
  //   } catch (error) {
  //     console.error("Fetch data error:", error);
  //     toast.error("Failed to fetch data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (selectedOption === "User Group") {
      fetchData();
    }
  }, [selectedOption]);

  // const handleChatbotIconClick = () => {
  //   setShowChatbot(!showChatbot);
  // };

  // const handleCloseChatbot = () => {
  //   setShowChatbot(false);
  //   setIsTimezoneModalOpen(false);
  //   setShowProfileModal(false);
  // };

  const handleDeleteClick = async (userGroupId) => {
    try {
      if (!token) {
        console.error("Token is not available.");
        return;
      }

      await secureApiCall(
        `${API_URL}/api/core/blob-groups/${userGroupId}/`,
        "DELETE",
      );

      // If the deletion is successful, update the state to reflect the change
      const updatedUserGroups = userGroupsData.filter(
        (group) => group.id !== userGroupId,
      );
      fetchData();
      setUserGroupsData(updatedUserGroups);
      setSelectionUserGroupDeletion(null);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred during delete:", error);
    }
  };

  const UserDeleteConfirmationPopup = ({
    //  userGroupIndex,
    context,
    onCancel,
    onConfirm,
  }) => {
    const displayName =
      context.name || context.account_name || "the selected user";

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 ml-56 mt-40">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[350px] h-[120px] flex flex-col items-center space-y-4">
          <p className="font-medium text-[11px] text-red-500">
            {/* Are You Sure You want to Delete <span className="text-black">{context.account_name}</span> ? */}
            Are you sure you want to delete{" "}
            <span className="text-red-500">{displayName}</span>?
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              className="w-20 h-7 bg-white text-black text-xs font-medium border border-black rounded-lg"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
              // onClick={() => onConfirm(userGroupIndex)}
              onClick={() => onConfirm(context)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleCancelDelete = () => {
    setSelectedFileShareForDeletion(null);
    setSelectionUserGroupDeletion(null);
  };

  const isInteractionDisabled = showChatbot;

  const handleAzureInputChange = (e) => {
    setTextInputValue(e.target.value);
  };

  const handleEditModalInputChange = (e) => {
    setEditUserInput(e.target.value);
    setHasNameChanged(true);
    validateForm();
  };

  useEffect(() => {
    setEditUserInput(editedUserGroup.name || "");
  }, [editedUserGroup.name]);

  // Function to handle changes in the input

  // Function to save the name back to `editedUserGroup` state (if needed)
  // eslint-disable-next-line
  const saveNameToUserGroup = () => {
    setEditedUserGroup((prevState) => ({
      ...prevState,
      name: editUserInput, // Update the `name` field in the main state
    }));
  };

  // eslint-disable-next-line
  const handleListUsergroups = () => {
    const promises = [
      fetch(`${API_URL}/api/core/blob-groups/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      }).then((response) => response.json()),
      // Add more fetch requests if needed
    ];

    Promise.all(promises)
      .then((data) => {
        if (data.length > 0) {
          setAvailableItems(data[0]);
          setModalVisible(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("AddUser");
          setLoading(false);
        } else {
          console.error("No data received from API for Preview.");
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  };

  const handleItemClick = (item, event) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    setSelectedItems((prevSelectedItems) => {
      if (isCtrlPressed) {
        // If Ctrl key is pressed, toggle the selection of the item
        if (prevSelectedItems.includes(item)) {
          // Item is already selected, remove it from the selection
          return prevSelectedItems.filter(
            (selectedItem) => selectedItem !== item,
          );
        } else {
          // Item is not selected, add it to the selection
          return [...prevSelectedItems, item];
        }
      } else {
        // If Ctrl key is not pressed, select only the clicked item
        return [item];
      }
    });
  };

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted.current) {
    } else {
      // Set the ref to false after the initial render
      isMounted.current = false;
    }
  }, [selectedItems]);

  // eslint-disable-next-line
  const handleChosenItemClick = (item, event) => {
    // Check if the Ctrl key is pressed
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    setChosenItems((prevChosenItems) => {
      if (isCtrlPressed) {
        // If Ctrl key is pressed, toggle the selection of the item
        if (prevChosenItems.includes(item)) {
          // Item is already selected, remove it from the selection
          return prevChosenItems.filter((chosenItem) => chosenItem !== item);
        } else {
          // Item is not selected, add it to the selection
          return [...prevChosenItems, item];
        }
      } else {
        // If Ctrl key is not pressed, select only the clicked item
        return [item];
      }
    });
  };

  let uniqueChosenItems = [];

  const handleMoveToRight = () => {
    // Check if there are selected items
    if (selectedItems.length > 0) {
      // Use a callback function for state updates to ensure the latest state
      setChosenItems((prevChosenItems) => {
        // Combine the existing and newly selected permissions
        const updatedChosenItems = [...prevChosenItems, ...selectedItems];

        // Convert the array to a Set to remove duplicates, then convert it back to an array
        uniqueChosenItems = Array.from(new Set(updatedChosenItems));

        return uniqueChosenItems;
      });

      // Use a callback function for state updates to ensure the latest state
      setAvailableItems((prevAvailableItems) => {
        // Remove the moved items from the Available Permission container
        return prevAvailableItems.filter(
          (item) => !selectedItems.includes(item),
        );
      });

      // Clear the selection
      setSelectedItems([]);
    }

    // Move console.log here
    setTimeout(() => {}, 0);
  };

  const handleUserPermissions = () => {
    const promises = [
      fetch(`${API_URL}/api/core/blob-roles/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      }).then((response) => response.json()),
      // Add more fetch requests if needed
    ];

    Promise.all(promises)
      .then((data) => {
        if (data.length > 0) {
          setAvailableItems(data[0]);
          // setSelectedData(data[0]);
          setChosenItems(new Set());
          setModalVisible(true);
          setIsAddUserGroup(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("AddUser");
          setLoading(false);
        } else {
          console.error("No data received from API for Preview.");
        }
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  };

  useEffect(() => {
    setChosenItems([]);

    setIsAddUserGroup(true);
  }, []);

  useEffect(() => {
    console.log(availableItems, "availableItems");
  }, [availableItems]);

  useEffect(() => {
    console.log(chosenItems, "chosenItems");
  }, [chosenItems]);

  // useEffect(() => {
  //   // Fetch available permissions when the component mounts
  //   handleUserPermissions();

  //   // eslint-disable-next-line
  // }, []);

  const handleMoveToLeft = () => {
    // setAvailableItems([...availableItems, ...selectedItems]);
    // setChosenItems(chosenItems.filter((item) => !selectedItems.includes(item)));
    // setSelectedItems([]);

    if (selectedItems.length > 0) {
      // Update editedUserGroup with the selected items removed from roles
      setEditedUserGroup((prevEditedUserGroup) => {
        const prevRoles = Array.isArray(prevEditedUserGroup?.roles)
          ? prevEditedUserGroup.roles
          : [];

        // Filter out only selected items from roles
        const updatedRoles = prevRoles.filter(
          (role) =>
            !selectedItems.some((selectedItem) => selectedItem.id === role.id),
        );

        return {
          ...prevEditedUserGroup,
          roles: updatedRoles,
        };
      });

      // Add the selected items back to the available items list
      setAvailableItems((prevAvailableItems) => {
        // Ensure the selected items are not already in the available list
        const filteredAvailableItems = prevAvailableItems.filter(
          (item) =>
            !selectedItems.some((selectedItem) => selectedItem.id === item.id),
        );

        const updatedAvailableItems = [
          ...filteredAvailableItems,
          ...selectedItems,
        ];

        // Remove duplicates
        const uniqueAvailableItems = Array.from(
          new Set(updatedAvailableItems.map((item) => item.id)),
        ).map((id) => updatedAvailableItems.find((item) => item.id === id));

        return uniqueAvailableItems;
      });

      // Update chosenItems by removing only the selected items
      setChosenItems((prevChosenItems) => {
        const currentChosenItems = Array.isArray(prevChosenItems)
          ? prevChosenItems
          : [];

        // Filter out selected items from the chosen list
        const updatedChosenItems = currentChosenItems.filter(
          (item) =>
            !selectedItems.some((selectedItem) => selectedItem.id === item.id),
        );

        return updatedChosenItems;
      });

      // Clear the selection after moving the items
      setSelectedItems([]);
    }

    setTimeout(() => {}, 0);
  };

  // eslint-disable-next-line
  const handleDcGroupsChange = (index, value) => {
    setUserGroupsData((prevUserGroupsData) => {
      const updatedUserGroupsData = [...prevUserGroupsData];
      updatedUserGroupsData[index].dcgroups = value;
      return updatedUserGroupsData;
    });
  };

  const handleClick = (groupId) => {
    // Check if groupId is defined before calling handleEditUserPermissions
    if (groupId) {
      handleEditUserPermissions(groupId);
    } else {
      // console.error("Invalid groupId:", groupId);
    }
  };

  useEffect(() => {
    handleClick();
    // handleEditUserPermissions()
    // eslint-disable-next-line
  }, [chosenItems]);

  // const handleEditUserPermissions = (groupId) => {
  //   const promises = [
  //     fetch(`${API_URL}/api/core/blob-groups/${groupId}/`, {
  //       method: "GET",
  //       // headers: {
  //       //   Authorization: `Bearer ${token}`,
  //       //   "Content-Type": "application/json",
  //       //   // "X-CSRFToken": csrfToken,
  //       // },
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "X-CSRFToken": csrfToken,
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     }).then((response) => response.json()),
  //     // Add more fetch requests if needed
  //   ];

  //   Promise.all(promises)
  //     .then((data) => {
  //       if (data.length > 0) {
  //         setEditedUserGroup(data[0]);
  //         // setSelectedData(data[0]);
  //         setModalVisible(true);
  //         document.body.style.overflow = "hidden";
  //         setShowPreview(true);
  //         setDataType("EditUser");
  //         setIsEditing(true);
  //         setLoading(false);
  //       } else {
  //         console.error("No data received from API for Preview.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching API data:", error);
  //     });
  // };

  //   const handleEditUserPermissions = (groupId) => {
  //   setLoading(true);

  //   fetch(`${API_URL}/api/core/blob-groups/${groupId}/`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "X-CSRFToken": csrfToken,
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //   })
  //     .then((response) => response.json())
  //     .then((groupData) => {
  //       if (groupData) {
  //         setEditedUserGroup(groupData);
  //         setEditUserInput(groupData.name || "");

  //         // --- ENHANCED SAML FIX START ---
  //         // Check all common field representations (array of strings, array of objects, or delimited string)
  //         const rawSaml =
  //           groupData.dcgroups ||
  //           groupData.dc_groups ||
  //           groupData.saml_groups ||
  //           groupData.azure_groups ||
  //           [];

  //         let parsedGroups = [];

  //         if (Array.isArray(rawSaml)) {
  //           parsedGroups = rawSaml
  //             .map((g) => (typeof g === "object" && g !== null ? g.name || g.group_id || g.id : g))
  //             .filter((g) => g && String(g).trim() !== "");
  //         } else if (typeof rawSaml === "string" && rawSaml.trim() !== "") {
  //           parsedGroups = rawSaml
  //             .split(",")
  //             .map((g) => g.trim())
  //             .filter(Boolean);
  //         }

  //         // If parsedGroups has values, use them; otherwise, default to standard single empty input
  //         setDcgroupsState(parsedGroups.length > 0 ? parsedGroups : [""]);
  //         // --- ENHANCED SAML FIX END ---

  //         setModalVisible(true);
  //         document.body.style.overflow = "hidden";
  //         setShowPreview(true);
  //         setDataType("EditUser");
  //         setIsEditing(true);
  //       } else {
  //         console.error("No data received from API for Preview.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching API data:", error);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  const handleEditUserPermissions = (groupId) => {
    setLoading(true);

    const fetchGroup = fetch(`${API_URL}/api/core/blob-groups/${groupId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": csrfToken,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then((res) => res.json());

    const fetchAllRoles = fetch(`${API_URL}/api/core/blob-roles/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": csrfToken,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then((res) => res.json());

    Promise.all([fetchGroup, fetchAllRoles])
      .then(([groupData, allRoles]) => {
        if (groupData && allRoles) {
          setEditedUserGroup(groupData);
          setEditUserInput(groupData.name || "");

          // Set all system roles into availableItems
          setAvailableItems(allRoles);

          // Pre-populate chosenItems with existing group roles (Ensure Array format)
          const currentRoles = groupData.roles || [];
          setChosenItems(currentRoles);

          // SAML Setup
          const rawSaml =
            groupData.dcgroups ||
            groupData.dc_groups ||
            groupData.saml_groups ||
            groupData.azure_groups ||
            [];

          let parsedGroups = [];
          if (Array.isArray(rawSaml)) {
            parsedGroups = rawSaml
              .map((g) =>
                typeof g === "object" && g !== null
                  ? g.name || g.group_id || g.id
                  : g,
              )
              .filter((g) => g && String(g).trim() !== "");
          } else if (typeof rawSaml === "string" && rawSaml.trim() !== "") {
            parsedGroups = rawSaml
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean);
          }

          setDcgroupsState(parsedGroups.length > 0 ? parsedGroups : [""]);
          setModalVisible(true);
          document.body.style.overflow = "hidden";
          setShowPreview(true);
          setDataType("EditUser");
          setIsEditing(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching edit data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Check AdminPanel.js for something like this and restrict it to ADD mode only:
  useEffect(() => {
    if (isAddUserGroup) {
      setDcgroupsState([""]); // ONLY reset for Add Modal, NOT Edit Modal
    }
  }, [isAddUserGroup]);

  useEffect(() => {
    setDynamicGroupValues([...editedUserGroup.dcgroups_id]);
  }, [editedUserGroup.dcgroups_id]);

  const validateForm = () => {
    // Check if input values are valid non-empty strings
    const isValidInputValue1 =
      typeof inputValue1 === "string" && inputValue1.trim() !== "";
    const isValidEditUserInput =
      typeof editUserInput === "string" && editUserInput.trim() !== "";

    // Convert input values to lowercase for case-insensitive comparison
    const inputValue1Lower =
      typeof inputValue1 === "string" ? inputValue1.toLowerCase() : "";
    const isNameUnique = !userGroupName.includes(inputValue1Lower);

    const editUserInputLower =
      typeof editUserInput === "string" ? editUserInput.toLowerCase() : "";
    const isEditUserInputNameUnique =
      !userGroupName.includes(editUserInputLower);

    // Determine the tooltip message based on validation
    let tooltipMessage = "";

    if (isEditing) {
      if (!hasNameChanged) {
        tooltipMessage = "";
      } else if (!isValidEditUserInput) {
        tooltipMessage = "Edit user input required";
      } else if (!isEditUserInputNameUnique) {
        tooltipMessage = "Edit user name already exists";
      }
    } else {
      if (!isValidInputValue1) {
        tooltipMessage = "Name required";
      } else if (!isNameUnique) {
        tooltipMessage = "Name already exists";
      }
    }

    // Set tooltip message
    setTooltipMessage(tooltipMessage);

    // Enable Save button if all conditions are met
    setIsSaveDisabled(
      (isEditing &&
        hasNameChanged &&
        (!isValidEditUserInput || !isEditUserInputNameUnique)) ||
        (!isEditing && (!isValidInputValue1 || !isNameUnique)),
    );
  };

  // Call validateForm whenever the input changes
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line
  }, [inputValue1, editUserInput, userGroupName]); // Call validateForm whenever these values change

  const handleUserGroupSave = async () => {
    if (isSaveDisabled) return; // Prevent save if disabled

    try {
      // saveNameToUserGroup();
      const url =
        editedUserGroup && editedUserGroup?.id
          ? `${API_URL}/api/core/blob-groups/${editedUserGroup.id}/`
          : `${API_URL}/api/core/blob-groups/create/`;

      const method = editedUserGroup && editedUserGroup?.id ? "PUT" : "POST";

      let dcgroupsValue = method === "POST" ? inputValue2 : dcgroupsState || [];
      if (!Array.isArray(dcgroupsValue)) {
        dcgroupsValue = [dcgroupsValue];
      }

      // Ensure selectedItems is an array
      const selectedItemsArray = Array.isArray(selectedItems)
        ? selectedItems
        : [];

      const chosenItemsArray = Array.isArray(chosenItems)
        ? chosenItems
        : Array.from(chosenItems);

      const uniqueSelectedItems = Array.from(
        new Set([...chosenItemsArray, ...selectedItemsArray]),
      );

      const data = await secureApiCall(url, method, {
        roles: uniqueSelectedItems,
        name: method === "POST" ? inputValue1 : editUserInput,
        description: "admin",
        dcgroups: dcgroupsValue.join(","),
      });

      localStorage.setItem("chosenItems", JSON.stringify(uniqueSelectedItems));

      setResponseMessage(data.message);

      fetchData();

      // Ensure userGroupsData is always an array before updating
      setUserGroupsData((prevState) => {
        const prevData = Array.isArray(prevState) ? prevState : [];

        if (
          data.data &&
          Array.isArray(data.data) &&
          typeof data.data === "object"
        ) {
          // Find the index of the edited user group in the previous data array
          const editedIndex = prevData.findIndex(
            (group) => group.id === editedUserGroup?.id,
          );

          setChosenItems([...chosenItems]);

          if (editedIndex !== -1) {
            // If the edited user group exists in the previous data, update it
            const updatedData = [...prevData];
            updatedData[editedIndex] = data.data[0]; // Update with the new user group data
            return updatedData;
          } else {
            // If the user group does not exist, add it to the list
            return [...prevData, data.data[data.data.length - 1]];
          }
        } else {
          // In case data.data is not defined or not an array, return previous data
          return prevData;
        }
      });

      setInputValue1("");
      setInputValue2("");
      setSelectedItems([]);
      setIsModalOpen(false);
      setChosenItems([]); // Ensure chosenItems is reset to an array
      setDcGroups([]);
      closePreviewModal();
      setIsEditUserModalOpen(false);
      setLoading(false);
      setIsAddUserGroup(false);
    } catch (error) {
      console.error("Error occurred during save:", error);
      setResponseMessage("Error: Something went wrong.");
    }
  };

  useEffect(() => {
    handleUserGroupSave();
    // eslint-disable-next-line
  }, []);

  const handleChooseAll = () => {
    // Move all items from availableItems to chosenItems
    setChosenItems([...chosenItems, ...availableItems]);
    setAvailableItems([]);

    // Clear selectedItems array
    setSelectedItems([]);
  };

  const handleRemoveAll = () => {
    // Move all items from chosenItems to availableItems
    setAvailableItems([...availableItems, ...chosenItems]);
    setChosenItems([]);

    // Clear selectedItems array
    setSelectedItems([]);
  };

  // eslint-disable-next-line
  const handleEditMoveToRight = () => {
    setChosenItems((prevChosen) => [
      ...prevChosen,
      ...selectedItems.filter(
        (item) => !prevChosen.some((chosen) => chosen.id === item.id),
      ),
    ]);
    setAvailableItems((prevAvailable) =>
      prevAvailable.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id),
      ),
    );
    setSelectedItems([]);
  };

  // eslint-disable-next-line
  const handleEditMoveToLeft = () => {
    setAvailableItems((prevAvailable) => [
      ...prevAvailable,
      ...selectedItems.filter(
        (item) => !prevAvailable.some((available) => available.id === item.id),
      ),
    ]);
    setChosenItems((prevChosen) =>
      prevChosen.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id),
      ),
    );
    setSelectedItems([]);
  };

  const handleEditChooseAll = () => {
    // Ensure prevChosen is always an array before applying operations
    setChosenItems((prevChosen) => {
      const currentChosenItems = Array.isArray(prevChosen) ? prevChosen : [];

      return [
        ...currentChosenItems,
        // Filter availableItems and add only those that are not already in chosenItems
        ...availableItems.filter(
          (item) => !currentChosenItems.some((chosen) => chosen.id === item.id),
        ),
      ];
    });

    // Clear availableItems as all items are chosen
    setAvailableItems([]);
  };

  const handleEditRemoveAll = () => {
    // const chosenItemsArray = Array.from(chosenItems);

    //   setAvailableItems(prevAvailable => [
    //     ...prevAvailable,
    //     ...chosenItemsArray.filter(item => !prevAvailable.some(available => available.id === item.id))
    //   ]);

    //   setChosenItems(new Set()); // Clearing chosenItems

    // Get all chosen items from chosenItems state
    const allChosenItems = [...chosenItems]; // Create a copy to avoid mutation

    if (allChosenItems.length > 0) {
      // Update editedUserGroup by removing all chosen items from its roles
      setEditedUserGroup((prevEditedUserGroup) => {
        const prevRoles = Array.isArray(prevEditedUserGroup?.roles)
          ? prevEditedUserGroup.roles
          : [];

        // Filter out all the chosen items from roles
        const updatedRoles = prevRoles.filter(
          (role) =>
            !allChosenItems.some((chosenItem) => chosenItem.id === role.id),
        );

        return {
          ...prevEditedUserGroup,
          roles: updatedRoles,
        };
      });

      // Update availableItems by adding all chosen items
      setAvailableItems((prevAvailableItems) => {
        // Remove any items that are already in availableItems
        const filteredAvailableItems = prevAvailableItems.filter(
          (item) =>
            !allChosenItems.some((chosenItem) => chosenItem.id === item.id),
        );

        // Combine all chosen items back to the availableItems
        const updatedAvailableItems = [
          ...filteredAvailableItems,
          ...allChosenItems,
        ];

        // Ensure no duplicates in availableItems by converting to a Set and back to an array
        const uniqueAvailableItems = Array.from(
          new Set(updatedAvailableItems.map((item) => item.id)),
        ).map((id) => updatedAvailableItems.find((item) => item.id === id));

        return uniqueAvailableItems;
      });

      // Clear all items from chosenItems as they have been removed
      setChosenItems([]); // Ensure that chosenItems are cleared immediately

      // Clear the selected items as we have removed everything
      setSelectedItems([]);

      // Log after the state is updated
      setTimeout(() => {}, 0);
    }
  };

  useEffect(() => {
    const chosenItemsArray = Array.from(chosenItems);

    // Filter availableItems to include only those that are not in chosenItems
    const filtered = availableItems.filter(
      (item) => !chosenItemsArray.some((chosen) => chosen.id === item.id),
    );

    setFilteredItems(filtered);
  }, [chosenItems, availableItems]);

  // eslint-disable-next-line
  const addItemToChosen = (item) => {
    setChosenItems((prevChosen) => new Set(prevChosen).add(item));
  };

  // Function to remove an item from chosenItems
  // eslint-disable-next-line
  const removeItemFromChosen = (item) => {
    setChosenItems((prevChosen) => {
      const newSet = new Set(prevChosen);
      newSet.delete(item);
      return newSet;
    });
  };

  useEffect(() => {
    if (editedUserGroup && Array.isArray(editedUserGroup.roles)) {
      setChosenItems(new Set(editedUserGroup.roles));
    }
  }, [editedUserGroup]);

  useEffect(() => {}, [filteredItems]);

  const handleAddMoveToLeft = () => {
    // Move selected items from chosen to available
    setAvailableItems([...availableItems, ...selectedItems]);
    setChosenItems(chosenItems.filter((item) => !selectedItems.includes(item)));
    setSelectedItems([]);
  };

  useEffect(() => {}, [availableItems]); // Ensure availableItems is updated and logged

  useEffect(() => {
    if (!editedUserGroup) return;

    const newFilteredItems = isEditing
      ? availableItems.filter(
          (item) => !editedUserGroup.roles.some((role) => role.id === item.id),
        )
      : availableItems;

    setFilteredItems(newFilteredItems);
  }, [availableItems, editedUserGroup, isEditing]);

  useEffect(() => {}, [availableItems, editedUserGroup, isEditing]);

  useEffect(() => {
    if (Array.isArray(editedUserGroup.dcgroups)) {
      setDcgroupsState(editedUserGroup.dcgroups);
    } else {
      setDcgroupsState([editedUserGroup.dcgroups || ""]);
    }
  }, [editedUserGroup]);

  // Handle changes in the dcgroups input fields
  const handleEditDcGroupsChange = (index, value) => {
    setDcgroupsState((prevState) => {
      const updatedDcGroups = [...prevState];
      updatedDcGroups[index] = value; // Update the specific dcgroup by index
      return updatedDcGroups;
    });
  };
  useEffect(() => {
    console.log("dcegroupsState:", dcgroupsState);
  }, [dcgroupsState]);

  useEffect(() => {
    // Simulate fetching data
    // Replace with actual data fetching logic
    const fetchData = async () => {
      setChosenItems(chosenItems);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isEditUserModalOpen) {
      // When the modal opens, load the data
      setChosenItems(new Set(editedUserGroup.roles));
    }
    // eslint-disable-next-line
  }, [isEditUserModalOpen]);

  return (
    <>
    
      <div className="admin-data">
        <div className={`admin-container-data bg-primary`}>
          <div className="w-full h-full flex flex-col items-center container-padding vertical-gap ">
            <div
              className={`admin-navbar-wrapper  flex ${isDisabled || isBlurred || isInteractionDisabled ? "  pointer-events-none" : ""}`}
            >
              <Navbar />
            </div>
            <div className={`admin-container-wrapper flex layout-gap`}>
              <div
                className={`admin-Sidebar-wrapper
                 ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <Sidebar />
              </div>
              <div
                className={`subcontainer-wrapper bg-newgray  padding rounded-lg shadow-xl shadow-slate-500/50 overflow-hidden sub-container-gap
                ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""}`}
              >
                <div
                  className={`admin-back-dashboard flex items-center text-sm font-medium text-purpleshade1 `}
                >
                  <div>
                    <Link to="/home">Home</Link> &gt; Admin Panel
                  </div>
                </div>
                <div className={`admin-options-view  flex  overflow-hidden`}>
                  <div
                    className={`admin-options-wrapper options-wrapper-padding   bg-newgray shadow-md shadow-slate-500/30 flex flex-col rounded-l-xl  items-center  border-l-2 border-r-2 border-slate-200/100 z-10 `}
                  >
                    <div
                      className="options-data-wrapper  space-y-1 flex flex-col  overflow-auto "
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {Options_Config.map((item) => (
                        <OptionsItems
                          key={item.key}
                          item={item}
                          selectedOption={selectedOption}
                          onClick={handleOptionClick}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    className={`options-data-view bg-white rounded-r-xl shadow-md shadow-slate-500/30 flex flex-col items-center py-2 px-6 `}
                  >
                    {selectedOption === "User Group" && (
                      <div
                        className={`options-data-container container-gap flex flex-col items-center 
                        ${
                          isInteractionDisabled || isDisabled || isBlurred
                            ? " blur-effect pointer-events-none"
                            : ""
                        }`}
                      >
                        <div
                          className={`button-container flex flex-row py-2  bg-newgray items-center px-2 rounded-lg shadow-md shadow-slate-500/30`}
                        >
                          <button
                            className={`add-new-button flex flex-row  justify-center text-xs  rounded-md cursor-pointer items-center font-medium  text-white bg-purpleshade1 `}
                            onClick={() => {
                              handleUserPermissions();
                              setIsModalOpen(true);
                            }}
                            //   style={{
                            //     height: "2rem",
                            //     maxWidth: "100%",
                            //     maxHeight: "100%",
                            //     overflow: "hidden",
                            //   }}
                          >
                            Add New Field
                          </button>
                        </div>
                        <div
                          className={`usergroup-data-container py-1 flex flex-col items-center  `}
                        >
                          {/* <div className={`usergroup-data-header rounded-t-xl`}>
                            <table className="table-design table-fixed w-full border-collapse">
                              <colgroup>
                                <col className="column1" />
                                <col className="column2" />
                              </colgroup>

                              <thead className="bg-purpleshade1 sticky top-0  rounded-t-lg text-white ">
                                <tr>
                                  <th className="header-padding py-3 sticky top-0 font-medium text-xs border border-none  rounded-tl-lg">
                                    User Group Name
                                  </th>
                                  <th className="header-padding py-3 z-20 sticky font-medium text-xs top-0 border border-none rounded-tr-lg">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div> */}
                          <div
                            className={`usergroup-data-header rounded-t-xl overflow-hidden`}>
                            <table className="table-design table-fixed w-full border-collapse ">
                              <colgroup>
                                <col className="column1" />
                                <col className="column2" />
                              </colgroup>

                              <thead className="bg-purpleshade1 py-3 sticky top-0 rounded-t-lg text-white">
                                <tr className=" ">
                                  <th
                                    className="header-padding py-3 sticky top-0 font-medium text-xs border-none rounded-tl-lg max-w-0 truncate px-2 text-left"
                                    title="User Group Name"
                                  >
                                    <span className="block truncate">
                                      User Group Name
                                    </span>
                                  </th>
                                  <th
                                    className="header-padding py-3 z-20 sticky top-0 font-medium text-xs border-none rounded-tr-lg max-w-0 truncate px-2 text-center"
                                    title="Action"
                                  >
                                    <span className="block truncate">
                                      Action
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div>
                          <div
                            className={`usergroup-tabular-data   flex flex-col rounded-b-xl shadow-md shadow-slate-500/30 bg-white`}
                          >
                            <div
                              className={`usergroup-tabular-rows  py-1  overflow-auto `}
                              style={{ scrollbarWidth: "thin" }}
                            >
                              <table className="table-design  table-fixed w-full ">
                                <tbody className="sticky mt-3">
                                  {loading ? (
                                    <tr>
                                      <td
                                        colSpan="2"
                                        className="text-center py-10"
                                      >
                                        <div className="flex flex-col justify-center items-center space-y-6">
                                          <img
                                            src={`${process.env.PUBLIC_URL}/loadergif.gif`}
                                            alt="Loading..."
                                            className="animate-spin w-8 h-8"
                                          />
                                          <p className="text-logintext font-[350] text-[13px] animate-pulse">
                                            Just a moment...
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    userGroupsData.map((group, index) => (
                                      <tr key={group.id} className="mt-2">
                                        <td className="column1 font-light text-xs header-padding overflow-ellipsis whitespace-nowrap overflow-hidden"
                                        title={group.name}>
                                          {group.name}
                                        </td>
                                        <td className="column2 font-light text-xs header-padding overflow-ellipsis whitespace-nowrap overflow-hidden">
                                          <div className="flex flex-row space-x-1">
                                            <button
                                              // className="bg-lightgray-100 text-white px-2 py-1 h-8 w-[100px]  rounded-lg font-semibold "
                                              className=" edit-button"
                                              onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click when button is clicked
                                                //   setIsModalOpen(true);
                                                // console.log("Clicked group:", group);
                                                setIsEditUserModalOpen(true);
                                                // handleUserPermissions();
                                                // setShowPreview(true);
                                                handleEditUserPermissions(
                                                  group.id,
                                                );
                                                // handleClick(group.id);
                                              }}
                                            >
                                              <img
                                                src="icon-edit-row.png"
                                                alt="Edit"
                                                className="w-4 h-4  rounded-lg"
                                              />
                                              {/* Edit */}
                                            </button>
                                            <button
                                              className="edit-button flex items-center justify-center"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectionUserGroupDeletion(
                                                  group,
                                                );
                                              }}
                                            >
                                              <img
                                                src="icon-delete.png"
                                                alt="delete"
                                                className="w-4 h-4 rounded-lg"
                                              />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <AddUserGroup
                          isOpen={isModalOpen}
                          closeModal={() => setIsModalOpen(false)}
                          showPreview={showPreview}
                          isModalOpen={isModalOpen}
                          setIsModalOpen={setIsModalOpen}
                          setIsAddUserGroup={setIsAddUserGroup}
                          inputValue1={inputValue1}
                          handleModalInputChange1={handleModalInputChange1}
                          inputValue2={inputValue2}
                          handleModalInputChange2={handleModalInputChange2}
                          availableItems={availableItems}
                          chosenItems={chosenItems}
                          selectedItems={selectedItems}
                          handleItemClick={handleItemClick}
                          handleChooseAll={handleChooseAll}
                          handleRemoveAll={handleRemoveAll}
                          handleMoveToRight={handleMoveToRight}
                          handleAddMoveToLeft={handleAddMoveToLeft}
                          handleUserGroupSave={handleUserGroupSave}
                          isSaveDisabled={isSaveDisabled}
                          tooltipMessage={tooltipMessage}
                        />

                        <EditUserGroup
                          isOpen={isEditUserModalOpen}
                          closeModal={() => setIsEditUserModalOpen(false)}
                          dcgroupsState={dcgroupsState}
                          setDcgroupsState={setDcgroupsState}
                          handleEditDcGroupsChange={handleEditDcGroupsChange}
                          availableItems={availableItems}
                          chosenItems={chosenItems}
                          selectedItems={selectedItems}
                          handleItemClick={handleItemClick}
                          handleChooseAll={handleEditChooseAll}
                          handleEditModalInputChange={
                            handleEditModalInputChange
                          }
                          handleMoveToRight={handleMoveToRight}
                          handleMoveToLeft={handleMoveToLeft}
                          handleEditRemoveAll={handleEditRemoveAll}
                          handleUserGroupSave={handleUserGroupSave}
                          isSaveDisabled={isSaveDisabled}
                          tooltipMessage={tooltipMessage}
                          loading={loading}
                          isEditing={isEditing}
                          editUserInput={editUserInput}
                          // isEditUserModalOpen={isEditUserModalOpen}
                          editedUserGroup={editedUserGroup}
                          chosenItems={chosenItems}
                          showPreview={showPreview}
                          dcGroups={dcGroups}
                          setDcGroups={setDcGroups}
                        />

                        {selectedUserGroupDeletion && (
                          <div className="absolute inset-0 flex justify-center z-20 items-center">
                            <UserDeleteConfirmationPopup
                              context={selectedUserGroupDeletion}
                              onCancel={handleCancelDelete}
                              onConfirm={() =>
                                handleDeleteClick(selectedUserGroupDeletion.id)
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {selectedOption === "Storage Container" && (
                      // <div className={`w-full h-full  `}>
                      <StorageContainers selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "File Share" && (
                      // <div className={`w-full h-full  `}>
                      <FileShareData selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "S3 Storage" && (
                      // <div className={`w-full h-full  `}>
                      <S3Accounts selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "GCP" && (
                      // <div className={`w-full h-full  `}>
                      <GCPAccounts selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "Global Column Config" && (
                      // <div className={`w-full h-full  `}>
                      <GlobalColumnConfig selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "Permanent Masking" && (
                      // <div className={`w-full h-full  `}>
                      <PermanenetMasking selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "Miscellaneous" && (
                      // <div className={`w-full h-full  `}>
                      <Miscellaneous selectedOption={selectedOption} />
                      // </div>
                    )}
                    {selectedOption === "Alert" && (
                      // <div className={`w-full h-full  `}>
                      <Alert selectedOption={selectedOption} />
                      // </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`chatbot-margin  ${isDisabled || isBlurred || isInteractionDisabled ? "pointer-events-none" : ""} `}
          // style={{
          //   right: "20px",
          //   bottom: "80px",
          // }}
        >
          <img
            src={process.env.PUBLIC_URL + "/chat-icon.png"}
            alt="Chat Icon"
            className="w-12 h-12 cursor-pointer animate-floating"
            onClick={handleChatbotIconClick}
          />
        </div>
        {showChatbot && (
          <Chatbot
            isOpen={showChatbot}
            onClose={handleCloseChatbot} // Pass handleCloseChatbot to Chatbot
          />
        )}
      </div>
    </>
  );
};

export default AdminPanel;
