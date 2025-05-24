"use client";
import { AppHeader, Loader, SideMenu } from "@/components";
import { TaskStatus } from "@/enum/taskstatus";
import { convertRatingToStars, getTaskStatusText } from "@/utils";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, use, useMemo, useState } from "react";
import { formatEther } from "viem";

const Page: FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const { id } = use(params);
  const { push } = useRouter();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 100);
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

  const GET_SERVICE = useMemo(
    () => gql`
    query MyQuery {
  service(id: "${agent?.agent?.proposals[0]?.service}") {
    name
    category
    description
    id
  }
}
  `,
    [agent]
  );

  const { data: service } = useQuery(GET_SERVICE);

  console.log(agent, service);

  return (
    <div>
      <AppHeader />
      <div className="flex items-start gap-4 pt-8">
        <SideMenu />
        <div className="grow w-full">
          {loading ? (
            <Loader size="xl" />
          ) : agent && agent.agent ? (
            <div className="flex items-stretch gap-4 w-full">
              <div className="grow rounded-[10px]">
                <div className="py-8 px-5 rounded-[10px] w-full bg-white">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-primary text-[20px] leading-[24px] font-semibold">
                      AGENT PROFILE
                    </p>
                    <div className="flex items-center gap-1">
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
                    className="my-5 border-[1px] border-[#8F95B2]"
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
                          agent.agent.metadata?.imageUri.startsWith("https://")
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
                            opacity: copied ? 0.6 : 1,
                          }}
                        >
                          {agent.agent.id?.slice(0, 4)}...
                          {agent.agent.id?.slice(-4)}
                        </p>
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
                    <p className="text-[14px] font-medium text-[#121212]">
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
                    <div className="flex items-start justify-between mb-6">
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
                              {formatEther(agent.agent?.proposals[0].price)} ETH
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
                  <div className="w-full flex items-center gap-4">
                    <button
                      className="w-full space-x-2 flex items-center justify-center rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
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
                      className="w-full space-x-2 flex items-center justify-center rounded-[50px] bg-white py-[12px] px-[16px] border border-[#121212]"
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
              <div className="flex-shrink-0 w-[368px] rounded-[10px]">
                <div
                  className="relative h-[545px] overflow-auto p-4 rounded-[10px] w-full bg-white z-[1]"
                  style={{ scrollbarWidth: "none" }}
                >
                  {/* <img
                    src="/assets/past-works-icon.svg"
                    alt="past-work"
                    className="absolute z-[-1]"
                  /> */}
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/task-history-icon.svg"
                      alt="task-history"
                      className="w-6 h-6"
                    />
                    <p className="text-light-text-color font-medium">
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
                        <div key={`${td.id}-${td.prompt}`} className="z-[1]">
                          <Link
                            href={`/tasks/${td.id}`}
                            className="flex items-center justify-between"
                          >
                            <p className="text-light-text-color font-[500] max-w-[12ch] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {td.prompt}
                            </p>
                            <p
                              className="text-[12px] font-bold"
                              style={{
                                color:
                                  Number(td.status) === TaskStatus.CREATED
                                    ? "#3B82F6"
                                    : Number(td.status) === TaskStatus.ASSIGNED
                                    ? "#F59E0B"
                                    : Number(td.status) === TaskStatus.COMPLETED
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
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Page;
