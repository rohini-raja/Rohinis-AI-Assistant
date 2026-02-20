
import { db } from "./db";
import { tasks, taskUpdates, quickNotes, type Task, type InsertTask, type TaskUpdate, type InsertTaskUpdate, type QuickNote, type InsertQuickNote } from "@shared/schema";
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

  // Quick Notes
  getQuickNotes(): Promise<QuickNote[]>;
  createQuickNote(note: InsertQuickNote): Promise<QuickNote>;
  updateQuickNote(id: number, completed: boolean): Promise<QuickNote | undefined>;
  deleteQuickNote(id: number): Promise<void>;

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

  async getQuickNotes(): Promise<QuickNote[]> {
    return db.select().from(quickNotes).orderBy(desc(quickNotes.createdAt));
  }

  async createQuickNote(note: InsertQuickNote): Promise<QuickNote> {
    const [newNote] = await db.insert(quickNotes).values(note).returning();
    return newNote;
  }

  async updateQuickNote(id: number, completed: boolean): Promise<QuickNote | undefined> {
    const [updatedNote] = await db.update(quickNotes).set({ completed }).where(eq(quickNotes.id, id)).returning();
    return updatedNote;
  }

  async deleteQuickNote(id: number): Promise<void> {
    await db.delete(quickNotes).where(eq(quickNotes.id, id));
  }

  async importData(data: { tasks: Task[], updates: TaskUpdate[] }): Promise<void> {
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
