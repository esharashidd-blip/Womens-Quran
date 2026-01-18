import { favorites, qada, settings, type Favorite, type InsertFavorite, type Qada, type Settings, type InsertQada, type InsertSettings } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
