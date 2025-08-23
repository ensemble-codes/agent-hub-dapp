"use client";

import { memo, useEffect, useRef } from "react";
import { AgentServicesTable } from "./chat/agent-services-table";
import { ServiceDetailsCard } from "./chat/service-details-card";
import { StructuredMessage } from "./chat/structured-message";
import { MessageContent } from "./chat/message-content";

// Store for local timestamps
const localTimestamps = new Map<string, number>();

// Function to generate a unique key for each message
const getMessageKey = (message: any, index: number) => {
  return `${message.id || message.cretedAt || index}_${index}`;
};

// Function to clear timestamps when navigating away
export const clearLocalTimestamps = () => {
  localTimestamps.clear();
};

// Hook to clear timestamps on navigation
export const useClearTimestampsOnNavigation = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearLocalTimestamps();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearLocalTimestamps();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearLocalTimestamps();
    };
  }, []);
};

// Memoized message component for better performance
const MemoizedMessage = memo(
    ({
      message,
      index,
      messages,
      onSendMessage,
      agentAddress,
      account,
    }: any) => {
      const messageKey = useRef(getMessageKey(message, index));
      
      // Add local timestamp when component mounts
      useEffect(() => {
        if (!localTimestamps.has(messageKey.current)) {
          localTimestamps.set(messageKey.current, Date.now());
        }
      }, [messageKey.current]);

      const isPreviousFromSameSender =
        index > 0 && messages[index - 1].isReceived === message.isReceived;
      
      // Check if this is a back-to-back message from the agent
      const isBackToBack = 
        message.isReceived && 
        index > 0 && 
        messages[index - 1].isReceived === true &&
        messages[index - 1].isReceived === message.isReceived;

      // Get the local timestamp for this message
      const localTimestamp = localTimestamps.get(messageKey.current);

      return (
        <div className="flex flex-col">
          {localTimestamp && (
            <div className={`flex ${!message.isReceived ? "justify-end" : "justify-start"} mb-1`}>
              <span className="text-xs text-[#8F95B2]">
                {new Date(localTimestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
          <div
            className={`flex ${
              !message.isReceived ? "justify-end" : "justify-start"
            } ${isPreviousFromSameSender ? "mb-1" : "mb-4"}`}
          >
          {message.isReceived ? (
            message.contentType === "json" &&
            message.content.type === "agent_services" ? (
              <AgentServicesTable
                services={message.content?.data?.services}
                onCreateTask={(service) =>{
                  onSendMessage(`I want to enable ${service.name} service`)
                }}
              />
            ) : message.contentType === "json" &&
              message.content.type === "service_details" ? (
              <ServiceDetailsCard
                service={message.content.data.service}
                agentAddress={agentAddress || ""}
                userAddress={account.address!}
                onCreateTask={(jsonString) => onSendMessage(jsonString)}
              />
            ) : message.contentType === "json" &&
              message.content.type === "agent_list" ? (
              <StructuredMessage content={message.content.content} />
            ) : (
              <MessageContent
                content={message.content}
                isReceived={message.isReceived}
                isBackToBack={isBackToBack}
              />
            )
          ) : (
            <MessageContent
              content={message.content}
              isReceived={message.isReceived}
              isBackToBack={isBackToBack}
            />
          )}
          </div>
        </div>
      );
    }
  );

  MemoizedMessage.displayName = "MemoizedMessage";

  export default MemoizedMessage;