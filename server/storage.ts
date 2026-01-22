import { supabaseAdmin } from "./supabase";
import type { Favorite, InsertFavorite, Qada, Settings, InsertSettings, PrayerProgress, InsertPrayerProgress, QuranReadingSession, InsertQuranReadingSession, ProgrammeProgress } from "@shared/schema";

export interface IStorage {
  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(userId: string, favorite: Omit<InsertFavorite, 'userId'>): Promise<Favorite>;
  deleteFavorite(userId: string, id: number): Promise<void>;

  // Qada
  getQada(userId: string): Promise<Qada[]>;
  updateQada(userId: string, prayerName: string, count: number): Promise<Qada>;

  // Settings
  getSettings(userId: string): Promise<Settings>;
  updateSettings(userId: string, updates: Partial<InsertSettings>): Promise<Settings>;

  // Prayer Progress
  getPrayerProgress(userId: string, startDate: string, endDate: string): Promise<PrayerProgress[]>;
  getPrayerProgressForDate(userId: string, date: string): Promise<PrayerProgress | null>;
  updatePrayerProgress(userId: string, date: string, prayer: string, completed: boolean): Promise<PrayerProgress>;

  // Quran Sessions
  getQuranReadingSessions(userId: string, startDate: string, endDate: string): Promise<QuranReadingSession[]>;
  getTodayQuranSession(userId: string): Promise<QuranReadingSession | null>;
  updateQuranSession(userId: string, data: Omit<InsertQuranReadingSession, 'userId'>): Promise<QuranReadingSession>;
}

