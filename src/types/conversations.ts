export type PlatformType = "websocket" | "telegram" | "discord" | "x" | "whatsapp";
export type SenderType = "user" | "agent" | "system";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface CreateConversationRequest {
  platform_conversation_id: string;
  conversation_id?: string | null;
  name?: string | null;
  platform?: PlatformType;
  creator_id?: string | null;
  participants?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface ConversationResponse {
  id: string;
  name?: string | null;
  description?: string | null;
  platform: PlatformType;
  platform_conversation_id: string;
  platform_metadata: Record<string, any>;
  participants: string[];
  created_by?: string | null;
  message_count: number;
  last_message_at?: string | null;
  is_active: boolean;
  archived_at?: string | null;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlatformContextResponse {
  platform: PlatformType;
  room_id?: string | null;
  channel_id?: string | null;
  thread_id?: string | null;
  server_id?: string | null;
  metadata: Record<string, any>;
}

export interface AttachmentResponse {
  id: string;
  type: string;
  url: string;
  filename?: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  platform_context: PlatformContextResponse;
  text: string;
  attachments: AttachmentResponse[];
  sender_id: string;
  sender_name: string;
  sender_type: SenderType;
  status: MessageStatus;
  metadata: Record<string, any>;
  thread_id?: string | null;
  reaction_count: number;
  is_edited: boolean;
  edit_history: Record<string, any>[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PaginatedMessagesResponse {
  items: MessageResponse[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ConversationOperationResponse {
  success: boolean;
  conversation_id?: string | null;
  message?: string | null;
}
