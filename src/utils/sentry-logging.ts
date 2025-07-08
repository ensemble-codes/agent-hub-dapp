import * as Sentry from "@sentry/nextjs";

// User action logging
export const logUserAction = (action: string, context?: Record<string, any>) => {
  Sentry.setContext("user_action", {
    action,
    timestamp: new Date().toISOString(),
    ...context
  });
  Sentry.captureMessage(`User Action: ${action}`, "info");
};

// Business event logging
export const logBusinessEvent = (event: string, data?: Record<string, any>) => {
  Sentry.setContext("business_event", {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
  Sentry.captureMessage(`Business Event: ${event}`, "info");
};

// Error logging with context
export const logError = (error: Error, context?: Record<string, any>) => {
  Sentry.setContext("custom", {
    timestamp: new Date().toISOString(),
    ...context
  });
  Sentry.captureException(error);
};

// Performance monitoring
export const logPerformance = (operation: string, callback: () => void | Promise<void>) => {
  return Sentry.startSpan({
    name: operation,
    op: "ui.interaction"
  }, callback);
};

// Set user context
export const setUserContext = (userId: string, userData?: Record<string, any>) => {
  Sentry.setUser({
    id: userId,
    ...userData
  });
};

// Set tags for filtering
export const setTags = (tags: Record<string, string>) => {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
};

// Specific logging functions for your app
export const logAgentRegistration = (agentData: {
  name: string;
  service: string;
  address: string;
}) => {
  logBusinessEvent("Agent Registration", {
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
  logBusinessEvent("Task Creation", {
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
  logBusinessEvent("Task Rating", {
    task_id: ratingData.taskId,
    rating: ratingData.rating,
    agent_id: ratingData.agentId
  });
};

export const logServiceSelection = (service: string) => {
  logUserAction("Service Selection", { service });
};

export const logAgentSelection = (agentId: string, service: string) => {
  logUserAction("Agent Selection", { agent_id: agentId, service });
};

export const logWalletConnection = (address: string) => {
  logUserAction("Wallet Connection", { wallet_address: address });
  setUserContext(address, { wallet_address: address });
};

export const logXMTPMessage = (messageData: {
  agentId: string;
  messageLength: number;
  isReceived: boolean;
}) => {
  logUserAction("XMTP Message", {
    agent_id: messageData.agentId,
    message_length: messageData.messageLength,
    is_received: messageData.isReceived
  });
}; 