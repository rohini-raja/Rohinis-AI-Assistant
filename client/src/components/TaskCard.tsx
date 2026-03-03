import { TaskWithUpdates, type UpdateTaskRequest } from "@shared/schema";
import { NinjaCard } from "./NinjaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Check, Trash2, ShieldAlert, Shield, ShieldCheck, Crown, Scroll, Send, Heart, HeartOff } from "lucide-react";
import { useUpdateTask, useDeleteTask, useAddTaskUpdate, SHINOBI_DATA } from "@/hooks/use-tasks";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskCardProps {
  task: TaskWithUpdates;
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'genin': return <Shield className="h-4 w-4 text-green-500" />;
    case 'chunin': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
    case 'jonin': return <ShieldAlert className="h-4 w-4 text-purple-500" />;
    case 'kage': return <Crown className="h-4 w-4 text-red-500" />;
    default: return <Shield className="h-4 w-4" />;
  }
};

const VillageBadge = ({ village }: { village: string }) => {
  const colors: Record<string, string> = {
    leaf: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    mist: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    sand: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    cloud: "bg-slate-500/20 text-slate-400 border-slate-500/50",
    rock: "bg-red-800/20 text-red-400 border-red-500/50",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${colors[village] || colors.leaf}`}>
      {village}
    </span>
  );
};

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addUpdate = useAddTaskUpdate();
  const [updateText, setUpdateText] = useState("");
  const [currentHokageId, setCurrentHokageId] = useState(localStorage.getItem("ninja-selected-hokage") || "tsunade");

  useEffect(() => {
    const handleHokageChange = (e: any) => {
      setCurrentHokageId(e.detail);
    };
    window.addEventListener("hokage-changed", handleHokageChange);
    return () => window.removeEventListener("hokage-changed", handleHokageChange);
  }, []);

  const charData = SHINOBI_DATA.characters.find(c => c.id === task.character);
  const teamData = SHINOBI_DATA.teams.find(t => t.id === task.team);
  
  // Find the Kage for this village
  const villageKage = task.village === "leaf" 
    ? SHINOBI_DATA.characters.find(c => c.id === currentHokageId)
    : (SHINOBI_DATA.characters.find(c => c.village === task.village && c.team === 'kage') || 
       SHINOBI_DATA.characters.find(c => c.village === task.village && c.team === 'hokage'));

  const overseerChar = task.village === "leaf" ? villageKage : null;

  const handleToggleStatus = () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    
    // @ts-ignore - Date string/object mismatch in types but works at runtime
    updateTask.mutate({ id: task.id, status: newStatus, completedAt });
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    addUpdate.mutate({ taskId: task.id, content: updateText });
    setUpdateText("");
  };

  const handleHappinessChange = (val: number) => {
    updateTask.mutate({ id: task.id, happiness: val });
  };

  const getHappinessIcon = (val: number) => {
    if (val >= 80) return "🔥";
    if (val >= 50) return "😊";
    if (val >= 20) return "😐";
    return "😞";
  };

  return (
    <NinjaCard 
      village={task.village} 
      character={task.character}
      className={`transition-all duration-300 relative group/card pt-16 ${task.status === 'completed' ? 'opacity-70 grayscale-[0.5]' : ''}`}
    >
      {/* Kage Animation Overlay */}
      {villageKage && (
        <motion.div 
          className="absolute top-4 left-4 flex items-center gap-3 z-20 pointer-events-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={villageKage.id} // Add key for immediate re-animation on switch
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1], 
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-primary rounded-full blur-lg"
            />
            <motion.div 
              className="w-10 h-10 rounded-full border-2 border-primary/50 overflow-hidden bg-neutral-900 relative shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              animate={{
                boxShadow: ["0 0 5px rgba(var(--primary), 0.2)", "0 0 15px rgba(var(--primary), 0.5)", "0 0 5px rgba(var(--primary), 0.2)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img 
                src={`/images/characters/${villageKage.id}.png`} 
                alt={villageKage.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!villageKage.id && <Crown className="w-5 h-5 m-2.5 text-primary" />}
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] text-neutral-500 uppercase font-mono tracking-tighter">Mission Overseer</span>
            <motion.span 
              className="text-[9px] font-display text-primary uppercase tracking-tighter leading-none"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {villageKage.name}
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Character Image Overlay */}
      <motion.div 
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20 group-hover/card:opacity-40 transition-opacity"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <img 
          src={`/images/characters/${overseerChar?.id || task.character}.png`} 
          alt={overseerChar?.id || task.character}
          className="w-full h-full object-contain"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </motion.div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-xl font-bold font-display tracking-wide ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
            <div className="flex gap-1 flex-wrap">
              <VillageBadge village={task.village} />
              {charData && (
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700 uppercase font-bold font-shinobi">
                  {charData.name}
                </span>
              )}
              {teamData && (
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700 uppercase font-bold font-shinobi">
                  {teamData.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <PriorityIcon priority={task.priority} />
              <span className="capitalize font-semibold">{task.priority} Rank</span>
            </div>
            <div className="flex items-center gap-1 group/happiness cursor-pointer">
              <span className="text-xs font-bold text-primary/80">{getHappinessIcon(task.happiness || 50)}</span>
              <span className="font-mono text-[10px]">{task.happiness || 50}% Moral</span>
            </div>
            <span>{format(new Date(task.createdAt || new Date()), "MMM d")}</span>
          </div>
        </div>
        
        <div className="flex gap-2 relative z-20">
          <Button
            size="icon"
            variant={task.status === 'completed' ? "default" : "outline"}
            className={`rounded-full h-10 w-10 border-2 ${task.status === 'completed' ? 'bg-green-600 hover:bg-green-700 border-green-800' : 'border-neutral-600 hover:border-primary hover:text-primary'}`}
            onClick={handleToggleStatus}
            disabled={updateTask.isPending}
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-neutral-500 hover:text-destructive hover:bg-destructive/10 rounded-full h-10 w-10"
            onClick={() => deleteTask.mutate(task.id)}
            disabled={deleteTask.isPending}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <p className="text-neutral-300 mb-4 leading-relaxed">
        {task.description || "No mission details provided."}
      </p>

      {/* Happiness Adjustment Slider */}
      <div className="mb-4 px-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter font-shinobi">Squad Morale</span>
          <span className="text-[10px] font-mono text-primary">{task.happiness || 50}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary"
          value={task.happiness || 50}
          onChange={(e) => handleHappinessChange(parseInt(e.target.value))}
        />
      </div>

      <div className="bg-neutral-900/50 rounded-lg border border-neutral-800 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="updates" className="border-none">
            <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-neutral-800/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-400">
                <Scroll className="h-4 w-4" />
                <span>Mission Log ({task.updates.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 bg-neutral-900/30">
              <div className="space-y-3 pt-3">
                <AnimatePresence>
                  {task.updates.map((update) => (
                    <motion.div 
                      key={update.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm bg-neutral-800 p-2 rounded border-l-2 border-primary"
                    >
                      <p className="text-neutral-200">{update.content}</p>
                      <span className="text-[10px] text-neutral-500 uppercase font-mono">
                        {format(new Date(update.createdAt || new Date()), "MMM d • HH:mm")}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {task.updates.length === 0 && (
                  <p className="text-xs text-neutral-600 italic text-center py-2">No updates recorded yet.</p>
                )}

                <form onSubmit={handleAddUpdate} className="flex gap-2 mt-4 pt-2 border-t border-neutral-800">
                  <Input 
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="Log a mission update..." 
                    className="h-8 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 bg-neutral-800 hover:bg-primary hover:text-primary-foreground" disabled={addUpdate.isPending || !updateText.trim()}>
                    <Send className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </NinjaCard>
  );
}
