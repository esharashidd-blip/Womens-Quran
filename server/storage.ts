import { supabaseAdmin as supabase } from "./supabase";

// Helper to convert camelCase to snake_case for database columns
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Types matching the database schema
export interface Favorite {
  id: number;
  user_id: string | null;
  surah_name: string;
  surah_number: number;
  ayah_number: number;
  arabic_text: string;
  translation_text: string;
  created_at: string | null;
}

export interface Qada {
  id: number;
  user_id: string | null;
  prayer_name: string;
  count: number;
}

export interface Settings {
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
  user_name: string | null;
}

export interface PrayerProgress {
  id: number;
  user_id: string | null;
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface QuranReadingSession {
  id: number;
  user_id: string | null;
  date: string;
  minutes_read: number;
  last_surah_number: number | null;
  last_ayah_number: number | null;
  created_at: string | null;
}

export interface CoachConversation {
  id: number;
  user_id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CoachMessage {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  tokens_used: number | null;
  created_at: string | null;
}

export interface TokenUsage {
  id: number;
  user_id: string;
  date: string;
  tokens_used: number;
  request_count: number;
}

export interface IStorage {
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(userId: string, favorite: Omit<Favorite, "id" | "created_at" | "user_id">): Promise<Favorite>;
  deleteFavorite(userId: string, id: number): Promise<void>;

  getQada(userId: string): Promise<Qada[]>;
  updateQada(userId: string, prayerName: string, count: number): Promise<Qada>;

  getSettings(userId: string): Promise<Settings>;
  updateSettings(userId: string, updates: Partial<Settings>): Promise<Settings>;

  getPrayerProgress(userId: string, startDate: string, endDate: string): Promise<PrayerProgress[]>;
  getPrayerProgressForDate(userId: string, date: string): Promise<PrayerProgress | null>;
  updatePrayerProgress(userId: string, date: string, prayer: string, completed: boolean): Promise<PrayerProgress>;

  getQuranReadingSessions(userId: string, startDate: string, endDate: string): Promise<QuranReadingSession[]>;
  getTodayQuranSession(userId: string): Promise<QuranReadingSession | null>;
  updateQuranSession(userId: string, data: Partial<QuranReadingSession>): Promise<QuranReadingSession>;

  // Coach chat methods
  getConversations(userId: string): Promise<CoachConversation[]>;
  getConversation(id: number, userId: string): Promise<CoachConversation | null>;
  createConversation(userId: string, title?: string): Promise<CoachConversation>;
  updateConversationTitle(id: number, title: string): Promise<CoachConversation>;
  deleteConversation(id: number): Promise<void>;

  getMessages(conversationId: number): Promise<CoachMessage[]>;
  createMessage(message: Omit<CoachMessage, "id" | "created_at">): Promise<CoachMessage>;

  // Token usage methods
  getDailyTokenUsage(userId: string, date: string): Promise<TokenUsage | null>;
  updateTokenUsage(userId: string, tokensUsed: number): Promise<TokenUsage>;
  checkTokenLimit(userId: string, dailyLimit: number): Promise<{ allowed: boolean; remaining: number; used: number }>;
}

export class SupabaseStorage implements IStorage {
  async getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createFavorite(userId: string, favorite: Omit<Favorite, "id" | "created_at" | "user_id">): Promise<Favorite> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({ ...favorite, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteFavorite(userId: string, id: number): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);  // Ensure users can only delete their own favorites
    if (error) throw error;
  }

  async getQada(userId: string): Promise<Qada[]> {
    const { data, error } = await supabase
      .from("qada")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  }

