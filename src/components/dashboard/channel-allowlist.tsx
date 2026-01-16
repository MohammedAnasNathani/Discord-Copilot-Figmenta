"use client";

import { useState, useEffect } from "react";
import { useAdminStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Plus, X, Save, Loader2, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function ChannelAllowlist() {
  const { config, updateConfig, isSaving } = useAdminStore();
  const [newChannelId, setNewChannelId] = useState("");
  const [channels, setChannels] = useState<string[]>([]);

  // Sync with config when it loads
  useEffect(() => {
    if (config?.allowed_channels) {
      setChannels(config.allowed_channels);
    }
  }, [config?.allowed_channels]);

  const handleAddChannel = () => {
    if (!newChannelId.trim()) {
      toast.error("Please enter a channel ID");
      return;
    }

    if (!/^\d+$/.test(newChannelId)) {
      toast.error("Channel ID must be a number");
      return;
    }

    if (channels.includes(newChannelId)) {
      toast.error("Channel already added");
      return;
    }

    setChannels([...channels, newChannelId]);
    setNewChannelId("");
    toast.success("Channel added to allowlist (save to persist)");
  };

  const handleRemoveChannel = (channelId: string) => {
    setChannels(channels.filter((id) => id !== channelId));
    toast.info("Channel removed (save to persist)");
  };

  const handleSave = async () => {
    await updateConfig({ allowed_channels: channels });
    toast.success("Channel allowlist saved to database!");
  };

  const hasChanges = JSON.stringify(channels) !== JSON.stringify(config?.allowed_channels || []);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* How to get Channel ID */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-300">How to get a Discord Channel ID</h4>
              <ol className="text-sm text-blue-200/70 mt-2 space-y-1 list-decimal list-inside">
                <li>Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)</li>
                <li>Right-click on the channel you want to add</li>
                <li>Click &quot;Copy Channel ID&quot;</li>
                <li>Paste the ID below</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Channel */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <Hash className="w-5 h-5 text-violet-400" />
            Channel Allowlist
          </CardTitle>
          <CardDescription>
            The bot will only respond to messages in these channels (or when @mentioned)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter Discord Channel ID (e.g., 1234567890123456789)"
                value={newChannelId}
                onChange={(e) => setNewChannelId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChannel()}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <Button
              onClick={handleAddChannel}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Channel List */}
          <div className="space-y-2">
            <Label className="text-zinc-400">Allowed Channels ({channels.length})</Label>
            
            {channels.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-700 rounded-lg">
                <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No channels added yet</p>
                <p className="text-sm">Add channel IDs where the bot should respond</p>
              </div>
            ) : (
              <div className="grid gap-2">
                <AnimatePresence mode="popLayout">
                  {channels.map((channelId) => (
                    <motion.div
                      key={channelId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Hash className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-zinc-200">{channelId}</p>
                          <p className="text-xs text-zinc-500">Channel ID</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveChannel(channelId)}
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          {hasChanges ? (
            <span className="text-amber-400">● Unsaved changes</span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> All changes saved
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save to Database
        </Button>
      </div>
    </motion.div>
  );
}
