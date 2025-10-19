"use client";

import { FC, Suspense, useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components";
import Console from "@/components/chat/console";
import { ORCHESTRATOR_AGENT_ADDRESS, CHAT_SOURCE } from "@/constants";
import { getEntityId, WorldManager } from "@/lib/world-manager";
import SocketIOManager from "@/lib/eliza/socket-io-manager-v0";
import { useAgent } from "@/hooks/useAgent";

const ConsolePageContent: FC = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages] = useState<any[]>([]);
  const [messageProcessing] = useState(false);
  
  const entityId = getEntityId();
  const { agent, loading } = useAgent(ORCHESTRATOR_AGENT_ADDRESS);
  
  // Parse agentId from communicationParams
  const agentId = useMemo(() => {
    if (!agent?.metadata?.communicationParams) return null;
    try {
      const params = JSON.parse(agent.metadata.communicationParams);
      return params.agentId;
    } catch (e) {
      console.error("Failed to parse communicationParams:", e);
      return null;
    }
  }, [agent]);
  
  const roomId = useMemo(() => {
    if (!agentId) return null;
    return WorldManager.generateRoomId(agentId);
  }, [agentId]);
  
  const socketIOManager = SocketIOManager.getInstance();
  
  useEffect(() => {
    if (!agentId || !roomId || !agent) return;
    
    const communicationURL = agent.metadata?.communicationURL;
    
    socketIOManager.initialize(
      entityId,
      communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId]
    );
    
    socketIOManager.joinRoom(roomId);
    
    return () => {
      socketIOManager.leaveRoom(roomId);
    };
  }, [roomId, agentId, entityId, socketIOManager, agent]);
  
  const handleSend = useCallback(() => {
    console.log("handleSend", input, messageProcessing, roomId);
    if (!input || messageProcessing || !roomId) return;
    
    // Store message with sending status in sessionStorage
    const newMessage = {
      content: input,
      user: 'user',
      timestamp: Date.now(),
      status: 'sending'
    };
    
    const storedKey = `orchestrator_messages_${roomId}`;
    const existingMessages = sessionStorage.getItem(storedKey);
    const messages = existingMessages ? JSON.parse(existingMessages) : [];
    messages.push(newMessage);
    sessionStorage.setItem(storedKey, JSON.stringify(messages));
    
    // Send message
    socketIOManager.sendMessage(input, roomId, CHAT_SOURCE);
    
    // Redirect immediately to chat page
    router.push(`/agents/${ORCHESTRATOR_AGENT_ADDRESS}/chat`);
  }, [roomId, input, socketIOManager, messageProcessing, router]);
  
  const handleTaskSend = useCallback(
    (msg: string) => {
      if (!roomId) return;
      
      // Store message with sending status in sessionStorage
      const newMessage = {
        content: msg,
        user: 'user',
        timestamp: Date.now(),
        status: 'sending'
      };
      
      const storedKey = `orchestrator_messages_${roomId}`;
      const existingMessages = sessionStorage.getItem(storedKey);
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push(newMessage);
      sessionStorage.setItem(storedKey, JSON.stringify(messages));
      
      // Send message
      socketIOManager.sendMessage(msg, roomId, CHAT_SOURCE);
      
      // Redirect immediately to chat page
      router.push(`/agents/${ORCHESTRATOR_AGENT_ADDRESS}/chat`);
    },
    [roomId, socketIOManager, router]
  );

  
  return (
    <div className="h-[calc(100dvh-200px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden flex items-center justify-center">
          <Console
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            handleTaskSend={handleTaskSend}
            agent={agent}
            messages={messages}
            loading={loading}
          />
        </div>
      );
};

const ConsolePage: FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ConsolePageContent />
    </Suspense>
  );
};

export default ConsolePage;