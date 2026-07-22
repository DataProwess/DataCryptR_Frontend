import Navbar from "./Navbar";
import GlobalModals from "./Context/GlobalModals";
import { useAuth } from "./AuthContext";

const MainLayout = ({ children }) => {
//   const { token, csrfToken, userEmail } = useAuth();

  return (
    <>
      {/* <Navbar /> */}

      {children}

      {/* ✅ Only ONE place */}
      <GlobalModals
        
      />
    </>
  );
};

export default MainLayout;