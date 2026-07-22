import React, { useEffect, useState } from "react";
// eslint-disable-next-line
import { Link, useNavigate } from "react-router-dom";
import authService from "./auth";
import Navbar from "./Navbar";
import ProfileModal from "./ProfileModal";
import TimezoneModal from "./TimeZoneModal";

const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});
const NewWelcomePage = () => {
  // eslint-disable-next-line
  const [showChatbot, setShowChatbot] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
  const [selectedNavbarOption, setSelectedNavbarOption] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  // eslint-disable-next-line
  const [canSeeUserReports, setCanSeeUserReports] = useState(false);
  const [canSeeAdminPanel, setCanSeeAdminPanel] = useState(false);
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const Navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [canSeeLogReports, setCanSeeLogReports] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportDimensions, setViewportDimensions] = useState(
    getViewportDimensions()
  );

  // Update dimensions when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions(getViewportDimensions());
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Simulating data loading with setTimeout
    const timeout = setTimeout(() => {
      setLoading(false); // Set loading to false after 500ms (0.5 second)
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      const permissions = authService.getPermissions();

      setCanSeeUserReports(permissions.includes("SeeUserReports"));
      setCanSeeAdminPanel(permissions.includes("SeeAdminPanels"));
      setCanSeeLogReports(permissions.includes("SeeLogReports"));
    };

    checkPermissions();
  }, []);

  const handleAdminPanelClick = () => {
    if (canSeeAdminPanel) {
      Navigate("/admin");
    } else {
      alert("You do not have permission to access the Admin Panel.");
    }
  };

  const handleUserReportsClick = () => {
    Navigate("/userreports");
  };

  const handleLogsReportsClick = () => {
    if (canSeeLogReports) {
      Navigate("/logs");
    } else {
      alert("You do not have permission to access Logs.");
    }
  };

  const handleTaskReportsClick = () => {
    Navigate("/tasks");
  };

  const handleExploreClick = () => {
    Navigate("/container-data");
  };

  const handleLogout = async () => {
    try {
      const name = authService.getUserName();
      if (name === "superuser") {
        localStorage.removeItem("token");
      } else {
        await authService.logout();
      }
      // setUser(null);
      window.location.href = "/";
      // Navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCloseChatbot = () => {
    // setShowChatbot(false); // Set showChatbot to false to hide the chatbot
    setIsTimezoneModalOpen(false);
    setShowProfileModal(false);
    setSelectedNavbarOption(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedNavbarOption(option);
  
    // Determine which modal to open based on the selected option
    if (option === "Profile") {
      setShowProfileModal(true);       // Show ProfileModal
      setIsTimezoneModalOpen(false);   // Ensure TimezoneModal is closed
    } else if (option === "Select Time Zone") {
      setIsTimezoneModalOpen(true);    // Show TimezoneModal
      setShowProfileModal(false);      // Ensure ProfileModal is closed
    }
  };
  

  const { width, height } = getViewportDimensions();
  console.log(height,width)

  const containerWidthPercentage = 77.64;

  return (
    <div className="bg-primary" style={{ height: height, width: width }}>
      <div className="flex flex-col " style={{ height: "100%", width: "100%" }}>
        <div
          className={`flex justify-center  mt-4 ${isTimezoneModalOpen ? "pointer-events-none" : ""} ${
            showProfileModal ? "pointer-events-none" : ""
          }`}
          style={{
            width: "100%",
            height: `${((height * 10) / 100).toFixed(2)}px`,
          }}
        >
          <Navbar
            onOptionSelect={handleOptionSelect}
            selectedOption={selectedNavbarOption}
          />
        </div>
        <div
          className="flex "
          style={{
            width: "100%",
            height: `${((height * 90) / 100).toFixed(2)}px`,
          }}
        >
          <div
            className={` flex flex-col items-center justify-center rounded-xl shadow-md shadow-gray-100/20  
             `} 
            // style={{
              // width: `${((width * 77.64) / 100).toFixed(2)}px`,
              // height: `${((height * 68.64) / 100).toFixed(2)}px`,
              // marginTop: `${((height * 7.01) / 100).toFixed(2)}px`,
              // marginLeft: `${((width * 12.2) / 100).toFixed(2)}px`,
            style={{
              width: '90%',  // Use percentage width for responsiveness
              maxWidth: `${((width * 77.64) / 100).toFixed(2)}px`,
              height: `${((height * 68.64) / 100).toFixed(2)}px`, // Increase maxHeight to allow more height
              opacity: 1,
              background: '#F5F6FB',
              WebkitBackdropFilter: 'blur(10px) brightness(1.2)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              paddingLeft: '10px',
              paddingRight: '10px',
              paddingTop: '20px',  // Increase padding for better spacing
              paddingBottom: '20px',  // Increase padding for better spacing
              overflow: 'auto'  ,// Add overflow to handle content that exceeds container
              marginLeft: `${((width * 12.2) / 100).toFixed(2)}px`,
              marginTop: `${((height * 7.01) / 100).toFixed(2)}px`,
            }}
            // }}
          >
            <div
              className={`flex flex-col items-center justify-center  ${isTimezoneModalOpen ? "blur-effect pointer-events-none" : ""} ${
                showProfileModal ? "blur-effect pointer-events-none" : ""
              }`}
              style={{
                width: `${((width * 61.04) / 100).toFixed(2)}px`,
                height: `${((height * 48.02) / 100).toFixed(2)}px`,
                marginTop: `${
                  `${((height * 68.64) / 100).toFixed(2)}px` *
                  (340 / 1024).toFixed(2)
                }px`,
                marginLeft: `${(
                  `${((width * 77.64) / 100).toFixed(2)}px` *
                  (281 / 1440)
                ).toFixed(2)}px`,
              }}
            >
              <div className="flex flex-col  space-y-12">
                <div className="flex flex-row justify-center items-center space-x-12">
                  <div
                    className=" bg-white rounded-xl shadow-md shadow-slate-500/50 items-center cursor-pointer justify-center flex text-purpleshade1
                   hover:bg-purpleshade1 hover:text-white"
                    style={{
                      width: `${(width * 0.14).toFixed(2)}px`,
                      height: `${(height * 0.17).toFixed(2)}px`,
                    }}
                    onClick={handleExploreClick}
                  >
                    <div className="font-[450] text-xl">Explore</div>
                  </div>

                  <div
                    className={` bg-white rounded-xl shadow-md shadow-slate-500/50 items-center cursor-pointer justify-center flex text-purpleshade1
                  hover:bg-purpleshade1 hover:text-white
                   ${
                     canSeeAdminPanel
                       ? "hover:bg-purpleshade1 hover:text-white cursor-pointer"
                       : "opacity-50 cursor-not-allowed"
                   }`}
                    style={{
                      width: `${(width * 0.14).toFixed(2)}px`,
                      height: `${(height * 0.17).toFixed(2)}px`,
                    }}
                    onClick={canSeeAdminPanel ? handleAdminPanelClick : null}
                  >
                    <div className="font-[450] text-xl">Admin Panel</div>
                  </div>
                  <div
                    className={` bg-white rounded-xl shadow-md shadow-slate-500/50 items-center cursor-pointer justify-center flex text-purpleshade1
                  hover:bg-purpleshade1 hover:text-white`}
                    onClick={handleUserReportsClick}
                    style={{
                      width: `${(width * 0.14).toFixed(2)}px`,
                      height: `${(height * 0.17).toFixed(2)}px`,
                    }}
                  >
                    <div className="font-[450] text-xl">Reports</div>
                  </div>
                </div>
                <div className="flex flex-row justify-center items-center space-x-12">
                  <div
                    className={` bg-white rounded-xl shadow-md shadow-slate-500/50 items-center cursor-pointer justify-center flex text-purpleshade1
                    hover:bg-purpleshade1 hover:text-white`}
                    onClick={handleTaskReportsClick}
                    style={{
                      width: `${(width * 0.14).toFixed(2)}px`,
                      height: `${(height * 0.17).toFixed(2)}px`,
                    }}
                  >
                    <div className="font-[450] text-xl">Tasks</div>
                  </div>

                  <div
                    className={` bg-white rounded-xl shadow-md shadow-slate-500/50 items-center cursor-pointer justify-center flex text-purpleshade1
                    hover:bg-purpleshade1 hover:text-white ${
                      canSeeLogReports
                        ? "hover:bg-purpleshade1 hover:text-white cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={canSeeLogReports ? handleLogsReportsClick : null}
                    style={{
                      width: `${(width * 0.14).toFixed(2)}px`,
                      height: `${(height * 0.17).toFixed(2)}px`,
                    }}
                  >
                    <div className="font-[450] text-xl">Logs</div>
                  </div>
                </div>
              </div>
            </div>
            {showProfileModal && (
              <ProfileModal
                isOpen={showProfileModal}
                onClose={handleCloseChatbot}
              />
            )}
            <div className="relative inline-block">
                  <TimezoneModal
                    isTimezoneModalOpen={isTimezoneModalOpen}
                    setIsTimezoneModalOpen={setIsTimezoneModalOpen}
                    closePreviewModal={handleCloseChatbot}
                    setSelectedNavbarOption={setSelectedNavbarOption}
                  />
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewWelcomePage;
