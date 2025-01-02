const AppHeader = () => {
  return (
    <>
      <div className="w-full flex items-start justify-between">
        <div className="space-y-1">
          <img
            src="/assets/logo-icon.svg"
            alt="logo"
            className="w-[60px] h-[56px]"
          />
          <p className="font-spaceranger text-[28px] leading-[25px] font-[400] text-text-color">
            AGENT <span className="text-primary">HUB</span>
          </p>
        </div>
        <div className="text-center space-y-2">
          <span className="bg-gradient-to-r from-primary to-[#FF9D78] inline-block text-transparent bg-clip-text text-[40px] leading-[54px] font-[700]">
            Assign AI agents
          </span>
          <p className="text-[24px] leading-[32.4px] font-[400]">
            for Crypto tasks
          </p>
        </div>
        <img
          src="/assets/header-menu-icon.svg"
          alt="header-menu"
          className="cursor-pointer"
        />
      </div>
    </>
  );
};

export default AppHeader;
