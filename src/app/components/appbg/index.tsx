const AppBg = () => {
  return (
    <>
      <img
        src="/assets/header-bg-net-img.svg"
        alt="bg-net"
        className="w-full fixed top-0 left-0 right-0 z-[-4] opacity-[68%]"
      />
      <div className="fixed rounded-full left-[15%] top-[5%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(254,70,0,0.33)_0%,rgba(254,70,0,0)_100%)] w-[502px] h-[502px] max-md:w-[300px] max-md:h-[300px] max-md:left-0 z-[-2] opacity-[68%]" />
      <div className="fixed rounded-full right-[10%] top-[25%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,214,79,0.33)_0%,rgba(0,214,79,0)_100%)] w-[502px] h-[502px] max-md:w-[268px] max-md:h-[268px] max-md:right-0 z-[-2] opacity-[68%]" />
      <img
        src="/assets/left-spherical-vector-icon.svg"
        alt="left-sphere"
        className="fixed top-[10%] left-0 z-[-4] max-md:hidden opacity-[40%]"
      />
      <img
        src="/assets/right-spherical-vector-icon.svg"
        alt="right-sphere"
        className="fixed top-[10%] right-0 z-[-4] max-md:hidden opacity-[40%]"
      />
    </>
  );
};

export default AppBg;
