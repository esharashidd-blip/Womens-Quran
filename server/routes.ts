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
      // Transform camelCase to snake_case for Supabase
      const favorite = await storage.createFavorite({
        surah_name: input.surahName,
        surah_number: input.surahNumber,
        ayah_number: input.ayahNumber,
        arabic_text: input.arabicText,
        translation_text: input.translationText,
        user_id: null,
      });
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
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const settings = await storage.getSettings(userId);
      res.json(settings);
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
      const updated = await storage.updateSettings(userId, updates);
      res.json(updated);
    } catch (err) {
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

      // Verify the conversation belongs to the user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check token limit before processing
      const tokenCheck = await storage.checkTokenLimit(userId, DAILY_TOKEN_LIMIT);
      if (!tokenCheck.allowed) {
        return res.status(429).json({
          message: "Daily token limit reached. Please try again tomorrow.",
          tokensUsed: tokenCheck.used,
          dailyLimit: DAILY_TOKEN_LIMIT,
        });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversation_id: conversationId,
        role: "user",
        content,
        tokens_used: 0,
      });

      // Get conversation history for context
      const history = await storage.getMessages(conversationId);

      // Get user's name from auth metadata (display_name)
      const userName = req.user?.firstName;
      const coachResponse = await sendCoachMessage(content, history.slice(0, -1), userName); // Exclude the message we just added

      // Save assistant response
      const assistantMessage = await storage.createMessage({
        conversation_id: conversationId,
        role: "assistant",
        content: coachResponse.content,
        tokens_used: coachResponse.tokensUsed,
      });

      // Update token usage
      await storage.updateTokenUsage(userId, coachResponse.tokensUsed);

      // Update conversation title if this is the first message
      if (history.length === 1) {
        const title = generateConversationTitle(content);
        await storage.updateConversationTitle(conversationId, title);
      }

      res.json({
        userMessage: transformMessage(userMessage),
        assistantMessage: transformMessage(assistantMessage),
        tokensUsed: coachResponse.tokensUsed,
      });
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
