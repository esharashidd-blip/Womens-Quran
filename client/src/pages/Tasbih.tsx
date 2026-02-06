import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TASBIH_PHRASES = [
  { arabic: "سُبْحَانَ ٱللَّٰهِ", transliteration: "SubhanAllah", meaning: "Glory be to Allah" },
  { arabic: "ٱلْحَمْدُ لِلَّٰهِ", transliteration: "Alhamdulillah", meaning: "Praise be to Allah" },
  { arabic: "ٱللَّٰهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest" },
];

export default function Tasbih() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();
  const [count, setCount] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (settings?.tasbihCount) {
      setCount(settings.tasbihCount);
    }
  }, [settings?.tasbihCount]);

  const handleTap = () => {
    setCount((prev) => prev + 1);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleReset = () => {
    setCount(0);
    toast({ title: "Counter reset" });
  };

  const handleSave = () => {
    updateSettings.mutate({ tasbihCount: count });
    toast({ title: "Count saved", description: `${count} counts saved` });
  };

  const currentPhrase = TASBIH_PHRASES[phraseIndex];

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-8 md:px-8 max-w-lg mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-serif text-center mb-4">Tasbih Counter</h1>

      <div className="flex gap-2 mb-6">
        {TASBIH_PHRASES.map((phrase, idx) => (
          <Button
            key={idx}
            variant={phraseIndex === idx ? "default" : "outline"}
            size="sm"
            onClick={() => setPhraseIndex(idx)}
            className="text-xs"
            data-testid={`button-phrase-${idx}`}
          >
            {phrase.transliteration}
          </Button>
        ))}
      </div>

      <Card className="bg-white/60 border-white/50 p-4 rounded-2xl text-center mb-6 w-full">
        <p className="text-3xl font-arabic mb-2" dir="rtl">{currentPhrase.arabic}</p>
        <p className="text-sm text-muted-foreground">{currentPhrase.meaning}</p>
      </Card>

      <button
        onClick={handleTap}
        className="w-56 h-56 rounded-full bg-gradient-to-br from-primary to-rose-400 shadow-2xl shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
        data-testid="button-tasbih"
      >
        <span className="text-7xl font-light text-white" data-testid="text-count">{count}</span>
      </button>

      <p className="text-sm text-muted-foreground mt-4">Tap to count</p>

      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={handleReset} data-testid="button-reset">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
        <Button onClick={handleSave} data-testid="button-save">
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>

      <Card className="mt-8 bg-accent/30 border-white/50 p-4 rounded-xl w-full">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Target</span>
          <div className="flex gap-2">
            {[33, 99, 100].map((target) => (
              <span
                key={target}
                className={`px-2 py-1 rounded text-xs ${
                  count >= target ? "bg-primary text-white" : "bg-white/50"
                }`}
              >
                {target}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
