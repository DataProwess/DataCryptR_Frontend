const DataLoader = () => {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-center items-center space-y-4">
      <img
        src={process.env.PUBLIC_URL + "/loadergif.gif"}
        alt="Loading"
        className="animate-spin w-8 h-8"
      />

      <p className="text-logintext font-[350] text-[13px] animate-pulse">
        Just a moment...
      </p>
    </div>
  );
};

export default DataLoader;