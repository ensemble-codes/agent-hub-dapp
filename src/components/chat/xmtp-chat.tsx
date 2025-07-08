'use client'

import { FC, useCallback, useEffect, useRef, useState } from "react"
import { ChatLayout } from "./chat-layout"
import { useConversation } from "@/hooks/useConversation"
import { useXMTP } from "@/context/XMTPContext"
import { useAccount, useSignMessage } from "wagmi"
import { createEOASigner } from "@/utils"

export const XmtpChat: FC = () => {
    const [input, setInput] = useState("")
    const account = useAccount()
    const [isInitializing, setIsInitializing] = useState(false);
    const { signMessageAsync } = useSignMessage();

    const { 
        getMessages, 
        streamMessages, 
        send,
        messages,
        conversation 
    } = useConversation(
        // FIXME: Use agent address passed from parent component
        "0x5C02b4685492D36a40107B6eC48A91ab3f8875cb"
    );

    const { 
        client, 
        initialize, 
        initializing, 
        error: xmtpError 
    } = useXMTP();

    useEffect(() => {
        const abortController = new AbortController();
    
        const initializeClient = async () => {
          if (
            !client &&
            account.isConnected &&
            !isInitializing &&
            !initializing &&
            !abortController.signal.aborted
          ) {
            console.log("Initializing XMTP client...");
            setIsInitializing(true);
            try {
              await initialize({
                signer: createEOASigner(account.address!, (message: string) =>
                  signMessageAsync({ message })
                ),
                env: "production",
                loggingLevel: "off",
              });
            } catch (error) {
              if (!abortController.signal.aborted) {
                console.error("Failed to initialize XMTP client:", error);
              }
            } finally {
              if (!abortController.signal.aborted) {
                setIsInitializing(false);
              }
            }
          }
        };
    
        initializeClient();
    
        return () => {
          abortController.abort();
        };
      }, [
        client,
        account.isConnected,
        initialize,
        initializing,
        isInitializing,
        account.address,
        signMessageAsync,
      ]);

    const stopStreamRef = useRef<() => void | null>(null);

    const startStream = useCallback(async () => {
        stopStreamRef.current = await streamMessages();
    }, [streamMessages]);

    const stopStream = useCallback(() => {
        stopStreamRef.current?.();
        stopStreamRef.current = null;
    }, []);
    
    useEffect(() => {
        const initializeChat = async () => {
            try {
              await getMessages();
              await startStream();
            } catch (error) {
              console.error("Error initializing chat:", error);
            }
          };
      
          if (client && conversation) {
            initializeChat();
          }
      
          return () => {
            stopStream();
          };
    }, [client, conversation, getMessages, startStream, stopStream])

    const handleSend = useCallback(async () => {
        try {
            if (!input) return

            await send(input)
            
            setInput('')
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }, [input, send])
    
    return <ChatLayout
        messages={messages}
        handleSend={handleSend}
        setInput={setInput}
        input={input}
    />
}