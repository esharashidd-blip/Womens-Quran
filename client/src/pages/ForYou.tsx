import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, Bookmark, Share2, Copy, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useMemo } from "react";

interface TopicContent {
  type: 'ayah' | 'meaning' | 'dua';
  arabic?: string;
  english: string;
  reference?: string;
  transliteration?: string;
}

interface Topic {
  id: string;
  title: string;
  category: string;
  content: TopicContent[];
}

const TOPICS: Topic[] = [
  {
    id: "anxiety",
    title: "Anxiety & Overthinking",
    category: "Calm & Emotional",
    content: [
      { type: 'ayah', arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", english: "Verily, in the remembrance of Allah do hearts find rest.", reference: "Surah Ar-Ra'd 13:28" },
      { type: 'meaning', english: "When anxiety overwhelms you, know that turning to Allah brings true peace. Your racing thoughts can find stillness in His remembrance. This isn't about suppressing your feelings—it's about anchoring yourself in something greater than your worries." },
      { type: 'dua', arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ", english: "O Allah, I seek refuge in You from anxiety and sorrow.", transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan" },
      { type: 'ayah', arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", english: "Allah does not burden a soul beyond that it can bear.", reference: "Surah Al-Baqarah 2:286" },
      { type: 'meaning', english: "Whatever you're facing right now, Allah knows you can handle it. He sees your strength even when you can't. Trust that He wouldn't give you this test if you weren't capable of passing it." },
    ]
  },
  {
    id: "heartbreak",
    title: "Heartbreak & Healing",
    category: "Love & Relationships",
    content: [
      { type: 'ayah', arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", english: "For indeed, with hardship comes ease.", reference: "Surah Ash-Sharh 94:5" },
      { type: 'meaning', english: "Your heart may feel shattered right now, but healing is coming. Allah promises that ease accompanies every hardship—not after it, but with it. Even in your pain, blessings are unfolding." },
      { type: 'dua', arabic: "اللَّهُمَّ اجْبُرْ كَسْرِي", english: "O Allah, mend my brokenness.", transliteration: "Allahumma-jbur kasri" },
      { type: 'ayah', arabic: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", english: "Perhaps you hate a thing and it is good for you.", reference: "Surah Al-Baqarah 2:216" },
      { type: 'meaning', english: "What feels like loss today may be protection tomorrow. Allah sees the full picture when we only see a fragment. Trust His plan for your heart." },
    ]
  },
  {
    id: "selfworth",
    title: "Self-Worth",
    category: "Strength & Self-Worth",
    content: [
      { type: 'ayah', arabic: "لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ", english: "We have certainly created man in the best of stature.", reference: "Surah At-Tin 95:4" },
      { type: 'meaning', english: "Allah created you with intention and beauty. Your worth isn't determined by others' opinions or your achievements—it was established by your Creator. You are enough because He made you enough." },
      { type: 'dua', arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", english: "O Allah, help me remember You, be grateful to You, and worship You beautifully.", transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik" },
    ]
  },
  {
    id: "protection",
    title: "Protection",
    category: "Spiritual Protection",
    content: [
      { type: 'ayah', arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", english: "And whoever relies upon Allah - then He is sufficient for him.", reference: "Surah At-Talaq 65:3" },
      { type: 'meaning', english: "When you feel vulnerable or threatened, remember that Allah's protection surrounds you. He is the ultimate guardian—nothing reaches you except by His will, and He never abandons those who trust Him." },
      { type: 'dua', arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ", english: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm.", transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama" },
    ]
  },
  {
    id: "patience",
    title: "Patience",
    category: "Calm & Emotional",
    content: [
      { type: 'ayah', arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", english: "Indeed, Allah is with the patient.", reference: "Surah Al-Baqarah 2:153" },
      { type: 'meaning', english: "Patience isn't passive waiting—it's active trust. When you choose sabr, you're choosing to believe that Allah's timing is perfect even when yours feels unbearable. He is WITH you in this wait." },
      { type: 'dua', arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا", english: "Our Lord, pour upon us patience.", transliteration: "Rabbana afrigh 'alayna sabra" },
    ]
  },
  {
    id: "peace",
    title: "Peace & Sleep",
    category: "Calm & Emotional",
    content: [
      { type: 'ayah', arabic: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ", english: "It is He who sent down tranquility into the hearts of the believers.", reference: "Surah Al-Fath 48:4" },
      { type: 'meaning', english: "Peace isn't something you have to chase—it's a gift Allah places in your heart when you turn to Him. As you prepare for sleep, release your worries into His hands. He watches over you." },
      { type: 'dua', arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", english: "In Your name, O Allah, I die and I live.", transliteration: "Bismika Allahumma amutu wa ahya" },
    ]
  },
  {
    id: "stress",
    title: "Stress & Pressure",
    category: "Calm & Emotional",
    content: [
      { type: 'ayah', arabic: "وَمَا أَصَابَكُم مِّن مُّصِيبَةٍ فَبِمَا كَسَبَتْ أَيْدِيكُمْ وَيَعْفُو عَن كَثِيرٍ", english: "And whatever strikes you of disaster - it is for what your hands have earned; but He pardons much.", reference: "Surah Ash-Shura 42:30" },
      { type: 'meaning', english: "Stress often comes when we feel we must control everything. Remember that your efforts matter, but the outcome belongs to Allah. Do your best, then trust Him with the rest." },
      { type: 'dua', arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا", english: "O Allah, there is no ease except in what You have made easy.", transliteration: "Allahumma la sahla illa ma ja'altahu sahla" },
    ]
  },
  {
    id: "sadness",
    title: "Sadness & Crying",
    category: "Calm & Emotional",
    content: [
      { type: 'ayah', arabic: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ", english: "I only complain of my suffering and my grief to Allah.", reference: "Surah Yusuf 12:86" },
      { type: 'meaning', english: "Your tears are not weakness—they are a form of release that Allah understands. Prophet Yaqub cried until he lost his sight, yet his faith never wavered. Let yourself feel, then let yourself heal." },
      { type: 'dua', arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ", english: "O Allah, it is Your mercy I hope for. Do not leave me to myself for even the blink of an eye.", transliteration: "Allahumma rahmataka arju fala takilni ila nafsi tarfata 'ayn" },
    ]
  },
  {
    id: "loneliness",
    title: "Loneliness",
    category: "Love & Relationships",
    content: [
      { type: 'ayah', arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", english: "And We are closer to him than his jugular vein.", reference: "Surah Qaf 50:16" },
      { type: 'meaning', english: "You may feel alone, but you never truly are. Allah is closer to you than you can imagine—closer than your own breath. He hears every unspoken word in your heart." },
      { type: 'dua', arabic: "اللَّهُمَّ آنِسْ وَحْشَتِي", english: "O Allah, comfort my loneliness.", transliteration: "Allahumma anis wahshati" },
    ]
  },
  {
    id: "gratitude",
    title: "Gratitude",
    category: "Barakah & Growth",
    content: [
      { type: 'ayah', arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", english: "If you are grateful, I will surely increase you.", reference: "Surah Ibrahim 14:7" },
      { type: 'meaning', english: "Gratitude isn't just saying thank you—it's a state of the heart that recognizes Allah's blessings in every moment. When you practice gratitude, you open the door for more blessings to flow in." },
      { type: 'dua', arabic: "الْحَمْدُ لِلَّهِ عَلَىٰ كُلِّ حَالٍ", english: "Praise be to Allah in every circumstance.", transliteration: "Alhamdulillahi 'ala kulli hal" },
    ]
  },
  {
    id: "forgiveness",
    title: "Repentance & Forgiveness",
    category: "Spiritual Protection",
    content: [
      { type: 'ayah', arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", english: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah.'", reference: "Surah Az-Zumar 39:53" },
      { type: 'meaning', english: "No matter what you've done, Allah's mercy is greater. He loves to forgive, and He is waiting for you to turn back. Your past doesn't define your future with Him." },
      { type: 'dua', arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", english: "I seek forgiveness from Allah, the Magnificent, there is no god but He, the Ever-Living, the Self-Sustaining, and I repent to Him.", transliteration: "Astaghfirullah al-'Azim alladhi la ilaha illa huwa al-Hayy al-Qayyum wa atubu ilayh" },
    ]
  },
  {
    id: "trust",
    title: "Trust in Allah",
    category: "Barakah & Growth",
    content: [
      { type: 'ayah', arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", english: "And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.", reference: "Surah At-Talaq 65:2-3" },
      { type: 'meaning', english: "When all doors seem closed, trust that Allah is opening one you cannot yet see. His provision comes in unexpected ways, at unexpected times. Keep your trust in Him unwavering." },
      { type: 'dua', arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", english: "Allah is sufficient for us, and He is the best disposer of affairs.", transliteration: "Hasbunallahu wa ni'mal wakeel" },
    ]
  },
];

const QUICK_PICKS = [
  { id: "anxiety", label: "Anxiety & Overthinking" },
  { id: "heartbreak", label: "Heartbreak & Healing" },
  { id: "selfworth", label: "Self-Worth" },
  { id: "protection", label: "Protection" },
  { id: "patience", label: "Patience" },
  { id: "peace", label: "Peace & Sleep" },
];

const CATEGORIES = [
  {
    name: "Calm & Emotional",
    topics: ["anxiety", "stress", "sadness", "peace", "patience"]
  },
  {
    name: "Love & Relationships",
    topics: ["heartbreak", "loneliness"]
  },
  {
    name: "Strength & Self-Worth",
    topics: ["selfworth"]
  },
  {
    name: "Spiritual Protection",
    topics: ["protection", "forgiveness"]
  },
  {
    name: "Barakah & Growth",
    topics: ["gratitude", "trust"]
  },
];

export default function ForYou() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransliteration, setShowTransliteration] = useState(false);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return TOPICS.filter(topic =>
      topic.title.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query) ||
      topic.content.some(c => c.english.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const openTopic = (topicId: string) => {
    const topic = TOPICS.find(t => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setCurrentCardIndex(0);
    }
  };

  const closeTopic = () => {
    setSelectedTopic(null);
    setCurrentCardIndex(0);
  };

  const nextCard = () => {
    if (selectedTopic && currentCardIndex < selectedTopic.content.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const currentCard = selectedTopic?.content[currentCardIndex];

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 pb-24">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-4 py-4 border-b border-primary/5">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={closeTopic} className="rounded-full" data-testid="button-close-topic">
              <X className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-serif text-lg">{selectedTopic.title}</p>
              <p className="text-xs text-muted-foreground">{currentCardIndex + 1} of {selectedTopic.content.length}</p>
            </div>
            <div className="w-9" />
          </div>
        </div>

        <div className="px-4 pt-6 max-w-lg mx-auto">
          <div className="relative min-h-[400px]">
            {currentCard?.type === 'ayah' && (
              <Card className="bg-white/90 border-white/50 p-6 rounded-3xl space-y-4" data-testid="card-ayah">
                <span className="text-xs uppercase tracking-widest text-primary font-medium">Ayah</span>
                <p className="text-3xl font-arabic text-right leading-loose" dir="rtl">
                  {currentCard.arabic}
                </p>
                <p className="text-lg text-foreground leading-relaxed italic">
                  "{currentCard.english}"
                </p>
                <p className="text-sm text-muted-foreground">{currentCard.reference}</p>
                <div className="flex items-center gap-2 pt-4">
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Play className="w-4 h-4" /> Play
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Bookmark className="w-4 h-4" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">Share this with other sisters 🤍</p>
              </Card>
            )}

            {currentCard?.type === 'meaning' && (
              <Card className="bg-gradient-to-br from-primary/5 to-accent/20 border-white/50 p-6 rounded-3xl space-y-4" data-testid="card-meaning">
                <span className="text-xs uppercase tracking-widest text-primary font-medium">What this means for you today</span>
                <p className="text-lg text-foreground leading-relaxed">
                  {currentCard.english}
                </p>
              </Card>
            )}

            {currentCard?.type === 'dua' && (
              <Card className="bg-white/90 border-white/50 p-6 rounded-3xl space-y-4" data-testid="card-dua">
                <span className="text-xs uppercase tracking-widest text-primary font-medium">Dua</span>
                <p className="text-2xl font-arabic text-right leading-loose" dir="rtl">
                  {currentCard.arabic}
                </p>
                {showTransliteration && currentCard.transliteration && (
                  <p className="text-sm text-primary italic">{currentCard.transliteration}</p>
                )}
                <p className="text-lg text-foreground leading-relaxed">
                  {currentCard.english}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => setShowTransliteration(!showTransliteration)}
                  >
                    {showTransliteration ? 'Hide' : 'Show'} Transliteration
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
              </Card>
            )}

          </div>

          <div className="flex items-center justify-between mt-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevCard} 
              disabled={currentCardIndex === 0}
              className="rounded-full w-12 h-12"
              data-testid="button-prev-card"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex gap-1.5">
              {selectedTopic.content.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentCardIndex ? 'bg-primary w-6' : 'bg-primary/30'}`}
                />
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextCard}
              disabled={currentCardIndex === selectedTopic.content.length - 1}
              className="rounded-full w-12 h-12"
              data-testid="button-next-card"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif">For You</h1>
        <p className="text-sm text-muted-foreground">
          Quran guidance for what you're feeling today.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search: anxiety, heartbreak, sleep, protection..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 rounded-2xl bg-white/80 border-pink-100 focus:border-primary focus:ring-primary/20"
          data-testid="input-search-foryou"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={() => setSearchQuery("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isSearching ? (
        <div className="space-y-3">
          {filteredTopics.length === 0 ? (
            <Card className="bg-white/60 border-white/50 p-6 rounded-2xl text-center">
              <p className="text-muted-foreground">No topics found for "{searchQuery}"</p>
            </Card>
          ) : (
            filteredTopics.map(topic => (
              <Card
                key={topic.id}
                onClick={() => openTopic(topic.id)}
                className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer"
                data-testid={`search-result-${topic.id}`}
              >
                <p className="font-medium">{topic.title}</p>
                <p className="text-xs text-muted-foreground">{topic.category}</p>
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Quick Picks</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {QUICK_PICKS.map(pick => (
                <button
                  key={pick.id}
                  onClick={() => openTopic(pick.id)}
                  className="flex-shrink-0 bg-white/80 border border-primary/10 px-4 py-2.5 rounded-full text-sm font-medium hover-elevate transition-all"
                  data-testid={`quick-pick-${pick.id}`}
                >
                  {pick.label}
                </button>
              ))}
            </div>
          </div>

          {CATEGORIES.map(category => (
            <div key={category.name} className="space-y-3">
              <p className="text-sm font-medium text-foreground">{category.name}</p>
              <div className="space-y-2">
                {category.topics.map(topicId => {
                  const topic = TOPICS.find(t => t.id === topicId);
                  if (!topic) return null;
                  return (
                    <Card
                      key={topicId}
                      onClick={() => openTopic(topicId)}
                      className="bg-white/70 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer"
                      data-testid={`topic-${topicId}`}
                    >
                      <p className="font-medium text-sm">{topic.title}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
