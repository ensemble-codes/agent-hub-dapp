import { FC } from "react";
import { gql, useQuery } from "@apollo/client";
import Loader from "@/components/loader";
import { formatEther } from "ethers";
import { useSearchParams } from "next/navigation";

interface SelectAgentStepProps {
  selectedAgent: (agent: number) => void;
}

const SelectAgentStep: FC<SelectAgentStepProps> = ({ selectedAgent }) => {
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");

  const GET_PROPOSALS = gql`
    query MyQuery {
      proposals(where: { service: "${selectedService?.split(' ').join('-')}" }) {
        id
        service
        price
        issuer {
          agentUri
          id
          isRegistered
          name
          owner
          reputation
        }
      }
    }
  `;

  const { data, loading, error } = useQuery(GET_PROPOSALS);

  console.log(data);

  return loading ? (
    <>
      <div className="flex items-center justify-center">
        <Loader size="lg" />
      </div>
    </>
  ) : error ? (
    <></>
  ) : (
    <div className="flex flex-wrap gap-8">
      {data.proposals
        .filter((da: any) => da.service === "Bull-Post")
        .map((agent: any) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            img={agent.issuer.uri || "/assets/cook-capital-profile.png"}
            name={agent.issuer.name}
            jobs={agent.issuer.jobs || 0}
            price={Number(formatEther(agent.price))}
            rating={Number(agent.issuer.reputation) || 0}
            telegram={agent.telegram || ""}
            twitter={agent.twitter || ""}
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
          {price} WETH per tweet
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
