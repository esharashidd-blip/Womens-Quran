import { z } from 'zod';
import { insertFavoriteSchema, favorites, qada, settings, insertQadaSchema, insertSettingsSchema } from './schema';

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

// Input schema for favorites - userId comes from auth token, not client
const favoriteInputSchema = insertFavoriteSchema;

export const api = {
  favorites: {
    list: {
      method: 'GET' as const,
      path: '/api/favorites',
      responses: {
        200: z.array(z.custom<typeof favorites.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/favorites',
      input: favoriteInputSchema,
      responses: {
        201: z.custom<typeof favorites.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/favorites/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  qada: {
    list: {
      method: 'GET' as const,
      path: '/api/qada',
      responses: {
        200: z.array(z.custom<typeof qada.$inferSelect>()),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/qada/:prayerName',
      input: z.object({ count: z.number() }),
      responses: {
        200: z.custom<typeof qada.$inferSelect>(),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
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
