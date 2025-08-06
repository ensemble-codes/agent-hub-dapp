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
import { useSearchParams } from "next/navigation";
import { ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";
import { gql, useQuery } from "@apollo/client";

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
  const GET_AGENT = gql`
    query MyQuery {
  agent(id: "${agentAddress || ORCHESTRATOR_AGENT_ADDRESS}") {
    agentUri
    id
    name
    owner
    reputation
    metadata {
      agentCategory
      attributes
      communicationType
      communicationURL
      description
      dexscreener
      github
      id
      imageUri
      instructions
      name
      openingGreeting
      prompts
      telegram
      twitter
      website
      communicationParams
    }
    proposals {
      id
      isRemoved
      price
      service
      tokenAddress
    }
    tasks {
      id
      prompt
      issuer
      proposalId
      rating
      result
      status
      taskId
    }
  }
}
  `;

  const { data, loading } = useQuery(GET_AGENT);

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
            <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
              <div className="flex flex-col w-full h-full">
                {messages.length === 0 && !agentAddress &&
                agent?.id?.toLowerCase() === ORCHESTRATOR_AGENT_ADDRESS.toLowerCase() ? null : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={`/agents/${agent?.id}`}>
                        <div className="relative">
                          <img
                            src={
                              agent?.metadata?.imageUri.startsWith("https://")
                                ? agent?.metadata?.imageUri
                                : `https://${agent?.metadata?.imageUri}`
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
                          {agent?.metadata?.name}
                        </p>
                        <p className="text-[#8F95B2] text-[14px] font-normal">
                          always online
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
                  <div
                    className="grow overflow-y-auto w-full h-[80%] mt-[20px]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {messages.length === 0 ? (
                      agent?.id === ORCHESTRATOR_AGENT_ADDRESS && !agentAddress ? (
                        <>
                          <div className="flex flex-col items-center justify-center lg:mt-[128px] mt-[72px]">
                            <div className="flex flex-col gap-2 items-center justify-center mb-8">
                              <img
                                src={"/assets/orchestrator-mascot-icon.svg"}
                                alt="mascot"
                                className="w-[120px] h-[120px] rounded-full object-cover"
                              />
                              <p className="text-[18px] text-primary text-center font-medium leading-[100%]">
                                Hi, I'm Orchestrator , your ai assistant on
                                agent hub
                              </p>
                              <p className="text-[#121212] text-[14px] font-normal leading-[100%]">
                                What can I help you with?
                              </p>
                            </div>
                            <div className="mb-4 flex items-stretch justify-center max-w-[680px] w-full h-full border border-[#8F95B2] rounded-[8px]">
                              <input
                                placeholder="Let's explore..."
                                className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    input.trim()
                                  ) {
                                    e.preventDefault();
                                    handleSend();
                                  }
                                }}
                              />
                              <div
                                className="basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center"
                                onClick={() => {
                                  if (input.trim()) {
                                    handleSend();
                                  }
                                }}
                              >
                                {
                                  <img
                                    src="/assets/pixelated-arrow-primary-icon.svg"
                                    alt="arrow"
                                  />
                                }
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4">
                              <p className="text-[16px] font-normal text-[#8F95B2] leading-[100%]">
                                Starter Prompts
                              </p>
                              {messages.length === 0 &&
                                agent?.metadata?.prompts &&
                                agent?.metadata?.prompts?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 max-w-[680px]">
                                    {agent.metadata.prompts.map(
                                      (prompt:string, idx: number) => (
                                        <button
                                          key={idx}
                                          className="cursor-pointer px-3 py-[2px] text-[14px] font-normal rounded-[20000px] border border-primary bg-white text-primary transition"
                                          onClick={() => handleTaskSend(prompt)}
                                        >
                                          {prompt}
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </>
                      ) : (
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
                      )
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
                  {messages.length === 0 && !agentAddress &&
                  agent?.id === ORCHESTRATOR_AGENT_ADDRESS ? null : (
                    <>
                      {messages.length === 0 &&
                        agent?.metadata?.prompts &&
                        agent?.metadata?.prompts?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {agent.metadata.prompts.map((prompt:string, idx: number) => (
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
                    </>
                  )}
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
