import { useCreateTask, SHINOBI_DATA } from "@/hooks/use-tasks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ScrollText, Zap, FileText } from "lucide-react";
import { playCreateSound } from "@/lib/sounds";

const MISSION_TEMPLATES = [
  { 
    name: "Training Mission", 
    icon: "🥋",
    data: { title: "Training Session", description: "Practice and improve ninja skills.", priority: "genin" as const, village: "leaf", character: "naruto", team: "team7", estimatedMinutes: 30 }
  },
  { 
    name: "Delivery Mission",
    icon: "📜",
    data: { title: "Scroll Delivery", description: "Deliver classified intel to another village.", priority: "chunin" as const, village: "sand", character: "sakura", team: "team7", estimatedMinutes: 60 }
  },
  { 
    name: "Intel Gathering",
    icon: "🔍",
    data: { title: "Reconnaissance", description: "Gather information and report back.", priority: "jonin" as const, village: "mist", character: "kakashi", team: "team7", estimatedMinutes: 45 }
  },
  { 
    name: "Boss Battle",
    icon: "⚔️",
    data: { title: "S-Rank Mission", description: "High-stakes mission requiring maximum effort.", priority: "kage" as const, village: "leaf", character: "naruto", team: "team7", estimatedMinutes: 120 }
  },
  { 
    name: "Study Session",
    icon: "📖",
    data: { title: "Jutsu Research", description: "Study scrolls and learn new techniques.", priority: "genin" as const, village: "leaf", character: "sakura", team: "team7", estimatedMinutes: 25 }
  },
  { 
    name: "Workout",
    icon: "💪",
    data: { title: "Physical Training", description: "Build strength and stamina like Rock Lee!", priority: "chunin" as const, village: "leaf", character: "naruto", team: "team7", estimatedMinutes: 45 }
  },
];

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const createTask = useCreateTask();

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "genin",
      village: "leaf",
      character: "naruto",
      team: "team7",
      happiness: 50,
      status: "pending",
      estimatedMinutes: undefined,
    },
  });

  const onSubmit = (data: InsertTask) => {
    playCreateSound();
    createTask.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setShowTemplates(true);
      },
    });
  };

  const applyTemplate = (template: typeof MISSION_TEMPLATES[0]) => {
    form.reset({
      ...form.getValues(),
      ...template.data,
      happiness: 50,
      status: "pending",
    });
    setShowTemplates(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setShowTemplates(true); }}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xl tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200" data-testid="create-task-btn">
          <ScrollText className="mr-2 h-5 w-5" />
          Assign New Mission
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-2 border-primary/50 text-foreground sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-display text-primary flex items-center gap-2">
            <Zap className="h-6 w-6" />
            New Mission Scroll
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Choose a template or create a custom mission.
          </DialogDescription>
        </DialogHeader>

        {showTemplates && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                <FileText className="h-3 w-3" /> Mission Templates
              </span>
              <Button variant="ghost" size="sm" className="text-[10px] h-6 text-primary" onClick={() => setShowTemplates(false)} data-testid="skip-templates">
                Custom Mission
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MISSION_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="flex items-center gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  data-testid={`template-${t.name.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-neutral-200 group-hover:text-primary transition-colors">{t.name}</p>
                    <p className="text-[9px] text-neutral-500">{t.data.estimatedMinutes}min • {t.data.priority}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold">Mission Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Retrieve the stolen scroll" className="bg-neutral-950 border-neutral-800 focus:border-primary" {...field} data-testid="input-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold">Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mission objectives and intelligence..." 
                      className="bg-neutral-950 border-neutral-800 focus:border-primary min-h-[80px]" 
                      {...field} 
                      value={field.value || ''}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="happiness"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="text-primary font-bold">Morale</FormLabel>
                      <span className="text-xs font-mono text-neutral-400">{field.value}%</span>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span>😞</span>
                        <input 
                          type="range" min="0" max="100" 
                          className="flex-1 accent-primary h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                        <span>🔥</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Est. Time (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        className="bg-neutral-950 border-neutral-800 focus:border-primary"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-estimate"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Rank</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800" data-testid="select-priority">
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-foreground">
                        <SelectItem value="genin">Genin (D-Rank)</SelectItem>
                        <SelectItem value="chunin">Chunin (C-Rank)</SelectItem>
                        <SelectItem value="jonin">Jonin (B/A-Rank)</SelectItem>
                        <SelectItem value="kage">Kage (S-Rank)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Affiliation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800" data-testid="select-village">
                          <SelectValue placeholder="Select village" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-foreground">
                        {SHINOBI_DATA.villages.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="character"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Shinobi Lead</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800" data-testid="select-character">
                          <SelectValue placeholder="Select character" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-foreground">
                        {SHINOBI_DATA.characters.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Squad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800" data-testid="select-team">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-foreground">
                        {SHINOBI_DATA.teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-neutral-700 hover:bg-neutral-800 hover:text-white" data-testid="cancel-create">
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" data-testid="submit-create">
                {createTask.isPending ? "Assigning..." : "Issue Mission"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
