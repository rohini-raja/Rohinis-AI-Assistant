
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
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

  // Export Data
  app.get(api.data.export.path, async (_req, res) => {
    const tasks = await storage.getTasks();
    const flatTasks = tasks.map(({ updates, ...t }) => t);
    const flatUpdates = tasks.flatMap(t => t.updates);

    res.json({
      tasks: flatTasks,
      updates: flatUpdates
    });
  });

  // Import Data
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

  // Quick Notes API
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

    const task2 = await storage.createTask({
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
