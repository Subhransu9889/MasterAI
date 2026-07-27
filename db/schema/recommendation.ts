import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import {
  recommendationCategory,
  recommendationStatus,
} from './enums';
import { users } from './user';

export const recommendations = pgTable(
  'recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: recommendationCategory('category').notNull(),
    status: recommendationStatus('status').notNull().default('new'),
    title: text('title').notNull(),
    description: text('description').notNull(),
    reason: text('reason'),
    resourceUrl: text('resource_url'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    priority: integer('priority').notNull().default(0),
    generatedAt: timestamp('generated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('recommendations_user_id_idx').on(table.userId),
    index('recommendations_category_idx').on(table.category),
    index('recommendations_status_idx').on(table.status),
    index('recommendations_generated_at_idx').on(table.generatedAt),
  ],
);

export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;
