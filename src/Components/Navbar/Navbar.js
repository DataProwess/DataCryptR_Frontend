import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../auth";
import "./navbar.css";
import { useUI }  from "../Context/UIContext";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});



  const Navbar = () => {
    const {selectedOption,setSelectedOption,setIsTimezoneModalOpen,setShowProfileModal} = useUI()

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userBlockRef = useRef(null);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  // eslint-disable-next-line
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

 
  useEffect(() => {
    const handleResize = () => {
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated) {
        const loggedInUser = await authService.getUserName();
        setUser({ name: loggedInUser });

        const userGroup = await authService.getUserGroup();
        setIsDropdownOpen(false);
      }

      setLoading(false);
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const tableHeight = Math.max(0, viewportHeight);
 

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    // onOptionSelect(option);
     if (option === "Select Time Zone") {
    setIsTimezoneModalOpen(true);
  }

  if (option === "Profile") {
    setShowProfileModal(true);
  }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userBlockRef.current &&
        !userBlockRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [userBlockRef, dropdownRef]);

 
  const handleLogout = async () => {
    try {
      const name = authService.getUserName();
      if (name === 'superuser') {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      else {await authService.logout();}
      // setUser(null);
      // setUserGroups(""); // Reset userGroups on logout
      // setIsMenuOpen(false);
      // setShowDropdown(false); // Close the dropdown on logout
      // navigate("/home");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Handle the error if necessary
    }
  };

  const { width, height } = getViewportDimensions();
  const navWidth = (width * 0.98).toFixed(2); 
  const navHeight = (height * 0.09).toFixed(2);
  const navMarginTop = (height * 0.02).toFixed(2);


  return(
    <>
  
    <div className="navbar-container ">
      <div
        className={`navbar-bar flex flex-row  justify-between navbar-padding items-center bg-white shadow-lg shadow-slate-500/50 rounded-lg `}
      >
       <div className="flex flex-row items-center logo-container ">
        <Link to="/home">
          <img
            // src={process.env.PUBLIC_URL + "/landingpageimg.png"}
            src={process.env.PUBLIC_URL + "/datacryptrlogo.png"}
            alt="landingpage"
            className="logo-image navbar-logo "
          />
        </Link>
      </div>
       <div className="flex justify-end items-center  ">
         {authService.isAuthenticated() ? (
            <div className="text-black  flex align-middle" ref={userBlockRef}>
            <div className="flex navbar-profile-container   items-center space-x-1 z-50 justify-between">
              <div className="navbar-profile-icon rounded-full flex items-center justify-center border border-black">
                <img
                  src={process.env.PUBLIC_URL + "/dlogo.jpeg"}
                  alt="landingpage"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <button
                id="dropdownButton"
                onClick={toggleDropdown}
                className="text-black font-medium rounded-lg text-sm px-2  text-center inline-flex items-center space-x-1"
                type="button"
              >
                <div className="flex flex-col mr-2 items-start">
                  <span className="navbar-profile-username font-medium truncate max-w-[100px]">
                    {authService.getUserName()}
                  </span>
                  <span className="navbar-profile-email truncate max-w-[100px]"
                  title={authService.getEmail()}>
                    {authService.getEmail()}
                  </span>
                </div>
                <svg
                  className={`svg-icon ml-2 transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
            </div>
             {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-4 z-30
                  bg-white border border-primary border-t-0 divide-y divide-white rounded-lg shadow navbar-dropdown "
              >
                <ul className="py-1 px-3 text-xs text-black mt-12">
                  <hr className="text-[#E1E1E1]" />
                  <li>
                    <button
                      type="button"
                      onClick={() => handleOptionClick("Profile")}
                      // className="block px-3 py-2 text-start w-full hover:bg-primary rounded-md"
                      className={`flex items-center px-6 py-2 text-start w-full hover:bg-primary rounded-md navbar-dropdown-ul
                         ${
                           selectedOption === "Profile"
                             ? "text-darkpurple"
                             : "text-black"
                         }`}
                    >
                      <img
                        src={
                          selectedOption === "Profile"
                            ? process.env.PUBLIC_URL +
                              "/purple-profile-icon.png"
                            : process.env.PUBLIC_URL + "/gray-profile-icon.png"
                        }
                        alt="Icon"
                        className="navbar-dropdown-icon mr-3"
                      />
                      Profile
                    </button>
                  </li>
                  <hr className="text-[#E1E1E1]" />
                  <li>
                    <button
                      type="button"
                      onClick={() => handleOptionClick("Select Time Zone")}
                      className={`flex items-center px-6 py-2 text-start w-full hover:bg-primary rounded-md navbar-dropdown-ul
                        ${
                          selectedOption === "Select Time Zone"
                            ? "text-darkpurple"
                            : "text-black"
                        }`}
                    >
                      <img
                        src={
                          selectedOption === "Select Time Zone"
                            ? process.env.PUBLIC_URL +
                              "/purple-timezone-icon.png"
                            : process.env.PUBLIC_URL + "/gray-clock-icon.png"
                        }
                        alt="Icon"
                        className="navbar-dropdown-icon mr-3"
                      />
                     <p> Select Time Zone</p> 
                    </button>
                  </li>
                  <hr className="text-[#E1E1E1]" />

                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`flex items-center px-6 py-2 text-start w-full hover:bg-primary rounded-md navbar-dropdown-ul
                        ${
                          selectedOption === "SignOut"
                            ? "text-darkpurple"
                            : "text-black"
                        }`}
                    >
                      <img
                        src={
                          selectedOption === "SignOut"
                            ? process.env.PUBLIC_URL +
                              "/purple-signout-icon.png"
                            : process.env.PUBLIC_URL + "/gray-signout-icon.png"
                        }
                        alt="Icon"
                        className="navbar-dropdown-icon mr-3"
                      />
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}


            </div>
         ):null}

       </div>
        {/* rest of navbar content */}
      </div>
    </div>
   
    </>
  )

  
};

export default Navbar;