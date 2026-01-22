import { pgTable, text, serial, integer, boolean, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User ID type - references Supabase auth.users
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  surahName: text("surah_name").notNull(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  arabicText: text("arabic_text").notNull(),
  translationText: text("translation_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qada = pgTable("qada", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  prayerName: text("prayer_name").notNull(),
  count: integer("count").notNull().default(0),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  userName: text("user_name"),
  city: text("city").notNull().default("Mecca"),
  country: text("country").notNull().default("Saudi Arabia"),
  autoLocation: boolean("auto_location").notNull().default(false),
  tasbihCount: integer("tasbih_count").notNull().default(0),
  ramadanMode: boolean("ramadan_mode").notNull().default(false),
  cycleMode: boolean("cycle_mode").notNull().default(false),
  cycleModeFirstTime: boolean("cycle_mode_first_time").notNull().default(true),
  quranGoalMinutes: integer("quran_goal_minutes").notNull().default(10),
  prayerNotifications: boolean("prayer_notifications").notNull().default(false),
  coachQuestionsToday: integer("coach_questions_today").notNull().default(0),
  coachLastQuestionDate: text("coach_last_question_date"),
});

// Prayer progress tracking
export const prayerProgress = pgTable("prayer_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
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
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  minutesRead: integer("minutes_read").notNull().default(0),
  lastSurahNumber: integer("last_surah_number"),
  lastAyahNumber: integer("last_ayah_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, userId: true, createdAt: true });
export const insertQadaSchema = createInsertSchema(qada).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertPrayerProgressSchema = createInsertSchema(prayerProgress).omit({ id: true });
export const insertQuranReadingSessionSchema = createInsertSchema(quranReadingSessions).omit({ id: true, createdAt: true });

export type Favorite = typeof favorites.$inferSelect;
export type Qada = typeof qada.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type PrayerProgress = typeof prayerProgress.$inferSelect;
export type QuranReadingSession = typeof quranReadingSessions.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertQada = z.infer<typeof insertQadaSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertPrayerProgress = z.infer<typeof insertPrayerProgressSchema>;
export type InsertQuranReadingSession = z.infer<typeof insertQuranReadingSessionSchema>;

// Guided Programme Progress tracking
export const programmeProgress = pgTable("programme_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  programmeId: text("programme_id").notNull(), // e.g., "anxiety", "heartbreak"
  currentDay: integer("current_day").notNull().default(0),
  completedDays: text("completed_days").notNull().default("[]"), // JSON array of completed day numbers
  startedAt: timestamp("started_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  journalEntries: text("journal_entries").notNull().default("{}"), // JSON object of journal entries
  emotionalCheckIns: text("emotional_check_ins").notNull().default("{}"), // JSON object of emotional check-ins
});

export const insertProgrammeProgressSchema = createInsertSchema(programmeProgress).omit({ id: true, startedAt: true, lastAccessedAt: true });
export type ProgrammeProgress = typeof programmeProgress.$inferSelect;
export type InsertProgrammeProgress = z.infer<typeof insertProgrammeProgressSchema>;
