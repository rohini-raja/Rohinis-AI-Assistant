
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "completed", "archived"] }).default("pending").notNull(),
  priority: text("priority", { enum: ["genin", "chunin", "jonin", "kage"] }).default("genin").notNull(),
  village: text("village").default("leaf").notNull(),
  character: text("character").default("naruto").notNull(),
  team: text("team").default("team7").notNull(),
  happiness: integer("happiness").default(50).notNull(),
  chakra: integer("chakra").default(100).notNull(),
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false).notNull(),
  recurringInterval: text("recurring_interval"),
  estimatedMinutes: integer("estimated_minutes"),
  lastChakraUpdate: integer("last_chakra_update", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const userStats = sqliteTable("user_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  totalXp: integer("total_xp").default(0).notNull(),
  ninjaRank: text("ninja_rank").default("academy").notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  totalCompleted: integer("total_completed").default(0).notNull(),
  totalCreated: integer("total_created").default(0).notNull(),
  lastActiveDate: text("last_active_date"),
  experience: integer("experience").default(0).notNull(),
  level: text("level").default("genin").notNull(),
  unlockedVillages: blob("unlocked_villages", { mode: "json" }).$type<string[]>().$defaultFn(() => ["leaf"]).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  unlockedAt: integer("unlocked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const taskUpdates = sqliteTable("task_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const quickNotes = sqliteTable("quick_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const packingItems = sqliteTable("packing_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  category: text("category", { enum: ["weapons", "scrolls", "provisions", "attire", "medical", "tools"] }).default("tools").notNull(),
  packed: integer("packed", { mode: "boolean" }).default(false).notNull(),
  listName: text("list_name").default("default").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertPackingItemSchema = createInsertSchema(packingItems).omit({ id: true, createdAt: true });
export type PackingItem = typeof packingItems.$inferSelect;
export type InsertPackingItem = z.infer<typeof insertPackingItemSchema>;

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  chakra: true,
  lastChakraUpdate: true
});
export const insertTaskUpdateSchema = createInsertSchema(taskUpdates).omit({ id: true, createdAt: true });
export const insertQuickNoteSchema = createInsertSchema(quickNotes).omit({ id: true, createdAt: true });

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = z.infer<typeof insertTaskUpdateSchema>;
export type QuickNote = typeof quickNotes.$inferSelect;
export type InsertQuickNote = z.infer<typeof insertQuickNoteSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateUpdateRequest = InsertTaskUpdate;
export type TaskWithUpdates = Task & { updates: TaskUpdate[] };
export type ImportData = {
  tasks: Task[];
  updates: TaskUpdate[];
};
