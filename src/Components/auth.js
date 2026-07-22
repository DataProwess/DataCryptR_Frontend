import { PublicClientApplication } from "@azure/msal-browser";
import msalConfig from "../MsalConfiguration";
import {API_URL,FRONTEND_API_URL} from "./ApiConfig"
import { fetchAndStoreCSRFToken, startCSRFTokenRefresh } from "./csrfUtils";

// const API_URL = "http://127.0.0.1:8000/";

const msalInstance = new PublicClientApplication(msalConfig);

await msalInstance.initialize();
/* eslint-disable no-unused-vars */
const url = `${FRONTEND_API_URL}/login/`;

const loginRequest = {
  scopes: ["openid", "profile", "User.Read"],
};

const logoutRequest = {
  onRedirectNavigate: (url) => {
  
  },
  postLogoutRedirectUri: `${FRONTEND_API_URL}/login/`,
  state: "customStateData",
};

// Store the CSRF refresh interval ID
let csrfRefreshIntervalId = null;

const authService = {
  login: async () => {
    try {
      console.log('🔄 Starting MSAL login process...');

      // Step 1: Authenticate the user
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log('✅ MSAL login successful');
  
      // Step 2: Send a POST request to the backend to reformat the token
      console.log('🔄 Sending token to backend for reformatting...');
      const response = await fetch(`${API_URL}/reformat-token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',  // Ensure cookies are included
        body: JSON.stringify({ token: loginResponse.idToken }),
      });
  
      // Step 3: Check if the response is OK
      if (response.ok) {
        // Parse the response data
        const data = await response.json();
        console.log('✅ Token reformatting successful');
  
        // Store token data in localStorage
        const jsonStr = JSON.stringify(data);
        localStorage.setItem("token", jsonStr);
  
        // Step 4: Get the CSRF token immediately (no delay needed)
        console.log('🔄 Fetching CSRF token...');
        await fetchAndStoreCSRFToken();

        // Step 5: Start CSRF token refresh cycle
        if (csrfRefreshIntervalId) {
          clearInterval(csrfRefreshIntervalId);
        }
        csrfRefreshIntervalId = startCSRFTokenRefresh(10); // Refresh every 10 minutes
      } else {
        console.error("❌ Error fetching token:", response.status);
      }
  
      // Return the login response account
      return loginResponse.account;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },  


  loginWithCredentials: async (username, password, totpCode) => {
    try {
      console.log('🔄 Starting credential login process...');

      // Step 1: Send a POST request to log in
      const response = await fetch(`${API_URL}/superuser-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',  // Ensure cookies are included
        body: JSON.stringify({
          username,
          password,
          totp_code: totpCode != null && String(totpCode).trim() !== ""
            ? String(totpCode).replace(/\s/g, "")
            : undefined,
        }),
      });
  
      // Step 2: Check if the response is OK
      if (response.ok) {
        const responsedata = await response.json();
        console.log('✅ Credential login successful');
  
        // Step 3: Check if the token is available in the response
        if (responsedata.data.token) {
          // Store the entire token data object in localStorage
          localStorage.setItem("token", JSON.stringify(responsedata));
  
          // Step 4: Get the CSRF token immediately (no delay needed)
          console.log('🔄 Fetching CSRF token...');
          await fetchAndStoreCSRFToken();

          // Step 5: Start CSRF token refresh cycle
          if (csrfRefreshIntervalId) {
            clearInterval(csrfRefreshIntervalId);
          }
          csrfRefreshIntervalId = startCSRFTokenRefresh(10); // Refresh every 10 minutes
  
          // Return the token
          return responsedata.data.token;
        } else {
          throw new Error("Token not received in the response");
        }
      } else {
        let detail = "Login failed";
        try {
          const errBody = await response.json();
          if (errBody && errBody.error) {
            detail = errBody.error;
          }
          if (errBody && errBody.code === "totp_not_configured") {
            detail =
              `${errBody.error || "TOTP not configured"}. Run: python manage.py enroll_superuser_totp <username>`;
          }
        } catch {
          // ignore JSON parse errors
        }
        console.error("❌ Error logging in:", response.status, detail);
        const e = new Error(detail);
        e.status = response.status;
        throw e;
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },  
  

  logout: async () => {
    try {
      console.log('🔄 Logging out...');
      localStorage.removeItem("token");
      localStorage.removeItem("csrfToken");

      // Stop CSRF token refresh
      if (csrfRefreshIntervalId) {
        clearInterval(csrfRefreshIntervalId);
        csrfRefreshIntervalId = null;
      }

      await msalInstance.logoutPopup(logoutRequest);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  },


  getUserGroup: () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenObj = JSON.parse(token);
        return tokenObj.data.user_group;
      } else {
        console.error("❌ Token not available");
        return null;
      }
    } catch (error) {
      console.error("❌ Error parsing token for user group:", error);
      return null;
    }
  },

  getPermissions: () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenObj = JSON.parse(token);
        return tokenObj.data.permissions;
      } else {
        console.error("❌ Token not available");
        return [];
      }
    } catch (error) {
      console.error("❌ Error parsing token for permissions:", error);
      return [];
    }
  },

  getRole: () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenObj = JSON.parse(token);
        return tokenObj.data.role;
      } else {
        console.error("❌ Token not available");
        return [];
      }
    } catch (error) {
      console.error("❌ Error parsing token for role:", error);
      return [];
    }
  },

  getUserName: () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenObj = JSON.parse(token);
        return tokenObj.data.name;
      } else {
        console.error("❌ Token not available");
        return "";
      }
    } catch (error) {
      console.error("❌ Error parsing token for user name:", error);
      return "";
    }
  },

  getEmail: () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenObj = JSON.parse(token);
        return tokenObj.data.email;
      } else {
        console.error("❌ Token not available");
        return "";
      }
    } catch (error) {
      console.error("❌ Error parsing token for email:", error);
      return "";
    }
  },

  getCsrfToken: () => {
    // First, try to get the CSRF token from localStorage
    let csrfToken = localStorage.getItem("csrfToken");
  
    // Check if the retrieved token is null or the string 'null'
    if (csrfToken && csrfToken !== 'null' && csrfToken !== 'undefined') {
      return csrfToken; // Return if it's already in localStorage
    }
  
    // If the CSRF token is not in localStorage, try to get it from cookies
    csrfToken = getCsrfTokenFromCookie();
  
    if (csrfToken) {
      // Store it in localStorage for future use
      localStorage.setItem("csrfToken", csrfToken);
      return csrfToken;
    } else {
      return null; // If it's neither in localStorage nor cookies, return null
    }
  },
  

  getToken: async () => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("❌ Error getting token:", error);
      throw error;
    }
  },

  isAuthenticated: () => {
    try {
      const token = localStorage.getItem("token");
      return !!token;
    } catch (error) {
      console.error("❌ Error checking authentication:", error);
      return false;
    }
  },

  handleTokenExpiration: () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenObj = JSON.parse(token);
        const expiresOn = tokenObj.data.expiresOn;

        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime > expiresOn) {
          console.log('🔄 Token expired, logging out...');
          authService.logout();
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("❌ Error handling token expiration:", error);
    }
  },
 
};

// Note: When the API sets CSRF_COOKIE_HTTPONLY (production), document.cookie cannot read
// csrftoken — this fallback never succeeds. Use getCSRFToken / fetchAndStoreCSRFToken from csrfUtils.
function getCsrfTokenFromCookie() {
  try {
    const cookieValue = document.cookie
      .split("; ")
      .find(row => row.startsWith("csrftoken=")); // 'csrftoken' is Django's default name
    return cookieValue ? cookieValue.split("=")[1] : null;
  } catch (error) {
    console.error("❌ Error getting CSRF token from cookie:", error);
    return null;
  }
}

export default authService;
