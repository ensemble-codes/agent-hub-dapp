import { createPublicClient, PublicClient } from "viem";
import { baseSepolia } from "wagmi/chains";
import { http, createConfig } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rabbyWallet,
  injectedWallet,
  metaMaskWallet,
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
      ],
    },
  ],
  {
    appName: "Agent Hub",
    projectId,
  }
);

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  multiInjectedProviderDiscovery: false,
  connectors,
  ssr: true,
});

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
}) as PublicClient;