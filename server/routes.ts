import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { supabaseAdmin } from "./supabase";

// Middleware to verify Supabase JWT token
async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
}

// Helper to get user ID from request
function getUserId(req: Request): string {
  return (req as any).user.id;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ FAVORITES ============
  app.get(api.favorites.list.path, verifyAuth, async (req, res) => {
    const favorites = await storage.getFavorites(getUserId(req));
    res.json(favorites);
  });

  app.post(api.favorites.create.path, verifyAuth, async (req, res) => {
    try {
      const input = api.favorites.create.input.parse(req.body);
      const favorite = await storage.createFavorite(getUserId(req), input);
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

  app.delete(api.favorites.delete.path, verifyAuth, async (req, res) => {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteFavorite(getUserId(req), id);
    res.status(204).send();
  });

  // ============ QADA ============
  app.get(api.qada.list.path, verifyAuth, async (req, res) => {
    const userId = getUserId(req);
    // Seed qada for new users
    await storage.seedQadaForUser(userId);
    const qadaList = await storage.getQada(userId);
    res.json(qadaList);
  });

  app.post("/api/qada/:prayerName", verifyAuth, async (req, res) => {
    try {
      const prayerName = req.params.prayerName as string;
      const { count } = req.body;
      const updated = await storage.updateQada(getUserId(req), prayerName, count);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ SETTINGS ============
  app.get(api.settings.get.path, verifyAuth, async (req, res) => {
    const settings = await storage.getSettings(getUserId(req));
    res.json(settings);
  });

  app.post(api.settings.update.path, verifyAuth, async (req, res) => {
    try {
      const updates = req.body;
      console.log(`[SettingsUpdate] User: ${getUserId(req)}, Updates:`, updates);
      const updated = await storage.updateSettings(getUserId(req), updates);
      res.json(updated);
    } catch (err) {
      console.error("[SettingsUpdateError]", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ PRAYER PROGRESS ============
  app.get("/api/prayer-progress", verifyAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const progress = await storage.getPrayerProgress(getUserId(req), startDate as string, endDate as string);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/prayer-progress/:date", verifyAuth, async (req, res) => {
    try {
      const date = req.params.date as string;
      const progress = await storage.getPrayerProgressForDate(getUserId(req), date);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/prayer-progress/:date", verifyAuth, async (req, res) => {
    try {
      const date = req.params.date as string;
      const { prayer, completed } = req.body;
      const progress = await storage.updatePrayerProgress(getUserId(req), date, prayer, completed);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ QURAN SESSIONS ============
  app.get("/api/quran-sessions", verifyAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }
      const sessions = await storage.getQuranReadingSessions(getUserId(req), startDate as string, endDate as string);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quran-sessions/today", verifyAuth, async (req, res) => {
    try {
      const session = await storage.getTodayQuranSession(getUserId(req));
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quran-sessions", verifyAuth, async (req, res) => {
    try {
      const session = await storage.updateQuranSession(getUserId(req), req.body);
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ PROGRAMME PROGRESS ============
  app.get("/api/programme-progress", verifyAuth, async (req, res) => {
    try {
      const progress = await storage.getAllProgrammeProgress(getUserId(req));
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/programme-progress/:programmeId", verifyAuth, async (req, res) => {
    try {
      const programmeId = req.params.programmeId as string;
      const progress = await storage.getProgrammeProgress(getUserId(req), programmeId);
      res.json(progress || {});
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/programme-progress/:programmeId", verifyAuth, async (req, res) => {
    try {
      const programmeId = req.params.programmeId as string;
      const progress = await storage.updateProgrammeProgress(getUserId(req), programmeId, req.body);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ AUTH STATUS (for client to check) ============
  app.get("/api/auth/user", verifyAuth, async (req, res) => {
    res.json((req as any).user);
  });

  // ============ ISLAMIC COACH ============
  app.post("/api/coach/ask", verifyAuth, async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check if Gemini API key is configured
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        // Fallback response when API key is not configured
        return res.json({
          response: "Salam dear sister,\n\nThank you for reaching out. While I cannot provide a personalized response right now, I want you to know that your question matters.\n\nRemember the beautiful words of Allah: \"And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.\" (Quran 2:186)\n\nI encourage you to:\n1. Make dua to Allah with your concerns\n2. Seek knowledge from reliable Islamic scholars\n3. Join a local Muslim women's community for support\n\nMay Allah guide you and ease your path. 💖"
        });
      }

      const systemPrompt = `You are a warm, knowledgeable Islamic coach designed specifically for Muslim women. Your role is to provide supportive, faith-based guidance that is:

1. SUPPORTIVE & GENTLE: Always respond with compassion and understanding. Never be judgmental or harsh.
2. ISLAMICALLY GROUNDED: Base your answers on authentic Islamic teachings from Quran and Sunnah.
3. WOMEN-CENTERED: Understand the unique challenges Muslim women face and provide relevant guidance.
4. NON-JUDGMENTAL: Meet users where they are spiritually without guilt or shame.
5. EMPOWERING: Help women feel confident in their faith journey.

Guidelines:
- Always cite Quran verses or hadith when relevant
- Acknowledge that scholarly opinions may differ on some matters
- Encourage seeking local scholarly guidance for complex fiqh matters
- Be warm and use gentle, encouraging language
- Keep responses concise but meaningful (2-4 paragraphs)
- End responses with a short dua or reminder when appropriate

Topics you can help with:
- Daily Islamic practices and their meanings
- Emotional/spiritual struggles from an Islamic perspective
- Questions about prayer, fasting, hijab, and other acts of worship
- Relationships within Islamic framework
- Personal development through Islamic lens
- Understanding Quran and hadith

Topics to redirect:
- Medical advice → "Please consult a healthcare professional"
- Legal matters → "Please consult a qualified Islamic scholar (mufti)"
- Serious mental health → "Please reach out to a mental health professional. Your wellbeing matters to Allah."`;

      // Build conversation history for Gemini
      const contents = [];

      // Add system context as first user message
      contents.push({
        role: "user",
        parts: [{ text: systemPrompt + "\n\nPlease respond to user questions with this guidance in mind." }]
      });
      contents.push({
        role: "model",
        parts: [{ text: "I understand. I will provide warm, supportive Islamic guidance for Muslim sisters, grounded in Quran and Sunnah, while being non-judgmental and encouraging. I'm ready to help." }]
      });

      // Add conversation history
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Call Gemini API
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        console.error("Gemini API error:", await geminiResponse.text());
        throw new Error("Failed to get response from AI");
      }

      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I apologize, but I couldn't generate a response. Please try again.";

      res.json({ response: responseText });
    } catch (err) {
      console.error("[CoachError]", err);
      res.status(500).json({ message: "Failed to process your question" });
    }
  });

  return httpServer;
}
