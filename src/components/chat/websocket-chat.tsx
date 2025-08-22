"use client";

import { FC, useCallback, useEffect, useState } from "react";

import ChatLayout from "./chat-layout";
import { getEntityId, WorldManager } from "@/lib/world-manager";
import SocketIOManagerV0 from "@/lib/eliza/socket-io-manager-v0";
import SocketIOManagerV1 from "@/lib/eliza/socket-io-manager-v1";
import { Content } from "@elizaos/core";
import { CHAT_SOURCE } from "@/constants";
import { usePrivy } from "@privy-io/react-auth";

export const WebsocketChat: FC<{
  agentId: `${string}-${string}-${string}-${string}-${string}`;
  communicationURL: string;
  elizaV1?: boolean;
  agentAddress?: string;
}> = ({ agentId, communicationURL, elizaV1, agentAddress }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { authenticated, login } = usePrivy();
  const entityId = getEntityId();

  const extractChannelId = (data: Content) => {
    return data.channelId || data.roomId;
  };

  // Function to create channel for Eliza v1
  const createChannelForElizaV1 = async (agentId: string, userId: string): Promise<string> => {
    try {
      const apiUrl = communicationURL.replace(/\/$/, ''); // Remove trailing slash if present
      const response = await fetch(`${apiUrl}/api/messaging/central-channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'direct-message',
          type: 'dm',
          server_id: '00000000-0000-0000-0000-000000000000',
          metadata: {
            isDm: true,
            user1: userId,
            user2: agentId,
            forAgent: agentId
          },
          participantCentralUserIds: [
            userId,
            agentId
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.statusText}`);
      }

      const data = await response.json();
      return data?.data?.id || data.channelId;
    } catch (error) {
      console.error('Error creating channel for Eliza v1:', error);
      // Fallback to generated room ID if API fails
      return WorldManager.generateRoomId(agentId as `${string}-${string}-${string}-${string}-${string}`);
    }
  };

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

  const socketIOManager = elizaV1 ? SocketIOManagerV1.getInstance() : SocketIOManagerV0.getInstance();

  // Initialize room ID
  useEffect(() => {
    const initializeRoom = async () => {
      let channelId: string;
      
      if (elizaV1) {
        // For Eliza v1, create channel via API
        channelId = await createChannelForElizaV1(agentId, entityId);
      } else {
        // For Eliza v0, use generated room ID
        channelId = WorldManager.generateRoomId(agentId);
      }
      console.log("channelId", channelId);
      setRoomId(channelId);
      setIsInitializing(false);
    };

    initializeRoom();
  }, [agentId, entityId, elizaV1]);

  useEffect(() => {
    if (!roomId) return;

    socketIOManager.initialize(
      entityId,
      communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId]
    );

    socketIOManager.joinRoom(roomId);

    console.log("joined room", roomId);

    // Load messages from sessionStorage if available
    if (agentAddress) {
      const storedKey = `orchestrator_messages_${roomId}`;
      const storedMessages = sessionStorage.getItem(storedKey);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        const formattedStoredMessages = parsedMessages.map((msg: any) => ({
          id: `stored-${msg.timestamp}`,
          content: msg.content,
          contentType: "string" as const,
          isReceived: false,
          timestamp: msg.timestamp,
          status: msg.status || 'sending'
        }));
        setMessages(formattedStoredMessages);
        // Set messageProcessing to true if there are pending messages
        const hasPendingMessages = formattedStoredMessages.some((msg: any) => msg.status === 'sending');
        if (hasPendingMessages) {
          setMessageProcessing(true);
        }
        sessionStorage.removeItem(storedKey);
      }
    }

    const handleMessageBroadcasting = (data: any) => {
      console.log("message received", data, agentId);

      if (!data) {
        console.warn("No data received", data);
        return;
      }

      const contentData = data as Content;
      if (extractChannelId(contentData) !== roomId) {
        console.warn("Message received from a different room", data);
        return;
      }

      const formattedMessage = formatMessage(contentData);
      if (formattedMessage) {
        setMessages((prev) => [...prev, formattedMessage]);
      }
    };

    const handleMessageComplete = (data: any) => {
      const contentData = data as Content;
      if (extractChannelId(contentData) === roomId) {
        setMessageProcessing(false);
        // Update status of pending messages to 'sent'
        setMessages(prev => prev.map(msg => 
          msg.status === 'sending' ? { ...msg, status: 'sent' } : msg
        ));
      }
    };

    // Use the on method which both managers support
    socketIOManager.on('messageBroadcast', handleMessageBroadcasting);
    socketIOManager.on('messageComplete', handleMessageComplete);

    return () => {
      socketIOManager.leaveRoom(roomId);
      // Use the off method to detach handlers
      socketIOManager.off('messageBroadcast', handleMessageBroadcasting);
      socketIOManager.off('messageComplete', handleMessageComplete);
    };
  }, [roomId, agentId, entityId, socketIOManager]);

  const handleSend = useCallback(() => {
    if (!input || messageProcessing || !roomId) return;

    socketIOManager.sendMessage(input, roomId, CHAT_SOURCE);

    setMessageProcessing(true);
    setInput("");
  }, [roomId, entityId, input, socketIOManager, messageProcessing]);

  const handleTaskSend = useCallback(
    (msg: string) => {
      if (!roomId) return;
      
      socketIOManager.sendMessage(msg, roomId, CHAT_SOURCE);

      setMessageProcessing(true);
    },
    [roomId, socketIOManager]
  );

  return (
    <ChatLayout
      messages={messages}
      handleSend={authenticated ? () => handleSend() : () => login()}
      handleTaskSend={authenticated ? (msg: string) => handleTaskSend(msg) : () => login()}
      setInput={setInput}
      input={input}
      messageProcessing={messageProcessing}
      agentAddress={agentAddress}
      initializing={isInitializing}
      roomId={roomId || ""}
    />
  );
};
