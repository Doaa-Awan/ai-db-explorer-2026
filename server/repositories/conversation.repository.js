// data access code
// Data repository for managing conversation message history

// conversationId -> [{ role: 'user' | 'assistant', content: string }]
const conversations = new Map();

function getHistory(conversationId) {
  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, []);
  }
  return conversations.get(conversationId);
}

export const conversationRepository = {
  getRecentMessages(conversationId, limit = 10) {
    const history = getHistory(conversationId);
    return history.slice(-limit);
  },
  appendMessage(conversationId, role, content) {
    const history = getHistory(conversationId);
    history.push({ role, content });
  },
};
