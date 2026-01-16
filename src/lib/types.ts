// Bot configuration
export interface BotConfig {
    id: string;
    system_instructions: string;
    allowed_channels: string[];
    bot_name: string;
    personality: string;
    response_style: string;
    max_context_messages: number;
    updated_at: string;
}

// Conversation memory
export interface Conversation {
    id: string;
    channel_id: string;
    channel_name: string;
    running_summary: string;
    message_count: number;
    last_message_at: string;
    updated_at: string;
}

// Knowledge document (for optional RAG)
export interface KnowledgeDoc {
    id: string;
    name: string;
    size: number;
    chunks: number;
    uploaded_at: string;
}

// Bot status
export interface BotStatus {
    online: boolean;
    last_heartbeat: string;
    total_messages_processed: number;
    active_channels: number;
}

// Default configuration
export const DEFAULT_BOT_CONFIG: Omit<BotConfig, "id" | "updated_at"> = {
    system_instructions: `You are a helpful AI assistant for the Figmenta team. 

Your role is to:
- Answer questions about projects and tasks
- Help with brainstorming and ideation
- Provide technical guidance when asked
- Be friendly and professional in all interactions

Guidelines:
- Keep responses concise unless asked for more detail
- Use markdown formatting when appropriate
- If you don't know something, say so honestly
- Reference previous conversation context when relevant`,
    allowed_channels: [],
    bot_name: "Figmenta Copilot",
    personality: "helpful, friendly, professional",
    response_style: "friendly",
    max_context_messages: 10,
};

// Response style descriptions
export const RESPONSE_STYLES: Record<string, string> = {
    concise: "Brief, to-the-point responses",
    detailed: "Comprehensive, thorough explanations",
    friendly: "Warm, conversational tone",
    professional: "Formal, business-appropriate language",
    conversational: "Natural, casual dialogue style",
};
