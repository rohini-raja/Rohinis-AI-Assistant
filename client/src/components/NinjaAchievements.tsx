
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";

interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export function NinjaAchievements() {
  const { data: achievements = [] } = useQuery<AchievementDef[]>({
    queryKey: ["/api/achievements"],
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg" data-testid="achievements-panel">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-2">
        <Award className="h-5 w-5" />
        ACHIEVEMENTS
      </h3>
      <p className="text-[10px] text-neutral-500 mb-4 font-mono uppercase">
        {unlockedCount} / {achievements.length} Unlocked
      </p>

      <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {achievements.map((ach, idx) => (
          <motion.div
            key={ach.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
              ach.unlocked 
                ? 'bg-primary/10 border-primary/30 hover:border-primary/60' 
                : 'bg-neutral-950 border-neutral-800 opacity-40 grayscale'
            }`}
            data-testid={`achievement-${ach.key}`}
          >
            <span className="text-xl mb-1">{ach.unlocked ? ach.icon : '🔒'}</span>
            <span className="text-[8px] font-bold text-white leading-tight">{ach.title}</span>
            <span className="text-[7px] text-neutral-500 leading-tight mt-0.5">{ach.description}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
