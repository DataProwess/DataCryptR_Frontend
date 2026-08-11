import React from 'react'

const UserDeleteConfirmationPopup = ({
    context,
    onCancel,
    onConfirm,
  }) => {
    const displayName =
      context.name || context.account_name || "the selected user";

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 ml-56 mt-40">
        <div className="bg-white p-6 rounded-lg shadow-top z-50 w-[350px] h-[120px] flex flex-col items-center space-y-4">
          <p className="font-medium text-[11px] text-red-500">
            {/* Are You Sure You want to Delete <span className="text-black">{context.account_name}</span> ? */}
            Are you sure you want to delete{" "}
            <span className="text-red-500">{displayName}</span>?
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              className="w-20 h-7 bg-white text-black text-xs font-medium border border-black rounded-lg"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="w-20 h-7 bg-red-500 text-white text-xs font-medium rounded-lg"
              // onClick={() => onConfirm(userGroupIndex)}
              onClick={() => onConfirm(context)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
}

export default UserDeleteConfirmationPopup