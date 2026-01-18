import { favorites, qada, settings, prayerProgress, quranReadingSessions, type Favorite, type InsertFavorite, type Qada, type Settings, type InsertQada, type InsertSettings, type PrayerProgress, type InsertPrayerProgress, type QuranReadingSession, type InsertQuranReadingSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getFavorites(): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
  
  getQada(): Promise<Qada[]>;
  updateQada(prayerName: string, count: number): Promise<Qada>;
  
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
  
  getPrayerProgress(startDate: string, endDate: string): Promise<PrayerProgress[]>;
  getPrayerProgressForDate(date: string): Promise<PrayerProgress | null>;
  updatePrayerProgress(date: string, prayer: string, completed: boolean): Promise<PrayerProgress>;
  
  getQuranReadingSessions(startDate: string, endDate: string): Promise<QuranReadingSession[]>;
  getTodayQuranSession(): Promise<QuranReadingSession | null>;
  updateQuranSession(data: InsertQuranReadingSession): Promise<QuranReadingSession>;
}

export class DatabaseStorage implements IStorage {
  async getFavorites(): Promise<Favorite[]> {
    return await db.select().from(favorites);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  async getQada(): Promise<Qada[]> {
    return await db.select().from(qada);
  }

  async updateQada(prayerName: string, count: number): Promise<Qada> {
    const existing = await db.select().from(qada).where(eq(qada.prayerName, prayerName));
    if (existing.length === 0) {
      const [newItem] = await db.insert(qada).values({ prayerName, count }).returning();
      return newItem;
    }
    const [updated] = await db.update(qada).set({ count }).where(eq(qada.prayerName, prayerName)).returning();
    return updated;
  }

  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings);
    if (!existing) {
      const [newSettings] = await db.insert(settings).values({}).returning();
      return newSettings;
    }
    return existing;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings();
    const [updated] = await db.update(settings).set(updates).where(eq(settings.id, existing.id)).returning();
    return updated;
  }

  async getPrayerProgress(startDate: string, endDate: string): Promise<PrayerProgress[]> {
    const { and, gte, lte } = await import("drizzle-orm");
    return await db.select().from(prayerProgress)
      .where(and(gte(prayerProgress.date, startDate), lte(prayerProgress.date, endDate)));
  }

  async getPrayerProgressForDate(date: string): Promise<PrayerProgress | null> {
    const [existing] = await db.select().from(prayerProgress).where(eq(prayerProgress.date, date));
    return existing || null;
  }

  async updatePrayerProgress(date: string, prayer: string, completed: boolean): Promise<PrayerProgress> {
    const existing = await this.getPrayerProgressForDate(date);
    const prayerKey = prayer.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    
    if (!existing) {
      const [newProgress] = await db.insert(prayerProgress).values({
        date,
        [prayerKey]: completed,
      }).returning();
      return newProgress;
    }
    
    const [updated] = await db.update(prayerProgress)
      .set({ [prayerKey]: completed })
      .where(eq(prayerProgress.id, existing.id))
      .returning();
    return updated;
  }

  async getQuranReadingSessions(startDate: string, endDate: string): Promise<QuranReadingSession[]> {
    const { and, gte, lte } = await import("drizzle-orm");
    return await db.select().from(quranReadingSessions)
      .where(and(gte(quranReadingSessions.date, startDate), lte(quranReadingSessions.date, endDate)));
  }

  async getTodayQuranSession(): Promise<QuranReadingSession | null> {
    const today = new Date().toISOString().split('T')[0];
    const [existing] = await db.select().from(quranReadingSessions).where(eq(quranReadingSessions.date, today));
    return existing || null;
  }

  async updateQuranSession(data: InsertQuranReadingSession): Promise<QuranReadingSession> {
    const existing = await this.getTodayQuranSession();
    
    if (!existing) {
      const [newSession] = await db.insert(quranReadingSessions).values(data).returning();
      return newSession;
    }
    
    const [updated] = await db.update(quranReadingSessions)
      .set({ 
        minutesRead: data.minutesRead,
        lastSurahNumber: data.lastSurahNumber,
        lastAyahNumber: data.lastAyahNumber,
      })
      .where(eq(quranReadingSessions.id, existing.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
