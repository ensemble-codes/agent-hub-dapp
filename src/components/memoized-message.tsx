"use client";

import { memo } from "react";
import { AgentServicesTable } from "./chat/agent-services-table";
import { ServiceDetailsCard } from "./chat/service-details-card";
import { StructuredMessage } from "./chat/structured-message";
import { MessageContent } from "./chat/message-content";

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
      const isPreviousFromSameSender =
        index > 0 && messages[index - 1].isReceived === message.isReceived;

      return (
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
              />
            )
          ) : (
            <MessageContent
              content={message.content}
              isReceived={message.isReceived}
            />
          )}
        </div>
      );
    }
  );

  MemoizedMessage.displayName = "MemoizedMessage";

  export default MemoizedMessage;