import { TaskWithUpdates, type UpdateTaskRequest } from "@shared/schema";
import { NinjaCard } from "./NinjaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Check, Trash2, ShieldAlert, Shield, ShieldCheck, Crown, Scroll, Send } from "lucide-react";
import { useUpdateTask, useDeleteTask, useAddTaskUpdate } from "@/hooks/use-tasks";
import { useState } from "react";
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

  return (
    <NinjaCard className={`transition-all duration-300 ${task.status === 'completed' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-xl font-bold font-display tracking-wide ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
            <VillageBadge village={task.village} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PriorityIcon priority={task.priority} />
            <span className="capitalize font-semibold">{task.priority} Rank</span>
            <span>•</span>
            <span>{format(new Date(task.createdAt || new Date()), "MMM d, yyyy")}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
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

      <p className="text-neutral-300 mb-6 leading-relaxed">
        {task.description || "No mission details provided."}
      </p>

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
