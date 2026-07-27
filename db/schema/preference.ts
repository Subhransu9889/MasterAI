import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './user';

export const preferences = pgTable(
  'preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    profession: text('profession').notNull(),
    interests: jsonb('interests').$type<string[]>().notNull().default([]),
    goals: jsonb('goals').$type<string[]>().notNull().default([]),
    preferredLanguage: text('preferred_language').notNull().default('English'),
    learningLevel: text('learning_level').default('beginner'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('preferences_user_id_idx').on(table.userId),
    index('preferences_profession_idx').on(table.profession),
  ],
);

export type Preference = typeof preferences.$inferSelect;
export type NewPreference = typeof preferences.$inferInsert;
