import { useState, useEffect } from "react";
import { API_URL } from "../ApiConfig";
import Jsontimezones from "../TimeZones";
import { updateUserTimezone } from "../Services/FetchContainerdata";
import { useUI } from "../Context/UIContext";

const TimezoneModal = ({
  isTimezoneModalOpen,
  setIsTimezoneModalOpen,
  setSelectedNavbarOption,
  closePreviewModal,
  userEmail,
  csrfToken,
}) => {
  const { setSelectedOption } = useUI();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFiles, setCustomerFiles] = useState([]);
  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState(null);

  useEffect(() => {
    const options = Jsontimezones.map((timezone) => ({
      value: timezone,
      label: timezone,
    }));
    setTimezoneOptions(options);
  }, []);

  useEffect(() => {
    handleTimeZoneChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeZone]);

  const handleTimezoneOptionClick = (option) => {
    setSelectedTimeZone(option);
    setIsTimezoneModalOpen(false);
    // setSelectedNavbarOption(null);
  };

  const updateDatesBasedOnTimezone = async (timezone) => {
    const updatedCustomerFiles = customerFiles.map((file) => ({
      ...file,
      creation_time: convertTimezone(file.creation_time, timezone),
      modified_time: convertTimezone(file.modified_time, timezone),
    }));
    setCustomerFiles(updatedCustomerFiles);
  };

  const handleTimeZoneChange = async () => {
    if (!selectedTimeZone) return;

    try {
      await updateUserTimezone(
        API_URL,
        csrfToken,
        userEmail,
        selectedTimeZone.value,
      );

      await updateDatesBasedOnTimezone(selectedTimeZone.value);

      setIsTimezoneModalOpen(false);
    } catch (error) {
      console.error("Error updating timezone:", error);
    }
  };

  const convertTimezone = (dateTime, timezone) => {
    return new Date(dateTime).toLocaleString("en-US", {
      timeZone: timezone,
    });
  };

  const filteredTimezoneOptions = timezoneOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        isTimezoneModalOpen ? "block" : "hidden"
      }`}
    >
      <div className="w-[28vw] h-[80vh] ml-[20vw] relative bg-white flex flex-col   shadow-md shadow-slate-500/30 rounded-lg  transform -translate-x-1/2 transition-right-0.3s ease-in-out">
        <div className="w-[28vw] h-[6vh] flex flex-col  ">
          <div className=" w-[28vw] h-[5vh] flex justify-between p-3 items-center">
            <h2 className="text-base font-medium ">Timezone</h2>
            <button
              className="bg-background-100 text-2xl font-semibold "
              onClick={() => {
                // closePreviewModal();
                setIsTimezoneModalOpen(false)
                setSelectedOption(null);
                setSearchTerm("");
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/closefile.png"}
                alt="close"
                className="h-4 w-4"
              />
            </button>
          </div>
        </div>
        <div className="w-[28vw] h-[7vh]  flex justify-center px-5 items-center ">
          <input
            type="text"
            className="w-[28vw] h-[5vh] px-2 py-1 text-sm border font-normal rounded placeholder:text-sm "
            placeholder="Selected Timezone"
            value={selectedTimeZone ? selectedTimeZone.label : ""}
            readOnly
          />
        </div>
        <div className="w-[28vw] h-[60vh] flex flex-col  items-center px-2">
          <div className=" w-[25vw] h-[59vh] border rounded-lg item-center px-1 ">
            <div className="w-[24vw] h-[6vh] items-center justify-center mt-1.5">
              <div className="w-[24vw] h-[5vh] flex flex-row bg-white justify-between items-center px-2 border  rounded">
                <input
                  type="text"
                  className="w-[20vw] h-[4vh] focus:outline-none  placeholder:text-xs  p-1"
                  placeholder="Search Timezone"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <img
                  src={process.env.PUBLIC_URL + "/search_icon.png"}
                  alt="search"
                  className="w-4 h-4 ml-2"
                />
              </div>
            </div>
            <div className="w-[24vw] h-[51vh]   flex flex-col overflow-auto scrollbar-thin px-2 text-sm font-normal">
              {filteredTimezoneOptions.length > 0 ? (
                filteredTimezoneOptions.map((option) => (
                  <div key={option.value} className="">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleTimezoneOptionClick(option);
                      }}
                      className="hover:bg-purpleshade1 hover:text-white w-full text-left text-sm font-normal p-1"
                    >
                      {option.label}
                    </button>
                  </div>
                ))
              ) : (
                <li className="py-0.5">No timezones found.</li>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneModal;
