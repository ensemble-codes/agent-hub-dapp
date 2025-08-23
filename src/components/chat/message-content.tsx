import { FC, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  isReceived: boolean;
  isBackToBack?: boolean;
}

export const MessageContent: FC<MessageContentProps> = ({ content, isReceived, isBackToBack = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const hasAnimated = useRef(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (isReceived && !hasAnimated.current && !isBackToBack) {
      // Only animate if this is a new received message and NOT back-to-back
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
    } else if (isReceived && (hasAnimated.current || isBackToBack)) {
      // For past received messages or back-to-back messages, show content immediately
      setDisplayedContent(content);
      setIsTyping(false);
    } else {
      // For user messages, show content immediately
      setDisplayedContent(content);
      setIsTyping(false);
    }
  }, [content, isReceived, isBackToBack]);

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
        {!isTyping && isReceived && (
          <div className="flex items-center gap-2 mt-2">
            {showCopied ? (
              <span className="text-[#8f95b2] text-xs">Copied!</span>
            ) : (
              <img
                src="/assets/copy-icon.svg"
                alt="copy"
                className="w-4 h-4 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                onClick={copyToClipboard}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
