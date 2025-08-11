import { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsoleProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  handleTaskSend: (msg: string) => void;
  agent: any;
  messages: any[];
  loading?: boolean;
}

const Console: FC<ConsoleProps> = ({
  input,
  setInput,
  handleSend,
  handleTaskSend,
  agent,
  messages,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center mb-8">
          <Skeleton className="w-[120px] h-[120px] rounded-full" />
          <Skeleton className="h-6 w-80" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="mb-4 flex items-stretch justify-center max-w-[680px] w-full h-full border border-[#8F95B2] rounded-[8px]">
          <Skeleton className="basis-[80%] grow h-12 rounded-[8px]" />
          <Skeleton className="basis-[10%] h-12 rounded-r-[8px]" />
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <Skeleton className="h-5 w-[400px]" />
          <div className="flex flex-wrap gap-2 max-w-[680px]">
            <Skeleton className="h-8 w-24 rounded-[20000px]" />
            <Skeleton className="h-8 w-32 rounded-[20000px]" />
            <Skeleton className="h-8 w-28 rounded-[20000px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col gap-2 items-center justify-center mb-8">
        <img
          src={"/assets/orchestrator-mascot-icon.svg"}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && input.trim()) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div
          className="basis-[10%] border-l-[1px] border-l-[#8F95B2] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => {
            if (input.trim()) {
              handleSend();
            }
          }}
        >
          <img
            src="/assets/pixelated-arrow-primary-icon.svg"
            alt="arrow"
          />
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
      </div>
    </div>
  );
};

export default Console;