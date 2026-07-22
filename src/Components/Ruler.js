import React, { useState, useEffect } from 'react';
import './ruler.css'; // Import your CSS file for styling if needed


const Ruler = ({ onRangeSelect, resetRuler, charactersPerInterval, columnWidths, apiData  }) => {
  const initialRulerLength = 100; // Initial length of the ruler in characters
  const interval = charactersPerInterval || 1; // Interval between markings

  // State to track the ruler length in characters
  const [rulerLength, setRulerLength] = useState(initialRulerLength);

  // Calculate the number of markings needed
  const numberOfMarkings = rulerLength / interval;

  // Create an array to store the markings
  const markings = Array.from({ length: numberOfMarkings + 1}, (_, index) => index * interval);
  // console.log(markings)


  // State to track the selected range
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  selectedRange.start = 0;

  // Event handler for marking click
  const handleMarkClick = (mark) => {
    if (selectedRange.start === null || selectedRange.end !== null) {
      setSelectedRange({ start: mark, end: null });
    } else if (mark > selectedRange.start) {
      setSelectedRange({ ...selectedRange, end: mark });
    } else {
      setSelectedRange({ start: mark, end: null });
    }
  };

  // Calculate the range based on the selected start and end
  const calculateRange = () => {
    if (selectedRange.start !== null && selectedRange.end !== null) {
      const range = Math.abs(selectedRange.end - selectedRange.start);
      onRangeSelect(selectedRange.start, selectedRange.start + range);
    }
  };

  // Call calculateRange whenever selectedRange changes
  useEffect(() => {
    calculateRange();
    // eslint-disable-next-line
  }, [selectedRange]);

  // Reset the ruler when resetRuler changes
  useEffect(() => {
    setSelectedRange({ start: null, end: null });
  }, [resetRuler]);

  // Handle extending the ruler
  const handleExtendRuler = () => {
    const extendedRulerLength = rulerLength + 50; // Increase the ruler length by 50 (adjust as needed)
    setRulerLength(extendedRulerLength);
  };

  // Calculate the actual position of each marking based on column widths
  // eslint-disable-next-line 
  const calculateMarkPosition = (mark) => {
    let position = mark;
    
    if (columnWidths && typeof columnWidths === 'object') {
      for (const width of Object.values(columnWidths)) {
        if (position >= width) {
          position += 1; // Add 1 for each character
          console.log("pos",position);
        }
      }
    }
  
    return position;
  };

  const calculateCharacterWidth = (char) => {
    // Ensure apiData is defined and it's an array
    if (apiData && Array.isArray(apiData)) {
      // Assuming apiData is an array of objects with character and width properties
      const characterInfo = apiData.find((info) => info.character === char);
      return characterInfo ? characterInfo.width : 10; // Default to 10 if width is not available
    }
    return 10; // Default to 10 if apiData is not defined or not an array
  };
  

  return (
    <div className="ruler">
      {markings.map((mark, index) => (
        <div key={index} className="marking" onClick={() => handleMarkClick(mark)}>
          {index >= 0 && (
            <>
              <div
                className={`line${
                  selectedRange.start === mark || selectedRange.end === mark ? ' selected' : ''
                }`}
              />
              {index % 5 === 0 && (
                // <div
                //   className={`cm-number${
                //     selectedRange.start === mark || selectedRange.end === mark ? ' selected' : ''
                //   }`}
                // >
                //   {mark}
                //   {/* {calculateMarkPosition(mark)} */}
                // </div>

                <div
                  className={`cm-number${
                    selectedRange.start === mark || selectedRange.end === mark ? ' selected' : ''
                  }`}
                  style={{ width: `${calculateCharacterWidth(String(mark))}px` }}
                >
                  {mark}
                </div>
              )}
            </>
          )}
        </div>
      ))}
      <button onClick={handleExtendRuler}>Extend Ruler</button>
    </div>
  );
};



// const Ruler = ({ onRangeSelect, resetRuler, charactersPerInterval }) => {
//   const rulerLength = 50; // Length of the ruler in centimeters
//   const interval = charactersPerInterval || 1; // Interval between markings

//   // Calculate the number of markings needed
//   const numberOfMarkings = rulerLength / interval;

//   // Create an array to store the markings
//   const markings = Array.from({ length: numberOfMarkings + 1 }, (_, index) => index * interval);

//   // State to track the selected range
//   const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
//   selectedRange.start = 0;

//   // Event handler for marking click
//   const handleMarkClick = (mark) => {
//     if (selectedRange.start === null || selectedRange.end !== null) {
//       setSelectedRange({ start: mark, end: null });
//     } else if (mark > selectedRange.start) {
//       setSelectedRange({ ...selectedRange, end: mark });
//     } else {
//       setSelectedRange({ start: mark, end: null });
//       console.log(selectedRange);
//     }
//   };

//   // Calculate the range based on the selected start and end
//   const calculateRange = () => {
//     if (selectedRange.start !== null && selectedRange.end !== null) {
//         const range = Math.abs(selectedRange.end - selectedRange.start);
//         console.log(range);
//       onRangeSelect(selectedRange.start, selectedRange.end);
//     //   console.log(onRangeSelect);
//     }
//   };

//   // Call calculateRange whenever selectedRange changes
//  useEffect(() => {
//     calculateRange();
//     // eslint-disable-next-line 
//   }, [selectedRange]);

//   // Reset the ruler when resetRuler changes
//   useEffect(() => {
//     setSelectedRange({ start: null, end: null });
//   }, [resetRuler]);

//   return (
//     <div className="ruler">
//       {markings.map((mark, index) => (
//         <div key={index} className="marking" onClick={() => handleMarkClick(mark)}>
//           {index >= 0 && <div className={`line${selectedRange.start === mark || selectedRange.end === mark ? ' selected' : ''}`} />}
//           <div className={`cm-number${selectedRange.start === mark || selectedRange.end === mark ? ' selected' : ''}`}>{mark}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

export default Ruler;