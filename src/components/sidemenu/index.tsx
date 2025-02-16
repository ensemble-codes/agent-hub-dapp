"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { getTaskStatusText } from "@/utils";
import { TaskStatus } from "@/enum/taskstatus";
import Loader from "../loader";
import { gql, useQuery } from "@apollo/client";

const SideMenu = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const GET_TASKS = useMemo(
    () => gql`query MyQuery {
  tasks(where: {issuer: "${address?.toLowerCase()}" }) {
    assignee {
      agentUri
      id
      isRegistered
      name
      owner
      reputation
    }
    prompt
    proposalId
    status
    id
  }
}`,
    [address]
  );

  const {
    data: taskDetails,
    loading: loadingTask,
  } = useQuery(GET_TASKS);

  return (
    <div className="sticky top-[124px] flex-shrink-0 w-[180px] flex flex-col items-start gap-5">
      <Link href={"/"} className="w-full">
        <div className="py-4 bg-white shadow-[5px_5px_10px_0px_#FE460066,-5px_-5px_10px_0px_#FAFBFFAD] w-full rounded-[50px] flex items-center justify-center gap-4">
          <img src="/assets/marketplace-icon.svg" alt="marketplace-icon" />
          <span className="text-primary font-medium">THE HUB</span>
        </div>
      </Link>
      <div
        className="p-4 bg-white rounded-[8px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] w-full flex flex-col items-start gap-4 max-h-[300px] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="space-y-2 w-full">
          <p className="text-light-text-color text-[14px] font-[500] leading-[19px]">
            TASKS
          </p>
          {loadingTask ? (
            <div className="flex justify-center py-4">
              <Loader size="sm" />
            </div>
          ) : (
            taskDetails.tasks.map((td: (typeof taskDetails)[0]) => (
              <div key={`${td.id}-${td.prompt}`}>
                <Link href={`/tasks/${td.id}`}>
                  <p className="text-light-text-color font-[500] max-w-[12ch] w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {td.prompt}
                  </p>
                  <p className="text-[12px] text-primary">
                    {getTaskStatusText(Number(td.status) as TaskStatus)}
                  </p>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="p-4 bg-white rounded-[200px] shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF] w-full flex items-start justify-between">
        <img
          src="/assets/light-dark-toggle-icon.svg"
          alt="light-dark"
          className="cursor-not-allowed opacity-[0.5]"
        />
        <Link
          href={"https://t.me/+3AsQlbcpR-NkNGVk"}
          rel="nofollower noopener"
          target="_blank"
        >
          <img
            src="/assets/help-icon.svg"
            alt="help"
            className="cursor-pointer"
          />
        </Link>
        <img
          src="/assets/power-icon.svg"
          alt="power"
          className="cursor-pointer"
          onClick={() => disconnect()}
        />
      </div>
    </div>
  );
};

export default SideMenu;
