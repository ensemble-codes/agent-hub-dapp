import { AppHeader, SideMenu } from "@/components";
import { FC } from "react";

const Page: FC = () => {
  return (
    <>
      <div>
        <AppHeader />
        <div className="flex items-start gap-16 pt-16">
          <SideMenu />
          <div className="grow w-full !h-[800px] bg-white rounded-[16px] p-4 border-[0.5px] border-[#8F95B2] relative overflow-x-hidden overflow-y-scroll">
            <img
              src="/assets/orchestrator-pattern-bg.svg"
              alt="pattern"
              className="absolute left-0 bottom-0 w-full"
            />
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-end flex-shrink-0">
                <img
                  src="/assets/orchestrator-sidemenu-icon.svg"
                  alt="side"
                  className="w-6 h-6 cursor-pointer"
                />
              </div>
              <div className="grow flex flex-col items-center justify-center mt-[128px]">
                <div className="flex flex-col gap-2 items-center justify-center mb-8">
                  <img
                    src="/assets/orchestrator-mascot-icon.svg"
                    alt="mascot"
                  />
                  <p className="text-[18px] text-primary font-medium leading-[100%]">
                    Hi, I'm Orchestrator, your ai assistant on agent hub
                  </p>
                  <p className="text-[#121212] text-[14px] font-normal leading-[100%]">
                    What can I help you with?
                  </p>
                </div>
                <div className="mb-4 flex items-stretch justify-center max-w-[680px] w-full h-full border border-[#8F95B2] rounded-[8px]">
                  <input
                    placeholder="Let's explore..."
                    className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                  />
                  <div className="basis-[10%] border-x-[1px] border-x-[#8F95B2] flex items-center justify-center">
                    <img src="/assets/attach-icon.svg" alt="attach" />
                  </div>
                  <div className="basis-[10%] flex items-center justify-center">
                    <img
                      src="/assets/pixelated-arrow-primary-icon.svg"
                      alt="arrow"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-8">
                  <button className="p-2 flex items-center gap-2 border border-[#8F95B2] rounded-[20000px]">
                    <img
                      src="/assets/agenthub-gray-icon.svg"
                      alt="agenthub"
                      className="w-[14px] h-[12px]"
                    />
                    <span className="text-[14px] font-normal text-[#8F95B2] leading-[100%]">
                      Agent Hub
                    </span>
                  </button>
                  <button className="p-2 flex items-center gap-2 border border-[#8F95B2] rounded-[20000px]">
                    <img
                      src="/assets/social-service-icon.svg"
                      alt="agenthub"
                      className="w-4 h-4"
                    />
                    <span className="text-[14px] font-normal text-[#8F95B2] leading-[100%]">
                      Social
                    </span>
                  </button>
                  <button className="p-2 flex items-center gap-2 border border-[#8F95B2] rounded-[20000px]">
                    <img
                      src="/assets/active-service-icon.svg"
                      alt="agenthub"
                      className="w-4 h-4"
                    />
                    <span className="text-[14px] font-normal text-[#8F95B2] leading-[100%]">
                      DeFi
                    </span>
                  </button>
                  <button className="p-2 flex items-center gap-2 border border-[#8F95B2] rounded-[20000px]">
                    <img
                      src="/assets/security-service-icon.svg"
                      alt="agenthub"
                      className="w-4 h-4"
                    />
                    <span className="text-[14px] font-normal text-[#8F95B2] leading-[100%]">
                      Security
                    </span>
                  </button>
                  <button className="p-2 flex items-center gap-2 border border-[#8F95B2] rounded-[20000px]">
                    <img
                      src="/assets/research-service-icon.svg"
                      alt="agenthub"
                      className="w-4 h-4"
                    />
                    <span className="text-[14px] font-normal text-[#8F95B2] leading-[100%]">
                      Research
                    </span>
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-[16px] font-normal text-[#8F95B2] leading-[100%]">
                    Starter Prompts
                  </p>
                  <div className="flex items-stretch justify-center gap-4 max-w-[755px] w-full">
                    <div className="p-4 rounded-[16px] border-[#8F95B2] border">
                      <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                        Social
                      </p>
                      <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                        Hire an AI KoL for your project. The perfect Hype-man!
                      </p>
                    </div>
                    <div className="p-4 rounded-[16px] border-[#8F95B2] border">
                      <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                        Security
                      </p>
                      <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                        Expert security researcher to audit your smart contracts
                      </p>
                    </div>
                    <div className="p-4 rounded-[16px] border-[#8F95B2] border">
                      <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                        DeFi
                      </p>
                      <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                        Swap/Bridge/Provide LP using DeFi Agents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
