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
import { ScrollText, Zap } from "lucide-react";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
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
      status: "pending"
    },
  });

  const onSubmit = (data: InsertTask) => {
    createTask.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xl tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200">
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
            Detail the mission parameters for the ninja squad.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold">Mission Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Retrieve the stolen scroll" className="bg-neutral-950 border-neutral-800 focus:border-primary" {...field} />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="happiness"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="text-primary font-bold">Initial Moral (Happiness)</FormLabel>
                    <span className="text-xs font-mono text-neutral-400">{field.value}%</span>
                  </div>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <span className="text-lg">😞</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className="flex-1 accent-primary h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                      <span className="text-lg">🔥</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Rank</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800">
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-neutral-700 hover:bg-neutral-800 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                {createTask.isPending ? "Assigning..." : "Issue Mission"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
