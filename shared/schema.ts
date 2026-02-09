import { pgTable, text, serial, integer, boolean, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models
export * from "./models/auth";

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  surahName: text("surah_name").notNull(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  arabicText: text("arabic_text").notNull(),
  translationText: text("translation_text").notNull(),
});

export const qada = pgTable("qada", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  prayerName: text("prayer_name").notNull(),
  count: integer("count").notNull().default(0),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  city: text("city").notNull().default("Mecca"),
  country: text("country").notNull().default("Saudi Arabia"),
  autoLocation: boolean("auto_location").notNull().default(false),
  tasbihCount: integer("tasbih_count").notNull().default(0),
  ramadanMode: boolean("ramadan_mode").notNull().default(false),
  quranGoalMinutes: integer("quran_goal_minutes").notNull().default(10),
  prayerNotifications: boolean("prayer_notifications").notNull().default(false),
  cycleMode: boolean("cycle_mode").notNull().default(false),
  cycleModeFirstTime: boolean("cycle_mode_first_time").notNull().default(true),
  userName: text("user_name"),
  coachQuestionsToday: integer("coach_questions_today").notNull().default(0),
  coachLastQuestionDate: text("coach_last_question_date"),
});

// Prayer progress tracking
export const prayerProgress = pgTable("prayer_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  date: date("date").notNull(),
  fajr: boolean("fajr").notNull().default(false),
  dhuhr: boolean("dhuhr").notNull().default(false),
  asr: boolean("asr").notNull().default(false),
  maghrib: boolean("maghrib").notNull().default(false),
  isha: boolean("isha").notNull().default(false),
});

// Quran reading sessions
export const quranReadingSessions = pgTable("quran_reading_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  date: date("date").notNull(),
  minutesRead: integer("minutes_read").notNull().default(0),
  lastSurahNumber: integer("last_surah_number"),
  lastAyahNumber: integer("last_ayah_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coach chat conversations
export const coachConversations = pgTable("coach_conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach chat messages
export const coachMessages = pgTable("coach_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily token usage tracking
export const tokenUsage = pgTable("token_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  tokensUsed: integer("tokens_used").notNull().default(0),
  requestCount: integer("request_count").notNull().default(0),
});

// Programme progress tracking (For You section)
export const programmeProgress = pgTable("programme_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  programmeId: text("programme_id").notNull(),
  currentDay: integer("current_day").notNull().default(0),
  completedDays: text("completed_days").notNull().default("[]"),
  journalEntries: text("journal_entries").notNull().default("{}"),
  emotionalCheckIns: text("emotional_check_ins").notNull().default("{}"),
  startedAt: timestamp("started_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quran reading bookmark (one per user)
export const quranBookmarks = pgTable("quran_bookmarks", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  surahName: text("surah_name").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });
export const insertQadaSchema = createInsertSchema(qada).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertPrayerProgressSchema = createInsertSchema(prayerProgress).omit({ id: true });
export const insertQuranReadingSessionSchema = createInsertSchema(quranReadingSessions).omit({ id: true, createdAt: true });
export const insertCoachConversationSchema = createInsertSchema(coachConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCoachMessageSchema = createInsertSchema(coachMessages).omit({ id: true, createdAt: true });
export const insertTokenUsageSchema = createInsertSchema(tokenUsage).omit({ id: true });

export type Favorite = typeof favorites.$inferSelect;
export type Qada = typeof qada.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type PrayerProgress = typeof prayerProgress.$inferSelect;
export type QuranReadingSession = typeof quranReadingSessions.$inferSelect;
export type CoachConversation = typeof coachConversations.$inferSelect;
export type CoachMessage = typeof coachMessages.$inferSelect;
export type TokenUsage = typeof tokenUsage.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertQada = z.infer<typeof insertQadaSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertPrayerProgress = z.infer<typeof insertPrayerProgressSchema>;
export type InsertQuranReadingSession = z.infer<typeof insertQuranReadingSessionSchema>;
export type InsertCoachConversation = z.infer<typeof insertCoachConversationSchema>;
export type InsertCoachMessage = z.infer<typeof insertCoachMessageSchema>;
export type InsertTokenUsage = z.infer<typeof insertTokenUsageSchema>;

export type ProgrammeProgress = typeof programmeProgress.$inferSelect;
export type QuranBookmark = typeof quranBookmarks.$inferSelect;
