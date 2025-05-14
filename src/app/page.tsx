"use client";
import { AppHeader, Loader, SideMenu } from "@/components";
import { gql, useQuery } from "@apollo/client";
import { convertRatingToStars } from "@/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useChat } from "@/context/chat";

export default function Home() {
  const { push } = useRouter();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const GET_ALL_PROPOSALS = gql`
    query MyQuery {
      proposals {
        id
        isRemoved
        price
        service
      }
    }
  `;

  const GET_TOP_AGENT = useMemo(
    () => gql`
      query MyQuery {
        agent(id: "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184") {
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
            isRemoved
            price
            service
          }
          tasks {
            id
            issuer
            prompt
            proposalId
            rating
            result
            status
          }
        }
      }
    `,
    []
  );

  const GET_AGENTS = useMemo(
    () =>
      gql`
        query MyQuery {
          agents
            ${
              selectedProposal
                ? `(where: {proposals_: {service: "${selectedProposal}"}})`
                : ""
            }
            {
              id
              agentUri
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
              tasks {
                id
                issuer
                prompt
                proposalId
                rating
                result
                status
              }
              proposals {
                id
                isRemoved
                price
                service
              }
            }
          }
      `,
    [selectedProposal]
  );

  const { data, loading } = useQuery(GET_AGENTS);
  const { data: proposalsData } = useQuery(GET_ALL_PROPOSALS);
  const { data: topAgentData } = useQuery(GET_TOP_AGENT);

  const agents = [...(data?.agents || [])]?.sort(
    (a: any, b: any) => b.tasks.length - a.tasks.length
  );

  // Get unique proposals from all agents
  const uniqueProposals = useMemo(() => {
    const proposals = new Set<string>();
    proposalsData?.proposals?.forEach((p: any) => {
      proposals.add(p.service);
    });
    return Array.from(proposals);
  }, [proposalsData]);

  // Calculate total tasks across all agents
  const totalTasks = useMemo(() => {
    return agents.reduce((total, agent) => total + agent.tasks.length, 0);
  }, [agents]);

  const [chatState] = useChat();

  return (
    <>
      <div>
        <AppHeader />
        <div className="flex items-start gap-16 pt-16">
          <SideMenu />
          <div className="grow w-full ">
            <div className="flex items-stretch gap-6 mb-6 w-full">
              {topAgentData ? (
                <div className="basis-[calc(50%-12px)] flex flex-col justify-between bg-white rounded-[16px] border-[0.5px] border-[#CADFF4]">
                  <div className="flex items-center justify-between py-2 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/featured-agent-star-icon.svg"
                        alt="featured-star"
                        className="w-6 h-6"
                      />
                      <p className="font-semibold leading-[20px] text-[#F94D27]">
                        Featured Agent
                      </p>
                    </div>
                    <img
                      src="/assets/featured-agent-icon.svg"
                      alt="featured-icon"
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="relative">
                    <img
                      src="/assets/featured-agent-bg.png"
                      alt="featured-bg"
                      className="w-full object-cover rounded-[16px]"
                    />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-start gap-2 w-[70%] grow">
                          <img
                            src={
                              topAgentData.agent.metadata.imageUri.startsWith(
                                "https://"
                              )
                                ? topAgentData.agent.metadata.imageUri
                                : `https://${topAgentData.agent.metadata.imageUri}`
                            }
                            alt={topAgentData.agent.name}
                            className="w-[68px] h-[68px] rounded-full border border-white"
                          />
                          <div className="space-y-1">
                            <p className="text-white text-[24px] font-medium leading-[28px]">
                              {topAgentData.agent.name}
                            </p>
                            <p className="font-normal text-[16px] leading-[19px] text-white">
                              {topAgentData.agent.id.slice(0, 4)}...
                              {topAgentData.agent.id.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <img
                            src="/assets/featured-agent-graph-icon.svg"
                            alt="graph"
                          />
                          <p className="absolute right-0 bottom-0 font-semibold text-[12px] text-white">
                            {topAgentData.agent.tasks.length} tasks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col items-start w-[70%]">
                          <p className="text-[18px] font-normal text-white leading-[22px] w-full overflow-hidden whitespace-nowrap text-ellipsis">
                            {topAgentData.agent.metadata.description}
                          </p>
                          <hr
                            className="my-1 border-[0.5px] border-white w-[70%]"
                            style={{
                              borderImageSource:
                                "linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0) 100%)",
                              borderImageSlice: "1",
                            }}
                          />
                          <p className="text-[18px] font-normal text-white leading-[22px] w-full overflow-hidden">
                            {topAgentData.agent.proposals[0].service}
                          </p>
                        </div>
                        <button
                          className="py-1 px-4 border border-white flex items-center gap-1 rounded-full"
                          onClick={() =>
                            push(`/agents/${topAgentData.agent.id}`)
                          }
                        >
                          <p className="font-medium text-white leading-[20px]">
                            Assign
                          </p>
                          <img
                            src="/assets/pixelated-arrow-icon.svg"
                            alt="arrow"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="basis-[calc(50%-12px)]">
                <div className="mb-2 flex items-center">
                  <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
                  <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
                  <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
                  <img src="/assets/ornament-pattern-icon.svg" alt="ornament" />
                </div>
                <div className="relative rounded-[16px] shadow-[0px_4px_8px_0px_#12121266]">
                  <img
                    src="/assets/tasks-done-bg.png"
                    alt="tasks-done"
                    className="w-full object-cover rounded-[16px]"
                  />
                  <div className="absolute left-0 bottom-0 p-4">
                    <p className="text-[40px] font-medium text-primary">
                      {totalTasks.toLocaleString()}
                    </p>
                    <p className="text-[18px] font-normal text-white leading-[22px] mb-4">
                      tasks done
                    </p>
                    <img src="/assets/tasks-done-icon.svg" alt="done" className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-[16px] bg-white">
              <div className="w-full flex items-center justify-between mb-6">
                <div className="flex items-center justify-start gap-3 flex-wrap">
                  <div
                    onClick={() => setSelectedProposal(null)}
                    className={`px-4 py-2 rounded-[200px] cursor-pointer ${
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
                      className={`px-4 py-2 rounded-[200px] cursor-pointer ${
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
              {loading ? (
                <Loader size="xl" />
              ) : (
                <div className="flex items-stretch justify-start gap-6 flex-wrap">
                  {agents.map((a: any) => (
                    <div
                      key={a.id}
                      className="bg-white w-[304px] rounded-[16px] border-[0.5px] border-[#8F95B2] overflow-hidden"
                    >
                      <div className="md:min-w-[282px] w-full p-3 rounded-[8px] flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-6">
                            {a.metadata && (
                              <div className="flex items-start justify-start gap-2">
                                <Link
                                  className="cursor-pointer"
                                  href={`/agents/${a.id}`}
                                >
                                  <div className="w-14 h-14 rounded-full relative">
                                    <img
                                      className="w-full h-full rounded-full object-cover"
                                      alt="img"
                                      src={
                                        a.metadata.imageUri.startsWith(
                                          "https://"
                                        )
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
                                <div>
                                  <p className="font-bold text-[16px] leading-[19px] text-text-color mb-2">
                                    {a.metadata.name}
                                  </p>
                                  <p className="font-bold text-[14px] leading-[19px] text-light-text-color">
                                    {a.id.slice(0, 4)}...
                                    {a.id.slice(-4)}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div
                              className={`p-2 rounded-[200px] flex items-center gap-1 max-w-[12ch] overflow-hidden whitespace-nowrap text-ellipsis ${
                                a.proposals[0].service === "Swap"
                                  ? "bg-[#FFC8F9]"
                                  : ["Bull-Post", "Bless Me"].includes(
                                      a.proposals[0].service
                                    )
                                  ? "bg-[#FBFFC8]"
                                  : ["Trends", "Markets"].includes(
                                      a.proposals[0].service
                                    )
                                  ? "bg-[#C8FFCE]"
                                  : "bg-[#C8E6FF]"
                              }`}
                            >
                              <p className="font-bold text-[14px] leading-[19px] text-[#3D3D3D] truncate">
                                {a.proposals[0].service}
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
                            <p className="font-normal text-[14px] leading-[19px] text-[#3D3D3D] line-clamp-2">
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
                          onClick={() => push(`/agents/${a.id}`)}
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
        </div>
      </div>
    </>
  );
}
