
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Flame, Star } from "lucide-react";
import type { UserStats } from "@shared/schema";

const RANK_INFO: Record<string, { label: string; color: string; next: number; icon: string }> = {
  academy: { label: "Academy Student", color: "text-neutral-400", next: 100, icon: "📖" },
  genin: { label: "Genin", color: "text-green-400", next: 500, icon: "🥋" },
  chunin: { label: "Chunin", color: "text-blue-400", next: 1500, icon: "🎯" },
  jonin: { label: "Jonin", color: "text-purple-400", next: 3000, icon: "⚡" },
  anbu: { label: "ANBU", color: "text-red-400", next: 5000, icon: "🗡️" },
  kage: { label: "Kage", color: "text-yellow-400", next: 99999, icon: "👑" },
};

const RANK_ORDER = ["academy", "genin", "chunin", "jonin", "anbu", "kage"];

export function NinjaXPBar() {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (!stats) return null;

  const rank = stats.ninjaRank || "academy";
  const info = RANK_INFO[rank] || RANK_INFO.academy;
  const currentIdx = RANK_ORDER.indexOf(rank);
  const prevThreshold = currentIdx > 0 ? RANK_INFO[RANK_ORDER[currentIdx - 1]]?.next || 0 : 0;
  const progressInRank = stats.totalXp - prevThreshold;
  const rankRange = info.next - prevThreshold;
  const pct = rank === "kage" ? 100 : Math.min(100, Math.max(0, (progressInRank / rankRange) * 100));

  return (
    <div className="flex items-center gap-4 bg-neutral-800/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-neutral-700/50" data-testid="xp-bar">
      <div className="flex items-center gap-2">
        <span className="text-lg">{info.icon}</span>
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest ${info.color}`}>{info.label}</span>
          <span className="text-[8px] font-mono text-neutral-500">{stats.totalXp} XP</span>
        </div>
      </div>

      <div className="flex-1 min-w-[100px]">
        <div className="h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700/30">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        {rank !== "kage" && (
          <span className="text-[7px] text-neutral-600 font-mono mt-0.5 block text-right">
            {info.next - stats.totalXp} XP to next rank
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 border-l border-neutral-700/50 pl-3">
        <div className="flex flex-col items-center">
          <Flame className="h-3 w-3 text-orange-400" />
          <span className="text-[10px] font-bold text-white">{stats.currentStreak}</span>
          <span className="text-[6px] text-neutral-600 uppercase">Streak</span>
        </div>
        <div className="flex flex-col items-center">
          <Trophy className="h-3 w-3 text-yellow-400" />
          <span className="text-[10px] font-bold text-white">{stats.totalCompleted}</span>
          <span className="text-[6px] text-neutral-600 uppercase">Done</span>
        </div>
      </div>
    </div>
  );
}

export function NinjaQuickStats() {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  if (!stats) return null;

  const rank = stats.ninjaRank || "academy";
  const info = RANK_INFO[rank] || RANK_INFO.academy;

  return (
    <div className="bg-neutral-900 border border-primary/30 rounded-xl p-4 shadow-lg" data-testid="quick-stats">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-4">
        <Star className="h-5 w-5" />
        NINJA PROFILE
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Rank</span>
          <span className={`text-sm font-black uppercase ${info.color}`}>
            {info.icon} {info.label}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Total XP</span>
          <span className="text-sm font-mono font-bold text-primary">{stats.totalXp}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Current Streak</span>
          <span className="text-sm font-bold text-orange-400">
            {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''} 🔥
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Best Streak</span>
          <span className="text-sm font-bold text-yellow-400">{stats.longestStreak} days</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Missions Done</span>
          <span className="text-sm font-bold text-green-400">{stats.totalCompleted}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Missions Created</span>
          <span className="text-sm font-bold text-blue-400">{stats.totalCreated}</span>
        </div>
      </div>
    </div>
  );
}
