"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardOverview } from "@/components/dashboard/overview";
import { SystemInstructions } from "@/components/dashboard/system-instructions";
import { ChannelAllowlist } from "@/components/dashboard/channel-allowlist";
import { MemoryControl } from "@/components/dashboard/memory-control";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, FileText, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminStore } from "@/lib/store";
import { toast } from "sonner";

type NavId = "overview" | "instructions" | "channels" | "memory" | "knowledge";

const PAGE_TITLES: Record<NavId, { title: string; description: string }> = {
  overview: {
    title: "Dashboard Overview",
    description: "Monitor your bot's status and activity",
  },
  instructions: {
    title: "System Instructions",
    description: "Configure your bot's personality and behavior",
  },
  channels: {
    title: "Channel Allowlist",
    description: "Control where your bot can respond",
  },
  memory: {
    title: "Memory Control",
    description: "View and manage conversation memories",
  },
  knowledge: {
    title: "Knowledge Base",
    description: "Upload documents for RAG-powered responses",
  },
};

// Knowledge Base Component
function KnowledgeBase() {
  const { knowledgeDocs, addKnowledgeDoc, removeKnowledgeDoc, fetchKnowledgeDocs } = useAdminStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchKnowledgeDocs();
  }, [fetchKnowledgeDocs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast.error("Please upload a PDF, TXT, or MD file");
      return;
    }

    setIsUploading(true);
    
    await addKnowledgeDoc({
      name: file.name,
      size: file.size,
      chunks: Math.ceil(file.size / 1000),
      uploaded_at: new Date().toISOString(),
    });
    
    toast.success(`Uploaded: ${file.name}`);
    setIsUploading(false);
    e.target.value = '';
  };

  const handleRemove = async (id: string, name: string) => {
    await removeKnowledgeDoc(id);
    toast.success(`Removed: ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-200">Document Upload</h3>
                <p className="text-sm text-zinc-500">Upload PDFs or text files for the bot to reference</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Connected to Supabase
            </Badge>
          </div>
          
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-violet-500/50 hover:bg-zinc-800/50 transition-all">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-sm text-zinc-400">Click to upload PDF, TXT, or MD files</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <h3 className="font-medium text-zinc-200 mb-4">Uploaded Documents ({knowledgeDocs.length})</h3>
          
          {knowledgeDocs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No documents uploaded yet</p>
              <p className="text-sm text-zinc-600 mt-1">Upload PDFs or text files to enhance bot responses</p>
            </div>
          ) : (
            <div className="space-y-2">
              {knowledgeDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-violet-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{doc.name}</p>
                      <p className="text-xs text-zinc-500">
                        {(doc.size / 1024).toFixed(1)} KB • {doc.chunks} chunks
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(doc.id, doc.name)}
                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-blue-300">
            <strong>How RAG works:</strong> When enabled, the bot will search through your uploaded 
            documents to find relevant context before responding. This allows the bot to answer 
            questions about specific topics or reference internal documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const { fetchConfig, fetchConversations, isConfigLoading } = useAdminStore();
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const pageInfo = PAGE_TITLES[activeNav];

  // Fetch data on mount
  useEffect(() => {
    fetchConfig();
    fetchConversations();
  }, [fetchConfig, fetchConversations]);

  const renderContent = () => {
    if (isConfigLoading && activeNav !== "knowledge") {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-4" />
            <p className="text-zinc-400">Loading from Supabase...</p>
          </div>
        </div>
      );
    }

    switch (activeNav) {
      case "overview":
        return <DashboardOverview />;
      case "instructions":
        return <SystemInstructions />;
      case "channels":
        return <ChannelAllowlist />;
      case "memory":
        return <MemoryControl />;
      case "knowledge":
        return <KnowledgeBase />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center px-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{pageInfo.title}</h1>
            <p className="text-sm text-zinc-500">{pageInfo.description}</p>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
