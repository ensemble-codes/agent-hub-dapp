"use client";

import { FC, useCallback, useEffect, useState } from "react";

import ChatLayout from "./chat-layout";
import { getEntityId, WorldManager } from "@/lib/world-manager";
import SocketIOManagerV0 from "@/lib/eliza/socket-io-manager-v0";
import SocketIOManagerV1 from "@/lib/eliza/socket-io-manager-v1";
import { Content } from "@elizaos/core";
import { CHAT_SOURCE } from "@/constants";
import { usePrivy } from "@privy-io/react-auth";
import { ConversationManager } from "@/lib/conversations/conversation-manager";

export const WebsocketChat: FC<{
  agentId: `${string}-${string}-${string}-${string}-${string}`;
  communicationURL: string;
  elizaV1?: boolean;
  agentAddress?: string;
  namespace?: string;
}> = ({
  agentId,
  communicationURL,
  elizaV1,
  agentAddress,
  namespace = "/",
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { authenticated, login } = usePrivy();
  const entityId = getEntityId();

  console.log('websocket chat', agentId, communicationURL, elizaV1, agentAddress, namespace);

  const extractChannelId = (data: Content) => {
    return data.channelId || data.roomId;
  };

  // Function to create channel for Eliza v1
  const createChannelForElizaV1 = async (
    agentId: string,
    userId: string
  ): Promise<string> => {
    console.log('creating channel for eliza v1', agentId, userId);
    try {
      const apiUrl = communicationURL.replace(/\/$/, ""); // Remove trailing slash if present
      const response = await fetch(`${apiUrl}/api/messaging/central-channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "direct-message",
          type: "dm",
          server_id: "00000000-0000-0000-0000-000000000000",
          metadata: {
            isDm: true,
            user1: userId,
            user2: agentId,
            forAgent: agentId,
          },
          participantCentralUserIds: [userId, agentId],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.statusText}`);
      }

      const data = await response.json();
      return data?.data?.id || data.channelId;
    } catch (error) {
      console.error("Error creating channel for Eliza v1:", error);
      // Fallback to generated room ID if API fails
      return WorldManager.generateRoomId(
        agentId as `${string}-${string}-${string}-${string}-${string}`
      );
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

  const socketIOManager = elizaV1
    ? SocketIOManagerV1.getInstance()
    : SocketIOManagerV0.getInstance();

  // Initialize conversation and room ID
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        setIsInitializing(true);

        // Step 1: Determine room ID
        let channelId: string;
        if (elizaV1) {
          console.log('creating channel for eliza v1', agentId, entityId);
          channelId = await createChannelForElizaV1(agentId, entityId);
        } else {
          channelId = WorldManager.generateRoomId(agentId);
        }
        console.log("channelId", channelId);
        setRoomId(channelId);

        // Step 2: Get or create conversation
        console.log('[WebsocketChat] Initializing conversation...');
        const { conversationId: convId, isNew } = await ConversationManager.getOrCreateConversation(
          entityId,
          agentId,
          {
            agentAddress,
            namespace,
            roomId: channelId,
          }
        );
        setConversationId(convId);
        console.log(`[WebsocketChat] Conversation initialized: ${convId} (new: ${isNew})`);

        setIsInitializing(false);
      } catch (error) {
        console.error('[WebsocketChat] Error initializing conversation:', error);
        setIsInitializing(false);
      }
    };

    initializeConversation();
  }, [agentId, entityId, elizaV1, agentAddress, namespace]);

  useEffect(() => {
    if (!roomId || !conversationId) return;

    console.log('Initializing socket for namespace:', namespace, 'roomId:', roomId, 'conversationId:', conversationId);

    socketIOManager.initialize(
      entityId,
      communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId],
      namespace,
      conversationId
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
          status: msg.status || "sending",
        }));
        setMessages(formattedStoredMessages);
        // Set messageProcessing to true if there are pending messages
        const hasPendingMessages = formattedStoredMessages.some(
          (msg: any) => msg.status === "sending"
        );
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
        setMessages((prev) =>
          prev.map((msg) =>
            msg.status === "sending" ? { ...msg, status: "sent" } : msg
          )
        );
      }
    };

    // Use the on method which both managers support
    socketIOManager.on("messageBroadcast", handleMessageBroadcasting);
    socketIOManager.on("messageComplete", handleMessageComplete);

    return () => {
      console.log('Cleaning up socket for roomId:', roomId, 'namespace:', namespace);
      socketIOManager.leaveRoom(roomId);
      // Use the off method to detach handlers
      socketIOManager.off("messageBroadcast", handleMessageBroadcasting);
      socketIOManager.off("messageComplete", handleMessageComplete);
    };
  }, [roomId, conversationId, agentId, entityId, socketIOManager, namespace]);

  const handleSend = useCallback(() => {
    if (!input || messageProcessing || !roomId || !conversationId) return;

    // V1 manager has different signature (message, channelId, source, attachments, messageId, metadata)
    // V0 manager has signature (message, roomId, source, conversationId)
    if (elizaV1) {
      (socketIOManager as any).sendMessage(input, roomId, CHAT_SOURCE, undefined, undefined, { conversationId });
    } else {
      (socketIOManager as any).sendMessage(input, roomId, CHAT_SOURCE, conversationId);
    }

    setMessageProcessing(true);
    setInput("");
  }, [roomId, conversationId, entityId, input, socketIOManager, messageProcessing, elizaV1]);

  const handleTaskSend = useCallback(
    (msg: string) => {
      if (!roomId || !conversationId) return;

      // V1 manager has different signature
      if (elizaV1) {
        (socketIOManager as any).sendMessage(msg, roomId, CHAT_SOURCE, undefined, undefined, { conversationId });
      } else {
        (socketIOManager as any).sendMessage(msg, roomId, CHAT_SOURCE, conversationId);
      }

      setMessageProcessing(true);
    },
    [roomId, conversationId, socketIOManager, elizaV1]
  );

  return (
    <ChatLayout
      agentId={agentId}
      messages={messages}
      handleSend={authenticated ? () => handleSend() : () => login()}
      handleTaskSend={
        authenticated ? (msg: string) => handleTaskSend(msg) : () => login()
      }
      setInput={setInput}
      input={input}
      messageProcessing={messageProcessing}
      agentAddress={agentAddress}
      initializing={isInitializing}
      roomId={roomId || ""}
    />
  );
};
