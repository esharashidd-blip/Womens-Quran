import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth before other routes
  await setupAuth(app);
  registerAuthRoutes(app);
  // Favorites routes
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
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteFavorite(id);
    res.status(204).send();
  });

  // Qada routes
  app.get(api.qada.list.path, async (req, res) => {
    const qadaList = await storage.getQada();
    res.json(qadaList);
  });

  app.post("/api/qada/:prayerName", async (req, res) => {
    try {
      const prayerName = req.params.prayerName;
      const { count } = req.body;
      const updated = await storage.updateQada(prayerName, count);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings routes
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    try {
      const updates = req.body;
      const updated = await storage.updateSettings(updates);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prayer progress routes
  app.get("/api/prayer-progress", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const progress = await storage.getPrayerProgress(startDate as string, endDate as string);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/prayer-progress/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const progress = await storage.getPrayerProgressForDate(date);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/prayer-progress/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const { prayer, completed } = req.body;
      const progress = await storage.updatePrayerProgress(date, prayer, completed);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quran reading session routes
  app.get("/api/quran-sessions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const sessions = await storage.getQuranReadingSessions(startDate as string, endDate as string);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quran-sessions/today", async (req, res) => {
    try {
      const session = await storage.getTodayQuranSession();
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quran-sessions", async (req, res) => {
    try {
      const session = await storage.updateQuranSession(req.body);
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed qada prayers if empty
  const existingQada = await storage.getQada();
  if (existingQada.length === 0) {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (const prayer of prayers) {
      await storage.updateQada(prayer, 0);
    }
    console.log("Seeded qada tracker");
  }

  return httpServer;
}
