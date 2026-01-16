"use client";

import { useState, useEffect } from "react";
import { useAdminStore } from "@/lib/store";
import { RESPONSE_STYLES } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Save, RotateCcw, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SystemInstructions() {
  const { config, updateConfig, isSaving } = useAdminStore();
  
  // Local state for form fields
  const [localInstructions, setLocalInstructions] = useState("");
  const [localBotName, setLocalBotName] = useState("");
  const [localPersonality, setLocalPersonality] = useState("");
  const [localResponseStyle, setLocalResponseStyle] = useState("friendly");
  const [localMaxContext, setLocalMaxContext] = useState(10);

  // Sync with config when it loads
  useEffect(() => {
    if (config) {
      setLocalInstructions(config.system_instructions || "");
      setLocalBotName(config.bot_name || "");
      setLocalPersonality(config.personality || "");
      setLocalResponseStyle(config.response_style || "friendly");
      setLocalMaxContext(config.max_context_messages || 10);
    }
  }, [config]);

  const handleSave = async () => {
    await updateConfig({
      system_instructions: localInstructions,
      bot_name: localBotName,
      personality: localPersonality,
      response_style: localResponseStyle,
      max_context_messages: localMaxContext,
    });
    
    toast.success("Configuration saved to database!");
  };

  const handleReset = () => {
    if (config) {
      setLocalInstructions(config.system_instructions || "");
      setLocalBotName(config.bot_name || "");
      setLocalPersonality(config.personality || "");
      setLocalResponseStyle(config.response_style || "friendly");
      setLocalMaxContext(config.max_context_messages || 10);
    }
    toast.info("Reset to last saved configuration");
  };

  const hasChanges =
    localInstructions !== (config?.system_instructions || "") ||
    localBotName !== (config?.bot_name || "") ||
    localPersonality !== (config?.personality || "") ||
    localResponseStyle !== (config?.response_style || "friendly") ||
    localMaxContext !== (config?.max_context_messages || 10);

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
      {/* Bot Identity */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            Bot Identity
          </CardTitle>
          <CardDescription>Configure your bot's name and personality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="botName" className="text-zinc-300">Bot Name</Label>
              <Input
                id="botName"
                value={localBotName}
                onChange={(e) => setLocalBotName(e.target.value)}
                placeholder="Figmenta Copilot"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personality" className="text-zinc-300">Personality Traits</Label>
              <Input
                id="personality"
                value={localPersonality}
                onChange={(e) => setLocalPersonality(e.target.value)}
                placeholder="helpful, friendly, professional"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Response Style</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RESPONSE_STYLES) as Array<keyof typeof RESPONSE_STYLES>).map((style) => (
                <Badge
                  key={style}
                  variant="outline"
                  onClick={() => setLocalResponseStyle(style)}
                  className={`cursor-pointer transition-all ${
                    localResponseStyle === style
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/50"
                      : "text-zinc-400 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {RESPONSE_STYLES[localResponseStyle as keyof typeof RESPONSE_STYLES]}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Context Window (messages)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={1}
                max={50}
                value={localMaxContext}
                onChange={(e) => setLocalMaxContext(parseInt(e.target.value) || 10)}
                className="w-24 bg-zinc-800 border-zinc-700 text-zinc-100"
              />
              <span className="text-sm text-zinc-500">
                Bot will remember the last {localMaxContext} messages for context
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Instructions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            System Instructions
          </CardTitle>
          <CardDescription>
            Define how your bot should behave and respond. This is the &quot;brain&quot; of your bot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={localInstructions}
            onChange={(e) => setLocalInstructions(e.target.value)}
            placeholder="Enter system instructions for your bot...

Example:
You are Figmenta Copilot, an AI assistant for the team.
- Be helpful and professional
- Answer coding questions concisely
- Help with project management tasks
- Provide technical guidance when asked"
            className="min-h-[300px] bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm resize-none"
          />
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{localInstructions.length} characters</span>
            <span>Supports markdown formatting</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
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
      </div>
    </motion.div>
  );
}
