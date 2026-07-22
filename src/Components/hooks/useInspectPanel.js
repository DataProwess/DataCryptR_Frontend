import { useState, useEffect } from "react";

const useInspectPanel = () => {
  const [panelState, setPanelState] = useState({
    isOpen: false,
    layoutWidth: window.innerWidth,
    layoutHeight: window.innerHeight,
    panelzoomLevel: 100,
  });

  useEffect(() => {
    const detectPanel = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);

      // Heuristic: DevTools open = significant width reduction or zoom detected
      // Compare outerWidth vs innerWidth, or detect large width drop
      const widthDiff = window.outerWidth - width;
      const isOpen = widthDiff > 200 || zoom > 110; // threshold

      setPanelState({
        isOpen,
        layoutWidth: width,
        layoutHeight: height,
        panelzoomLevel: zoom,
      });
    };

    detectPanel();
    window.addEventListener("resize", detectPanel);
    
    // Also detect DevTools open via keyboard shortcut
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key === "I") || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === "J") || // Ctrl+Shift+J
        (e.ctrlKey && e.key === "U") ||               // Ctrl+U (view source)
        e.key === "F12"                               // F12
      ) {
        setTimeout(detectPanel, 500); // slight delay for panel to open
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", detectPanel);

    return () => {
      window.removeEventListener("resize", detectPanel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return panelState;
};

export default useInspectPanel;
