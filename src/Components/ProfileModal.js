import React from "react";
import Modal from "react-modal";
import authService from "./auth";

const ProfileModal = ({ onClose, isOpen }) => {
  const permissions = authService.getPermissions();

  // Function to format permissions into rows of three
  const formatPermissions = (permissions) => {
    const rows = [];
    for (let i = 0; i < permissions.length; i += 3) {
      rows.push(permissions.slice(i, i + 3));
    }
    return rows;
  };

  const formattedPermissions = formatPermissions(permissions);

  const handleClose = () => {
    // closeModal();
    // closePreviewModal(); // Close the preview modal and reset selections
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Metadata Modal "
      overlayClassName="overlay-blur z-[9999]"
      // overlayClassName="backdrop-filter-none"

      className="fixed left-[50%] transform -translate-x-1/2 bg-white border-1 border-solid border-ccc z-1000 
      w-[35%] h-[80%] overflow-y-auto mt-[60px] cursor-pointer rounded-md transition-right-0.3s ease-in-out shadow-top "
      onAfterOpen={() => {
        // Focus on the radio button when the modal opens
        const tabularRadio = document.getElementById("tabular");
        if (tabularRadio) {
          tabularRadio.focus();
        }
      }}
    >
      <div className="w-full h-full flex flex-col space-y-4  px-8 py-4">
        <div className="w-full h-6 flex justify-end ">
          <button
            className="bg-background-100 text-2xl font-semibold  "
            onClick={onClose}
          >
            <img
              src={process.env.PUBLIC_URL + "/closefile.png"}
              alt="close"
              className="h-4 w-4"
            />
          </button>
        </div>

        <div className="flex h-8 w-auto items-center space-x-1 z-30">
          {/* <FontAwesomeIcon icon={faUserCircle} className="text-xl" /> */}
          <div className="w-10 h-10 mr-2 rounded-full flex items-center justify-center border border-black">
            <img
              src={process.env.PUBLIC_URL + "/dlogo.jpeg"}
              alt="landingpage"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium font-poppins">
              {authService.getUserName()}
            </span>
            <span className="text-xs font-poppins">
              {authService.getEmail()}
            </span>
          </div>
        </div>
        <hr className=" text-lightgray-300" />
        <div className="w-full h-6 flex justify-between items-center ">
          <label className="text-xs font-poppins">Name</label>
          <span className="text-sm font-normal font-poppins">
            {authService.getUserName()}
          </span>
        </div>
        <hr className=" text-lightgray-300" />
        <div className="w-full h-7 flex justify-between items-center ">
          <label className="text-xs font-poppins">Email Id</label>
          <span className="text-xs font-normal font-poppins">
            {authService.getEmail()}
          </span>
        </div>
        <hr className=" text-lightgray-300" />
        <div className="w-full h-7 flex justify-between items-center ">
          <label className="text-xs font-poppins">Role</label>
          <span className="text-xs font-normal font-poppins">
            {authService.getRole()}
          </span>
        </div>
        <hr className=" text-lightgray-300" />
        <div className="w-full h-36 flex flex-col  ">
          <label className="text-xs font-poppins">Permissions</label>
          <div
            className="w-auto h-32 overflow-y-auto space-y-3 mt-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {formattedPermissions.map((row, index) => (
              <div
                key={index}
                className="flex justify-between space-x-2 font-poppins"
              >
                {row.map((permission, subIndex) => (
                  <span
                    key={subIndex}
                    className="bg-[#CDB3FF] px-2 py-2 text-xs text-black rounded text-center font-poppins flex-1 min-w-[100px] w-1/3]"
                    style={{ wordWrap: "break-word" }}
                  >
                    {permission}
                  </span>
                ))}

                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map(
                    (_, placeholderIndex) => (
                      <div
                        key={placeholderIndex}
                        className="w-1/3 font-poppins"
                      ></div>
                    )
                  )}
              </div>
            ))}
          </div>
          {/* <span className="text-xs font-normal">{authService.getPermissions()}</span> */}
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
