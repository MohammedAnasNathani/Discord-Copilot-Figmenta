"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Brain, Trash2, RefreshCw, Clock, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function MemoryControl() {
  const { conversations, clearConversation, clearAllConversations, fetchConversations } = useAdminStore();
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Refresh conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleClearConversation = async (channelId: string, channelName: string) => {
    setIsClearing(true);
    await clearConversation(channelId);
    setIsClearing(false);
    toast.success(`Cleared memory for #${channelName}`);
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    await clearAllConversations();
    setIsClearing(false);
    setClearAllOpen(false);
    toast.success("All conversation memories cleared in database");
  };

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.message_count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-violet-500/10">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">Conversation Memory</h3>
                <p className="text-sm text-zinc-400">
                  {conversations.length} channels • {totalMessages} total messages
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchConversations()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    disabled={conversations.every(c => c.message_count === 0) || isClearing}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Clear All Memories?
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      This will reset the running summary for all channels in the database. The bot will lose context
                      of previous conversations and start fresh. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setClearAllOpen(false)}
                      className="border-zinc-700 text-zinc-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleClearAll}
                      disabled={isClearing}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isClearing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Clear All Memories
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100">Channel Memories</CardTitle>
          <CardDescription>
            Each channel maintains its own running summary of conversations. Data synced from Discord bot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversation memories yet</p>
              <p className="text-sm mt-1">Start chatting with the bot in Discord to see memories here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-zinc-100">
                          #{conv.channel_name}
                        </span>
                        <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {conv.message_count}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClearConversation(conv.channel_id, conv.channel_name)}
                          disabled={conv.message_count === 0 || isClearing}
                          className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Running Summary */}
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Running Summary</p>
                      {conv.running_summary ? (
                        <p className="text-sm text-zinc-300">{conv.running_summary}</p>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">No summary available yet</p>
                      )}
                    </div>

                    {/* Channel ID */}
                    <p className="text-xs text-zinc-600 mt-2 font-mono">
                      ID: {conv.channel_id}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
