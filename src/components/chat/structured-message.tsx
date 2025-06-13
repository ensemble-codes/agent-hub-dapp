import { convertRatingToStars } from "@/utils";
import Link from "next/link";
import { FC } from "react";

interface Agent {
  id: string;
  name: string;
  reputation: number;
  imageUri: string;
  description: string;
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
    <div className="max-w-[70%] z-[2]">
      {content.message ? (
        <p className="text-[#121212] font-medium mb-4">{content.message}</p>
      ) : null}
      <div className="flex items-center gap-4 flex-wrap">
        {content.agents.map((agent) => (
          <Link key={agent.id} href={`/agent/${agent.id}`}>
            <div className="p-3 w-[320px] border border-[#8F95B2] rounded-lg z-[2]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={
                      agent.imageUri.startsWith("https://")
                        ? agent.imageUri
                        : `https://${agent.imageUri}`
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
                </div>
                <div className="py-1 px-3 rounded-full flex items-center gap-2 bg-primary/10">
                  <img
                    src="/assets/star-icon.svg"
                    alt="rating"
                    className="w-4 h-4"
                  />
                  <span className="text-[#8F95B2] text-[14px] font-semibold">
                    {convertRatingToStars(agent.reputation)}
                  </span>
                </div>
              </div>
              {agent.description ? <p className="text-[12px] text-[#121212] line-clamp-4">{agent.description}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