  async updateQada(userId: string, prayerName: string, count: number): Promise<Qada> {
    // Check if exists for this user
    const { data: existing } = await supabase
      .from("qada")
      .select("*")
      .eq("user_id", userId)
      .eq("prayer_name", prayerName)
      .single();

    if (!existing) {
      const { data, error } = await supabase
        .from("qada")
        .insert({ user_id: userId, prayer_name: prayerName, count })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("qada")
      .update({ count })
      .eq("user_id", userId)
      .eq("prayer_name", prayerName)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getSettings(userId: string): Promise<Settings> {
    const { data: existing } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!existing) {
      const { data, error } = await supabase
        .from("settings")
        .insert({
          user_id: userId,
          city: "Mecca",
          country: "Saudi Arabia",
          auto_location: false,
          tasbih_count: 0,
          ramadan_mode: false,
          quran_goal_minutes: 10,
          prayer_notifications: false,
          cycle_mode: false,
          cycle_mode_first_time: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return existing;
  }

  async updateSettings(userId: string, updates: Partial<Settings>): Promise<Settings> {
    const existing = await this.getSettings(userId);
    // Convert camelCase keys to snake_case for database
    const snakeCaseUpdates = toSnakeCase(updates as Record<string, unknown>);
    const { data, error } = await supabase
      .from("settings")
      .update(snakeCaseUpdates)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPrayerProgress(userId: string, startDate: string, endDate: string): Promise<PrayerProgress[]> {
    const { data, error } = await supabase
      .from("prayer_progress")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);
    if (error) throw error;
    return data || [];
  }

  async getPrayerProgressForDate(userId: string, date: string): Promise<PrayerProgress | null> {
    const { data } = await supabase
      .from("prayer_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();
    return data || null;
  }

  async updatePrayerProgress(userId: string, date: string, prayer: string, completed: boolean): Promise<PrayerProgress> {
    const existing = await this.getPrayerProgressForDate(userId, date);
    const prayerKey = prayer.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

    if (!existing) {
      const { data, error } = await supabase
        .from("prayer_progress")
        .insert({ user_id: userId, date, [prayerKey]: completed })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("prayer_progress")
      .update({ [prayerKey]: completed })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getQuranReadingSessions(userId: string, startDate: string, endDate: string): Promise<QuranReadingSession[]> {
    const { data, error } = await supabase
      .from("quran_reading_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);
    if (error) throw error;
    return data || [];
  }

  async getTodayQuranSession(userId: string): Promise<QuranReadingSession | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("quran_reading_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();
    return data || null;
  }

  async updateQuranSession(userId: string, sessionData: Partial<QuranReadingSession>): Promise<QuranReadingSession> {
    const existing = await this.getTodayQuranSession(userId);
    const today = new Date().toISOString().split('T')[0];

    if (!existing) {
      const { data, error } = await supabase
        .from("quran_reading_sessions")
        .insert({ user_id: userId, date: today, ...sessionData })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("quran_reading_sessions")
      .update({
        minutes_read: sessionData.minutes_read,
        last_surah_number: sessionData.last_surah_number,
        last_ayah_number: sessionData.last_ayah_number,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Coach chat methods
  async getConversations(userId: string): Promise<CoachConversation[]> {
    const { data, error } = await supabase
      .from("coach_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getConversation(id: number, userId: string): Promise<CoachConversation | null> {
    const { data } = await supabase
      .from("coach_conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    return data || null;
  }

  async createConversation(userId: string, title?: string): Promise<CoachConversation> {
    const { data, error } = await supabase
      .from("coach_conversations")
      .insert({ user_id: userId, title: title || "New Conversation" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateConversationTitle(id: number, title: string): Promise<CoachConversation> {
    const { data, error } = await supabase
      .from("coach_conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteConversation(id: number): Promise<void> {
    // Delete messages first
    await supabase
      .from("coach_messages")
      .delete()
      .eq("conversation_id", id);

    // Then delete conversation
    const { error } = await supabase
      .from("coach_conversations")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  async getMessages(conversationId: number): Promise<CoachMessage[]> {
    const { data, error } = await supabase
      .from("coach_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createMessage(message: Omit<CoachMessage, "id" | "created_at">): Promise<CoachMessage> {
    const { data, error } = await supabase
      .from("coach_messages")
      .insert(message)
      .select()
      .single();
    if (error) throw error;

    // Update conversation's updated_at timestamp
    await supabase
      .from("coach_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", message.conversation_id);

    return data;
  }

  // Token usage methods
  async getDailyTokenUsage(userId: string, date: string): Promise<TokenUsage | null> {
    const { data } = await supabase
      .from("token_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();
    return data || null;
  }

  async updateTokenUsage(userId: string, tokensUsed: number): Promise<TokenUsage> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getDailyTokenUsage(userId, today);

    if (!existing) {
      const { data, error } = await supabase
        .from("token_usage")
        .insert({ user_id: userId, date: today, tokens_used: tokensUsed, request_count: 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("token_usage")
      .update({
        tokens_used: existing.tokens_used + tokensUsed,
        request_count: existing.request_count + 1,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async checkTokenLimit(userId: string, dailyLimit: number): Promise<{ allowed: boolean; remaining: number; used: number }> {
    const today = new Date().toISOString().split('T')[0];
    const usage = await this.getDailyTokenUsage(userId, today);
    const used = usage?.tokens_used || 0;
    const remaining = Math.max(0, dailyLimit - used);
    return {
      allowed: used < dailyLimit,
      remaining,
      used,
    };
  }
}

export const storage = new SupabaseStorage();
