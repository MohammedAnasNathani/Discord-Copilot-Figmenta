"use client";

import { useAdminStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Clock, Zap, Settings, Activity, Terminal, Shield, Wifi, Cpu, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const BOOT_SEQUENCE = [
  "INITIALIZING KERNEL...",
  "LOADING NEURAL MODULES...",
  "ESTABLISHING SECURE UPLINK...",
  "CALIBRATING RESPONSE VECTORS...",
  "SYSTEM ONLINE."
];

export function DashboardOverview() {
  const { botStatus, conversations, config } = useAdminStore();
  const [booting, setBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (bootStep < BOOT_SEQUENCE.length) {
      const timeout = setTimeout(() => {
        setBootStep(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setBooting(false);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [bootStep]);

  if (booting) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center font-mono bg-black text-green-500 p-8 rounded-lg border border-green-900/30 relative overflow-hidden">
        <div className="w-full max-w-md space-y-2 z-10">
          {BOOT_SEQUENCE.slice(0, bootStep + 1).map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-green-700">{">"}</span>
              <span className={i === bootStep ? "animate-pulse" : "opacity-50"}>{step}</span>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
      </div>
    );
  }

  const stats = [
    {
      title: "SYSTEM STATUS",
      value: botStatus?.online ? "ONLINE" : "OFFLINE",
      icon: <Wifi className="w-4 h-4" />,
      color: botStatus?.online ? "text-emerald-400" : "text-rose-400",
      bgColor: botStatus?.online ? "bg-emerald-500/10" : "bg-rose-500/10",
      subtext: "PING: 24ms"
    },
    {
      title: "ACTIVE CHANNELS",
      value: String(config?.allowed_channels.length || 0).padStart(2, '0'),
      icon: <Activity className="w-4 h-4" />,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      subtext: "MONITORING"
    },
    {
      title: "PROCESSED MSGS",
      value: String(botStatus?.total_messages_processed || 0).padStart(4, '0'),
      icon: <Cpu className="w-4 h-4" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      subtext: "TOTAL THROUGHPUT"
    },
    {
      title: "CURRENT MODE",
      value: (config?.response_style || "STANDARD").toUpperCase(),
      icon: <Shield className="w-4 h-4" />,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      subtext: "AI CORE ACTIVE"
    },
  ];

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0 opacity-75" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          </div>
          <h2 className="text-xs font-mono text-emerald-500/80 tracking-widest">COMMAND CENTER // LIVE</h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 flex gap-4">
          <span>MEM: 24%</span>
          <span>CPU: 12%</span>
          <span>UPTIME: 14D 02H</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={cn(
              "relative bg-[#0A0A0B] border border-white/5 p-4 overflow-hidden group hover:border-white/10 transition-all",
              "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:transition-colors",
              stat.bgColor.replace("bg-", "before:bg-")
            )}>
              <div className="absolute top-2 right-2 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                {stat.icon}
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-mono font-bold text-zinc-500 tracking-widest mb-1">{stat.title}</p>
                <p className={cn("text-2xl font-mono font-medium tracking-tighter", stat.color)}>
                  {stat.value}
                </p>
                <div className="h-px w-full bg-white/5 my-2" />
                <p className="text-[9px] text-zinc-600 font-mono flex items-center gap-1">
                  <span className={stat.color}>●</span> {stat.subtext}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal */}
        <Card className="lg:col-span-2 bg-black border-white/10 font-mono text-sm overflow-hidden flex flex-col h-[400px] shadow-2xl">
          <CardHeader className="bg-white/5 border-b border-white/5 py-2 px-3 h-10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              SYSTEM_LOGS
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto text-xs bg-black relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] pointer-events-none bg-[length:100%_2px]" />
            {conversations.length > 0 ? (
              <div className="p-4 space-y-1 relative z-10">
                {conversations.map((conv) => (
                  <div key={conv.id} className="group flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors -mx-1">
                    <span className="text-zinc-600 shrink-0 select-none">
                      [{formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}]
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">root</span>
                        <span className="text-zinc-700">@</span>
                        <span className="text-cyan-500">discord</span>
                        <span className="text-zinc-700">:</span>
                        <span className="text-violet-400">~{conv.channel_name}</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed opacity-80 group-hover:opacity-100">
                        {">"} {conv.running_summary || "Tracking active conversation context..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-2 relative z-10">
                <Activity className="w-8 h-8 opacity-20 animate-pulse" />
                <p>WAITING FOR UPLINK...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Config */}
        <Card className="bg-[#050505] border-white/10 h-full">
          <CardHeader className="border-b border-white/5 py-3 px-4">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] tracking-wider font-mono uppercase">
              <Settings className="w-3.5 h-3.5" />
              CONFIG_VARS
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Identity</label>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm group hover:border-emerald-500/30 transition-colors">
                <span className="text-xs font-mono text-zinc-300 font-bold">{config?.bot_name}</span>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[9px] rounded-none">ACTIVE</Badge>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Core Directive</label>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm min-h-[100px] relative overflow-hidden">
                <p className="text-[10px] text-zinc-400 font-mono leading-relaxed relative z-10 line-clamp-4">
                  {config?.system_instructions || "NO_DIRECTIVE_SET"}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#050505] to-transparent z-20" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Parameters</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-white/5 rounded-sm text-center">
                  <span className="block text-[9px] text-zinc-600 mb-1">CTX_WIN</span>
                  <span className="text-xs font-mono text-cyan-500">{config?.max_context_messages}</span>
                </div>
                <div className="p-2 border border-white/5 rounded-sm text-center">
                  <span className="block text-[9px] text-zinc-600 mb-1">MODEL</span>
                  <span className="text-xs font-mono text-violet-500">GEMINI</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[9px] text-zinc-600 font-mono">
                <span>SECURE CONNECTION</span>
                <Lock className="w-3 h-3 text-emerald-900" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
