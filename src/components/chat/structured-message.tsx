import { convertRatingToStars } from "@/utils";
import Link from "next/link";
import { FC, useState, useEffect } from "react";

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
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [visibleAgents, setVisibleAgents] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Type out the message first
    if (content.message) {
      setIsTyping(true);
      setDisplayedMessage('');
      
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < content.message.length) {
          setDisplayedMessage(content.message.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
          
          // Start revealing agents after message is complete
          setTimeout(() => {
            content.agents.forEach((_, idx) => {
              setTimeout(() => {
                setVisibleAgents(prev => [...prev, idx]);
              }, idx * 200); // 200ms delay between each agent
            });
          }, 500); // Wait 500ms after message completes
        }
      }, 30);

      return () => clearInterval(typeInterval);
    } else {
      // If no message, start revealing agents immediately
      content.agents.forEach((_, idx) => {
        setTimeout(() => {
          setVisibleAgents(prev => [...prev, idx]);
        }, idx * 200);
      });
    }
  }, [content]);

  return (
    <div className="max-w-[70%] z-[2]">
      {content.message ? (
        <div className="mb-4">
          <p className="text-[#121212] font-medium">
            {displayedMessage}
            {isTyping && (
              <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-1"></span>
            )}
          </p>
        </div>
      ) : null}
      <div className="flex items-center gap-4 flex-wrap">
        {content.agents.map((agent, index) => (
          <div
            key={agent.id}
            className={`transition-all duration-500 ease-out ${
              visibleAgents.includes(index)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <Link href={`/agents/${agent.id}`}>
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
                {agent.description ? (
                  <p className="text-[12px] text-[#121212] line-clamp-4">
                    {agent.description}
                  </p>
                ) : null}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
