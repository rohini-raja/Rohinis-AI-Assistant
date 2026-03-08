
import { useTasks, SHINOBI_DATA } from "@/hooks/use-tasks";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Flame, Trophy, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { UserStats } from "@shared/schema";
import { format, subDays, isSameDay } from "date-fns";

export default function Analytics() {
  const { data: tasks = [] } = useTasks();
  const { data: stats } = useQuery<UserStats>({ queryKey: ["/api/stats"] });

  const completed = tasks.filter(t => t.status === "completed");
  const pending = tasks.filter(t => t.status === "pending");
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const byPriority = {
    genin: tasks.filter(t => t.priority === "genin").length,
    chunin: tasks.filter(t => t.priority === "chunin").length,
    jonin: tasks.filter(t => t.priority === "jonin").length,
    kage: tasks.filter(t => t.priority === "kage").length,
  };
  const maxPriority = Math.max(...Object.values(byPriority), 1);

  const byVillage = SHINOBI_DATA.villages.slice(0, 5).map(v => ({
    ...v,
    count: tasks.filter(t => t.village === v.id).length,
  }));
  const maxVillage = Math.max(...byVillage.map(v => v.count), 1);

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dayTasks = tasks.filter(t => t.createdAt && isSameDay(new Date(t.createdAt), day));
    const dayCompleted = tasks.filter(t => t.completedAt && isSameDay(new Date(t.completedAt), day));
    return { day, created: dayTasks.length, completed: dayCompleted.length };
  });
  const maxActivity = Math.max(...last14Days.map(d => d.created + d.completed), 1);

  return (
    <div className="min-h-screen bg-background pb-20" data-testid="analytics-page">
      <header className="bg-neutral-900 border-b border-primary/30 p-6">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-primary" data-testid="back-to-dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display text-white tracking-wider">
              MISSION <span className="text-primary">ANALYTICS</span>
            </h1>
            <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">Intelligence Report</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Target className="h-5 w-5" />} label="Total Missions" value={total} color="text-primary" />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Completed" value={completed.length} color="text-green-400" />
          <StatCard icon={<Flame className="h-5 w-5" />} label="Active" value={pending.length} color="text-orange-400" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Completion Rate" value={`${completionRate}%`} color="text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="text-sm font-display text-primary mb-4 flex items-center gap-2 uppercase">
              <BarChart3 className="h-4 w-4" /> Completion Gauge
            </h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(220 13% 20%)" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                    strokeDasharray={`${completionRate} ${100 - completionRate}`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ strokeDasharray: `${completionRate} ${100 - completionRate}` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display text-white">{completionRate}%</span>
                  <span className="text-[8px] text-neutral-500 uppercase font-bold">Complete</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="text-sm font-display text-primary mb-4 uppercase">Mission Ranks</h3>
            <div className="space-y-3">
              {Object.entries(byPriority).map(([rank, count]) => (
                <div key={rank} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 w-14">{rank}</span>
                  <div className="flex-1 h-4 bg-neutral-950 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${rank === 'genin' ? 'bg-green-500' : rank === 'chunin' ? 'bg-blue-500' : rank === 'jonin' ? 'bg-purple-500' : 'bg-red-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxPriority) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="text-sm font-display text-primary mb-4 uppercase">Village Distribution</h3>
            <div className="space-y-3">
              {byVillage.map(v => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 w-14 truncate">{v.id}</span>
                  <div className="flex-1 h-4 bg-neutral-950 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: `hsl(${v.color})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(v.count / maxVillage) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 w-6 text-right">{v.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="text-sm font-display text-primary mb-4 flex items-center gap-2 uppercase">
              <Calendar className="h-4 w-4" /> 14-Day Activity
            </h3>
            <div className="flex items-end gap-1 h-32">
              {last14Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <motion.div
                    className="w-full bg-primary/60 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.created / maxActivity) * 80}px` }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                  />
                  <span className="text-[6px] text-neutral-600 font-mono">
                    {format(d.day, 'd')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {stats && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="text-sm font-display text-primary mb-4 uppercase">Ninja Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat label="Total XP" value={stats.totalXp} />
              <MiniStat label="Current Streak" value={`${stats.currentStreak} days`} />
              <MiniStat label="Best Streak" value={`${stats.longestStreak} days`} />
              <MiniStat label="Ninja Rank" value={(stats.ninjaRank || "academy").toUpperCase()} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex flex-col items-center text-center"
    >
      <div className={`${color} mb-2`}>{icon}</div>
      <span className="text-2xl font-display text-white">{value}</span>
      <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">{label}</span>
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white font-mono">{value}</p>
      <p className="text-[9px] text-neutral-500 uppercase font-bold">{label}</p>
    </div>
  );
}
