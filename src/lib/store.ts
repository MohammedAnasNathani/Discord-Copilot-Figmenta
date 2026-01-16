import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BotConfig, Conversation, KnowledgeDoc, BotStatus, DEFAULT_BOT_CONFIG } from "./types";
import { createClient } from "./supabase";

interface AdminState {
    // Config
    config: BotConfig | null;
    isConfigLoading: boolean;

    // Conversations
    conversations: Conversation[];

    // Knowledge Base (optional)
    knowledgeDocs: KnowledgeDoc[];

    // Bot Status
    botStatus: BotStatus | null;

    // UI State
    activeTab: "instructions" | "channels" | "memory" | "knowledge";
    isSaving: boolean;

    // Actions
    fetchConfig: () => Promise<void>;
    setConfig: (config: BotConfig) => void;
    updateConfig: (updates: Partial<BotConfig>) => Promise<void>;
    fetchConversations: () => Promise<void>;
    setConversations: (conversations: Conversation[]) => void;
    clearConversation: (channelId: string) => Promise<void>;
    clearAllConversations: () => Promise<void>;
    fetchKnowledgeDocs: () => Promise<void>;
    addKnowledgeDoc: (doc: Omit<KnowledgeDoc, "id">) => Promise<void>;
    removeKnowledgeDoc: (id: string) => Promise<void>;
    setBotStatus: (status: BotStatus) => void;
    setActiveTab: (tab: AdminState["activeTab"]) => void;
    setIsSaving: (saving: boolean) => void;
    setIsConfigLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            // Initial state
            config: null,
            isConfigLoading: true,
            conversations: [],
            knowledgeDocs: [],
            botStatus: {
                online: true,
                last_heartbeat: new Date().toISOString(),
                total_messages_processed: 0,
                active_channels: 0,
            },
            activeTab: "instructions",
            isSaving: false,

