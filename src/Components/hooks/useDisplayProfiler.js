// // // import { useEffect,useState } from "react"


// // // const useDisplayProfiler = () => {
// // //  const [profile, setProfile] = useState({ zoom: 100, isInspectMode: false });

// // //   useEffect(() => {
// // //     const runDiagnostics = () => {
// // //   // 1. Fallback to standard ratio
// // //   const rawPixelRatio = window.devicePixelRatio || 1;

// // //   /* 2. Fix: Calculate zoom by tracking screen size vs viewport size.
// // //         This ignores the static OS scale factor and isolates the browser window zoom. */
// // //   const browserZoomDecimal = (window.outerWidth - 16) / window.innerWidth; 
// // //   const actualZoom = Math.round(browserZoomDecimal * 100);

// // //   // 3. Map safely to your CSS buckets
// // //   let normalizedZoom = 100;
  
// // //   if (actualZoom >= 120 && actualZoom <= 135) normalizedZoom = 125; // 👈 Handles your 125% view cleanly
// // //   else if (actualZoom > 135 && actualZoom <= 155) normalizedZoom = 143;
// // //   else if (actualZoom > 190 && actualZoom <= 210) normalizedZoom = 200;
// // //   else if (actualZoom > 210) normalizedZoom = 250;

// // //   const scaledInnerWidth = window.innerWidth * rawPixelRatio;
// // //   const screenWidth = window.screen.width;
// // //   const inspectPanelOpen = (screenWidth - scaledInnerWidth) > 40;
  
// // //   setProfile({ zoom: normalizedZoom, isInspectMode: inspectPanelOpen });
// // // };

// // //     window.addEventListener('resize', runDiagnostics);
// // //     runDiagnostics(); // Initialize instantly on mount
    
// // //     return () => window.removeEventListener('resize', runDiagnostics);
// // //   }, []);

// // //   return profile;
// // // }

// // // export default useDisplayProfiler

// // import { useEffect, useState } from "react"

// // const useDisplayProfiler = () => {
// //   const [profile, setProfile] = useState({ zoom: 100, isInspectMode: false });

// //   useEffect(() => {
// //     const runDiagnostics = () => {
// //       // 1. Fallback to standard ratio
// //       const rawPixelRatio = window.devicePixelRatio || 1;

// //       /* 2. Calculate zoom by tracking screen size vs viewport size.
// //             This minimizes the effect of static OS scaling overrides. */
// //       const browserZoomDecimal = (window.outerWidth - 16) / window.innerWidth; 
// //       const actualZoom = Math.round(browserZoomDecimal * 100);

// //       // 3. Optimized CSS Bucket Mapping Engine
// //       let normalizedZoom = 100;
      
// //       if (actualZoom >= 115 && actualZoom <= 134) {
// //         normalizedZoom = 125; 
// //       } else if (actualZoom >= 135 && actualZoom <= 158) {
// //         // 🚀 FIX: This captures the 143% variance and sets the correct 150% profile flag
// //         normalizedZoom = 150; 
// //       } else if (actualZoom > 158 && actualZoom <= 185) {
// //         normalizedZoom = 175;
// //       } else if (actualZoom > 185 && actualZoom <= 215) {
// //         normalizedZoom = 200;
// //       } else if (actualZoom > 215 && actualZoom <= 235) {
// //         normalizedZoom = 227;
// //       } else if (actualZoom > 235) {
// //         normalizedZoom = 250;
// //       }

// //       // 4. Calculate if the developer panel window is currently open
// //       const scaledInnerWidth = window.innerWidth * rawPixelRatio;
// //       const screenWidth = window.screen.width;
// //       const inspectPanelOpen = (screenWidth - scaledInnerWidth) > 40;
      
// //       setProfile({ zoom: normalizedZoom, isInspectMode: inspectPanelOpen });
// //     };

// //     window.addEventListener('resize', runDiagnostics);
// //     runDiagnostics(); // Initialize instantly on mount
    
// //     return () => window.removeEventListener('resize', runDiagnostics);
// //   }, []);

// //   return profile;
// // }

// // export default useDisplayProfiler;

// import { useEffect, useState } from "react"

// const useDisplayProfiler = () => {
//   const [profile, setProfile] = useState({ 
//     zoom: 100, 
//     isInspectMode: false,
//     pixels: { width: 0, height: 0 } // 🚀 Holds the exact layout pixels for your layouts
//   });

//   useEffect(() => {
//     const runDiagnostics = () => {
//       // 1. Fallback to standard ratio
//       const rawPixelRatio = window.devicePixelRatio || 1;

//       /* 2. Calculate zoom by tracking screen size vs viewport size.
//             This minimizes the effect of static OS scaling overrides. */
//       const browserZoomDecimal = (window.outerWidth - 16) / window.innerWidth; 
//       const actualZoom = Math.round(browserZoomDecimal * 100);

//       // 3. Optimized CSS Bucket Mapping Engine
//       let normalizedZoom = 100;
      
