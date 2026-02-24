import { useParams, Link } from "wouter";
import { useSurahDetail } from "@/hooks/use-quran";
import { VerseCard } from "@/components/VerseCard";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, Bookmark, BookmarkCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useQuranBookmark, useSetQuranBookmark } from "@/hooks/use-quran-bookmark";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";

// Available reciters with their identifiers
// Some reciters are only available at 64kbps on the CDN
const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", bitrate: 128 },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", bitrate: 64 },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)", bitrate: 64 },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", bitrate: 128 },
  { id: "ar.minshawi", name: "Mohamed Siddiq El-Minshawi", bitrate: 128 },
];

// Starting ayah numbers for each surah (1-indexed)
const SURAH_STARTS = [
  0, 1, 8, 294, 494, 670, 790, 997, 1072, 1201, 1310, 1433, 1542, 1596, 1649, 1706,
  1751, 1802, 1902, 2029, 2140, 2251, 2329, 2404, 2463, 2530, 2620, 2677, 2735, 2820, 2879,
  2913, 2943, 3016, 3070, 3115, 3198, 3280, 3343, 3418, 3503, 3557, 3611, 3664, 3717, 3754,
  3789, 3842, 3894, 3912, 3957, 4017, 4066, 4118, 4173, 4218, 4314, 4387, 4431, 4455, 4468,
  4482, 4493, 4505, 4523, 4535, 4547, 4577, 4609, 4661, 4705, 4733, 4761, 4781, 4817, 4857,
  4887, 4937, 4987, 5033, 5075, 5104, 5123, 5159, 5184, 5207, 5224, 5241, 5271, 5301, 5321,
  5336, 5357, 5368, 5376, 5384, 5403, 5414, 5422, 5430, 5442, 5453, 5463, 5474, 5490, 5508,
  5514, 5521, 5528, 5534, 5540, 5549, 5559, 5564, 5568
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
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const { data: bookmark } = useQuranBookmark();
  const setBookmark = useSetQuranBookmark();
  const { toast } = useToast();
  const { data: favorites } = useFavorites();

  // Build a Map for O(1) favorite lookups
  const favoritesMap = useMemo(() => {
    const map = new Map<string, number>();
    favorites?.forEach(f => {
      map.set(`${f.surahNumber}:${f.ayahNumber}`, f.id);
    });
    return map;
  }, [favorites]);

  const isBookmarked = bookmark?.surahNumber === Number(id) && bookmark?.ayahNumber === currentAyah;

  const handleBookmark = () => {
    if (!surah) return;
    setBookmark.mutate(
      { surahNumber: surah.number, ayahNumber: currentAyah, surahName: surah.englishName },
      { onSuccess: () => toast({ title: "Bookmark saved" }) }
    );
  };

  // Initialize audio elements on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    if (!preloadRef.current) {
      preloadRef.current = new Audio();
      preloadRef.current.preload = 'auto';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (preloadRef.current) {
        preloadRef.current.src = '';
        preloadRef.current = null;
      }
    };
  }, []);

  const getGlobalAyahNumber = (surahNumber: number, ayahNumberInSurah: number): number => {
    return SURAH_STARTS[surahNumber] + ayahNumberInSurah;
  };

  const getAudioUrl = (surahNumber: number, ayahNumberInSurah: number): string => {
    const globalAyahNumber = getGlobalAyahNumber(surahNumber, ayahNumberInSurah);
    const reciter = RECITERS.find(r => r.id === selectedReciter);
    const bitrate = reciter?.bitrate || 128;
    return `https://cdn.islamic.network/quran/audio/${bitrate}/${selectedReciter}/${globalAyahNumber}.mp3`;
  };

  // Preload the next ayah's audio in the background
  const preloadNextAyah = (currentAyahNumber: number) => {
    if (!surah || !preloadRef.current) return;
    if (currentAyahNumber < surah.ayahs.length) {
      preloadRef.current.src = getAudioUrl(surah.number, currentAyahNumber + 1);
      preloadRef.current.load();
    }
  };

  // Play specific ayah
  const playAyah = async (ayahNumber: number) => {
    if (!surah || !audioRef.current) return;

    // Check if preload already has this ayah ready
    const url = getAudioUrl(surah.number, ayahNumber);
    const preloadHasIt = preloadRef.current && preloadRef.current.src === url && preloadRef.current.readyState >= 3;

    if (preloadHasIt && preloadRef.current) {
      // Swap: use the preloaded audio as the main player
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;

      const temp = audioRef.current;
      audioRef.current = preloadRef.current;
      preloadRef.current = temp;
      preloadRef.current.src = '';
    } else {
      // No preload available, load fresh
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = url;
      audioRef.current.load();
    }

    try {
      await audioRef.current.play();
      setCurrentAyah(ayahNumber);
      setIsPlaying(true);
      setAudioInitialized(true);

      // Start preloading the next ayah
      preloadNextAyah(ayahNumber);

      audioRef.current.onended = () => {
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
      console.warn('Audio play rejected:', error);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!surah) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAyah(currentAyah);
    }
  };

  const nextAyah = () => {
    if (!surah || currentAyah >= surah.ayahs.length) return;
    playAyah(currentAyah + 1);
  };

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
    if (preloadRef.current) {
      preloadRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentAyah(1);
    setAudioInitialized(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-nav-safe-lg pt-10 px-4 md:px-8 max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="py-4 flex items-center gap-4 mb-8 border-b border-primary/5">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-3 w-52 rounded-full" />
          </div>
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        {/* Bismillah skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto rounded-lg" />
        </div>
        {/* Verse card skeletons */}
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/60 rounded-3xl p-6 border border-white/50 space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-pink-100">
                <Skeleton className="h-6 w-12 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </div>
              <div className="text-right space-y-3">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-3/4 ml-auto rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-full rounded-full" />
                <Skeleton className="h-5 w-5/6 rounded-full" />
                <Skeleton className="h-5 w-2/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>
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
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={handleBookmark}>
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div className="text-center mb-12 opacity-80">
          <p className="font-arabic text-4xl text-primary-dark">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-6">
        {surah.ayahs.map((ayah, index) => {
          const key = `${surah.number}:${ayah.numberInSurah}`;
          const favoriteId = favoritesMap.get(key);
          return (
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
              isFavorite={favoriteId !== undefined}
              favoriteId={favoriteId}
            />
          );
        })}
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
                      if (isPlaying) {
                        playAyah(currentAyah);
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
