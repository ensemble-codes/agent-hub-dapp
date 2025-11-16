import {
  ConversationResponse,
  PaginatedMessagesResponse,
  ConversationOperationResponse,
} from '@/types/conversations';
import { getTokenManager } from '@/lib/auth/token-manager';
import { getEnsembleAuthService } from '@/lib/auth/ensemble-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
}

export class ConversationsAPI {
  /**
   * Get JWT token from Ensemble backend
   * Automatically refreshes token if expired
   */
  private static async getAuthToken(): Promise<string | null> {
    try {
      const tokenManager = getTokenManager();

      console.log('[ConversationsAPI] Getting auth token...');

      // Check if token needs refresh (within 5 minutes of expiry)
      if (tokenManager.isTokenExpired(5 * 60 * 1000)) {
        console.log('[ConversationsAPI] Token expired or near expiry, refreshing...');

        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          console.error('[ConversationsAPI] ❌ No refresh token available');
          console.error('[ConversationsAPI] This usually means:');
          console.error('[ConversationsAPI]   1. User never logged in');
          console.error('[ConversationsAPI]   2. Tokens were cleared/expired');
          console.error('[ConversationsAPI]   3. Backend did not return refresh_token on login');
          return null;
        }

        const authService = getEnsembleAuthService();
        const result = await authService.refreshToken(refreshToken);
        tokenManager.updateAccessToken(result.access_token, result.expires_in);

        console.log('[ConversationsAPI] ✅ Token refreshed successfully');
        return result.access_token;
      }

      // Token is still valid
      const accessToken = tokenManager.getAccessToken();

      if (!accessToken) {
        console.error('[ConversationsAPI] ❌ No access token available');
        console.error('[ConversationsAPI] This usually means:');
        console.error('[ConversationsAPI]   1. User has not logged in yet');
        console.error('[ConversationsAPI]   2. Tokens were cleared');
        console.error('[ConversationsAPI]   3. Backend did not return access_token on login');
        console.error('[ConversationsAPI] Check localStorage keys:');
        console.error('[ConversationsAPI]   - ensemble_access_token:', localStorage.getItem('ensemble_access_token') ? 'exists' : 'missing');
        console.error('[ConversationsAPI]   - ensemble_refresh_token:', localStorage.getItem('ensemble_refresh_token') ? 'exists' : 'missing');
        console.error('[ConversationsAPI]   - ensemble_user:', localStorage.getItem('ensemble_user') ? 'exists' : 'missing');
        return null;
      }

      console.log('[ConversationsAPI] ✅ Using valid access token (length:', accessToken.length, ')');
      return accessToken;
    } catch (error) {
      console.error('[ConversationsAPI] ❌ Error getting auth token:', error);

      // Clear tokens on error
      const tokenManager = getTokenManager();
      tokenManager.clear();

      return null;
    }
  }

  private static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Get JWT token from Ensemble backend (auto-refreshes if needed)
    const jwt = await this.getAuthToken();

    if (!jwt || jwt === 'null' || jwt === 'undefined') {
      console.error('[ConversationsAPI] No JWT token available - user must be logged in');
      throw new Error('Authentication required - please log in to continue');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
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
    console.log('[ConversationsAPI] Creating conversation with params:', params);
    console.log('[ConversationsAPI] ⭐ platformConversationId being sent:', params.platformConversationId);

    const requestBody = {
      platform_conversation_id: params.platformConversationId,
      platform: params.platform || 'websocket',
      creator_id: params.creatorId,
      participants: params.participants,
      name: params.name,
      metadata: params.metadata,
    };

    console.log('[ConversationsAPI] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await this.fetch<{
      success: boolean;
      conversation_id: string;
      conversation: ConversationResponse;
      message: string;
    }>(
      '/api/v1/communication/conversations/',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    console.log('[ConversationsAPI] Conversation created:', response.conversation);
    console.log('[ConversationsAPI] ✅ Conversation ID:', response.conversation_id);
    return response.conversation;
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string): Promise<ConversationResponse> {
    console.log('[ConversationsAPI] Getting conversation:', conversationId);

    const response = await this.fetch<{
      success: boolean;
      conversation?: ConversationResponse;
      data?: ConversationResponse;
    }>(
      `/api/v1/communication/conversations/${conversationId}`
    );

    console.log('[ConversationsAPI] Conversation retrieved:', response);

    // Handle multiple response formats
    if (response.conversation) {
      return response.conversation;
    } else if (response.data) {
      return response.data;
    } else if ('id' in (response as any)) {
      // Response is the conversation object directly
      return response as any;
    } else {
      console.error('[ConversationsAPI] Unexpected response format for getConversation:', response);
      throw new Error('Conversation not found or invalid response format');
    }
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

    const response = await this.fetch<{
      success: boolean;
      data: { items: ConversationResponse[]; total: number; has_more: boolean };
    }>(
      `/api/v1/communication/conversations/?${queryParams.toString()}`
    );

    console.log('[ConversationsAPI] Conversations retrieved:', response.data?.items?.length || 0);
    console.log('[ConversationsAPI] Full response:', JSON.stringify(response, null, 2));

    // Handle both response formats: { data: { items } } or { items } directly
    if (response.data && 'items' in response.data) {
      return response.data;
    } else if ('items' in (response as any)) {
      return response as any;
    } else {
      console.error('[ConversationsAPI] Unexpected response format:', response);
      return { items: [], total: 0, has_more: false };
    }
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
