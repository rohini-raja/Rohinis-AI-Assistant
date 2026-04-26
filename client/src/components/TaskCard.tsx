import { TaskWithUpdates, type UpdateTaskRequest } from "@shared/schema";
import { NinjaCard } from "./NinjaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { format, differenceInDays } from "date-fns";
import { Check, Trash2, ShieldAlert, Shield, ShieldCheck, Crown, Scroll, Send, Heart, HeartOff, Copy, RefreshCw, Clock, Eye } from "lucide-react";
import { useUpdateTask, useDeleteTask, useAddTaskUpdate, useCreateTask, SHINOBI_DATA } from "@/hooks/use-tasks";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playCompleteSound, playCloneSound, playDeleteSound, playRecurringSound } from "@/lib/sounds";

interface TaskCardProps {
  task: TaskWithUpdates;
}

const CHARACTER_IMAGE_MAP: Record<string, string> = {
  kakashi_hokage: "kakashi",
  hashirama: "hashirama",
  tobirama: "tobirama",
  hiruzen: "hiruzen",
  minato: "minato",
};

function getCharacterImageId(id: string): string {
  return CHARACTER_IMAGE_MAP[id] || id;
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
  const createTask = useCreateTask();
  const addUpdate = useAddTaskUpdate();
  const [updateText, setUpdateText] = useState("");
  const [showChakraAnimation, setShowChakraAnimation] = useState(false);
  const [currentHokageId, setCurrentHokageId] = useState(localStorage.getItem("ninja-selected-hokage") || "tsunade");
  const [snoozed, setSnoozed] = useState(() => {
    const until = parseInt(localStorage.getItem(`ninja-snoozed-${task.id}`) || "0");
    return Date.now() < until;
  });

  const RANK_ORDER_LOCAL = ["academy", "genin", "chunin", "jonin", "anbu", "kage"];
  const ninjaRank = localStorage.getItem("ninja-rank") || "academy";
  const rankIdx = RANK_ORDER_LOCAL.indexOf(ninjaRank);
  const hasJonin = rankIdx >= RANK_ORDER_LOCAL.indexOf("jonin");
  const hasAnbu = rankIdx >= RANK_ORDER_LOCAL.indexOf("anbu");

  useEffect(() => {
    const handleHokageChange = (e: any) => {
      setCurrentHokageId(e.detail);
    };
    window.addEventListener("hokage-changed", handleHokageChange);
    return () => window.removeEventListener("hokage-changed", handleHokageChange);
  }, []);

  const charData = SHINOBI_DATA.characters.find(c => c.id === task.character);
  const teamData = SHINOBI_DATA.teams.find(t => t.id === task.team);
  
  const villageKage = task.village === "leaf" 
    ? SHINOBI_DATA.characters.find(c => c.id === currentHokageId)
    : (SHINOBI_DATA.characters.find(c => c.village === task.village && c.team === 'kage') || 
       SHINOBI_DATA.characters.find(c => c.village === task.village && c.team === 'hokage'));

  const overseerChar = task.village === "leaf" ? villageKage : null;
  const assignedChar = SHINOBI_DATA.characters.find(c => c.id === task.character);

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

  const daysSinceCreated = task.createdAt ? differenceInDays(new Date(), new Date(task.createdAt)) : 0;
  const isOverdue = task.status === 'pending' && daysSinceCreated > 3 && !snoozed;
  const isUrgent = task.status === 'pending' && daysSinceCreated > 7 && !snoozed;

  const handleShadowClone = () => {
    playCloneSound();
    const { id, updates, createdAt, completedAt, ...cloneData } = task;
    createTask.mutate({
      ...cloneData,
      title: `${cloneData.title} (Clone)`,
    });
  };

  const handleToggleRecurring = () => {
    playRecurringSound();
    updateTask.mutate({ 
      id: task.id, 
      isRecurring: !task.isRecurring,
      recurringInterval: !task.isRecurring ? "daily" : null 
    });
  };

  const handleToggleStatus = () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    if (newStatus === 'completed') {
      playCompleteSound();
      setShowChakraAnimation(true);
      setTimeout(() => setShowChakraAnimation(false), 2000);
      window.dispatchEvent(new CustomEvent("task-completed", { detail: { taskId: task.id } }));
    }

    // @ts-ignore
    updateTask.mutate({ id: task.id, status: newStatus, completedAt });
  };

  const handleSubstitution = () => {
    const until = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`ninja-snoozed-${task.id}`, until.toString());
    setSnoozed(true);
  };

  const handleSharinganFocus = () => {
    window.dispatchEvent(new CustomEvent("sharingan-focus", { detail: { taskId: task.id } }));
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

  const handleDelete = () => {
    playDeleteSound();
    deleteTask.mutate(task.id);
  };

  const getHappinessIcon = (val: number) => {
    if (val >= 80) return "🔥";
    if (val >= 50) return "😊";
    if (val >= 20) return "😐";
    return "😞";
  };

  const overdueGlow = isUrgent 
    ? 'shadow-[0_0_20px_rgba(255,50,50,0.4)] border-red-500/40' 
    : isOverdue 
    ? 'shadow-[0_0_12px_rgba(255,150,50,0.3)] border-orange-500/30' 
    : '';

  return (
    <NinjaCard 
      village={task.village} 
      character={task.character}
      className={`transition-all duration-500 relative group/card pt-12 overflow-hidden border-none bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl hover:shadow-primary/20 ${task.status === 'completed' ? 'opacity-60 grayscale-[0.3]' : ''} ${overdueGlow}`}
      data-testid={`task-card-${task.id}`}
    >
      <AnimatePresence>
        {showChakraAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary via-yellow-400 to-primary blur-md" />
          </motion.div>
        )}
        {showChakraAnimation && (
          <>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={`particle-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200, 
                  y: (Math.random() - 0.5) * 200, 
                  opacity: 0, 
                  scale: 0 
                }}
                transition={{ duration: 1 + Math.random() * 0.5, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-primary z-30 pointer-events-none"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {isOverdue && task.status === 'pending' && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: isUrgent ? 1.5 : 3, repeat: Infinity }}
        >
          <div className={`w-full h-full ${isUrgent ? 'bg-red-500/20' : 'bg-orange-500/10'}`} />
        </motion.div>
      )}

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      
      {villageKage && (
        <motion.div 
          className="absolute top-3 left-4 flex items-center gap-2 z-20 pointer-events-none"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          key={villageKage.id}
        >
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-primary rounded-full blur-md"
            />
            <motion.div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden bg-neutral-900/80 relative">
              <img 
                src={`/images/characters/${getCharacterImageId(villageKage.id)}.png`} 
                alt={villageKage.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-[6px] text-neutral-500 uppercase font-medium tracking-[0.2em] leading-none mb-1">Overseer</span>
            <motion.span className="text-[10px] font-sans font-bold text-primary/80 uppercase tracking-wider leading-none">
              {villageKage.name}
            </motion.span>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="absolute -top-4 -right-4 w-40 h-40 pointer-events-none opacity-10 group-hover/card:opacity-30 transition-all duration-700 blur-[2px] group-hover/card:blur-none"
        whileHover={{ scale: 1.05, x: -10, y: 10 }}
        {...(assignedChar ? kageAnimation : {})}
      >
        <img 
          src={`/images/characters/${getCharacterImageId(task.character)}.png`} 
          alt={task.character}
          className="w-full h-full object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
              {task.isRecurring && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono uppercase tracking-tighter flex items-center gap-1">
                  <RefreshCw className="h-2.5 w-2.5" /> {task.recurringInterval || "daily"}
                </span>
              )}
              {isOverdue && task.status === 'pending' && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-tighter flex items-center gap-1 ${isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/15 text-orange-400 border border-orange-500/20'}`}>
                  <Clock className="h-2.5 w-2.5" /> {daysSinceCreated}d
                </span>
              )}
            </div>
            
            <h3 className={`text-2xl font-sans font-black tracking-tight leading-tight ${task.status === 'completed' ? 'line-through text-neutral-500' : 'text-white'}`}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex gap-2 relative z-20 flex-wrap justify-end">
            {hasAnbu && (
              <Button
                size="icon"
                variant="ghost"
                title="Sharingan Focus (ANBU)"
                className="rounded-xl h-10 w-10 border bg-neutral-800/50 border-neutral-700/50 hover:border-red-500/50 hover:text-red-400 transition-all"
                onClick={handleSharinganFocus}
                data-testid={`sharingan-task-${task.id}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {hasJonin && isOverdue && (
              <Button
                size="icon"
                variant="ghost"
                title="Substitution Jutsu — Snooze 24h (Jonin)"
                className="rounded-xl h-10 w-10 border bg-neutral-800/50 border-neutral-700/50 hover:border-purple-500/50 hover:text-purple-400 transition-all"
                onClick={handleSubstitution}
                data-testid={`snooze-task-${task.id}`}
              >
                <span className="text-sm leading-none">🪵</span>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              title="Shadow Clone Jutsu (Duplicate)"
              className="rounded-xl h-10 w-10 border bg-neutral-800/50 border-neutral-700/50 hover:border-primary/50 hover:text-primary transition-all"
              onClick={handleShadowClone}
              disabled={createTask.isPending}
              data-testid={`clone-task-${task.id}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title={task.isRecurring ? "Unsummon Recurring" : "Summoning Jutsu (Recurring)"}
              className={`rounded-xl h-10 w-10 border transition-all ${task.isRecurring ? 'bg-primary/20 text-primary border-primary/40' : 'bg-neutral-800/50 border-neutral-700/50 hover:border-primary/50 hover:text-primary'}`}
              onClick={handleToggleRecurring}
              disabled={updateTask.isPending}
              data-testid={`recurring-task-${task.id}`}
            >
              <RefreshCw className={`h-4 w-4 ${task.isRecurring ? 'animate-spin' : ''}`} style={task.isRecurring ? { animationDuration: '3s' } : {}} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-xl h-10 w-10 border transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-neutral-800/50 border-neutral-700/50 hover:border-primary/50 hover:text-primary'}`}
              onClick={handleToggleStatus}
              disabled={updateTask.isPending}
              data-testid={`complete-task-${task.id}`}
            >
              <Check className={`h-5 w-5 ${task.status === 'completed' ? 'scale-110' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl h-10 w-10 border border-transparent hover:border-red-400/20 transition-all"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              data-testid={`delete-task-${task.id}`}
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
           {task.estimatedMinutes && (
             <>
               <div className="h-6 w-px bg-neutral-800" />
               <div className="flex flex-col gap-0.5">
                 <span className="text-[8px] uppercase text-neutral-500 font-bold tracking-widest">Est.</span>
                 <span className="text-[11px] font-mono text-blue-400">{task.estimatedMinutes}m</span>
               </div>
             </>
           )}
        </div>

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
                      data-testid={`update-input-${task.id}`}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 w-7 text-neutral-500 hover:text-primary transition-colors" 
                      disabled={addUpdate.isPending || !updateText.trim()}
                      data-testid={`update-submit-${task.id}`}
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
