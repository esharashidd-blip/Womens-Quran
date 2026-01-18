import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuoteGenerator } from "./QuoteGenerator";
import { useFavorites, useAddFavorite, useDeleteFavorite } from "@/hooks/use-favorites";
import { motion } from "framer-motion";

interface VerseCardProps {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  index: number;
}

export function VerseCard({ surahName, surahNumber, ayahNumber, arabicText, translationText, index }: VerseCardProps) {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-6 border-b border-pink-100 pb-4">
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider">
          {surahNumber}:{ayahNumber}
        </span>
        <div className="flex gap-1">
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
    </motion.div>
  );
}
