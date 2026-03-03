import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTaskRequest, type UpdateTaskRequest, type CreateUpdateRequest, type TaskWithUpdates, type ImportData } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export const SHINOBI_DATA = {
  characters: [
    { id: "naruto", name: "Naruto Uzumaki", village: "leaf", team: "team7", quote: "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way!" },
    { id: "sasuke", name: "Sasuke Uchiha", village: "leaf", team: "team7", quote: "I have long since closed my eyes... My only goal is in the darkness." },
    { id: "sakura", name: "Sakura Haruno", village: "leaf", team: "team7", quote: "The things that are most important aren't written in books. You have to learn them by experiencing them yourself." },
    { id: "kakashi", name: "Kakashi Hatake", village: "leaf", team: "team7", quote: "In the ninja world, those who break the rules are scum, that's true, but those who abandon their friends are worse than scum." },
    { id: "itachi", name: "Itachi Uchiha", village: "leaf", team: "akatsuki", quote: "It is not that if you become Hokage, everyone will acknowledge you. It is the one who is acknowledged by everyone that becomes Hokage." },
    { id: "pain", name: "Pain", village: "rain", team: "akatsuki", quote: "Justice comes from vengeance, but that justice only breeds more vengeance." },
    { id: "gaara", name: "Gaara", village: "sand", team: "sand_siblings", quote: "Perhaps the companionship of an evil person is preferable to loneliness." },
    { id: "madara", name: "Madara Uchiha", village: "leaf", team: "legendary", quote: "Wake up to reality! Nothing ever goes as planned in this world." },
    { id: "jiraiya", name: "Jiraiya", village: "leaf", team: "sannin", quote: "A person's life is not measured by what they do but by what they've done for others." },
    { id: "tsunade", name: "Tsunade", village: "leaf", team: "sannin", quote: "People become stronger because they have memories they can't forget." },
    { id: "gaara_kage", name: "Gaara (Kazekage)", village: "sand", team: "kage", quote: "I live only for myself and love only myself." },
    { id: "a_kage", name: "A (Raikage)", village: "cloud", team: "kage", quote: "A shinobi's life is a constant battle." },
    { id: "mei_kage", name: "Mei Terumi (Mizukage)", village: "mist", team: "kage", quote: "I'll give you a kiss that'll melt you away." },
    { id: "ohnoki_kage", name: "Ohnoki (Tsuchikage)", village: "rock", team: "kage", quote: "Don't underestimate the experience of an old man!" },
    { id: "kakashi_hokage", name: "Kakashi Hatake (6th)", village: "leaf", team: "hokage", quote: "I will protect my comrades no matter what." },
    { id: "hashirama", name: "Hashirama Senju", village: "leaf", team: "hokage", quote: "Whenever you live, there will always be war." },
    { id: "tobirama", name: "Tobirama Senju", village: "leaf", team: "hokage", quote: "The Uchiha are a clan possessed by evil." },
    { id: "hiruzen", name: "Hiruzen Sarutobi", village: "leaf", team: "hokage", quote: "Where the tree leaves dance, one shall find flames." },
    { id: "minato", name: "Minato Namikaze", village: "leaf", team: "hokage", quote: "The true measure of a shinobi is not how he lives but how he dies." },
  ],
  quotes: [
    { text: "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way!", author: "Naruto Uzumaki" },
    { text: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be!", author: "Naruto Uzumaki" },
    { text: "In the ninja world, those who break the rules are scum, that's true, but those who abandon their friends are worse than scum.", author: "Kakashi Hatake" },
    { text: "Hard work is worthless for those that don't believe in themselves.", author: "Naruto Uzumaki" },
    { text: "It is not that if you become Hokage, everyone will acknowledge you. It is the one who is acknowledged by everyone that becomes Hokage.", author: "Itachi Uchiha" },
    { text: "The things that are most important aren't written in books. You have to learn them by experiencing them yourself.", author: "Sakura Haruno" },
    { text: "Wake up to reality! Nothing ever goes as planned in this world.", author: "Madara Uchiha" },
    { text: "A person's life is not measured by what they do but by what they've done for others.", author: "Jiraiya" },
    { text: "Those who do not understand true pain can never understand true peace.", author: "Pain" },
    { text: "Fear. That is what we live with. And we live it every day. Only in death are we free of it.", author: "Neji Hyuga" },
  ],
  dialogues: {
    overwhelmed: [
      { text: "So many missions... even for a shadow clone it's a lot! Focus, shinobi!", author: "Naruto Uzumaki" },
      { text: "The village relies on us. We must prioritize the high-rank missions first.", author: "Kakashi Hatake" },
    ],
    productive: [
      { text: "Your progress is impressive. The Will of Fire burns brightly in you!", author: "Hiruzen Sarutobi" },
      { text: "Keep this pace up and you'll be Chunin in no time.", author: "Iruka Umino" },
    ],
    idle: [
      { text: "A ninja who doesn't take missions is just a civilian with a headband. Get to work!", author: "Tsunade" },
      { text: "The scroll remains empty. Is this your ninja way?", author: "Sasuke Uchiha" },
    ],
    victorious: [
      { text: "Mission accomplished! Ichiraku Ramen is on me today!", author: "Naruto Uzumaki" },
      { text: "Excellent work. Your coordination was perfect.", author: "Minato Namikaze" },
    ]
  },
  teams: [
    { id: "team7", name: "Team 7", color: "orange" },
    { id: "akatsuki", name: "Akatsuki", color: "red" },
    { id: "sand_siblings", name: "Sand Siblings", color: "yellow" },
    { id: "sannin", name: "Legendary Sannin", color: "green" },
    { id: "hokage", name: "Hokage", color: "red" },
    { id: "kage", name: "Five Kage", color: "purple" },
  ],
  villages: [
    { id: "leaf", name: "Hidden Leaf", color: "24 95% 53%" },
    { id: "sand", name: "Hidden Sand", color: "40 80% 60%" },
    { id: "mist", name: "Hidden Mist", color: "200 80% 60%" },
    { id: "cloud", name: "Hidden Cloud", color: "260 70% 70%" },
    { id: "rock", name: "Hidden Rock", color: "15 50% 40%" },
    { id: "meeting", name: "Hokage Summit", color: "0 100% 50%" },
  ]
};

const NARUTO_QUOTES = SHINOBI_DATA.characters.map(c => c.quote);

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      
      if (data.status === 'completed') {
        const char = SHINOBI_DATA.characters.find(c => c.id === data.character);
        const quote = char ? char.quote : getRandomQuote();
        
        toast({
          title: `${char?.name || 'Shinobi'} says:`,
          description: quote,
          className: "bg-green-600 text-white border-2 border-black font-shinobi text-lg tracking-wide",
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
