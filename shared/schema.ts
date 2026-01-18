import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  prayerName: text("prayer_name").notNull(),
  count: integer("count").notNull().default(0),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  city: text("city").notNull().default("Mecca"),
  country: text("country").notNull().default("Saudi Arabia"),
  autoLocation: boolean("auto_location").notNull().default(false),
  tasbihCount: integer("tasbih_count").notNull().default(0),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });
export const insertQadaSchema = createInsertSchema(qada).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type Favorite = typeof favorites.$inferSelect;
export type Qada = typeof qada.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertQada = z.infer<typeof insertQadaSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
