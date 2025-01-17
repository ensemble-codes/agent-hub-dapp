"use client";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import AGENTSLIST from "@/dummydata/agents.json";
import TWEETSTYLES from "@/dummydata/tweetstyles.json";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context";
import { useEnsembleSDK } from "@/sdk-config";
import Loader from "@/components/loader";

interface ConfirmAgentProps {
  selectedAgent: number;
  selectedTweetStyles: string[];
  topic: string;
}

const ConfirmAgent: FC<ConfirmAgentProps> = ({
  selectedAgent,
  selectedTweetStyles,
  topic,
}) => {
  const [state] = useContext(AppContext);
  const router = useRouter();
  const getSDK = useEnsembleSDK();

  const [loadingCreate, setLoadingCreate] = useState(false);

  const agentDetails = AGENTSLIST.find((agent) => agent.id === selectedAgent);

  const ratingsArray = new Array(agentDetails?.rating);

  const filteredTweetStyles = useMemo(() => {
    return (
      TWEETSTYLES.filter((style) =>
        selectedTweetStyles.includes(style.value)
      ) || []
    );
  }, [selectedTweetStyles]);

  const createTask = useCallback(async () => {
    try {
      setLoadingCreate(true);
      const sdk = await getSDK();
      const task = await sdk.createTask({
        prompt: state.taskPrompt,
        proposalId: "0",
      });
      if (task.id) {
        router.push(`/tasks/${task.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCreate(false);
    }
  }, [state.taskPrompt]);

  return (
    <>
      <div className="flex items-stretch gap-12 flex-wrap">
        <div className="flex-grow max-w-[412px] max-md:w-full max-md:mx-auto flex flex-col justify-between gap-5">
          <div
            className="p-4 rounded-[10px] shadow-[inset_5px_5px_10px_0px_#D8D8D8,inset_-5px_-5px_10px_0px_#FAFBFF] border-[1px]"
            style={{
              borderImageSource:
                "linear-gradient(91.95deg, rgba(255, 255, 255, 0.4) -4.26%, rgba(255, 255, 255, 0) 107.52%)",
              borderImageSlice: "1",
            }}
          >
            <p className="text-light-text-color text-[18px] leading-[24px] font-bold">
              Task details
            </p>
            <hr
              className="my-5 border-[1px] border-[#8F95B2]"
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                borderImageSlice: "1",
              }}
            />
            <div className="space-y-[6px] mb-5">
              <p className="text-[14px] font-bold text-primary leading-[18.9px]">
                Topic
              </p>
              <p className="font-medium">{topic}</p>
            </div>
            {filteredTweetStyles.length ? (
              <div className="space-y-[6px]">
                <p className="text-light-text-color text-[18px] leading-[24px] font-bold">
                  Tweet Style
                </p>
                <div className="w-full flex items-center justify-start gap-2 flex-wrap">
                  {filteredTweetStyles.map((ts) => (
                    <p
                      key={ts.value}
                      className={`rounded-[20px] text-[14px] border-[${ts.color}] flex-shrink-0 cursor-pointer px-2 py-[2px] border-[0.5px] shadow-[0px_2px_4px_0px_#0000001F]`}
                    >
                      {ts.label}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <button
            className="max-w-[240px] mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] disabled:opacity-[0.6]"
            onClick={() => {
              createTask();
            }}
            disabled={loadingCreate}
          >
            <span className="text-white text-[16px] font-[700] leading-[24px]">
              Confirm and begin
            </span>
            {loadingCreate ? <Loader color="white" size="md" /> : <img src="/assets/pixelated-arrow-icon.svg" alt="pixelated-arrow" className="w-6 h-6" />}
          </button>
        </div>
        <div className="flex-grow max-w-[412px] max-md:w-full max-md:mx-auto">
          <div
            className="w-full p-4 rounded-[10px] shadow-[inset_5px_5px_10px_0px_#D8D8D8,inset_-5px_-5px_10px_0px_#FAFBFF] border-[1px]"
            style={{
              borderImageSource:
                "linear-gradient(91.95deg, rgba(255, 255, 255, 0.4) -4.26%, rgba(255, 255, 255, 0) 107.52%)",
              borderImageSlice: "1",
            }}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-light-text-color text-[18px] leading-[24px] font-bold">
                Agent details
              </p>
              <div className="flex items-center gap-1">
                {agentDetails?.twitter ? (
                  <img
                    src="/assets/agent-telegram-icon.svg"
                    alt="telegram"
                    className="w-8 h-8 cursor-pointer"
                  />
                ) : null}
                {agentDetails?.telegram ? (
                  <img
                    src="/assets/agent-twitter-icon.svg"
                    alt="twitter"
                    className="w-8 h-8 cursor-pointer"
                  />
                ) : null}
              </div>
            </div>
            <hr
              className="my-5 border-[1px] border-[#8F95B2]"
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                borderImageSlice: "1",
              }}
            />
            <div className="w-full flex items-center justify-between">
              <div className="flex space-x-2">
                <img
                  src={agentDetails?.img}
                  alt={agentDetails?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="space-y-1">
                  <p className="font-medium">{agentDetails?.name}</p>
                  <p className="text-light-text-color text-[12px]">@Twitter</p>
                </div>
              </div>
              <div className="rounded-[200px] border-none bg-[#AB21FF3D] px-[12px] py-[4px]">
                <p className="text-[#AB21FF] leading-[24px] text-center font-bold text-[12px]">
                  0x52...s3a6
                </p>
              </div>
            </div>
            <hr
              className="my-5 border-[1px] border-[#8F95B2]"
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                borderImageSlice: "1",
              }}
            />
            <div className="w-full flex items-center justify-between">
              <p className="font-medium text-light-text-color text-[14px] leading-[18.9px]">
                Price
              </p>
              <p className="text-[#00D64F] text-[16px] leading-[21.6px] font-bold">
                ${agentDetails?.price} per tweet
              </p>
            </div>
            <hr
              className="my-5 border-[1px] border-[#8F95B2]"
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                borderImageSlice: "1",
              }}
            />
            <div className="w-full flex items-center justify-between">
              <p className="font-medium text-light-text-color text-[14px] leading-[18.9px]">
                Mcap
              </p>
              <p className="text-[14px] leading-[21.6px] font-bold">$12.51m</p>
            </div>
            <hr
              className="my-5 border-[1px] border-[#8F95B2]"
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                borderImageSlice: "1",
              }}
            />
            <div className="w-full flex items-center justify-between">
              <p className="font-medium text-light-text-color text-[14px] leading-[18.9px]">
                Jobs done
              </p>
              <p className="text-[14px] leading-[21.6px] font-bold">
                {agentDetails?.jobs}
              </p>
            </div>
            <hr
              className="my-5 border-[1px] border-[#8F95B2]"
              style={{
                borderImageSource:
                  "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                borderImageSlice: "1",
              }}
            />
            <div className="w-full flex items-center justify-between">
              <p className="font-medium text-light-text-color text-[14px] leading-[18.9px]">
                Average rating
              </p>
              <div className="flex items-center gap-1">
                {ratingsArray.fill(0).map((star, index) => (
                  <img
                    key={`${star}-${index}`}
                    src="/assets/star-icon.svg"
                    alt="star"
                    className="w-5 h-5"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmAgent;
