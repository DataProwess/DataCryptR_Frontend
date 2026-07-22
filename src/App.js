import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route ,Outlet} from "react-router-dom";
import "./App.css";
// import LoginPage from './Components/LoginPage';
import authService from "./Components/auth";
import MainLayout from "./Components/MainLayout";
import { fetchAndStoreCSRFToken } from "./Components/csrfUtils";
import "./index.css";
// import PopupData from './Components/PopupData';
import Fixedwidthfile from "./Components/Fixedwidthfile";
import LandingPage from "./Components/LandingPage";
import NewWelcomePage from "./Components/NewWelcomePage";
import ContainerDataScreen from "./Components/ContainerData/ContainerOptionsModal";
import Reports from "./Components/Reports";
// import Logs from "./Components/Logs";
import Logs from "./Components/Logs/Logs";
import NewContainerPage from "./Components/NewContainerPage";
// import Tasks from "./Components/Tasks";
import Tasks from "./Components/Tasks/Tasks";
import Explore from "./Components/Explore";
import NewAdminPanel from "./Components/NewAdminPanel";
import ProtectedRoute from "./Components/ProtectedRoute";
import FileExplore from "./Components/Explore/FileExplore";
import Home from "./Components/Home";
import ContainerData from "./Components/ContainerData/ContainerData";
import S3BucketExplore from "./Components/S3BucketExplore/S3BucketExplore"


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );
  // eslint-disable-next-line
  const [canSeeUserReports, setCanSeeUserReports] = useState(false);
  // eslint-disable-next-line
  const [canSeeAdminPanel, setCanSeeAdminPanel] = useState(false);
  // eslint-disable-next-line
  // const isAuthenticated = authService.isAuthenticated();
  // const navigate = useNavigate();
  // eslint-disable-next-line
 

  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedIn = await authService.isAuthenticated();
      setIsAuthenticated(loggedIn);
    };

    checkAuthStatus();
  }, []);

  // Initialize CSRF token on app startup
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        // Only fetch CSRF token if user is authenticated
        if (authService.isAuthenticated()) {
          console.log('🔄 Initializing CSRF token on app startup...');
          await fetchAndStoreCSRFToken();
        }
      } catch (error) {
        console.error('❌ Error initializing CSRF token:', error);
      }
    };

    initializeCSRF();
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      // eslint-disable-next-line
      const userGroup = await authService.getUserGroup();
      // setIsAdmin(userGroup === 'admin');
      // Assuming authService.getPermissions() returns an array of user permissions
      const permissions = authService.getPermissions();
      setCanSeeUserReports(permissions.includes("SeeUserReports"));
      setCanSeeAdminPanel(permissions.includes("SeeAdminPanels"));
    };
    checkPermissions();
  }, [isAuthenticated]);

  const LayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

  return (
    <Router>
      <div>
        {/* {isAuthenticated && ( */}

        <div>
          <Routes>
            <Route path="/" element={<LandingPage />} />
 <Route element={<LayoutWrapper />}>
            <Route
              path="/home"
              // element={isAuthenticated ? <NewWelcomePage /> : <LandingPage />}
               element={<ProtectedRoute>
                <Home/>
                {/* <NewWelcomePage/> */}
                </ProtectedRoute>}
            />
            <Route path="/files/:containerId" element={
              <ProtectedRoute>
              <Explore />
              {/* <FileExplore/> */}
              </ProtectedRoute>} />

               <Route path="/s3-files/:bucketId" element={
              <ProtectedRoute>
              <S3BucketExplore/>
              {/* <FileExplore/> */}
              </ProtectedRoute>} />

            <Route path="/container-data" element={<ProtectedRoute>
              {/* <NewContainerPage /> */}
              <ContainerData/>
              </ProtectedRoute>} />
            <Route
              path="/container-data/:id"
              element={<ContainerDataScreen />}
            />
            <Route path="/fixedwidth" element={<ProtectedRoute><Fixedwidthfile /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute><NewAdminPanel /></ProtectedRoute>} />
            <Route path="/userreports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
            <Route />
            </Route>
          </Routes>
        </div>
        {/* )} */}
      </div>
    </Router>
  );
}

export default App;
