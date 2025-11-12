"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  initialPlatformConversationId?: string;
}> = ({
  agentId,
  communicationURL,
  elizaV1,
  agentAddress,
  namespace = "/",
  initialPlatformConversationId,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [platformConversationId, setPlatformConversationId] = useState<string | null>(initialPlatformConversationId || null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { authenticated, login } = usePrivy();
  const entityId = getEntityId();
  const router = useRouter();
  const pathname = usePathname();

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
    let isCancelled = false;

    const initializeConversation = async () => {
      try {
        setIsInitializing(true);

        // Step 1: Load existing conversation from URL or create new one
        if (initialPlatformConversationId) {
          // Load existing conversation from URL parameter
          console.log('[WebsocketChat] Loading existing conversation from URL:', initialPlatformConversationId);
          try {
            const conversation = await ConversationManager.getConversationByPlatformId(initialPlatformConversationId);

            if (isCancelled) return;

            setConversationId(conversation.id);
            setPlatformConversationId(initialPlatformConversationId);
            console.log(`[WebsocketChat] ✅ Loaded existing conversation: ${conversation.id}`);
            console.log(`[WebsocketChat] ⭐ Platform conversation ID: ${initialPlatformConversationId}`);
          } catch (error) {
            console.warn('[WebsocketChat] Failed to load conversation from URL, creating new one:', error);
            // Fall through to create new conversation
          }
        }

        // Create new conversation if no URL parameter or loading failed
        if (!conversationId && !isCancelled) {
          // Determine channel/room ID for Eliza v1 compatibility
          let channelId: string;
          if (elizaV1) {
            console.log('Creating channel for eliza v1', agentId, entityId);
            channelId = await createChannelForElizaV1(agentId, entityId);
          } else {
            channelId = WorldManager.generateRoomId(agentId);
          }

          if (isCancelled) {
            console.log('[WebsocketChat] Initialization cancelled');
            return;
          }

          console.log('[WebsocketChat] Creating new conversation...');
          const { conversationId: convId, platformConversationId: platConvId } = await ConversationManager.createNewConversation(
            entityId,
            agentId,
            {
              agentAddress,
              namespace,
              roomId: channelId, // Store channel ID in metadata for Eliza v1 compatibility
            }
          );

          // Check again if effect was cancelled
          if (isCancelled) {
            console.log('[WebsocketChat] Initialization cancelled after conversation creation');
            return;
          }

          setConversationId(convId);
          setPlatformConversationId(platConvId);
          console.log(`[WebsocketChat] ✅ Conversation created: ${convId}`);
          console.log(`[WebsocketChat] ⭐ Platform conversation ID: ${platConvId}`);

          // Update URL with the new platform_conversation_id
          const newUrl = `${pathname}?conversation_id=${platConvId}`;
          router.replace(newUrl, { scroll: false });
          console.log(`[WebsocketChat] 🔗 URL updated: ${newUrl}`);
        }

        setIsInitializing(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('[WebsocketChat] Error initializing conversation:', error);
          setIsInitializing(false);
        }
      }
    };

    initializeConversation();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [agentId, entityId, elizaV1, agentAddress, namespace, initialPlatformConversationId, pathname, router]);

  useEffect(() => {
    if (!platformConversationId || !conversationId) return;

    console.log('Initializing socket for namespace:', namespace, 'platformConversationId:', platformConversationId, 'conversationId:', conversationId);

    socketIOManager.initialize(
      entityId,
      communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId],
      namespace,
      conversationId
    );

    // BREAKING CHANGE: Join using platform_conversation_id instead of roomId
    socketIOManager.joinRoom(platformConversationId);

    console.log("Joined conversation with platform_conversation_id:", platformConversationId);

    // Load messages from sessionStorage if available
    if (agentAddress) {
      const storedKey = `orchestrator_messages_${platformConversationId}`;
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
      // Check against platform_conversation_id instead of roomId
      if (extractChannelId(contentData) !== platformConversationId) {
        console.warn("Message received from a different conversation", data);
        return;
      }

      const formattedMessage = formatMessage(contentData);
      if (formattedMessage) {
        setMessages((prev) => [...prev, formattedMessage]);
      }
    };

    const handleMessageComplete = (data: any) => {
      const contentData = data as Content;
      if (extractChannelId(contentData) === platformConversationId) {
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
      console.log('Cleaning up socket for platformConversationId:', platformConversationId, 'namespace:', namespace);
      if (platformConversationId) {
        socketIOManager.leaveRoom(platformConversationId);
      }
      // Use the off method to detach handlers
      socketIOManager.off("messageBroadcast", handleMessageBroadcasting);
      socketIOManager.off("messageComplete", handleMessageComplete);
    };
  }, [platformConversationId, conversationId, agentId, entityId, socketIOManager, namespace]);

  const handleSend = useCallback(() => {
    if (!input || messageProcessing || !platformConversationId || !conversationId) return;

    // V1 manager has different signature (message, channelId, source, attachments, messageId, metadata)
    // V0 manager has signature (message, platform_conversation_id, source, conversationId)
    if (elizaV1) {
      (socketIOManager as any).sendMessage(input, platformConversationId, CHAT_SOURCE, undefined, undefined, { conversationId });
    } else {
      // BREAKING CHANGE: Now using platform_conversation_id
      (socketIOManager as any).sendMessage(input, platformConversationId, CHAT_SOURCE, conversationId);
    }

    setMessageProcessing(true);
    setInput("");
  }, [platformConversationId, conversationId, entityId, input, socketIOManager, messageProcessing, elizaV1]);

  const handleTaskSend = useCallback(
    (msg: string) => {
      if (!platformConversationId || !conversationId) return;

      // V1 manager has different signature
      if (elizaV1) {
        (socketIOManager as any).sendMessage(msg, platformConversationId, CHAT_SOURCE, undefined, undefined, { conversationId });
      } else {
        // BREAKING CHANGE: Now using platform_conversation_id
        (socketIOManager as any).sendMessage(msg, platformConversationId, CHAT_SOURCE, conversationId);
      }

      setMessageProcessing(true);
    },
    [platformConversationId, conversationId, socketIOManager, elizaV1]
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
      roomId={platformConversationId || ""}
    />
  );
};
