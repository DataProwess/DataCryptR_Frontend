// import React, { createContext, useContext, useEffect, useState } from "react";
// import authService from "./auth";
// // import { useNavigate } from "react-router-dom";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(null);
//   const [permissions, setPermissions] = useState([]);
//   const [userEmail, setUserEmail] = useState(null);
//   const [userGroups, setUserGroups] = useState([]);
//   const [csrfToken, setCsrfToken] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);
//   // const navigate = useNavigate()
  

//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const fetchedToken = await authService.getToken();
//         const userGroup = await authService.getUserGroup();
//         console.log("token:",fetchedToken)
//         const dataObject = JSON.parse(fetchedToken);

//         setToken(dataObject.data.token);
//         setUserEmail(dataObject.data.email);
//         setPermissions(dataObject.data.permissions);
//         setUserGroups(userGroup);

//         const csrf = authService.getCsrfToken();
       
//         setCsrfToken(csrf);

//       } catch (error) {
//         console.error("Token error:", error);
//       } finally {
//         setAuthLoading(false);
//       }
//     };

//     fetchToken();
//   }, []);


//   //   const logoutUser = async () => {
//   //   await authService.logout();   // service call

//   //   localStorage.removeItem("token");
//   //   localStorage.removeItem("csrfToken");

//   //   setToken(null);
//   //   setPermissions([]);
//   //   setUserEmail(null);
//   //   setUserGroups([]);
//   //   setCsrfToken(null);
//   //   window.location.href = "/"

//   //   // navigate("/");   // React redirect
//   // };


//   const logoutUser = async (isAutoLogout = false) => {
//   try {
//     // Only call MSAL logout for manual logout
//     if (!isAutoLogout) {
//       await authService.logout();
//     }
//   } catch (error) {
//     console.error("Logout error:", error);
//   }

//   // Always clear local storage
//   localStorage.removeItem("token");
//   localStorage.removeItem("csrfToken");

//   setToken(null);
//   setPermissions([]);
//   setUserEmail(null);
//   setUserGroups([]);
//   setCsrfToken(null);

//   window.location.replace("/");
// };


// useEffect(() => {
//   if (!token) return;

//   try {
//     const decoded = JSON.parse(atob(token.split(".")[1]));
//     console.log("exp:",decoded)
//     const exp = decoded.exp;
//     console.log("time:",exp)

//     const currentTime = Math.floor(Date.now() / 1000);
//     const timeLeft = (exp - currentTime) * 1000;
//     console.log("expiration:",timeLeft)
//     if (timeLeft <= 0) {
//       logoutUser(true);
//       return;
//     }

//     const timeout = setTimeout(() => {
//       logoutUser(true);
//     }, timeLeft);

//     return () => clearTimeout(timeout);

//   } catch (error) {
//     console.error("Invalid token");
//     logoutUser();
//   }

// }, [token]);


//   const value = {
//     token,
//     permissions,
//     userEmail,
//     userGroups,
//     csrfToken,
//     authLoading,
//     logoutUser,   
//     setToken,       
//     setCsrfToken, 
//     setUserEmail,
//     setPermissions
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom Hook
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "./auth";
import { getCSRFToken } from "./csrfUtils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [csrfToken, setCsrfToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔹 Logout function
  const logoutUser = (isExpired = false) => {
    console.warn(isExpired ? "⏰ Session expired" : "🚪 User logged out");

    setToken(null);
    setPermissions([]);
    setUserEmail(null);
    setUserGroups([]);
    setCsrfToken(null);

    authService.logout(); // clear storage / cookies

    // Optional redirect
    window.location.replace("/");
  };

  // 🔹 Initial load (token + user + csrf)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const fetchedToken = await authService.getToken();

        if (!fetchedToken) {
          setAuthLoading(false);
          return;
        }

        const dataObject = JSON.parse(fetchedToken || "{}");
        const userData = dataObject?.data || {};

        setToken(userData.token || null);
        setUserEmail(userData.email || null);
        setPermissions(userData.permissions || []);

        const groups = await authService.getUserGroup();
        setUserGroups(groups || []);

        // ✅ Correct CSRF fetch
        const csrf = await getCSRFToken();
        setCsrfToken(csrf);

      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        logoutUser();
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 🔹 Auto logout on JWT expiry
  useEffect(() => {
    if (!token) return;

    let timeout;

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));

      const exp = decoded?.exp;
      console.log("time:",exp)
      if (!exp) throw new Error("No exp in token");

      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = (exp - currentTime) * 1000;
console.log("timeout",timeLeft)
      if (timeLeft <= 0) {
        logoutUser(true);
        return;
      }

      timeout = setTimeout(() => {
        logoutUser(true);
      }, timeLeft);

    } catch (error) {
      console.error("❌ Invalid token:", error);
      logoutUser();
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };

  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        permissions,
        userEmail,
        userGroups,
        csrfToken,
        authLoading,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Custom hook
export const useAuth = () => useContext(AuthContext);