//       if (actualZoom >= 115 && actualZoom <= 134) {
//         normalizedZoom = 125; 
//       } else if (actualZoom >= 135 && actualZoom <= 158) {
//         normalizedZoom = 150; 
//       } else if (actualZoom > 158 && actualZoom <= 185) {
//         normalizedZoom = 175;
//       } else if (actualZoom > 185 && actualZoom <= 215) {
//         normalizedZoom = 200;
//       } else if (actualZoom > 215 && actualZoom <= 235) {
//         normalizedZoom = 227;
//       } else if (actualZoom > 235) {
//         normalizedZoom = 250;
//       }

//       // 4. Calculate if the developer panel window is currently open
//       const scaledInnerWidth = window.innerWidth * rawPixelRatio;
//       const screenWidth = window.screen.width;
//       const inspectPanelOpen = (screenWidth - scaledInnerWidth) > 40;
      
//       // 5. Capture the EXACT Layout Pixels currently available to your engine
//       const currentLayoutWidth = window.innerWidth;
//       const currentLayoutHeight = window.innerHeight;

//       setProfile({ 
//         zoom: normalizedZoom, 
//         isInspectMode: inspectPanelOpen,
//         pixels: {
//           width: currentLayoutWidth,   /* 📊 Map this cleanly to check media queries */
//           height: currentLayoutHeight
//         }
//       });
//     };

//     window.addEventListener('resize', runDiagnostics);
//     runDiagnostics(); // Initialize instantly on mount
    
//     return () => window.removeEventListener('resize', runDiagnostics);
//   }, []);

//   return profile;
// }

// export default useDisplayProfiler;

import { useEffect, useState } from "react"

const useDisplayProfiler = () => {
  const [profile, setProfile] = useState({ 
    zoom: 100, 
    isInspectMode: false,
    pixels: { width: 0, height: 0 } 
  });

  useEffect(() => {
    const runDiagnostics = () => {
      // 1. Fallback to standard ratio
      const rawPixelRatio = window.devicePixelRatio || 1;

      /* 2. Calculate zoom by tracking screen size vs viewport size.
            This minimizes the effect of static OS scaling overrides. */
      const browserZoomDecimal = (window.outerWidth - 16) / window.innerWidth; 
      const actualZoom = Math.round(browserZoomDecimal * 100);

      // 3. Optimized Precision CSS Bucket Mapping Engine
      let normalizedZoom = 100;
      
      if (actualZoom < 29) {
        normalizedZoom = 25;   
      } else if (actualZoom >= 29 && actualZoom <= 42) {
        normalizedZoom = 33;   
      } else if (actualZoom >= 43 && actualZoom <= 58) {
        normalizedZoom = 50;   
      } else if (actualZoom >= 59 && actualZoom <= 71) {
        normalizedZoom = 67;   
      } else if (actualZoom >= 72 && actualZoom <= 78) {
        normalizedZoom = 75;   
      } else if (actualZoom >= 79 && actualZoom <= 84) {
        // 🚀 FIX: Captures the 80% zoom level accurately instead of dropping to 75%
        normalizedZoom = 80;   
      } else if (actualZoom >= 85 && actualZoom <= 94) {
        normalizedZoom = 90;   
      } else if (actualZoom >= 95 && actualZoom <= 104) {
        normalizedZoom = 100;  // True 100% Base anchor
      } else if (actualZoom >= 105 && actualZoom <= 114) {
        // 🚀 FIX: Captures the 110% zoom level accurately instead of dropping to 100%
        normalizedZoom = 110;  
      } else if (actualZoom >= 115 && actualZoom <= 134) {
        normalizedZoom = 125; 
      } else if (actualZoom >= 135 && actualZoom <= 158) {
        normalizedZoom = 150; 
      } else if (actualZoom > 158 && actualZoom <= 185) {
        normalizedZoom = 175;
      } else if (actualZoom > 185 && actualZoom <= 215) {
        normalizedZoom = 200;
      } else if (actualZoom > 215 && actualZoom <= 235) {
        normalizedZoom = 227;
      } else if (actualZoom > 235) {
        normalizedZoom = 250;
      }

      // 4. Calculate if the developer panel window is currently open
      const scaledInnerWidth = window.innerWidth * rawPixelRatio;
      const screenWidth = window.screen.width;
      const inspectPanelOpen = (screenWidth - scaledInnerWidth) > 40;
      
      // 5. Capture the EXACT Layout Pixels currently available to your engine
      const currentLayoutWidth = window.innerWidth;
      const currentLayoutHeight = window.innerHeight;

      setProfile({ 
        zoom: normalizedZoom, 
        isInspectMode: inspectPanelOpen,
        pixels: {
          width: currentLayoutWidth,
          height: currentLayoutHeight
        }
      });
    };

    window.addEventListener('resize', runDiagnostics);
    runDiagnostics(); // Initialize instantly on mount
    
    return () => window.removeEventListener('resize', runDiagnostics);
  }, []);

  return profile;
}

export default useDisplayProfiler;

