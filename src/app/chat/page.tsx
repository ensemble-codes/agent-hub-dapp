"use client";

import XMTPChat from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense } from "react";

const PageContent: FC = () => {
  return true ? <WebsocketChat agentAddress="0x1234567890abcdef" /> : <XMTPChat />
}

const Page: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
