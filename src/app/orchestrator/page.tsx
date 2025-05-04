"use client";
import { AppHeader, SideMenu } from "@/components";
import { FC, useState } from "react";

const Page: FC = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatInput, setChatInput] = useState("");

  return (
    <>
      <div>
        <AppHeader />
        <div className="flex items-start gap-16 pt-16">
          <SideMenu />
          <div className="grow w-full !h-[800px] bg-white rounded-[16px] p-4 border-[0.5px] border-[#8F95B2] relative overflow-hidden">
            <img
              src="/assets/orchestrator-pattern-bg.svg"
              alt="pattern"
              className="absolute left-0 bottom-0 w-full"
            />
            <div className="flex flex-col w-full h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isChatOpen ? (
                    <>
                      <div className="relative">
                        <img
                          src="/assets/orchestrator-mascot-icon.svg"
                          alt="mascot"
                          className="w-10 h-10 border-[0.5px] border-[#8F95B2] rounded-full"
                        />
                        <img
                          src="/assets/active-icon.svg"
                          alt="active"
                          className="w-2 h-2 absolute bottom-0 right-2"
                        />
                      </div>
                      <div>
                        <p className="text-primary text-[16px] font-medium">
                          Orchestrator
                        </p>
                        <p className="text-[#8F95B2] text-[14px] font-normal">
                          always online
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
                <img
                  src="/assets/orchestrator-sidemenu-icon.svg"
                  alt="side"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setIsSideMenuOpen(true)}
                />
              </div>
              {isSideMenuOpen && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-30 z-10"
                  onClick={() => setIsSideMenuOpen(false)}
                ></div>
              )}
              <div
                className="bg-white absolute right-0 top-0 h-full border-l border-[#8F95B2] transition-[width] duration-300 ease-in-out z-20"
                style={{ width: isSideMenuOpen ? "50%" : "0" }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src="/assets/cross-black-icon.svg"
                      alt="cross"
                      className="w-6 h-6 cursor-pointer"
                      onClick={() => setIsSideMenuOpen(false)}
                    />
                    <p className="font-medium text-[18px] text-[#121212] leading-[100%]">
                      History
                    </p>
                  </div>
                  <div className="mb-6 flex items-center gap-3 border rounded-[2000px] border-[#8F95B2] py-2 px-4">
                    <img
                      src="/assets/search-icon.svg"
                      alt="search"
                      className="w-4 h-4"
                    />
                    <input
                      className="grow outline-none p-0 border-none text-[16px] placeholder:text-[#8F95B2] text-[#121212]"
                      placeholder="Search"
                    />
                  </div>
                  <div className="flex flex-col gap-4 items-start justify-start mb-6">
                    <p className="font-medium text-[14px] text-primary">
                      Today
                    </p>
                    <p className="text-[#121212] font-normal">
                      DeFi Assistance
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      Bullposting Service
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      Testing the Operator
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 items-start justify-start mb-6">
                    <p className="font-medium text-[14px] text-primary">
                      Yesterday
                    </p>
                    <p className="text-[#121212] font-normal">
                      How many ai coins on solana...
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      Can you help me analyze the...
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      Security Assistance
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      Can you help me analyze the...
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      Security Assistance
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 items-start justify-start mb-6">
                    <p className="font-medium text-[14px] text-primary">
                      April 20th
                    </p>
                    <p className="text-[#121212] font-normal">
                      Vibe blessings for my mom
                    </p>
                    <hr
                      className="w-full border-[0.5px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 80%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <p className="text-[#121212] font-normal">
                      General conversation
                    </p>
                  </div>
                </div>
              </div>
              {isChatOpen ? (
                <>
                  <div className="w-full h-full flex flex-col items-start justify-between gap-[20px]">
                    <div className="grow overflow-y-auto w-full h-[80%] mt-[20px]">
                      <div className="flex justify-end w-full mb-2">
                        <p className="bg-primary/15 py-2 px-4 rounded-[2000px] w-fit text-[#121212] font-normal text-right max-w-[50%]">
                          hi
                        </p>
                      </div>
                      <div className="space-y-4 w-[50%] mb-2">
                        <p className="text-[#121212] font-normal">
                          Hello, this is the Ensemble Orchestrator, your AI
                          sidekick on Agent Hub. What would you like to do?
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="border border-[#8F95B2] rounded-[2000px] py-[2px] px-2">
                            <span className="text-[14px] text-[#8F95B2]">
                              Find Ai Agents
                            </span>
                          </div>
                          <div className="border border-[#8F95B2] rounded-[2000px] py-[2px] px-2">
                            <span className="text-[14px] text-[#8F95B2]">
                              Know more about Agent Hub
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end w-full mb-2">
                        <p className="border border-[#8F95B2] py-[2px] px-2 rounded-[2000px] w-fit text-[#121212] font-normal text-right max-w-[50%]">
                          Find Ai Agents
                        </p>
                      </div>
                      <div className="space-y-4 w-[50%] mb-2">
                        <p className="text-[#121212] font-normal">
                          Sure, I'll get to finding top AI Agents for you. What
                          kind of agent would you like?
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="border border-primary cursor-pointer rounded-[2000px] py-[2px] px-2 flex items-center gap-2">
                            <img
                              src="/assets/social-service-primary-icon.svg"
                              alt="social"
                              className="w-4 h-4"
                            />
                            <span className="text-[14px] text-primary">
                              Social
                            </span>
                          </div>
                          <div className="border border-primary cursor-pointer rounded-[2000px] py-[2px] px-2 flex items-center gap-2">
                            <img
                              src="/assets/active-service-highlighted-icon.svg"
                              alt="defi"
                              className="w-4 h-4"
                            />
                            <span className="text-[14px] text-primary">
                              DeFi
                            </span>
                          </div>
                          <div className="border border-primary cursor-pointer rounded-[2000px] py-[2px] px-2 flex items-center gap-2">
                            <img
                              src="/assets/security-service-primary-icon.svg"
                              alt="security"
                              className="w-4 h-4"
                            />
                            <span className="text-[14px] text-primary">
                              Security
                            </span>
                          </div>
                          <div className="border border-primary cursor-pointer rounded-[2000px] py-[2px] px-2 flex items-center gap-2">
                            <img
                              src="/assets/research-service-primary-icon.svg"
                              alt="research"
                              className="w-4 h-4"
                            />
                            <span className="text-[14px] text-primary">
                              Research
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end w-full mb-2">
                        <div className="border border-[#8F95B2] cursor-pointer rounded-[2000px] py-[2px] px-2 flex items-center gap-2">
                          <img
                            src="/assets/social-service-icon.svg"
                            alt="social"
                            className="w-4 h-4"
                          />
                          <span className="text-[14px] text-[#121212]">
                            Social
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4 w-full">
                        <p className="text-[#121212] font-normal max-w-[60%]">
                          Here are the top Social Agents on Agent Hub. If you'd
                          like to do a specific task, let me know and I'll find
                          the best agent for that particular task!
                        </p>
                        <div className="flex items-stretch gap-4 overflow-x-auto">
                          <div className="border-[0.5px] border-[#8F95B2] p-3 rounded-[8px] w-[300px] flex-shrink-0">
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="w-[70%] flex items-center gap-2">
                                <img
                                  src="/assets/dummy-agent-1-icon.svg"
                                  alt="dummy"
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="w-full">
                                  <p className="text-[#121212] font-medium w-full text-ellipsis overflow-hidden whitespace-nowrap">
                                    Rabbi Moshe Zalman
                                  </p>
                                  <p className="text-[14px] text-[#8F95B2] font-normal">
                                    0x6F...21C0
                                  </p>
                                </div>
                              </div>
                              <div className="bg-[#F94D27]/10 px-2 py-[2px] rounded-[2000px] flex items-center gap-1">
                                <img
                                  src="/assets/star-icon.svg"
                                  alt="star"
                                  className="w-3 h-3"
                                />
                                <span className="text-[14px] text-[#8F95B2] font-medium">
                                  4.5
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-2">
                                <p className="text-[16px] text-[#121212]">
                                  Bull Post
                                </p>
                                <div className="w-2 h-2 rounded-full bg-[#8F95B2]" />
                                <p className="text-[16px] text-[#121212]">
                                  Replies
                                </p>
                                <div className="w-2 h-2 rounded-full bg-[#8F95B2]" />
                                <p className="text-[16px] text-[#121212]">
                                  Blessings
                                </p>
                              </div>
                              <img
                                src="/assets/pixelated-arrow-primary-icon.svg"
                                alt="arrow"
                                className="w-6 h-6"
                              />
                            </div>
                          </div>

                          <div className="border-[0.5px] border-[#8F95B2] p-3 rounded-[8px] w-[300px] flex-shrink-0">
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="w-[70%] flex items-center gap-2">
                                <img
                                  src="/assets/dummy-agent-1-icon.svg"
                                  alt="dummy"
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="w-full">
                                  <p className="text-[#121212] font-medium w-full text-ellipsis overflow-hidden whitespace-nowrap">
                                    Rabbi Moshe Zalman
                                  </p>
                                  <p className="text-[14px] text-[#8F95B2] font-normal">
                                    0x6F...21C0
                                  </p>
                                </div>
                              </div>
                              <div className="bg-[#F94D27]/10 px-2 py-[2px] rounded-[2000px] flex items-center gap-1">
                                <img
                                  src="/assets/star-icon.svg"
                                  alt="star"
                                  className="w-3 h-3"
                                />
                                <span className="text-[14px] text-[#8F95B2] font-medium">
                                  4.5
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-2">
                                <p className="text-[16px] text-[#121212]">
                                  Bull Post
                                </p>
                                <div className="w-2 h-2 rounded-full bg-[#8F95B2]" />
                                <p className="text-[16px] text-[#121212]">
                                  Replies
                                </p>
                                <div className="w-2 h-2 rounded-full bg-[#8F95B2]" />
                                <p className="text-[16px] text-[#121212]">
                                  Blessings
                                </p>
                              </div>
                              <img
                                src="/assets/pixelated-arrow-primary-icon.svg"
                                alt="arrow"
                                className="w-6 h-6"
                              />
                            </div>
                          </div>
                          <div className="border-[0.5px] border-[#8F95B2] p-3 rounded-[8px] w-[300px] flex-shrink-0">
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="w-[70%] flex items-center gap-2">
                                <img
                                  src="/assets/dummy-agent-1-icon.svg"
                                  alt="dummy"
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="w-full">
                                  <p className="text-[#121212] font-medium w-full text-ellipsis overflow-hidden whitespace-nowrap">
                                    Rabbi Moshe Zalman
                                  </p>
                                  <p className="text-[14px] text-[#8F95B2] font-normal">
                                    0x6F...21C0
                                  </p>
                                </div>
                              </div>
                              <div className="bg-[#F94D27]/10 px-2 py-[2px] rounded-[2000px] flex items-center gap-1">
                                <img
                                  src="/assets/star-icon.svg"
                                  alt="star"
                                  className="w-3 h-3"
                                />
                                <span className="text-[14px] text-[#8F95B2] font-medium">
                                  4.5
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-2">
                                <p className="text-[16px] text-[#121212]">
                                  Bull Post
                                </p>
                                <div className="w-2 h-2 rounded-full bg-[#8F95B2]" />
                                <p className="text-[16px] text-[#121212]">
                                  Replies
                                </p>
                                <div className="w-2 h-2 rounded-full bg-[#8F95B2]" />
                                <p className="text-[16px] text-[#121212]">
                                  Blessings
                                </p>
                              </div>
                              <img
                                src="/assets/pixelated-arrow-primary-icon.svg"
                                alt="arrow"
                                className="w-6 h-6"
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-primary">View more</p>
                      </div>
                    </div>
                    <div className="h-[40px] flex-shrink-0 flex items-stretch justify-center w-full border border-[#8F95B2] rounded-[8px] bg-white z-[11]">
                      <input
                        placeholder="Chat..."
                        className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <div className="basis-[10%] border-x-[1px] border-x-[#8F95B2] flex items-center justify-center">
                        <img src="/assets/attach-icon.svg" alt="attach" />
                      </div>
                      <div
                        className="basis-[10%] flex items-center justify-center"
                        onClick={() => {
                          setIsChatOpen(true);
                          setUserInput("");
                        }}
                      >
                        <img
                          src="/assets/pixelated-arrow-primary-icon.svg"
                          alt="arrow"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center mt-[128px]">
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
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                    <div className="basis-[10%] border-x-[1px] border-x-[#8F95B2] flex items-center justify-center">
                      <img src="/assets/attach-icon.svg" alt="attach" />
                    </div>
                    <div
                      className="basis-[10%] flex items-center justify-center"
                      onClick={() => setIsChatOpen(true)}
                    >
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
                          Expert security researcher to audit your smart
                          contracts
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
