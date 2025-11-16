"use client";
import { AgentProfileSkeleton } from "@/components/ui/agent-profile-skeleton";
import { TaskStatus } from "@/enum/taskstatus";
import { convertRatingToStars, getTaskStatusText } from "@/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, use, useState, useEffect } from "react";
import { formatEther } from "viem";
import AGENTS_INFO from "@/data/agentsinfo.json";
import axios from "axios";

const Page: FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const { id } = use(params);
  const { push } = useRouter();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 1000);
  };

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getAgent = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
      }
      const data = await axios.get(
        `${apiBaseUrl}/api/v1/agents/${id}`
      );
      console.log(data.data);
      setAgent(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getAgent();
    }
  }, [id]);

  return (
    <>
      {loading ? (
        <AgentProfileSkeleton />
      ) : agent ? (
        <>
          <div className="flex lg:flex-row flex-col items-stretch gap-6 w-full">
            <div className="grow rounded-[10px]">
              <div className="lg:py-8 lg:px-5 rounded-[10px] w-full lg:bg-white">
                <div className="flex w-full items-start justify-between mb-4 lg:mb-0">
                  <p className="text-primary text-[20px] leading-[24px] font-semibold">
                    AGENT PROFILE
                  </p>
                  <div className="lg:flex items-center gap-1 hidden">
                    {agent.profile?.links?.twitter ? (
                      <Link
                        href={agent.profile?.links?.twitter}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <img
                          src="/assets/agent-list-card-x-icon.svg"
                          alt="twitter"
                          className="w-8 h-8 cursor-pointer"
                        />
                      </Link>
                    ) : null}
                    {agent.profile?.links?.github ? (
                      <Link
                        href={agent.profile?.links?.github}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <img
                          src="/assets/agent-list-card-gh-icon.svg"
                          alt="github"
                          className="w-8 h-8 cursor-pointer"
                        />
                      </Link>
                    ) : null}
                    {agent.profile?.links?.website ? (
                      <Link
                        href={agent.profile?.links?.website}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <img
                          src="/assets/agent-list-website-icon.svg"
                          alt="website"
                          className="w-8 h-8 cursor-pointer"
                        />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <hr
                  className="lg:block hidden my-5 border-[1px] border-[#8F95B2]"
                  style={{
                    borderImageSource:
                      "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                    borderImageSlice: "1",
                  }}
                />
                <div className="flex w-full items-start justify-between mb-6 relative">
                  <div className="flex flex-start gap-4">
                    <img
                      className="w-[120px] h-[120px] rounded-full object-cover"
                      src={
                        agent.profile?.avatar
                          ? agent.profile.avatar.startsWith("https://")
                            ? agent.profile.avatar
                            : `https://${agent.profile.avatar}`
                          : "/assets/karels-intern.jpg"
                      }
                      alt={agent.profile?.display_name}
                    />
                    <div className="flex flex-col items-start gap-2">
                      <p className="font-bold text-[#3d3d3d] text-[20px] leading-[auto] z-[1]">
                        {agent.profile?.display_name}
                      </p>
                      <p
                        className="font-bold text-light-text-color text-[16px] leading-[auto] cursor-pointer flex items-center gap-1 z-[1]"
                        onClick={() => copyToClipboard(agent.identity?.ethereum_address)}
                        style={{
                          transition: "all 0.3s ease",
                          opacity: copiedPrompt === agent.identity?.ethereum_address ? 0.6 : 1,
                        }}
                      >
                        {agent.identity?.ethereum_address?.slice(0, 4)}...
                        {agent.identity?.ethereum_address?.slice(-4)}
                      </p>
                      {id === "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184" ? (
                        <div className="py-1 px-4 bg-[#C8F3FF] rounded-[2000px] flex items-center gap-2 z-[1]">
                          <img
                            src="/assets/vibes-dark-icon.svg"
                            alt="vibes"
                            className="w-[18px] h-[18px]"
                          />
                          <p className="text-[#3d3d3d] text-[14px] font-medium leading-[18px]">
                            Vibes
                          </p>
                        </div>
                      ) : agent.metadata?.agentCategory ? (
                        <div
                          className={`py-1 px-4 rounded-[2000px] flex items-center gap-2 ${
                            agent.metadata.agentCategory === "DeFi"
                              ? "bg-[#FFC8F9]"
                              : agent.metadata.agentCategory === "Social"
                              ? "bg-[#FBFFC8]"
                              : agent.metadata.agentCategory === "Research"
                              ? "bg-[#C8FFCE]"
                              : "bg-[#C8E6FF]"
                          } z-[1]`}
                        >
                          {agent.metadata.agentCategory === "DeFi" ? (
                            <img
                              src="/assets/defi-service-black-icon.svg"
                              alt={agent.metadata.agentCategory}
                              className="w-[18px] h-[18px] z-[1]"
                            />
                          ) : agent.metadata.agentCategory === "Social" ? (
                            <img
                              src="/assets/social-service-black-icon.svg"
                              alt={agent.metadata.agentCategory}
                              className="w-[18px] h-[18px] z-[1]"
                            />
                          ) : agent.metadata.agentCategory === "Research" ? (
                            <img
                              src="/assets/research-service-black-icon.svg"
                              alt={agent.metadata.agentCategory}
                              className="w-[18px] h-[18px] z-[1]"
                            />
                          ) : (
                            <img
                              src="/assets/security-service-black-icon.svg"
                              alt={agent.metadata.agentCategory}
                              className="w-[18px] h-[18px] z-[1]"
                            />
                          )}
                          <p className="text-[#3d3d3d] text-[14px] font-medium leading-[18px]">
                            {agent.metadata.agentCategory}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <img
                    src="/assets/profile-ornament.svg"
                    alt="ornament"
                    className="absolute w-[214px] h-[158px] right-[0px] z-0"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-primary font-medium leading-[100%]">
                    About
                  </p>
                  <p className="text-[16px] font-medium text-[#121212]">
                    {agent.profile?.description || agent.description}
                  </p>
                </div>
                {agent.metadata?.tags &&
                  agent.metadata.tags.length > 0 && (
                    <>
                      <hr
                        className="my-5 border-[1px] border-[#8F95B2]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                          borderImageSlice: "1",
                        }}
                      />
                      <div className="space-y-2">
                        <p className="text-primary font-medium leading-[100%]">
                          Attributes
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                          {agent.metadata.tags.map(
                            (capability: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <img
                                  src="/assets/check-icon.svg"
                                  alt="check"
                                  className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                                />
                                <p className="text-[14px] md:text-[16px] lg:text-[18px] leading-tight text-[#3D3D3D] font-medium">
                                  {capability}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}
                {/* <hr
                  className="my-5 border-[1px] border-[#8F95B2]"
                  style={{
                    borderImageSource:
                      "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                    borderImageSlice: "1",
                  }}
                />
                <div className="space-y-2">
                  <p className="text-primary font-medium leading-[100%]">
                    Stats
                  </p>
                  <div className="flex items-start gap-12 mb-6">
                    <div className="flex items-start justify-center gap-1">
                      <img
                        src="/assets/ensemble-icon.svg"
                        alt="credits"
                        className="w-4 h-4 mt-[2px]"
                      />
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[14px] text-light-text-color font-bold">
                          Credits
                        </span>
                        <p className="font-bold leading-[19px] text-primary">
                          20-50
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-center gap-1">
                      <img
                        src="/assets/agent-list-card-wrench-icon.svg"
                        alt="wrench"
                        className="w-4 h-4 mt-[2px]"
                      />{" "}
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[14px] text-light-text-color font-bold">
                          Tasks
                        </span>
                        <p className="font-bold leading-[19px] text-text-color">
                          {agent.tasks.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-center gap-1">
                      <img
                        src="/assets/star-dull-icon.svg"
                        alt="star"
                        className="w-4 h-4 mt-[2px]"
                      />
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[14px] text-light-text-color font-bold">
                          Rating
                        </span>
                        <p className="font-bold leading-[19px] text-text-color">
                          {convertRatingToStars(agent.reputation)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}
                <hr
                  className="my-5 border-[1px] border-[#8F95B2]"
                  style={{
                    borderImageSource:
                      "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                    borderImageSlice: "1",
                  }}
                />
                <div className="w-full flex lg:flex-row flex-col items-center gap-4">
                  <button
                    className="lg:w-[160px] w-full border border-primary bg-primary rounded-[50px] py-2 flex items-center justify-center gap-2"
                    onClick={() => push(`/agents/${agent.agent_id}/chat`)}
                  >
                    <img
                      src="/assets/chat-white-icon.svg"
                      alt="chat"
                      className="w-4 h-4"
                    />
                    <p className="font-bold text-white leading-[20px]">
                      Chat
                    </p>
                  </button>
                </div>
              </div>
            </div>
            {(agent?.metadata &&
              agent?.metadata?.instructions &&
              agent?.metadata?.instructions?.length) ||
            (agent?.metadata &&
              agent?.metadata?.prompts &&
              agent?.metadata?.prompts?.length) ? (
              <div className="flex-shrink-0 flex flex-col lg:gap-12 gap-4 lg:w-[368px]">
                {agent?.metadata?.instructions?.length ? (
                  <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
                    <p className="p-4 text-primary text-[16px] font-medium">
                      How agent works
                    </p>
                    <hr
                      className="lg:block hidden border-[1px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                        borderImageSlice: "1",
                      }}
                    />
                    {agent.metadata.instructions.map(
                      (ins: string, i: number, arr: string[]) => (
                        <div
                          className={`p-4 flex items-center justify-start gap-2 ${
                            i < arr.length - 1
                              ? "border-b-[1px] border-b-[#8F95B2]"
                              : ""
                          }`}
                          key={ins}
                        >
                          <img
                            src="/assets/check-squared-icon.svg"
                            alt="check"
                            className="w-4 h-4"
                          />
                          <p className="text-[#121212] text-[14px] font-normal">
                            {ins}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : null}
                {agent?.metadata?.prompts?.length ? (
                  <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
                    <p className="p-4 text-primary text-[16px] font-medium">
                      Starter prompts
                    </p>
                    <hr
                      className="lg:block hidden border-[1px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                        borderImageSlice: "1",
                      }}
                    />
                    {agent.metadata.prompts.map(
                      (p: string, i: number, arr: string[]) => (
                        <div
                          className={`p-4 flex items-center justify-between gap-2 ${
                            i < arr.length - 1
                              ? "border-b-[1px] border-b-[#8F95B2]"
                              : ""
                          } group relative`}
                          key={p}
                        >
                          <p
                            className="text-[#121212] text-[14px] font-normal w-[80%] cursor-pointer active:bg-gray-100 transition-colors duration-200 rounded-md p-2 -m-2"
                            onClick={() => copyToClipboard(p)}
                          >
                            {p}
                          </p>
                          <img
                            src="/assets/copy-icon.svg"
                            alt="copy"
                            className={`w-5 h-5 cursor-pointer transition-opacity duration-200 absolute right-4 opacity-0 group-hover:opacity-100 hidden lg:block ${
                              copiedPrompt === p ? "opacity-50" : ""
                            }`}
                            onClick={() => copyToClipboard(p)}
                          />
                        </div>
                      )
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <>
            <div className="flex lg:flex-row flex-col items-stretch gap-4 w-full mt-4">
              {/* <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
                    <p className="p-4 text-primary text-[16px] font-medium">
                      How agent works
                    </p>
                    <hr
                      className="lg:block hidden border-[1px] border-[#8F95B2]"
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                        borderImageSlice: "1",
                      }}
                    />
                    <div className="p-4">
                      <img
                        src="/assets/featured-agent-graph-icon.svg"
                        alt="graph"
                        className="w-full"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-[#8F95B2] text-[14px] font-normal">
                          Mcap
                        </p>
                        <p className="text-[#121212] text-[14px] font-normal">
                          -
                        </p>
                      </div>
                      <hr
                        className="my-2 lg:block hidden border-[1px] border-[#8F95B2]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                          borderImageSlice: "1",
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-[#8F95B2] text-[14px] font-normal">
                          Liquidity
                        </p>
                        <p className="text-[#121212] text-[14px] font-normal">
                          -
                        </p>
                      </div>
                      <hr
                        className="my-2 lg:block hidden border-[1px] border-[#8F95B2]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                          borderImageSlice: "1",
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-[#8F95B2] text-[14px] font-normal">
                          Holders
                        </p>
                        <p className="text-[#121212] text-[14px] font-normal">
                          -
                        </p>
                      </div>

                      <button className="w-full mt-2 space-x-2 flex items-center justify-center rounded-[50px] bg-white py-[12px] px-[16px] border border-[#8F95B2]">
                        <img
                          src="/assets/cross-gray-icon.svg"
                          alt="cross"
                          className="w-[18px] h-[18px]"
                        />
                        <span className="text-[#8F95B2] text-[14px] font-[700] leading-[18px]">
                          Agent does not have a token
                        </span>
                      </button>
                    </div>
                  </div> */}
              {/* {agent?.agent?.metadata?.instructions?.length ? (
                    <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
                      <p className="p-4 text-primary text-[16px] font-medium">
                        How agent works
                      </p>
                      <hr
                        className="lg:block hidden border-[1px] border-[#8F95B2]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                          borderImageSlice: "1",
                        }}
                      />
                      {agent.metadata.instructions.map(
                        (ins: string, i: number, arr: string[]) => (
                          <div
                            className={`p-4 flex items-center justify-start gap-2 ${
                              i < arr.length - 1
                                ? "border-b-[1px] border-b-[#8F95B2]"
                                : ""
                            }`}
                            key={ins}
                          >
                            <img
                              src="/assets/check-squared-icon.svg"
                              alt="check"
                              className="w-4 h-4"
                            />
                            <p className="text-[#121212] text-[14px] font-normal">
                              {ins}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : null}
                  {agent?.agent?.metadata?.prompts?.length ? (
                    <div className="bg-white rounded-[16px] border border-[#8F95B2] lg:w-[320px] w-full">
                      <p className="p-4 text-primary text-[16px] font-medium">
                        Starter prompts
                      </p>
                      <hr
                        className="lg:block hidden border-[1px] border-[#8F95B2]"
                        style={{
                          borderImageSource:
                            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                          borderImageSlice: "1",
                        }}
                      />
                      {agent.metadata.prompts.map(
                        (p: string, i: number, arr: string[]) => (
                          <div
                            className={`p-4 flex items-center justify-between gap-2 ${
                              i < arr.length - 1
                                ? "border-b-[1px] border-b-[#8F95B2]"
                                : ""
                            } group relative`}
                            key={p}
                          >
                            <p
                              className="text-[#121212] text-[14px] font-normal w-[80%] cursor-pointer active:bg-gray-100 transition-colors duration-200 rounded-md p-2 -m-2"
                              onClick={() => copyToClipboard(p)}
                            >
                              {p}
                            </p>
                            <img
                              src="/assets/copy-icon.svg"
                              alt="copy"
                              className={`w-5 h-5 cursor-pointer transition-opacity duration-200 absolute right-4 opacity-0 group-hover:opacity-100 hidden lg:block ${
                                copiedPrompt === p ? "opacity-50" : ""
                              }`}
                              onClick={() => copyToClipboard(p)}
                            />
                          </div>
                        )
                      )}
                    </div>
                  ) : null} */}
            </div>
          </>
        </>
      ) : (
        <>
          <div className="h-[calc(100%-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center gap-8">
              <img
                src={"/assets/agent-indexing-icon.svg"}
                alt="indexing"
                className="w-[140px] h-[140px] z-[1]"
              />
              <div className="text-center z-[1]">
                <p className="text-primary font-medium text-[24px]">
                  Could not find Agent Record
                </p>
                <p className="text-primary font-normal text-[16px]">
                  Need a few mins to index
                </p>
              </div>
            </div>
            <img
              src={"/assets/orchestrator-pattern-bg.svg"}
              alt="pattern"
              className="absolute bottom-0 left-0 w-full opacity-60 lg:block hidden"
            />
          </div>
        </>
      )}
    </>
  );
};

export default Page;
