import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Lightbulb, Calendar } from "lucide-react";
import { Link } from "wouter";

const HAJJ_DAYS = [
  {
    day: "8th Dhul Hijjah",
    title: "Day of Tarwiyah",
    description: "The journey begins",
    rituals: [
      "Enter into Ihram with the intention of Hajj",
      "Recite Talbiyah continuously",
      "Travel to Mina",
      "Pray Dhuhr, Asr, Maghrib, Isha, and Fajr at Mina (shortened)",
      "Spend the night in Mina",
    ],
    dua: {
      arabic: "لَبَّيْكَ اللَّهُمَّ حَجًّا",
      english: "Here I am O Allah, for Hajj",
    },
  },
  {
    day: "9th Dhul Hijjah",
    title: "Day of Arafah",
    description: "The most important day of Hajj",
    rituals: [
      "Travel to Arafah after Fajr",
      "Stand at Arafah from noon until sunset (Wuquf)",
      "Make abundant dua - this is the essence of Hajj",
      "Pray Dhuhr and Asr combined and shortened",
      "After sunset, travel to Muzdalifah",
      "Pray Maghrib and Isha combined at Muzdalifah",
      "Collect 49-70 pebbles for stoning",
      "Sleep under the open sky",
    ],
    dua: {
      arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
      english: "There is no god but Allah alone, without partner. His is the dominion, His is the praise, and He has power over all things.",
    },
  },
  {
    day: "10th Dhul Hijjah",
    title: "Day of Eid / Yawm an-Nahr",
    description: "The busiest day with multiple rituals",
    rituals: [
      "Pray Fajr at Muzdalifah",
      "Leave for Mina before sunrise",
      "Stone the large Jamarat (7 pebbles) saying 'Allahu Akbar' with each throw",
      "Perform the sacrifice (Qurbani/Hady)",
      "Shave head (men) or cut hair (women)",
      "Go to Mecca for Tawaf al-Ifadah",
      "Perform Sa'i if doing Tamattu' Hajj",
      "Return to Mina to sleep",
    ],
    dua: null,
  },
  {
    day: "11th-12th Dhul Hijjah",
    title: "Days of Tashreeq",
    description: "Stoning and remembrance",
    rituals: [
      "Stay in Mina",
      "After Dhuhr, stone all three Jamarat (7 pebbles each)",
      "Stone in order: Small → Medium → Large",
      "Make dua after stoning the first two pillars",
      "Repeat on the 12th day",
      "Optional: Stay for 13th day for more reward",
    ],
    dua: {
      arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا اللَّهُ",
      english: "Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. There is no god but Allah.",
    },
  },
  {
    day: "Final Step",
    title: "Farewell Tawaf",
    description: "Completing your Hajj",
    rituals: [
      "Before leaving Mecca, perform Tawaf al-Wada (Farewell Tawaf)",
      "This should be your last act in Mecca",
      "Women in menses are excused from this Tawaf",
      "Make dua for acceptance of your Hajj",
    ],
    dua: null,
  },
];

const COMMON_MISTAKES = [
  "Pushing or harming others during Tawaf or stoning",
  "Passing through Miqat without Ihram",
  "Not staying in Arafah until sunset",
  "Stoning before the prescribed times",
  "Touching or kissing the Black Stone forcefully",
  "Neglecting to make dua at Arafah",
  "Leaving Muzdalifah before Fajr without excuse",
];

const HELPFUL_TIPS = [
  "Stay hydrated - drink water constantly",
  "Keep a small bag with essentials (water, snacks, medicine)",
  "Stay with your group and know meeting points",
  "Be patient - this is part of the test",
  "Focus on worship, not photography",
  "Learn key duas beforehand",
  "Wear comfortable footwear for walking",
  "Keep emergency contacts written down",
];

export default function HajjGuide() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/more">
          <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-serif">Hajj Guide</h1>
          <p className="text-sm text-muted-foreground">Essential guide for first-timers</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-4 rounded-2xl mb-6">
        <p className="text-sm text-foreground">
          Hajj is the fifth pillar of Islam, obligatory once in a lifetime for those who are able. 
          This guide covers the key days and rituals. May Allah grant you a blessed pilgrimage.
        </p>
      </Card>

      <div className="space-y-4">
        {HAJJ_DAYS.map((day, index) => (
          <Card key={index} className="bg-white/80 border-white/50 rounded-2xl p-4" data-testid={`hajj-day-${index}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{day.day}</span>
            </div>
            <h3 className="font-medium text-lg">{day.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{day.description}</p>
            
            <ul className="space-y-1.5 text-sm text-muted-foreground mb-3">
              {day.rituals.map((ritual, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{ritual}</span>
                </li>
              ))}
            </ul>
            
            {day.dua && (
              <Card className="bg-accent/30 border-white/50 p-3 rounded-xl">
                <p className="text-lg font-arabic text-right mb-2" dir="rtl">{day.dua.arabic}</p>
                <p className="text-sm text-muted-foreground">{day.dua.english}</p>
              </Card>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <Card className="bg-rose-50 border-rose-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-medium">Common Mistakes to Avoid</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {COMMON_MISTAKES.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-amber-50 border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium">Helpful Tips</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {HELPFUL_TIPS.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          May Allah accept your Hajj and grant you Hajj Mabroor.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          اللَّهُمَّ تَقَبَّلْ مِنَّا
        </p>
      </Card>
    </div>
  );
}
