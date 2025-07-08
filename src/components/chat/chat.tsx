import { FC } from "react";
import { WebsocketChat } from "./websocket-chat";
import { XmtpChat } from "./xmtp-chat";

export const Chat: FC = () => {
    // FIXME: Get agent from subgraph
    const { agent, loading, error } = { 
        agent: {
            chatType: "websocket",
        }, 
        loading: false, 
        error: null 
    }

    if (!loading) return <div>Loading...</div>
    if (error) return <div>Error loading agent</div>

    // FIXME: Pass agent to chat components
    switch (agent.chatType) {
        case "websocket":
            return <WebsocketChat />
        case "xmtp":
            return <XmtpChat />
        default:
            return <p>Unknown chat type: {agent.chatType}</p>
    }
}
