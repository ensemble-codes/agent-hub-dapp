import { Skeleton } from "./skeleton";

export function TaskDetailSkeleton() {
  return (
    <div
      className="h-[calc(100dvh-200px)] w-full flex flex-col gap-6 rounded-[20px] pt-12 pb-6 px-8 bg-white border-[1px] shadow-[inset_5px_5px_10px_0px_#D9D9D9,inset_-5px_-5px_10px_0px_#E7EBF0]"
      style={{
        borderImageSource:
          "linear-gradient(91.95deg, rgba(255, 255, 255, 0.4) -4.26%, rgba(255, 255, 255, 0) 107.52%)",
        borderImageSlice: "1",
      }}
    >
      <div
        className="w-full h-full overflow-auto relative"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Task Prompt Card */}
        <div className="rounded-[8px] border border-light-text-color py-4 px-3 w-fit mb-4">
          <div className="flex items-start gap-2">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-80" />
            </div>
          </div>
        </div>

        {/* Agent Response */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Processing Status */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <Skeleton className="w-[18px] h-[18px] rounded-full" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Task Result */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <Skeleton className="w-[18px] h-[18px] rounded-full" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Result Content */}
        <div className="rounded-[8px] border border-light-text-color py-4 px-3 w-fit mb-4">
          <div className="flex items-start gap-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="space-y-3 mb-4">
          <Skeleton className="h-6 w-80" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Feedback Link */}
        <div className="rounded-[2000px] border border-light-text-color py-1 px-3 w-fit">
          <div className="flex items-center justify-start gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
