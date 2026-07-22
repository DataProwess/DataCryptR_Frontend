import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const ModalComponent = ({ isOpen, headers, applyColumnWidths, setIsEditing,onSubmit, onCancel }) => {
  // eslint-disable-next-line 
  const [columnWidths, setColumnWidths] = useState({});
  const [localColumnWidths, setLocalColumnWidths] = useState({});

  useEffect(() => {
    // Initialize local state with the columnWidths prop when the modal opens
    setLocalColumnWidths({});
  }, [isOpen]);

  // Inside your ModalComponent
  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    const newWidths = {};
    headers.forEach((header, index) => {
      const columnName = `Column ${index + 1}`;
      const numericWidth = parseFloat(localColumnWidths[header]) || 0;
  
      // Set the character width for the column
      newWidths[columnName] = numericWidth;
    });
  
    // Call onSubmit with the updated widths
    onSubmit(newWidths);
  
    // Close the modal or perform any other necessary actions
    setIsEditing(false);
  };
  

// Rest of your ModalComponent

//   const handleFormSubmit = (e) => {
//     e.preventDefault();

//     const formData = headers.map((header, index) => {
//       const columnName = `Column ${index + 1}`;
//       const width = columnWidths[header] || null;

//       return {
//         columnName,
//         // value: e.target.elements[columnName]?.value || "",
//         width,
//       };
//     });
// console.log("formData",formData);
//     onSubmit(formData);
//   };

// const handleFormSubmit = (e) => {
//   e.preventDefault();

//   const formData = headers.map((header, index) => {
//     const columnName = `Column${index + 1}`;
//     const width = columnWidths[header] || null;

//     return `${columnName}:${width}`;
//   });

//   console.log("formData", formData);
//   onSubmit(formData);
// };

// const handleFormSubmit = (e) => {
//   e.preventDefault();

//   const newWidths = {};
//   headers.forEach((header, index) => {
//     const columnName = `Column${index + 1}`;
//     const width = columnWidths[header] || null;

//     // Assuming width is a valid number representing character width
//     newWidths[columnName] = width;
//   });

//   console.log("newWidths", newWidths);
//   applyColumnWidths(newWidths);
//   setIsEditing(false);
// };



// const handleFormSubmit = (e) => {
//   e.preventDefault();

//   const newWidths = {};
//   headers.forEach((header, index) => {
//     const columnName = `Column ${index + 1}`;
//     const numericWidth = parseFloat(localColumnWidths[header]) || 0;

//     // Convert numeric width to character width (assuming 20 characters per unit)
//     // const characterWidth = Math.round(numericWidth * 20);

//     // Set the character width for the column
//     newWidths[columnName] = numericWidth;
//     console.log("newwidths",newWidths);
//   });

//   applyColumnWidths(newWidths, 'modal');
//   setIsEditing(false);
// };

  const handleInputChange = (e, header) => {
    const newValue = e.target.value;

    if (/^\d*$/.test(newValue) && newValue >= 0) {
      // setColumnWidths((prevColumnWidths) => ({
      //   ...prevColumnWidths,
      //   [header]: newValue,
      // }));
      setLocalColumnWidths((prevColumnWidths) => ({
        ...prevColumnWidths,
        [header]: newValue,
      }));
    }
  };

  return (
    <Modal className="modal-popup" isOpen={isOpen} onRequestClose={onCancel}>
      <form onSubmit={handleFormSubmit}>
        <h2>Edit Columns</h2>
        {headers.map((header, index) => (
          <div key={index}>
            <label  >
              {`Column ${index + 1}: ` }
             
              {/* <input
                className="columnfield"
                type="text"
                // name={header}
                value={`Column ${index + 1}`}
                style={{ border: "1px solid #ccc", padding: "5px" }}
                /> */}
              <input
                className="columnfield"
                type="text"
                placeholder="Enter width"
                name={`Column ${index + 1}`}
                // value={columnWidths[header] || ""}
                value={localColumnWidths[header] || ""}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleInputChange(e, header)}
                style={{ border: "1px solid #ccc", padding: "5px", marginLeft: "20px" }}
              />
            </label>
          </div>
        ))}
        <button className="submit" type="submit">
          Submit
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </Modal>
  );
};

export default ModalComponent;







