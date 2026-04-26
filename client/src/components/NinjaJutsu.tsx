import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Scroll } from "lucide-react";
import type { UserStats } from "@shared/schema";

const RANK_ORDER = ["academy", "genin", "chunin", "jonin", "anbu", "kage"];

const JUTSU_LIST = [
  {
    id: "shadow_clone",
    name: "Shadow Clone Jutsu",
    kanji: "影分身の術",
    description: "Duplicate any mission scroll into a perfect copy.",
    requiredRank: "genin",
    icon: "👥",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
  },
  {
    id: "summoning",
    name: "Summoning Jutsu",
    kanji: "口寄せの術",
    description: "Summon recurring missions automatically on a set interval.",
    requiredRank: "chunin",
    icon: "🐸",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
  },
  {
    id: "substitution",
    name: "Substitution Jutsu",
    kanji: "変わり身の術",
    description: "Snooze any overdue mission for 24 hours without penalty.",
    requiredRank: "jonin",
    icon: "🪵",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
  },
  {
    id: "sharingan",
    name: "Sharingan Focus",
    kanji: "写輪眼",
    description: "Lock your gaze on a single mission, eliminating all distractions.",
    requiredRank: "anbu",
    icon: "👁️",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
  },
  {
    id: "sage_mode",
    name: "Sage Mode Amplifier",
    kanji: "仙人モード強化",
    description: "Complete a Sage Mode session to earn 2× XP on your next mission.",
    requiredRank: "kage",
    icon: "🌿",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
  },
];

function rankIdx(rank: string) {
  return RANK_ORDER.indexOf(rank);
}

export function NinjaJutsu() {
  const { data: stats } = useQuery<UserStats>({ queryKey: ["/api/stats"] });
  const currentRank = stats?.ninjaRank || "academy";
  const currentIdx = rankIdx(currentRank);

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-1">
        <Scroll className="h-5 w-5" />
        JUTSU SCROLL
      </h3>
      <p className="text-[10px] text-neutral-500 mb-4 font-mono uppercase">
        Abilities unlocked by rank
      </p>

      <div className="space-y-2">
        {JUTSU_LIST.map((jutsu, i) => {
          const unlocked = currentIdx >= rankIdx(jutsu.requiredRank);
          return (
            <motion.div
              key={jutsu.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                unlocked
                  ? `${jutsu.bg} ${jutsu.border}`
                  : "bg-neutral-950 border-neutral-800 opacity-40 grayscale"
              }`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{unlocked ? jutsu.icon : "🔒"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className={`text-[11px] font-black ${unlocked ? jutsu.color : "text-neutral-500"}`}>
                    {jutsu.name}
                  </span>
                  <span
                    className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${
                      unlocked ? `${jutsu.border} ${jutsu.color}` : "border-neutral-700 text-neutral-600"
                    }`}
                  >
                    {jutsu.requiredRank}
                  </span>
                </div>
                <p className="text-[9px] text-neutral-500 font-mono mt-0.5">{jutsu.kanji}</p>
                {unlocked && (
                  <p className="text-[9px] text-neutral-400 leading-snug mt-1">{jutsu.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
