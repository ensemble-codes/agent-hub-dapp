"use client";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";

type Props = { children: ReactNode };

const queryClient = new QueryClient();

function OnchainProvider({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="wide"
          showRecentTransactions={true}
          theme={lightTheme({
            accentColor: '#000000',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          appInfo={{
            appName: "Agent Hub",
          }}
        >
          <ApolloProvider client={client}>{children}</ApolloProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default OnchainProvider;
