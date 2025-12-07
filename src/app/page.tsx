"use client";
import { ScrollingText } from "@/components/ui/scrolling-text";
import { AgentCardSkeleton } from "@/components/ui/agent-card-skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAddress } from "ethers";
import axios from "axios";
import Image from "next/image";

export default function Home() {
  const { push } = useRouter();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [agents, setAgents] = useState<any[]>([]);

  const getAgents = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
      }
      const data = await axios.get(
        `${apiBaseUrl}/api/v1/agents`
      );
      console.log(data.data);
      setAgents(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 1000);
  };

  /* const GET_ALL_PROPOSALS = gql`
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
          agents {
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
            selectedProposal || debouncedAgentName
              ? `(where: {${
                  selectedProposal
                    ? `metadata_: {agentCategory: "${selectedProposal}"}`
                    : ""
                }${
                  debouncedAgentName
                    ? `, name_contains_nocase: "${debouncedAgentName.toLowerCase()}"`
                    : ""
                }})`
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
    [selectedProposal, debouncedAgentName]
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
  }, [allAgentsData?.agents]); */

  useEffect(() => {
    getAgents();
  }, []);

  return (
    <>
      <div>
        <h1 className="font-[Montserrat] text-[24px] font-semibold leading-[32px] text-primary mb-2">
          INTERN AGENTS
        </h1>
        <p className="text-[18px] font-normal leading-[22px] text-[#121212] mb-2">
          Chat with any agent on the subject of your choice{" "}
        </p>
        <hr
          className="border-[0.5px] border-[#8F95B2] my-4 w-[90%]"
          style={{
            borderImageSource:
              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
            borderImageSlice: "1",
          }}
        />
        <div className="flex items-stretch gap-6 mb-6 w-full overflow-x-auto">
          <div
            className="basis-[calc(50%-12px)] min-w-[318px] p-4 flex flex-col rounded-[16px]"
            style={{
              backgroundImage: "url('/assets/featured-agent-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center gap-2">
              <img
                src="/assets/karels-intern.jpg"
                alt="karels-intern"
                width={68}
                height={68}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col gap-1 w-full">
                <div className="w-full flex items-center justify-between">
                  <p className="font-[Montserrat] text-[24px] font-semibold leading-[32px] text-[#121212]">
                    Union Intern
                  </p>
                  <p className="space-x-1 flex-shrink-0 text-[14px] font-medium leading-[20px] text-[#121212]">
                    ⚡️ Featured
                  </p>
                </div>
                <p className="font-[Montserrat] text-[16px] font-normal leading-[20px] text-[#3d3d3d]">
                  Intern by the Ensemble Stack
                </p>
              </div>
            </div>
            <hr className="border-[0.5px] border-[#8F95B2] w-[50%] my-4" />
            <div className="flex items-center justify-between">
              <Link
                href="https://x.com/karelsintern"
                target="_blank"
                rel="noreferrer noopener"
                className="text-[18px] font-normal leading-[22px] text-[#3d3d3d]"
              >
                Twitter
              </Link>
              <button className="py-2 px-4 rounded-[20000px] bg-gradient-to-r from-[#3d3d3d] to-[#595959] text-white flex items-center gap-2 text-[16px] font-medium leading-[24px]">
                Explore
                <Image
                  src="/assets/pixelated-arrow-icon.svg"
                  alt="pixelated-arrow"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>
          <div
            className="basis-[calc(50%-12px)] min-w-[318px] p-4 flex flex-col justify-between rounded-[16px]"
            style={{
              backgroundImage: "url('/assets/messages-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center gap-2">
              <img
                src="/assets/messages-icon.svg"
                alt="messages-icon"
                width={16}
                height={16}
                className="rounded-full object-cover"
              />
              <p className="font-[Montserrat] text-[18px] font-medium leading-[22px] text-[#3d3d3d]">
                Messages
              </p>
            </div>
            <div className="w-full flex items-baseline justify-between">
              <p className="font-[Montserrat] text-[28px] font-medium leading-[32px] text-[#3d3d3d]">
                1K+
              </p>
              <img
                src={"/assets/messages-gradient.svg"}
                alt="messages-gradient"
              />
            </div>
          </div>
        </div>
        {/* <div className="flex items-stretch gap-6 mb-6 w-full overflow-x-auto">
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
                      <Link href={`/agents/${getAddress(ta.id)}`}>
                        <img
                          src={
                            ta.metadata.imageUri.startsWith("https://")
                              ? ta.metadata.imageUri
                              : `https://${ta.metadata.imageUri}`
                          }
                          alt="trending-agent"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </Link>
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
                      key={`${ta.id}-${index}`}
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
        </div> */}
        {/* <>
          <div className="w-full flex lg:flex-row flex-col lg:items-center items-start justify-between max-lg:gap-2 lg:mb-6 mb-4">
            <div className="flex items-center justify-start gap-3 overflow-x-auto max-lg:w-full">
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
            <div className="flex items-center gap-1 py-2 px-4 rounded-[2000px] border border-[#8F95B2] max-lg:w-full">
              <img
                src="/assets/search-icon.svg"
                alt="search"
                className="w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="outline-none text-[14px] leading-[19px] text-[#121212] font-medium w-full bg-inherit"
              />
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
          </> */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <AgentCardSkeleton key={index} />
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {agents.map((a: any) =>
              a.profile ? (
                <div
                  key={`${a.agent_id}-${a.agent_type}`}
                  className="bg-white rounded-[16px] border-[0.5px] border-[#8F95B2] overflow-hidden w-full"
                >
                  <div className="w-full p-3 rounded-[8px] flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-6">
                        {a.metadata && (
                          <div className="flex items-start justify-start gap-2 w-[60%] overflow-hidden pr-1">
                            <Link
                              className="cursor-pointer"
                              href={`/agents/${a.agent_id}`}
                            >
                              <div className="w-14 h-14 rounded-full relative">
                                <img
                                  className="w-full h-full rounded-full object-cover"
                                  alt="img"
                                  src={
                                    a.profile.avatar
                                      ? a.profile.avatar.startsWith("https://")
                                        ? a.profile.avatar
                                        : `https://${a.profile.avatar}`
                                      : "/assets/karels-intern.jpg"
                                  }
                                />
                              </div>
                            </Link>
                            <div className="w-full">
                              <ScrollingText
                                text={a.profile.display_name}
                                className="font-bold text-[16px] leading-[19px] text-text-color mb-2"
                                speed={12}
                                delay={1000}
                              />
                              {a.identity.ethereum_address && (
                                <p
                                  className={`font-bold text-[14px] leading-[19px] text-light-text-color cursor-pointer transition-all duration-200`}
                                  onClick={() =>
                                    copyToClipboard(a.identity.ethereum_address)
                                  }
                                >
                                  {copiedAddress === a.identity.ethereum_address
                                    ? "Copied!"
                                    : `${a.identity.ethereum_address.slice(
                                        0,
                                        4
                                      )}...${a.identity.ethereum_address.slice(
                                        -4
                                      )}`}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {a.identity.verified && (
                          <div className="flex items-center gap-2">
                            <img
                              src="/assets/check-icon.svg"
                              alt="check"
                              className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                            />
                            <p className="text-[14px] leading-[19px] text-[#121212]">
                              Verified
                            </p>
                          </div>
                        )}
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
                          {a?.metadata?.tags?.map((up: string) => (
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
                          {a.description}
                        </p>
                        <hr
                          className="my-3 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-center">
                      <div className="w-full flex items-center gap-1">
                        {a.profile?.links?.twitter ? (
                          <Link
                            href={a.profile?.links?.twitter}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <img
                              src="/assets/agent-list-card-x-icon.svg"
                              alt="telegram"
                              className="w-8 h-8 cursor-pointer"
                            />
                          </Link>
                        ) : null}
                        {a.profile?.links?.github ? (
                          <Link
                            href={a.profile?.links?.github}
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
                        {a.profile?.links?.website ? (
                          <Link
                            href={a.profile?.links?.website}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <img
                              src="/assets/agent-list-website-icon.svg"
                              alt="github"
                              className="w-8 h-8 cursor-pointer"
                            />
                          </Link>
                        ) : null}
                      </div>
                      <button
                        className="w-full border border-primary bg-primary rounded-[50px] py-2 flex items-center justify-center gap-2"
                        onClick={() => push(`/agents/${a.agent_id}/chat`)}
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
              ) : null
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
