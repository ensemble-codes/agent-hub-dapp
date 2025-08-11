import { Skeleton } from "./skeleton";

export function AgentProfileSkeleton() {
  return (
    <>
      <div className="flex lg:flex-row flex-col items-stretch gap-6 w-full">
        <div className="grow rounded-[10px]">
          <div className="lg:py-8 lg:px-5 rounded-[10px] w-full lg:bg-white">
            {/* Header */}
            <div className="flex w-full items-start justify-between mb-4 lg:mb-0">
              <Skeleton className="h-6 w-32" />
              <div className="lg:flex items-center gap-1 hidden">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
            <hr className="lg:block hidden my-5 border-[1px] border-[#8F95B2]" />
            
            {/* Agent Info */}
            <div className="flex w-full items-start justify-between mb-6 relative">
              <div className="flex flex-start gap-4">
                <Skeleton className="w-[120px] h-[120px] rounded-full" />
                <div className="flex flex-col items-start gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-24 rounded-[2000px]" />
                </div>
              </div>
              <Skeleton className="w-[214px] h-[158px] rounded" />
            </div>
            
            {/* About Section */}
            <div className="space-y-2 mb-5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-full" />
            </div>
            
            {/* Attributes Section */}
            <hr className="my-5 border-[1px] border-[#8F95B2]" />
            <div className="space-y-2 mb-5">
              <Skeleton className="h-5 w-20" />
              <div className="flex items-center gap-4 flex-wrap">
                <Skeleton className="h-6 w-20 rounded-[2000px]" />
                <Skeleton className="h-6 w-24 rounded-[2000px]" />
                <Skeleton className="h-6 w-16 rounded-[2000px]" />
                <Skeleton className="h-6 w-28 rounded-[2000px]" />
              </div>
            </div>
            
            {/* Stats Section */}
            <hr className="my-5 border-[1px] border-[#8F95B2]" />
            <div className="space-y-2 mb-5">
              <Skeleton className="h-5 w-12" />
              <div className="flex items-start gap-12 mb-6">
                <div className="flex items-start justify-center gap-1">
                  <Skeleton className="w-4 h-4 mt-[2px]" />
                  <div className="flex flex-col items-start gap-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
                <div className="flex items-start justify-center gap-1">
                  <Skeleton className="w-4 h-4 mt-[2px]" />
                  <div className="flex flex-col items-start gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
                <div className="flex items-start justify-center gap-1">
                  <Skeleton className="w-4 h-4 mt-[2px]" />
                  <div className="flex flex-col items-start gap-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat Button */}
            <hr className="my-5 border-[1px] border-[#8F95B2]" />
            <div className="w-full flex lg:flex-row flex-col items-center gap-4">
              <Skeleton className="lg:w-fit w-full h-12 rounded-[50px]" />
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="flex-shrink-0 flex flex-col lg:gap-12 gap-4 lg:w-[368px]">
          {/* Instructions Card */}
          <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
            <Skeleton className="p-4 h-6 w-32" />
            <hr className="lg:block hidden border-[1px] border-[#8F95B2]" />
            <div className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          
          {/* Prompts Card */}
          <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
            <Skeleton className="p-4 h-6 w-28" />
            <hr className="lg:block hidden border-[1px] border-[#8F95B2]" />
            <div className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
