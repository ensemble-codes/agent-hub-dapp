import { createPublicClient, PublicClient } from "viem";
import { base } from "wagmi/chains";
import { http, createConfig } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rabbyWallet,
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        rabbyWallet,
        metaMaskWallet,
        injectedWallet,
        coinbaseWallet
      ],
    },
  ],
  {
    appName: "Agent Hub",
    projectId,
  }
);

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  multiInjectedProviderDiscovery: false,
  connectors,
  ssr: true,
});

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
}) as PublicClient;