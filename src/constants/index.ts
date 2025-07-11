import { UUID } from "@/lib/world-manager";

const ONII_AGENT_ADDRESS = "0xc1ec8b9ca11ef907b959fed83272266b0e96b58d";
const ORCHESTRATOR_AGENT_ADDRESS = "0x5c02b4685492d36a40107b6ec48a91ab3f8875cb";
const UNION_AGENT_ADDRESS = "0x18539799494fd1e91a11c6bf11d9260cb50cb08a";

export const USER_NAME = "USER";

export const CHAT_SOURCE = "client_chat";

export const CHAT_DATA: { [key: string]: { agentId: UUID } } = {
  [ONII_AGENT_ADDRESS]: {
    agentId: "c44c5b36-0fb1-0769-b0c1-fa0965cf61fb",
  },
  [ORCHESTRATOR_AGENT_ADDRESS]: {
    agentId: "28d29474-23c7-01b9-aee8-ba150c366103",
  },
  [UNION_AGENT_ADDRESS]: {
    agentId: "72d1bc17-8678-0b9f-9cf6-f8701a1fb442",
  },
};
