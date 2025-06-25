"use client";
import { AppHeader, Modal, SideMenu, StarRating } from "@/components";
import { FC, use, useEffect, useState } from "react";
import Loader from "@/components/loader";
import { gql, useQuery } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import { useSdk } from "@/sdk-config";
import { useAccount, useWalletClient } from "wagmi";
import { config } from "@/components/onchainconfig/config";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";

const Page: FC<{ params: Promise<{ id: string }> }> = ({ params }) => {
  const { id } = use(params);
  const { isConnected, address } = useAccount();

  const isTwitterLink = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    return urls.some(
      (url) => url.includes("twitter.com") || url.includes("x.com")
    );
  };

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
      proposals {
        id
        isRemoved
        price
        service
      }
      reputation
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

  const { data: walletClient } = useWalletClient({
    config: config,
  });
  const sdk = useSdk(walletClient);
  const { data: task, loading, startPolling, stopPolling } = useQuery(GET_TASK);
  const [isPolling, setIsPolling] = useState(false);
  const [openAuditMarkdown, setOpenAuditMarkdown] = useState(false);

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

  const rateTask = async (rate: number) => {
    try {
      const res = await sdk?.rateTask(id, rate);
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-start gap-4">
          <SideMenu />
          <div className="grow w-full">
            <AppHeader />
            <div
              className="min-h-[575px] w-full flex flex-col gap-6 rounded-[20px] pt-12 pb-6 px-8 bg-white border-[1px] shadow-[inset_5px_5px_10px_0px_#D9D9D9,inset_-5px_-5px_10px_0px_#E7EBF0]"
              style={{
                borderImageSource:
                  "linear-gradient(91.95deg, rgba(255, 255, 255, 0.4) -4.26%, rgba(255, 255, 255, 0) 107.52%)",
                borderImageSlice: "1",
              }}
            >
              <div
                className="w-full h-full overflow-auto relative"
                style={{ scrollbarWidth: "none" }}
              >
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
                        <p className="font-bold text-primary leading-[21.6px]">
                          {task?.task?.assignee?.proposals[0]?.service}
                        </p>
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

                <div className="flex items-center gap-3 mb-4">
                  {
                    <img
                      src={
                        task?.task?.assignee?.metadata?.imageUri.startsWith(
                          "https://"
                        )
                          ? task?.task?.assignee?.metadata?.imageUri
                          : `https://${task?.task?.assignee?.metadata?.imageUri}`
                      }
                      alt={task?.task?.assignee?.metadata?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  }
                  <p className="text-[18px] leading-[24.3px]">
                    It's my pleasure... let me find the best way to do this!
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img
                      src={
                        !isPolling
                          ? "/assets/check-icon.svg"
                          : "/assets/loader-group-icon.svg"
                      }
                      alt="check-icon"
                      className={`w-[18px] h-[18px] ${
                        isPolling ? "animate-spin-slow" : ""
                      }`}
                    />
                  </div>
                  <p className="text-[14px] leading-[18.9px] text-light-text-color font-medium">
                    Analyzing task
                  </p>
                </div>
                {task?.task?.result ? (
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
                ) : null}
                {task?.task?.result ? (
                  <>
                    {task?.task?.assignee?.proposals[0]?.service ===
                      "Smart Contract Audit" ||
                    task?.task?.assignee?.proposals[0]?.service ===
                      "Pet Symptom Analyzer" ? (
                      <div
                        className="rounded-[8px] border border-primary py-2 px-4 w-fit max-w-[350px] mb-4 cursor-pointer"
                        onClick={() => setOpenAuditMarkdown(true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src="/assets/smart-contract-audit-primary-icon.svg"
                              alt="audit"
                              className="w-6 h-6"
                            />
                            <p className="font-medium leading-[21.6px]">
                              Report Ready
                            </p>
                          </div>
                          <img
                            src="/assets/chevron-right-icon.svg"
                            alt="right"
                            className="w-6 h-6"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[8px] border border-light-text-color py-4 px-3 w-fit mb-4">
                        <div className="flex items-start gap-2">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  task?.task?.assignee?.metadata?.imageUri.startsWith(
                                    "https://"
                                  )
                                    ? task?.task?.assignee?.metadata?.imageUri
                                    : `https://${task?.task?.assignee?.metadata?.imageUri}`
                                }
                                alt={task?.task?.assignee?.metadata?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <p className="font-bold text-primary leading-[21.6px]">
                                {task?.task?.assignee?.metadata?.name}
                              </p>
                            </div>
                            <p className="font-medium leading-[21.6px]">
                              {task?.task?.result &&
                              isTwitterLink(task.task.result) ? (
                                <a
                                  href={
                                    task.task.result.match(
                                      /(https?:\/\/[^\s]+)/
                                    )?.[0]
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline"
                                >
                                  {task?.task?.result}
                                </a>
                              ) : (
                                task?.task?.result
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isConnected &&
                    address?.toLowerCase() ===
                      task?.task?.issuer?.toLowerCase() ? (
                      <>
                        <div className="space-y-3 mb-4">
                          <p className="text-[18px] leading-[24.3px]">
                            Hello, looks like the task is done. Please let me
                            know if you need anything else.
                          </p>
                          <StarRating
                            onClick={rateTask}
                            rating={task?.task?.rating}
                          />
                        </div>
                        <Link
                          href={`https://88phxim41aw.typeform.com/to/scj8k8mu`}
                          target="_blank"
                          rel="noreferrer noopener nofollower"
                        >
                          <div className="rounded-[2000px] border border-light-text-color py-1 px-3 w-fit">
                            <div className="flex items-center justify-start gap-2">
                              <img
                                src="/assets/feedback-icon.svg"
                                alt="feedback"
                                className="w-4 h-4"
                              />
                              <p className="font-medium leading-[21.6px]">
                                Got feedback? We'd love to hear it
                              </p>
                              <img
                                src="/assets/arrow-top-right-icon.svg"
                                alt="go"
                                className="w-4 h-4"
                              />
                            </div>
                          </div>
                        </Link>
                      </>
                    ) : null}
                  </>
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
              {/* <div className="flex items-center gap-2 w-full">
            <div className="p-3 rounded-[8px] border border-light-text-color flex items-center gap-2 w-full">
              <input
                className="flex-grow w-full border-none outline-none p-0 text-[14px] leading-[18.9px] placeholder:text-light-text-color"
                placeholder="ask anything..."
              />
               <img
                src="/assets/microphone-icon.svg"
                alt="microphone"
                className="w-6 h-6"
              />
            </div>
            <div className="bg-primary h-12 w-12 flex items-center justify-center rounded-[8px]">
              <img src="/assets/send-icon.svg" alt="send" className="w-6 h-6" />
            </div>
          </div> */}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={openAuditMarkdown}
        onClose={() => setOpenAuditMarkdown(false)}
      >
        <div
          className="max-h-[80vh] max-w-[80vw] overflow-y-auto p-8 bg-white rounded-lg"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold mb-3">{children}</h3>
                ),
                table: ({ children }) => (
                  <table className="min-w-full border border-gray-300 my-4 block overflow-x-auto">
                    {children}
                  </table>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 bg-gray-50 p-3 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 p-3">{children}</td>
                ),
                code: ({
                  node,
                  className,
                  children,
                  ...props
                }: {
                  node?: any;
                  inline?: boolean;
                  className?: string;
                } & React.HTMLProps<HTMLElement>) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "";

                  if (props.inline) {
                    return (
                      <code
                        className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <SyntaxHighlighter
                      language={lang}
                      style={tomorrow}
                      PreTag="div"
                      className="rounded-lg my-4"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-4">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {task?.task?.result || ""}
            </ReactMarkdown>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Page;
