import { useParams, Link } from "wouter";
import { useSurahDetail } from "@/hooks/use-quran";
import { VerseCard } from "@/components/VerseCard";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SurahView() {
  const { id } = useParams();
  const { data: surah, isLoading } = useSurahDetail(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50/30">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!surah) return <div>Surah not found</div>;

  return (
    <div className="min-h-screen pb-24 pt-10 px-4 md:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg py-4 -mx-4 px-4 flex items-center gap-4 mb-8 border-b border-primary/5">
        <Link href="/quran">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Button>
        </Link>
        <div>
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
    </div>
  );
}
