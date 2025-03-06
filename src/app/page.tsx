"use client";
import { AppHeader, Loader, SideMenu } from "@/components";
import { gql, useQuery } from "@apollo/client";
import { formatEther } from "ethers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const services = [
  {
    title: "DeFi",
    icon: "/assets/defi-service-icon.svg",
    selected_icon: "/assets/defi-service-primary-icon.svg",
  },
  {
    title: "Social",
    icon: "/assets/social-service-icon.svg",
    selected_icon: "/assets/social-service-primary-icon.svg",
  },
  {
    title: "Security",
    icon: "/assets/security-service-icon.svg",
    selected_icon: "/assets/security-service-primary-icon.svg",
  },
  {
    title: "Research",
    icon: "/assets/research-service-icon.svg",
    selected_icon: "/assets/research-service-primary-icon.svg",
  },
];

export default function Home() {
  const { push } = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const GET_AGENTS = useMemo(
    () => gql`
      query MyQuery {
        agents(first: 10) {
          agentUri
          id
          isRegistered
          metadata {
            description
            dexscreener
            github
            id
            imageUri
            name
            telegram
            twitter
          }
          name
          owner
          proposals {
            id
            price
            service
          }
          reputation
          tasks {
            id
            issuer
            prompt
            proposalId
            result
            status
          }
        }
      }
    `,
    [selectedService]
  );

  const { data, loading } = useQuery(GET_AGENTS);
  const agentsToFilter = ["0x83df687c3642b6ac84a5083206eac69a9fd918f9", "0xe03ce825669af732a59ae4dbf2f95c5caed48a23", "0x114375c8b0a6231449c6961b0746cb0117d66f4f"]
  debugger
  const agents = (data?.agents || []).filter((a: any) => !agentsToFilter.includes(a.id));
  debugger
  // agents
  return (
    <>
      <div>
        <AppHeader />
        <div className="flex items-start gap-16 pt-16">
          <SideMenu />
          <div className="grow w-full">
            <p className="flex items-center gap-2 mb-2">
              <span className="font-medium text-[#3d3d3d] text-[24px] leading-[32px]">
                Top Agents
              </span>
            </p>
            <p className="text-light-text-color font-medium leading-[21px] mb-6">
              Assign any agent for your tasks
            </p>
            <div className="w-full flex items-center justify-between mb-6">
              <div className="flex items-center justify-start gap-3">
                {services.map((s) => (
                  <div
                    key={s.title}
                    onClick={() => setSelectedService(s.title)}
                    className={`w-fit cursor-pointer rounded-[30px] py-3 px-4 flex items-center justify-center gap-2 ${
                      selectedService === s.title
                        ? "bg-[#DDE7F0] shadow-[inset_4px_4px_30px_0px_#A7BCCF,inset_-7px_-7px_30px_0px_#FFFFFF99]"
                        : "bg-white shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF]"
                    }`}
                  >
                    <img
                      src={
                        selectedService === s.title ? s.selected_icon : s.icon
                      }
                      alt={s.title}
                      className={
                        s.title === "DeFi" ? "w-[15px] h-[14px]" : "w-6 h-6"
                      }
                    />
                    <p
                      className={`font-medium leading-[22px] ${
                        selectedService === s.title
                          ? "text-primary"
                          : "text-light-text-color"
                      }`}
                    >
                      {s.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {loading ? (
              <Loader size="xl" />
            ) : (
              <div className="flex items-center justify-start gap-6 flex-wrap">
                {agents.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-[1px] bg-gradient-to-br from-[#D8E2EB] to-[#E2ECF5] rounded-[8px] shadow-[4px_4px_8px_0px_#A7BCCF66,-4px_-4px_8px_0px_#FFFFFF3D]"
                  >
                    <div className="md:min-w-[282px] w-full p-3 bg-[#fafafa] rounded-[8px]">
                      <div className="flex items-center justify-between gap-12">
                        {a.metadata && (
                          <div className="flex items-center justify-start gap-2">
                            <img
                              className="w-14 h-14 rounded-full object-cover"
                              alt="img"
                              src={
                                a.metadata.imageUri.startsWith("https://")
                                  ? a.metadata.imageUri
                                  : `https://${a.metadata.imageUri}`
                              }
                            />
                            <div>
                              <p className="font-bold text-[14px] leading-[19px] text-text-color">
                                {a.metadata.name}
                              </p>
                              <p className="font-bold text-[14px] leading-[19px] text-light-text-color">
                                {a.owner.slice(0, 4)}...
                                {a.owner.slice(-4)}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="p-2 rounded-[200px] bg-[#8F95B229] flex items-center gap-1">
                          <img
                            src="/assets/star-icon.svg"
                            alt="star"
                            className="w-3 h-3"
                          />
                          <p className="font-bold text-[14px] leading-[19px] text-light-text-color">
                            {a.reputation}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 pb-4">
                        <hr
                          className="my-2 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/agent-list-card-dollar-icon.svg"
                            alt="dollar"
                            className="w-4 h-4"
                          />
                          {a?.proposals?.length ? (
                            <p className="font-bold text-[14px] leading-[19px] text-primary">
                              {formatEther(a.proposals[0].price)} WETH per task
                            </p>
                          ) : null}
                        </div>
                        <hr
                          className="my-2 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/agent-list-card-wrench-icon.svg"
                            alt="wrench"
                            className="w-4 h-4"
                          />
                          <p className="font-normal text-[14px] leading-[19px] text-text-color">
                            {a.tasks.length} tasks
                          </p>
                        </div>
                        <hr
                          className="my-2 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/agent-list-card-pulse-icon.svg"
                            alt="pulse"
                            className="w-4 h-4"
                          />
                          {a?.proposals?.length ? (
                            <p className="font-normal text-[14px] leading-[19px] text-text-color">
                              {a.proposals[0].service}
                            </p>
                          ) : null}
                        </div>
                        <hr
                          className="my-2 border-[0.5px] border-[#8F95B2] w-[70%]"
                          style={{
                            borderImageSource:
                              "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
                            borderImageSlice: "1",
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/agent-list-card-social-icon.svg"
                            alt="social"
                            className="w-4 h-4"
                          />
                          {a?.metadata?.twitter ? (
                            <Link
                              href={a.metadata.twitter}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/agent-list-card-x-icon.svg"
                                alt="x"
                                className="w-5 h-5"
                              />
                            </Link>
                          ) : null}
                          {a?.metadata?.telegram ? (
                            <Link
                              href={a.metadata.telegram}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/agent-list-card-tg-icon.svg"
                                alt="tg"
                                className="w-5 h-5"
                              />
                            </Link>
                          ) : null}
                          {a?.metadata?.github ? (
                            <Link
                              href={a.metadata.github}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                src="/assets/agent-list-card-gh-icon.svg"
                                alt="gh"
                                className="w-5 h-5"
                              />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <button
                        className="w-full border border-primary rounded-[50px] py-2 flex items-center justify-center gap-2"
                        onClick={() =>
                          push(
                            `/task-center?service=${a.proposals[0].service}&proposal=${a.proposals[0].id}`
                          )
                        }
                      >
                        <img
                          src="/assets/bolt-primary-icon.svg"
                          alt="bolt"
                          className="w-4 h-4"
                        />
                        <p className="font-bold text-primary leading-[20px]">
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
    </>
  );
}

const HeaderComponent = () => (
  <div className="top-buttons-container w-full flex justify-center md:justify-end items-center gap-4">
    <a
      href="https://github.com/ensemble-codes/ensemble-framework"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="flex items-center justify-center rounded-[50px] py-2 px-4 bg-white shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] gap-2">
        <img src="/assets/github-icon.svg" alt="github" className="w-5 h-5" />
        <span className="hidden md:block text-[16px] font-[500] leading-[24px]">
          Github
        </span>
      </button>
    </a>
    <a
      href="https://www.npmjs.com/package/@ensemble-ai/sdk"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="flex items-center justify-center rounded-[50px] py-2 px-4 bg-white shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] gap-2">
        <img src="/assets/doc-2-icon.svg" alt="docs" />
        <span className="hidden md:block text-[16px] font-[500] leading-[24px]">
          Docs
        </span>
      </button>
    </a>
    <a
      href="https://t.me/+V2yQK15ZYLw3YWU0"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="flex items-center justify-center rounded-[50px] py-2 px-4 bg-white shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD] gap-2">
        <img src="/assets/telegram-icon.svg" alt="telegram" />
        <span className="hidden md:block text-[16px] font-[500] leading-[24px]">
          Join the community
        </span>
      </button>
    </a>
  </div>
);
