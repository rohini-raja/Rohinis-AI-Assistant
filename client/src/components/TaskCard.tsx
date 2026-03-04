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
    leaf: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    mist: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    sand: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    cloud: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    rock: "bg-red-800/10 text-red-400 border-red-500/30",
  };

  return (
    <span className={`text-[8px] px-2 py-0.5 rounded-full border uppercase tracking-[0.15em] font-black ${colors[village] || colors.leaf}`}>
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
  const assignedChar = SHINOBI_DATA.characters.find(c => c.id === task.character);

  // Animation variants for Hokage/Kage
  const kageAnimation = {
    animate: {
      y: [0, -5, 0],
      rotate: [0, 1, -1, 0],
      filter: [
        "drop-shadow(0 0 0px rgba(var(--primary), 0))",
        "drop-shadow(0 0 10px rgba(var(--primary), 0.5))",
        "drop-shadow(0 0 0px rgba(var(--primary), 0))"
      ]
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

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
      className={`transition-all duration-500 relative group/card pt-12 overflow-hidden border-none bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-primary/20 ${task.status === 'completed' ? 'opacity-60 grayscale-[0.3]' : ''}`}
    >
      {/* Sleek Glassmorphism Header Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      
      {/* Kage Animation Overlay - Repositioned for sleekness */}
      {villageKage && (
        <motion.div 
          className="absolute top-3 left-4 flex items-center gap-2 z-20 pointer-events-none"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          key={villageKage.id}
        >
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-primary rounded-full blur-md"
            />
            <motion.div 
              className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden bg-neutral-900/80 relative"
            >
              <img 
                src={`/images/characters/${villageKage.id}.png`} 
                alt={villageKage.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!villageKage.id && <Crown className="w-4 h-4 m-2 text-primary/70" />}
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-[6px] text-neutral-500 uppercase font-medium tracking-[0.2em] leading-none mb-1">Overseer</span>
            <motion.span 
              className="text-[10px] font-sans font-bold text-primary/80 uppercase tracking-wider leading-none"
            >
              {villageKage.name}
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Character Image Overlay - Modern placement */}
      <motion.div 
        className="absolute -top-4 -right-4 w-40 h-40 pointer-events-none opacity-10 group-hover/card:opacity-30 transition-all duration-700 blur-[2px] group-hover/card:blur-none"
        whileHover={{ scale: 1.05, x: -10, y: 10 }}
        {...(overseerChar || assignedChar ? kageAnimation : {})}
      >
        <img 
          src={`/images/characters/${overseerChar?.id || task.character}.png`} 
          alt={overseerChar?.id || task.character}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </motion.div>

      <div className="flex flex-col gap-4 relative z-10 px-1">
        <div className="flex justify-between items-start">
          <div className="space-y-2 max-w-[70%]">
            <div className="flex flex-wrap gap-1.5 items-center">
              <VillageBadge village={task.village} />
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono uppercase tracking-tighter">
                {task.priority}
              </span>
            </div>
            
            <h3 className={`text-2xl font-sans font-black tracking-tight leading-tight ${task.status === 'completed' ? 'line-through text-neutral-500' : 'text-white'}`}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex gap-2 relative z-20">
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-xl h-10 w-10 border transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-neutral-800/50 border-neutral-700/50 hover:border-primary/50 hover:text-primary'}`}
              onClick={handleToggleStatus}
              disabled={updateTask.isPending}
            >
              <Check className={`h-5 w-5 ${task.status === 'completed' ? 'scale-110' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl h-10 w-10 border border-transparent hover:border-red-400/20 transition-all"
              onClick={() => deleteTask.mutate(task.id)}
              disabled={deleteTask.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-neutral-400 text-sm leading-relaxed font-sans font-light line-clamp-2 group-hover/card:line-clamp-none transition-all">
          {task.description || "Awaiting mission briefing..."}
        </p>

        <div className="flex items-center gap-4 py-2 border-y border-neutral-800/50">
           <div className="flex flex-col gap-0.5">
             <span className="text-[8px] uppercase text-neutral-500 font-bold tracking-widest">Assigned</span>
             <span className="text-[11px] font-sans font-bold text-neutral-300">{charData?.name || "Unknown Shinobi"}</span>
           </div>
           <div className="h-6 w-px bg-neutral-800" />
           <div className="flex flex-col gap-0.5">
             <span className="text-[8px] uppercase text-neutral-500 font-bold tracking-widest">Morale</span>
             <div className="flex items-center gap-1.5">
               <span className="text-xs">{getHappinessIcon(task.happiness || 50)}</span>
               <span className="text-[11px] font-mono text-primary font-bold">{task.happiness || 50}%</span>
             </div>
           </div>
           <div className="h-6 w-px bg-neutral-800" />
           <div className="flex flex-col gap-0.5">
             <span className="text-[8px] uppercase text-neutral-500 font-bold tracking-widest">Date</span>
             <span className="text-[11px] font-mono text-neutral-400">{format(new Date(task.createdAt || new Date()), "dd.MM.yy")}</span>
           </div>
        </div>

        {/* Modern Slider */}
        <div className="group/slider relative pt-1">
          <input 
            type="range" 
            min="0" 
            max="100" 
            className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-primary hover:h-1.5 transition-all"
            value={task.happiness || 50}
            onChange={(e) => handleHappinessChange(parseInt(e.target.value))}
          />
        </div>

        <div className="rounded-xl overflow-hidden border border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="updates" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-neutral-800/30 text-xs font-medium text-neutral-400">
                <div className="flex items-center gap-2">
                  <Scroll className="h-3.5 w-3.5 text-primary/60" />
                  <span>Mission Logs <span className="text-primary/40 ml-1">[{task.updates.length}]</span></span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                  <AnimatePresence>
                    {task.updates.slice().reverse().map((update) => (
                      <motion.div 
                        key={update.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] bg-neutral-800/50 p-3 rounded-lg border-l border-primary/30 relative group/log"
                      >
                        <p className="text-neutral-300 font-sans leading-snug">{update.content}</p>
                        <div className="mt-2 flex justify-between items-center opacity-40 group-hover/log:opacity-100 transition-opacity">
                          <span className="text-[8px] uppercase font-mono">{format(new Date(update.createdAt || new Date()), "HH:mm • MMM d")}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <form onSubmit={handleAddUpdate} className="relative mt-4">
                    <Input 
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="Add intel..." 
                      className="h-9 text-xs bg-neutral-950/50 border-neutral-800 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-lg pr-10"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 w-7 text-neutral-500 hover:text-primary transition-colors" 
                      disabled={addUpdate.isPending || !updateText.trim()}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </NinjaCard>
  );
}
