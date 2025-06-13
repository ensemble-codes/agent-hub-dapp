import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  isReceived: boolean;
}

export const MessageContent: FC<MessageContentProps> = ({ content, isReceived }) => {
  return (
    <div className={`max-w-[70%] text-[#121212] rounded-[2000px] z-[2] ${
      !isReceived ? 'py-[2px] px-3 bg-primary/15' : ''
    }`}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
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
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
