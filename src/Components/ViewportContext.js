// import React, { createContext, useContext, useEffect, useState } from 'react';

// const ViewportContext = createContext();

// export const ViewportProvider = ({ children }) => {
//   const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
//   const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

//   useEffect(() => {
//     const handleResize = () => {
//       setViewportHeight(window.innerHeight);
//       setViewportWidth(window.innerWidth);
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize(); // Set initial values

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   return (
//     <ViewportContext.Provider value={{ viewportHeight, viewportWidth }}>
//       {children}
//     </ViewportContext.Provider>
//   );
// };

// export const useViewport = () => useContext(ViewportContext);

import { useState, useEffect } from 'react';

// Custom hook to get the viewport dimensions
export const useViewportDimensions = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial values

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { viewportHeight, viewportWidth };
};

// Utility function to get current viewport dimensions
export const getCurrentViewportDimensions = () => {
  return {
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  };
};

