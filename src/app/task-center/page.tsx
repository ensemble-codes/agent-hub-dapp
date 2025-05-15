"use client";
import { AppHeader, SideMenu, TaskDetails } from "@/components";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FC, Suspense, useMemo } from "react";
import { useAccount } from "wagmi";
import TaskCard from "@/components/TaskCard";
import { formatEther } from "ethers";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

// tasks${address ? `(where: {issuer: "${address?.toLowerCase()}" })` : ""}

const PageContent: FC = () => {
  const { address } = useAccount();

  const GET_TASKS = useMemo(
    () => gql`
      query MyQuery {
        tasks {
          id
          issuer
          prompt
          proposalId
          rating
          result
          status
          taskId
          assignee {
            agentUri
            id
            name
            owner
            reputation
            metadata {
              description
              dexscreener
              github
              id
              name
              imageUri
              telegram
              twitter
              website
            }
            proposals {
              id
              isRemoved
              price
              service
            }
          }
        }
      }
    `,
    [address]
  );

  const { data, loading: loadingTask } = useQuery(GET_TASKS);

  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");

  console.log(data?.tasks
    ?.slice()
    .sort((a: any, b: any) => (b.taskId || 0) - (a.taskId || 0)));

  return (
    <>
      <div>
        <AppHeader />
        <div className="flex items-start gap-4 pt-8">
          <SideMenu />
          {!selectedService ? (
            <div className="grow w-full bg-white rounded-[16px] p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="font-semibold text-[24px] text-primary leading-[100%]">
                    TASK CENTER
                  </p>
                  <p className="font-normal text-[18px] text-[#121212] leading-[100%]">
                    A record of all your tasks
                  </p>
                </div>
                <Link href={"/service-center"}>
                  <button className="border border-[#121212] py-2 px-3 rounded-[20000px] text-[#121212] font-medium text-[16px] leading-[100%] flex items-center gap-2">
                    Create Task
                    <img
                      src="/assets/create-task-icon.svg"
                      alt="create"
                      className="w-4 h-4"
                    />
                  </button>
                </Link>
              </div>
              <hr
                className="my-6 border-[0.5px] border-[#8F95B2]"
                style={{
                  borderImageSource:
                    "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 60%)",
                  borderImageSlice: "1",
                }}
              />
              {/* do it here */}
              {loadingTask ? (
                <div className="flex justify-center items-center py-12">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {data?.tasks
                    ?.slice()
                    .sort((a: any, b: any) => (b.taskId || 0) - (a.taskId || 0))
                    .map((task: any) => (
                      <TaskCard
                        key={task.id}
                        id={task.id}
                        assignee={task.assignee || {
                          name: "Unknown",
                          id: "0x0000...0000",
                          metadata: { imageUri: "/assets/cook-capital-profile.png" },
                        }}
                        title={task.prompt || "Untitled"}
                        skill={task?.assignee?.proposals[0]?.service || "-"}
                        status={task?.status}
                        rate={task?.assignee ? `${formatEther(task?.assignee?.proposals[0]?.price)} ETH` : "0 ETH"}
                        rating={task?.assignee?.reputation}
                      />
                    ))}
                </div>
              )}
            </div>
          ) : (
            <TaskDetails selectedService={selectedService} />
          )}
        </div>
      </div>
    </>
  );
};
