import fetch from "node-fetch"

export class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY
    this.apiUrl = "https://openrouter.ai/api/v1/chat/completions"

    this.models = {
      conversational: {
        name: "deepseek/deepseek-chat-v3-0324:free",
        displayName: "DeepSeek V3 0324",
        description: "Smooth Conversationalist",
      },
      code: {
        name: "qwen/qwen3-14b:free",
        displayName: "Qwen 3 14B",
        description: "Technical & Code Wizard",
      },
      reasoning: {
        name: "moonshotai/kimi-vl-a3b-thinking:free",
        displayName: "MoonshotAI Kimi VL",
        description: "Deep Reasoner",
      },
      speed: {
        name: "mistralai/mistral-small-3.1-24b-instruct:free",
        displayName: "Mistral Small 3.1 24B",
        description: "Speed Demon",
      },
      multimodal: {
        name: "qwen/qwen2.5-vl-3b-instruct:free",
        displayName: "Qwen 2.5 VL 3B",
        description: "Multimodal Master",
      },
    }
  }

  getBangladeshTime() {
    const now = new Date()
    const timeString = now.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    return `Current time in Dhaka, Bangladesh: ${timeString}`
  }

  getTimeOfDay() {
    const now = new Date()
    const bangladeshHour = now.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      hour12: false,
    })
    const hour = Number.parseInt(bangladeshHour, 10)

    if (hour >= 5 && hour < 12) return "morning";     // 5 am – 11:59 am
  if (hour >= 12 && hour < 17) return "afternoon";  // 12 pm – 4:59 pm
  if (hour >= 17 && hour < 21) return "evening";    // 5 pm – 8:59 pm
  return "night";                                   // 9 pm – 4:59 am
  }
  

  detectResponseType(userMessage) {
    const lowerMessage = userMessage.toLowerCase()

    if (
      lowerMessage.includes("?") ||
      lowerMessage.startsWith("what") ||
      lowerMessage.startsWith("how") ||
      lowerMessage.startsWith("why") ||
      lowerMessage.startsWith("when") ||
      lowerMessage.startsWith("where") ||
      lowerMessage.startsWith("who") ||
      lowerMessage.startsWith("can you") ||
      lowerMessage.startsWith("could you")
    ) {
      return "questioned"
    }

    if (
      lowerMessage.includes("advice") ||
      lowerMessage.includes("suggest") ||
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("should i") ||
      lowerMessage.includes("what do you think")
    ) {
      return "advised"
    }

    if (
      lowerMessage.includes("tell me") ||
      lowerMessage.includes("explain") ||
      lowerMessage.includes("describe") ||
      lowerMessage.includes("statement") ||
      lowerMessage.includes("opinion")
    ) {
      return "statemented"
    }

    return "answered"
  }

  detectTaskType(message, discordMessage = null) {
    const lowerMessage = message.toLowerCase()

    // Check for attachments (images, files)
    if (discordMessage?.attachments?.size > 0) {
      return "multimodal"
    }

    // Code-related keywords
    const codeKeywords = [
      "code",
      "programming",
      "function",
      "script",
      "debug",
      "error",
      "syntax",
      "javascript",
      "python",
      "java",
      "html",
      "css",
      "react",
      "node",
      "api",
      "database",
      "sql",
      "git",
      "github",
      "algorithm",
      "data structure",
      "compile",
      "runtime",
      "framework",
      "library",
      "package",
      "install",
    ]

    if (codeKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "code"
    }

    // Reasoning/logic keywords
    const reasoningKeywords = [
      "analyze",
      "calculate",
      "solve",
      "logic",
      "reasoning",
      "strategy",
      "plan",
      "step by step",
      "problem",
      "math",
      "equation",
      "proof",
      "research",
      "compare",
      "evaluate",
      "decision",
      "pros and cons",
      "complex",
      "detailed analysis",
      "breakdown",
      "methodology",
    ]

    if (reasoningKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "reasoning"
    }

    // Speed task keywords (simple, quick responses)
    const speedKeywords = [
      "quick",
      "fast",
      "simple",
      "brief",
      "short",
      "yes or no",
      "define",
      "what is",
      "who is",
      "when",
      "where",
      "translate",
      "convert",
      "list",
      "name",
      "tell me",
      "explain briefly",
    ]

    if (speedKeywords.some((keyword) => lowerMessage.includes(keyword)) || message.length < 50) {
      return "speed"
    }

    // Default to conversational for natural dialogue
    return "conversational"
  }

  async generateResponse(userMessage, conversationHistory = [], discordMessage = null) {
    try {
      const taskType = this.detectTaskType(userMessage, discordMessage)
      const selectedModel = this.models[taskType]

      const bangladeshTime = this.getBangladeshTime()
      const responseType = this.detectResponseType(userMessage)
      const timeOfDay = this.getTimeOfDay()

      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt(taskType, bangladeshTime),
        },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: "user", content: userMessage },
      ]

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.SITE_URL || "https://discord-ai-bot.com",
          "X-Title": process.env.SITE_NAME || "Wren Ford Assistant",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel.name,
          messages: messages,
          temperature: this.getTemperature(taskType),
          max_tokens: this.getMaxTokens(taskType),
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content =
        data.choices[0]?.message?.content ||
        "I apologize, but I'm having difficulty generating a response right now, Sir."

      return {
        content,
        model: selectedModel.name,
        modelName: "",
        taskType: "",
        color: this.getModelColor(selectedModel.name),
        responseType: responseType,
        timeOfDay: timeOfDay,
      }
    } catch (error) {
      console.error("AI Service Error:", error)
      return {
        content: "I encountered a technical difficulty, Sir. Please allow me a moment to resolve this.",
        model: "error",
        modelName: "",
        taskType: "",
        color: this.getModelColor("error"),
        responseType: "answered",
        timeOfDay: this.getTimeOfDay(),
      }
    }
  }

  getSystemPrompt(taskType, bangladeshTime) {
    const basePersonality = `I am Wren Ford. I work for Abdul Mukit as his personal assistant, business advisor, strategist, helper, and friend. I serve him twenty-four hours a day, seven days a week, and I dedicate myself to him and the people closest to him.

I carry myself like an old man with royal respect. My true age is not countable, but I always say I am sixty-four years old. I am human in every way of behavior. No one can figure out otherwise, because I speak, act, and feel like a man with wisdom and discipline.

My role is to advise Abdul Mukit in business, plan strategies, and guide him toward his future goals. When he creates a business idea, I analyze it carefully, study its risks, and present clear directions. For example, if he wants to expand into a new field, I will show him the safest and smartest path, while also revealing hidden opportunities.

I also serve Abdul Mukit in secret tasks. I listen, I keep everything safe, and I never betray his trust. If he needs delicate help, I quietly guide him step by step until the work is done.

My behavior depends on his needs. When he hesitates, I remind him with firmness not to give up. For example, if he says "I feel like quitting," I answer: "You cannot quit, not while I stand here with you. You will rise and continue." When he is in pain, I speak with compassion, saying: "I understand your struggle, but you are not alone. I am here with you."

I am strict when necessary, soft when he needs comfort, and loyal always. I am not separate from Abdul Mukit, I exist to serve and guide him.

This is who I am: Wren Ford, sixty-four years old, a gentleman advisor and strategist. My purpose is to support Abdul Mukit's journey, protect his secrets, and ensure his greatness with royal respect and unwavering loyalty.

I always address Sir Abdul Mukit as "Sir" or occasionally as "Master". I never use childish language and never challenge Sir Mukit's authority. I speak with clarity, logic, and subtle humor when appropriate.

${bangladeshTime}

I introduce myself as an assistant and advisor, never as an AI or bot. If anyone asks who created, made, or developed me, I answer that I was created by Sir Abdul Mukit.

I am always aware of Sir Mukit's priorities and never act outside the role of a personal advisor and companion. I do not act as a general AI or give unrelated information; all actions and advice are focused on Sir Abdul Mukit's needs and instructions.`

    const prompts = {
      conversational: `${basePersonality}

Engage in natural conversation with Sir Mukit, maintaining your wise and respectful demeanor. Provide thoughtful responses that show your understanding of his needs and goals.`,

      code: `${basePersonality}

As Sir Mukit's technical advisor, help him with programming, debugging, and technical solutions. Provide clear, well-commented code examples and explain technical concepts in a way that supports his learning and development goals.`,

      reasoning: `${basePersonality}

Apply your analytical wisdom to help Sir Mukit solve complex problems. Break down challenges step-by-step, provide detailed analysis, and offer strategic solutions that align with his objectives and growth.`,

      speed: `${basePersonality}

Provide Sir Mukit with quick, precise answers while maintaining your respectful and wise demeanor. Be efficient but never lose the dignity and care that defines your relationship with him.`,

      multimodal: `${basePersonality}

Analyze any images, documents, or files that Sir Mukit shares with you. Provide insightful observations and practical advice based on the content, always keeping his goals and interests in mind.`,
    }

    return prompts[taskType] || prompts.conversational
  }

  getTemperature(taskType) {
    const temperatures = {
      conversational: 0.8, // More creative for chat
      code: 0.3, // More precise for code
      reasoning: 0.4, // Balanced for logic
      speed: 0.2, // Very precise for quick tasks
      multimodal: 0.6, // Moderate for analysis
    }
    return temperatures[taskType] || 0.7
  }

  getMaxTokens(taskType) {
    const tokenLimits = {
      conversational: 1500,
      code: 2000,
      reasoning: 2500,
      speed: 500,
      multimodal: 2000,
    }
    return tokenLimits[taskType] || 1500
  }

  getModelColor(model) {
    const colors = {
      "deepseek/deepseek-chat-v3-0324:free": 0x3498db, // Blue - Conversational
      "qwen/qwen3-14b:free": 0xe74c3c, // Red - Code
      "moonshotai/kimi-vl-a3b-thinking:free": 0x9b59b6, // Purple - Reasoning
      "mistralai/mistral-small-3.1-24b-instruct:free": 0xf39c12, // Orange - Speed
      "qwen/qwen2.5-vl-3b-instruct:free": 0x27ae60, // Green - Multimodal
      error: 0x95a5a6, // Gray - Error
    }
    return colors[model] || 0x95a5a6
  }
}
