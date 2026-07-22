// import React from 'react';
// import Modal from 'react-modal';

// const ErrorPopup = ({ isOpen, message, onClose }) => {
//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       contentLabel="Error"
//       overlayClassName="overlay-blur"
//        className="fixed top-456 right-[550px] bg-primary z-[9999] border border-gray-200  rounded-lg  justify-center
//         w-auto h-auto cursor-pointer transition-right-0.3s ease-in-out shadow-2xl p-2 items-center"
//     >
//       <div className="flex justify-end">
//         <button onClick={onClose}>
//           <img
//             src={process.env.PUBLIC_URL + "/closefile.png"}
//             alt="close"
//             className="h-3 w-3"
//           />
//         </button>
//       </div>
//       {/* <h2 className="text-lg font-semibold mb-4">Login Failed</h2> */}
//       <div className='w-full h-full flex flex-col items-center text-black px-6'>
//       <p className='text-xs font-light'>{message}</p>
//       <button
//         onClick={onClose}
//         className="mt-6 bg-darkpurple text-white px-2 py-1 rounded text-xs "
//       >
//         OK
//       </button>
//       </div>
     
//     </Modal>
//   );
// };

// export default ErrorPopup;
import React from 'react';
import Modal from 'react-modal';

const ErrorPopup = ({ isOpen, message, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Error"
      overlayClassName="fixed inset-0  flex justify-center items-center z-[9999]"
      className="bg-white border border-gray-200 space-y-3 rounded-lg shadow-md shadow-slate-500/30 p-2 flex flex-col items-center z-[10000]"
      style={{
        content: {
          width: '25vw',   // 80% of the viewport width
          // height: '20vh',  // 30% of the viewport height
          height: 'auto',   // Height adjusts based on content
          maxHeight: '70vh', // Max height for larger screens
        }
      }}
    >
      <div className="flex justify-end w-full">
        <button onClick={onClose}>
          <img
            src={process.env.PUBLIC_URL + "/closefile.png"}
            alt="close"
            className="h-3 w-3"
          />
        </button>
      </div>

      <div className='w-full h-full flex flex-col space-y-5 items-center text-black '>
        <p className='text-xs font-light text-center'>{message}</p>
        <button
                className="w-16 h-6 text-white text-xs bg-purpleshade1 font-medium border border-none rounded-lg"
          onClick={onClose}
         
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

export default ErrorPopup;


