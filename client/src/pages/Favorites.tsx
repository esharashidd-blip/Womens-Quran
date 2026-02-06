import { useFavorites } from "@/hooks/use-favorites";
import { VerseCard } from "@/components/VerseCard";
import { Loader2, HeartOff } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <div className="min-h-screen pb-nav-safe pt-16 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-gray-800">Your Collection</h1>
        <p className="text-muted-foreground mt-2">Verses you have saved to your heart.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : favorites && favorites.length > 0 ? (
        <div className="space-y-6">
          {favorites.map((fav, index) => (
            <VerseCard
              key={fav.id}
              index={index}
              surahName={fav.surahName}
              surahNumber={fav.surahNumber}
              ayahNumber={fav.ayahNumber}
              arabicText={fav.arabicText}
              translationText={fav.translationText}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/50 rounded-3xl p-8 border border-dashed border-primary/20">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center">
            <HeartOff className="w-8 h-8 text-pink-300" />
          </div>
          <h3 className="text-xl font-serif text-gray-700">No favorites yet</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">Start reading and tap the heart icon to save verses that resonate with you.</p>
          <Link href="/quran">
            <Button className="bg-primary text-white shadow-lg shadow-primary/20">Go to Quran</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
