import { ethers } from "ethers";
import Ensemble from "@ensemble-ai/sdk";
import { baseSepolia } from "viem/chains";
import { PinataSDK } from "pinata-web3";
import { ConnectedWallet, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";

import { useEffect, useState } from "react";

export function useSdk() {
  const [sdk, setSdk] = useState<Ensemble | null>(null);
  const { wallets } = useWallets();
  useEffect(() => {
    const initializedSdk = initSdk(wallets[0]);
    setSdk(initializedSdk);
  }, []);

  return sdk;
}

// Hook to get the SDK instance with the connected wallet's signer
export function initSdk(wallet: ConnectedWallet) {
  const config = {
    network: {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
      chainId: baseSepolia.id,
      name: baseSepolia.network,
    },
    taskRegistryAddress: process.env.NEXT_PUBLIC_TASK_REGISTRY_ADDRESS!,
    agentRegistryAddress: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS!,
    serviceRegistryAddress: process.env.NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS!,
    subgraphUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  };

  const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT_KEY!,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!,
  });

  const signer = setSigner(wallet);

  return Ensemble.create(config, signer, pinata);
}

export const setSigner = (wallet: ConnectedWallet) => {
  if (!wallet) return;
  console.log("Setting signer");

  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);

  // Create a custom signer that uses the Privy wallet with Viem
  const signer = new ethers.JsonRpcSigner(provider, wallet.address);

  // Override the sendTransaction method to work with Privy wallet using Viem
  signer.sendTransaction = async (tx) => {
    try {
      console.log("Sending transaction:", tx);

      // Switch wallet to Base Sepolia chain
      await wallet.switchChain(baseSepolia.id);

      // Get the Ethereum provider from the wallet
      const ethereumProvider = await wallet.getEthereumProvider();

      // Create Viem wallet client
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(ethereumProvider),
      });

      // Convert ethers transaction to the format Viem expects
      const transactionRequest = {
        to: tx.to?.toString() as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value ? BigInt(tx.value.toString()) : BigInt(0),
        nonce: tx.nonce ? Number(tx.nonce) : undefined,
        gas: tx.gasLimit ? BigInt(tx.gasLimit.toString()) : undefined,
        maxFeePerGas: tx.maxFeePerGas
          ? BigInt(tx.maxFeePerGas.toString())
          : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas
          ? BigInt(tx.maxPriorityFeePerGas.toString())
          : undefined,
      };

      // Remove undefined values
      Object.keys(transactionRequest).forEach((key) => {
        if (
          transactionRequest[key as keyof typeof transactionRequest] ===
          undefined
        ) {
          delete transactionRequest[key as keyof typeof transactionRequest];
        }
      });

      console.log("Transaction request:", transactionRequest);

      // Use Viem's sendTransaction method
      const hash = await walletClient.sendTransaction(transactionRequest);

      console.log("Transaction hash:", hash);

      // Wait for transaction to be mined
      await provider.waitForTransaction(hash);
      const transaction = await provider.getTransaction(hash);
      if (!transaction) throw new Error("Transaction not found");
      return transaction;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  return signer;
};
