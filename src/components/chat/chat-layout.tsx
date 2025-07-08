import { FC } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SideMenu } from "@/components"

export const ChatLayout: FC<{
    messages: any[];
    handleSend: () => void;
    setInput: (input: string) => void;
    input: string;
    messageProcessing?: boolean;
}> = ({ messages, handleSend, setInput, input, messageProcessing }) => {

  // FIXME: Improve the Chat UI
    return (
        <div>
            <div className="flex flex-col w-full h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Agent Header - Chat Open State */}
                    <Link href="/agents/0x5C02b4685492D36a40107B6eC48A91ab3f8875cb">
                      <div className="relative">
                        <img
                          src="/assets/orchestrator-mascot-icon.svg"
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
                        Orchestrator
                      </p>
                      <p className="text-[#8F95B2] text-[14px] font-normal">
                        always online
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Interface - Chat Open State */}
                <div className="w-full h-[94%] flex flex-col items-start justify-between gap-[20px]">
                  {/* Messages Container */}
                  <div
                    className="grow overflow-y-auto w-full h-[80%] mt-[20px]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {messages.map(message => (
                      <div key={message.id} className="flex flex-col gap-2">
                        <p>{message.text}</p>
                        <p>{message.createdAt}</p>
                      </div>
                    ))}
                    {/* Loading State */}
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-[#8F95B2] text-sm">
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="h-[40px] flex-shrink-0 flex items-stretch justify-center w-full border border-[#8F95B2] rounded-[8px] bg-white z-[11] relative">
                    <input
                      placeholder="Chat..."
                      className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                      maxLength={1000}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSend()}>
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

                {/* Welcome Screen - Chat Closed State */}
                <div className="flex flex-col items-center justify-center lg:mt-[128px] mt-[72px]">
                  <div className="flex flex-col gap-2 items-center justify-center mb-8">
                    <img
                      src="/assets/orchestrator-mascot-icon.svg"
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

                  {/* Welcome Input */}
                  <div className="mb-4 flex items-stretch justify-center max-w-[680px] w-full h-full border border-[#8F95B2] rounded-[8px]">
                    <input
                      placeholder="Let's explore..."
                      className="basis-[80%] grow p-4 text-[16px] placeholder:text-[#8F95B2] outline-none border-none rounded-[8px]"
                    />
                    <div className="basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center">
                      <img
                        src="/assets/pixelated-arrow-primary-icon.svg"
                        alt="arrow"
                      />
                    </div>
                  </div>

                  {/* Service Categories */}
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

                  {/* Starter Prompts */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-[16px] font-normal text-[#8F95B2] leading-[100%]">
                      Starter Prompts
                    </p>
                    <div className="flex lg:flex-row flex-col items-stretch justify-center gap-4 max-w-[755px] w-full">
                      <div className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]">
                        <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                          Social
                        </p>
                        <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                          Hire an AI KoL for your project. The perfect
                          Hype-man!
                        </p>
                      </div>
                      <div className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]">
                        <p className="text-[16px] text-primary font-medium leading-[100%] mb-2">
                          Security
                        </p>
                        <p className="text-[16px] text-[#121212] font-normal leading-[100%]">
                          Expert security researcher to audit your smart
                          contracts
                        </p>
                      </div>
                      <div className="p-4 rounded-[16px] border-[#8F95B2] border cursor-pointer hover:border-primary transition-colors w-full h-full z-[2]">
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
              </div>
        </div>
    )
}