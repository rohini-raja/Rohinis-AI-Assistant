import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";
import { SHINOBI_DATA } from "@/hooks/use-tasks";
import type { TaskWithUpdates } from "@shared/schema";
import { BookOpen } from "lucide-react";

interface BingoBookProps {
  tasks: TaskWithUpdates[];
}

const PRIORITY_BOUNTY: Record<string, number> = {
  genin: 1000,
  chunin: 5000,
  jonin: 20000,
  kage: 100000,
};

const PRIORITY_THREAT: Record<string, string> = {
  genin: "D-RANK",
  chunin: "C-RANK",
  jonin: "B-RANK",
  kage: "S-RANK",
};

const WANTED_FLAVOR = [
  "EXTREMELY DANGEROUS",
  "DO NOT APPROACH ALONE",
  "CHAKRA SIGNATURE DETECTED",
  "LAST SEEN: YOUR TASK LIST",
  "CONSIDERED ARMED",
];

export function BingoBook({ tasks }: BingoBookProps) {
  const overdue = tasks
    .filter(t => t.status === "pending")
    .map(t => ({
      ...t,
      days: differenceInDays(new Date(), new Date(t.createdAt!)),
    }))
    .filter(t => t.days > 0)
    .sort((a, b) => {
      const ba = a.days * (PRIORITY_BOUNTY[a.priority] || 1000);
      const bb = b.days * (PRIORITY_BOUNTY[b.priority] || 1000);
      return bb - ba;
    })
    .slice(0, 5);

  if (overdue.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-red-500/20 rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-display text-red-400 flex items-center gap-2 mb-1">
        <BookOpen className="h-5 w-5" />
        BINGO BOOK
      </h3>
      <p className="text-[10px] text-neutral-500 mb-4 font-mono uppercase">
        Most wanted — overdue missions
      </p>

      <div className="space-y-3">
        {overdue.map((task, i) => {
          const bounty = task.days * (PRIORITY_BOUNTY[task.priority] || 1000);
          const charId = (task.character || "naruto").replace("_hokage", "");

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative rounded-lg overflow-hidden border border-amber-800/30 bg-amber-950/15"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,150,50,0.015) 3px,rgba(255,150,50,0.015) 6px)",
              }}
            >
              <div className="bg-red-900/50 px-3 py-1 flex items-center justify-between border-b border-red-900/40">
                <span className="text-[8px] font-black text-red-300 uppercase tracking-[0.35em]">WANTED</span>
                <span className="text-[8px] font-mono text-red-400/80">
                  {PRIORITY_THREAT[task.priority] || "C-RANK"} THREAT
                </span>
              </div>

              <div className="p-3 flex gap-3">
                <div className="flex-shrink-0 w-12 h-14 rounded border border-amber-800/40 overflow-hidden relative bg-neutral-800">
                  <img
                    src={`/images/characters/${charId}.png`}
                    alt={task.character}
                    className="w-full h-full object-cover grayscale sepia"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-amber-900/25 mix-blend-multiply" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-amber-100 uppercase tracking-wide leading-tight line-clamp-2">
                    {task.title}
                  </p>
                  <p className="text-[8px] text-neutral-500 mt-0.5 font-mono">{WANTED_FLAVOR[i]}</p>

                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <span className="text-[7px] text-neutral-600 uppercase font-bold tracking-wider">Bounty</span>
                      <p className="text-[11px] font-black text-yellow-400 font-mono leading-none mt-0.5">
                        ¥{bounty.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] text-neutral-600 uppercase font-bold tracking-wider">Overdue</span>
                      <p
                        className={`text-[11px] font-black font-mono leading-none mt-0.5 ${
                          task.days > 7 ? "text-red-400" : "text-orange-400"
                        }`}
                      >
                        {task.days}d
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
