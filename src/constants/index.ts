import { UUID } from "@/lib/world-manager";

const ONII_AGENT_ADDRESS = '0xc1ec8b9ca11ef907b959fed83272266b0e96b58d'

export const USER_NAME = "USER";

export const CHAT_SOURCE = 'client_chat';

export const CHAT_DATA: { [key: string]: { agentId: UUID } } = {
    [ONII_AGENT_ADDRESS]: {
        agentId: 'c44c5b36-0fb1-0769-b0c1-fa0965cf61fb',
    }
}
