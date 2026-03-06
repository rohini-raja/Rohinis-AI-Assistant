
import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "completed", "archived"] }).default("pending").notNull(),
  priority: text("priority", { enum: ["genin", "chunin", "jonin", "kage"] }).default("genin").notNull(),
  village: text("village").default("leaf").notNull(), 
  character: text("character").default("naruto").notNull(),
  team: text("team").default("team7").notNull(),
  happiness: integer("happiness").default(50).notNull(),
  chakra: integer("chakra").default(100).notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringInterval: text("recurring_interval"), // "daily", "weekly", etc.
  lastChakraUpdate: timestamp("last_chakra_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  experience: integer("experience").default(0).notNull(),
  level: text("level").default("genin").notNull(),
  unlockedVillages: text("unlocked_villages").array().default(["leaf"]).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskUpdates = pgTable("task_updates", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quickNotes = pgTable("quick_notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, completedAt: true });
export const insertTaskUpdateSchema = createInsertSchema(taskUpdates).omit({ id: true, createdAt: true });
export const insertQuickNoteSchema = createInsertSchema(quickNotes).omit({ id: true, createdAt: true });

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = z.infer<typeof insertTaskUpdateSchema>;
export type QuickNote = typeof quickNotes.$inferSelect;
export type InsertQuickNote = z.infer<typeof insertQuickNoteSchema>;

export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateUpdateRequest = InsertTaskUpdate;
export type TaskWithUpdates = Task & { updates: TaskUpdate[] };
export type ImportData = {
  tasks: Task[];
  updates: TaskUpdate[];
};
