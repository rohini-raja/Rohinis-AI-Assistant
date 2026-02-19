
// shared/routes.ts
import { z } from 'zod';
import { insertTaskSchema, insertTaskUpdateSchema, tasks, taskUpdates } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect & { updates: typeof taskUpdates.$inferSelect[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        200: z.custom<typeof tasks.$inferSelect & { updates: typeof taskUpdates.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id' as const,
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    addUpdate: {
      method: 'POST' as const,
      path: '/api/tasks/:id/updates' as const,
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof taskUpdates.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  data: {
    export: {
      method: 'GET' as const,
      path: '/api/data/export' as const,
      responses: {
        200: z.object({
          tasks: z.array(z.custom<typeof tasks.$inferSelect>()),
          updates: z.array(z.custom<typeof taskUpdates.$inferSelect>()),
        }),
      },
    },
    import: {
      method: 'POST' as const,
      path: '/api/data/import' as const,
      input: z.object({
        tasks: z.array(z.any()),
        updates: z.array(z.any()),
      }),
      responses: {
        200: z.object({ success: z.boolean(), count: z.number() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreateTaskRequest = z.infer<typeof api.tasks.create.input>;
export type UpdateTaskRequest = z.infer<typeof api.tasks.update.input>;
export type CreateUpdateRequest = z.infer<typeof api.tasks.addUpdate.input>;
export type TaskWithUpdates = z.infer<typeof api.tasks.list.responses[200]>[number];
export type ImportData = z.infer<typeof api.data.export.responses[200]>;

