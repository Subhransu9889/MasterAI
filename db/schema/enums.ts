import { pgEnum } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['user', 'admin']);

export const conversationRole = pgEnum('conversation_role', [
  'user',
  'assistant',
  'system',
]);

export const recommendationCategory = pgEnum('recommendation_category', [
  'course',
  'skill',
  'project',
  'book',
  'career_tip',
]);

export const recommendationStatus = pgEnum('recommendation_status', [
  'new',
  'saved',
  'dismissed',
  'completed',
]);

export const taskStatus = pgEnum('task_status', [
  'todo',
  'in_progress',
  'done',
  'archived',
]);

export const notificationType = pgEnum('notification_type', [
  'recommendation',
  'chat',
  'profile',
  'system',
]);

export const notificationStatus = pgEnum('notification_status', [
  'unread',
  'read',
  'archived',
]);

export const memorySource = pgEnum('memory_source', [
  'profile',
  'conversation',
  'recommendation',
  'manual',
]);
