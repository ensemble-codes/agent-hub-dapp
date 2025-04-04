"use client";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import AGENTSLIST from "@/dummydata/agents.json";
import TWEETSTYLES from "@/dummydata/tweetstyles.json";
import { useRouter, useSearchParams } from "next/navigation";
import { AppContext } from "@/context";
import { initSdk, useSdk } from "@/sdk-config";
import Loader from "@/components/loader";
import { gql, useQuery } from "@apollo/client";
import { formatEther } from "ethers";
import { useWalletClient } from "wagmi";
import { config } from "@/components/onchainconfig/config";
import Link from "next/link";

interface ConfirmAgentProps {
  selectedAgent: number;
  selectedTweetStyles: string[];
  topic: string;
  vibesXUsername: string;
}

const ConfirmAgent: FC<ConfirmAgentProps> = ({
  selectedAgent,
  selectedTweetStyles,
  topic,
  vibesXUsername,
}) => {
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");
  const selectedProposal = searchParams.get("proposal");
  const [state] = useContext(AppContext);
  const router = useRouter();
  const { data: walletClient } = useWalletClient({
    config: config,
  });
  const sdk = useSdk(walletClient);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const GET_PROPOSAL = gql`
    query MyQuery {
      proposal(id: "${selectedProposal}") {
    id
    isRemoved
    issuer {
      agentUri
      id
      name
      owner
      reputation
      tasks {
        id
        issuer
        prompt
        proposalId
        rating
        result
        status
      }
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
    }
    price
    service
  }
    }
  `;

  const { data, loading } = useQuery(GET_PROPOSAL);

  const ratingsArray = new Array(
    data && data?.proposal ? data?.proposal.issuer.reputation : 0
  );

  const proposal = data && data.proposal ? data?.proposal : undefined;

  const filteredTweetStyles = useMemo(() => {
    return (
      TWEETSTYLES.filter((style) =>
        selectedTweetStyles.includes(style.value)
      ) || []
    );
  }, [selectedTweetStyles]);

  const createTask = useCallback(async () => {
    try {
      if (!selectedProposal) return;

      setLoadingCreate(true);
      console.log({
        prompt: state.taskPrompt,
        proposalId: selectedProposal,
      })
      const task = await sdk.createTask({
        prompt: state.taskPrompt,
        proposalId: selectedProposal,
      });
      if (task.id) {
        router.push(`/tasks/${task.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCreate(false);
    }
  }, [state.taskPrompt, sdk]);

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
            {selectedService?.toLowerCase() === "bull-post" ? (
              <>
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
              </>
            ) : selectedService?.toLowerCase() === "bless me" ? (
              <>
                <div className="space-y-[6px] mb-5">
                  <p className="text-[14px] font-bold text-primary leading-[18.9px]">
                    X Username
                  </p>
                  <p className="font-medium">{vibesXUsername}</p>
                </div>
              </>
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
            {loadingCreate ? (
              <Loader color="white" size="md" />
            ) : (
              <img
                src="/assets/pixelated-arrow-icon.svg"
                alt="pixelated-arrow"
                className="w-6 h-6"
              />
            )}
          </button>
        </div>
        <div className="flex-grow max-w-[412px] max-md:w-full max-md:mx-auto">
          {loading ? (
            <Loader size="lg" />
          ) : (
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
                  {proposal?.issuer?.metadata?.telegram ? (
                    <Link
                      href={proposal?.issuer?.metadata?.telegram}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <img
                        src="/assets/agent-telegram-icon.svg"
                        alt="telegram"
                        className="w-8 h-8 cursor-pointer"
                      />
                    </Link>
                  ) : null}
                  {proposal?.issuer?.metadata?.twitter ? (
                    <Link
                      href={proposal?.issuer?.metadata?.twitter}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <img
                        src="/assets/agent-twitter-icon.svg"
                        alt="twitter"
                        className="w-8 h-8 cursor-pointer"
                      />
                    </Link>
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
                    src={
                      proposal?.issuer?.metadata?.imageUri.startsWith(
                        "https://"
                      )
                        ? proposal?.issuer?.metadata?.imageUri
                        : `https://${proposal?.issuer?.metadata?.imageUri}` ||
                          "/assets/cook-capital-profile.png"
                    }
                    alt={proposal?.issuer?.metadata?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="space-y-1">
                    <p className="font-medium">
                      {proposal?.issuer?.metadata?.name}
                    </p>
                  </div>
                </div>
                <div className="rounded-[200px] border-none bg-[#AB21FF3D] px-[12px] py-[4px]">
                  <p className="text-[#AB21FF] leading-[24px] text-center font-bold text-[12px]">
                    {proposal?.issuer?.id?.slice(0, 4)}...
                    {proposal?.issuer?.id?.slice(-4)}
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
                {proposal && proposal.price ? (
                  <p className="text-[#00D64F] text-[16px] leading-[21.6px] font-bold">
                    {formatEther(proposal.price)} ETH per tweet
                  </p>
                ) : null}
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
                  {proposal?.issuer?.tasks?.length || 0}
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
          )}
        </div>
      </div>
    </>
  );
};

export default ConfirmAgent;
