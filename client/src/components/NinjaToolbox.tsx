import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, StickyNote, Timer, ChevronRight, ChevronLeft, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function NinjaToolbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "notes">("tools");
  const [noteText, setNoteText] = useState("");
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["/api/notes"],
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNoteText("");
    },
  });

  const toggleNoteMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-neutral-900 border-2 border-primary/40 border-l-0 p-3 rounded-r-2xl shadow-[5px_0_15px_rgba(0,0,0,0.4)] hover:bg-neutral-800 transition-colors group"
        whileHover={{ x: 5 }}
      >
        <Hammer className={`h-6 w-6 text-primary transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="ml-2 w-72 bg-neutral-900/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setActiveTab("tools")}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === "tools" ? "bg-primary/10 text-primary" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                Ninja Tools
              </button>
              <button 
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === "notes" ? "bg-primary/10 text-primary" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                Quick Notes
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {activeTab === "tools" ? (
                <div className="grid grid-cols-2 gap-3">
                  <ToolButton icon={<Timer className="h-5 w-5" />} label="Focus Timer" onClick={() => {
                    const event = new CustomEvent('toggle-ninja-timer');
                    window.dispatchEvent(event);
                  }} />
                  <ToolButton icon={<StickyNote className="h-5 w-5" />} label="New Note" onClick={() => setActiveTab("notes")} />
                </div>
              ) : (
                <div className="space-y-4">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (noteText.trim()) addNoteMutation.mutate(noteText);
                    }}
                    className="flex gap-2"
                  >
                    <Input 
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="New thought..."
                      className="h-8 text-xs bg-neutral-950 border-neutral-800"
                    />
                    <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>

                  <div className="space-y-2">
                    {notes.map((note: any) => (
                      <div key={note.id} className="group flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <button 
                            onClick={() => toggleNoteMutation.mutate({ id: note.id, completed: !note.completed })}
                            className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${note.completed ? 'bg-primary border-primary' : 'border-neutral-700'}`}
                          >
                            {note.completed && <Check className="h-3 w-3 text-black" />}
                          </button>
                          <span className={`text-xs truncate ${note.completed ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>
                            {note.content}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-600 hover:text-red-400 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
    >
      <div className="text-neutral-500 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-tighter text-neutral-400 group-hover:text-neutral-200">
        {label}
      </span>
    </button>
  );
}