            // Fetch config from Supabase
            fetchConfig: async () => {
                set({ isConfigLoading: true });
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from("bot_config")
                        .select("*")
                        .limit(1)
                        .single();

                    if (error) {
                        console.error("Error fetching config:", error);
                        // Use default config if no data
                        set({
                            config: { id: "local", ...DEFAULT_BOT_CONFIG, updated_at: new Date().toISOString() },
                            isConfigLoading: false
                        });
                        return;
                    }

                    set({
                        config: {
                            id: data.id,
                            bot_name: data.bot_name || "Figmenta Copilot",
                            personality: data.personality || "helpful, friendly",
                            response_style: data.response_style || "conversational",
                            system_instructions: data.system_instructions || "",
                            allowed_channels: data.allowed_channels || [],
                            max_context_messages: data.max_context_messages || 10,
                            updated_at: data.updated_at,
                        },
                        isConfigLoading: false
                    });
                } catch (err) {
                    console.error("Fetch config error:", err);
                    set({
                        config: { id: "local", ...DEFAULT_BOT_CONFIG, updated_at: new Date().toISOString() },
                        isConfigLoading: false
                    });
                }
            },

            setConfig: (config) => set({ config }),

            // Update config in Supabase
            updateConfig: async (updates) => {
                const currentConfig = get().config;
                if (!currentConfig) return;

                set({ isSaving: true });

                const newConfig = {
                    ...currentConfig,
                    ...updates,
                    updated_at: new Date().toISOString()
                };

                // Optimistically update local state
                set({ config: newConfig });

                try {
                    const supabase = createClient();

                    // Update existing config by ID
                    const { error } = await supabase
                        .from("bot_config")
                        .update({
                            bot_name: newConfig.bot_name,
                            personality: newConfig.personality,
                            response_style: newConfig.response_style,
                            system_instructions: newConfig.system_instructions,
                            allowed_channels: newConfig.allowed_channels,
                            max_context_messages: newConfig.max_context_messages,
                            updated_at: newConfig.updated_at,
                        })
                        .eq("id", currentConfig.id);

                    if (error) {
                        console.error("Error saving config:", error);
                    }
                } catch (err) {
                    console.error("Save config error:", err);
                } finally {
                    set({ isSaving: false });
                }
            },

            // Fetch conversations from Supabase
            fetchConversations: async () => {
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from("conversations")
                        .select("*")
                        .order("last_message_at", { ascending: false });

                    if (error) {
                        console.error("Error fetching conversations:", error);
                        return;
                    }

                    const convs = data?.map(conv => ({
                        id: conv.id,
                        channel_id: conv.channel_id,
                        channel_name: conv.channel_name || "unknown",
                        running_summary: conv.running_summary || "",
                        message_count: conv.message_count || 0,
                        last_message_at: conv.last_message_at,
                        updated_at: conv.updated_at,
                    })) || [];

                    set({
                        conversations: convs,
                        botStatus: {
                            ...get().botStatus!,
                            online: true,
                            active_channels: convs.length,
                            total_messages_processed: convs.reduce((sum, c) => sum + c.message_count, 0),
                        }
                    });
                } catch (err) {
                    console.error("Fetch conversations error:", err);
                }
            },

            setConversations: (conversations) => set({ conversations }),

            // Clear single conversation
            clearConversation: async (channelId) => {
                try {
                    const supabase = createClient();
                    const { error } = await supabase
                        .from("conversations")
                        .update({
                            running_summary: "",
                            message_count: 0,
                            updated_at: new Date().toISOString()
                        })
                        .eq("channel_id", channelId);

                    if (error) {
                        console.error("Error clearing conversation:", error);
                        return;
                    }

                    // Update local state
                    set((state) => ({
                        conversations: state.conversations.map((conv) =>
                            conv.channel_id === channelId
                                ? { ...conv, running_summary: "", message_count: 0, updated_at: new Date().toISOString() }
                                : conv
                        ),
                    }));
                } catch (err) {
                    console.error("Clear conversation error:", err);
                }
            },

            // Clear all conversations
            clearAllConversations: async () => {
                try {
                    const supabase = createClient();
                    const { error } = await supabase
                        .from("conversations")
                        .update({
                            running_summary: "",
                            message_count: 0,
                            updated_at: new Date().toISOString()
                        })
                        .neq("id", "00000000-0000-0000-0000-000000000000"); // Match all

                    if (error) {
                        console.error("Error clearing all:", error);
                        return;
                    }

                    set((state) => ({
                        conversations: state.conversations.map((conv) => ({
                            ...conv,
                            running_summary: "",
                            message_count: 0,
                            updated_at: new Date().toISOString(),
                        })),
                    }));
                } catch (err) {
                    console.error("Clear all conversations error:", err);
                }
            },

            // Fetch knowledge docs
            fetchKnowledgeDocs: async () => {
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from("knowledge_docs")
                        .select("*")
                        .order("uploaded_at", { ascending: false });

                    if (error) {
                        console.error("Error fetching docs:", error);
                        return;
                    }

                    set({
                        knowledgeDocs: data?.map(doc => ({
                            id: doc.id,
                            name: doc.name,
                            size: doc.file_size || 0,
                            chunks: doc.chunk_count || 0,
                            uploaded_at: doc.uploaded_at,
                        })) || []
                    });
                } catch (err) {
                    console.error("Fetch docs error:", err);
                }
            },

            addKnowledgeDoc: async (doc) => {
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from("knowledge_docs")
                        .insert({
                            name: doc.name,
                            file_size: doc.size,
                            chunk_count: doc.chunks,
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error("Error adding doc:", error);
                        return;
                    }

                    set((state) => ({
                        knowledgeDocs: [{
                            id: data.id,
                            name: data.name,
                            size: data.file_size,
                            chunks: data.chunk_count,
                            uploaded_at: data.uploaded_at,
                        }, ...state.knowledgeDocs],
                    }));
                } catch (err) {
                    console.error("Add doc error:", err);
                }
            },

            removeKnowledgeDoc: async (id) => {
                try {
                    const supabase = createClient();
                    const { error } = await supabase
                        .from("knowledge_docs")
                        .delete()
                        .eq("id", id);

                    if (error) {
                        console.error("Error removing doc:", error);
                        return;
                    }

                    set((state) => ({
                        knowledgeDocs: state.knowledgeDocs.filter((doc) => doc.id !== id),
                    }));
                } catch (err) {
                    console.error("Remove doc error:", err);
                }
            },

            setBotStatus: (botStatus) => set({ botStatus }),

            setActiveTab: (activeTab) => set({ activeTab }),

            setIsSaving: (isSaving) => set({ isSaving }),

            setIsConfigLoading: (isConfigLoading) => set({ isConfigLoading }),
        }),
        {
            name: "discord-copilot-admin",
            partialize: (state) => ({
                activeTab: state.activeTab,
            }),
        }
    )
);
