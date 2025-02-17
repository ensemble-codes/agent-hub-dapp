import { ethers } from "ethers";
import Ensemble from "@ensemble-ai/sdk";
import { baseSepolia } from "viem/chains";

import { useEffect, useState } from 'react';

export function useSdk(walletClient: any) {
  const [sdk, setSdk] = useState<any>(null);

  useEffect(() => {
    if (walletClient) {
      const initializedSdk = initSdk(walletClient);
      setSdk(initializedSdk);
    } else {
      setSdk(null);
    }
  }, [walletClient]);

  return sdk;
}

// Hook to get the SDK instance with the connected wallet's signer
export function initSdk(walletClient: any) {

  if (!walletClient) {
    throw new Error('Wallet not connected');
  }

  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);
  
  // Create a custom signer that uses the wallet client
  const signer = new ethers.JsonRpcSigner(
    provider,
    walletClient.account.address
  );

  // Override the sendTransaction method
  signer.sendTransaction = async (tx) => {
    const hash = await walletClient.request({
      method: 'eth_sendTransaction',
      params: [{
        from: walletClient.account.address,
        to: tx.to?.toString() as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value ? `0x${tx.value.toString(16)}` : undefined,
        nonce: tx.nonce ? `0x${tx.nonce.toString(16)}` : undefined,
        gasLimit: tx.gasLimit ? `0x${tx.gasLimit.toString(16)}` : undefined,
        gasPrice: tx.gasPrice ? `0x${tx.gasPrice.toString(16)}` : undefined
      }],
    });

    // Wait for transaction to be mined
    await provider.waitForTransaction(hash);
    const transaction = await provider.getTransaction(hash);
    if (!transaction) throw new Error('Transaction not found');
    return transaction;
  };

  const config = {
    network: {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
      chainId: baseSepolia.id,
      name: baseSepolia.network,
    },
    taskRegistryAddress: process.env.NEXT_PUBLIC_TASK_REGISTRY_ADDRESS!,
    agentRegistryAddress: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS!,
    serviceRegistryAddress: process.env.NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS!,
  };

  return new Ensemble(config, signer);
  // const { data: walletClient } = useWalletClient({
  //   config: config
  // });

}
