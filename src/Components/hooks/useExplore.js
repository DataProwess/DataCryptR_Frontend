// import { useState, useEffect } from "react";
// import * as api from "../api/exploreApi";

// // export const useExplore = () => {

// //       const [data, setData] = useState({
// //     storageAccounts: [],
// //     containers: [],
// //   });

// //   const [loading, setLoading] = useState(false);

// //   const loadStorageAccounts = async () => {
// //   try {
// //     setLoading(true);

// //     const res = await api.fetchStorageAccounts();

// //     console.log("API RESPONSE:", res); // 👈 DEBUG

// //     setData(prev => ({
// //       ...prev,
// //       storageAccounts: res?.data || []
// //     }));

// //   } catch (err) {
// //     console.error("ERROR:", err); // 👈 DEBUG
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// //   const loadContainers = async (id) => {
// //     const res = await api.fetchContainers(id);

// //     setData(prev => ({
// //       ...prev,
// //       containers: res || []
// //     }));
// //   };

// //   useEffect(() => {
// //     loadStorageAccounts();
// //   }, []);

// //   return {
// //     data,
// //     loading,
// //     loadContainers,
// //     loadStorageAccounts
// //   };
// // }



// export const useExplore = () => {
//   const [data, setData] = useState({
//     storageAccounts: [],
//     containers: [],
//     folders: [],
//   });

//   const [loading, setLoading] = useState(false);

//   // ✅ NEW STATES
//   const [selectedStorageAccountId, setSelectedStorageAccountId] = useState(null);
//   const [selectedFileShareId, setSelectedFileShareId] = useState(null);
//   const [selectedContainerId, setSelectedContainerId] = useState(null);

//   const loadStorageAccounts = async () => {
//     try {
//       setLoading(true);

//       const res = await api.fetchStorageAccounts();

//       setData(prev => ({
//         ...prev,
//         storageAccounts: res?.data || []
//       }));

//     } catch (err) {
//       console.error("ERROR:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadContainers = async (storageAccountId) => {
//     const res = await api.fetchContainers(storageAccountId);

//     setData(prev => ({
//       ...prev,
//       containers: res || []
//     }));
//   };


//  const transformData = (data) => {
//   if (!data) return [];

//   // Case 1: API returns array
//   if (Array.isArray(data)) {
//     return data.map((item, index) => ({
//       id: item.id || index,
//       name: item.name || "Unnamed",
//       files: item.files || [],
//       subfolders: item.subfolders || [],
//     }));
//   }

//   // Case 2: API returns object
//   return Object.keys(data).map((key) => ({
//     id: key,
//     name: key,
//     files: [],
//     subfolders: data[key] || [],
//   }));
// };

//    const loadFolders = async (type, id) => {
//     try {
//       setLoading(true);

//       const res = await api.getFolders(type, id);

//       const folderData = transformData(res?.blob_list);

//       setData((prev) => ({
//         ...prev,
//         folders: folderData,
//       }));
//     } catch (err) {
//       console.error("Error fetching folders:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Effects

//   useEffect(() => {
//     loadStorageAccounts();
//   }, []);

//   useEffect(() => {
//     if (selectedStorageAccountId) {
//       loadContainers(selectedStorageAccountId);
//     }
//   }, [selectedStorageAccountId]);

//   // ✅ 🔥 AUTO LOAD folders
//   useEffect(() => {
//     if (selectedContainerId) {
//       loadFolders("container", selectedContainerId);
//     } else if (selectedFileShareId) {
//       loadFolders("fileShare", selectedFileShareId);
//     }
//   }, [selectedContainerId, selectedFileShareId]);

//   return {
//     data,
//     loading,

//     // ✅ expose setters + values
//     selectedStorageAccountId,
//     setSelectedStorageAccountId,

//     selectedFileShareId,
//     setSelectedFileShareId,

//       selectedContainerId, // ✅ expose
//     setSelectedContainerId, // ✅ expose
//   };
// };



import { useState, useCallback } from "react";
import { fetchBlobFolders } from "../api/exploreApi";

export const useBlobFolders = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFolders = useCallback(async ({ containerId, fileShareId }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchBlobFolders({ containerId, fileShareId });

      const folderData = response?.blob_list || [];
      setFolders(folderData);

      return folderData;
    } catch (err) {
      console.error("Error fetching blob folders:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    folders,
    loading,
    error,
    loadFolders,
    setFolders, // optional if transformation needed outside
  };
};
