
import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "completed"] }).default("pending").notNull(),
  priority: text("priority", { enum: ["genin", "chunin", "jonin", "kage"] }).default("genin").notNull(),
  village: text("village").default("leaf").notNull(), 
  character: text("character").default("naruto").notNull(), // New field for character theme
  team: text("team").default("team7").notNull(), // New field for team theme
  happiness: integer("happiness").default(50).notNull(), // Happiness metric (0-100)
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const taskUpdates = pgTable("task_updates", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, completedAt: true });
export const insertTaskUpdateSchema = createInsertSchema(taskUpdates).omit({ id: true, createdAt: true });

// Types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = z.infer<typeof insertTaskUpdateSchema>;

// API Contract Types
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateUpdateRequest = InsertTaskUpdate;

export type TaskWithUpdates = Task & { updates: TaskUpdate[] };

export type ImportData = {
  tasks: Task[];
  updates: TaskUpdate[];
};
