import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Scroll, Trash2, Plus, List, CheckCircle2 } from "lucide-react";
import type { QuickNote } from "@shared/schema";
import { motion, Reorder } from "framer-motion";

export function QuickNotes() {
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery<QuickNote[]>({
    queryKey: ["/api/notes"],
  });

  const filteredNotes = (notes || []).filter(n => {
    if (filter === "active") return !n.completed;
    if (filter === "done") return n.completed;
    return true;
  });

  const addNote = useMutation({
    mutationFn: (newNote: { content: string }) => apiRequest("POST", "/api/notes", newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setContent("");
    },
  });

  const toggleNote = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      apiRequest("PATCH", `/api/notes/${id}`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });

  const deleteNote = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notes"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addNote.mutate({ content });
  };

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 flex flex-col h-[400px]">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-2">
        <Scroll className="h-5 w-5" />
        SHINOBI SCROLLS
      </h3>

      <div className="flex gap-1 mb-4">
        {(['all', 'active', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[9px] uppercase font-bold px-2 py-1 rounded transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-neutral-800 rounded" />)}
          </div>
        ) : filteredNotes.map((note) => (
          <div key={note.id} className="flex items-center gap-2 group p-1 hover:bg-neutral-800 rounded transition-colors">
            <Checkbox 
              checked={note.completed} 
              onCheckedChange={(checked) => toggleNote.mutate({ id: note.id, completed: !!checked })}
              className="border-primary data-[state=checked]:bg-primary"
            />
            <span className={`text-sm flex-1 ${note.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
              {note.content}
            </span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-destructive"
              onClick={() => deleteNote.mutate(note.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Quick note..."
          className="h-8 bg-neutral-950 border-neutral-800 text-xs focus:border-primary"
        />
        <Button size="icon" className="h-8 w-8 bg-primary text-primary-foreground shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
