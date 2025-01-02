import CircularProgress from "../circularprogress";

const SideMenu = () => {
  return (
    <div className="sticky top-[124px] flex-shrink-0 w-[180px] flex flex-col items-start gap-5">
      <div className="py-4 bg-white shadow-[5px_5px_10px_0px_#FE460066,-5px_-5px_10px_0px_#FAFBFFAD] w-full rounded-[50px] flex items-center justify-center gap-4">
        <img src="/assets/marketplace-icon.svg" alt="marketplace-icon" />
        <span className="text-primary font-medium">THE HUB</span>
      </div>
      <div className="p-4 bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] w-full flex flex-col items-start gap-4">
        <div className="space-y-2 w-full">
          <p className="text-light-text-color text-[14px] font-[500] leading-[19px]">
            ACTIVE TASKS
          </p>
          <div className="flex items-center justify-between w-full">
            <div className="space-x-2 flex items-center">
              <img src="/assets/dummy-agent-1-icon.svg" alt="dummy-1" />
              <p className="text-light-text-color font-[500] max-w-[6ch] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                DeFi
              </p>
            </div>
            <CircularProgress progress={25} />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="space-x-2 flex items-center">
              <img src="/assets/dummy-agent-2-icon.svg" alt="dummy-1" />
              <p className="text-light-text-color font-[500] max-w-[6ch] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                Social
              </p>
            </div>
            <CircularProgress progress={84} />
          </div>
        </div>
        <div className="space-y-2 w-full">
          <p className="text-light-text-color text-[14px] font-[500] leading-[19px]">
            PENDING TASKS
          </p>
          <div className="flex items-center justify-between w-full">
            <div className="space-x-2 flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#FFC12166] flex items-center justify-center">
                <img
                  src="/assets/clock-outline-icon.svg"
                  alt="clock-outline"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <p className="text-light-text-color font-[500] max-w-[6ch] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  DeFi
                </p>
                <p className="text-[12px] text-primary">assign agent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white rounded-[200px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] w-full flex items-start justify-between">
        <img
          src="/assets/light-dark-toggle-icon.svg"
          alt="light-dark"
          className="cursor-pointer"
        />
        <img
          src="/assets/help-icon.svg"
          alt="help"
          className="cursor-pointer"
        />
        <img
          src="/assets/power-icon.svg"
          alt="power"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SideMenu;
