"use client";
import { AppHeader, SideMenu } from "@/components";
import { FC, use, useEffect, useState } from "react";
import Loader from "@/components/loader";
import { gql, useQuery } from "@apollo/client";

const Page: FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const { id } = use(params);

  const GET_TASK = gql`
  query MyQuery {
  task(id: "${id}") {
    assignee {
      agentUri
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
      proposals {
        id
        price
        service
        isRemoved
      }
    }
    id
    issuer
    prompt
    proposalId
    rating
    result
    status
  }
}
  `;

  const { data: task, loading, startPolling, stopPolling } = useQuery(GET_TASK);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    // Start polling when component mounts
    startPolling(7000);
    setIsPolling(true);
    
    // Stop polling when task.result is available
    if (task?.task?.result) {
      stopPolling();
      setIsPolling(false);
      console.log("Polling stopped: task result received");
    }
    
    // Clean up by stopping polling when component unmounts
    return () => {
      stopPolling();
      setIsPolling(false);
    };
  }, [task?.task?.result, startPolling, stopPolling]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <div className="flex items-start gap-16 pt-16">
        <SideMenu />
        <div
          className="w-full flex flex-col gap-6 rounded-[20px] pt-12 pb-6 px-8 bg-white border-[1px] shadow-[inset_5px_5px_10px_0px_#D9D9D9,inset_-5px_-5px_10px_0px_#E7EBF0]"
          style={{
            borderImageSource:
              "linear-gradient(91.95deg, rgba(255, 255, 255, 0.4) -4.26%, rgba(255, 255, 255, 0) 107.52%)",
            borderImageSlice: "1",
          }}
        >
          <div
            className="w-full h-[450px] overflow-auto relative"
            style={{ scrollbarWidth: "none" }}
          >
            {isPolling && !task?.task?.result && (
              <div className="absolute top-0 right-0 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <Loader size="sm" />
                <span className="text-sm text-light-text-color">Waiting for result...</span>
              </div>
            )}

            {/* <button
              className="absolute top-0 right-0 w-[226px] flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
              // onClick={() => selectedAgent(id)}
            >
              <span className="text-white text-[16px] font-[700] leading-[24px]">
                Mark as complete
              </span>
              <img
                src="/assets/inverted-check-icon.svg"
                alt="check-icon"
                className="w-[18px] h-[18px]"
              />
            </button> */}

            {task?.task?.prompt ? (
              <div className="rounded-[8px] border border-light-text-color py-4 px-3 w-fit mb-4">
                {/* <p className="text-[14px] font-bold text-primary leading-[18.9px] mb-4">
                Bullpost
              </p> */}
                <div className="flex items-start gap-2">
                  {/* <div className="border border-light-text-color rounded-full h-4 w-4 relative top-[2px]" /> */}
                  <div className="space-y-3">
                    <p className="font-medium leading-[21.6px]">
                      {task?.task?.prompt}
                    </p>
                    {/* <div className="w-[280px] border border-primary rounded-[16px] p-4 flex items-center gap-2">
                    <img
                      src="/assets/fwog-token-icon.png"
                      alt="fwog"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="space-y-1">
                      <p className="font-bold leading-[21.6px]">FWOG ($fwog)</p>
                      <p className="text-[14px] leading-[18.9px]">
                        Just a lil fwog in a big pond
                      </p>
                    </div>
                  </div> */}
                  </div>
                </div>
              </div>
            ) : null}

            {task?.task?.result ? (
              <div className="rounded-[8px] border border-light-text-color py-4 px-3 w-fit mb-4">
                {/* <p className="text-[14px] font-bold text-primary leading-[18.9px] mb-4">
                Bullpost
              </p> */}
                <div className="flex items-start gap-2">
                  {/* <div className="border border-light-text-color rounded-full h-4 w-4 relative top-[2px]" /> */}
                  <div className="space-y-3">
                    <p className="font-medium leading-[21.6px]">
                      {task?.task?.result}
                    </p>
                    {/* <div className="w-[280px] border border-primary rounded-[16px] p-4 flex items-center gap-2">
                    <img
                      src="/assets/fwog-token-icon.png"
                      alt="fwog"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="space-y-1">
                      <p className="font-bold leading-[21.6px]">FWOG ($fwog)</p>
                      <p className="text-[14px] leading-[18.9px]">
                        Just a lil fwog in a big pond
                      </p>
                    </div>
                  </div> */}
                  </div>
                </div>
              </div>
            ) : null}
            {/* <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/cook-capital-profile.png"
                alt="cook-capital"
                className="w-10 h-10 rounded-full"
              />
              <p className="text-[18px] leading-[24.3px]">
                Hold up bro, let me find the best way to do this!
              </p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <img
                  src="/assets/loader-group-icon.svg"
                  alt="check-icon"
                  className="w-[18px] h-[18px] animate-spin-slow"
                />
              </div>
              <p className="text-[14px] leading-[18.9px] text-light-text-color font-medium">
                Analyzing task
              </p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <img
                  src="/assets/check-icon.svg"
                  alt="check-icon"
                  className="w-[18px] h-[18px]"
                />
              </div>
              <p className="text-[14px] leading-[18.9px] text-light-text-color font-medium">
                Job done!
              </p>
            </div>
            <button className="mb-4 space-x-2 flex items-center rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]">
              <img
                src="/assets/livestream-play-icon.svg"
                alt="livestream-play"
              />
              <span className="text-white text-[16px] font-[700] leading-[24px]">
                Livestream
              </span>
            </button>
            <div className="flex items-start gap-3 mb-4">
              <img
                src="/assets/cook-capital-profile.png"
                alt="cook-capital"
                className="w-10 h-10 rounded-full"
              />
              <div className="space-y-3">
                <p className="text-[18px] leading-[24.3px]">
                  Hey, looks like we got this done. Please let me know if you
                  need anything else.
                </p>
                <StarRating />
              </div>
            </div> */}
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="p-3 rounded-[8px] border border-light-text-color flex items-center gap-2 w-full">
              <input
                className="flex-grow w-full border-none outline-none p-0 text-[14px] leading-[18.9px] placeholder:text-light-text-color"
                placeholder="ask anything..."
              />
              {/*  <img
                src="/assets/microphone-icon.svg"
                alt="microphone"
                className="w-6 h-6"
              /> */}
            </div>
            <div className="bg-primary h-12 w-12 flex items-center justify-center rounded-[8px]">
              <img src="/assets/send-icon.svg" alt="send" className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
