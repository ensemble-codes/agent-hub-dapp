"use client";

import { FC, useCallback, useEffect, useState } from "react";

import { ChatLayout } from "./chat-layout";
import { getEntityId, randomUUID, WorldManager } from "@/lib/world-manager";
import SocketIOManager from "@/lib/socket-io-manager";
import { Content } from "@elizaos/core";
import { CHAT_SOURCE, USER_NAME } from "@/constants";

export const WebsocketChat: FC<{ agentAddress: string }> = ({
  agentAddress,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);

  const entityId = getEntityId();
  // FIXME: Store agentId in constant, Address -> AgentId mapping
  const agentId = "c44c5b36-0fb1-0769-b0c1-fa0965cf61fb";
  const roomId = WorldManager.generateRoomId(agentId);

  const socketIOManager = SocketIOManager.getInstance();

  useEffect(() => {
    socketIOManager.initialize(entityId, [agentId]);

    socketIOManager.joinRoom(roomId);

    console.log("joined room", roomId);

    const handleMessageBroadcasting = (data: Content) => {
      console.log("message received", data, agentAddress);

      if (!data) {
        console.warn("No data received", data);
        return;
      }

      if (data.roomId !== roomId) {
        console.warn("Message received from a different room", data);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isReceived:
            (data.senderId as string)?.toLowerCase() ===
            agentId.toLowerCase(),
            content: data.text
        },
      ]);
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

  return (
    <ChatLayout
      messages={messages}
      handleSend={handleSend}
      setInput={setInput}
      input={input}
      messageProcessing={messageProcessing}
    />
  );
};
