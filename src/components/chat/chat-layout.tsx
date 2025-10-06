import { FC, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MemoizedMessage, {
  useClearTimestampsOnNavigation,
} from "../memoized-message";
import { useSearchParams } from "next/navigation";
import { ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";
import axios from "axios";

const ChatLayoutContent: FC<{
  agentId: `${string}-${string}-${string}-${string}-${string}`;
  messages: any[];
  handleSend: () => void;
  handleTaskSend: (msg: string) => void;
  setInput: (input: string) => void;
  input: string;
  messageProcessing?: boolean;
  agentAddress?: string;
  initializing: boolean;
  roomId: string;
}> = ({
  agentId,
  messages,
  handleSend,
  handleTaskSend,
  setInput,
  input,
  messageProcessing,
  agentAddress: propAgentAddress,
  initializing,
  roomId,
}) => {
  const searchParams = useSearchParams();
  const queryAgentAddress = searchParams.get("agent");
  const agentAddress = propAgentAddress || queryAgentAddress;

  const [agent, setAgent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://intern-api-staging.ensemble.codes";
        const response = await axios.get(
          `${apiBaseUrl}/api/v1/agents/${agentId}`
        );
        if (!isMounted) return;
        setAgent(response.data);
      } catch (e) {
        if (!isMounted) return;
        console.error("Failed to fetch agent", e);
        setAgent(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchAgent();
    return () => {
      isMounted = false;
    };
  }, [agentAddress]);

  console.log("chat layout", agent, loading);

  // Clear timestamps when navigating away
  useClearTimestampsOnNavigation();

  return (
    <>
      <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
        <div className="flex flex-col w-full h-full">
          {messages.length === 0 &&
          !agentAddress &&
          agent?.agent_id?.toLowerCase() ===
            ORCHESTRATOR_AGENT_ADDRESS.toLowerCase() ? null : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/agents/${agent?.agent_id}`}>
                  <div className="relative">
                    <img
                      src={
                        agent?.profile?.avatar
                          ? agent?.profile?.avatar.startsWith("https://")
                            ? agent?.profile?.avatar
                            : `https://${agent?.profile?.avatar}`
                          : "/assets/karels-intern.jpg"
                      }
                      alt="mascot"
                      className="w-10 h-10 border-[0.5px] border-[#8F95B2] rounded-full object-cover"
                    />
                    {roomId ? (
                      <img
                        src="/assets/active-icon.svg"
                        alt="active"
                        className="w-2 h-2 absolute bottom-0 right-2"
                      />
                    ) : null}
                  </div>
                </Link>
                <div>
                  <p className="text-primary text-[16px] font-medium">
                    {agent?.profile?.display_name || agent?.name}
                  </p>
                  {roomId ? (
                    <p className="text-[#8F95B2] text-[14px] font-normal">
                      always online
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
            <div
              className="grow overflow-y-auto w-full h-[80%] mt-[20px]"
              style={{ scrollbarWidth: "none" }}
            >
              {initializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img
                      src="/assets/chat-icon.svg"
                      alt="chat"
                      className="w-12 h-12 opacity-50"
                    />
                    <p className="text-[#8F95B2] text-sm">Connecting...</p>
                  </div>
                </div>
              ) : !roomId ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img
                      src="/assets/chat-icon.svg"
                      alt="chat"
                      className="w-12 h-12 opacity-50"
                    />
                    <p className="text-[#8F95B2] text-sm">
                      Could not connect to agent.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img
                      src="/assets/chat-icon.svg"
                      alt="chat"
                      className="w-12 h-12 opacity-50"
                    />
                    <p className="text-[#8F95B2] text-sm">
                      Loading messages...
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
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
                  {messages.map((message, index) => (
                    <MemoizedMessage
                      key={message.cretedAt || index}
                      message={message}
                      index={index}
                      messages={messages}
                      onSendMessage={(service: string) =>
                        handleTaskSend(service)
                      }
                      agentAddress={""}
                      account={""}
                    />
                  ))}
                  {messageProcessing ? (
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
            {roomId &&
              messages.length === 0 &&
              agent?.metadata?.prompts &&
              agent?.metadata?.prompts?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {agent.metadata.prompts.map((prompt: string, idx: number) => (
                    <button
                      key={idx}
                      className="cursor-pointer px-3 py-[2px] text-[14px] font-normal rounded-[20000px] border border-primary bg-white text-primary transition"
                      onClick={() => handleTaskSend(prompt)}
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    input.trim() &&
                    !messageProcessing
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={messageProcessing}
                maxLength={1000}
              />
              {input.length > 800 && (
                <div className="absolute right-16 top-1 text-xs text-gray-400">
                  {input.length}/1000
                </div>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center ${
                        messageProcessing ||
                        !input.trim() ||
                        initializing ||
                        !roomId
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:bg-gray-50 transition-colors"
                      }`}
                      onClick={
                        !input.trim() ||
                        messageProcessing ||
                        initializing ||
                        !roomId
                          ? undefined
                          : () => handleSend()
                      }
                    >
                      <img
                        src="/assets/pixelated-arrow-primary-icon.svg"
                        alt="arrow"
                        className={
                          !input.trim() ||
                          messageProcessing ||
                          initializing ||
                          !roomId
                            ? "opacity-50"
                            : ""
                        }
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
        </div>
      </div>
    </>
  );
};

const ChatLayout: FC<{
  agentId: `${string}-${string}-${string}-${string}-${string}`;
  messages: any[];
  handleSend: () => void;
  handleTaskSend: (msg: string) => void;
  setInput: (input: string) => void;
  input: string;
  messageProcessing?: boolean;
  agentAddress?: string;
  initializing: boolean;
  roomId: string;
}> = ({
  agentId,
  messages,
  handleSend,
  handleTaskSend,
  setInput,
  input,
  messageProcessing,
  agentAddress,
  initializing,
  roomId,
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatLayoutContent
        agentId={agentId}
        messages={messages}
        handleSend={handleSend}
        handleTaskSend={handleTaskSend}
        setInput={setInput}
        input={input}
        messageProcessing={messageProcessing}
        agentAddress={agentAddress}
        initializing={initializing}
        roomId={roomId}
      />
    </Suspense>
  );
};

export default ChatLayout;
