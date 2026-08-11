import React from "react";
import { API_URL } from "./ApiConfig";
import authService from "./auth";

/**
 * Get CSRF token from localStorage first, then fetch if needed
 * @returns {Promise<string|null>} CSRF token or null if failed
 */
export async function getCSRFToken() {
  // First, try to get the CSRF token from localStorage
  let token = localStorage.getItem("csrfToken");

  // Check if the retrieved token is valid (not null, undefined, or 'null' string)
  if (token && token !== "null" && token !== "undefined") {
    console.log(" CSRF token retrieved from cache");
    return token;
  }

  // If not in localStorage, fetch from server
  console.log("🔄 Fetching CSRF token from server...");
  try {
    const response = await fetch(`${API_URL}/csrf-token/`, {
      method: "GET",
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const csrfToken = data.csrf_token;

      // Cache the token in localStorage
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
        console.log(" CSRF token fetched and cached");
        return csrfToken;
      }
    } else {
      console.error(" Failed to get CSRF token:", response.status);
    }
  } catch (error) {
    console.error(" Error getting CSRF token:", error);
  }
  return null;
}

/**
 * Fetch and store CSRF token (for initial app load)
 * @returns {Promise<string|null>} CSRF token or null if failed
 */
export async function fetchAndStoreCSRFToken() {
  console.log(" Fetching and storing CSRF token...");
  try {
    const response = await fetch(`${API_URL}/csrf-token/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const csrfToken = data.csrf_token;

      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
        console.log(" CSRF token fetched and stored");
        return csrfToken;
      }
    } else {
      console.error(" Failed to fetch CSRF token:", response.status);
    }
  } catch (error) {
    console.error(" Error fetching CSRF token:", error);
  }
  return null;
}

/**
 * Get authentication token with better error handling
 * @returns {Promise<string|null>} Auth token or null if failed
 */
export async function getAuthToken() {
  try {
    const token = await authService.getToken();
    if (token) {
      try {
        const tokenObj = JSON.parse(token);
        return tokenObj.data.token;
      } catch (parseError) {
        console.error(" Error parsing auth token:", parseError);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(" Error getting auth token:", error);
    return null;
  }
}

/**
 * Make authenticated API request with CSRF protection
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} data - Request body data (for POST/PUT/PATCH)
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */

export async function makeAuthenticatedRequest(
  url,
  method = "GET",
  data = null,
  options = {},
) {
  if (typeof method === "object" && method !== null) {
    options = method;
    data = options.body || data || null;
    method = options.method || "GET";
  }

  const httpMethod = typeof method === "string" ? method.toUpperCase() : "GET";

  let csrfToken = localStorage.getItem("csrfToken");
  if (!csrfToken || csrfToken === "null" || csrfToken === "undefined") {
    csrfToken = await getCSRFToken();
  }

  if (!csrfToken) {
    throw new Error("Failed to get CSRF token");
  }

  const authToken = await getAuthToken();
  if (!authToken) {
    throw new Error("Failed to get authentication token");
  }

  // 1. Detect if payload is FormData
  const isFormData = data instanceof FormData;

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "X-CSRFToken": csrfToken,
    ...options.headers,
  };

  // 2. Only add application/json if it's NOT FormData
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // 3. Remove Content-Type if explicitly overridden to undefined (allows browser boundary generation)
  if (headers["Content-Type"] === undefined) {
    delete headers["Content-Type"];
  }

  const requestOptions = {
    method: httpMethod,
    headers: headers,
    credentials: "include",
    ...options,
  };

  // 4. Do not stringify FormData
  if (data && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
    requestOptions.body = isFormData ? data : (typeof data === "string" ? data : JSON.stringify(data));
  }

  const response = await fetch(url, requestOptions);

  if (response.status === 403) {
    try {
      const errorData = await response.json();
      const detail = errorData.detail;
      const isDrfCsrfFailure =
        errorData.csrf_error === true ||
        (typeof detail === "string" && detail.includes("CSRF"));
      if (isDrfCsrfFailure) {
        localStorage.removeItem("csrfToken");
        const newCsrfToken = await getCSRFToken();
        if (newCsrfToken) {
          return await makeAuthenticatedRequest(url, method, data, options);
        } else {
          throw new Error("Failed to get new CSRF token after expiry");
        }
      }
    } catch (parseError) {
      localStorage.removeItem("csrfToken");
      const newCsrfToken = await getCSRFToken();
      if (newCsrfToken) {
        return await makeAuthenticatedRequest(url, method, data, options);
      }
    }
  }

  return response;
}

// export async function makeAuthenticatedRequest(url, method = 'GET', data = null, options = {}) {
//     // Get CSRF token from cache first
//     let csrfToken = localStorage.getItem("csrfToken");

//     // If CSRF token is not available in cache, fetch it
//     if (!csrfToken || csrfToken === 'null' || csrfToken === 'undefined') {
//         csrfToken = await getCSRFToken();
//     }

//     if (!csrfToken) {
//         throw new Error('Failed to get CSRF token');
//     }

//     // Get auth token
//     const authToken = await getAuthToken();

//     if (!authToken) {
//         throw new Error('Failed to get authentication token');
//     }

//     // Prepare headers
//     const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${authToken}`,
//         'X-CSRFToken': csrfToken,
//         ...options.headers
//     };

//     // Prepare request options
//     const requestOptions = {
//         method: method.toUpperCase(),
//         headers: headers,
//         credentials: 'include', // Important for cookies
//         ...options
//     };

//     // Add body for POST/PUT/PATCH requests
//     if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
//         requestOptions.body = JSON.stringify(data);
//     }

//     // Make the request
//     const response = await fetch(url, requestOptions);

//     // Handle CSRF errors with better retry logic (custom csrf_error or DRF {"detail":"CSRF Failed: ..."})
//     if (response.status === 403) {
//         try {
//             const errorData = await response.json();
//             const detail = errorData.detail;
//             const isDrfCsrfFailure =
//                 errorData.csrf_error === true ||
//                 (typeof detail === 'string' && detail.includes('CSRF'));
//             if (isDrfCsrfFailure) {
//                 console.log(' CSRF token expired or rejected, getting new token and retrying...');
//                 // Clear the old CSRF token from localStorage
//                 localStorage.removeItem('csrfToken');
//                 // Get a new CSRF token
//                 const newCsrfToken = await getCSRFToken();
//                 if (newCsrfToken) {
//                     // Retry the request with new token
//                     return await makeAuthenticatedRequest(url, method, data, options);
//                 } else {
//                     throw new Error('Failed to get new CSRF token after expiry');
//                 }
//             }
//         } catch (parseError) {
//             // If we can't parse the error response, it might still be a CSRF error
//             console.log(' Potential CSRF error, retrying with new token...');
//             localStorage.removeItem('csrfToken');
//             const newCsrfToken = await getCSRFToken();
//             if (newCsrfToken) {
//                 return await makeAuthenticatedRequest(url, method, data, options);
//             }
//         }
//     }

//     return response;
// }

/**
 * Handle CSRF errors
 * @param {Error} error - The error to handle
 */
export async function handleCSRFError(error) {
  if (
    error.message.includes("CSRF") ||
    error.message.includes("Failed to get CSRF token")
  ) {
    console.log(" CSRF validation failed, refreshing page...");
    window.location.reload();
    return;
  }
  throw error;
}

/**
 * React hook for CSRF token management
 * @returns {Object} CSRF token state and functions
 */
export function useCSRF() {
  const [csrfToken, setCsrfToken] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // First try to get from localStorage
    const cachedToken = localStorage.getItem("csrfToken");
    if (cachedToken && cachedToken !== "null" && cachedToken !== "undefined") {
      setCsrfToken(cachedToken);
      setLoading(false);
    } else {
      // If not in cache, fetch from server
      getCSRFToken()
        .then((token) => {
          setCsrfToken(token);
          setLoading(false);
        })
        .catch((error) => {
          console.error(" Failed to get CSRF token:", error);
          setLoading(false);
        });
    }
  }, []);

  return { csrfToken, loading };
}

/**
 * Enhanced API request function with automatic retry and better error handling
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method
 * @param {Object} data - Request body data
 * @param {Object} options - Additional options
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<Object>} Response data
 */
export async function apiRequest(
  url,
  method = "GET",
  data = null,
  options = {},
  maxRetries = 3,
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `API request attempt ${attempt}/${maxRetries}: ${method} ${url}`,
      );
      const response = await makeAuthenticatedRequest(
        url,
        method,
        data,
        options,
      );

      // Handle different response statuses
      if (response.status === 401) {
        const responseData = await response.json();
        if (responseData.error === "Access token has expired") {
          console.log(" Access token expired, redirecting to login...");
          window.location.href = "/";
          return null;
        }
      }

      if (response.status === 404) {
        console.log(" 404 - No data found");
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Try to parse JSON response
      // Detect response type BEFORE trying to parse anything
      // const contentType = response.headers.get("content-type") || "";

      // // ✔ If JSON, parse as JSON
      // if (contentType.includes("application/json")) {
      //     const json = await response.json();
      //     console.log(`API request successful: ${method} ${url}`);
      //     return json;
      // }

      // // ✔ If file (Excel, CSV, ZIP, etc.), return blob
      // if (
      //     contentType.includes("application/vnd.openxmlformats-officedocument") ||
      //     contentType.includes("application/octet-stream") ||
      //     contentType.includes("application/vnd.ms-excel")
      // ) {
      //     const blob = await response.blob();
      //     console.log(`API request returned a file: ${method} ${url}`);
      //     return blob;
      // }

      // // ✔ If plain text
      // if (contentType.includes("text/")) {
      //     const text = await response.text();
      //     return { data: text };
      // }

      // // Default fallback — return raw response
      // return response;
      const contentType = response.headers.get("content-type") || "";

      // 1. If JSON
      if (contentType.includes("application/json")) {
        return await response.json();
      }

      // 2. If file match
      if (
        contentType.includes("application/vnd.openxmlformats-officedocument") ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/vnd.ms-excel")
      ) {
        return await response.blob();
      }

      // 3. Default fallback
      return response; // <--- RETURNS RAW RESPONSE OBJECT!
    } catch (error) {
      lastError = error;
      console.error(` API request attempt ${attempt} failed:`, error);

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(` Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Utility function to convert existing fetch calls to use CSRF protection
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method
 * @param {Object} data - Request body data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response data
 */
export async function secureApiCall(
  url,
  method = "GET",
  data = null,
  options = {},
) {
  try {
    return await apiRequest(url, method, data, options);
  } catch (error) {
    await handleCSRFError(error);
    throw error;
  }
}

/**
 * Clear CSRF token from cache
 */
export function clearCSRFToken() {
  localStorage.removeItem("csrfToken");
  console.log("CSRF token cleared from cache");
}

/**
 * Refresh CSRF token periodically (call this after login or when needed)
 * @param {number} intervalMinutes - Interval in minutes (default: 10)
 */
export function startCSRFTokenRefresh(intervalMinutes = 10) {
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`Setting up CSRF token refresh every ${intervalMinutes} minutes`);

  const refreshInterval = setInterval(async () => {
    try {
      console.log(" Refreshing CSRF token...");
      await fetchAndStoreCSRFToken();
    } catch (error) {
      console.error(" Error refreshing CSRF token:", error);
    }
  }, intervalMs);

  // Return the interval ID so it can be cleared if needed
  return refreshInterval;
}

/**
 * Stop CSRF token refresh
 * @param {number} intervalId - The interval ID returned by startCSRFTokenRefresh
 */
export function stopCSRFTokenRefresh(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
    console.log(" CSRF token refresh stopped");
  }
}

/**
 * Batch API requests with CSRF protection
 * @param {Array} requests - Array of request objects
 * @returns {Promise<Array>} Array of responses
 */
export async function batchApiRequests(requests) {
  const responses = [];

  for (const request of requests) {
    try {
      const response = await apiRequest(
        request.url,
        request.method || "GET",
        request.data,
        request.options || {},
      );
      responses.push({ success: true, data: response });
    } catch (error) {
      responses.push({ success: false, error: error.message });
    }
  }

  return responses;
}
