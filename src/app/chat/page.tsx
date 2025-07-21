"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo } from "react";
import { useAgentQuery } from "@/graphql/generated/ensemble";
import { useSearchParams } from "next/navigation";
import { ensembleClient } from "@/graphql/clients";
import { Loader } from "@/components";
import { CHAT_DATA, ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");

  const { data, loading, error } = useAgentQuery({
    variables: {
      id: agentAddress || ORCHESTRATOR_AGENT_ADDRESS,
    },
    client: ensembleClient,
  });

  const agent = useMemo(() => {
    if (data?.agent) {
      return data.agent;
    }

    return null;
  }, [data]);

  const communicationType = useMemo(
    () => agent?.metadata?.communicationType ?? "",
    [data]
  );
  const chatData = useMemo(
    () => agentAddress && CHAT_DATA[agentAddress],
    [agentAddress]
  );

  if (loading) return <Loader />;

  if (!agentAddress) {
    // Always use WebsocketChat for orchestrator
    return (
      <WebsocketChat
        agent={{
          id: ORCHESTRATOR_AGENT_ADDRESS,
          metadata: { communicationURL: agent?.metadata?.communicationURL ?? "" },
        }}
      />
    );
  }

  if (chatData && (agentAddress)) {
    return (
      <WebsocketChat
        agent={{
          id: agentAddress,
          metadata: { communicationURL: chatData.communicationURL },
        }}
      />
    );
  } else {
    switch (communicationType) {
      case "websocket":
        return (
          <WebsocketChat
            agent={{
              id: agent?.id ?? "",
              metadata: {
                communicationURL: agent?.metadata?.communicationURL ?? "",
              },
            }}
          />
        );
      case "xmtp":
        return (
          <XmtpChat
            agent={{
              id: agent?.id ?? "",
              metadata: {
                imageUri: agent?.metadata?.imageUri ?? "",
                name: agent?.name ?? "",
              },
            }}
          />
        );
      default:
        return <p>Unknown chat type: {communicationType}</p>;
    }
  }
};

const Page: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
