const AppBg = () => {
  return (
    <>
      <img
        src="/assets/header-bg-net-img.svg"
        alt="bg-net"
        className="w-full fixed top-0 left-0 right-0 z-[-4]"
      />
      <div className="fixed rounded-full right-[-5%] top-[-2%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(254,70,0,0.33)_0%,rgba(254,70,0,0.08)_100%)] w-[502px] h-[502px] max-md:w-[168px] max-md:h-[168px] z-[-3]" />
      <div className="fixed rounded-full left-[15%] top-[5%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(254,70,0,0.33)_0%,rgba(254,70,0,0)_100%)] w-[502px] h-[502px] max-md:w-[168px] max-md:h-[168px] z-[-2] opacity-[68%]" />
      <div className="fixed rounded-full right-[10%] top-[25%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,214,79,0.33)_0%,rgba(0,214,79,0)_100%)] w-[502px] h-[502px] max-md:w-[168px] max-md:h-[168px] z-[-2] opacity-[68%]" />
    </>
  );
};

export default AppBg;
