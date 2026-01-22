import { useState, useMemo, useRef, useEffect } from "react";
import { useProgrammeProgress, useUpdateProgrammeProgress } from "@/hooks/use-programme-progress";
import { MENSTRUAL_GUIDE_DATA } from "@/data/menstrual-guide";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Volume2, Pause, Play, Heart, Star, BookOpen, Sparkles, Flower2, Moon, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MenstrualGuide() {
    const [, setLocation] = useLocation();
    const { data: progress } = useProgrammeProgress("menstrual-guide");
    const updateProgress = useUpdateProgrammeProgress();

    const currentDay = progress?.currentDay || 0;
    const [currentSection, setCurrentSection] = useState<'intro' | 'guidance' | 'spiritual' | 'reflection' | 'care' | 'closing'>('intro');
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const dayData = MENSTRUAL_GUIDE_DATA[currentDay];

    // Progressive unlocking: One day per day (Calendar Day based)
    const isLocked = (dayIndex: number) => {
        if (dayIndex <= currentDay) return false; // Never lock current or past days
        if (dayIndex === 0) return false;
        if (!progress?.startedAt) return true;

        const startedAt = new Date(progress.startedAt);
        const now = new Date();

        // Reset times to midnight for calendar day comparison
        const sDate = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
        const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const daysSinceStart = Math.floor((nDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));

        return dayIndex > daysSinceStart;
    };

    const sections: { key: typeof currentSection; label: string; icon: any }[] = [
        { key: 'intro', label: 'Intention', icon: Star },
        { key: 'guidance', label: 'Guidance', icon: BookOpen },
        { key: 'spiritual', label: 'Spiritual', icon: Sparkles },
        { key: 'reflection', label: 'Reflection', icon: BookOpen },
        { key: 'care', label: 'Self-Care', icon: Heart },
        { key: 'closing', label: 'Closing', icon: Flower2 },
    ];

    const nextSection = () => {
        const currentIndex = sections.findIndex(s => s.key === currentSection);
        if (currentIndex < sections.length - 1) {
            setCurrentSection(sections[currentIndex + 1].key);
        } else if (currentDay < MENSTRUAL_GUIDE_DATA.length - 1) {
            // Check if next day is locked before allowing transition
            if (isLocked(currentDay + 1)) {
                // If locked, go back home - or we could show a "See you tomorrow" message
                setLocation("/");
                return;
            }
            // Complete day and move to next day
            const nextDay = currentDay + 1;
            updateProgress.mutate({
                programmeId: "menstrual-guide",
                updates: { currentDay: nextDay }
            });
            setCurrentSection('intro');
        } else if (currentDay === MENSTRUAL_GUIDE_DATA.length - 1) {
            // Last day completed
            setLocation("/");
        }
    };

    const prevSection = () => {
        const currentIndex = sections.findIndex(s => s.key === currentSection);
        if (currentIndex > 0) {
            setCurrentSection(sections[currentIndex - 1].key);
        }
    };

    const toggleAudio = (url: string) => {
        if (playingAudio === url) {
            audioRef.current?.pause();
            setPlayingAudio(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(url);
            audioRef.current.onended = () => setPlayingAudio(null);
            audioRef.current.play();
            setPlayingAudio(url);
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    if (!dayData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 pb-24">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
                        <ChevronLeft className="w-6 h-6 text-purple-600" />
                    </Button>
                </Link>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold">Menstrual Guide</p>
                    <h1 className="text-xl font-serif text-purple-900">Day {currentDay + 1}</h1>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="px-6 max-w-lg mx-auto">
                {/* Progress Bar */}
                <div className="flex gap-1.5 mb-8">
                    {sections.map((s, idx) => {
                        const sectionIdx = sections.findIndex(sec => sec.key === currentSection);
                        return (
                            <div
                                key={s.key}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                                    idx <= sectionIdx ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "bg-purple-100"
                                )}
                            />
                        );
                    })}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="min-h-[400px]"
                    >
                        {currentSection === 'intro' && (
                            <section className="space-y-6">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                                        ✨
                                    </div>
                                </div>
                                <h2 className="text-2xl font-serif text-purple-900 text-center">{dayData.reassurance.title}</h2>
                                <Card className="p-6 bg-white/80 border-purple-100 rounded-3xl shadow-sm">
                                    <p className="text-purple-800 leading-relaxed text-lg italic text-center">
                                        "{dayData.reassurance.content}"
                                    </p>
                                </Card>
                            </section>
                        )}

                        {currentSection === 'guidance' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <BookOpen className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-serif text-purple-900">{dayData.islamicGuidance.title}</h2>
                                </div>
                                <Card className="p-6 bg-white/80 border-purple-100 rounded-3xl shadow-sm leading-relaxed text-purple-800">
                                    {dayData.islamicGuidance.content}
                                </Card>
                            </section>
                        )}

                        {currentSection === 'spiritual' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-serif text-purple-900">Spiritual Connection</h2>
                                </div>

                                <div className="space-y-4">
                                    {dayData.spiritualConnection.duas.map((dua, i) => (
                                        <Card key={i} className="p-4 bg-purple-50/50 border-purple-100 rounded-2xl">
                                            <p className="text-right text-xl font-arabic mb-2 leading-loose text-purple-900">{dua.arabic}</p>
                                            <p className="text-sm text-purple-700 italic">"{dua.translation}"</p>
                                        </Card>
                                    ))}

                                    <div className="grid grid-cols-2 gap-3">
                                        {dayData.spiritualConnection.dhikr.map((d, i) => (
                                            <div key={i} className="p-3 bg-white/60 rounded-xl border border-purple-100 text-center text-sm text-purple-700 font-medium">
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs text-purple-400 uppercase tracking-widest mb-2 font-bold">Suggested for today</p>
                                        <div className="space-y-2">
                                            {dayData.spiritualConnection.suggestions.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm text-purple-800 bg-white/40 p-3 rounded-xl border border-purple-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                        <span>{s.text}</span>
                                                    </div>
                                                    {s.audioUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleAudio(s.audioUrl!)}
                                                            className="w-8 h-8 rounded-full bg-purple-100 text-purple-600"
                                                        >
                                                            {playingAudio === s.audioUrl ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentSection === 'reflection' && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-xl">
                                            <BookOpen className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <h2 className="text-xl font-serif text-purple-900">{dayData.reflection.title}</h2>
                                    </div>
                                    {dayData.reflection.audioUrl && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleAudio(dayData.reflection.audioUrl!)}
                                            className="rounded-full bg-purple-100 text-purple-600"
                                        >
                                            {playingAudio === dayData.reflection.audioUrl ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </Button>
                                    )}
                                </div>
                                <Card className="p-6 bg-white/80 border-purple-100 rounded-3xl shadow-sm text-purple-800 leading-relaxed text-lg font-serif">
                                    {dayData.reflection.content}
                                </Card>
                            </section>
                        )}

                        {currentSection === 'care' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 rounded-xl">
                                        <Heart className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <h2 className="text-xl font-serif text-purple-900">{dayData.selfCare.title}</h2>
                                </div>
                                <Card className="p-6 bg-rose-50/50 border-rose-100 rounded-3xl shadow-sm text-purple-800 leading-relaxed">
                                    {dayData.selfCare.content}
                                </Card>
                            </section>
                        )}

                        {currentSection === 'closing' && (
                            <section className="space-y-8 text-center pt-8">
                                <div className="space-y-4">
                                    <div className="text-4xl">🤲</div>
                                    <Card className="p-6 bg-purple-900 text-white rounded-3xl shadow-xl border-none">
                                        <p className="text-lg leading-relaxed italic">
                                            "{dayData.closing.dua}"
                                        </p>
                                    </Card>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <Flower2 className="w-8 h-8 text-purple-300 mx-auto" />
                                    <p className="text-purple-600 font-serif text-xl">
                                        {dayData.closing.affirmation}
                                    </p>
                                </div>
                            </section>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Navigation */}
                <div className="mt-12 flex gap-4">
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-2xl h-14 bg-white/50 text-purple-600"
                        onClick={prevSection}
                        disabled={currentSection === 'intro'}
                    >
                        Back
                    </Button>
                    <Button
                        className="flex-[2] rounded-2xl h-14 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 gap-2"
                        onClick={nextSection}
                    >
                        {currentSection === 'closing' ?
                            (currentDay === MENSTRUAL_GUIDE_DATA.length - 1 ? 'Finish Guide' : 'Next Day') :
                            'Continue'}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
