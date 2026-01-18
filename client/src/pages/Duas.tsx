import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Utensils, Bed, Car, Heart, BookOpen, Shield } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const DUAS_CATEGORIES = [
  {
    id: "morning",
    title: "Morning Adhkar",
    icon: Sun,
    color: "text-amber-500",
    bg: "bg-amber-50",
    duas: [
      { arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", transliteration: "Asbahna wa asbahal-mulku lillah", meaning: "We have entered the morning and the dominion belongs to Allah" },
      { arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا", transliteration: "Allahumma bika asbahna wa bika amsayna", meaning: "O Allah, by You we enter the morning and by You we enter the evening" },
      { arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", meaning: "Glory be to Allah and praise Him (100 times)" },
    ]
  },
  {
    id: "evening",
    title: "Evening Adhkar",
    icon: Moon,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    duas: [
      { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", transliteration: "Amsayna wa amsal-mulku lillah", meaning: "We have entered the evening and the dominion belongs to Allah" },
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ", transliteration: "Allahumma inni as'aluka khayra hathihil-laylah", meaning: "O Allah, I ask You for the good of this night" },
    ]
  },
  {
    id: "food",
    title: "Before & After Eating",
    icon: Utensils,
    color: "text-green-500",
    bg: "bg-green-50",
    duas: [
      { arabic: "بِسْمِ اللَّهِ", transliteration: "Bismillah", meaning: "In the name of Allah (before eating)" },
      { arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا", transliteration: "Alhamdulillahil-lathi at'amana wa saqana", meaning: "Praise be to Allah who fed us and gave us drink (after eating)" },
    ]
  },
  {
    id: "sleep",
    title: "Before Sleep",
    icon: Bed,
    color: "text-purple-500",
    bg: "bg-purple-50",
    duas: [
      { arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amutu wa ahya", meaning: "In Your name, O Allah, I die and I live" },
      { arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا", transliteration: "Allahumma bismika amutu wa ahya", meaning: "O Allah, in Your name I die and live" },
    ]
  },
  {
    id: "travel",
    title: "Travel Duas",
    icon: Car,
    color: "text-blue-500",
    bg: "bg-blue-50",
    duas: [
      { arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا", transliteration: "Subhanalladhi sakhkhara lana hatha", meaning: "Glory be to Him who has subjected this to us" },
    ]
  },
  {
    id: "protection",
    title: "Protection",
    icon: Shield,
    color: "text-rose-500",
    bg: "bg-rose-50",
    duas: [
      { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq", meaning: "I seek refuge in the perfect words of Allah from the evil of what He created" },
      { arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un", meaning: "In the name of Allah, with whose name nothing can cause harm" },
    ]
  },
];

export default function Duas() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const category = DUAS_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {selectedCategory ? (
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedCategory(null)} data-testid="button-back-category">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <Link href="/more">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-serif">{category?.title || "Duas & Adhkar"}</h1>
          <p className="text-sm text-muted-foreground">
            {category ? `${category.duas.length} duas` : "Daily supplications"}
          </p>
        </div>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-4">
          {DUAS_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card 
                key={cat.id}
                className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer"
                onClick={() => setSelectedCategory(cat.id)}
                data-testid={`card-category-${cat.id}`}
              >
                <div className={`w-10 h-10 ${cat.bg} rounded-full flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <p className="font-medium text-sm">{cat.title}</p>
                <p className="text-xs text-muted-foreground">{cat.duas.length} duas</p>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {category?.duas.map((dua, index) => (
            <Card key={index} className="bg-white/80 border-white/50 p-5 rounded-2xl" data-testid={`card-dua-${index}`}>
              <p className="text-2xl font-arabic text-right mb-4 leading-loose" dir="rtl">
                {dua.arabic}
              </p>
              <p className="text-sm text-primary font-medium mb-1">{dua.transliteration}</p>
              <p className="text-sm text-muted-foreground italic">{dua.meaning}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
