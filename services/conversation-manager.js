export class ConversationManager {
  constructor() {
    this.conversations = new Map()
    this.maxHistoryLength = 10
  }

  addMessage(userId, role, content) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, [])
    }

    const conversation = this.conversations.get(userId)
    conversation.push({ role, content })

    // Keep only the last maxHistoryLength messages
    if (conversation.length > this.maxHistoryLength) {
      conversation.splice(0, conversation.length - this.maxHistoryLength)
    }
  }

  getConversation(userId) {
    return this.conversations.get(userId) || []
  }

  clearConversation(userId) {
    this.conversations.delete(userId)
  }

  getAllActiveUsers() {
    return Array.from(this.conversations.keys())
  }
}
