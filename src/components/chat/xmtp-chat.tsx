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
  memo,
} from "react";
import { MessageContent } from "@/components/chat/message-content";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { createEOASigner } from "@/utils";
import { AgentServicesTable } from "@/components/chat/agent-services-table";
import { ServiceDetailsCard } from "@/components/chat/service-details-card";
import { StructuredMessage } from "@/components/chat/structured-message";
import { useContext } from "react";
import { AppContext } from "@/context/app";
import { getAddress } from "ethers";

export const XmtpChat: FC<{
  agent: {
    id: string;
    metadata: {
      imageUri: string;
      prompts: string[];
      name: string;
    };
  };
}> = ({ agent }) => {
  const { user, authenticated } = usePrivy();
  const [state] = useContext(AppContext);
  const account = {
    isConnected: authenticated,
    address: state.embeddedWallet?.address,
  };
  const signMessageAsync = async ({ message }: { message: string }) => {
    if (!state.embeddedWallet) {
      throw new Error("No embedded wallet available");
    }
    // Use embedded wallet for signing
    return await state.embeddedWallet.sign(message);
  };
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { getMessages, streamMessages, messages, send, loading, conversation } =
    useConversation(agent.id);
  const { client, initialize, initializing, error: xmtpError } = useXMTP();

  // Initialize XMTP client when the page loads
  useEffect(() => {
    const abortController = new AbortController();

    const initializeClient = async () => {
      if (
        !client &&
        account.isConnected &&
        !isInitializing &&
        !initializing &&
        !abortController.signal.aborted
      ) {
        console.log("Initializing XMTP client...");
        setIsInitializing(true);
        try {
          await initialize({
            signer: createEOASigner(
              state.embeddedWallet?.address as `0x${string}`,
              (message: string) => signMessageAsync({ message })
            ),
            env: "production",
            loggingLevel: "off",
          });
        } catch (error) {
          if (!abortController.signal.aborted) {
            console.error("Failed to initialize XMTP client:", error);
            setConnectionError("Failed to connect to XMTP");
          }
        } finally {
          if (!abortController.signal.aborted) {
            setIsInitializing(false);
          }
        }
      }
    };

    initializeClient();

    return () => {
      abortController.abort();
    };
  }, [
    client,
    account.isConnected,
    initialize,
    initializing,
    isInitializing,
    account.address,
    signMessageAsync,
  ]);

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
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          const lastMessage = container.lastElementChild;

          if (lastMessage) {
            // Use scrollIntoView with better options for smoother scrolling
            lastMessage.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest",
            });
          } else {
            // Fallback to scrollTo if no messages
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      });
    }
  }, []);

  // Throttled scroll to bottom to prevent excessive calls
  const throttledScrollToBottom = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(scrollToBottom, 100);
    };
  }, [scrollToBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const scroll = throttledScrollToBottom();
    scroll();
  }, [messages, throttledScrollToBottom]);

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
      if (!sendInput.trim()) return;

      setIsWaitingForResponse(true);
      setLastMessageTime(Date.now());
      setConnectionError(null); // Clear any previous errors

      try {
        await send(sendInput);
        setChatInput("");
      } catch (error) {
        console.error("Error sending message:", error);
        setConnectionError("Failed to send message. Please try again.");
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
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [isWaitingForResponse]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (
          chatInput.trim() &&
          !isWaitingForResponse &&
          client &&
          conversation
        ) {
          onSendMessage();
        }
      }

      // Escape to clear input
      if (e.key === "Escape") {
        setChatInput("");
        setConnectionError(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [chatInput, isWaitingForResponse, client, conversation, onSendMessage]);

  // Memoized message component for better performance
  const MemoizedMessage = memo(
    ({
      message,
      index,
      messages,
      onSendMessage,
      agentAddress,
      account,
    }: any) => {
      const isPreviousFromSameSender =
        index > 0 && messages[index - 1].isReceived === message.isReceived;

      return (
        <div
          className={`flex ${
            !message.isReceived ? "justify-end" : "justify-start"
          } ${isPreviousFromSameSender ? "mb-1" : "mb-4"}`}
        >
          {message.isReceived ? (
            message.contentType === "json" &&
            message.content.type === "agent_services" ? (
              <AgentServicesTable
                services={message.content?.data?.services}
                onCreateTask={(service) =>
                  onSendMessage(`I want to enable ${service.name} service`)
                }
              />
            ) : message.contentType === "json" &&
              message.content.type === "service_details" ? (
              <ServiceDetailsCard
                service={message.content.data.service}
                agentAddress={agentAddress || ""}
                userAddress={account.address!}
                onCreateTask={(jsonString) => onSendMessage(jsonString)}
              />
            ) : message.contentType === "json" &&
              message.content.type === "agent_list" ? (
              <StructuredMessage content={message.content.content} />
            ) : (
              <MessageContent
                content={message.content}
                isReceived={message.isReceived}
              />
            )
          ) : (
            <MessageContent
              content={message.content}
              isReceived={message.isReceived}
            />
          )}
        </div>
      );
    }
  );

  MemoizedMessage.displayName = "MemoizedMessage";

  return (
    <>
      <div>
        <div className="flex items-start gap-4">
          <SideMenu />
          <div className="grow w-full ">
            <AppHeader />
            <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
              <img
                src="/assets/orchestrator-pattern-bg.svg"
                alt="pattern"
                className="absolute left-0 bottom-0 w-full opacity-40"
              />
              <div className="flex flex-col w-full h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isChatOpen || agent.id ? (
                      <>
                        <Link
                          href={`/agents/${
                            getAddress(agent && agent.id) ||
                            "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={
                                agent
                                  ? agent?.metadata?.imageUri?.startsWith(
                                      "https://"
                                    )
                                    ? agent?.metadata?.imageUri
                                    : `https://${agent?.metadata?.imageUri}`
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
                            {agent ? agent?.metadata?.name : "Orchestrator"}
                          </p>
                          <p className="text-[#8F95B2] text-[14px] font-normal">
                            always online
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                {isChatOpen || agent.id ? (
                  <>
                    {/* Error Display */}
                    {connectionError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>{connectionError}</span>
                          <button
                            onClick={() => setConnectionError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

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
                        ) : messages.length === 0 && !loading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-2 text-center">
                              <img
                                src="/assets/chat-icon.svg"
                                alt="chat"
                                className="w-12 h-12 opacity-50"
                              />
                              <p className="text-[#8F95B2] text-sm">
                                No messages yet. Start a conversation!
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {messages?.map((message, index) => {
                              return (
                                <MemoizedMessage
                                  key={message.id}
                                  message={message}
                                  index={index}
                                  messages={messages}
                                  onSendMessage={onSendMessage}
                                  agentAddress={agent.id || ""}
                                  account={account}
                                />
                              );
                            })}
                            {isWaitingForResponse ? (
                              <div className="flex items-center justify-start mb-4 gap-2">
                                <img
                                  src="/assets/ensemble-highlighted-icon.svg"
                                  alt="loading"
                                  className="w-5 h-5 animate-spin-slow ease-in-out"
                                />
                                <p className="text-[14px] font-medium text-primary">
                                  Loading...
                                </p>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                      {messages.length === 0 &&
                        agent?.metadata?.prompts &&
                        agent?.metadata?.prompts?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {agent.metadata.prompts.map((prompt, idx) => (
                              <button
                                key={idx}
                                className="cursor-pointer px-2 py-[0.5px] text-[14px] font-normal rounded-[20000px] border bg-white text-primary/90 hover:border-primary hover:text-primary transition"
                                onClick={() => onSendMessage(prompt)}
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        )}
                      <div className="h-[40px] flex-shrink-0 flex items-stretch justify-center w-full border border-[#8F95B2] rounded-[8px] bg-white z-[11] relative">
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
                          maxLength={1000}
                        />
                        {/* Character Counter */}
                        {chatInput.length > 800 && (
                          <div className="absolute right-16 top-1 text-xs text-gray-400">
                            {chatInput.length}/1000
                          </div>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center ${
                                  isWaitingForResponse ||
                                  !chatInput.trim() ||
                                  !client ||
                                  !conversation
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-gray-50 transition-colors"
                                }`}
                                onClick={
                                  !client ||
                                  !conversation ||
                                  !chatInput.trim() ||
                                  isWaitingForResponse
                                    ? undefined
                                    : () => {
                                        onSendMessage();
                                      }
                                }
                              >
                                {conversation ? (
                                  <img
                                    src="/assets/pixelated-arrow-primary-icon.svg"
                                    alt="arrow"
                                    className={
                                      !chatInput.trim() || isWaitingForResponse
                                        ? "opacity-50"
                                        : ""
                                    }
                                  />
                                ) : (
                                  <img
                                    src="/assets/ensemble-highlighted-icon.svg"
                                    alt="loading"
                                    className="w-5 h-5 animate-spin-slow ease-in-out"
                                  />
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
                          agent
                            ? agent?.metadata?.imageUri?.startsWith("https://")
                              ? agent?.metadata?.imageUri
                              : `https://${agent?.metadata?.imageUri}`
                            : "/assets/orchestrator-mascot-icon.svg"
                        }
                        alt="mascot"
                        className="w-[120px] h-[120px] rounded-full object-cover"
                      />
                      <p className="text-[18px] text-primary text-center font-medium leading-[100%]">
                        Hi, I'm Orchestrator , your ai assistant on agent hub
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
                            Hire an AI KoL for your project. The perfect
                            Hype-man!
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
      </div>
    </>
  );
};
