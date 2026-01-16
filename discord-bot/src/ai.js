import { GoogleGenerativeAI } from "@google/generative-ai";

import { createClient } from "@supabase/supabase-js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Initialize Supabase (Optional)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// In-memory storage for conversation context
const conversationMemory = new Map();

// Default system instructions
const DEFAULT_SYSTEM = `You are a helpful AI assistant for the Figmenta team. 

Your role is to:
- Answer questions about projects and tasks
- Help with brainstorming and ideation
- Provide technical guidance when asked
- Be friendly and professional in all interactions

Guidelines:
- Keep responses concise unless asked for more detail
- Use markdown formatting when appropriate
- If you don't know something, say so honestly
- Reference previous conversation context when relevant`;

/**
 * Get or create conversation memory for a channel
 */
export async function getChannelMemory(channelId) {
  if (!conversationMemory.has(channelId)) {
    // Try to fetch from Supabase first
    if (supabase) {
      const { data } = await supabase
        .from("conversations")
        .select("messages, summary")
        .eq("channel_id", channelId)
        .single();
      
      if (data) {
        conversationMemory.set(channelId, {
          messages: data.messages || [],
          summary: data.summary || "",
          lastUpdated: Date.now(),
        });
        return conversationMemory.get(channelId);
      }
    }

    conversationMemory.set(channelId, {
      messages: [],
      summary: "",
      lastUpdated: Date.now(),
    });
  }
  return conversationMemory.get(channelId);
}

/**
 * Save memory to Supabase - matches Admin Dashboard schema
 */
async function persistMemory(channelId, channelName = "unknown") {
  if (!supabase) return;
  const memory = conversationMemory.get(channelId);
  if (!memory) return;

  try {
    // Generate a running summary from recent messages
    const runningSummary = memory.summary || 
      memory.messages.slice(-5).map(m => `${m.author}: ${m.content.substring(0, 50)}...`).join('\n');

    await supabase.from("conversations").upsert({
      channel_id: channelId,
      channel_name: channelName,
      running_summary: runningSummary,
      message_count: memory.messages.length,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'channel_id'
    });
    console.log(`[Memory] Persisted ${memory.messages.length} messages for #${channelName}`);
  } catch (error) {
    console.error("Supabase persist error:", error);
  }
}

/**
 * Fetch system instructions from Supabase
 */
async function getSystemInstructions() {
  if (!supabase) return DEFAULT_SYSTEM;
  
  try {
    const { data } = await supabase
      .from("bot_config")
      .select("system_instructions")
      .single();
      
    return data?.system_instructions || DEFAULT_SYSTEM;
  } catch {
    return DEFAULT_SYSTEM;
  }
}

/**
 * Add a message to channel memory
 */
export async function addToMemory(channelId, role, content, author = "", channelName = "unknown") {
  const memory = await getChannelMemory(channelId);
  memory.messages.push({
    role,
    content,
    author,
    timestamp: Date.now(),
  });

  // Keep only last 20 messages to avoid context overflow
  if (memory.messages.length > 20) {
    memory.messages = memory.messages.slice(-20);
  }

  memory.lastUpdated = Date.now();
  
  // Persist to Supabase with channel name
  await persistMemory(channelId, channelName);
}

/**
 * Clear memory for a channel
 */
export async function clearMemory(channelId) {
  conversationMemory.delete(channelId);
  if (supabase) {
    await supabase.from("conversations").delete().eq("channel_id", channelId);
  }
}

/**
 * Generate AI response
 */
export async function generateResponse(channelId, userMessage, userName, channelName = "unknown", _systemInstructions = null) {
  const memory = await getChannelMemory(channelId);
  
  // Fetch latest system instructions from Supabase (or use default)
  const systemInstructions = await getSystemInstructions();

  // Build context from memory
  const contextMessages = memory.messages
    .slice(-10) // Last 10 messages for context
    .map((m) => `${m.author || m.role}: ${m.content}`)
    .join("\n");

  const prompt = `${systemInstructions}

CONVERSATION CONTEXT:
${contextMessages || "No previous context."}

CURRENT MESSAGE FROM ${userName}:
${userMessage}

Respond naturally and helpfully. Keep your response under 2000 characters for Discord.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Add both messages to memory with channel name
    addToMemory(channelId, "user", userMessage, userName, channelName);
    addToMemory(channelId, "assistant", text, "Bot", channelName);

    // Update running summary periodically
    if (memory.messages.length % 5 === 0) {
      updateSummary(channelId);
    }

    return text;
  } catch (error) {
    console.error("AI generation error:", error);
    return "I'm having trouble processing that request. Please try again!";
  }
}

/**
 * Update conversation summary
 */
async function updateSummary(channelId) {
  const memory = await getChannelMemory(channelId);
  if (memory.messages.length < 5) return;

  const recentMessages = memory.messages
    .slice(-10)
    .map((m) => `${m.author || m.role}: ${m.content}`)
    .join("\n");

  try {
    const summaryPrompt = `Summarize this conversation in 2-3 sentences, focusing on key topics and decisions:

${recentMessages}

Summary:`;

    const result = await model.generateContent(summaryPrompt);
    const response = await result.response;
    memory.summary = response.text();
  } catch (error) {
    console.error("Summary generation error:", error);
  }
}

/**
 * Get all memories (for admin view)
 */
export function getAllMemories() {
  const memories = [];
  for (const [channelId, memory] of conversationMemory) {
    memories.push({
      channelId,
      messageCount: memory.messages.length,
      summary: memory.summary,
      lastUpdated: memory.lastUpdated,
    });
  }
  return memories;
}
