import { FC, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import Loader from "@/components/loader";
import { formatEther } from "ethers";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { convertRatingToStars } from "@/utils";

interface SelectAgentStepProps {
  selectedAgent: (agent: number) => void;
}

const SelectAgentStep: FC<SelectAgentStepProps> = ({ selectedAgent }) => {
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service");
  const proposalId = searchParams.get("proposal");

  const GET_PROPOSALS = useMemo(
    () => gql`
      query MyQuery {
        proposals${
          proposalId || selectedService
            ? `(where: { ${
                selectedService
                  ? `service: "${selectedService}"`
                  : ""
              }${
                proposalId
                  ? `${selectedService ? ", " : ""}id: "${proposalId}"`
                  : ""
              } })`
            : ""
        } {
          id
    isRemoved
    issuer {
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
        imageUri
        name
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
      tasks {
        id
        issuer
        prompt
        proposalId
        rating
        result
        status
      }
    }
    price
    service
        }
      }
    `,
    [selectedService, proposalId]
  );
  const { data, loading, error } = useQuery(GET_PROPOSALS);

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
      {data.proposals.map((agent: any) => (
        <AgentCard
          key={agent.issuer.name}
          id={agent.id}
          img={
            agent?.issuer?.metadata?.imageUri.startsWith("https://")
              ? agent?.issuer?.metadata?.imageUri
              : `https://${agent?.issuer?.metadata?.imageUri}` ||
                "/assets/cook-capital-profile.png"
          }
          name={agent.issuer.name}
          jobs={agent.issuer.tasks.length || 0}
          price={Number(formatEther(agent.price))}
          rating={Number(agent.issuer.reputation) || 0}
          telegram={agent.issuer.metadata.telegram || ""}
          twitter={agent.issuer.metadata.twitter || ""}
          github={agent.issuer.metadata.github || ""}
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
  github: string;
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
  github,
  selectedAgent,
}) => {
  const renderStar = (index: number) => {
    const starRating = convertRatingToStars(rating);
    const isFilled = index < Math.floor(starRating);
    const isPartial = !isFilled && index < starRating;
    const partialFill = isPartial ? ((starRating - Math.floor(starRating)) * 100) : 0;

    return (
      <div key={index} className="relative w-5 h-5">
        <img
          src="/assets/empty-star-icon.svg"
          alt="star"
          className="w-5 h-5"
        />
        {isFilled && (
          <img
            src="/assets/star-icon.svg"
            alt="star"
            className="absolute top-0 left-0 w-5 h-5"
          />
        )}
        {isPartial && (
          <div 
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialFill}%` }}
          >
            <img
              src="/assets/star-icon.svg"
              alt="star"
              className="w-5 h-5"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[256px] bg-white rounded-[10px] p-4 shadow-[5px_5px_10px_0px_#D9D9D9,-5px_-5px_10px_0px_#FAFBFF]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover" />
          <p className="text-[14px] leading-[18.9px] font-[500]">{name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-light-text-color text-[14px] leading-[18.9px]">
          Price
        </p>
        <p className="text-[#00D64F] text-[16px] leading-[21.6px] font-[500]">
          {price} ETH per tweet
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
          {[0, 1, 2, 3, 4].map(renderStar)}
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
          {telegram ? (
            <Link href={telegram} target="_blank" rel="noreferrer noopener">
              <img
                src="/assets/agent-list-card-tg-icon.svg"
                alt="telegram"
                className="w-8 h-8 cursor-pointer"
              />
            </Link>
          ) : null}
          {twitter ? (
            <Link href={twitter} target="_blank" rel="noreferrer noopener">
              <img
                src="/assets/agent-list-card-x-icon.svg"
                alt="twitter"
                className="w-8 h-8 cursor-pointer"
              />
            </Link>
          ) : null}
          {github ? (
            <Link href={github} target="_blank" rel="noreferrer noopener">
              <img
                src="/assets/agent-list-card-gh-icon.svg"
                alt="github"
                className="w-8 h-8 cursor-pointer"
              />
            </Link>
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
