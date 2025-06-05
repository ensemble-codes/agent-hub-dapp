"use client";
import { AppHeader, Loader, SideMenu } from "@/components";
import { FC, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { StructuredMessage } from "@/components/chat/structured-message";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useAccount } from "wagmi";
import { AgentServicesTable } from "@/components/chat/agent-services-table";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");
  const account = useAccount();

  const GET_AGENT = gql`
    query MyQuery {
      agent(id: "${agentAddress || "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"}") {
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
  `;

  const { data: agentData } = useQuery(GET_AGENT);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Hardcoded responses
  const hardcodedAgentList = {
    type: "agent_list",
    from: "orchestrator.ensemble",
    to: "user_123",
    content: {
      data: {
        message: "Here are the top Social Agents that can help with DeFi Twitter content:",
        agents: [
          {
            address: "0x123",
            name: "Rabbi Moshe Zalman",
            rating: 4.8,
            price_range: "150-350 credits"
          },
          {
            address: "0x345",
            name: "CryptoSocial Pro",
            rating: 4.6,
            price_range: "200-500 credits"
          }
        ]
      }
    }
  };

  const hardcodedAgentServices = {
    type: "agent_services",
    from: "0x234",
    to: "0x123",
    content: {
      data: {
        services: [
          {
            id: "blessing_service",
            name: "Blessings",
            price: 150,
            currency: "credits"
          },
          {
            id: "bull_post_service",
            name: "Bull Post",
            price: 350,
            currency: "credits"
          },
          {
            id: "thread_creation",
            name: "Twitter Thread",
            price: 250,
            currency: "credits"
          }
        ]
      }
    }
  };

  const onSendMessage = useCallback(
    async (input?: string) => {
      if (isWaitingForResponse) return;
      const sendInput = input || chatInput;
      if (!sendInput) return;

      setIsWaitingForResponse(true);
      
      // Add user message
      setMessages(prev => [...prev, {
        content: sendInput,
        isReceived: false
      }]);

      // Simulate response delay
      setTimeout(() => {
        setMessages(prev => {
          // If this is the first user message, show agent list
          // If this is the second, show agent services
          const userMsgCount = prev.filter(m => !m.isReceived).length;
          if (userMsgCount === 1) {
            return [
              ...prev,
              { content: hardcodedAgentList, isReceived: true }
            ];
          } else if (userMsgCount === 2) {
            return [
              ...prev,
              { content: hardcodedAgentServices, isReceived: true }
            ];
          } else {
            // fallback to agent list for any further messages
            return [
              ...prev,
              { content: hardcodedAgentList, isReceived: true }
            ];
          }
        });
        setIsWaitingForResponse(false);
      }, 1000);

      setChatInput("");
    },
    [chatInput, isWaitingForResponse]
  );

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const scrollOptions = {
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth' as const
      };
      
      // Try using scrollIntoView first (better for mobile)
      const lastMessage = messagesContainerRef.current.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        // Fallback to scrollTo if no messages
        messagesContainerRef.current.scrollTo(scrollOptions);
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <>
      <div>
        <AppHeader />
        <div className="flex items-start gap-4 lg:pt-8">
          <SideMenu />
          <div className="grow w-full lg:!h-[800px] lg:bg-white rounded-[16px] p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
            <img
              src="/assets/orchestrator-pattern-bg.svg"
              alt="pattern"
              className="lg:block hidden absolute left-0 bottom-0 w-full"
            />
            <div className="flex flex-col w-full h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isChatOpen ? (
                    <>
                      <Link
                        href={`/agents/${
                          (agentData &&
                            agentData.agent &&
                            agentData.agent.id) ||
                          "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"
                        }`}
                      >
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
              {isChatOpen || agentAddress ? (
                <>
                  <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
                    <div
                      ref={messagesContainerRef}
                      className="grow overflow-y-auto w-full h-[80%] mt-[20px]"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {messages.map((message, index) => {
                        const isPreviousFromSameSender =
                          index > 0 &&
                          messages[index - 1].isReceived === message.isReceived;
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
                            {message.isReceived ? (
                              message.content.type === 'agent_list' ? (
                                <StructuredMessage {...message.content} />
                              ) : message.content.type === 'agent_services' ? (
                                <AgentServicesTable services={message.content.content.data.services} />
                              ) : null
                            ) : (
                              <div className="bg-primary text-white px-4 py-2 rounded-lg max-w-[80%]">
                                {message.content}
                              </div>
                            )}
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
                <div className="flex flex-col items-center justify-center lg:mt-[128px] mt-[72px]">
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
                    <p className="text-[18px] text-primary text-center font-medium leading-[100%]">
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
                  <div className="flex items-center gap-6 mb-8 lg:flex-nowrap flex-wrap">
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
                    <div className="flex lg:flex-row flex-col items-stretch justify-center gap-4 max-w-[755px] w-full">
                      <div
                        className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]"
                        onClick={() => {
                          setIsChatOpen(true);
                          onSendMessage(
                            "Help me to hire an AI KoL for my project. The perfect Hype-man!"
                          );
                        }}
                      >
                        <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                          Social
                        </p>
                        <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                          Hire an AI KoL for your project. The perfect Hype-man!
                        </p>
                      </div>
                      <div
                        className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]"
                        onClick={() => {
                          setIsChatOpen(true);
                          onSendMessage(
                            "Help me find an expert security researcher to audit my smart contracts"
                          );
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
                          setIsChatOpen(true);
                          onSendMessage(
                            "Tell me more on how to Swap/Bridge/Provide LP using DeFi Agents"
                          );
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
