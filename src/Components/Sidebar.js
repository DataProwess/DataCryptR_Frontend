import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import authService from "./auth";

const Sidebar = () => {
  // eslint-disable-next-line
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  // eslint-disable-next-line
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [, setCanSeeUserReports] = useState(false);
  const [canSeeAdminPanel, setCanSeeAdminPanel] = useState(false);
  const [canSeeLogReports, setCanSeeLogReports] = useState(false);
  const [, setCanSeeTaskReports] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const checkPermissions = async () => {
      const permissions = authService.getPermissions();
      setCanSeeUserReports(permissions.includes("SeeUserReports"));
      setCanSeeAdminPanel(permissions.includes("SeeAdminPanels"));
      setCanSeeTaskReports(permissions.includes("CanSeeTasks"));
      setCanSeeLogReports(permissions.includes("SeeLogReports"));
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Call handleResize once to set the initial height and width
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (
      location.pathname.startsWith("/container-data") ||
      location.pathname.startsWith("/files")
    ) {
      setSelectedIcon("explore");
    } else {
      switch (location.pathname) {
        case "/admin":
          setSelectedIcon("adminPanel");
          break;
        case "/userreports":
          setSelectedIcon("reports");
          break;
        case "/tasks":
          setSelectedIcon("tasks");
          break;
        case "/logs":
          setSelectedIcon("logs");
          break;
        default:
          setSelectedIcon(null);
      }
    }
  }, [location.pathname]);

  const handleMouseEnter = (icon) => {
    setHoveredIcon(icon);
  };

  const handleMouseLeave = () => {
    setHoveredIcon(null);
  };

  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName);
  };

  const renderIcon = (iconName, imageUrl, imageUrlDark, link, label) => (
    <Link to={link} onClick={() => handleIconClick(iconName)}>
      <li
        key={iconName}
        className={`rounded flex flex-col  h-14 w-10 sm:w-12 md:w-14 lg:w-16 items-center py-2 
           ${hoveredIcon === iconName ? "bg-primary" : ""} relative `}
        onMouseEnter={() => handleMouseEnter(iconName)}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={link} onClick={() => handleIconClick(iconName)}>
          <div className="relative cursor-pointer">
            <img
              src={selectedIcon === iconName ? imageUrlDark : imageUrl}
              alt={iconName}
              style={{
                width: "19px",
                height: "24px",
                border: "white",
              }}
              onError={(e) =>
                console.error(`Failed to load image: ${e.target.src}`)
              }
            />
            {(hoveredIcon === iconName || selectedIcon === iconName) && (
              <span className="text-xs text-black font-medium absolute top-full left-1/2 transform -translate-x-1/2 ">
                {label}
              </span>
            )}
          </div>
        </Link>
      </li>
    </Link>
  );

  return (
    // <div className=" sm:w-[9vw] md:w-[7vw] lg:w-[6vw] h-[85.5vh] bg-white rounded-lg shadow-lg shadow-slate-500/30 overflow-hidden text-black  flex flex-col items-center">
      <div className="w-full h-full flex flex-col items-center"> 
      <ul className="mt-9 space-y-3 flex flex-col items-center">
        {renderIcon(
          "explore",
          `${process.env.PUBLIC_URL}/Explore.png`,
          `${process.env.PUBLIC_URL}/purple-explore-icon.png`,
          "/container-data",
          "Explore",
        )}
        {canSeeAdminPanel &&
          renderIcon(
            "adminPanel",
            `${process.env.PUBLIC_URL}/admin.png`,
            `${process.env.PUBLIC_URL}/purple-admin-icon.png`,
            "/admin",
            "Admin",
          )}
        {renderIcon(
          "reports",
          `${process.env.PUBLIC_URL}/reports-icon.png`,
          `${process.env.PUBLIC_URL}/purple-reports-icon.png`,
          "/userreports",
          "Reports",
        )}
        {renderIcon(
          "tasks",
          `${process.env.PUBLIC_URL}/tasks-icon.png`,
          `${process.env.PUBLIC_URL}/purple-tasks-icon.png`,
          "/tasks",
          "Tasks",
        )}
        {canSeeLogReports &&
          renderIcon(
            "logs",
            `${process.env.PUBLIC_URL}/logs.png`,
            `${process.env.PUBLIC_URL}/purple-logs-icon.png`,
            "/logs",
            "Logs",
          )}
      </ul>
    </div>
  );
};

export default Sidebar;
