const OptionsItems = ({ item, selectedOption, onClick }) => {
  const isActive = selectedOption === item.key;

  return (
    <div
      className=" box text-xs font-medium text-black  px-4 py-4 cursor-pointer flex flex-row options-item items-center"
      style={{
        backgroundColor: isActive ? "white" : "",
        boxShadow: isActive ? "0px 2px 10px rgba(0, 0, 0, 0.3)" : "none",
        borderRadius: "5px",
        padding: "5px",
      }}
      onClick={() => onClick(item.key)}
    >
      <div className="w-6 h-7 mr-3 flex items-center justify-center">
        <img
          src={
            process.env.PUBLIC_URL + (isActive ? item.activeIcon : item.icon)
          }
          alt="icon"
          className={`${item.size || "w-4 h-5"} object-contain`}
        />
      </div>

      <div className="flex-1">{item.label}</div>
    </div>
  );
};

export default OptionsItems;
