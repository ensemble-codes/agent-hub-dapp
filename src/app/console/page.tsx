"use client";

import { FC, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { AppHeader, Loader, SideMenu } from "@/components";
import Console from "@/components/chat/console";
import { ORCHESTRATOR_AGENT_ADDRESS, CHAT_DATA, CHAT_SOURCE } from "@/constants";
import { getEntityId, WorldManager } from "@/lib/world-manager";
import SocketIOManager from "@/lib/socket-io-manager";
import { Content } from "@elizaos/core";

const ConsolePageContent: FC = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);
  
  const entityId = getEntityId();
  const agentId = CHAT_DATA[ORCHESTRATOR_AGENT_ADDRESS].agentId;
  const roomId = WorldManager.generateRoomId(agentId);
  
  const GET_ORCHESTRATOR = gql`
    query GetOrchestrator {
      agent(id: "${ORCHESTRATOR_AGENT_ADDRESS}") {
        id
        name
        metadata {
          name
          description
          imageUri
          prompts
          communicationURL
          communicationParams
        }
      }
    }
  `;
  
  const { data, loading } = useQuery(GET_ORCHESTRATOR);
  
  const agent = useMemo(() => {
    if (data?.agent) {
      return data.agent;
    }
    return null;
  }, [data]);
  
  const socketIOManager = SocketIOManager.getInstance();
  
  useEffect(() => {
    const communicationURL = CHAT_DATA[ORCHESTRATOR_AGENT_ADDRESS].communicationURL;
    
    socketIOManager.initialize(
      entityId,
      communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId]
    );
    
    socketIOManager.joinRoom(roomId);
    
    const handleMessageComplete = (data: Content) => {
      if (data.roomId === roomId) {
        setMessageProcessing(false);
        // Redirect to chat page after first message
        router.push("/chat");
      }
    };
    
    const completeHandler = socketIOManager.evtMessageComplete.attach(
      (data) => [data as unknown as Content]
    );
    
    completeHandler.attach(handleMessageComplete);
    
    return () => {
      socketIOManager.leaveRoom(roomId);
      completeHandler.detach();
    };
  }, [roomId, agentId, entityId, router, socketIOManager]);
  
  const handleSend = useCallback(() => {
    if (!input || messageProcessing) return;
    
    socketIOManager.sendMessage(input, roomId, CHAT_SOURCE);
    setMessageProcessing(true);
    setInput("");
  }, [roomId, input, socketIOManager, messageProcessing]);
  
  const handleTaskSend = useCallback(
    (msg: string) => {
      socketIOManager.sendMessage(msg, roomId, CHAT_SOURCE);
      setMessageProcessing(true);
    },
    [roomId, socketIOManager]
  );
  
  if (loading) return <Loader />;
  
  return (
    <div className="flex items-start gap-4">
      <SideMenu />
      <div className="grow w-full">
        <AppHeader />
        <div className="h-[calc(100dvh-80px)] lg:bg-white lg:rounded-[16px] lg:p-4 lg:border-[0.5px] lg:border-[#8F95B2] relative overflow-hidden flex items-center justify-center">
          <Console
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            handleTaskSend={handleTaskSend}
            agent={agent}
            messages={messages}
          />
        </div>
      </div>
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