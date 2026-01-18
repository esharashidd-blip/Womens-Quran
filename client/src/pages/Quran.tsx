import { useSurahs } from "@/hooks/use-quran";
import { SurahCard } from "@/components/SurahCard";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Quran() {
  const { data: surahs, isLoading } = useSurahs();
  const [search, setSearch] = useState("");

  const filteredSurahs = surahs?.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) || 
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
    s.number.toString().includes(search)
  );

  return (
    <div className="min-h-screen pb-24 pt-16 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-serif text-gray-800 text-center">Noble Quran</h1>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search Surah..." 
            className="pl-10 h-12 rounded-2xl bg-white border-pink-100 focus:border-primary focus:ring-primary/20 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary/60">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p>Loading Surahs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs?.map((surah, index) => (
            <SurahCard key={surah.number} surah={surah} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
