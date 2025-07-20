import { FC, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppHeader, SideMenu } from "@/components";
import MemoizedMessage from "../memoized-message";
import { useAgentQuery } from "@/graphql/generated/ensemble";
import { useSearchParams } from "next/navigation";
import { ensembleClient } from "@/graphql/clients";

const ChatLayoutContent: FC<{
  messages: any[];
  handleSend: () => void;
  handleTaskSend: (msg: string) => void;
  setInput: (input: string) => void;
  input: string;
  messageProcessing?: boolean;
}> = ({
  messages,
  handleSend,
  handleTaskSend,
  setInput,
  input,
  messageProcessing,
}) => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");
  const { data, loading, error } = useAgentQuery({
    variables: {
      id: agentAddress || "0x5c02b4685492d36a40107b6ec48a91ab3f8875cb",
    },
    client: ensembleClient,
  });

  const agent = useMemo(() => {
    if (data?.agent) {
      return data.agent;
    }

    return null;
  }, [data]);

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
              <div className="flex flex-col w-full h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href="/agents/0x5C02b4685492D36a40107B6eC48A91ab3f8875cb">
                      <div className="relative">
                        <img
                          src={agent?.metadata?.imageUri.startsWith(
                            "https://"
                          )
                            ? agent?.metadata?.imageUri
                            : `https://${agent?.metadata?.imageUri}`}
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
                        {agent?.metadata?.name}
                      </p>
                      <p className="text-[#8F95B2] text-[14px] font-normal">
                        always online
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
                  <div
                    className="grow overflow-y-auto w-full h-[80%] mt-[20px]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {messages.length === 0 ? (
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
                              messageProcessing || !input.trim()
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-50 transition-colors"
                            }`}
                            onClick={
                              !input.trim() || messageProcessing
                                ? undefined
                                : () => handleSend()
                            }
                          >
                            <img
                              src="/assets/pixelated-arrow-primary-icon.svg"
                              alt="arrow"
                              className={
                                !input.trim() || messageProcessing
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
          </div>
        </div>
      </div>
    </>
  );
};

const ChatLayout: FC<{
  messages: any[];
  handleSend: () => void;
  handleTaskSend: (msg: string) => void;
  setInput: (input: string) => void;
  input: string;
  messageProcessing?: boolean;
}> = ({
  messages,
  handleSend,
  handleTaskSend,
  setInput,
  input,
  messageProcessing,
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatLayoutContent
        messages={messages}
        handleSend={handleSend}
        handleTaskSend={handleTaskSend}
        setInput={setInput}
        input={input}
        messageProcessing={messageProcessing}
      />
    </Suspense>
  );
};

export default ChatLayout;
