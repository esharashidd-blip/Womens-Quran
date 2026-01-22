import { Card } from "@/components/ui/card";
import { KALIMAS } from "@/data/kalimas";
import { ChevronRight, ChevronLeft, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Kalimas() {
    const [selectedKalimaId, setSelectedKalimaId] = useState<number | null>(null);

    const selectedKalima = KALIMAS.find(k => k.id === selectedKalimaId);

    if (selectedKalima) {
        const parts = selectedKalima.name.split(': ');
        const displayName = parts.length > 1 ? parts[1] : selectedKalima.name;

        return (
            <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedKalimaId(null)}
                        className="rounded-full hover:bg-primary/10"
                        data-testid="button-back-to-list"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-serif">{displayName}</h1>
                </div>

                <Card className="bg-white/80 dark:bg-white/10 border-white/50 p-6 rounded-3xl space-y-8 backdrop-blur-sm shadow-sm">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Arabic Text</span>
                            {selectedKalima.audioUrl && (
                                <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
                                    <Volume2 className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                        <p className="text-3xl font-arabic text-right leading-[1.8] text-foreground" dir="rtl">
                            {selectedKalima.arabic}
                        </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-primary/10">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Transliteration</span>
                        <p className="text-sm text-foreground/80 italic leading-relaxed">
                            {selectedKalima.transliteration}
                        </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-primary/10">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Meaning</span>
                        <p className="text-base text-foreground leading-relaxed font-serif">
                            {selectedKalima.meaning}
                        </p>
                    </div>
                </Card>

                <div className="text-center italic text-xs text-muted-foreground pt-4">
                    "The best of speech is that which is followed by actions." 🤍
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/more">
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-to-more">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div className="text-center flex-1 pr-10">
                    <h1 className="text-2xl font-serif">The Six Kalmas</h1>
                    <p className="text-sm text-muted-foreground">Foundational declarations of faith</p>
                </div>
            </div>

            <div className="grid gap-3">
                {KALIMAS.map((kalima) => {
                    const parts = kalima.name.split(': ');
                    const title = parts[0];
                    const subtitle = parts.length > 1 ? parts[1] : '';

                    return (
                        <Card
                            key={kalima.id}
                            onClick={() => setSelectedKalimaId(kalima.id)}
                            className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer group active:scale-[0.98] transition-all"
                            data-testid={`kalima-item-${kalima.id}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/5 group-hover:bg-primary/20 transition-colors">
                                    <span className="text-primary font-bold">{kalima.id}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{title}</p>
                                    <p className="text-xs text-muted-foreground font-serif">{subtitle}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="bg-accent/20 border-white/50 p-6 rounded-3xl mt-8">
                <p className="text-sm text-center text-muted-foreground italic leading-relaxed">
                    The Kalmas are central to a Muslim's faith. They are often learned in childhood and carry the core message of Islam.
                </p>
            </Card>
        </div>
    );
}
