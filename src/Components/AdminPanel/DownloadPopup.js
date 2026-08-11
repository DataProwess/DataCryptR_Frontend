import {useEffect}from 'react'

 
  const DownloadPopup = ({ onSelect, onClose,popupRef,handlePopupClose }) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [onClose]);
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white px-4 py-2 rounded-lg shadow-top z-50 w-72 h-36  flex flex-col space-y-4 ml-56 ">
          <div className="flex justify-end">
            <button
              className="bg-background-100 text-2xl font-semibold "
              onClick={handlePopupClose}
            >
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4 "
              />
            </button>
          </div>
          <div className="flex flex-col space-y-4 items-center">
            <p className="font-medium text-sm  text-black ">Download ?</p>
            <div className="flex space-x-4 justify-center">
              <button
                className="w-24  h-6 flex flex-row p-1 ml-4 px-4 rounded-md cursor-pointer
                 justify-center items-center font-medium text-[13px] bg-purpleshade1 text-white "
                onClick={() => {
                  onSelect("Global");
                  onClose();
                }}
              >
                Global
              </button>
              <button
                className="w-24  h-6 p-1 flex flex-row  ml-4 px-4 rounded-md cursor-pointer
                 justify-center items-center font-medium text-[13px] bg-purpleshade1 text-white"
                onClick={() => {
                  onSelect("Local");
                  onClose();
                }}
              >
                Local
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  
}

export default DownloadPopup