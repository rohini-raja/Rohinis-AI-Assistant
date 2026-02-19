
import { db } from "./db";
import { tasks, taskUpdates, type Task, type InsertTask, type TaskUpdate, type InsertTaskUpdate } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Tasks
  getTasks(): Promise<(Task & { updates: TaskUpdate[] })[]>;
  getTask(id: number): Promise<(Task & { updates: TaskUpdate[] }) | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Updates
  createTaskUpdate(update: InsertTaskUpdate): Promise<TaskUpdate>;
  getTaskUpdates(taskId: number): Promise<TaskUpdate[]>;

  // Import/Export
  importData(data: { tasks: Task[], updates: TaskUpdate[] }): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTasks(): Promise<(Task & { updates: TaskUpdate[] })[]> {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    const allUpdates = await db.select().from(taskUpdates).orderBy(desc(taskUpdates.createdAt));

    return allTasks.map(task => ({
      ...task,
      updates: allUpdates.filter(u => u.taskId === task.id)
    }));
  }

  async getTask(id: number): Promise<(Task & { updates: TaskUpdate[] }) | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;

    const updates = await db.select().from(taskUpdates).where(eq(taskUpdates.taskId, id)).orderBy(desc(taskUpdates.createdAt));
    return { ...task, updates };
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async createTaskUpdate(update: InsertTaskUpdate): Promise<TaskUpdate> {
    const [newUpdate] = await db.insert(taskUpdates).values(update).returning();
    return newUpdate;
  }

  async getTaskUpdates(taskId: number): Promise<TaskUpdate[]> {
    return db.select().from(taskUpdates).where(eq(taskUpdates.taskId, taskId)).orderBy(desc(taskUpdates.createdAt));
  }

  async importData(data: { tasks: Task[], updates: TaskUpdate[] }): Promise<void> {
    // Basic import logic: clear existing and insert new
    // In a real app, maybe merge or check for conflicts. Here we overwrite for simplicity as requested "import the same".
    await db.delete(taskUpdates);
    await db.delete(tasks);

    if (data.tasks.length > 0) {
      await db.insert(tasks).values(data.tasks);
    }
    if (data.updates.length > 0) {
      await db.insert(taskUpdates).values(data.updates);
    }
  }
}

export const storage = new DatabaseStorage();
