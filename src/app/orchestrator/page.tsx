"use client";
import { AppHeader, SideMenu } from "@/components";
import { useConsersation } from "@/context/chat/hooks";
import { useChat } from "@/context/chat";
import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
  useMemo,
} from "react";
import { MessageContent } from "@/components/chat/message-content";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSearchParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");

  const GET_AGENT = useMemo(
    () => gql`
      query MyQuery {
        agent(id: "${
          agentAddress || "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184"
        }") {
          id
          metadata {
            description
            dexscreener
            github
            id
            imageUri
            name
            telegram
            twitter
            website
          }
          name
          owner
          reputation
        }
      }
    `,
    [agentAddress]
  );

  const { data: agentData } = useQuery(GET_AGENT);

  // const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { getMessages, streamMessages, messages, send, loading } =
    useConsersation(
      agentAddress || "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"
    );
  const [chatState, chatDispatch, initClient] = useChat();

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
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onSendMessage = useCallback(async () => {
    if (!chatInput || isWaitingForResponse) return;
    setIsWaitingForResponse(true);
    setLastMessageTime(Date.now());
    try {
      if (!chatState.client) {
        await initClient();
        await send(chatInput);
      } else {
        await send(chatInput);
      }
      setChatInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      setIsWaitingForResponse(false);
    }
  }, [chatInput, send, chatState.client, initClient, isWaitingForResponse]);

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
        <div className="flex items-start gap-4 pt-8">
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
                      <Link href={`/agents/${agentData && agentData.agent && agentData.agent.id}`}>
                        <div className="relative">
                          <img
                            src={
                              agentData && agentData.agent
                                ? agentData.agent?.metadata?.imageUri.startsWith(
                                    "https://"
                                  )
                                  ? agentData.agent?.metadata?.imageUri
                                  : `https://${agentData.agent?.metadata?.imageUri}`
                                : "/assets/orchestrator-mascot-icon.svg"
                            }
                            alt="mascot"
                            className="w-10 h-10 border-[0.5px] border-[#8F95B2] rounded-full object-cover"
                          />
                          <img
                            src="/assets/active-icon.svg"
                            alt="active"
                            className="w-2 h-2 absolute bottom-0 right-2"
                          />
                        </div>
                      </Link>
                      <div>
                        <p className="text-primary text-[16px] font-medium">
                          {agentData && agentData.agent
                            ? agentData?.agent?.metadata?.name
                            : "Orchestrator"}
                        </p>
                        <p className="text-[#8F95B2] text-[14px] font-normal">
                          always online
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              {isChatOpen ? (
                <>
                  <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
                    <div
                      ref={messagesContainerRef}
                      className="grow overflow-y-auto w-full h-[80%] mt-[20px]"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-[#8F95B2] text-sm">
                              Loading messages...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {messages.map((message, index) => {
                            const isPreviousFromSameSender =
                              index > 0 &&
                              messages[index - 1].isReceived ===
                                message.isReceived;
                            return (
                              <div
                                key={index}
                                className={`flex ${
                                  !message.isReceived
                                    ? "justify-end"
                                    : "justify-start"
                                } ${
                                  isPreviousFromSameSender ? "mb-1" : "mb-4"
                                }`}
                              >
                                <MessageContent
                                  content={message.content}
                                  isReceived={message.isReceived}
                                />
                              </div>
                            );
                          })}
                          {isWaitingForResponse ? (
                            <div className="flex justify-start mb-4">
                              <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-[2000px]">
                                <div
                                  className="w-2 h-2 bg-[#8F95B2] rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                />
                                <div
                                  className="w-2 h-2 bg-[#8F95B2] rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <div
                                  className="w-2 h-2 bg-[#8F95B2] rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                />
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
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            chatInput.trim() &&
                            !isWaitingForResponse
                          ) {
                            e.preventDefault();
                            onSendMessage();
                          }
                        }}
                        disabled={isWaitingForResponse}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center ${
                                isWaitingForResponse
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                              onClick={() => {
                                if (chatInput.trim() && !isWaitingForResponse) {
                                  onSendMessage();
                                }
                              }}
                            >
                              <img
                                src="/assets/pixelated-arrow-primary-icon.svg"
                                alt="arrow"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Send message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center mt-[128px]">
                  <div className="flex flex-col gap-2 items-center justify-center mb-8">
                    <img
                      src={
                        agentData && agentData.agent
                          ? agentData.agent?.metadata?.imageUri.startsWith(
                              "https://"
                            )
                            ? agentData.agent?.metadata?.imageUri
                            : `https://${agentData.agent?.metadata?.imageUri}`
                          : "/assets/orchestrator-mascot-icon.svg"
                      }
                      alt="mascot"
                      className="w-[120px] h-[120px] rounded-full object-cover"
                    />
                    <p className="text-[18px] text-primary font-medium leading-[100%]">
                      Hi, I'm{" "}
                      {agentData && agentData.agent
                        ? agentData.agent?.metadata?.name
                        : "Orchestrator"}
                      , your ai assistant on agent hub
                    </p>
                    <p className="text-[#121212] text-[14px] font-normal leading-[100%]">
                      What can I help you with?
                    </p>
                  </div>
                  <div className="mb-4 flex items-stretch justify-center max-w-[680px] w-full h-full border border-[#8F95B2] rounded-[8px]">
                    <input
                      placeholder="Let's explore..."
                      className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          chatInput.trim()
                        ) {
                          e.preventDefault();
                          setIsChatOpen(true);
                          onSendMessage();
                        }
                      }}
                    />
                    <div
                      className="basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center"
                      onClick={() => {
                        if (chatInput.trim()) {
                          setIsChatOpen(true);
                          onSendMessage();
                        }
                      }}
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
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div
                            className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]"
                            onClick={() => {
                              setChatInput(
                                "Help me to hire an AI KoL for my project. The perfect Hype-man!"
                              );
                              setIsChatOpen(true);
                              onSendMessage();
                            }}
                          >
                            <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                              Social
                            </p>
                            <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                              Hire an AI KoL for your project. The perfect
                              Hype-man!
                            </p>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">
                                AI KoL Hiring
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Find the perfect AI influencer to promote your
                                project. Get help with:
                              </p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                <li>Content strategy</li>
                                <li>Audience targeting</li>
                                <li>Engagement metrics</li>
                              </ul>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <div
                        className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]"
                        onClick={() => {
                          setChatInput(
                            "Help me find an expert security researcher to audit my smart contracts"
                          );
                          setIsChatOpen(true);
                          onSendMessage();
                        }}
                      >
                        <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                          Security
                        </p>
                        <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                          Expert security researcher to audit your smart
                          contracts
                        </p>
                      </div>
                      <div
                        className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]"
                        onClick={() => {
                          setChatInput(
                            "Tell me more on how to Swap/Bridge/Provide LP using DeFi Agents"
                          );
                          setIsChatOpen(true);
                          onSendMessage();
                        }}
                      >
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

const Page: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
