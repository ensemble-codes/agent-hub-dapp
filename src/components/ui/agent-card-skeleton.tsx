import { Skeleton } from "./skeleton"

export function AgentCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] border-[0.5px] border-[#8F95B2] overflow-hidden w-full">
      <div className="w-full p-3 rounded-[8px] flex flex-col h-full justify-between">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start justify-start gap-2 w-[60%] overflow-hidden pr-1">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="w-full">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="p-2 rounded-[200px] w-20 h-8" />
          </div>
          <div className="pt-2 pb-4">
            <Skeleton className="my-3 h-[0.5px] w-[70%]" />
            <div className="flex items-center justify-start gap-2 overflow-x-auto mb-2">
              <Skeleton className="w-16 h-6 rounded-[2000px]" />
              <Skeleton className="w-20 h-6 rounded-[2000px]" />
              <Skeleton className="w-14 h-6 rounded-[2000px]" />
            </div>
            <Skeleton className="h-[38px] w-full mb-3" />
            <Skeleton className="my-3 h-[0.5px] w-[70%]" />
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-1">
                <Skeleton className="w-4 h-4" />
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
              <div className="flex items-start gap-1">
                <Skeleton className="w-4 h-4" />
                <div>
                  <Skeleton className="h-4 w-10 mb-1" />
                  <Skeleton className="h-4 w-6" />
                </div>
              </div>
              <div className="flex items-start gap-1">
                <Skeleton className="w-4 h-4" />
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="w-full h-10 rounded-[50px]" />
      </div>
    </div>
  )
}
