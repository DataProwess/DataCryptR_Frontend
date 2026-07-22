import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useUI } from "../Context/UIContext";
import authService from "../auth";

const ProfileModal = () => {
  const { showProfileModal, setShowProfileModal, setSelectedOption } = useUI();

  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // ✅ Get data from localStorage via authService
  useEffect(() => {
    if (showProfileModal) {
      try {
        const username = authService.getUserName();
        const email = authService.getEmail();
        const role = authService.getRole();
        const perms = authService.getPermissions() || [];

        setUser({
          username,
          email,
          role,
        });

        setPermissions(perms);
      } catch (error) {
        console.error("❌ Error reading user from localStorage:", error);
      }
    }
  }, [showProfileModal]);

  const formatPermissions = (permissions) => {
    const rows = [];
    for (let i = 0; i < permissions.length; i += 3) {
      rows.push(permissions.slice(i, i + 3));
    }
    return rows;
  };

  const formattedPermissions = formatPermissions(permissions);

  const handleClose = () => {
    setShowProfileModal(false);
    setSelectedOption(null);
  };

  return (
    <Modal
      isOpen={showProfileModal}
      // onRequestClose={handleClose}
      contentLabel="Profile Modal"
      overlayClassName="overlay-blur z-[9999]"
      className="fixed left-[50%] transform -translate-x-1/2 bg-white border z-1000 
      w-[35%] h-[80%] overflow-y-auto mt-[60px] rounded-md shadow-top border-none"
    >
      <div className="w-full h-full flex flex-col space-y-4 px-8 py-4">

        {/* CLOSE */}
        <div className="flex justify-end">
          <button 
          // onClick={handleClose}
          onClick={() => {
            setShowProfileModal(false)
            setSelectedOption(null)
          }}
          >
          
            <img
              src={process.env.PUBLIC_URL + "/closefile.png"}
              alt="close"
              className="h-4 w-4"
            />
          </button>
        </div>

        {/* USER INFO */}
        {user ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full border">
                <img
                  src={process.env.PUBLIC_URL + "/dlogo.jpeg"}
                  alt="profile"
                  className="w-full h-full rounded-full"
                />
              </div>

              <div>
                <span className="text-sm font-medium">
                  {user.username}
                </span>
                <br />
                <span className="text-xs">
                  {user.email}
                </span>
              </div>
            </div>

            <hr />

            <div className="flex justify-between">
              <label>Name</label>
              <span>{user.username}</span>
            </div>

            <hr />

            <div className="flex justify-between">
              <label>Email</label>
              <span>{user.email}</span>
            </div>

            <hr />

            <div className="flex justify-between">
              <label>Role</label>
              <span>{user.role}</span>
            </div>

            <hr />

            {/* PERMISSIONS */}
            <div>
              <label>Permissions</label>

              <div className="mt-2 space-y-2">
                {formattedPermissions.map((row, index) => (
                  <div key={index} className="flex space-x-2">
                    {row.map((perm, i) => (
                      <span
                        key={i}
                        className="bg-purple-200 px-2 py-1 text-xs rounded flex-1 text-center"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;