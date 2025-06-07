"use client";
import {
  createContext,
  FC,
  useReducer,
  Dispatch,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { Action } from "../app/action";
import { useAccount, useSignMessage, useWalletClient } from "wagmi";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import { ReplyCodec } from "@xmtp/content-type-reply";
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference";
import { WalletSendCallsCodec } from "@xmtp/content-type-wallet-send-calls";
import { useLocalStorage } from "@mantine/hooks";
import { Client, ClientOptions } from "@xmtp/browser-sdk";
import initialState, { ChatState } from "./state";
import { SET_CHAT_CLIENT } from "./actions";
import { createEOASigner } from "@/utils";
import reducer from "./reducer";
import { hexToUint8Array } from "uint8array-extras";

interface ContextProps {
  children: React.ReactNode;
}

type ChatContextType = [ChatState, Dispatch<Action>, { initClient: () => Promise<void> }];

export const ChatContext = createContext<ChatContextType>([
  initialState,
  () => {},
  { initClient: async () => {} }
]);

export const ChatContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const account = useAccount();
  const { data } = useWalletClient();
  const { signMessageAsync } = useSignMessage();
  const [encryptionKey, setEncryptionKey] = useLocalStorage({
    key: "XMTP_ENCRYPTION_KEY",
    defaultValue: "",
    getInitialValueInEffect: false,
  });
  const [loggingLevel, setLoggingLevel] = useLocalStorage<
    ClientOptions["loggingLevel"]
  >({
    key: "XMTP_LOGGING_LEVEL",
    defaultValue: "off",
    getInitialValueInEffect: false,
  });
  const [dbPath, setDbPath] = useLocalStorage({
    key: "XMTP_DB_PATH",
    defaultValue: "",
    getInitialValueInEffect: false
  });

  const initClient = useCallback(async () => {
    if (!account.address) {
      console.error("No account address available");
      return;
    }

    // If client already exists, don't reinitialize
    if (state.client) {
      console.log("Client already exists, skipping initialization");
      return;
    }

    // Set the database path if not already set
    if (!dbPath) {
      const newDbPath = `xmtp-${account.address}.db3`;
      setDbPath(newDbPath);
    }

    // Generate and set encryption key if not already set
    if (!encryptionKey) {
      const newEncryptionKey = crypto.getRandomValues(new Uint8Array(32));
      const hexKey = Array.from(newEncryptionKey)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      setEncryptionKey(hexKey);
    }

    const connector = account.connector;

    if (data?.account && connector) {
      const signer = createEOASigner(
        data?.account?.address,
        (message: string) => signMessageAsync({ message })
      );

      try {
        let xmtpClient = await Client.create(signer, {
          env: "production",
          loggingLevel,
          ...(encryptionKey ? { dbEncryptionKey: hexToUint8Array(encryptionKey) } : {}),
          codecs: [
            new ReactionCodec(),
            new ReplyCodec(),
            new RemoteAttachmentCodec(),
            new TransactionReferenceCodec(),
            new WalletSendCallsCodec(),
          ],
        });

        console.log("XMTP client created successfully");

        dispatch({
          type: SET_CHAT_CLIENT,
          payload: xmtpClient,
        });
      } catch (e) {
        console.error("Error creating XMTP client:", e);
        dispatch({
          type: SET_CHAT_CLIENT,
          payload: undefined,
        });
      }
    }
  }, [account.address, data?.account, encryptionKey, dbPath, setDbPath, setEncryptionKey, state.client]);

  return (
    <ChatContext.Provider value={[state, dispatch, { initClient }]}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): [ChatState, Dispatch<Action>, { initClient: () => Promise<void> }] {
  return useContext(ChatContext);
}
