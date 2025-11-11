import {
  ConversationResponse,
  PaginatedMessagesResponse,
  ConversationOperationResponse,
} from '@/types/conversations';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export class ConversationsAPI {
  /**
   * Get JWT token from Supabase session
   */
  private static async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('[ConversationsAPI] Error getting auth token:', error);
      return null;
    }
  }

  private static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Get JWT token from Supabase
    const jwt = await this.getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(jwt && { 'Authorization': `Bearer ${jwt}` }),
        ...options?.headers,
      },
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error('[ConversationsAPI] Unauthorized - session may be expired');
      throw new Error('Unauthorized - please log in again');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new conversation
   */
  static async createConversation(params: {
    platformConversationId: string;
    platform?: 'websocket' | 'telegram' | 'discord' | 'x' | 'whatsapp';
    creatorId: string;
    participants: string[];
    name?: string;
    metadata?: Record<string, any>;
  }): Promise<ConversationResponse> {
    console.log('[ConversationsAPI] Creating conversation:', params);

    const response = await this.fetch<{ data: ConversationResponse }>(
      '/api/v1/communication/conversations/',
      {
        method: 'POST',
        body: JSON.stringify({
          platform_conversation_id: params.platformConversationId,
          platform: params.platform || 'websocket',
          creator_id: params.creatorId,
          participants: params.participants,
          name: params.name,
          metadata: params.metadata,
        }),
      }
    );

    console.log('[ConversationsAPI] Conversation created:', response.data);
    return response.data;
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string): Promise<ConversationResponse> {
    console.log('[ConversationsAPI] Getting conversation:', conversationId);

    const response = await this.fetch<{ data: ConversationResponse }>(
      `/api/v1/communication/conversations/${conversationId}`
    );

    console.log('[ConversationsAPI] Conversation retrieved:', response.data);
    return response.data;
  }

  /**
   * List conversations for a user
   */
  static async listConversations(params: {
    platform?: string;
    participantId?: string;
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<{ items: ConversationResponse[]; total: number; has_more: boolean }> {
    const queryParams = new URLSearchParams();
    if (params.platform) queryParams.set('platform', params.platform);
    if (params.participantId) queryParams.set('participant_id', params.participantId);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.includeArchived) queryParams.set('include_archived', 'true');

    console.log('[ConversationsAPI] Listing conversations with params:', params);

    const response = await this.fetch<{ data: { items: ConversationResponse[]; total: number; has_more: boolean } }>(
      `/api/v1/communication/conversations/?${queryParams.toString()}`
    );

    console.log('[ConversationsAPI] Conversations retrieved:', response.data.items.length);
    return response.data;
  }

  /**
   * Get message history for a conversation
   */
  static async getMessageHistory(
    conversationId: string,
    params?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      senderFilter?: string;
    }
  ): Promise<PaginatedMessagesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.startDate) queryParams.set('start_date', params.startDate);
    if (params?.endDate) queryParams.set('end_date', params.endDate);
    if (params?.senderFilter) queryParams.set('sender_filter', params.senderFilter);

    console.log('[ConversationsAPI] Getting message history for conversation:', conversationId);

    const response = await this.fetch<{ data: PaginatedMessagesResponse }>(
      `/api/v1/communication/messages/conversations/${conversationId}?${queryParams.toString()}`
    );

    console.log('[ConversationsAPI] Message history retrieved:', response.data.items.length, 'messages');
    return response.data;
  }

  /**
   * Mark messages as read
   */
  static async markMessagesRead(
    conversationId: string,
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    console.log('[ConversationsAPI] Marking messages as read for conversation:', conversationId);

    return this.fetch(`/api/v1/communication/messages/conversations/${conversationId}/mark-read`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId: string): Promise<{ success: boolean }> {
    console.log('[ConversationsAPI] Archiving conversation:', conversationId);

    return this.fetch(`/api/v1/communication/conversations/${conversationId}/archive`, {
      method: 'POST',
    });
  }

  /**
   * Get conversation summary
   */
  static async getConversationSummary(conversationId: string): Promise<{
    summary: string;
    key_points: string[];
    sentiment?: string;
  }> {
    console.log('[ConversationsAPI] Getting summary for conversation:', conversationId);

    const response = await this.fetch<{ data: any }>(
      `/api/v1/communication/conversations/${conversationId}/summary`
    );
    return response.data;
  }

  /**
   * Get conversation analytics
   */
  static async getConversationAnalytics(conversationId: string): Promise<{
    message_count: number;
    participant_stats: Record<string, any>;
    activity_timeline: any[];
  }> {
    console.log('[ConversationsAPI] Getting analytics for conversation:', conversationId);

    const response = await this.fetch<{ data: any }>(
      `/api/v1/communication/conversations/${conversationId}/analytics`
    );
    return response.data;
  }
}
