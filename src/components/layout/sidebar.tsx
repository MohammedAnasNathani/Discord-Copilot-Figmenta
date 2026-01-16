"use client";

import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Settings,
  Hash,
  Brain,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "instructions", label: "System Instructions", icon: Settings },
  { id: "channels", label: "Channel Allowlist", icon: Hash },
  { id: "memory", label: "Memory Control", icon: Brain },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
] as const;

type NavId = typeof NAV_ITEMS[number]["id"];

interface SidebarProps {
  activeNav: NavId;
  onNavChange: (nav: NavId) => void;
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const { botStatus, config } = useAdminStore();

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-100">Discord Copilot</h1>
            <p className="text-xs text-zinc-500">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Bot Status */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Radio className={cn(
              "w-4 h-4",
              botStatus?.online ? "text-green-400" : "text-red-400"
            )} />
            <span className="text-sm text-zinc-300">Bot Status</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              botStatus?.online
                ? "text-green-400 border-green-500/30 bg-green-500/10"
                : "text-red-400 border-red-500/30 bg-red-500/10"
            )}
          >
            {botStatus?.online ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                isActive
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.id === "knowledge" && (
                <Badge variant="outline" className="ml-auto text-[10px] text-zinc-500 border-zinc-700">
                  Optional
                </Badge>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 mb-3">
          <p className="font-medium text-zinc-400">{config?.bot_name}</p>
          <p className="mt-1">{config?.allowed_channels.length} channels allowed</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
