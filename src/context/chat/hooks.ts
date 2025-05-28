import { useCallback, useEffect, useMemo, useState } from "react";
import { useChat } from ".";
import { Conversation, DecodedMessage } from "@xmtp/browser-sdk";

export function useConsersation(address?: string) {
  const [chatState] = useChat();
  const [converstion, setConverstion] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<{ content: string; isReceived: boolean }[]>([]);

  const { client } = chatState;

  useEffect(() => {
    const getConversation = async () => {
      if (!client || !address) return;

      await client.conversations.syncAll()

      const dmConversation = await client.conversations.newDmWithIdentifier({
        identifierKind: "Ethereum",
        identifier: address.toLowerCase(),
      });

      setConverstion(dmConversation);
    };

    getConversation();
  }, [client, address]);

  const indexId = useMemo(() =>  {
    if (!client) return null;

    return client.inboxId
  }, [client])

  const formatMessage = useCallback((message: DecodedMessage) => {
    if (typeof message.content !== 'string') {
      return null
    }

    return {
      content: message.content,
      isReceived: message.senderInboxId !== indexId
    }
  }, [indexId])

  const getMessages = useCallback(async () => {
    if (!converstion) return;

    try {
      const msgs = (await converstion.messages()) ?? [];
      const formattedMessages = msgs.map(formatMessage).filter((msg) => msg !== null);
      setMessages(formattedMessages);
    } finally {
      setLoading(false);
    }
  }, [converstion]);

  const sync = useCallback(async () => {
    if (!converstion) return;

    setSyncing(true);

    try {
      await converstion.sync();
    } finally {
      setSyncing(false);
    }
  }, [converstion]);

  const send = useCallback(
    async (message: string) => {
      if (!converstion) return;

      setSending(true);

      try {
        await converstion.send(message);
      } finally {
        setSending(false);
      }
    },
    [converstion]
  );

  const streamMessages = useCallback(async () => {
    const noop = () => {};

    if (!converstion) return noop;

    try {
      const stream = await converstion.stream(
        (error: Error | null, message: DecodedMessage | undefined) => {
          if (error) {
            console.error("Error streaming messages", error);
            return;
          }

          if (message) {
            const formattedMessage = formatMessage(message);
            if (!formattedMessage) return;
            
            setMessages((prev) => [...prev, formattedMessage]);
          }
        }
      );

      return stream
        ? () => {
            try {
              stream.return(undefined);
            } catch (e) {
              console.error("Error closing stream", e);
            }
          }
        : noop;
    } catch (e) {
      console.error("Error setting up stream", e);
      return noop;
    }
  }, [converstion, formatMessage]);

  return {
    getMessages,
    converstion,
    loading,
    syncing,
    sending,
    messages,
    sync,
    send,
    streamMessages
  };
}
