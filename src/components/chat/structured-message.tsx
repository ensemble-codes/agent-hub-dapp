import Link from "next/link";
import { FC } from "react";

interface Agent {
  id: string;
  name: string;
  reputation: number;
  agentUri: string;
}

interface AgentListContent {
  message: string;
  agents: Agent[];
}

interface StructuredMessageProps {
  content: AgentListContent;
}

export const StructuredMessage: FC<StructuredMessageProps> = ({ content }) => {
  return (
    <div>
      {content.message ? (
        <p className="text-[#121212] font-medium mb-4">{content.message}</p>
      ) : null}
      <div className="flex items-center gap-4 flex-wrap">
        {content.agents.map((agent) => (
          <Link key={agent.id} href={`/agent/${agent.id}`}>
            <div className="p-3 border border-[#8F95B2] rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 rounded-full"
                  src={
                    agent.agentUri.startsWith("https://")
                      ? agent.agentUri
                      : `https://${agent.agentUri}`
                  }
                />
                <div>
                  <p className="font-bold text-[#121212] text-[14px]">
                    {agent.name}
                  </p>
                  <p className="font-normal text-[#8F95B2] text-[14px]">
                    {agent.id.slice(0, 4)}...{agent.id.slice(-4)}
                  </p>
                  {/* agent id */}
                </div>
                <div className="py-1 px-3 rounded-full flex items-center gap-2 bg-primary/10">
                  <img
                    src="/assets/star-icon.svg"
                    alt="rating"
                    className="w-4 h-4"
                  />
                  <span className="text-[#8F95B2] text-[14px] font-semibold">
                    {agent.reputation}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
