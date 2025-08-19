"use client";
import { ScrollingText } from "@/components/ui/scrolling-text";
import { AgentCardSkeleton } from "@/components/ui/agent-card-skeleton";
import { gql, useQuery } from "@apollo/client";
import { convertRatingToStars } from "@/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getAddress } from "ethers";

export default function Home() {
  const { push } = useRouter();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 1000);
  };

  const GET_ALL_PROPOSALS = gql`
    query MyQuery {
      ipfsMetadata_collection {
        agentCategory
      }
    }
  `;

  const GET_TRENDING_AGENTS = useMemo(
    () =>
      gql`
        query MyQuery {
          agents${
            selectedProposal
              ? `(where: {metadata_: {agentCategory: "${selectedProposal}"}})`
              : ""
          } {
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
              agentCategory
              attributes
              communicationType
              communicationURL
              instructions
              openingGreeting
              prompts
            }
            name
            owner
            reputation
            tasks {
              status
            }
          }
        }
      `,
    [selectedProposal]
  );

  const GET_ALL_AGENTS = gql`
    query MyQuery {
      agents {
        tasks {
          id
        }
      }
    }
  `;

  const GET_AGENTS = useMemo(
    () =>
      gql`
        query MyQuery {
          agents${
            selectedProposal
              ? `(where: {metadata_: {agentCategory: "${selectedProposal}"}})`
              : ""
          } {
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
              agentCategory
              attributes
              communicationType
              communicationURL
              instructions
              openingGreeting
              prompts
            }
            name
            owner
            reputation
            tasks {
              status
            }
          }
        }
      `,
    [selectedProposal]
  );

  const { data, loading } = useQuery(GET_AGENTS);
  const { data: proposalsData } = useQuery(GET_ALL_PROPOSALS);
  const { data: trendingAgents } = useQuery(GET_TRENDING_AGENTS);

  const { data: allAgentsData } = useQuery(GET_ALL_AGENTS);

  const agents = [...(data?.agents || [])]?.sort(
    (a: any, b: any) => b.tasks.length - a.tasks.length
  );

  const trendingAgentsData = [...(trendingAgents?.agents || [])]
    ?.sort((a: any, b: any) => b.tasks.length - a.tasks.length)
    ?.slice(0, 3);

  console.log(trendingAgentsData);

  // Get unique proposals from all agents
  const uniqueProposals = useMemo(() => {
    const proposals = new Set<string>();
    proposalsData?.ipfsMetadata_collection?.forEach((item: any) => {
      if (item.agentCategory) {
        proposals.add(item.agentCategory);
      }
    });
    return Array.from(proposals);
  }, [proposalsData]);

  // Calculate total tasks across all agents, regardless of filter
  const totalTasks = useMemo(() => {
    return (
      allAgentsData?.agents?.reduce(
        (total: number, agent: any) => total + agent.tasks.length,
        0
      ) || 0
    );
  }, [allAgentsData?.agents]);

  return (
    <>
      <div>
        <div className="flex items-stretch gap-6 mb-6 w-full overflow-x-auto">
          {trendingAgentsData.length > 0 ? (
            <div className="basis-[calc(50%-12px)] min-w-[318px] py-2 px-4 flex flex-col bg-white rounded-[16px] border-[0.5px] border-[#CADFF4]">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  🔥
                  <p className="font-semibold leading-[20px] text-[#F94D27]">
                    Trending Agents
                  </p>
                </div>
                <img
                  src="/assets/featured-agent-icon.svg"
                  alt="featured-icon"
                  className="w-8 h-8"
                />
              </div>
              <hr
                className="border-[0.5px] border-[#8F95B2] w-[90%]"
                style={{
                  borderImageSource:
                    "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                  borderImageSlice: "1",
                }}
              />
              {trendingAgentsData.map((ta: any, index: number, arr: any) => (
                <>
                  <div
                    key={ta.id}
                    className="flex items-center justify-between w-full py-2"
                  >
                    <div className="flex items-center gap-1">
                      <img
                        src={
                          ta.metadata.imageUri.startsWith("https://")
                            ? ta.metadata.imageUri
                            : `https://${ta.metadata.imageUri}`
                        }
                        alt="trending-agent"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="space-y-1">
                        <p className="font-semibold text-[14px] leading-[18px] text-[#121212]">
                          {ta.metadata.name}
                        </p>
                        <p className="font-semibold text-[13px] leading-[18px] text-[#8F95B2]">
                          {ta.tasks.length} tasks
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-2 flex-shrink-0 rounded-[200px] flex items-center gap-1 max-w-[12ch] overflow-hidden whitespace-nowrap text-ellipsis ${
                        ta.metadata.agentCategory === "DeFi"
                          ? "bg-[#FFC8F9]"
                          : ta.metadata.agentCategory === "Social"
                          ? "bg-[#FBFFC8]"
                          : ta.metadata.agentCategory === "Research"
                          ? "bg-[#C8FFCE]"
                          : "bg-[#C8E6FF]"
                      }`}
                    >
                      {ta.metadata.agentCategory === "DeFi" ? (
                        <img
                          src="/assets/defi-service-black-icon.svg"
                          alt={ta.metadata.agentCategory}
                          className="w-2 h-2"
                        />
                      ) : ta.metadata.agentCategory === "Social" ? (
                        <img
                          src="/assets/social-service-black-icon.svg"
                          alt={ta.metadata.agentCategory}
                          className="w-3 h-3"
                        />
                      ) : ta.metadata.agentCategory === "Research" ? (
                        <img
                          src="/assets/research-service-black-icon.svg"
                          alt={ta.metadata.agentCategory}
                          className="w-3 h-3"
                        />
                      ) : (
                        <img
                          src="/assets/security-service-black-icon.svg"
                          alt={ta.metadata.agentCategory}
                          className="w-3 h-3"
                        />
                      )}
                      <p className="font-bold text-[12px] leading-[19px] text-[#3D3D3D] truncate">
                        {ta.metadata.agentCategory}
                      </p>
                    </div>
                  </div>
                  {index !== arr.length - 1 ? (
                    <hr
                      className="border-[0.5px] border-[#8F95B2] w-[90%]"
                      key={ta.id}
                      style={{
                        borderImageSource:
                          "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                        borderImageSlice: "1",
                      }}
                    />
                  ) : null}
                </>
              ))}
            </div>
          ) : null}
          <div className="basis-[calc(50%-12px)] min-w-[318px]">
            <div className="mb-2 flex items-center">
              <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
              <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
              <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
              <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
            </div>
            <div className="relative rounded-[16px] shadow-[0px_4px_8px_0px_#12121266] h-[180px]">
              <img
                src="/assets/tasks-done-bg.png"
                alt="tasks-done"
                className="w-full object-cover rounded-[16px] h-full"
              />
              <div className="absolute left-0 bottom-0 p-4 h-full">
                <p className="text-[40px] font-medium text-primary">
                  {totalTasks.toLocaleString()}
                </p>
                <p className="text-[18px] font-normal text-white leading-[22px] mb-4">
                  tasks done
                </p>
                <img
                  src="/assets/tasks-done-icon.svg"
                  alt="done"
                  className="w-10 h-10"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:p-6 rounded-[16px] lg:bg-white">
          <div className="w-full flex items-center justify-between lg:mb-6 mb-4 overflow-x-auto">
            <div className="flex items-center justify-start gap-3">
              <div
                onClick={() => setSelectedProposal(null)}
                className={`px-4 py-2 rounded-[200px] flex-shrink-0 cursor-pointer ${
                  selectedProposal === null
                    ? "border-primary border"
                    : "border-[#8F95B2] border-[0.5px]"
                }`}
              >
                <p
                  className={`text-[14px] leading-[19px] ${
                    selectedProposal === null
                      ? "font-medium text-primary"
                      : "font-normal text-[#8F95B2]"
                  }`}
                >
                  All Agents
                </p>
              </div>
              {uniqueProposals.map((proposal) => (
                <div
                  key={proposal}
                  onClick={() =>
                    setSelectedProposal(
                      proposal === selectedProposal ? null : proposal
                    )
                  }
                  className={`px-4 py-2 rounded-[200px] flex-shrink-0 cursor-pointer ${
                    proposal === selectedProposal
                      ? "border-primary border"
                      : "border-[#8F95B2] border-[0.5px]"
                  }`}
                >
                  <p
                    className={`text-[14px] leading-[19px] ${
                      proposal === selectedProposal
                        ? "font-medium text-primary"
                        : "font-normal text-[#8F95B2]"
                    }`}
                  >
                    {proposal}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <hr
            className="lg:mb-6 mb-4 border-[0.5px] border-[#8F95B2] w-[70%]"
            style={{
              borderImageSource:
                "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
              borderImageSlice: "1",
            }}
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {Array.from({ length: 6 }).map((_, index) => (
                <AgentCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {agents.map((a: any) => (
                <div
                  key={a.id}
                  className="bg-white rounded-[16px] border-[0.5px] border-[#8F95B2] overflow-hidden w-full"
                >
                  <div className="w-full p-3 rounded-[8px] flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-6">
                        {a.metadata && (
                          <div className="flex items-start justify-start gap-2 w-[60%] overflow-hidden pr-1">
                            <Link
                              className="cursor-pointer"
                              href={`/agents/${getAddress(a.id)}`}
                            >
                              <div className="w-14 h-14 rounded-full relative">
                                <img
                                  className="w-full h-full rounded-full object-cover"
                                  alt="img"
                                  src={
                                    a.metadata.imageUri.startsWith("https://")
                                      ? a.metadata.imageUri
                                      : `https://${a.metadata.imageUri}`
                                  }
                                />
                                {a.id ===
                                  "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184" ||
                                a.id ===
                                  "0xc1ec8b9ca11ef907b959fed83272266b0e96b58d" ? (
                                  <img
                                    src="/assets/active-icon.svg"
                                    alt="active"
                                    className="w-2 h-2 absolute bottom-0 right-2"
                                  />
                                ) : null}
                              </div>
                            </Link>
                            <div className="w-full">
                              <ScrollingText
                                text={a.metadata.name}
                                className="font-bold text-[16px] leading-[19px] text-text-color mb-2"
                                speed={12}
                                delay={1000}
                              />
                              <p
                                className={`font-bold text-[14px] leading-[19px] text-light-text-color cursor-pointer transition-all duration-200`}
                                onClick={() => copyToClipboard(a.id)}
                              >
                                {copiedAddress === a.id
                                  ? "Copied!"
                                  : `${a.id.slice(0, 4)}...${a.id.slice(-4)}`}
                              </p>
                            </div>
                          </div>
                        )}
                        <div
                          className={`p-2 flex-shrink-0 rounded-[200px] flex items-center gap-1 max-w-[12ch] overflow-hidden whitespace-nowrap text-ellipsis ${
                            a.metadata.agentCategory === "DeFi"
                              ? "bg-[#FFC8F9]"
                              : a.metadata.agentCategory === "Social"
                              ? "bg-[#FBFFC8]"
                              : a.metadata.agentCategory === "Research"
                              ? "bg-[#C8FFCE]"
                              : "bg-[#C8E6FF]"
                          }`}
                        >
                          {a.metadata.agentCategory === "DeFi" ? (
                            <img
                              src="/assets/defi-service-black-icon.svg"
                              alt={a.metadata.agentCategory}
                            />
                          ) : a.metadata.agentCategory === "Social" ? (
                            <img
                              src="/assets/social-service-black-icon.svg"
                              alt={a.metadata.agentCategory}
                            />
                          ) : a.metadata.agentCategory === "Research" ? (
                            <img
                              src="/assets/research-service-black-icon.svg"
                              alt={a.metadata.agentCategory}
                            />
                          ) : (
                            <img
                              src="/assets/security-service-black-icon.svg"
                              alt={a.metadata.agentCategory}
                            />
                          )}
                          <p className="font-bold text-[14px] leading-[19px] text-[#3D3D3D] truncate">
                            {a.metadata.agentCategory}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 pb-4">
                        <hr
                          className="my-3 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        <div className="flex items-center justify-start gap-2 overflow-x-auto mb-2">
                          {a?.metadata?.attributes?.map((up: string) => (
                            <div
                              className="w-fit flex-shrink-0 p-[2px] px-2 border-[0.5px] border-primary rounded-[2000px]"
                              key={up}
                            >
                              <p className="text-[12px] text-primary font-semibold">
                                {up}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="h-[38px] font-normal text-[14px] leading-[19px] text-[#3D3D3D] line-clamp-2">
                          {a.metadata.description}
                        </p>
                        <hr
                          className="my-3 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-1">
                            <img
                              src="/assets/ensemble-icon.svg"
                              alt="wrench"
                              className="w-4 h-4"
                            />
                            <div>
                              <p className="font-normal text-[14px] leading-[19px] text-[#8F95B2] mb-1">
                                Credits
                              </p>
                              <p className="font-bold text-[14px] leading-[19px] text-[#3d3d3d]">
                                20-50
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <img
                              src="/assets/agent-list-card-wrench-icon.svg"
                              alt="wrench"
                              className="w-4 h-4"
                            />
                            <div>
                              <p className="font-normal text-[14px] leading-[19px] text-[#8F95B2] mb-1">
                                Tasks
                              </p>
                              <p className="font-bold text-[14px] leading-[19px] text-[#3d3d3d]">
                                {a.tasks.length}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <img
                              src="/assets/star-dull-icon.svg"
                              alt="wrench"
                              className="w-4 h-4"
                            />
                            <div>
                              <p className="font-normal text-[14px] leading-[19px] text-[#8F95B2] mb-1">
                                Rating
                              </p>
                              <p className="font-bold text-[14px] leading-[19px] text-[#3d3d3d]">
                                {convertRatingToStars(a.reputation)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-full border border-primary bg-primary rounded-[50px] py-2 flex items-center justify-center gap-2"
                      onClick={() => push(`/agents/${getAddress(a.id)}`)}
                    >
                      <img
                        src="/assets/bolt-icon.svg"
                        alt="bolt"
                        className="w-4 h-4"
                      />
                      <p className="font-bold text-white leading-[20px]">
                        Assign
                      </p>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
