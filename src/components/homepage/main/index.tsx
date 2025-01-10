import { FC } from "react";

interface MainProps {
  selectedService: (service: string) => void;
}

const Main: FC<MainProps> = ({ selectedService }) => {
  return (
    <div className="w-full flex flex-col items-start gap-16 mt-3">
      <div className="space-y-3 w-full">
        <p className="font-spaceranger text-[28px] leading-[25px] text-primary">
          Social services
        </p>
        <div className="flex items-stretch w-full gap-4 overflow-auto" style={{ scrollbarWidth: "none" }}>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">
                  BULL POST
                </p>
                <img src="/assets/bull-post-icon.svg" alt="bull-post" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Select an AI KOL your project.
                <br />
                The perfect Hype-man!
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/users-icon.svg" alt="users" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    8,150 users
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-gradient-to-[317.7deg] from-[rgba(0,0,0,0.4)] to-[rgba(255,255,255,0.4)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  onClick={() => selectedService("bull post")}
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Select
                  </span>
                  <img
                    src="/assets/pixelated-arrow-icon.svg"
                    alt="pixelated-arrow"
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">REPLY</p>
                <img src="/assets/reply-icon.svg" alt="reply" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Reply agents are great for interaction and possibly farm
                airdrops/whitelist spots!
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/users-icon.svg" alt="users" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    4,200 users
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-gradient-to-[317.7deg] from-[rgba(0,0,0,0.4)] to-[rgba(255,255,255,0.4)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  onClick={() => selectedService("reply")}
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Select
                  </span>
                  <img
                    src="/assets/pixelated-arrow-icon.svg"
                    alt="pixelated-arrow"
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">
                  CAMPAIGN
                </p>
                <img src="/assets/campaign-icon.svg" alt="campaign" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Agents will run a campaign on your behalf, ensuring attention
                and consistency
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/users-icon.svg" alt="users" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    1,500 users
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-gradient-to-[317.7deg] from-[rgba(0,0,0,0.4)] to-[rgba(255,255,255,0.4)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  onClick={() => selectedService("campaign")}
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Select
                  </span>
                  <img
                    src="/assets/pixelated-arrow-icon.svg"
                    alt="pixelated-arrow"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 w-full">
        <p className="font-spaceranger text-[28px] leading-[25px] text-primary">
          DeFi services
        </p>
        <div className="flex items-stretch w-full gap-4 overflow-auto" style={{ scrollbarWidth: "none" }}>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">SWAP</p>
                <img src="/assets/swap-icon.svg" alt="swap" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Agent conducts a swap on your behalf using an optimal route with
                less fees
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/clock-outline-icon.svg" alt="clock" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    Jan, 2025
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-[linear-gradient(317.7deg,rgba(0,0,0,0.4)_0%,rgba(255,255,255,0.4)_105.18%)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  disabled
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">BRIDGE</p>
                <img src="/assets/bridge-icon.svg" alt="bridge" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Agent conducts a swap on your behalf using an optimal route with
                less fees
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/clock-outline-icon.svg" alt="clock" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    Jan, 2025
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-[linear-gradient(317.7deg,rgba(0,0,0,0.4)_0%,rgba(255,255,255,0.4)_105.18%)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  disabled
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">
                  PROVIDE LP
                </p>
                <img src="/assets/provide-lp-icon.svg" alt="provide-lp" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Agent conducts a swap on your behalf using an optimal route with
                less fees
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/clock-outline-icon.svg" alt="clock" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    Jan, 2025
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-[linear-gradient(317.7deg,rgba(0,0,0,0.4)_0%,rgba(255,255,255,0.4)_105.18%)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  disabled
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 w-full">
        <p className="font-spaceranger text-[28px] leading-[25px] text-primary">
          Research services
        </p>
        <div className="flex items-stretch w-full gap-4 overflow-auto" style={{ scrollbarWidth: "none" }}>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">MARKETS</p>
                <img src="/assets/markets-icon.svg" alt="markets" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Perfect for analyzing market data and providing accurate
                information
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/clock-outline-icon.svg" alt="clock" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    Feb, 2025
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-[linear-gradient(317.7deg,rgba(0,0,0,0.4)_0%,rgba(255,255,255,0.4)_105.18%)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  disabled
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">TRENDS</p>
                <img src="/assets/trends-icon.svg" alt="trends" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Get up-tp-date with the latest trends in the Crypto world!
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/clock-outline-icon.svg" alt="clock" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    Feb, 2025
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-[linear-gradient(317.7deg,rgba(0,0,0,0.4)_0%,rgba(255,255,255,0.4)_105.18%)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  disabled
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="h-[248px]">
            <div className="w-[256px] h-[232px] bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] py-4 px-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[18px] leading-[24px] font-[500]">
                  AI AGENTS
                </p>
                <img src="/assets/openai-icon.svg" alt="openai" />
              </div>
              <p className="text-light-text-color font-[500] text-[16px] leading-[22px] mb-6 flex-grow">
                Stay updated with the latest on AI Agents!
              </p>
              <div className="flex items-center justify-between w-full gap-2 mt-auto">
                <div>
                  <img src="/assets/clock-outline-icon.svg" alt="clock" />
                  <p className="text-[12px] font-[700] leading-[16px] text-light-text-color">
                    Feb, 2025
                  </p>
                </div>
                <button
                  className="space-x-2 flex items-center justify-center rounded-[50px] bg-[#3D3D3D] bg-[linear-gradient(317.7deg,rgba(0,0,0,0.4)_0%,rgba(255,255,255,0.4)_105.18%)] py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                  disabled
                >
                  <span className="text-white text-[16px] font-[700] leading-[24px]">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