export class SupabaseStorage implements IStorage {
  // ============ FAVORITES ============
  async getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(this.mapFavorite);
  }

  async createFavorite(userId: string, insertFavorite: Omit<InsertFavorite, 'userId'>): Promise<Favorite> {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: userId,
        surah_number: insertFavorite.surahNumber,
        ayah_number: insertFavorite.ayahNumber,
        surah_name: insertFavorite.surahName,
        arabic_text: insertFavorite.arabicText,
        translation_text: insertFavorite.translationText,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFavorite(data);
  }

  async deleteFavorite(userId: string, id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // ============ QADA ============
  async getQada(userId: string): Promise<Qada[]> {
    const { data, error } = await supabaseAdmin
      .from('qada')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(this.mapQada);
  }

  async updateQada(userId: string, prayerName: string, count: number): Promise<Qada> {
    // Try to update first
    const { data: existing } = await supabaseAdmin
      .from('qada')
      .select('*')
      .eq('user_id', userId)
      .eq('prayer_name', prayerName)
      .single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('qada')
        .update({ count })
        .eq('user_id', userId)
        .eq('prayer_name', prayerName)
        .select()
        .single();

      if (error) throw error;
      return this.mapQada(data);
    } else {
      const { data, error } = await supabaseAdmin
        .from('qada')
        .insert({ user_id: userId, prayer_name: prayerName, count })
        .select()
        .single();

      if (error) throw error;
      return this.mapQada(data);
    }
  }

  // ============ SETTINGS ============
  async getSettings(userId: string): Promise<Settings> {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const { data: newSettings, error: insertError } = await supabaseAdmin
        .from('settings')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      return this.mapSettings(newSettings);
    }

    if (error) throw error;
    return this.mapSettings(data);
  }

  async updateSettings(userId: string, updates: Partial<InsertSettings>): Promise<Settings> {
    // Ensure settings exist first
    await this.getSettings(userId);

    const dbUpdates: Record<string, any> = {};
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.autoLocation !== undefined) dbUpdates.auto_location = updates.autoLocation;
    if (updates.prayerNotifications !== undefined) dbUpdates.prayer_notifications = updates.prayerNotifications;
    if (updates.tasbihCount !== undefined) dbUpdates.tasbih_count = updates.tasbihCount;
    if (updates.ramadanMode !== undefined) dbUpdates.ramadan_mode = updates.ramadanMode;
    if (updates.cycleMode !== undefined) dbUpdates.cycle_mode = updates.cycleMode;
    if (updates.cycleModeFirstTime !== undefined) dbUpdates.cycle_mode_first_time = updates.cycleModeFirstTime;
    if (updates.quranGoalMinutes !== undefined) dbUpdates.quran_goal_minutes = updates.quranGoalMinutes;
    if (updates.prayerNotifications !== undefined) dbUpdates.prayer_notifications = updates.prayerNotifications;
    if (updates.userName !== undefined) dbUpdates.user_name = updates.userName;

    const { data, error } = await supabaseAdmin
      .from('settings')
      .update(dbUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSettings(data);
  }

  // ============ PRAYER PROGRESS ============
  async getPrayerProgress(userId: string, startDate: string, endDate: string): Promise<PrayerProgress[]> {
    const { data, error } = await supabaseAdmin
      .from('prayer_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return (data || []).map(this.mapPrayerProgress);
  }

  async getPrayerProgressForDate(userId: string, date: string): Promise<PrayerProgress | null> {
    const { data, error } = await supabaseAdmin
      .from('prayer_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }

    if (error) throw error;
    return this.mapPrayerProgress(data);
  }

  async updatePrayerProgress(userId: string, date: string, prayer: string, completed: boolean): Promise<PrayerProgress> {
    const prayerKey = prayer.toLowerCase();
    const existing = await this.getPrayerProgressForDate(userId, date);

    if (!existing) {
      const insertData: Record<string, any> = {
        user_id: userId,
        date,
        [prayerKey]: completed,
      };

      const { data, error } = await supabaseAdmin
        .from('prayer_progress')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return this.mapPrayerProgress(data);
    }

    const { data, error } = await supabaseAdmin
      .from('prayer_progress')
      .update({ [prayerKey]: completed })
      .eq('user_id', userId)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return this.mapPrayerProgress(data);
  }

  // ============ PROGRAMME PROGRESS ============
  async getAllProgrammeProgress(userId: string): Promise<ProgrammeProgress[]> {
    const { data, error } = await supabaseAdmin
      .from('programme_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("[getAllProgrammeProgressError]", error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      programmeId: d.programme_id,
      currentDay: d.current_day,
      completedDays: d.completed_days,
      startedAt: d.started_at ? new Date(d.started_at) : null,
      lastAccessedAt: d.last_accessed_at ? new Date(d.last_accessed_at) : null,
      journalEntries: d.journal_entries,
      emotionalCheckIns: d.emotional_check_ins,
    }));
  }

  async getProgrammeProgress(userId: string, programmeId: string): Promise<ProgrammeProgress | undefined> {
    const { data, error } = await supabaseAdmin
      .from('programme_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('programme_id', programmeId)
      .maybeSingle();

    if (error) {
      console.error("[getProgrammeProgressError]", error);
      return undefined;
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: data.user_id,
      programmeId: data.programme_id,
      currentDay: data.current_day,
      completedDays: data.completed_days,
      startedAt: data.started_at ? new Date(data.started_at) : null,
      lastAccessedAt: data.last_accessed_at ? new Date(data.last_accessed_at) : null,
      journalEntries: data.journal_entries,
      emotionalCheckIns: data.emotional_check_ins,
    };
  }

  async updateProgrammeProgress(userId: string, programmeId: string, updates: Partial<ProgrammeProgress>): Promise<ProgrammeProgress> {
    const existing = await this.getProgrammeProgress(userId, programmeId);

    const dbUpdates: Record<string, any> = {
      user_id: userId,
      programme_id: programmeId,
      last_accessed_at: new Date().toISOString(),
    };

    if (updates.currentDay !== undefined) dbUpdates.current_day = updates.currentDay;
    if (updates.completedDays !== undefined) dbUpdates.completed_days = updates.completedDays;
    if (updates.journalEntries !== undefined) dbUpdates.journal_entries = updates.journalEntries;
    if (updates.emotionalCheckIns !== undefined) dbUpdates.emotional_check_ins = updates.emotionalCheckIns;

    if (!existing && !updates.startedAt) {
      dbUpdates.started_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('programme_progress')
      .upsert(dbUpdates, { onConflict: 'user_id,programme_id' })
      .select()
      .single();

    if (error) {
      console.error("[updateProgrammeProgressError]", error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      programmeId: data.programme_id,
      currentDay: data.current_day,
      completedDays: data.completed_days,
      startedAt: data.started_at ? new Date(data.started_at) : null,
      lastAccessedAt: data.last_accessed_at ? new Date(data.last_accessed_at) : null,
      journalEntries: data.journal_entries,
      emotionalCheckIns: data.emotional_check_ins,
    };
  }

  // ============ QURAN SESSIONS ============
  async getQuranReadingSessions(userId: string, startDate: string, endDate: string): Promise<QuranReadingSession[]> {
    const { data, error } = await supabaseAdmin
      .from('quran_reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return (data || []).map(this.mapQuranSession);
  }

  async getTodayQuranSession(userId: string): Promise<QuranReadingSession | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from('quran_reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }

    if (error) throw error;
    return this.mapQuranSession(data);
  }

  async updateQuranSession(userId: string, sessionData: Omit<InsertQuranReadingSession, 'userId'>): Promise<QuranReadingSession> {
    const existing = await this.getTodayQuranSession(userId);

    if (!existing) {
      const { data, error } = await supabaseAdmin
        .from('quran_reading_sessions')
        .insert({
          user_id: userId,
          date: sessionData.date,
          minutes_read: sessionData.minutesRead,
          last_surah_number: sessionData.lastSurahNumber,
          last_ayah_number: sessionData.lastAyahNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapQuranSession(data);
    }

    const { data, error } = await supabaseAdmin
      .from('quran_reading_sessions')
      .update({
        minutes_read: sessionData.minutesRead,
        last_surah_number: sessionData.lastSurahNumber,
        last_ayah_number: sessionData.lastAyahNumber,
      })
      .eq('user_id', userId)
      .eq('date', sessionData.date)
      .select()
      .single();

    if (error) throw error;
    return this.mapQuranSession(data);
  }

  // ============ SEED QADA FOR USER ============
  async seedQadaForUser(userId: string): Promise<void> {
    const existingQada = await this.getQada(userId);
    if (existingQada.length === 0) {
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const prayer of prayers) {
        await this.updateQada(userId, prayer, 0);
      }
    }
  }

  // ============ MAPPERS (snake_case to camelCase) ============
  private mapFavorite(row: any): Favorite {
    return {
      id: row.id,
      userId: row.user_id,
      surahName: row.surah_name,
      surahNumber: row.surah_number,
      ayahNumber: row.ayah_number,
      arabicText: row.arabic_text,
      translationText: row.translation_text,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    };
  }

  private mapQada(row: any): Qada {
    return {
      id: row.id,
      userId: row.user_id,
      prayerName: row.prayer_name,
      count: row.count,
    };
  }

  private mapSettings(row: any): Settings {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name || null,
      city: row.city || "Mecca",
      country: row.country || "Saudi Arabia",
      autoLocation: row.auto_location || false,
      tasbihCount: row.tasbih_count || 0,
      ramadanMode: row.ramadan_mode || false,
      cycleMode: row.cycle_mode || false,
      cycleModeFirstTime: row.cycle_mode_first_time !== false, // default true
      quranGoalMinutes: row.quran_goal_minutes || 10,
      prayerNotifications: row.prayer_notifications || false,
      coachQuestionsToday: row.coach_questions_today || 0,
      coachLastQuestionDate: row.coach_last_question_date || null,
    };
  }

  private mapPrayerProgress(row: any): PrayerProgress {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      fajr: row.fajr,
      dhuhr: row.dhuhr,
      asr: row.asr,
      maghrib: row.maghrib,
      isha: row.isha,
    };
  }

  private mapQuranSession(row: any): QuranReadingSession {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      minutesRead: row.minutes_read,
      lastSurahNumber: row.last_surah_number,
      lastAyahNumber: row.last_ayah_number,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    };
  }
}

export const storage = new SupabaseStorage();
