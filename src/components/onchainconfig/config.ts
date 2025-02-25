import { createPublicClient, PublicClient } from "viem";
import { baseSepolia } from "viem/chains";
import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [metaMask()],
  ssr: true,
});

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
}) as PublicClient;
