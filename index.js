import { Client, GatewayIntentBits, Events } from "discord.js"
import express from "express"
import dotenv from "dotenv"
import { AIService } from "./services/ai-service.js"
import { ConversationManager } from "./services/conversation-manager.js"

dotenv.config()

class MultiModelAIBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    })

    this.aiService = new AIService()
    this.conversationManager = new ConversationManager()
    this.setupEventHandlers()
    this.setupWebServer()
  }

  setupWebServer() {
    const app = express()
    const port = process.env.PORT || 3000

    // Empty white page for uptime monitoring
    app.get("/", (req, res) => {
      res.send("")
    })

    app.listen(port, () => {
      console.log(`🌐 Web server running on port ${port}`)
    })
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`✅ Wren Ford Assistant ready! Logged in as ${this.client.user.tag}`)
      this.client.user.setActivity("Serving Sir Abdul Mukit", { type: "LISTENING" })
    })

    this.client.on(Events.MessageCreate, async (message) => {
      await this.handleMessage(message)
    })

    this.client.on(Events.Error, (error) => {
      console.error("Discord client error:", error)
    })
  }

  async handleMessage(message) {
    // Ignore bot messages
    if (message.author.bot) return

    try {
      // Handle clear command
      if (message.content.startsWith("!clear")) {
        this.conversationManager.clearConversation(message.author.id)
        await message.reply("🗑️ Conversation history cleared!")
        return
      }

      // Handle help command
      if (message.content.startsWith("!help")) {
        const helpEmbed = {
          color: 0x3498db,
          title: "🤖 Wren Ford - Personal Assistant",
          description:
            "I am Wren Ford, Sir Abdul Mukit's personal assistant and advisor. I am here to serve and guide you with wisdom and loyalty.",
          fields: [
            {
              name: "💬 Natural Conversation",
              value: "Engage in thoughtful dialogue and receive guidance",
              inline: true,
            },
            {
              name: "💻 Technical Assistance",
              value: "Programming, debugging, and technical solutions",
              inline: true,
            },
            {
              name: "🧠 Strategic Analysis",
              value: "Complex problem solving and business strategy",
              inline: true,
            },
            {
              name: "⚡ Quick Responses",
              value: "Fast answers to immediate questions",
              inline: true,
            },
            {
              name: "📄 Document Analysis",
              value: "Review files, images, and documents",
              inline: true,
            },
            {
              name: "🔧 Commands",
              value:
                "`!clear` - Clear conversation\n`!help` - Show this help\n`!time` or `!bdtime` - Show Bangladesh time",
              inline: false,
            },
          ],
        }
        await message.reply({ embeds: [helpEmbed] })
        return
      }

      // Handle Bangladesh time command
      if (message.content.startsWith("!time") || message.content.startsWith("!bdtime")) {
        const timeMessage = this.aiService.getBangladeshTime()
        const dayPeriod = this.aiService.getTimeOfDay()

        await message.reply(`🇧🇩 ${timeMessage}\n🌅 It's currently **${dayPeriod}** in Dhaka.`)
        return
      }

      // Check if bot is mentioned or it's a DM
      const isMentioned = message.mentions.has(this.client.user)
      const isDM = message.channel.type === 1

      if (!isMentioned && !isDM) return

      // Show typing indicator
      await message.channel.sendTyping()

      // Clean the message content
      let cleanContent = message.content.replace(/<@!?\d+>/g, "").trim()
      if (!cleanContent) {
        cleanContent = "Hello!"
      }

      // Get conversation history
      const conversationHistory = this.conversationManager.getConversation(message.author.id)

      const aiResponse = await this.aiService.generateResponse(cleanContent, conversationHistory, message)

      // Add messages to conversation history
      this.conversationManager.addMessage(message.author.id, "user", cleanContent)
      this.conversationManager.addMessage(message.author.id, "assistant", aiResponse.content)

      const embed = {
        color: aiResponse.color,
        description: aiResponse.content,
        timestamp: new Date().toISOString(),
        footer: {
          text: `${aiResponse.responseType} • ${aiResponse.timeOfDay}`,
        },
      }

      await message.reply({ embeds: [embed] })
    } catch (error) {
      console.error("Error handling message:", error)
      await message.reply("❌ I encountered an error processing your request. Please try again.")
    }
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN)
    } catch (error) {
      console.error("Failed to start bot:", error)
      process.exit(1)
    }
  }
}

// Start the bot
const aiBot = new MultiModelAIBot()
aiBot.start()
