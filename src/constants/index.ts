import { UUID } from "@/lib/world-manager";

export const ONII_AGENT_ADDRESS = "0xc1ec8b9ca11ef907b959fed83272266b0e96b58d";
export const ORCHESTRATOR_AGENT_ADDRESS = "0x5c02b4685492d36a40107b6ec48a91ab3f8875cb";
export const UNION_AGENT_ADDRESS = "0x18539799494fd1e91a11c6bf11d9260cb50cb08a";

export const USER_NAME = "USER";

export const CHAT_SOURCE = "client_chat";

export const CHAT_DATA: { [key: string]: { agentId: UUID, communicationURL: string } } = {
  [ORCHESTRATOR_AGENT_ADDRESS]: {
    agentId: "28d29474-23c7-01b9-aee8-ba150c366103",
    communicationURL: "https://agents.ensemble.codes",
  }
};
