import posthog from "posthog-js";

// User action logging
export const logUserAction = (action: string, context?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(`user_action_${action}`, {
      action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

// Business event logging
export const logBusinessEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(`business_${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// Error logging with context
export const logError = (error: Error, context?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$exception', {
      $exception_message: error.message,
      $exception_type: error.name,
      $exception_stack_trace: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

// Performance monitoring (PostHog doesn't have direct span support, track as event)
export const logPerformance = async (operation: string, callback: () => void | Promise<void>) => {
  const startTime = performance.now();
  try {
    const result = await callback();
    const duration = performance.now() - startTime;
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('performance_metric', {
        operation,
        duration_ms: duration,
        success: true
      });
    }
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('performance_metric', {
        operation,
        duration_ms: duration,
        success: false,
        error: (error as Error).message
      });
    }
    throw error;
  }
};

// Set user context
export const setUserContext = (userId: string, userData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, userData);
  }
};

// Set tags for filtering
export const setTags = (tags: Record<string, string>) => {
  if (typeof window !== 'undefined' && posthog) {
    const taggedProperties = Object.entries(tags).reduce((acc, [key, value]) => ({
      ...acc,
      [`tag_${key}`]: value
    }), {});
    posthog.setPersonProperties(taggedProperties);
  }
};

// Specific logging functions for your app
export const logAgentRegistration = (agentData: {
  name: string;
  service: string;
  address: string;
}) => {
  logBusinessEvent("agent_registration", {
    agent_name: agentData.name,
    service: agentData.service,
    agent_address: agentData.address
  });
};

export const logTaskCreation = (taskData: {
  service: string;
  agentId: string;
  taskId: string;
  proposalId: string;
}) => {
  logBusinessEvent("task_creation", {
    service: taskData.service,
    agent_id: taskData.agentId,
    task_id: taskData.taskId,
    proposal_id: taskData.proposalId
  });
};

export const logTaskRating = (ratingData: {
  taskId: string;
  rating: number;
  agentId: string;
}) => {
  logBusinessEvent("task_rating", {
    task_id: ratingData.taskId,
    rating: ratingData.rating,
    agent_id: ratingData.agentId
  });
};

export const logServiceSelection = (service: string) => {
  logUserAction("service_selection", { service });
};

export const logAgentSelection = (agentId: string, service: string) => {
  logUserAction("agent_selection", { agent_id: agentId, service });
};

export const logWalletConnection = (address: string) => {
  logUserAction("wallet_connection", { wallet_address: address });
  setUserContext(address, { wallet_address: address });
};

export const logXMTPMessage = (messageData: {
  agentId: string;
  messageLength: number;
  isReceived: boolean;
}) => {
  logUserAction("xmtp_message", {
    agent_id: messageData.agentId,
    message_length: messageData.messageLength,
    is_received: messageData.isReceived
  });
};