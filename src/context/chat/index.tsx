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

type ChatContextType = [ChatState, Dispatch<Action>];

export const ChatContext = createContext<ChatContextType>([
  initialState,
  () => {}
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
    defaultValue: `xmtp-${account.address}.db3`,
    getInitialValueInEffect: false
  })

  const initClient = useCallback(async () => {
    const connector = account.connector;

    if (data?.account && connector) {
      const signer = createEOASigner(
        data?.account?.address,
        (message: string) => signMessageAsync({ message })
      );

      let retries = 3;
      while (retries > 0) {
        try {
          let xmtpClient = await Client.create(signer, {
            env: "production",
            loggingLevel,
            ...(encryptionKey ? { dbEncryptionKey: hexToUint8Array(encryptionKey) } : {}),
            ...(dbPath ? { dbPath } : {}),
            codecs: [
              new ReactionCodec(),
              new ReplyCodec(),
              new RemoteAttachmentCodec(),
              new TransactionReferenceCodec(),
              new WalletSendCallsCodec(),
            ],
          });

          console.log({ xmtpClient });

          dispatch({
            type: SET_CHAT_CLIENT,
            payload: xmtpClient,
          });
          break;
        } catch (e) {
          console.error(`Error creating XMTP client (attempts left: ${retries})`, e);
          retries--;
          if (retries === 0) {
            dispatch({
              type: SET_CHAT_CLIENT,
              payload: undefined,
            });
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
      }
    }
  }, [account.address, data?.account, encryptionKey, dbPath]);

  // Initialize XMTP client when wallet connects
  useEffect(() => {
    if (account.isConnected && !state.client) {
      console.log(account);
      initClient();
    }
  }, [account.isConnected, state.client, initClient]);

  return (
    <ChatContext.Provider value={[state, dispatch]}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): ChatContextType {
  return useContext(ChatContext);
}
