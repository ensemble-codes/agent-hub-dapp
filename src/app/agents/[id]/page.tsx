"use client";
import { AppHeader, Loader, SideMenu } from "@/components";
import { TaskStatus } from "@/enum/taskstatus";
import { convertRatingToStars, getTaskStatusText } from "@/utils";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, use, useState } from "react";
import { formatEther } from "viem";
import AGENTS_INFO from "@/data/agentsinfo.json";

const Page: FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const { id } = use(params);
  const { push } = useRouter();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 1000);
  };

  const GET_AGENT = gql`
    query MyQuery {
  agent(id: "${id}") {
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
  `;

  const { data: agent, loading } = useQuery(GET_AGENT);

  return (
    <div>
      <AppHeader />
      <div className="flex items-start gap-4 lg:pt-8">
        <SideMenu />
        <div className="grow w-full">
          {loading ? (
            <Loader size="xl" />
          ) : agent && agent.agent ? (
            <>
              <div className="flex lg:flex-row flex-col items-stretch lg:gap-4 gap-6 w-full">
                <div className="grow rounded-[10px]">
                  <div className="lg:py-8 lg:px-5 rounded-[10px] w-full lg:bg-white">
                    <div className="flex w-full items-start justify-between mb-4 lg:mb-0">
                      <p className="text-primary text-[20px] leading-[24px] font-semibold">
                        AGENT PROFILE
                      </p>
                      <div className="lg:flex items-center gap-1 hidden">
                        {agent.agent.metadata?.telegram ? (
                          <Link
                            href={agent.agent.metadata?.telegram}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <img
                              src="/assets/agent-list-card-tg-icon.svg"
                              alt="telegram"
                              className="w-8 h-8 cursor-pointer"
                            />
                          </Link>
                        ) : null}
                        {agent.agent.metadata?.twitter ? (
                          <Link
                            href={agent.agent.metadata?.twitter}
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
                        {agent.agent.metadata?.github ? (
                          <Link
                            href={agent.agent.metadata?.github}
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
                            agent.agent.metadata?.imageUri.startsWith(
                              "https://"
                            )
                              ? agent.agent.metadata?.imageUri
                              : `https://${agent.agent.metadata?.imageUri}`
                          }
                          alt={agent.agent.metadata?.name}
                        />
                        <div className="flex flex-col items-start gap-2">
                          <p className="font-bold text-[#3d3d3d] text-[20px] leading-[auto]">
                            {agent.agent.metadata?.name}
                          </p>
                          <p
                            className="font-bold text-light-text-color text-[16px] leading-[auto] cursor-pointer flex items-center gap-1"
                            onClick={() => copyToClipboard(agent.agent.id)}
                            style={{
                              transition: "all 0.3s ease",
                              opacity:
                                copiedPrompt === agent.agent.id ? 0.6 : 1,
                            }}
                          >
                            {agent.agent.id?.slice(0, 4)}...
                            {agent.agent.id?.slice(-4)}
                          </p>
                          {id ===
                          "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184" ? (
                            <p className="py-1 px-4 bg-[#C8F3FF] rounded-[2000px] flex items-center gap-2">
                              <img
                                src="/assets/vibes-dark-icon.svg"
                                alt="vibes"
                                className="w-[18px] h-[18px]"
                              />
                              <p className="text-[#3d3d3d] text-[14px] font-medium leading-[18px]">
                                Vibes
                              </p>
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <img
                        src="/assets/profile-ornament.svg"
                        alt="ornament"
                        className="absolute w-[214px] h-[158px] right-[0px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-primary font-medium leading-[100%]">
                        About
                      </p>
                      <p className="text-[16px] font-medium text-[#121212]">
                        {agent.agent.metadata?.description}
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
                    <div className="space-y-2">
                      <p className="text-primary font-medium leading-[100%]">
                        Capabilities
                      </p>
                      <p className="text-[14px] font-medium text-text-color flex items-center gap-1">
                        <img
                          src="/assets/check-icon.svg"
                          alt="check"
                          className="w-4 h-4"
                        />
                        {agent.agent.proposals &&
                          agent.agent.proposals.length &&
                          agent.agent.proposals[0].service}
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
                    <div className="space-y-2">
                      <p className="text-primary font-medium leading-[100%]">
                        Stats
                      </p>
                      <div className="flex items-start gap-12 mb-6">
                        <div className="flex items-start justify-center gap-1">
                          <img
                            src="/assets/price-tag-icon.svg"
                            alt="price-tag"
                            className="w-4 h-4 mt-[2px]"
                          />
                          <p className="flex flex-col items-start gap-1">
                            <span className="text-[14px] text-light-text-color font-bold">
                              Price
                            </span>
                            {agent.agent?.proposals?.length ? (
                              <p className="font-bold leading-[19px] text-primary">
                                {formatEther(agent.agent?.proposals[0].price)}{" "}
                                ETH
                              </p>
                            ) : null}
                          </p>
                        </div>
                        <div className="flex items-start justify-center gap-1">
                          <img
                            src="/assets/agent-list-card-wrench-icon.svg"
                            alt="wrench"
                            className="w-4 h-4 mt-[2px]"
                          />{" "}
                          <p className="flex flex-col items-start gap-1">
                            <span className="text-[14px] text-light-text-color font-bold">
                              Tasks
                            </span>
                            <p className="font-bold leading-[19px] text-text-color">
                              {agent.agent.tasks.length}
                            </p>
                          </p>
                        </div>
                        <div className="flex items-start justify-center gap-1">
                          <img
                            src="/assets/star-dull-icon.svg"
                            alt="star"
                            className="w-4 h-4 mt-[2px]"
                          />
                          <p className="flex flex-col items-start gap-1">
                            <span className="text-[14px] text-light-text-color font-bold">
                              Rating
                            </span>
                            <p className="font-bold leading-[19px] text-text-color">
                              {convertRatingToStars(agent.agent.reputation)}
                            </p>
                          </p>
                        </div>
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
                    <div className="w-full flex lg:flex-row flex-col items-center gap-4">
                      <button
                        className="lg:w-fit w-full space-x-2 flex items-center justify-center rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
                        onClick={() =>
                          push(
                            `/task-center?service=${agent.agent.proposals[0]?.service}&proposal=${agent.agent.proposals[0]?.id}`
                          )
                        }
                      >
                        <img
                          src="/assets/bolt-icon.svg"
                          alt="bolt"
                          className="w-4 h-4"
                        />
                        <span className="text-white text-[18px] font-[700] leading-[24px]">
                          {agent.agent.proposals &&
                            agent.agent.proposals.length &&
                            agent.agent.proposals[0].service}
                        </span>
                      </button>
                      <button
                        className="lg:w-fit w-full space-x-2 flex items-center justify-center rounded-[50px] bg-white py-[12px] px-[16px] border border-[#121212]"
                        onClick={() =>
                          push(`/orchestrator?agent=${agent.agent.id}`)
                        }
                      >
                        <img
                          src="/assets/chat-icon.svg"
                          alt="chat"
                          className="w-4 h-4"
                        />
                        <span className="text-[#121212] text-[18px] font-[700] leading-[24px]">
                          {"Chat with Agent"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 lg:w-[368px] w-full rounded-[10px]">
                  <div
                    className="relative lg:h-[614px] overflow-auto lg:p-4 rounded-[10px] w-full lg:bg-white z-[1]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {id === "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184" ? (
                      <>
                        <img
                          src="/assets/past-works-icon.svg"
                          alt="past-work"
                          className="absolute z-[-1] w-full top-0 left-0"
                        />
                        <div className="lg:px-4">
                          <div className="flex w-full items-center justify-center gap-2 my-4">
                            <img
                              src="/assets/og-x-icon.svg"
                              alt="x"
                              className="w-5 h-5"
                            />
                            <p className="text-[16px] font-semibold text-primary leading-[20px]">
                              PAST WORKS
                            </p>
                          </div>
                          {AGENTS_INFO[id].PAST_WORKS.map((p, index) => (
                            <div
                              key={`${p.name}-${index}`}
                              className="bg-white rounded-[8px] shadow-[0px_4px_4px_0px_#00000025] p-4 mb-4"
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <img
                                  src={p.img}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="space-y-2">
                                  <p className="text-[#3d3d3d] text-[12px] font-medium">
                                    {p.name}
                                  </p>
                                  <p className="text-[#8F95B2] text-[12px] font-medium">
                                    {p.username}
                                  </p>
                                </div>
                              </div>
                              <p
                                dangerouslySetInnerHTML={{ __html: p.tweet }}
                                className="mb-2"
                              />
                              <div className="flex items-baseline gap-1">
                                <p className="text-[#8F95B2] text-[12px] font-normal">
                                  {p.time}
                                </p>
                                <span className="text-[#8F95B2] text-[12px] font-normal">
                                  ·
                                </span>
                                <p className="text-[#8F95B2] text-[12px] font-normal">
                                  <span className="text-[#3d3d3d] font-medium">
                                    {p.views}
                                  </span>
                                  &nbsp;
                                  <span>Views</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/**/}
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/task-history-icon.svg"
                            alt="task-history"
                            className="w-6 h-6"
                          />
                          <p className="text-light-text-color font-bold">
                            Task History
                          </p>
                        </div>
                        <hr
                          className="my-3 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        {[...agent.agent.tasks]
                          .sort(
                            (a: { id: string }, b: { id: string }) =>
                              Number(b.id) - Number(a.id)
                          )
                          .map((td: any, index: number) => (
                            <>
                              <div
                                key={`${td.id}-${td.prompt}`}
                                className="z-[1]"
                              >
                                <Link
                                  href={`/tasks/${td.id}`}
                                  className="flex items-center justify-between"
                                >
                                  <p className="text-light-text-color font-[500] lg:max-w-[12ch] max-w-[20ch] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                    {td.prompt}
                                  </p>
                                  <p
                                    className="text-[12px] font-bold"
                                    style={{
                                      color:
                                        Number(td.status) === TaskStatus.CREATED
                                          ? "#3B82F6"
                                          : Number(td.status) ===
                                            TaskStatus.ASSIGNED
                                          ? "#F59E0B"
                                          : Number(td.status) ===
                                            TaskStatus.COMPLETED
                                          ? "#00D64F"
                                          : "#EF4444",
                                    }}
                                  >
                                    {getTaskStatusText(
                                      Number(td.status) as TaskStatus
                                    )}
                                  </p>
                                </Link>
                              </div>
                              {index === agent.agent.tasks.length - 1 ? null : (
                                <hr
                                  className="my-3 border-[0.5px] border-[#8F95B2] w-[70%]"
                                  style={{
                                    borderImageSource:
                                      "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                                    borderImageSlice: "1",
                                  }}
                                />
                              )}
                            </>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {id === "0xad739e0dbd5a19c22cc00c5fedcb3448630a8184" ? (
                <>
                  <div className="flex lg:flex-row flex-col items-stretch gap-4 w-full mt-4">
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
                    </div>
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
                      <div className="p-4 flex items-center justify-start gap-2 border-b-[1px] border-b-[#8F95B2]">
                        <img
                          src="/assets/check-squared-icon.svg"
                          alt="check"
                          className="w-4 h-4"
                        />
                        <p className="text-[#121212] text-[14px] font-normal">
                          This agent is deployed on X (Twitter)
                        </p>
                      </div>
                      <div className="p-4 flex items-center justify-start gap-2 border-b-[1px] border-b-[#8F95B2]">
                        <img
                          src="/assets/check-squared-icon.svg"
                          alt="check"
                          className="w-4 h-4"
                        />
                        <p className="text-[#121212] text-[14px] font-normal">
                          The agent can only operate on X, and not perform
                          actions outside of it
                        </p>
                      </div>
                      <div className="p-4 flex items-center justify-start gap-2 border-b-[1px] border-b-[#8F95B2]">
                        <img
                          src="/assets/check-squared-icon.svg"
                          alt="check"
                          className="w-4 h-4"
                        />
                        <p className="text-[#121212] text-[14px] font-normal">
                          This agent can be used to send a greeting/wish to
                          someone on X
                        </p>
                      </div>
                      <div className="p-4 flex items-center justify-start gap-2">
                        <img
                          src="/assets/check-squared-icon.svg"
                          alt="check"
                          className="w-4 h-4"
                        />
                        <p className="text-[#121212] text-[14px] font-normal">
                          Agent will never provide financial advice, please
                          check the profile before interacting
                        </p>
                      </div>
                    </div>
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
                      <div className="p-4 flex items-center justify-between gap-2 border-b-[1px] border-b-[#8F95B2] group relative">
                        <p
                          className="text-[#121212] text-[14px] font-normal w-[80%] cursor-pointer active:bg-gray-100 transition-colors duration-200 rounded-md p-2 -m-2"
                          onClick={() =>
                            copyToClipboard(
                              "I want you to make a blessing or a greeting"
                            )
                          }
                        >
                          "I want you to make a blessing or a greeting"
                        </p>
                        <img
                          src="/assets/copy-icon.svg"
                          alt="copy"
                          className={`w-5 h-5 cursor-pointer transition-opacity duration-200 absolute right-4 opacity-0 group-hover:opacity-100 hidden lg:block ${
                            copiedPrompt ===
                            "I want you to make a blessing or a greeting"
                              ? "opacity-50"
                              : ""
                          }`}
                          onClick={() =>
                            copyToClipboard(
                              "I want you to make a blessing or a greeting"
                            )
                          }
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between gap-2 border-b-[1px] border-b-[#8F95B2] group relative">
                        <p
                          className="text-[#121212] text-[14px] font-normal w-[80%] cursor-pointer active:bg-gray-100 transition-colors duration-200 rounded-md p-2 -m-2"
                          onClick={() =>
                            copyToClipboard(
                              "I want you to reply to an account on Twitter"
                            )
                          }
                        >
                          "I want you to reply to an account on Twitter"
                        </p>
                        <img
                          src="/assets/copy-icon.svg"
                          alt="copy"
                          className={`w-5 h-5 cursor-pointer transition-opacity duration-200 absolute right-4 opacity-0 group-hover:opacity-100 hidden lg:block ${
                            copiedPrompt ===
                            "I want you to reply to an account on Twitter"
                              ? "opacity-50"
                              : ""
                          }`}
                          onClick={() =>
                            copyToClipboard(
                              "I want you to reply to an account on Twitter"
                            )
                          }
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between gap-2 border-b-[1px] border-b-[#8F95B2] group relative">
                        <p
                          className="text-[#121212] text-[14px] font-normal w-[80%] cursor-pointer active:bg-gray-100 transition-colors duration-200 rounded-md p-2 -m-2"
                          onClick={() =>
                            copyToClipboard(
                              "I want you to shill a project on Twitter for maximum reach"
                            )
                          }
                        >
                          "I want you to shill a project on Twitter for maximum
                          reach"
                        </p>
                        <img
                          src="/assets/copy-icon.svg"
                          alt="copy"
                          className={`w-5 h-5 cursor-pointer transition-opacity duration-200 absolute right-4 opacity-0 group-hover:opacity-100 hidden lg:block ${
                            copiedPrompt ===
                            "I want you to shill a project on Twitter for maximum reach"
                              ? "opacity-50"
                              : ""
                          }`}
                          onClick={() =>
                            copyToClipboard(
                              "I want you to shill a project on Twitter for maximum reach"
                            )
                          }
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between gap-2 group relative">
                        <p
                          className="text-[#121212] text-[14px] font-normal w-[80%] cursor-pointer active:bg-gray-100 transition-colors duration-200 rounded-md p-2 -m-2"
                          onClick={() =>
                            copyToClipboard(
                              "Show me some samples of your best work so far"
                            )
                          }
                        >
                          "Show me some samples of your best work so far"
                        </p>
                        <img
                          src="/assets/copy-icon.svg"
                          alt="copy"
                          className={`w-5 h-5 cursor-pointer transition-opacity duration-200 absolute right-4 opacity-0 group-hover:opacity-100 hidden lg:block ${
                            copiedPrompt ===
                            "Show me some samples of your best work so far"
                              ? "opacity-50"
                              : ""
                          }`}
                          onClick={() =>
                            copyToClipboard(
                              "Show me some samples of your best work so far"
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Page;
