import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const UMRAH_STEPS = [
  {
    id: 1,
    title: "Preparation & Intention",
    description: "Before leaving for Umrah, prepare yourself spiritually and physically.",
    details: [
      "Repay any debts and seek forgiveness from others",
      "Learn the rituals and duas of Umrah",
      "Make sincere intention (niyyah) for Umrah",
      "Arrange travel and accommodations",
    ],
    dua: null,
  },
  {
    id: 2,
    title: "Entering Ihram",
    description: "Put on Ihram before reaching the Miqat (boundary).",
    details: [
      "Perform ghusl (full body wash) or wudu",
      "Women: Wear modest, plain clothing",
      "Men: Wear two white unstitched cloths",
      "Make intention for Umrah at the Miqat",
    ],
    dua: {
      arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
      english: "Here I am O Allah, for Umrah",
      transliteration: "Labbayk Allahumma 'Umratan",
    },
  },
  {
    id: 3,
    title: "Talbiyah",
    description: "Recite the Talbiyah continuously from Miqat until you reach the Kaaba.",
    details: [
      "Recite loudly (men) or quietly (women)",
      "Continue reciting until you begin Tawaf",
      "This is your declaration of responding to Allah's call",
    ],
    dua: {
      arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
      english: "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Indeed, all praise, favor, and sovereignty are Yours. You have no partner.",
      transliteration: "Labbayk Allahumma labbayk, labbayk la shareeka laka labbayk. Innal-hamda wan-ni'mata laka wal-mulk, la shareeka lak",
    },
  },
  {
    id: 4,
    title: "Tawaf (7 Rounds)",
    description: "Circumambulate the Kaaba 7 times counter-clockwise.",
    details: [
      "Start from the Black Stone corner (Hajar al-Aswad)",
      "Keep the Kaaba on your left",
      "Walk at a normal pace (women should not jog)",
      "Make dua throughout - there is no specific dua required",
      "Complete 7 full rounds",
    ],
    dua: {
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      english: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
      transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhab an-nar",
    },
  },
  {
    id: 5,
    title: "Prayer at Maqam Ibrahim",
    description: "Pray 2 rakats behind the Station of Ibrahim after Tawaf.",
    details: [
      "If crowded, pray anywhere in the mosque",
      "Recite Surah Al-Kafirun in the first rakat",
      "Recite Surah Al-Ikhlas in the second rakat",
      "Make personal dua after prayer",
    ],
    dua: null,
  },
  {
    id: 6,
    title: "Drink Zamzam Water",
    description: "Drink Zamzam water and make dua.",
    details: [
      "Face the Qibla while drinking",
      "Drink in three sips",
      "Make dua - it is said that Zamzam is for whatever intention you make",
    ],
    dua: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ",
      english: "O Allah, I ask You for beneficial knowledge, abundant provision, and cure from every illness.",
      transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan wasi'an, wa shifa'an min kulli da'",
    },
  },
  {
    id: 7,
    title: "Sa'i (7 Laps)",
    description: "Walk between Safa and Marwa hills 7 times.",
    details: [
      "Start at Safa, end at Marwa",
      "Safa to Marwa = 1 lap, Marwa to Safa = 2 laps, etc.",
      "Men should jog between the green lights",
      "Women walk at normal pace throughout",
      "Make dua at Safa and Marwa, facing the Kaaba",
    ],
    dua: {
      arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
      english: "Indeed, Safa and Marwa are among the symbols of Allah.",
      transliteration: "Innas-Safa wal-Marwata min sha'a'irillah",
    },
  },
  {
    id: 8,
    title: "Halq or Taqsir",
    description: "Cut or shorten your hair to complete Umrah.",
    details: [
      "Men: Shave head completely (Halq) or trim hair (Taqsir)",
      "Women: Cut a fingertip length from the ends of hair",
      "This marks the end of Ihram restrictions",
      "You are now free from Ihram",
    ],
    dua: null,
  },
];

export default function UmrahGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-6 md:px-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/more">
          <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-serif">Umrah Guide</h1>
          <p className="text-sm text-muted-foreground">Step-by-step for beginners</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-4 rounded-2xl mb-6">
        <p className="text-sm text-foreground">
          Umrah is the lesser pilgrimage that can be performed any time of the year. 
          Follow these steps with sincerity and devotion. May Allah accept your worship.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {completedSteps.length} of {UMRAH_STEPS.length} steps completed
        </p>
      </Card>

      <div className="space-y-4">
        {UMRAH_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          return (
            <Card key={step.id} className="bg-white/80 border-white/50 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full p-4 flex items-start gap-3 text-left"
                data-testid={`step-${step.id}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Step {step.id}: {step.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </button>
              
              <div className="px-4 pb-4 pt-0 ml-9">
                <ul className="space-y-1 text-sm text-muted-foreground mb-3">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                {step.dua && (
                  <Card className="bg-accent/30 border-white/50 p-3 rounded-xl mt-3">
                    <p className="text-xs uppercase tracking-widest text-primary font-medium mb-2">Dua</p>
                    <p className="text-lg font-arabic text-right mb-2" dir="rtl">{step.dua.arabic}</p>
                    <p className="text-xs text-primary italic mb-1">{step.dua.transliteration}</p>
                    <p className="text-sm text-muted-foreground">{step.dua.english}</p>
                  </Card>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          May Allah accept your Umrah and grant you a blessed journey.
        </p>
      </Card>
    </div>
  );
}
