"use client";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";

type Props = { children: ReactNode };

const queryClient = new QueryClient();

function OnchainProvider({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={client}>
          {children}
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default OnchainProvider;
