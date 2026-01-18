import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.favorites.list.path, async (req, res) => {
    const favorites = await storage.getFavorites();
    res.json(favorites);
  });

  app.post(api.favorites.create.path, async (req, res) => {
    try {
      const input = api.favorites.create.input.parse(req.body);
      const favorite = await storage.createFavorite(input);
      res.status(201).json(favorite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.favorites.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteFavorite(id);
    res.status(204).send();
  });

  app.get(api.qada.list.path, async (req, res) => {
    const items = await storage.getQada();
    res.json(items);
  });

  app.post(api.qada.update.path, async (req, res) => {
    const { prayerName } = req.params;
    const { count } = req.body;
    const updated = await storage.updateQada(prayerName, count);
    res.json(updated);
  });

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  // Seeding
  const existingFavorites = await storage.getFavorites();
  if (existingFavorites.length === 0) {
    await storage.createFavorite({
      surahName: "Al-Fatiha",
      surahNumber: 1,
      ayahNumber: 1,
      arabicText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translationText: "In the name of God, The Most Gracious, The Dispenser of Grace:"
    });
  }

  const existingQada = await storage.getQada();
  if (existingQada.length === 0) {
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    for (const prayer of prayers) {
      await storage.updateQada(prayer, 0);
    }
  }

  return httpServer;
}
