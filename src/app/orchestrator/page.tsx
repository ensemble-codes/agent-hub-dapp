"use client";
import { AppHeader, Loader, SideMenu } from "@/components";
import { useConversation } from "@/hooks/useConversation";
import { useXMTP } from "@/context/XMTPContext";
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
import { useSearchParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useAccount, useSignMessage } from "wagmi";
import { createEOASigner } from "@/utils";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isInitializing, setIsInitializing] = useState(false);

  const GET_AGENT = useMemo(
    () => gql`
      query MyQuery {
        agent(id: "${
          agentAddress || "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"
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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { getMessages, streamMessages, messages, send, loading, conversation } =
    useConversation(
      agentAddress || "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"
    );
  const { client, initialize, initializing } = useXMTP();

  // Initialize XMTP client when the page loads
  useEffect(() => {
    const initializeClient = async () => {
      if (!client && account.isConnected && !isInitializing && !initializing) {
        console.log("Initializing XMTP client...");
        setIsInitializing(true);
        try {
          debugger
          await initialize({
            signer: createEOASigner(
              account.address!,
              (message: string) => signMessageAsync({ message })
            ),
            env: "production",
            loggingLevel: "off"
          });
        } finally {
          setIsInitializing(false);
        }
      }
    };
    initializeClient();
  }, [client, account.isConnected, initialize, initializing, isInitializing]);

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

  // Initialize client and load messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await getMessages();
        await startStream();
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (client && conversation) {
      initializeChat();
    }

    return () => {
      stopStream();
    };
  }, [client, getMessages, startStream, stopStream]);

  const onSendMessage = useCallback(
    async (input?: string) => {
      if (isWaitingForResponse) return;
      const sendInput = input || chatInput;
      if (!sendInput) return;

      setIsWaitingForResponse(true);
      setLastMessageTime(Date.now());
      try {
        await send(sendInput);
        setChatInput("");
      } catch (error) {
        console.error("Error sending message:", error);
        setIsWaitingForResponse(false);
      }
    },
    [chatInput, send, isWaitingForResponse]
  );

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
                                key={message.id}
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
                            !isWaitingForResponse &&
                            client &&
                            conversation
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
                              onClick={
                                !client || !conversation
                                  ? undefined
                                  : () => {
                                      if (
                                        chatInput.trim() &&
                                        !isWaitingForResponse
                                      ) {
                                        onSendMessage();
                                      }
                                    }
                              }
                            >
                              {conversation ? (
                                <img
                                  src="/assets/pixelated-arrow-primary-icon.svg"
                                  alt="arrow"
                                />
                              ) : (
                                <Loader />
                              )}
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
                      Hi, I'm Orchestrator
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
                          chatInput.trim() &&
                          client &&
                          conversation
                        ) {
                          e.preventDefault();
                          setIsChatOpen(true);
                          onSendMessage();
                        }
                      }}
                    />
                    <div
                      className="basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center"
                      onClick={
                        !client || !conversation
                          ? undefined
                          : () => {
                              if (chatInput.trim()) {
                                setIsChatOpen(true);
                                onSendMessage();
                              }
                            }
                      }
                    >
                      {conversation ? (
                        <img
                          src="/assets/pixelated-arrow-primary-icon.svg"
                          alt="arrow"
                        />
                      ) : (
                        <Loader />
                      )}
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
                        onClick={
                          !client || !conversation
                            ? undefined
                            : async () => {
                                setIsChatOpen(true);
                                onSendMessage(
                                  "Help me to hire an AI KoL for my project. The perfect Hype-man!"
                                );
                              }
                        }
                        style={{
                          opacity: !client || !conversation ? 0.7 : 1,
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
                        onClick={
                          !client || !conversation
                            ? undefined
                            : async () => {
                                setIsChatOpen(true);
                                onSendMessage(
                                  "Help me find an expert security researcher to audit my smart contracts"
                                );
                              }
                        }
                        style={{
                          opacity: !client || !conversation ? 0.7 : 1,
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
                        onClick={
                          !client || !conversation
                            ? undefined
                            : async () => {
                                setIsChatOpen(true);
                                onSendMessage(
                                  "Tell me more on how to Swap/Bridge/Provide LP using DeFi Agents"
                                );
                              }
                        }
                        style={{
                          opacity: !client || !conversation ? 0.7 : 1,
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
