# Multi-Model AI Discord Bot

A sophisticated Discord bot that intelligently routes different types of tasks to the most appropriate AI model from OpenRouter's free tier. The bot operates as a single seamless AI assistant while internally using 5 specialized models for optimal performance.

## AI Models & Specializations

### 1. **DeepSeek V3** - Smooth Conversationalist
- **Use Case**: Multi-turn chat, natural dialogue, Q&A
- **Best For**: Discord interactions, maintaining coherent conversations
- **Context Window**: ~128K tokens

### 2. **Qwen 3 Coder** - Technical & Code Wizard  
- **Use Case**: Code generation, debugging, technical reasoning
- **Best For**: Programming tasks, scripts, automation, technical explanations
- **Context Window**: ~84.9K tokens

### 3. **MoonshotAI Kimi Dev 72B** - Deep Reasoner
- **Use Case**: Complex reasoning, logic problems, strategic planning
- **Best For**: Research-level tasks, math, multi-step problem solving
- **Context Window**: ~72K tokens

### 4. **Mistral Small 3.2 24B** - Speed Demon
- **Use Case**: Ultra-fast responses for lightweight tasks
- **Best For**: Rapid replies, repetitive tasks, high-frequency commands
- **Context Window**: ~96K tokens

### 5. **Qwen 2.5 VL 32B** - Multimodal Master
- **Use Case**: Text and image input, document processing
- **Best For**: File analysis, visual content, PDFs, document tasks
- **Context Window**: Large multimodal support

## Features

- **Intelligent Task Routing**: Automatically detects task type and selects optimal model
- **Natural Interaction**: No slash commands needed - just mention or DM the bot
- **Conversation Memory**: Maintains context per user across conversations
- **Rich Discord Integration**: Color-coded embeds, typing indicators, proper formatting
- **Web Server**: Minimal Express.js server for uptime monitoring (empty white page)
- **Multi-User Support**: Handles multiple Discord users simultaneously

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
\`\`\`env
DISCORD_TOKEN=your_discord_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key
SITE_URL=https://your-site.com
SITE_NAME=Multi-Model AI Bot
PORT=3000
\`\`\`

### 3. Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token to your `.env` file
5. Enable "Message Content Intent" in bot settings
6. Invite bot to your server with appropriate permissions

### 4. Run the Bot
\`\`\`bash
npm start
\`\`\`

For development with auto-restart:
\`\`\`bash
npm run dev
\`\`\`

## Usage

### Commands
- `!help` - Show bot capabilities and model information
- `!clear` - Clear conversation history

### Natural Interaction Examples

**Conversational Tasks** (DeepSeek V3):
- "How are you today?"
- "Tell me about artificial intelligence"
- "What's your opinion on climate change?"

**Coding Tasks** (Qwen 3 Coder):
- "Write a Python function to sort a list"
- "Debug this JavaScript code: [code]"
- "Explain how React hooks work"

**Complex Reasoning** (Kimi Dev 72B):
- "Analyze the pros and cons of remote work"
- "Solve this logic puzzle step by step"
- "Create a business strategy for a startup"

**Quick Tasks** (Mistral Small):
- "What is the capital of France?"
- "Define machine learning"
- "Convert 100 USD to EUR"

**File/Image Analysis** (Qwen 2.5 VL):
- Upload an image: "What's in this picture?"
- Share a document: "Summarize this PDF"
- "Extract text from this screenshot"

## Deployment

### Replit
1. Import this repository to Replit
2. Set environment variables in Replit's secrets
3. Run the project

### Railway/Render
1. Connect your GitHub repository
2. Set environment variables in platform settings
3. Deploy with Node.js buildpack

### Local Development
\`\`\`bash
git clone <repository>
cd multi-model-ai-discord-bot
npm install
# Set up .env file
npm run dev
\`\`\`

## Technical Architecture

- **Task Detection**: Analyzes user input to determine optimal model
- **Model Routing**: Automatically selects appropriate AI model based on task type
- **Context Management**: Maintains conversation history per user (last 10 messages)
- **Error Handling**: Graceful fallbacks and error recovery
- **Web Interface**: Empty white page at root for uptime monitoring
- **Discord Integration**: Full support for mentions, DMs, embeds, and rich formatting

## Model Selection Logic

The bot automatically routes tasks based on keywords and context:
- **Code keywords**: "code", "programming", "debug", "function", etc. → Qwen 3 Coder
- **Reasoning keywords**: "analyze", "solve", "logic", "strategy", etc. → Kimi Dev 72B  
- **Speed keywords**: "quick", "define", "what is", short messages → Mistral Small
- **File attachments**: Images, documents → Qwen 2.5 VL
- **Default**: Natural conversation → DeepSeek V3

## License

MIT License - Feel free to modify and distribute.
