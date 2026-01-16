import "dotenv/config";
import "./keep_alive.js";
import { Client, GatewayIntentBits, Events, REST, Routes, ActivityType } from "discord.js";
import { generateResponse, clearMemory, getAllMemories } from "./ai.js";

// Bot configuration
const config = {
  // Channels the bot is allowed to respond in (empty = all channels)
  allowedChannels: process.env.ALLOWED_CHANNELS?.split(",").filter(Boolean) || [],
  // Bot name
  botName: process.env.BOT_NAME || "Figmenta Copilot",
  // System instructions
  systemInstructions: process.env.SYSTEM_INSTRUCTIONS || null,
};

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Bot ready event
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ ${config.botName} is online!`);
  console.log(`📊 Logged in as ${readyClient.user.tag}`);
  console.log(`🏠 Serving ${readyClient.guilds.cache.size} servers`);
  
  if (config.allowedChannels.length > 0) {
    console.log(`🔒 Allowed channels: ${config.allowedChannels.join(", ")}`);
  } else {
    console.log(`🔓 Responding in all channels (no restrictions)`);
  }

  // Set bot activity
  readyClient.user.setActivity("for @mentions", { type: ActivityType.Watching });
});

// Message handler
client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Check if bot is mentioned or it's a DM
  const isMentioned = message.mentions.has(client.user);
  const isDM = !message.guild;

  // If not mentioned and not DM, check if channel is allowed
  if (!isMentioned && !isDM) {
    // If allowed channels are set and this channel isn't in the list, ignore
    if (config.allowedChannels.length > 0 && !config.allowedChannels.includes(message.channel.id)) {
      return;
    }
    // If no allowed channels set but not mentioned, ignore
    if (config.allowedChannels.length === 0) {
      return;
    }
  }

  // Get the message content (remove mention if present)
  let content = message.content.replace(/<@!?\d+>/g, "").trim();

  // If empty after removing mention, send help
  if (!content) {
    content = "Hello! How can you help me?";
  }

  // Special commands
  if (content.toLowerCase() === "!clear" || content.toLowerCase() === "clear memory") {
    await clearMemory(message.channel.id);
    await message.reply("🧹 Memory cleared for this channel!");
    return;
  }

  if (content.toLowerCase() === "!status" || content.toLowerCase() === "status") {
    const memories = getAllMemories();
    const channelMemory = memories.find((m) => m.channelId === message.channel.id);
    
    let statusMessage = `**🤖 ${config.botName} Status**\n`;
    statusMessage += `• Uptime: ${formatUptime(client.uptime)}\n`;
    statusMessage += `• Servers: ${client.guilds.cache.size}\n`;
    
    if (channelMemory) {
      statusMessage += `• This channel: ${channelMemory.messageCount} messages in memory\n`;
      if (channelMemory.summary) {
        statusMessage += `• Summary: ${channelMemory.summary.slice(0, 200)}...`;
      }
    } else {
      statusMessage += `• This channel: No conversation history yet`;
    }
    
    await message.reply(statusMessage);
    return;
  }

  // Show typing indicator
  await message.channel.sendTyping();

  try {
    // Generate AI response with channel name for memory tracking
    const response = await generateResponse(
      message.channel.id,
      content,
      message.author.username,
      message.channel.name || "dm",
      config.systemInstructions
    );

    // Discord has a 2000 character limit
    if (response.length > 2000) {
      // Split into multiple messages
      const chunks = splitMessage(response, 2000);
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(response);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    await message.reply("Sorry, I encountered an error. Please try again!");
  }
});

// Error handling
client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

// Helper functions
function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(" ") || "0s";
}

function splitMessage(text, maxLength) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Try to split at a natural break point
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks;
}

// Login
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("❌ DISCORD_TOKEN not found in environment variables!");
  console.log("\n📋 Setup Instructions:");
  console.log("1. Copy env.example to .env");
  console.log("2. Add your Discord bot token from Discord Developer Portal");
  console.log("3. Add your Gemini API key");
  console.log("4. Run: npm start\n");
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment variables!");
  process.exit(1);
}

console.log(`🚀 Starting ${config.botName}...`);
client.login(token);
