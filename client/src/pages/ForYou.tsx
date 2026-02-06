import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Play, Pause, Bookmark, Share2, Copy, ChevronLeft, ChevronRight, X, Sun, Moon, Bed, Shield, Heart, HandHeart, Sparkles, Car, BookOpen, Clock, Volume2, CheckCircle2, Circle, Mic, Image, PenLine, Smile } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Link } from "wouter";
import { GUIDED_PROGRAMS, type GuidedProgram, type DayContent } from "@/data/guided-programs";

// Daily Adhkar Categories
const ADHKAR_CATEGORIES = [
  { id: "morning", title: "Morning Adhkar", icon: Sun, color: "text-amber-500", bg: "bg-amber-50", description: "Start your day protected" },
  { id: "evening", title: "Evening Adhkar", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50", description: "End your day in peace" },
  { id: "sleep", title: "Sleep & Waking", icon: Bed, color: "text-purple-500", bg: "bg-purple-50", description: "Rest in Allah's care" },
  { id: "protection", title: "Protection Duas", icon: Shield, color: "text-blue-500", bg: "bg-blue-50", description: "Shield yourself daily" },
  { id: "gratitude", title: "Gratitude", icon: Sparkles, color: "text-yellow-500", bg: "bg-yellow-50", description: "Thank Allah always" },
  { id: "forgiveness", title: "Forgiveness", icon: HandHeart, color: "text-emerald-500", bg: "bg-emerald-50", description: "Seek His mercy" },
  { id: "travel", title: "Travel Duas", icon: Car, color: "text-cyan-500", bg: "bg-cyan-50", description: "Journey safely" },
];

const CATEGORIES = [
  {
    name: "Calm & Emotional",
    programs: ["anxiety", "overthinking", "sadness", "stress", "grief", "anger"]
  },
  {
    name: "Spiritual Growth",
    programs: ["lowiman", "patience", "gratitude", "confusion", "envy"]
  },
  {
    name: "Love & Relationships",
    programs: ["heartbreak", "loneliness"]
  },
];

// Section types for the premium 7-step structure
type SectionType = 'intro' | 'ayah' | 'story' | 'reflection' | 'action' | 'journal' | 'closing';

import { useProgrammeProgress, useUpdateProgrammeProgress, useAllProgrammeProgress } from "@/hooks/use-programme-progress";

export default function ForYou() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const selectedProgram = useMemo(() =>
    GUIDED_PROGRAMS.find(p => p.id === selectedProgramId) || null,
    [selectedProgramId]);

  const { data: programProgress } = useProgrammeProgress(selectedProgramId);
  const { data: allProgress } = useAllProgrammeProgress();
  const updateProgress = useUpdateProgrammeProgress();

  const [currentDay, setCurrentDay] = useState(0);
  const [currentSection, setCurrentSection] = useState<SectionType>('ayah');
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'adhkar'>('foryou');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync local state with progress when program is first opened
  useEffect(() => {
    if (programProgress && selectedProgram) {
      // Set current day from progress if we just opened the program or it's not set
      if (programProgress.currentDay !== undefined) {
        const dayIndex = Math.min(programProgress.currentDay, selectedProgram.days.length - 1);
        // Only jump to progress day if we haven't started interacting (still Day 0) or if program changed
        setCurrentDay(dayIndex);
      }

      // Load journal entries
      if (programProgress.journalEntries) {
        try {
          const entries = JSON.parse(programProgress.journalEntries);
          setJournalEntries(prev => {
            // Merge or replace? Replace is safer to ensure consistency with server
            return entries;
          });
        } catch (e) {
          console.error("Failed to parse journal entries", e);
        }
      }

      // Load emotional check-ins if needed
      if (programProgress.emotionalCheckIns) {
        try {
          const checkIns = JSON.parse(programProgress.emotionalCheckIns);
          // If we had a state for this, we'd set it here
        } catch (e) {
          console.error("Failed to parse emotional check-ins", e);
        }
      }
    }
  }, [selectedProgramId, !!programProgress]);

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return GUIDED_PROGRAMS.filter(program =>
      program.title.toLowerCase().includes(query) ||
      program.subtitle.toLowerCase().includes(query) ||
      program.category.toLowerCase().includes(query) ||
      program.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const openProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setCurrentSection('ayah');
    setSelectedEmotions([]);
    setJournalEntries({});
  };

  const closeProgram = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setSelectedProgramId(null);
    setCurrentDay(0);
    setCurrentSection('ayah');
    setSelectedEmotions([]);
    setJournalEntries({});
  };

  const saveProgress = (dayOffset: number = 0) => {
    if (selectedProgram && programProgress) {
      const currentCompleted = programProgress.completedDays ? JSON.parse(programProgress.completedDays) : [];

      const updates: any = {
        journalEntries: JSON.stringify(journalEntries),
        completedDays: JSON.stringify(currentCompleted),
      };

      if (dayOffset > 0) {
        const newDay = Math.min(currentDay + dayOffset, selectedProgram.daysCount);
        updates.currentDay = Math.max(programProgress.currentDay || 0, newDay);
      }

      updateProgress.mutate({
        programmeId: selectedProgram.id,
        updates
      });
    } else if (selectedProgram) {
      // First time starting the program
      updateProgress.mutate({
        programmeId: selectedProgram.id,
        updates: {
          currentDay: dayOffset > 0 ? currentDay + dayOffset : currentDay,
          journalEntries: JSON.stringify(journalEntries),
          completedDays: dayOffset > 0 ? JSON.stringify([currentDay]) : "[]"
        }
      });
    }
  };

  const nextSection = () => {
    const currentIndex = availableSections.findIndex(s => s.key === currentSection);

    // Auto-save when moving from certain sections
    if (currentSection === 'journal' || currentSection === 'action') {
      saveProgress();
    }

    if (currentIndex < availableSections.length - 1) {
      setCurrentSection(availableSections[currentIndex + 1].key);
    } else if (currentSection === 'closing') {
      // Do nothing, let completeDay handle it
    }
  };

  const prevSection = () => {
    const currentIndex = availableSections.findIndex(s => s.key === currentSection);

    if (currentSection === 'journal') {
      saveProgress();
    }

    if (currentIndex > 0) {
      setCurrentSection(availableSections[currentIndex - 1].key);
    }
  };

  const completeDay = () => {
    if (selectedProgram) {
      const isLastDay = currentDay === selectedProgram.days.length - 1;

      // Update completed days list in our save helper
      const currentCompleted = programProgress?.completedDays ? JSON.parse(programProgress.completedDays) : [];
      if (!currentCompleted.includes(currentDay)) {
        currentCompleted.push(currentDay);
      }

      const updates: any = {
        completedDays: JSON.stringify(currentCompleted),
        journalEntries: JSON.stringify(journalEntries)
      };

      if (!isLastDay) {
        const newDay = currentDay + 1;
        setCurrentDay(newDay);
        setCurrentSection('intro'); // Start next day with intro
        setSelectedEmotions([]);

        // Advance progress to newDay (but don't decrease if user is re-reading)
        updates.currentDay = Math.max(programProgress?.currentDay || 0, newDay);

        updateProgress.mutate({
          programmeId: selectedProgram.id,
          updates
        });
      } else {
        // Handle program completion
        updates.currentDay = selectedProgram.daysCount;
        updateProgress.mutate({
          programmeId: selectedProgram.id,
          updates
        });
        closeProgram();
      }

      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const nextDay = () => {
    // legacy function replaced by completeDay logic or section navigation
    nextSection();
  };

  const prevDay = () => {
    // legacy function replaced by section navigation
    prevSection();
  };

  const currentDayContent = selectedProgram?.days[currentDay];

  // Normalize day content to ensure new UI doesn't crash with legacy data
  const normalizedDayContent = useMemo(() => {
    if (!currentDayContent) return null;

    const base = currentDayContent as any;

    const normalized: any = {
      dayNumber: base.dayNumber,
      title: base.title,
      isWeeklyDepth: base.isWeeklyDepth,
      introAudio: base.introAudio || {
        title: base.openingAudio?.title || base.title || "Introduction",
        duration: base.openingAudio?.duration || base.quranAudio?.duration || "3:00",
        audioUrl: base.openingAudio?.audioUrl || base.quranAudio?.audioUrl || "",
        description: base.openingAudio?.transcript || base.ayah?.emotionalRelevance || "Welcome to today's session."
      },
      ayahStudy: base.ayahStudy || {
        arabic: base.ayah?.arabic || "",
        translation: base.ayah?.english || "",
        reference: base.ayah?.reference || "",
        emotionalExplanation: base.ayah?.emotionalRelevance || "",
        context: "Daily Quranic Guidance",
        revelationContext: "Quran",
        audioUrl: base.ayah?.audioUrl || ""
      },
      multiPartStory: base.multiPartStory || {
        audioUrl: base.quranAudio?.audioUrl || "",
        quranicStory: {
          title: base.story?.title || "Story of Reflection",
          content: typeof base.story === 'string' ? base.story : (base.story?.content || "")
        },
        sisterScenario: {
          content: base.visualReflection?.prompt || "A modern day reflection on this lesson."
        },
        connection: base.story?.lesson || base.application || ""
      },
      reflectionPrompts: base.reflectionPrompts || (base.guidedReflection?.prompt
        ? [base.guidedReflection.prompt]
        : ["How does this ayah speak to your heart today?", "What is one thing you can let go of?", "How can you draw closer to Allah?"]),
      realLifeAction: base.realLifeAction || {
        emotional: "Take 3 deep breaths of Sakina.",
        spiritual: base.actionStep?.reminder || "Seek peace in Dhikr.",
        practical: base.actionStep?.description || "Notice one blessing today."
      },
      journalPrompts: base.journalPrompts || base.guidedReflection?.journalPrompts || ["Reflections on today's ayah..."],
      closingRitual: base.closingRitual || {
        dua: base.dua?.arabic || "SubhanAllah",
        reassurance: base.closingReassurance || "Allah is with you.",
        restPermission: "You have done enough for today. Rest in His care."
      }
    };

    return normalized as Required<DayContent>;
  }, [currentDayContent]);

  const toggleAudio = () => {
    if (!normalizedDayContent) return;

    let audioUrl = '';
    if (currentSection === 'intro') audioUrl = normalizedDayContent.introAudio.audioUrl || '';
    else if (currentSection === 'ayah') audioUrl = normalizedDayContent.ayahStudy.audioUrl || '';
    else if (currentSection === 'story') audioUrl = normalizedDayContent.multiPartStory.audioUrl || '';

    if (audioUrl) {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => setIsPlaying(false);
        } else if (audioRef.current.src !== audioUrl) {
          audioRef.current.pause();
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => setIsPlaying(false);
        }
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [currentDay, currentSection, selectedProgramId]);

  const availableSections: { key: SectionType; label: string; icon: React.ReactNode }[] = [
    { key: 'intro', label: 'Intro', icon: <Volume2 className="w-3 h-3" /> },
    { key: 'ayah', label: 'Ayah', icon: <BookOpen className="w-3 h-3" /> },
    { key: 'story', label: 'Story', icon: <BookOpen className="w-3 h-3" /> },
    { key: 'reflection', label: 'Reflect', icon: <Sparkles className="w-3 h-3" /> },
    { key: 'action', label: 'Action', icon: <Heart className="w-3 h-3" /> },
    { key: 'journal', label: 'Journal', icon: <PenLine className="w-3 h-3" /> },
    { key: 'closing', label: 'Closing', icon: <HandHeart className="w-3 h-3" /> },
  ];

  if (selectedProgram && normalizedDayContent) {
    const isWeeklyDepth = normalizedDayContent.isWeeklyDepth;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pb-24">
        {/* Header with Progress */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-4 py-4 border-b border-primary/5">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon" onClick={closeProgram} className="rounded-full" data-testid="button-close-program">
                <X className="w-5 h-5" />
              </Button>
              <div className="text-center flex-1">
                <p className="font-serif text-lg">{selectedProgram.title}</p>
                <p className="text-xs text-muted-foreground">
                  Day {normalizedDayContent.dayNumber} of {selectedProgram.daysCount}
                  {isWeeklyDepth && <span className="ml-2 text-amber-600">Weekly Depth</span>}
                </p>
              </div>
              <div className="w-9" />
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentDay / selectedProgram.daysCount) * 100}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Your Daily Journey
            </p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-6 space-y-8">
          {/* Section Selector */}
          <div className="flex gap-2 p-1 bg-white/40 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
            {availableSections.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setCurrentSection(key)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  currentSection === key
                    ? "bg-white shadow-sm text-primary scale-105"
                    : "text-muted-foreground hover:bg-white/30"
                )}
                data-testid={`section-tab-${key}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {/* 1. GUIDED AUDIO INTRO */}
            {currentSection === 'intro' && (
              <Card className="bg-white/95 border-white/50 p-8 rounded-3xl space-y-8 text-center animate-in fade-in zoom-in duration-500" data-testid="card-intro">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-serif text-foreground">{normalizedDayContent.introAudio.title}</h2>
                  <div className="flex justify-center">
                    <Button
                      onClick={toggleAudio}
                      className="rounded-full gap-2 px-8 h-12 text-lg shadow-lg shadow-primary/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {isPlaying ? 'Pause Intro' : 'Listen to Intro'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{normalizedDayContent.introAudio.duration} mins • Human Guidance</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-sm text-foreground leading-relaxed italic">
                    {normalizedDayContent.introAudio.description}
                  </p>
                </div>
              </Card>
            )}

            {/* 2. QUR’AN AYAH STUDY */}
            {currentSection === 'ayah' && (
              <Card className="bg-white/90 border-white/50 p-6 rounded-3xl space-y-6" data-testid="card-ayah">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">Qur'an Ayah Study</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2 text-primary hover:bg-primary/10"
                    onClick={toggleAudio}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    Listen
                  </Button>
                </div>
                <div className="space-y-6 bg-accent/10 p-6 rounded-2xl">
                  <p className="text-4xl font-arabic text-right leading-[2]" dir="rtl">
                    {normalizedDayContent.ayahStudy.arabic}
                  </p>
                  <p className="text-lg text-foreground leading-relaxed font-serif italic border-l-4 border-primary/20 pl-4 py-2">
                    "{normalizedDayContent.ayahStudy.translation}"
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{normalizedDayContent.ayahStudy.reference}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{normalizedDayContent.ayahStudy.revelationContext}</span>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Emotional Explanation</p>
                    <p className="text-sm text-foreground leading-relaxed">{normalizedDayContent.ayahStudy.emotionalExplanation}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-primary/5">
                    <p className="text-xs text-muted-foreground italic">Context: {normalizedDayContent.ayahStudy.context}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 3. MULTI-PART STORY */}
            {currentSection === 'story' && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 p-6 rounded-3xl space-y-6" data-testid="card-story">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">The Lesson</span>
                  </div>
                  {normalizedDayContent.multiPartStory.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full gap-2 text-amber-700 hover:bg-amber-100"
                      onClick={toggleAudio}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      {isPlaying ? 'Pause Audio' : 'Listen to Story'}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-amber-900">{normalizedDayContent.multiPartStory.quranicStory.title}</h3>
                  <div className="space-y-4 text-base text-amber-900/80 leading-relaxed font-serif text-justify">
                    {(normalizedDayContent.multiPartStory.quranicStory.content || '').split('\n\n').map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-200/50 space-y-4">
                  <div className="bg-white/60 p-5 rounded-2xl border border-amber-200/50">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">Modern Day Context</p>
                    <p className="text-sm text-foreground leading-relaxed italic">
                      {normalizedDayContent.multiPartStory.sisterScenario.content}
                    </p>
                  </div>
                  <div className="bg-amber-600/90 text-white p-4 rounded-2xl text-sm font-medium">
                    {normalizedDayContent.multiPartStory.connection}
                  </div>
                </div>
              </Card>
            )}

            {/* 4. GUIDED REFLECTION */}
            {currentSection === 'reflection' && (
              <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-100 p-6 rounded-3xl space-y-6" data-testid="card-reflection">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  <span className="text-xs uppercase tracking-widest text-sky-700 font-bold">Deep Reflection</span>
                </div>
                <div className="space-y-4">
                  {normalizedDayContent.reflectionPrompts.map((prompt: string, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{prompt}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 5. REAL-LIFE ACTION */}
            {currentSection === 'action' && (
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 p-6 rounded-3xl space-y-6" data-testid="card-action">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Today's Actions</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Emotional Action</span>
                    <p className="text-sm text-foreground leading-relaxed">{normalizedDayContent.realLifeAction.emotional}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Spiritual Action</span>
                    <p className="text-sm text-foreground leading-relaxed">{normalizedDayContent.realLifeAction.spiritual}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Practical Action</span>
                    <p className="text-sm text-foreground leading-relaxed">{normalizedDayContent.realLifeAction.practical}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 6. JOURNAL */}
            {currentSection === 'journal' && (
              <Card className="bg-white/95 border-white/50 p-6 rounded-3xl space-y-6" data-testid="card-journal">
                <div className="flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">Guided Journaling</span>
                </div>
                <div className="space-y-6">
                  {normalizedDayContent.journalPrompts.map((prompt: string, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{prompt}</p>
                      <textarea
                        className="w-full p-4 rounded-2xl border border-primary/10 bg-accent/5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-serif"
                        rows={4}
                        placeholder="Begin typing here..."
                        value={journalEntries[`${currentDay}-${idx}`] || ''}
                        onChange={(e) => setJournalEntries(prev => ({
                          ...prev,
                          [`${currentDay}-${idx}`]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 7. CLOSING RITUAL */}
            {currentSection === 'closing' && (
              <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-primary/20 p-8 rounded-3xl space-y-8 text-center" data-testid="card-closing">
                <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <HandHeart className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">A Final Reflection</p>
                    <p className="text-xl font-serif text-foreground italic leading-relaxed">
                      "{normalizedDayContent.closingRitual.reassurance}"
                    </p>
                  </div>

                  <div className="bg-white/40 p-6 rounded-2xl border border-white/20">
                    <p className="text-2xl font-arabic text-primary leading-loose" dir="rtl">{normalizedDayContent.closingRitual.dua}</p>
                  </div>

                  <p className="text-sm font-medium text-primary/70">{normalizedDayContent.closingRitual.restPermission}</p>
                </div>

                <Button
                  onClick={completeDay}
                  className="w-full bg-primary text-white py-8 rounded-2xl text-lg font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                >
                  {currentDay === selectedProgram.days.length - 1 ? 'Finish Program' : 'Complete Session'}
                </Button>
              </Card>
            )}
          </div>

          {/* Day Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSection}
              disabled={availableSections.findIndex(s => s.key === currentSection) === 0}
              className="rounded-full w-12 h-12 hover:bg-white/50"
              data-testid="button-prev-section"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[280px]">
              {selectedProgram.days.map((day: any, idx: number) => {
                const isPast = idx < (programProgress?.currentDay || 0);
                const isActive = idx === currentDay;

                // Calendar unlocking: 
                // Next day is only unlocked if completed AND real calendar day has passed since startedAt
                const startedAt = programProgress?.startedAt ? new Date(programProgress.startedAt) : new Date();
                const now = new Date();
                const daysSinceStart = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
                const isUnlockableCalendar = idx <= daysSinceStart;
                const isLocked = idx > (programProgress?.currentDay || 0) || !isUnlockableCalendar;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isLocked) {
                        setCurrentDay(idx);
                        setCurrentSection('intro');
                      }
                    }}
                    disabled={isLocked}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${isActive
                      ? 'bg-primary ring-4 ring-primary/20 w-6'
                      : isPast
                        ? 'bg-primary/40'
                        : isLocked ? 'bg-muted/40 cursor-not-allowed' : 'bg-primary/20 hover:bg-primary/30'
                      }`}
                    title={`Day ${idx + 1}${isLocked ? ' (Will unlock tomorrow)' : ''}`}
                  />
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSection}
              disabled={availableSections.findIndex(s => s.key === currentSection) === availableSections.length - 1}
              className="rounded-full w-12 h-12 hover:bg-white/50"
              data-testid="button-next-section"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif text-foreground">
          Salam{settings?.userName ? `, ${settings.userName}` : ''} <span className="text-primary">🤍</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-accent/30 rounded-2xl">
        <button
          onClick={() => setActiveTab('foryou')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'foryou'
            ? 'bg-white shadow-sm text-foreground'
            : 'text-muted-foreground'
            }`}
        >
          Guided Programs
        </button>
        <button
          onClick={() => setActiveTab('adhkar')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'adhkar'
            ? 'bg-white shadow-sm text-foreground'
            : 'text-muted-foreground'
            }`}
        >
          Daily Adhkar
        </button>
      </div>

      {activeTab === 'foryou' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search: anxiety, heartbreak, healing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-2xl bg-white/80 border-pink-100 focus:border-primary focus:ring-primary/20"
              data-testid="input-search-foryou"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isSearching ? (
            <div className="space-y-3">
              {filteredPrograms.length === 0 ? (
                <Card className="bg-white/60 border-white/50 p-6 rounded-2xl text-center">
                  <p className="text-muted-foreground">No programs found for "{searchQuery}"</p>
                </Card>
              ) : (
                filteredPrograms.map(program => (
                  <Card
                    key={program.id}
                    onClick={() => openProgram(program.id)}
                    className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer"
                    data-testid={`search-result-${program.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{program.title}</p>
                        <p className="text-sm text-muted-foreground">{program.subtitle}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {program.duration}
                          </span>
                          <span className="text-xs text-muted-foreground">{program.category}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <>
              {CATEGORIES.map(category => (
                <div key={category.name} className="space-y-3">
                  <p className="text-sm font-medium text-foreground px-1">{category.name}</p>
                  <div className="space-y-2">
                    {category.programs.map(programId => {
                      const program = GUIDED_PROGRAMS.find(p => p.id === programId);
                      if (!program) return null;

                      // Calculate progress from server data
                      const progress = allProgress?.find(p => p.programmeId === programId);
                      const hasStarted = !!progress;
                      const currentDayVal = progress?.currentDay || 0;

                      // Progress reflects completed days
                      const displayDay = Math.min(currentDayVal + 1, program.daysCount);
                      const progressPercentage = hasStarted ? Math.min((currentDayVal / program.daysCount) * 100, 100) : 0;

                      return (
                        <Card
                          key={programId}
                          onClick={() => openProgram(programId)}
                          className="bg-white/80 border-white/50 p-4 rounded-3xl hover-elevate cursor-pointer overflow-hidden group"
                          data-testid={`program-${programId}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/40 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                              <Heart className="w-7 h-7 text-primary" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="font-serif text-lg text-foreground">{program.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{program.subtitle}</p>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between items-end text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                                  <span>{currentDayVal >= program.daysCount ? 'Completed' : `Day ${displayDay} of ${program.daysCount}`}</span>
                                  <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="self-center">
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {activeTab === 'adhkar' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Protect yourself with daily remembrance of Allah.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ADHKAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.id} href={`/duas?category=${cat.id}`}>
                  <Card
                    className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer h-full"
                    data-testid={`adhkar-${cat.id}`}
                  >
                    <div className={`w-10 h-10 ${cat.bg} rounded-full flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <p className="font-medium text-sm">{cat.title}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
