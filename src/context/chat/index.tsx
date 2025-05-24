"use client";
import {
  createContext,
  FC,
  useReducer,
  Dispatch,
  useContext,
  useCallback,
} from "react";
import { Action } from "../app/action";
import { useAccount, useSignMessage, useWalletClient } from "wagmi";
import { Client } from "@xmtp/browser-sdk";
import initialState, { ChatState } from "./state";
import { SET_CHAT_CLIENT } from "./actions";
import { createEOASigner } from "@/utils";
import reducer from "./reducer";

interface ContextProps {
  children: React.ReactNode;
}

type ChatContextType = [ChatState, Dispatch<Action>, () => Promise<void>];

export const ChatContext = createContext<ChatContextType>([
  initialState,
  () => {},
  async () => {}
]);

export const ChatContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const account = useAccount();
  const { data } = useWalletClient();
  const { signMessageAsync } = useSignMessage();

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
          });

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
  }, [account.address, data?.account]);

  return (
    <ChatContext.Provider value={[state, dispatch, initClient]}>
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): ChatContextType {
  return useContext(ChatContext);
}
