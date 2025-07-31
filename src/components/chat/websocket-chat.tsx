"use client";

import { FC, useCallback, useEffect, useState, useMemo } from "react";

import ChatLayout from "./chat-layout";
import { getEntityId, WorldManager } from "@/lib/world-manager";
import SocketIOManager from "@/lib/socket-io-manager";
import { Content } from "@elizaos/core";
import { CHAT_DATA, CHAT_SOURCE } from "@/constants";

export const WebsocketChat: FC<{
  agent: { id: `${string}-${string}-${string}-${string}-${string}`; metadata: { communicationURL: string } };
}> = ({ agent }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);

  const entityId = getEntityId();
  const agentId = agent.id;
  const roomId = WorldManager.generateRoomId(agentId);

  const formatMessage = useCallback(
    (data: Content): any => {
      if (!data.text) {
        return null;
      }

      // Only try to parse as JSON if it looks like a JSON code block
      if (
        data.text.includes("service_details") ||
        data.text.includes("agent_services") ||
        data.text.includes("agent_list")
      ) {
        try {
          const cleanContent = data.text.replace(/```json\n|\n```/g, "");
          const content = JSON.parse(cleanContent);
          console.log({ content });
          if (
            content.type === "agent_services" ||
            content.type === "service_details" ||
            content.type === "agent_list"
          ) {
            return {
              id: data.id || Date.now().toString(),
              content: content,
              contentType: "json" as const,
              isReceived:
                (data.senderId as string)?.toLowerCase() ===
                agentId.toLowerCase(),
              timestamp: Date.now(),
            };
          }
        } catch (e) {
          console.log(e);
          // Not a JSON message or parsing failed
        }
      }

      // Fallback: treat as plain string message
      return {
        id: data.id || Date.now().toString(),
        content: data.text,
        contentType: "string" as const,
        isReceived:
          (data.senderId as string)?.toLowerCase() === agentId.toLowerCase(),
        timestamp: Date.now(),
      };
    },
    [agentId]
  );

  const socketIOManager = SocketIOManager.getInstance();

  useEffect(() => {
    socketIOManager.initialize(
      entityId,
      agent.metadata?.communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId]
    );

    socketIOManager.joinRoom(roomId);

    console.log("joined room", roomId);

    const handleMessageBroadcasting = (data: Content) => {
      console.log("message received", data, agent.id);

      if (!data) {
        console.warn("No data received", data);
        return;
      }

      if (data.roomId !== roomId) {
        console.warn("Message received from a different room", data);
        return;
      }

      const formattedMessage = formatMessage(data);
      if (formattedMessage) {
        setMessages((prev) => [...prev, formattedMessage]);
      }
    };

    const handleMessageComplete = (data: Content) => {
      if (data.roomId === roomId) {
        setMessageProcessing(false);
      }
    };

    const msgHandler = socketIOManager.evtMessageBroadcast.attach((data) => [
      data as unknown as Content,
    ]);
    const completeHandler = socketIOManager.evtMessageComplete.attach(
      (data) => [data as unknown as Content]
    );

    msgHandler.attach(handleMessageBroadcasting);
    completeHandler.attach(handleMessageComplete);

    return () => {
      socketIOManager.leaveRoom(roomId);
      msgHandler.detach();
      completeHandler.detach();
    };
  }, [roomId, agentId, entityId, messages, socketIOManager]);

  const handleSend = useCallback(() => {
    if (!input || messageProcessing) return;

    socketIOManager.sendMessage(input, roomId, CHAT_SOURCE);

    setMessageProcessing(true);
    setInput("");
  }, [roomId, entityId, input, socketIOManager, messageProcessing]);

  const handleTaskSend = useCallback(
    (msg: string) => {
      socketIOManager.sendMessage(msg, roomId, CHAT_SOURCE);

      setMessageProcessing(true);
    },
    [roomId]
  );

  return (
    <ChatLayout
      messages={messages}
      handleSend={handleSend}
      handleTaskSend={handleTaskSend}
      setInput={setInput}
      input={input}
      messageProcessing={messageProcessing}
    />
  );
};
