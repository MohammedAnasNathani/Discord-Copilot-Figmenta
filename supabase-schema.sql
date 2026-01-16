-- =====================================================
-- BRIEF 1: DISCORD COPILOT - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS knowledge_docs;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS bot_config;

-- Bot Configuration Table
CREATE TABLE bot_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_name TEXT DEFAULT 'Figmenta Copilot',
    personality TEXT DEFAULT 'helpful, friendly, professional',
    response_style TEXT DEFAULT 'conversational',
    system_instructions TEXT DEFAULT 'You are Figmenta Copilot, a helpful AI assistant for the Figmenta team. Be concise, helpful, and professional. Help with coding questions, project management, and general inquiries.',
    allowed_channels TEXT[] DEFAULT ARRAY[]::TEXT[],
    max_context_messages INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations Table (tracks running summaries per channel)
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id TEXT UNIQUE NOT NULL,
    channel_name TEXT DEFAULT 'unknown',
    running_summary TEXT DEFAULT '',
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Documents Table (for optional RAG)
CREATE TABLE knowledge_docs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT,
    chunk_count INTEGER DEFAULT 0,
    file_size INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO bot_config (bot_name, personality, response_style, system_instructions, max_context_messages)
VALUES (
    'Figmenta Copilot',
    'helpful, friendly, professional',
    'conversational',
    'You are Figmenta Copilot, a helpful AI assistant for the Figmenta team. Be concise, helpful, and professional. Help with coding questions, project management, and general inquiries.',
    10
);

-- Enable Row Level Security
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
DROP POLICY IF EXISTS "Allow all access to bot_config" ON bot_config;
DROP POLICY IF EXISTS "Allow all access to conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all access to knowledge_docs" ON knowledge_docs;

CREATE POLICY "Allow all access to bot_config" ON bot_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to knowledge_docs" ON knowledge_docs FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- =====================================================
