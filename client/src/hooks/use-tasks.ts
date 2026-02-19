import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTaskRequest, type UpdateTaskRequest, type CreateUpdateRequest, type TaskWithUpdates, type ImportData } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

const NARUTO_QUOTES = [
  "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way!",
  "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be!",
  "Hard work is worthless for those that don't believe in themselves.",
  "A dropout will beat a genius through hard work!",
  "When people are protecting something truly special to them, they truly can become as strong as they can be.",
];

function getRandomQuote() {
  return NARUTO_QUOTES[Math.floor(Math.random() * NARUTO_QUOTES.length)];
}

export function useTasks() {
  return useQuery({
    queryKey: [api.tasks.list.path],
    queryFn: async () => {
      const res = await fetch(api.tasks.list.path);
      if (!res.ok) throw new Error("Failed to fetch missions");
      return await res.json() as TaskWithUpdates[];
    },
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: [api.tasks.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tasks.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch mission details");
      return await res.json() as TaskWithUpdates;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const res = await fetch(api.tasks.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to assign new mission");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({
        title: "Mission Assigned!",
        description: "A new mission has been added to your scroll.",
        className: "bg-primary text-primary-foreground border-2 border-black font-display tracking-wide",
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateTaskRequest) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update mission status");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      
      if (data.status === 'completed') {
        toast({
          title: "Mission Accomplished!",
          description: getRandomQuote(),
          className: "bg-green-600 text-white border-2 border-black font-display tracking-wide",
        });
      } else {
        toast({
          title: "Mission Updated",
          description: "Mission details have been modified.",
        });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to abandon mission");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({
        title: "Mission Abandoned",
        description: "The mission scroll has been burned.",
        variant: "destructive",
      });
    },
  });
}

export function useAddTaskUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: number; content: string }) => {
      const url = buildUrl(api.tasks.addUpdate.path, { id: taskId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to log mission update");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tasks.get.path, variables.taskId] });
      toast({
        title: "Log Entry Added",
        description: "Your ninja log has been updated.",
      });
    },
  });
}

export function useImportData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ImportData) => {
      const res = await fetch(api.data.import.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to unseal scroll data");
      return await res.json();
    },
    onSuccess: (data: { count: number }) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({
        title: "Scroll Unsealed!",
        description: `Successfully restored ${data.count} missions from the archive.`,
        className: "bg-accent text-accent-foreground border-2 border-black",
      });
    },
  });
}

export async function exportData() {
  const res = await fetch(api.data.export.path);
  if (!res.ok) throw new Error("Failed to seal scroll data");
  return await res.json() as ImportData;
}
