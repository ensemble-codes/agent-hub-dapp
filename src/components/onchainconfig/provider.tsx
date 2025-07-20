"use client";
import { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { baseSepolia } from "viem/chains";

type Props = { children: ReactNode };

function OnchainProvider({ children }: Props) {
  return (
    <>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_ID!}
        clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
        config={{
          appearance: {
            accentColor: "#F94D27",
            theme: "#FFFFFF",
            showWalletLoginFirst: true,
            walletChainType: "ethereum-only",
          },
          defaultChain: baseSepolia,
          supportedChains: [baseSepolia],
          loginMethods: ["google", "email", "wallet"],
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
            requireUserPasswordOnCreate: false,
            ethereum: {
              createOnLogin: "users-without-wallets",
            },
          },
          mfa: {
            noPromptOnMfaRequired: false,
          },
        }}
      >
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </PrivyProvider>
    </>
  );
}

export default OnchainProvider;
