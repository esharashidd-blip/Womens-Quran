import type { Express } from "express";
import type { Server } from "http";
import { storage, type CoachMessage, type QuranReadingSession, type CoachConversation } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./supabase-auth";
import { sendCoachMessage, generateConversationTitle, DAILY_TOKEN_LIMIT } from "./coach-service";

// Helper to transform Quran session from snake_case to camelCase
function transformQuranSession(session: QuranReadingSession | null) {
  if (!session) return null;
  return {
    id: session.id,
    userId: session.user_id,
    date: session.date,
    minutesRead: session.minutes_read,
    lastSurahNumber: session.last_surah_number,
    lastAyahNumber: session.last_ayah_number,
    createdAt: session.created_at,
  };
}

// Helper to transform Favorite from snake_case to camelCase
function transformFavorite(favorite: any) {
  return {
    id: favorite.id,
    userId: favorite.user_id,
    surahName: favorite.surah_name,
    surahNumber: favorite.surah_number,
    ayahNumber: favorite.ayah_number,
    arabicText: favorite.arabic_text,
    translationText: favorite.translation_text,
    createdAt: favorite.created_at,
  };
}

// Helper to transform coach conversation from snake_case to camelCase
function transformConversation(conv: CoachConversation) {
  return {
    id: conv.id,
    userId: conv.user_id,
    title: conv.title,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
  };
}

// Helper to transform coach message from snake_case to camelCase
function transformMessage(msg: CoachMessage) {
  return {
    id: msg.id,
    conversationId: msg.conversation_id,
    role: msg.role,
    content: msg.content,
    tokensUsed: msg.tokens_used,
    createdAt: msg.created_at,
  };
}

