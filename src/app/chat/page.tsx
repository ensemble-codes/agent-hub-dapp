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
import { useSearchParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useAccount, useSignMessage } from "wagmi";
import { createEOASigner } from "@/utils";
import { AgentServicesTable } from "@/components/chat/agent-services-table";
import { ServiceDetailsCard } from "@/components/chat/service-details-card";
import { StructuredMessage } from "@/components/chat/structured-message";
import { ChatLayout } from "@/components/chat/chat-layout";
import { WebsocketChat } from "@/components/chat/websocket-chat";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
            signer: createEOASigner(account.address!, (message: string) =>
              signMessageAsync({ message })
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
            <div className="lg:!h-[800px] h-[calc(100dvh-150px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
              <img
                src="/assets/orchestrator-pattern-bg.svg"
                alt="pattern"
                className="absolute left-0 bottom-0 w-full opacity-40"
              />
              <WebsocketChat />
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
