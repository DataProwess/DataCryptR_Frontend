import React, { useEffect, useState, useRef } from "react";
import authService from "./auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "./ErrorPopup";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const LandingPage = () => {
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  // eslint-disable-next-line
  const [showDropdown, setShowDropdown] = useState(false);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true); // Added loading state
  // eslint-disable-next-line
  const navigate = useNavigate();
  // eslint-disable-next-line
  const userBlockRef = useRef(null);
  // eslint-disable-next-line
  const dropdownRef = useRef(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  // eslint-disable-next-line
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line
  const [userGroups, setUserGroups] = useState("");
  // eslint-disable-next-line
  const [canSeeUserReports, setCanSeeUserReports] = useState(false);
  // eslint-disable-next-line
  const [canSeeAdminPanel, setCanSeeAdminPanel] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated) {
        const loggedInUser = await authService.getUserName();
        // const loggedInUser = await authService.getLoginUserName();
        setUser({ name: loggedInUser });

        const userGroup = await authService.getUserGroup();
        setUserGroups(userGroup);

        setIsMenuOpen(false); // Open the menu after user data is fetched
      }

      setLoading(false);
    };

    checkAuthentication();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  useEffect(() => {
    const checkPermissions = async () => {
      const userGroup = await authService.getUserGroup();
      // setIsAdmin(userGroup === 'admin');
      if (userGroup) {
        // Assuming authService.getPermissions() returns an array of user permissions
        const permissions = authService.getPermissions();
        // console.log("permissions", permissions);

        setCanSeeUserReports(permissions.includes("SeeUserReports"));
        setCanSeeAdminPanel(permissions.includes("SeeAdminPanels"));
      } else {
        console.error("User group data not available");
      }
    };

    checkPermissions();
  }, []);

  const closePopup = () => {
    setIsPopupOpen(false);
    setUsername("");
    setPassword("");
    setTotpCode("");
  };

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Step 1: Perform login and get token
      // eslint-disable-next-line
      const token = await authService.loginWithCredentials(
        username,
        password,
        totpCode,
      );
      // console.log("Token:", token);

      // Step 2: Get CSRF token from the login function
      const csrfToken = localStorage.getItem("csrfToken");

      // Step 3: Ensure the CSRF token is available before continuing
      if (csrfToken) {
        // console.log("CSRF token found:", csrfToken);

        // Fetch user details after login
        const userName = await authService.getUserName();
        const userGroup = await authService.getUserGroup();

        // Set user state
        setUser({ name: userName });
        setUserGroups(userGroup);

        // Step 4: Redirect after ensuring CSRF token is set
        window.location.href = "/home";
      } else {
        console.error("CSRF token is not available after login.");
        // setError("Login successful but CSRF token not set.");
        // setIsPopupOpen(true); // Open the popup for the error
        window.location.href = "/home";
      }
    } catch (error) {
      const msg =
        error && error.message
          ? error.message
          : "Login failed. Please check your username, password, and authenticator code.";
      setError(msg);
      setIsPopupOpen(true); // Open the popup for the error
      setIsLoggingIn(false);
    }
  };

  const handleMicrosoftAuthLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Step 1: Perform login using Microsoft authentication
      const loggedInUser = await authService.login();
      setUser(loggedInUser); // Set user state with logged-in user

      // console.log("auth", authService.isAuthenticated());

      // Step 2: Retrieve user groups after authentication
      const userGroup = await authService.getUserGroup();
      setUserGroups(userGroup);

      // console.log("user", loggedInUser);
      // console.log("usergroups", userGroups);

      // Step 3: Check if CSRF token is available in localStorage
      const csrfToken = localStorage.getItem("csrfToken");

      // Step 4: Ensure the CSRF token is present before redirecting
      if (csrfToken) {
        // console.log("CSRF token found:", csrfToken);

        // Redirect to home page after successful login and CSRF token is available
        window.location.href = "/home";
      } else {
        console.error(
          "CSRF token is not available after Microsoft authentication.",
        );
        // Optionally handle the case where the CSRF token is not available
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggingIn(false);
    }
  };

  // eslint-disable-next-line
  const handleLogout = async () => {
    try {
      const name = authService.getUserName();
      if (name === "superuser") {
        localStorage.removeItem("token");
      } else {
        await authService.logout();
      }
      setUser(null);
      setUserGroups(""); // Reset userGroups on logout
      setIsMenuOpen(false);
      setShowDropdown(false); // Close the dropdown on logout
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Handle the error if necessary
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const { width, height } = getViewportDimensions();
  // eslint-disable-next-line
  const navWidth = (width * 0.98).toFixed(2); // Width in pixels
  const navHeight = (height * 0.09).toFixed(2); // Height in pixels
  const navMarginTop = (height * 0.02).toFixed(2); // MarginTop in pixels
  // eslint-disable-next-line
  const containerWidth = (width * 0.91).toFixed(2); // Container Width in pixels
  // eslint-disable-next-line
  const containerHeight = (height * 0.85).toFixed(2); // Container Height in pixels
  const containerMTop = (height * 0.13).toFixed(2); // Container MarginTop in pixels
  // eslint-disable-next-line
  const cMarginTop = `${(
    containerMTop -
    (parseFloat(navHeight) + parseFloat(navMarginTop))
  ).toFixed(2)}`;
  // eslint-disable-next-line
  const PContainerHeight = `${(
    height -
    (parseFloat(navHeight) + parseFloat(navMarginTop))
  ).toFixed(2)}`;
  // eslint-disable-next-line
  const sidebarWidth = `${(width * 0.06).toFixed(2)}`;
  // eslint-disable-next-line
  const sidebarLMargin = `${(width * 0.01).toFixed(2)}`;

  return (
    <div className="" style={{ width: "96vw", height: "100vh" }}>
      {isLoggingIn && (
        <div className="w-full h-[85%] flex flex-col justify-center items-center space-y-4 mt-2 ml-2">
          <img
            src={process.env.PUBLIC_URL + "/loadergif.gif"}
            alt="logo"
            className="animate-spin w-6 h-6"
          />
          <p className="text-logintext font-[450] text-[11px] text-purpleshade1 animate-pulse">
            Logging You In...
          </p>
        </div>
      )}

      <div className=" flex items-center justify-center w-full h-full">
        <div
          className="rounded-md shadow-md shadow-slate-500/30 flex flex-col md:flex-row "
          style={{
            width: "93%", // Use percentage width for responsiveness
            // maxWidth: `${loginContainerWidth}px`,
            height: "75%", // Set height to auto for responsiveness
            // height:`${loginContainerHeight}px`,
            opacity: 1,
            background: "#F5F6FB",
            WebkitBackdropFilter: "blur(10px) brightness(1.2)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            paddingLeft: "10px",
            paddingRight: "5px",
            paddingTop: "5px",
            paddingBottom: "5px",
          }}
        >
          {/* Left half content */}
          <div className="flex-1 flex items-center justify-center p-3">
            <img
              src={process.env.PUBLIC_URL + "/landingpageimage.png"}
              alt="Landing Page"
              className="max-w-full max-h-full rounded-md"
            />
          </div>

          <div
            style={{
              width: "1px",
              backgroundColor: "rgba(128, 128, 128, 0.7)", // Gray color for the divider
              margin: "0 10px",
            }}
          />

          {/* Right half content */}
          <div className="flex-1 flex flex-col   pl-16 justify-center  overflow-auto scrollbar-thin space-y-4">
            <div className="w-[90%] max-w-md ml-5 flex flex-col space-y-4">
              <div className="w-full h-20  flex items-center justify-start">
                <img
                  src={process.env.PUBLIC_URL + "/datacryptrlogo.png"}
                  alt="landingpage"
                  className="w-[220px] h-[50px]"
                />
              </div>
              <div className="w-full flex flex-col space-y-4">
                <form
                  className="flex flex-col space-y-4"
                  onSubmit={handleLogin}
                >
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs text-black font-normal">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="px-2 py-3 w-full text-sm rounded-lg bg-white shadow-md focus:outline-none placeholder:text-xs"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs text-black font-normal">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        minLength="8"
                        className="px-2 py-3 w-full text-sm rounded-lg bg-white shadow-md focus:outline-none placeholder:text-xs"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 text-xs"
                        onClick={handleTogglePassword}
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEye} />
                        ) : (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs text-black font-normal">
                      Authenticator code
                    </label>
                    <input
                      type="text"
                      name="totp_code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={totpCode}
                      onChange={(e) =>
                        setTotpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="6-digit code (Microsoft Authenticator)"
                      className="px-2 py-3 w-full text-sm rounded-lg bg-white shadow-md focus:outline-none placeholder:text-xs tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 w-full  rounded-lg bg-purpleshade1 text-white text-sm shadow-md"
                  >
                    Login
                  </button>
                </form>

                <div className="flex items-center space-x-3 text-secondary">
                  <hr
                    style={{
                      height: "2px",
                      backgroundColor: "lightgray",
                      flex: 1,
                    }}
                    className="flex-grow"
                  />
                  <p className="text-[11px] text-black">or continue with</p>
                  <hr
                    style={{
                      height: "2px",
                      backgroundColor: "lightgray",
                      flex: 1,
                    }}
                    className="flex-grow"
                  />
                </div>

                {/* <button
                className="py-2 w-full rounded-lg bg-white text-black shadow-md flex items-center justify-center space-x-3"
                onClick={handleMicrosoftAuthLogin}
              >
                <img className="w-6 h-6" src="icon-microsoft.png" alt="Microsoft login" />
                <span className="text-xs">Login with Microsoft</span>
              </button> */}
                <button
                  onClick={handleMicrosoftAuthLogin}
                  disabled={isLoggingIn}
                  className="py-2 w-full rounded-lg bg-white text-black shadow-md flex items-center justify-center space-x-3"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      <span className="text-xs">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <img
                        className="w-6 h-6"
                        src="icon-microsoft.png"
                        alt="Microsoft login"
                      />
                      <span className="text-xs">Login with Microsoft</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-black">
                  Copyright &copy; 2024 <span>Data Prowess Pvt. Ltd.</span> All
                  Rights Reserved.
                </p>
              </div>
            </div>
          </div>
          <ErrorPopup
            isOpen={isPopupOpen}
            message={error}
            onClose={closePopup}
          />
        </div>
      </div>
    </div>
  );
};
export default LandingPage;
