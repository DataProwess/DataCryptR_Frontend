import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import authService from "./auth";
import { useNavigate } from "react-router-dom";
import { useUI } from "./Context/UIContext";

const Home = () => {
  
  const {isDisabled, isBlurred} = useUI()
  const [, setCanSeeUserReports] = useState();
  const [canSeeAdminPanel, setCanSeeAdminPanel] = useState();
  const [canSeeLogReports, setCanSeeLogReports] = useState();
  const Navigate = useNavigate();

  useEffect(() => {
    const checkPermissions = async () => {
      const permissions = authService.getPermissions();

      setCanSeeUserReports(permissions.includes("SeeUserReports"));
      setCanSeeAdminPanel(permissions.includes("SeeAdminPanels"));
      setCanSeeLogReports(permissions.includes("SeeLogReports"));
    };

    checkPermissions();
  }, []);

  // onClick Functionalities

  const handleExploreClick = () => {
    Navigate("/container-data");
  };

  const handleAdminPanelClick = () => {
    if (canSeeAdminPanel) {
      Navigate("/admin");
    } else {
      alert("You do not have permission to access the Admin Panel.");
    }
  };
  const handleReportsClick = () => {
    Navigate("/userreports");
  };
  const handleTasksClick = () => {
    Navigate("/tasks");
  };
  const handleLogReportsClick = () => {
    if (canSeeLogReports) {
      Navigate("/logs");
    } else {
      alert("You do not have permission to access Logs.");
    }
  };

  // Specifying the classNames globally
  // parent div style
  const cardStyle = `flex flex-row justify-center items-center w-full h-[25vh] space-x-8 sm:space-x-10 lg:space-x-12`;
  // icons div style
  // const iconCardStyle = `w-[15vw] h-[16vh] bg-white rounded-xl shadow-md shadow-slate-500/50
  //                       flex items-center justify-center cursor-pointer text-purpleshade1
  //                       hover:bg-purpleshade1 hover:text-white`;

  const iconCardStyle = `w-[40vw] sm:w-[25vw] md:w-[18vw] lg:w-[15vw]
  h-[14vh] sm:h-[16vh]
  bg-white rounded-xl shadow-md shadow-slate-500/50 
  flex items-center justify-center
  text-purpleshade1
  text-center
  px-4 sm:px-3 lg:px-2
  break-words
  hover:bg-purpleshade1 hover:text-white`;

  return (
    <>
      <div className="w-screen h-screen bg-primary">
        <div className="w-[100vw] h-[100vh] flex flex-col items-center p-2">
          {/* Navbar Configuaration */}
          <div className={` flex items-center justify-center w-[96vw]   sm:w-[98vw] lg:w-[99vw]   h-[10vh]
             ${isDisabled ? "pointer-events-none" : ""} ${isBlurred ? "pointer-events-none" : ""}`}>
            <Navbar />
          </div>
          {/* Icons to Navigate corresponding Components */}
          <div className={`flex items-center justify-center w-[100vw] flex-1 
             ${isDisabled ? "pointer-events-none" : ""} ${isBlurred ? "pointer-events-none" : ""}`}>
            <div className="flex flex-col items-center justify-center px-2 w-[70vw] h-[65vh] bg-[#F5F6FB] rounded-lg shadow-lg shadow-slate-500/50 space-y-2">
              <div className={cardStyle}>
                <div className={iconCardStyle} onClick={handleExploreClick}>
                  <div className="font-[450] text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">
                    Explore
                  </div>
                </div>
                <div
                  className={`${iconCardStyle}
                ${
                  canSeeAdminPanel
                    ? "hover:bg-purpleshade1 hover:text-white cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                  onClick={canSeeAdminPanel ? handleAdminPanelClick : null}
                >
                  <div className="font-[450] text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">
                    Admin Panel
                  </div>
                </div>
                <div className={iconCardStyle} onClick={handleReportsClick}>
                  <div className="font-[450] text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">
                    Reports
                  </div>
                </div>
              </div>
              <div className={cardStyle}>
                <div className={iconCardStyle} onClick={handleTasksClick}>
                  <div className="font-[450] text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">
                    Tasks
                  </div>
                </div>
                <div
                  className={`${iconCardStyle}
                ${
                  canSeeLogReports
                    ? "hover:bg-purpleshade1 hover:text-white cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                  onClick={canSeeLogReports ? handleLogReportsClick : null}
                >
                  <div className="font-[450] text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">
                    Logs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
