
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getRankForXp } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const XP_TABLE: Record<string, number> = {
  genin: 10,
  chunin: 25,
  jonin: 50,
  kage: 100,
};

const ACHIEVEMENT_DEFS = [
  { key: "first_mission", title: "First Steps", desc: "Complete your first mission", icon: "🎯", check: (s: any) => s.totalCompleted >= 1 },
  { key: "five_missions", title: "Genin Graduate", desc: "Complete 5 missions", icon: "🎓", check: (s: any) => s.totalCompleted >= 5 },
  { key: "ten_missions", title: "Chunin Exam", desc: "Complete 10 missions", icon: "📜", check: (s: any) => s.totalCompleted >= 10 },
  { key: "twentyfive_missions", title: "Jonin Promotion", desc: "Complete 25 missions", icon: "⚡", check: (s: any) => s.totalCompleted >= 25 },
  { key: "fifty_missions", title: "ANBU Captain", desc: "Complete 50 missions", icon: "🗡️", check: (s: any) => s.totalCompleted >= 50 },
  { key: "hundred_missions", title: "Shadow Hokage", desc: "Complete 100 missions", icon: "👑", check: (s: any) => s.totalCompleted >= 100 },
  { key: "streak_3", title: "Will of Fire", desc: "Maintain a 3-day streak", icon: "🔥", check: (s: any) => s.currentStreak >= 3 },
  { key: "streak_7", title: "Burning Youth", desc: "Maintain a 7-day streak", icon: "💪", check: (s: any) => s.currentStreak >= 7 },
  { key: "streak_14", title: "Sage's Patience", desc: "Maintain a 14-day streak", icon: "🐸", check: (s: any) => s.currentStreak >= 14 },
  { key: "streak_30", title: "Legendary Sannin", desc: "Maintain a 30-day streak", icon: "🐍", check: (s: any) => s.currentStreak >= 30 },
  { key: "xp_500", title: "Chakra Awakening", desc: "Earn 500 XP", icon: "💫", check: (s: any) => s.totalXp >= 500 },
  { key: "xp_1500", title: "Eight Gates Open", desc: "Earn 1500 XP", icon: "🌀", check: (s: any) => s.totalXp >= 1500 },
  { key: "xp_5000", title: "Sage Mode Mastered", desc: "Earn 5000 XP", icon: "🧘", check: (s: any) => s.totalXp >= 5000 },
  { key: "rank_genin", title: "Headband Earned", desc: "Reach Genin rank", icon: "🥋", check: (s: any) => ["genin","chunin","jonin","anbu","kage"].includes(s.ninjaRank) },
  { key: "rank_chunin", title: "Tactical Mind", desc: "Reach Chunin rank", icon: "🧠", check: (s: any) => ["chunin","jonin","anbu","kage"].includes(s.ninjaRank) },
  { key: "rank_jonin", title: "Elite Shinobi", desc: "Reach Jonin rank", icon: "⭐", check: (s: any) => ["jonin","anbu","kage"].includes(s.ninjaRank) },
  { key: "rank_kage", title: "Village Leader", desc: "Reach Kage rank", icon: "🏔️", check: (s: any) => s.ninjaRank === "kage" },
];

