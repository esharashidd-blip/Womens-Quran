import { useParams, Link } from "wouter";
import { useSurahDetail } from "@/hooks/use-quran";
import { VerseCard } from "@/components/VerseCard";
import { Loader2, ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

// Available reciters with their identifiers
const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
  { id: "ar.minshawi", name: "Mohamed Siddiq El-Minshawi" },
];

export default function SurahView() {
  const { id } = useParams();
  const { data: surah, isLoading } = useSurahDetail(Number(id));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on mount (iOS autoplay policy workaround)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Calculate global ayah number for audio URL
  const getGlobalAyahNumber = (surahNumber: number, ayahNumberInSurah: number): number => {
    // Starting ayah numbers for each surah (1-indexed)
    const surahStarts = [
      0, 1, 8, 294, 494, 670, 790, 997, 1072, 1201, 1310, 1433, 1542, 1596, 1649, 1706,
      1751, 1802, 1902, 2029, 2140, 2251, 2329, 2404, 2463, 2530, 2620, 2677, 2735, 2820, 2879,
      2913, 2943, 3016, 3070, 3115, 3198, 3280, 3343, 3418, 3503, 3557, 3611, 3664, 3717, 3754,
      3789, 3842, 3894, 3912, 3957, 4017, 4066, 4118, 4173, 4218, 4314, 4387, 4431, 4455, 4468,
      4482, 4493, 4505, 4523, 4535, 4547, 4577, 4609, 4661, 4705, 4733, 4761, 4781, 4817, 4857,
      4887, 4937, 4987, 5033, 5075, 5104, 5123, 5159, 5184, 5207, 5224, 5241, 5271, 5301, 5321,
      5336, 5357, 5368, 5376, 5384, 5403, 5414, 5422, 5430, 5442, 5453, 5463, 5474, 5490, 5508,
      5514, 5521, 5528, 5534, 5540, 5549, 5559, 5564, 5568
    ];
    return surahStarts[surahNumber] + ayahNumberInSurah;
  };

  // Get audio URL for a specific ayah
  const getAudioUrl = (surahNumber: number, ayahNumberInSurah: number): string => {
    const globalAyahNumber = getGlobalAyahNumber(surahNumber, ayahNumberInSurah);
    return `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${globalAyahNumber}.mp3`;
  };

  // Play specific ayah
  const playAyah = async (ayahNumber: number) => {
    if (!surah || !audioRef.current) return;

    const url = getAudioUrl(surah.number, ayahNumber);

    // Remove old event listeners
    audioRef.current.onended = null;
    audioRef.current.onerror = null;

    // Set new source and play (must be synchronous for iOS)
    audioRef.current.src = url;
    audioRef.current.load(); // Force load

    try {
      await audioRef.current.play();
      setCurrentAyah(ayahNumber);
      setIsPlaying(true);
      setAudioInitialized(true);

      // Set up event listeners after successful play
      audioRef.current.onended = () => {
        // Auto-play next ayah if available
        if (ayahNumber < surah.ayahs.length) {
          playAyah(ayahNumber + 1);
        } else {
          setIsPlaying(false);
        }
      };

      audioRef.current.onerror = () => {
        console.error('Failed to load audio');
        setIsPlaying(false);
      };
    } catch (error) {
      // iOS autoplay policy rejection
      console.warn('Audio play rejected:', error);
      setIsPlaying(false);
      // User needs to tap play again
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!surah) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAyah(currentAyah);
    }
  };

  // Skip to next ayah
  const nextAyah = () => {
    if (!surah || currentAyah >= surah.ayahs.length) return;
    playAyah(currentAyah + 1);
  };

  // Skip to previous ayah
  const prevAyah = () => {
    if (currentAyah <= 1) return;
    playAyah(currentAyah - 1);
  };

  // Reset audio when surah changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentAyah(1);
    setAudioInitialized(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50/30">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!surah) return <div>Surah not found</div>;

  return (
    <div className="min-h-screen pb-nav-safe-lg pt-10 px-4 md:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg py-4 -mx-4 px-4 flex items-center gap-4 mb-8 border-b border-primary/5">
        <Link href="/quran">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif text-gray-800">{surah.englishName}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{surah.englishNameTranslation} • {surah.revelationType}</p>
        </div>
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div className="text-center mb-12 opacity-80">
          <p className="font-arabic text-4xl text-primary-dark">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-6">
        {surah.ayahs.map((ayah, index) => (
          <VerseCard
            key={ayah.number}
            index={index}
            surahName={surah.englishName}
            surahNumber={surah.number}
            ayahNumber={ayah.numberInSurah}
            arabicText={ayah.text}
            translationText={ayah.translation || ""}
            isCurrentlyPlaying={isPlaying && currentAyah === ayah.numberInSurah}
            onPlayAyah={() => playAyah(ayah.numberInSurah)}
          />
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between mt-12 pt-8 border-t border-primary/10">
        {surah.number > 1 ? (
          <Link href={`/surah/${surah.number - 1}`}>
             <Button variant="outline" className="gap-2">Previous Surah</Button>
          </Link>
        ) : <div />}

        {surah.number < 114 ? (
          <Link href={`/surah/${surah.number + 1}`}>
             <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90 text-white">Next Surah</Button>
          </Link>
        ) : <div />}
      </div>

      {/* Audio Player Fixed at Bottom */}
      <Card className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] left-4 right-4 max-w-3xl mx-auto bg-white/95 backdrop-blur-lg border-primary/10 shadow-lg rounded-2xl p-4 z-50">
        <div className="flex items-center gap-4">
          {/* Reciter Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 text-xs"
              onClick={() => setShowReciterPicker(!showReciterPicker)}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reciter</span>
            </Button>
            {showReciterPicker && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-lg border border-primary/10 p-2 min-w-[200px] z-50">
                {RECITERS.map((reciter) => (
                  <button
                    key={reciter.id}
                    onClick={() => {
                      setSelectedReciter(reciter.id);
                      setShowReciterPicker(false);
                      // Restart current ayah with new reciter
                      if (isPlaying) {
                        setTimeout(() => playAyah(currentAyah), 100);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedReciter === reciter.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {reciter.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="flex-1 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevAyah}
              disabled={currentAyah <= 1}
              className="rounded-full"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              onClick={togglePlayPause}
              className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextAyah}
              disabled={currentAyah >= surah.ayahs.length}
              className="rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Current Ayah Display */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Now playing</p>
            <p className="text-sm font-medium text-primary">Ayah {currentAyah}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
