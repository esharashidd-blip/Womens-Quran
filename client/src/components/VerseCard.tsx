import { Heart, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuoteGenerator } from "./QuoteGenerator";
import { useFavorites, useAddFavorite, useDeleteFavorite } from "@/hooks/use-favorites";

interface VerseCardProps {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  index: number;
  isCurrentlyPlaying?: boolean;
  onPlayAyah?: () => void;
}

export function VerseCard({ surahName, surahNumber, ayahNumber, arabicText, translationText, index, isCurrentlyPlaying, onPlayAyah }: VerseCardProps) {
  const { data: favorites } = useFavorites();
  const addMutation = useAddFavorite();
  const deleteMutation = useDeleteFavorite();

  const favorite = favorites?.find(f => 
    f.surahNumber === surahNumber && f.ayahNumber === ayahNumber
  );
  
  const isFavorite = !!favorite;

  const handleFavorite = () => {
    if (isFavorite) {
      deleteMutation.mutate(favorite.id);
    } else {
      addMutation.mutate({
        surahName,
        surahNumber,
        ayahNumber,
        arabicText,
        translationText,
      });
    }
  };

  return (
    <div
      className={cn(
        "bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-sm border hover:shadow-md transition-all duration-300",
        isCurrentlyPlaying ? "border-primary/50 bg-primary/5" : "border-white/50"
      )}
    >
      <div className="flex justify-between items-center mb-6 border-b border-pink-100 pb-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold tracking-wider",
          isCurrentlyPlaying ? "bg-primary text-white" : "bg-primary/10 text-primary"
        )}>
          {surahNumber}:{ayahNumber}
        </span>
        <div className="flex gap-1">
          {onPlayAyah && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayAyah}
              className={cn(
                "transition-colors hover:bg-primary/10",
                isCurrentlyPlaying ? "text-primary" : "text-gray-400 hover:text-primary"
              )}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
          )}
          <QuoteGenerator
            surahName={surahName}
            ayahNumber={ayahNumber}
            arabicText={arabicText}
            translationText={translationText}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className={cn(
              "transition-colors hover:bg-primary/10",
              isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
            )}
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </Button>
        </div>
      </div>

      <div className="text-right mb-6" dir="rtl">
        <p className="font-arabic text-3xl md:text-4xl leading-[2.5] text-gray-800">
          {arabicText}
        </p>
      </div>

      <div className="text-left">
        <p className="font-serif text-lg md:text-xl text-gray-600 leading-relaxed">
          {translationText}
        </p>
      </div>
    </div>
  );
}
