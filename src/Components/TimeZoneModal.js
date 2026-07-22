import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { API_URL } from './ApiConfig';
import Jsontimezones from "./TimeZones";
const getViewportDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const TimezoneModal = ({
  isTimezoneModalOpen,
  setIsTimezoneModalOpen,
  setSelectedNavbarOption,
  closePreviewModal,
}) => {
 
  // const [isTimezoneModalOpen ,setIsTimezoneModalOpen]= useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFiles, setCustomerFiles] = useState([]);
  const [csrfToken, setCsrfToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState(null);
  const [autoTimezone, setAutoTimezone] = useState(false);
  

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
    setSelectedNavbarOption(null);
   
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
    if (selectedTimeZone) {
      try {
        const response = await fetch(`${API_URL}/update-usertimezone/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            email: userEmail,
            timezone: selectedTimeZone.value,
          }),
        });

        if (response.ok) {
          await updateDatesBasedOnTimezone(selectedTimeZone.value);
          setIsTimezoneModalOpen(false)
        } else {
          console.error("Failed to update timezone:", response.status);
        }
        // setIsTimezoneModalOpen(false);
      } catch (error) {
        console.error("Error updating timezone:", error);
      }
    }
  };

  const convertTimezone = (dateTime, timezone) => {
    return new Date(dateTime).toLocaleString("en-US", {
      timeZone: timezone,
    });
  };

  const filteredTimezoneOptions = timezoneOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClose = () => {
    closePreviewModal();
    setSearchTerm('');
  };

 
  
const {width , height} = getViewportDimensions();
const modalWidth = (width * 0.28).toFixed(2);
const modalHeight = (height * 0.8).toFixed(2);
const marginleft = (width * 0.2).toFixed(2)
const timezoneHeight = (modalHeight * 0.7).toFixed(2)
const listHeight = (timezoneHeight * 0.9).toFixed(2);
const searchWidth = (modalWidth * 0.9).toFixed(2);
const searchHeight = (modalHeight * 0.09).toFixed(2);
const timezoneContainerWidth = (modalWidth * 0.9).toFixed(2);
const timezoneContainerHeight = (modalHeight * 0.7).toFixed(2);
const timelistWidth = (timezoneContainerHeight * 0.95).toFixed(2);
const timelistHeight = (timezoneContainerHeight * 0.9).toFixed(2);




return(
  <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${
    isTimezoneModalOpen ? "block" : "hidden"
  }`}>
    
    <div
      className="relative bg-white flex flex-col   shadow-md shadow-slate-500/30 rounded-lg  transform -translate-x-1/2 transition-right-0.3s ease-in-out"
      style={{
        width: `${modalWidth}px`, // Use viewport width directly
        height: `${modalHeight}px`, // Use viewport height directly
        // boxSizing: 'border-box',
        // padding: '20px',
        marginLeft:`${marginleft}px`
      }}
    >
      <div className='flex flex-col  ' style={{width:`${modalWidth}px`, height:`${modalHeight * 0.12}px`}}>
      <div className=" flex justify-between p-3 "style={{width:`${modalWidth}px`, height:`${((modalHeight * 0.15) * 0.7).toFixed(2)}px`}}>
      <h2 className="text-base font-medium mb-2">Timezone</h2>
        <button
          className="bg-background-100 text-2xl font-semibold "
          onClick={() => {
            closePreviewModal();
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
      <div className=' flex justify-center px-6 items-center' style={{width:`${modalWidth}px`,height:`${searchHeight}px`}}>
      <input
          type="text"
          className=" px-2 py-1 text-sm border font-normal rounded placeholder:text-sm "
          placeholder="Selected Timezone"
          value={selectedTimeZone ? selectedTimeZone.label : ''}
          readOnly
          style={{width:`${searchWidth}px`, height:`${(searchHeight * 0.7).toFixed(2)} `}}
        />

      </div>
      <div className=' flex flex-col  items-center px-3' style={{width:`${modalWidth}px`, height:`${modalHeight * 0.75}px`}}>
        <div className='  border rounded-lg item-center px-2 ' 
        style={{width:`${(modalWidth * 0.9).toFixed(2)}px`, height:`${((modalHeight * 0.75) * 0.98).toFixed(2)}px`}}>
          <div  className=' items-center mt-1 ' 
          style={{width:`${(modalWidth * 0.85).toFixed(2)}px`, height:`${(((modalHeight * 0.75) * 0.98) * 0.1).toFixed(2)}px`}}>
            <div className=" flex flex-row bg-white justify-between items-center px-3 border  rounded"
            style={{width:`${(modalWidth * 0.85).toFixed(2)}px`, height:`${(((modalHeight * 0.75) * 0.98) * 0.08).toFixed(2)}px`}}>
              <input
            type="text"
            className="focus:outline-none  placeholder:text-xs"
            placeholder="Search Timezone"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{width:`${(modalWidth * 0.8).toFixed(2)}px`, height:`${(((modalHeight * 0.75) * 0.98) * 0.06).toFixed(2)}px`}}
          />
          <img
            src={process.env.PUBLIC_URL + "/search_icon.png"}
            alt="search"
            className="w-4 h-4 ml-2"
          />

            </div>

          </div>
          <div className=' flex flex-col overflow-auto scrollbar-thin px-2 text-sm font-normal' 
          style={{width:`${(modalWidth * 0.87).toFixed(2)}px`, height:`${((modalHeight * 0.65) * 0.98).toFixed(2)}px`}}>
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
)
return(
  <div
    className={`fixed inset-0 z-[9999] flex items-center justify-center ${
      isTimezoneModalOpen ? "block" : "hidden"
    }`}
  >
    <div
      className="fixed inset-0 "
      onClick={handleClose}
    ></div>
    <div
      className="relative bg-white flex flex-col   shadow-top p-4 transform -translate-x-1/2 transition-right-0.3s ease-in-out"
      style={{
        width: `${modalWidth}px`, // Use viewport width directly
        height: `${modalHeight}px`, // Use viewport height directly
        // boxSizing: 'border-box',
        // padding: '20px',
        marginLeft:`${marginleft}px`
      }}
    >
      <div className="w-full flex justify-end">
        <button
          className="bg-background-100 text-2xl font-semibold "
          onClick={() => {
            closePreviewModal();
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
      <div className='flex flex-col items-center mt-2' style={{
        width: `${(modalWidth * 0.92).toFixed(2)}px`, // Use viewport width directly
        height: `${(modalHeight * 0.9).toFixed(2)}px`, // Use viewport height directly
        
      }}>
        <div className=' ' style={{width:`${searchWidth}px`,height:`${searchHeight * 0.6}px`}}>
        <h2 className="text-base font-medium mb-2">Timezone</h2>
       
        </div>
        <div className=' flex px-2' style={{width:`${searchWidth}px`,height:`${searchHeight}px`}}>
        <div className="bg-white" style={{width:`${timelistWidth}px`}}>
        <input
          type="text"
          className="w-full h-8 px-2 py-1 text-sm border border-[#8C52FF] rounded placeholder:text-sm"
          placeholder="Selected Timezone"
          value={selectedTimeZone ? selectedTimeZone.label : ''}
          readOnly
        />
      </div>

        </div>
       

        <div className='flex flex-col py-2 items-center border' 
        style={{width:`${timezoneContainerWidth}px`,height:`${timezoneContainerHeight}px`}}>
          <div className=''
          style={{width:`${timelistWidth}px`, height:`${timelistHeight}px`}}>
            <div className=" flex flex-row bg-white justify-between items-center px-3 border border-[#8C52FF] rounded"
          style={{width:`${timelistWidth}px`, height:`${timelistHeight * 0.1}px`}}>
 <input
            type="text"
            className="focus:outline-none w-full placeholder:text-sm"
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
            <div className=''style={{width:`${timelistWidth}px`, height:`${timelistHeight * 0.98}px`}}>
            <ul className=" text-xs font-light mt-2  text-black overflow-y-auto scrollbar-thin"
           style={{
            width:`${timelistWidth}px`, height:`${timelistHeight * 0.9}px`
         
            // scrollbarWidth:"thin"
          }}>
            {filteredTimezoneOptions.length > 0 ? (
              filteredTimezoneOptions.map((option) => (
                <li key={option.value} className="py-0.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleTimezoneOptionClick(option);
                    }}
                    className="hover:bg-[#8C52FF] hover:text-white w-full text-left p-1"
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="py-0.5">No timezones found.</li>
            )}
          </ul>

            </div>

          </div>

        </div>

      </div>
      </div>
      </div>
)


};

export default TimezoneModal;
