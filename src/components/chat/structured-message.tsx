import { FC } from "react";

interface Agent {
  address: string;
  name: string;
  rating: number;
  price_range: string;
}

interface AgentListContent {
  message: string;
  agents: Agent[];
}

interface StructuredMessageProps {
  type: string;
  from: string;
  to: string;
  content: {
    data: AgentListContent;
  };
}

export const StructuredMessage: FC<StructuredMessageProps> = ({
  type,
  from,
  to,
  content,
}) => {
    return (
      <div>
        <p className="text-[#121212] font-medium mb-4">
          {content.data.message}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          {content.data.agents.map((agent) => (
            <div
              key={agent.address}
              className="p-3 border border-[#8F95B2] rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {agent.name.charAt(0)}
                  </span>{" "}
                  {/* image area */}
                </div>
                <div>
                  <p className="font-bold text-[#121212] text-[14px]">{agent.name}</p>
                  <p className="font-bold text-[#8F95B2] text-[12px]">
                    0x123...7890
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
                    {agent.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <p className="text-[14px] font-medium text-[#8F95B2]">Bull Post</p> {/* agent service */}
                <img src="/assets/pixelated-arrow-primary-icon.svg" alt="arrow" className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};
