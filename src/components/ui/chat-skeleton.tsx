import { Skeleton } from "./skeleton";

export function ChatSkeleton() {
  return (
    <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
      <img
        src="/assets/orchestrator-pattern-bg.svg"
        alt="pattern"
        className="absolute left-0 bottom-0 w-full opacity-40"
      />
      <div className="flex flex-col w-full h-full">
        {/* Agent header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto w-full h-[80%] mt-[20px] mb-4">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-center">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 p-3 rounded-[8px] border border-[#8F95B2] flex items-center gap-2">
            <Skeleton className="flex-1 h-6" />
            <Skeleton className="w-6 h-6" />
          </div>
          <Skeleton className="w-12 h-12 rounded-[8px]" />
        </div>

        {/* Starter prompts */}
        <div className="flex flex-col items-center justify-center gap-4 mt-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-wrap gap-2 max-w-[680px]">
            <Skeleton className="h-8 w-24 rounded-[20000px]" />
            <Skeleton className="h-8 w-32 rounded-[20000px]" />
            <Skeleton className="h-8 w-28 rounded-[20000px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