// Helper to transform settings from snake_case to camelCase
function transformSettings(settings: {
  id: number;
  user_id: string | null;
  city: string;
  country: string;
  auto_location: boolean;
  tasbih_count: number;
  ramadan_mode: boolean;
  quran_goal_minutes: number;
  prayer_notifications: boolean;
  cycle_mode: boolean;
  cycle_mode_first_time: boolean;
}) {
  return {
    id: settings.id,
    userId: settings.user_id,
    city: settings.city,
    country: settings.country,
    autoLocation: settings.auto_location,
    tasbihCount: settings.tasbih_count,
    ramadanMode: settings.ramadan_mode,
    quranGoalMinutes: settings.quran_goal_minutes,
    prayerNotifications: settings.prayer_notifications,
    cycleMode: settings.cycle_mode,
    cycleModeFirstTime: settings.cycle_mode_first_time,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth before other routes
  await setupAuth(app);
  registerAuthRoutes(app);
  // Favorites routes
  app.get(api.favorites.list.path, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const favorites = await storage.getFavorites(userId);
      res.json(favorites.map(transformFavorite));
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post(api.favorites.create.path, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const input = api.favorites.create.input.parse(req.body);

      // Check if already favorited
      const existingFavorites = await storage.getFavorites(userId);
      const alreadyExists = existingFavorites.find(
        f => f.surah_number === input.surahNumber && f.ayah_number === input.ayahNumber
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: "This verse is already in your favorites"
        });
      }

      // Transform camelCase to snake_case for Supabase
      const favorite = await storage.createFavorite(userId, {
        surah_name: input.surahName,
        surah_number: input.surahNumber,
        ayah_number: input.ayahNumber,
        arabic_text: input.arabicText,
        translation_text: input.translationText,
      });
      res.status(201).json(transformFavorite(favorite));
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
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      await storage.deleteFavorite(userId, id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  // Qada routes
  app.get(api.qada.list.path, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const qadaList = await storage.getQada(userId);
      res.json(qadaList);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch qada" });
    }
  });

  app.post("/api/qada/:prayerName", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const prayerName = req.params.prayerName;
      const { count } = req.body;
      const updated = await storage.updateQada(userId, prayerName, count);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings routes
  app.get(api.settings.get.path, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const settings = await storage.getSettings(userId);
      res.json(transformSettings(settings));
    } catch (err) {
      console.error("Internal Server Error:", err);
      res.status(500).json({ message: (err as Error).message || "Internal server error" });
    }
  });

  app.post(api.settings.update.path, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const updates = req.body;
      console.log("Updating settings for user:", userId, "with:", updates);
      const updated = await storage.updateSettings(userId, updates);
      res.json(transformSettings(updated));
    } catch (err) {
      console.error("Error updating settings:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prayer progress routes
  app.get("/api/prayer-progress", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const progress = await storage.getPrayerProgress(userId, startDate as string, endDate as string);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/prayer-progress/:date", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { date } = req.params;
      const progress = await storage.getPrayerProgressForDate(userId, date);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/prayer-progress/:date", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { date } = req.params;
      const { prayer, completed } = req.body;
      const progress = await storage.updatePrayerProgress(userId, date, prayer, completed);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quran reading session routes
  app.get("/api/quran-sessions", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const sessions = await storage.getQuranReadingSessions(userId, startDate as string, endDate as string);
      res.json(sessions.map(transformQuranSession));
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quran-sessions/today", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const session = await storage.getTodayQuranSession(userId);
      res.json(transformQuranSession(session));
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quran-sessions", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Transform camelCase to snake_case
      const session = await storage.updateQuranSession(userId, {
        date: req.body.date,
        minutes_read: req.body.minutesRead,
        last_surah_number: req.body.lastSurahNumber,
        last_ayah_number: req.body.lastAyahNumber,
      });
      res.json(transformQuranSession(session));
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== Programme Progress Routes =====

  // Get all programme progress for the user
  app.get("/api/programme-progress", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const progress = await storage.getAllProgrammeProgress(userId);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch programme progress" });
    }
  });

  // Get progress for a specific programme
  app.get("/api/programme-progress/:programmeId", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const progress = await storage.getProgrammeProgress(userId, req.params.programmeId);
      if (!progress) {
        return res.json(null);
      }
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch programme progress" });
    }
  });

  // Update programme progress
  app.post("/api/programme-progress/:programmeId", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const updated = await storage.updateProgrammeProgress(userId, req.params.programmeId, req.body);
      res.json(updated);
    } catch (err) {
      console.error("Error updating programme progress:", err);
      res.status(500).json({ message: "Failed to update programme progress" });
    }
  });

  // ===== Quran Bookmark Routes =====

  // Get the user's bookmark
  app.get("/api/quran-bookmark", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const bookmark = await storage.getQuranBookmark(userId);
      res.json(bookmark);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch bookmark" });
    }
  });

  // Set/update the user's bookmark
  app.post("/api/quran-bookmark", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { surahNumber, ayahNumber, surahName } = req.body;
      const bookmark = await storage.setQuranBookmark(userId, surahNumber, ayahNumber, surahName);
      res.json(bookmark);
    } catch (err) {
      console.error("Error setting bookmark:", err);
      res.status(500).json({ message: "Failed to save bookmark" });
    }
  });

  // ===== Islamic Coach Routes =====

  // Get all conversations for a user
  app.get("/api/coach/conversations", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const conversations = await storage.getConversations(userId);
      res.json(conversations.map(transformConversation));
    } catch (err) {
      console.error("Error fetching conversations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new conversation
  app.post("/api/coach/conversations", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const conversation = await storage.createConversation(userId);
      res.status(201).json(transformConversation(conversation));
    } catch (err) {
      console.error("Error creating conversation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get messages for a conversation
  app.get("/api/coach/conversations/:id/messages", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const conversationId = parseInt(req.params.id);

      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      // Verify the conversation belongs to the user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getMessages(conversationId);
      res.json(messages.map(transformMessage));
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a message to the coach
  app.post("/api/coach/conversations/:id/messages", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Run initial checks in parallel for speed
      const [conversation, tokenCheck, history] = await Promise.all([
        storage.getConversation(conversationId, userId),
        storage.checkTokenLimit(userId, DAILY_TOKEN_LIMIT),
        storage.getMessages(conversationId),
      ]);

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (!tokenCheck.allowed) {
        return res.status(429).json({
          message: "Daily token limit reached. Please try again tomorrow.",
          tokensUsed: tokenCheck.used,
          dailyLimit: DAILY_TOKEN_LIMIT,
        });
      }

      // Call Gemini immediately - save user message in background
      const userName = req.user?.firstName;
      const now = new Date().toISOString();

      // Start user message save (don't wait)
      const userMessagePromise = storage.createMessage({
        conversation_id: conversationId,
        role: "user",
        content,
        tokens_used: 0,
      });

      // Get AI response - this is the only thing we wait for
      const coachResponse = await sendCoachMessage(content, history, userName);

      // Send response IMMEDIATELY with temporary IDs - don't wait for DB
      res.json({
        userMessage: {
          id: -1, // Temporary ID
          conversationId,
          role: "user",
          content,
          tokensUsed: 0,
          createdAt: now,
        },
        assistantMessage: {
          id: -2, // Temporary ID
          conversationId,
          role: "assistant",
          content: coachResponse.content,
          tokensUsed: coachResponse.tokensUsed,
          createdAt: now,
        },
        tokensUsed: coachResponse.tokensUsed,
      });

      // ALL database operations run in background after response sent
      Promise.all([
        userMessagePromise,
        storage.createMessage({
          conversation_id: conversationId,
          role: "assistant",
          content: coachResponse.content,
          tokens_used: coachResponse.tokensUsed,
        }),
        storage.updateTokenUsage(userId, coachResponse.tokensUsed),
        history.length === 0
          ? storage.updateConversationTitle(conversationId, generateConversationTitle(content))
          : Promise.resolve(),
      ]).catch((err) => console.error("Background task error:", err));

    } catch (err) {
      console.error("Error sending coach message:", err);
      if (err instanceof Error && err.message.includes("GEMINI_API_KEY")) {
        return res.status(503).json({ message: "Coach service is not configured. Please contact support." });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a conversation
  app.delete("/api/coach/conversations/:id", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const conversationId = parseInt(req.params.id);

      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      // Verify the conversation belongs to the user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      await storage.deleteConversation(conversationId);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting conversation:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get token usage stats
  app.get("/api/coach/token-usage", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const tokenCheck = await storage.checkTokenLimit(userId, DAILY_TOKEN_LIMIT);
      res.json({
        used: tokenCheck.used,
        remaining: tokenCheck.remaining,
        dailyLimit: DAILY_TOKEN_LIMIT,
        allowed: tokenCheck.allowed,
      });
    } catch (err) {
      console.error("Error fetching token usage:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed qada prayers if empty
  try {
    const existingQada = await storage.getQada();
    if (existingQada.length === 0) {
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const prayer of prayers) {
        await storage.updateQada(prayer, 0);
      }
      console.log("Seeded qada tracker");
    }
  } catch (err) {
    console.error("Error seeding qada:", err);
  }

  return httpServer;
}
