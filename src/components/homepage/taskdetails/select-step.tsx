import { FC } from "react";
import AGENTSLIST from "@/dummydata/agents.json";

interface SelectAgentStepProps {
  selectedAgent: (agent: number) => void;
}

const SelectAgentStep: FC<SelectAgentStepProps> = ({ selectedAgent }) => {
  return (
    <div className="flex flex-wrap gap-8">
      {AGENTSLIST.map((agent) => (
        <AgentCard
          key={`${agent.id}-${agent.name}`}
          id={agent.id}
          img={agent.img}
          name={agent.name}
          jobs={agent.jobs}
          price={agent.price}
          rating={agent.rating}
          telegram={agent.telegram}
          twitter={agent.twitter}
          selectedAgent={(val) => selectedAgent(val)}
        />
      ))}
    </div>
  );
};

export default SelectAgentStep;

interface AgentCardProps {
  id: number;
  img: string;
  name: string;
  price: number;
  jobs: number;
  rating: number;
  twitter: string;
  telegram: string;
  selectedAgent: (agent: number) => void;
}

const AgentCard: FC<AgentCardProps> = ({
  id,
  img,
  name,
  price,
  jobs,
  rating,
  twitter,
  telegram,
  selectedAgent,
}) => {
  const ratingsArray = new Array(rating);

  return (
    <div className="w-[256px] bg-white rounded-[10px] p-4 shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={img} alt={name} className="w-8 h-8 rounded-full" />
          <p className="text-[14px] leading-[18.9px] font-[500]">{name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-light-text-color text-[14px] leading-[18.9px]">
          Price
        </p>
        <p className="text-[#00D64F] text-[16px] leading-[21.6px] font-[500]">
          ${price} per tweet
        </p>
      </div>

      <hr
        className="my-2 border-[0.5px] border-[#8F95B2]"
        style={{
          borderImageSource:
            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
          borderImageSlice: "1",
        }}
      />

      <div className="flex items-center justify-between">
        <p className="text-light-text-color text-[14px] leading-[18.9px]">
          Jobs done
        </p>
        <p className="text-[16px] leading-[21.6px] font-[700]">{jobs}</p>
      </div>

      <hr
        className="my-2 border-[0.5px] border-[#8F95B2]"
        style={{
          borderImageSource:
            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
          borderImageSlice: "1",
        }}
      />

      <div className="flex items-center justify-between">
        <p className="text-light-text-color text-[14px] leading-[18.9px]">
          Average rating
        </p>
        <div className="flex items-center gap-1">
          {ratingsArray.fill(0).map((star, index) => (
            <img
              key={`${star}-${index}`}
              src="/assets/star-icon.svg"
              alt="star"
              className="w-5 h-5"
            />
          ))}
        </div>
      </div>

      <hr
        className="my-2 border-[0.5px] border-[#8F95B2]"
        style={{
          borderImageSource:
            "linear-gradient(90deg, #8F95B2 0%, rgba(255, 255, 255, 0) 100%)",
          borderImageSlice: "1",
        }}
      />

      <div className="flex items-center justify-between">
        <p className="text-light-text-color text-[14px] leading-[18.9px]">
          Links
        </p>
        <div className="flex items-center gap-1">
          {twitter ? (
            <img
              src="/assets/agent-telegram-icon.svg"
              alt="telegram"
              className="w-8 h-8 cursor-pointer"
            />
          ) : null}
          {telegram ? (
            <img
              src="/assets/agent-twitter-icon.svg"
              alt="twitter"
              className="w-8 h-8 cursor-pointer"
            />
          ) : null}
        </div>
      </div>

      <button
        className="w-full mt-6 space-x-2 flex items-center justify-between rounded-[50px] bg-primary py-[12px] px-[16px] shadow-[5px_5px_10px_0px_#FE46003D,-5px_-5px_10px_0px_#FAFBFFAD]"
        onClick={() => selectedAgent(id)}
      >
        <span className="text-white text-[16px] font-[700] leading-[24px]">
          Assign
        </span>
        <img src="/assets/pixelated-arrow-icon.svg" alt="pixelated-arrow" />
      </button>
    </div>
  );
};
