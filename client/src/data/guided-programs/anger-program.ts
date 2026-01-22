import type { GuidedProgram } from './index';

export const angerProgram: GuidedProgram = {
    id: "anger",
    title: "Anger & Forgiveness",
    subtitle: "Mastering your emotions for peace",
    duration: "21 days",
    daysCount: 30, // Keeping 30 for consistency in UI progress bar if needed, or 21
    category: "Calm & Emotional",
    description: "A 21-day journey to understand the roots of anger and the power of forgiveness. Learn how to transform frustration into patience and seek peace through the Prophetic path.",
    weeklyDepthDays: [7, 14, 21],
    days: [
        {
            dayNumber: 1,
            title: "The Strength of Control",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Ash-Shura",
                ayahRange: "Ayah 37",
                duration: "3:00",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4302.mp3"
            },
            ayah: {
                arabic: "وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ",
                english: "And when they are angry, they forgive.",
                reference: "Surah Ash-Shura 42:37",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4302.mp3",
                emotionalRelevance: "True strength is not in venting anger, but in the ability to forgive when you have the right to be angry. It's a sign of a heart connected to Allah."
            },
            story: {
                title: "The Wrestler",
                content: "The Prophet (SAW) said: 'The strong man is not the one who can wrestle, but the strong man is the one who controls himself at the time of anger.'",
                lesson: "Your greatest victory is winning the battle against your own temper. It takes more courage to stay calm than to lash out."
            },
            guidedReflection: {
                prompt: "What usually triggers your anger? Is it a feeling of being disrespected, ignored, or unheard? Identifying the root is the first step to healing.",
                journalPrompts: [
                    "When was the last time you felt truly angry?",
                    "What was the emotion hidden beneath that anger?",
                    "How did you feel after the anger passed?"
                ]
            },
            actionStep: {
                title: "The Change of Position",
                description: "Next time you feel anger rising today, change your physical position. If you are standing, sit down. If you are sitting, lie down. This is the Sunnah of the Prophet (SAW).",
                reminder: "Cooling down your body helps cool down your heart."
            },
            dua: {
                arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
                english: "I seek refuge in Allah from the accursed devil.",
                transliteration: "A'udhu billahi minash-shaytanir-rajim",
                context: "The Prophet (SAW) taught that saying this when angry makes the anger go away. It reminds us that anger is a spark from elsewhere."
            },
            emotionalCheckIn: {
                question: "How does your body feel when you are angry?",
                options: ["Hot", "Tense", "Shaky", "Loud", "Silent", "Heavy"]
            },
            closingReassurance: "You are learning to master your heart. It take's time. Allah sees your struggle and rewards your restraint. Be patient with yourself."
        },
        {
            dayNumber: 2,
            title: "Seeking Refuge",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Al-A'raf",
                ayahRange: "Ayah 200",
                duration: "3:30",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1154.mp3"
            },
            ayah: {
                arabic: "وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَانِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ",
                english: "And if an evil whisper comes to you from Satan, then seek refuge in Allah.",
                reference: "Surah Al-A'raf 7:200",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1154.mp3",
                emotionalRelevance: "Anger often feels like a fire that isn't ours, but is being stoked by something else. Allah gives us the immediate solution: seek refuge. You don't have to fight the fire alone; you can call upon the One who can cool it."
            },
            story: {
                title: "The Prophet's Advice",
                content: "A man came to the Prophet (SAW) and said, 'Advise me.' The Prophet said, 'Do not become angry.' The man repeated his request several times, and each time the Prophet said, 'Do not become angry.'",
                lesson: "The core of good character is the ability to restrain anger. It is the advice that covers all aspects of life, because anger often leads to regret and broken relationships."
            },
            guidedReflection: {
                prompt: "Reflect on a time when you let your anger win. What did it cost you? Now imagine a time when you stayed calm. How did that feel by comparison?",
                journalPrompts: [
                    "What are the physical 'warning signs' that you are about to get angry?",
                    "How can you make 'seeking refuge' a habit before you speak?",
                    "Who in your life sets a good example of calmness?"
                ]
            },
            actionStep: {
                title: "The Wudu Reset",
                description: "The Prophet (SAW) said: 'Anger is from Satan, and Satan was created from fire. Fire is extinguished only by water, so if any of you becomes angry, let him perform wudu.' Next time you feel frustrated today, go and wash your face and hands with cool water.",
                reminder: "Water calms the fire of the soul."
            },
            dua: {
                arabic: "اللَّهُمَّ أَذْهِبْ غَيْظَ قَلْبِي",
                english: "O Allah, remove the anger of my heart.",
                transliteration: "Allahumma adh-hib ghayza qalbi",
                context: "A specific dua taught by the Prophet (SAW) for those who struggle with deep-seated frustration or a quick temper."
            },
            emotionalCheckIn: {
                question: "How much 'fire' is in your heart right now?",
                options: ["Cool and calm", "A few sparks", "Simmering", "Burning", "Watching the fire", "Peaceful"]
            },
            closingReassurance: "Every time you choose peace over anger, you are making your heart more beautiful. Allah is with those who restrain themselves. Rest in His peace."
        },
        {
            dayNumber: 3,
            title: "The Power of Silence",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Al-Isra",
                ayahRange: "Ayah 53",
                duration: "4:00",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2122.mp3"
            },
            ayah: {
                arabic: "وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ",
                english: "And tell My servants to say that which is best.",
                reference: "Surah Al-Isra 17:53",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2122.mp3",
                emotionalRelevance: "Anger often wants to say the 'truest' or 'harshest' thing. But Allah asks us to say what is 'best'. Sometimes, the best thing to say is nothing at all until our heart has cooled."
            },
            story: {
                title: "The Silence of the Prophet",
                content: "When people insulted the Prophet (SAW) or spoke to him rudely, he would often remain silent or respond with extreme kindness. He never matched their harshness. He knew that silence is a shield that prevents the escalation of conflict.",
                lesson: "You don't need to win every argument. The true winner is the one who preserves their dignity and the peace of the moment through silence."
            },
            guidedReflection: {
                prompt: "Think of a situation where you regret speaking in anger. What would have happened if you had stayed silent for just 60 seconds?",
                journalPrompts: [
                    "Why does silence feel like losing sometimes?",
                    "How can you use silence as a tool for self-protection?",
                    "What advice would your 'calm self' give to your 'angry self' right now?"
                ]
            },
            actionStep: {
                title: "the 10-Second Rule",
                description: "Today, if someone says something that normally triggers you, count to ten slowly before you respond. If you can't say something 'best', choose silence.",
                reminder: "Silence is gold when speech is fire."
            },
            dua: {
                arabic: "اللَّهُمَّ اجْعَلْ صَمْتِي فِكْرًا وَنُطْقِي ذِكْرًا",
                english: "O Allah, make my silence reflection and my speech remembrance.",
                transliteration: "Allahummaj-'al samti fikran wa nutqi dhikran",
                context: "Asking Allah to transform our natural pauses into moments of spiritual depth."
            },
            emotionalCheckIn: {
                question: "How easy is it for you to stay silent today?",
                options: ["Easy", "A struggle", "Learning", "Preferring silence", "Feeling talkative", "Restrained"]
            },
            closingReassurance: "Your silence is not weakness; it is a profound form of worship. It is a choice to keep your soul clean from the soot of anger. Sleep in the quiet of Allah's love."
        },
        {
            dayNumber: 4,
            title: "Forgiveness for Yourself",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Az-Zumar",
                ayahRange: "Ayah 53",
                duration: "4:30",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4136.mp3"
            },
            ayah: {
                arabic: "إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
                english: "Indeed, Allah forgives all sins.",
                reference: "Surah Az-Zumar 39:53",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4136.mp3",
                emotionalRelevance: "Anger is often directed inward. We are angry at our own mistakes, our own past, our own weaknesses. But if Allah, the Creator, can forgive everything, who are we to hold on to anger against ourselves?"
            },
            story: {
                title: "The Repentance of Wahshi",
                content: "Wahshi had killed the Prophet's beloved uncle Hamza. For years he was terrified and angry at himself. But when he finally came to Islam, the Prophet (SAW) accepted him. Allah's mercy was broader than his crime.",
                lesson: "Forgiving yourself is not excusing your mistakes; it's allowing yourself to heal so you can move forward. You cannot grow while you are burning in self-hatred."
            },
            guidedReflection: {
                prompt: "What are you still angry at yourself for? Can you offer that mistake to Allah and ask Him to transform it into a lesson?",
                journalPrompts: [
                    "How does being angry at yourself affect how you treat others?",
                    "What would your life look like if you truly felt forgiven?",
                    "Name 3 things you like about your progress so far."
                ]
            },
            actionStep: {
                title: "The Compassionate Look",
                description: "Today, look in the mirror and say: 'I am a work in progress, and Allah's mercy is enough for me.' Forgive yourself for not being perfect yet.",
                reminder: "Healing starts with self-forgiveness."
            },
            dua: {
                arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
                english: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
                transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal-khasirin",
                context: "The first dua of Adam and Hawa. It is the beginning of all return to Allah."
            },
            emotionalCheckIn: {
                question: "How gentle are you being with your soul today?",
                options: ["Gentle", "Harsh", "Learning", "Softening", "Forgiving", "Critical"]
            },
            closingReassurance: "You are not your mistakes. You are the soul that is trying to return to its Lord. Allah loves your attempts. Sleep in His forgiveness tonight."
        },
        {
            dayNumber: 5,
            title: "The Mercy of Forgiving Others",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "An-Nur",
                ayahRange: "Ayah 22",
                duration: "4:00",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2795.mp3"
            },
            ayah: {
                arabic: "وَلْيَعْفُوا وَلْيَصْفَحُوا أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ",
                english: "And let them pardon and overlook. Would you not like that Allah should forgive you?",
                reference: "Surah An-Nur 24:22",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2795.mp3",
                emotionalRelevance: "This is a profound deal. If we want Allah to be expansive in His mercy toward us, we must be expansive in our mercy toward others. Forgiving someone else is often more for our own peace than it is for them."
            },
            story: {
                title: "Abu Bakr and the Slanderer",
                content: "When one of Abu Bakr's relatives slandered his daughter Aisha, Abu Bakr vowing never to help him again. Then this ayah was revealed. Abu Bakr immediately said: 'Yes, I love that Allah should forgive me!' and he resumed his help and forgave him.",
                lesson: "The strength to forgive comes from our desire for Allah's forgiveness. It is the ultimate motivation to let go of a grudge."
            },
            guidedReflection: {
                prompt: "Is there someone you are holding a grudge against? How is that anger affecting your own heart? What would it feel like to 'overlook' for the sake of Allah?",
                journalPrompts: [
                    "What prevents you from forgiving this person?",
                    "How does lashing out make you feel afterward compared to staying silent?",
                    "Can you make dua for the person who hurt you today?"
                ]
            },
            actionStep: {
                title: "The Silent Pardon",
                description: "Today, choose one person who has annoyed or hurt you and say to Allah: 'Ya Allah, I forgive them for Your sake. Please forgive me too.' You don't need to tell them; just settle it in your heart.",
                reminder: "Forgiveness is the key to a free heart."
            },
            dua: {
                arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
                english: "O Allah, You are Pardoning and You love to pardon, so pardon me.",
                transliteration: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni",
                context: "The Prophet (SAW) taught this as the best dua for the night of power. It is the core of seeking pardon."
            },
            emotionalCheckIn: {
                question: "How 'light' does your heart feel today?",
                options: ["Light", "Heavy with a grudge", "Softening", "Willing to forgive", "Peaceful", "Aware"]
            },
            closingReassurance: "Forgiveness is the shortcut to peace. By letting go of the anger you have for others, you are making room for the love of Allah. Sleep with a clean heart."
        }
    ]
};
