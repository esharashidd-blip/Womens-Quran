import { Link } from "wouter";
import { type Surah } from "@/hooks/use-quran";
import { motion } from "framer-motion";

export function SurahCard({ surah, index }: { surah: Surah, index: number }) {
  return (
    <Link href={`/surah/${surah.number}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative bg-white rounded-2xl p-5 shadow-sm border border-pink-50 hover:shadow-lg hover:border-pink-200 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-pink-100 flex items-center justify-center text-primary font-bold font-serif shadow-inner">
              {surah.number}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
                {surah.englishName}
              </h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
              </p>
            </div>
          </div>
          
          <div className="text-right">
             <span className="font-arabic text-2xl text-primary/80 group-hover:text-primary transition-colors">
               {surah.name.replace('سُورَةُ', '')}
             </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
