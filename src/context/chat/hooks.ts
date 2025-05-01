import { useCallback, useEffect, useState } from "react";
import { useChat } from ".";
import { Conversation, DecodedMessage } from "@xmtp/browser-sdk";

export function useConsersation(address?: string) {
  const [chatState] = useChat();
  const [converstion, setConverstion] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DecodedMessage[]>([]);

  const { client } = chatState;

  useEffect(() => {
    const getConversation = async () => {
      if (!client || !address) return;

      const dmConversation = await client.conversations.newDmWithIdentifier({
        identifierKind: "Ethereum",
        identifier: address.toLowerCase(),
      });

      setConverstion(dmConversation);
    };

    getConversation();
  }, [client, address]);

  const getMessages = useCallback(async () => {
    if (!converstion) return;

    try {
      const msgs = (await converstion.messages()) ?? [];
      setMessages(msgs);
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

    const stream = await converstion.stream(
      (error: Error | null, message: DecodedMessage | undefined) => {
        if (error) {
          console.error("Error streaming messages", error);
          return;
        }

        if (message) {
          setMessages((prev) => [...prev, message]);
        }
      }
    );

    return stream
      ? () => {
          stream.return(undefined);
        }
      : noop;
  }, [converstion]);

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
