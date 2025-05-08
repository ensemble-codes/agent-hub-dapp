"use client";
import { AppHeader, SideMenu } from "@/components";
import { useConsersation } from "@/context/chat/hooks";
import { FC, useCallback, useEffect, useRef, useState } from "react";

const Page: FC = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { getMessages, streamMessages, messages, send, sync, loading, sending } = useConsersation('0xc1ec8b9ca11ef907b959fed83272266b0e96b58d');

  const stopStreamRef = useRef<() => void | null>(null);

  const startStream = useCallback(async () => {
    stopStreamRef.current = await streamMessages();
  }, [streamMessages]);

  const stopStream = useCallback(() => {
    stopStreamRef.current?.();
    stopStreamRef.current = null;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onSendMessage = useCallback(async () => { 
    if (!chatInput) return;
    setIsWaitingForResponse(true);
    setLastMessageTime(Date.now());
    await send(chatInput);
    setChatInput("");
  }, [chatInput, send]);

  // Listen for new messages to hide the typing indicator
  useEffect(() => {
    if (messages.length > 0 && isWaitingForResponse) {
      const lastMessage = messages[messages.length - 1];
      // Only hide the indicator if we receive a message after our last sent message
      if (lastMessage.isReceived && Date.now() - lastMessageTime > 1000) {
        setIsWaitingForResponse(false);
      }
    }
  }, [messages, isWaitingForResponse, lastMessageTime]);

  // Reset waiting state if no response after timeout
  useEffect(() => {
    if (isWaitingForResponse) {
      const timeout = setTimeout(() => {
        console.log("Timeout reached, resetting waiting state");
        setIsWaitingForResponse(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isWaitingForResponse]);

  useEffect(() => {
    const loadMessages = async () => {
      stopStream();
      await getMessages();
      await startStream();
    };

    loadMessages();

    return () => {
      stopStream();
    };
  }, [getMessages, startStream, stopStream]);

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
                {/* <img
                  src="/assets/orchestrator-sidemenu-icon.svg"
                  alt="side"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setIsSideMenuOpen(true)}
                /> */}
              </div>
              {isSideMenuOpen && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-30 z-10"
                  onClick={() => setIsSideMenuOpen(false)}
                ></div>
              )}
              {/* <div
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
              </div> */}
              {isChatOpen ? (
                <>
                  <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
                    <div 
                      ref={messagesContainerRef}
                      className="grow overflow-y-auto w-full h-[80%] mt-[20px]" 
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#8F95B2] text-sm">Loading messages...</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {messages.map((message, index) => {
                            const isPreviousFromSameSender = index > 0 && messages[index - 1].isReceived === message.isReceived;
                            return (
                              <div 
                                key={index} 
                                className={`flex ${!message.isReceived ? 'justify-end' : 'justify-start'} ${
                                  isPreviousFromSameSender ? 'mb-1' : 'mb-4'
                                }`}
                              >
                                <div 
                                  className={`max-w-[70%] text-[#121212] rounded-[2000px] ${
                                    !message.isReceived 
                                      ? 'py-[2px] px-3 bg-primary/15' 
                                      : ''
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            );
                          })}
                          {isWaitingForResponse ? (
                            <div className="flex justify-start mb-4">
                              <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-[2000px]">
                                <div className="w-2 h-2 bg-[#8F95B2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-[#8F95B2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-[#8F95B2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                    <div className="h-[40px] flex-shrink-0 flex items-stretch justify-center w-full border border-[#8F95B2] rounded-[8px] bg-white z-[11]">
                      <input
                        placeholder="Chat..."
                        className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <div className="basis-[10%] border-x-[1px] border-x-[#8F95B2] flex items-center justify-center cursor-pointer" onClick={() => sync()}>
                        <img src="/assets/attach-icon.svg" alt="attach" />
                      </div>
                      <div
                        className="basis-[10%] flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          onSendMessage();
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