async function checkAndUnlockAchievements(stats: any) {
  const unlocked: any[] = [];
  for (const def of ACHIEVEMENT_DEFS) {
    if (def.check(stats)) {
      const result = await storage.unlockAchievement(def.key, def.title, def.desc, def.icon);
      if (result) unlocked.push(result);
    }
  }
  return unlocked;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.tasks.list.path, async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      
      const stats = await storage.getStats();
      await storage.updateStats({ totalCreated: stats.totalCreated + 1 });

      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const id = Number(req.params.id);
      const existingTask = await storage.getTask(id);
      
      const task = await storage.updateTask(id, input);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (input.status === 'completed' && existingTask?.status === 'pending') {
        const xpGained = XP_TABLE[task.priority] || 10;
        const stats = await storage.getStats();
        const today = getTodayStr();
        const yesterday = getYesterdayStr();
        
        let newStreak = stats.currentStreak;
        if (stats.lastActiveDate === today) {
        } else if (stats.lastActiveDate === yesterday) {
          newStreak = stats.currentStreak + 1;
        } else {
          newStreak = 1;
        }
        
        const newXp = stats.totalXp + xpGained;
        const newRank = getRankForXp(newXp);
        const newLongest = Math.max(stats.longestStreak, newStreak);
        
        const updatedStats = await storage.updateStats({
          totalXp: newXp,
          totalCompleted: stats.totalCompleted + 1,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
          ninjaRank: newRank,
        });

        await checkAndUnlockAchievements(updatedStats);

        if (task.isRecurring) {
          await storage.createTask({
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: task.priority,
            village: task.village,
            character: task.character,
            team: task.team,
            happiness: task.happiness,
            isRecurring: task.isRecurring,
            recurringInterval: task.recurringInterval,
            estimatedMinutes: task.estimatedMinutes,
          });
        }
      }

      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        console.error("Update error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).end();
  });

  app.post(api.tasks.addUpdate.path, async (req, res) => {
    try {
      const input = api.tasks.addUpdate.input.parse(req.body);
      const task = await storage.getTask(Number(req.params.id));
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      const update = await storage.createTaskUpdate({
        taskId: Number(req.params.id),
        content: input.content
      });
      res.status(201).json(update);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.data.export.path, async (_req, res) => {
    const tasks = await storage.getTasks();
    const flatTasks = tasks.map(({ updates, ...t }) => t);
    const flatUpdates = tasks.flatMap(t => t.updates);
    res.json({ tasks: flatTasks, updates: flatUpdates });
  });

  app.post(api.data.import.path, async (req, res) => {
    try {
      const data = req.body;
      if (!Array.isArray(data.tasks) || !Array.isArray(data.updates)) {
        return res.status(400).json({ message: "Invalid data format" });
      }
      await storage.importData(data);
      res.json({ success: true, count: data.tasks.length });
    } catch (err) {
      res.status(500).json({ message: "Import failed" });
    }
  });

  app.get("/api/notes", async (_req, res) => {
    const notes = await storage.getQuickNotes();
    res.json(notes);
  });

  app.post("/api/notes", async (req, res) => {
    const note = await storage.createQuickNote(req.body);
    res.status(201).json(note);
  });

  app.patch("/api/notes/:id", async (req, res) => {
    const note = await storage.updateQuickNote(Number(req.params.id), req.body.completed);
    res.json(note);
  });

  app.delete("/api/notes/:id", async (req, res) => {
    await storage.deleteQuickNote(Number(req.params.id));
    res.status(204).end();
  });

  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/achievements", async (_req, res) => {
    const achvs = await storage.getAchievements();
    const allDefs = ACHIEVEMENT_DEFS.map(def => {
      const unlocked = achvs.find(a => a.key === def.key);
      return {
        key: def.key,
        title: def.title,
        description: def.desc,
        icon: def.icon,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
      };
    });
    res.json(allDefs);
  });

  return httpServer;
}

async function seedDatabase() {
  const tasks = await storage.getTasks();
  if (tasks.length === 0) {
    const task1 = await storage.createTask({
      title: "Master the Rasengan",
      description: "Practice chakra control and rotation. Ask Jiraiya-sensei for tips.",
      status: "pending",
      priority: "jonin",
      village: "leaf",
      character: "naruto",
      team: "team7",
      happiness: 60
    });
    await storage.createTaskUpdate({
      taskId: task1.id,
      content: "Step 1: Rotation complete. Used a water balloon."
    });

    await storage.createTask({
      title: "Deliver Secret Scroll to Sand Village",
      description: "Urgent mission from Lady Tsunade. Watch out for rogue ninjas.",
      status: "pending",
      priority: "chunin",
      village: "sand",
      character: "sakura",
      team: "team7",
      happiness: 80
    });

    await storage.createTask({
      title: "Eat Ichiraku Ramen",
      description: "Get the Miso Chashu Pork special with extra naruto.",
      status: "completed",
      priority: "genin",
      village: "leaf",
      character: "naruto",
      team: "team7",
      happiness: 100
    });
  }
}

seedDatabase().catch(console.error);
