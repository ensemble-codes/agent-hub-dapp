import { FC, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  isReceived: boolean;
}

export const MessageContent: FC<MessageContentProps> = ({ content, isReceived }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isReceived && !hasAnimated.current) {
      // Only animate if this is a new received message
      setIsTyping(true);
      setDisplayedContent('');
      
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          hasAnimated.current = true;
          clearInterval(typeInterval);
        }
      }, 30); // Adjust speed here (lower = faster)

      return () => clearInterval(typeInterval);
    } else if (isReceived && hasAnimated.current) {
      // For past received messages, show content immediately
      setDisplayedContent(content);
      setIsTyping(false);
    } else {
      // For user messages, show content immediately
      setDisplayedContent(content);
      setIsTyping(false);
    }
  }, [content, isReceived]);

  return (
    <div className={`max-w-[70%] text-[#121212] rounded-[2000px] z-[2] ${
      !isReceived ? 'py-[2px] px-3 bg-primary/15' : ''
    }`}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => <span {...props} />,
            a: ({ node, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              />
            ),
          }}
        >
          {displayedContent}
        </ReactMarkdown>
        {isTyping && (
          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-1"></span>
        )}
      </div>
    </div>
  );
};
