import { base } from "viem/chains";
import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [metaMask()],
  ssr: true,
});
