import { API_URL } from "../ApiConfig";
import { secureApiCall } from "../csrfUtils";

export const fetchStorageAccounts = () =>
  secureApiCall(`${API_URL}/api/admin/list-storage-accounts/`, "GET");

export const fetchContainers = (storage_account_id) =>
  secureApiCall(`${API_URL}/api/blob/list_containers/`, "POST", {
    storage_account_id,
  });

  export const getFolders = (selectionType, selectionId) => {
  const body =
    selectionType === "container"
      ? { container_id: selectionId }
      : { file_share_id: selectionId };

  return secureApiCall(`${API_URL}/api/blob/list_blob_folders/`, "POST", body);
};

export const getFiles = (payload) =>
  secureApiCall(`${API_URL}/api/blob/list_blobs/`, "POST", payload);


export const fetchBlobFolders = async ({ containerId, fileShareId }) => {
  if (!containerId && !fileShareId) {
    throw new Error("Either containerId or fileShareId is required");
  }

  const requestBody = containerId
    ? { container_id: containerId }
    : { file_share_id: fileShareId };

  const response = await secureApiCall(
    `${API_URL}/api/blob/list_blob_folders/`,
    "POST",
    requestBody
  );

  return response;
};