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
