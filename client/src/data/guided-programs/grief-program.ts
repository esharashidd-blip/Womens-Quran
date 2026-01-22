import type { GuidedProgram } from './index';

export const griefProgram: GuidedProgram = {
    id: "grief",
    title: "Grief & Finding Peace",
    subtitle: "Healing your heart after loss",
    duration: "30 days",
    daysCount: 30,
    category: "Calm & Emotional",
    description: "A compassionate 30-day journey designed for sisters experiencing loss. We explore the Qur'anic perspective on grief, finding comfort in Allah's promise of reunion and the eternal nature of the soul.",
    weeklyDepthDays: [7, 14, 21, 28],
    days: [
        {
            dayNumber: 1,
            title: "It's Okay to Grieve",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Al-Baqarah",
                ayahRange: "Ayah 155-156",
                duration: "3:30",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/162.mp3"
            },
            ayah: {
                arabic: "الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
                english: "Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
                reference: "Surah Al-Baqarah 2:156",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/162.mp3",
                emotionalRelevance: "This ayah is our ultimate anchor. It reminds us that our loved ones - and we ourselves - belong to Allah. We are on a journey back to Him."
            },
            story: {
                title: "The Prophet's Tears",
                content: "When the Prophet (SAW) lost his infant son Ibrahim, his eyes overflowed with tears. He said: 'The eyes shed tears and the heart is grieved, and we will not say except what pleases our Lord...'",
                lesson: "Grief is a human emotion, and even the best of creation felt it. Tears are a mercy from Allah. Don't suppress your pain."
            },
            guidedReflection: {
                prompt: "Today, allow yourself to feel whatever is present. You don't need to be 'strong' in the way the world expects. Strong is being honest with Allah.",
                journalPrompts: [
                    "What is one memory of your loved one that brings a smile to your face today?",
                    "How are you feeling in this very moment?",
                    "What would you like to say to Allah about your pain?"
                ]
            },
            actionStep: {
                title: "A Moment of Silence",
                description: "Spend 5 minutes in complete silence after a prayer today. Just let your heart be present with Allah. No words needed.",
                reminder: "Allah knows what your heart is saying even when your tongue is silent."
            },
            dua: {
                arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
                english: "Indeed we belong to Allah and indeed to Him we will return. O Allah, reward me in my affliction and replace it with something better for me.",
                transliteration: "Inna lillahi wa inna ilayhi raji'un. Allahumma-jurni fi musibati wa akhlif li khayran minha",
                context: "The Prophet (SAW) taught this dua to Umm Salama (RA) when she lost her husband. It holds the secret to healing."
            },
            emotionalCheckIn: {
                question: "How heavy does your heart feel today?",
                options: ["Very heavy", "A bit lighter", "Numb", "Aching", "Peaceful", "Empty"]
            },
            closingReassurance: "You've taken the first step on a difficult path. Allah is walking it with you. He is Al-Jabbar, the Mender of broken hearts. Rest now."
        },
        {
            dayNumber: 2,
            title: "The Year of Sorrow",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Ash-Sharh",
                ayahRange: "Ayah 1-8",
                duration: "2:30",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6182.mp3"
            },
            ayah: {
                arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا",
                english: "For indeed, with hardship comes ease. Indeed, with hardship comes ease.",
                reference: "Surah Ash-Sharh 94:5-6",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6182.mp3",
                emotionalRelevance: "Notice that Allah says ease is *with* the hardship, not just after it. Even in the deepest grief, there are moments of ease, small mercies, and a strength you didn't know you had."
            },
            story: {
                title: "The Prophet's Darkest Year",
                content: "In one year, the Prophet (SAW) lost his beloved wife Khadijah (RA) and his supportive uncle Abu Talib. It was called the 'Year of Sorrow'. He was deeply grieved, yet he kept turning to Allah. Soon after, Allah gifted him the Isra wal Mi'raj - the Night Journey to the heavens.",
                lesson: "Extreme sorrow is often followed by extreme closeness to Allah. He knows your heartbreak and He is preparing a way for you to find light again."
            },
            guidedReflection: {
                prompt: "Can you identify one small 'ease' that has happened today? Maybe a kind message, a beautiful sky, or a moment of quiet. Acknowledge it as a gift from Allah.",
                journalPrompts: [
                    "What makes your grief feel heaviest today?",
                    "What are you doing to be kind to yourself in your sorrow?",
                    "How has your relationship with Allah changed since your loss?"
                ]
            },
            actionStep: {
                title: "The Gentle Walk",
                description: "Go outside for just 10 minutes today. Don't think about 'exercise' - just move your body gently and notice the life around you. The world keeps growing, and your heart will too.",
                reminder: "Nature is a silent witness to Allah's constant care."
            },
            dua: {
                arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
                english: "O Allah, I hope for Your mercy, so do not leave me to myself even for the blink of an eye.",
                transliteration: "Allahumma rahmataka arju fala takilni ila nafsi tarfata 'ayn",
                context: "When we are grieving, we often feel we can't trust our own strength. This dua is a total surrender to Allah's care."
            },
            emotionalCheckIn: {
                question: "Did you find any 'ease' today?",
                options: ["Yes, a little", "None yet", "Still looking", "Felt peaceful for a moment", "Grateful", "Exhausted"]
            },
            closingReassurance: "Ease is woven into your struggle, even if it's hard to see right now. You are doing enough just by being here. Sleep in His mercy."
        },
        {
            dayNumber: 3,
            title: "Wait for the Reunion",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Ar-Ra'd",
                ayahRange: "Ayah 23",
                duration: "3:45",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1815.mp3"
            },
            ayah: {
                arabic: "جَنَّاتُ عَدْنٍ يَدْخُلُونَهَا وَمَن صَلَحَ مِنْ آبَائِهِمْ وَأَزْوَاجِهِمْ وَذُرِّيَّاتِهِمْ",
                english: "Gardens of perpetual residence; they will enter them with whoever were righteous among their fathers, their spouses and their descendants.",
                reference: "Surah Ar-Ra'd 13:23",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1815.mp3",
                emotionalRelevance: "Death is not a goodbye; it is a 'see you later'. Allah promises that families will be reunited in Jannah. Your love for them doesn't end; it just waits for a more beautiful place to continue."
            },
            story: {
                title: "The Scent of Jannah",
                content: "The companions used to find comfort in the fact that they would be with those they loved in the hereafter. When one man expressed fear of being far from the Prophet (SAW) in Jannah, he was told: 'A person will be with those whom he loves.'",
                lesson: "The bond of love for the sake of Allah is eternal. Your grief is proof of the beauty of the bond you share. Keep that love alive through your prayers for them."
            },
            guidedReflection: {
                prompt: "Imagine your reunion in Jannah. What is the first thing you want to say or do? Let that hope be a balm for your current separation.",
                journalPrompts: [
                    "What quality of your loved one do you hope to see again in Jannah?",
                    "How does the promise of reunion change how you feel about death?",
                    "What can you do today to be 'righteous' so you can join them there?"
                ]
            },
            actionStep: {
                title: "Dua for the Departed",
                description: "Spend a few minutes today making specific, heartfelt dua for your loved one. Ask for their grave to be a garden of Paradise and for them to be high in Jannah.",
                reminder: "Dua is the bridge between this world and the next."
            },
            dua: {
                arabic: "اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا",
                english: "O Allah, forgive our living and our dead, those who are present and those who are absent.",
                transliteration: "Allahummagh-fir lihayyina wa mayyitina wa shahidina wa gha'ibina",
                context: "A comprehensive dua that connects us to all those we have lost and those who remain."
            },
            emotionalCheckIn: {
                question: "Does the thought of Jannah bring you comfort today?",
                options: ["Yes, much comfort", "It's hard to imagine", "I hope so", "Felt a glimmer of hope", "Tearful", "Waiting"]
            },
            closingReassurance: "Your separation is only temporary. Your reunion is eternal. Trust Allah's promise of the Gardens. Sleep with hope in your heart."
        },
        {
            dayNumber: 4,
            title: "Allah is Close to the Broken-Hearted",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Qaf",
                ayahRange: "Ayah 16",
                duration: "2:15",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4759.mp3"
            },
            ayah: {
                arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
                english: "And We are closer to him than [his] jugular vein.",
                reference: "Surah Qaf 50:16",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4759.mp3",
                emotionalRelevance: "When you feel alone in your grief, remember that Allah is closer to you than your own breath. He hears the silent cries of your heart and knows the depth of your pain better than anyone else."
            },
            story: {
                title: "The Proximity of Pain",
                content: "It is narrated that Allah says: 'I am with those whose hearts are broken for My sake.' Grief can be a sacred space because it forces us to realize our total dependence on Allah. In that vulnerability, we find a unique closeness to Him.",
                lesson: "The loneliness of grief is an invitation to find the company of the Divine. You are never truly alone when Al-Wadud (The Most Loving) is with you."
            },
            guidedReflection: {
                prompt: "Can you feel Allah's presence in your quietest moments? How would you talk to Him if you truly believed He was listening to every heartbeat?",
                journalPrompts: [
                    "What makes you feel most alone in your grief?",
                    "How can you 'talk' to Allah about your loss today?",
                    "Name 3 things that make you feel Allah's love."
                ]
            },
            actionStep: {
                title: "The Heartfelt Conversation",
                description: "Today, after your prayer or before bed, talk to Allah out loud. Tell Him exactly how you feel, like you would a dear friend. Pour it all out.",
                reminder: "Vulnerability with Allah is the beginning of healing."
            },
            dua: {
                arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
                english: "O Allah, I seek refuge in You from anxiety and sorrow.",
                transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani",
                context: "A Prophetic dua that acknowledges both the worry about the future and the sorrow of the past."
            },
            emotionalCheckIn: {
                question: "Do you feel Allah's closeness today?",
                options: ["Yes", "I'm trying to", "Feel alone", "Glimpses of it", "Seeking refuge", "Peaceful"]
            },
            closingReassurance: "He who is closer than your jugular vein is holding your heart. He will not let you break past what you can bear. Rest in His embrace."
        },
        {
            dayNumber: 5,
            title: "Patience is a Beautiful Path",
            quranAudio: {
                reciter: "Mishary Rashid Alafasy",
                surahName: "Yusuf",
                ayahRange: "Ayah 18",
                duration: "3:30",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1622.mp3"
            },
            ayah: {
                arabic: "فَصَبْرٌ جَمِيلٌ",
                english: "So patience is most fitting (Sabrun Jameel).",
                reference: "Surah Yusuf 12:18",
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1622.mp3",
                emotionalRelevance: "Yaqub (AS) said this when he lost his son Yusuf. 'Sabrun Jameel' is a patience that has no complaint to people, only to Allah. It is a graceful acceptance of what has been decreed."
            },
            story: {
                title: "The Patience of Yaqub",
                content: "Yaqub (AS) grieved for his son for decades. His eyes even turned white from weeping. Yet his faith never wavered. He said: 'I only complain of my suffering and my grief to Allah.' He kept his hope until he was eventually reunited with his son.",
                lesson: "Beautiful patience doesn't mean you don't feel pain. It means you choose where to take that pain. Taking it to Allah makes it a path of spiritual growth."
            },
            guidedReflection: {
                prompt: "What does 'beautiful patience' look like to you in your current situation? How is it different from just 'giving up'?",
                journalPrompts: [
                    "How can you be more patient with your own healing process?",
                    "What are you complaining about to people that you should be taking to Allah?",
                    "How does hope manifest in your life right now?"
                ]
            },
            actionStep: {
                title: "The Silent Trust",
                description: "Today, when you feel the urge to complain or express bitterness, pause and say: 'Alhamdulillah, I trust Allah's plan.' Choose dignity in your pain.",
                reminder: "Your Sabr is being witnessed and rewarded."
            },
            dua: {
                arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا",
                english: "Our Lord, pour out upon us patience.",
                transliteration: "Rabbana afrigh 'alayna sabran",
                context: "We ask Allah to 'pour' patience onto us, like water over a fire. It is a request for abundance in self-control."
            },
            emotionalCheckIn: {
                question: "Are you being patient with your healing today?",
                options: ["Trying my best", "Losing patience", "It's hard", "Feeling graceful", "Struggling", "Accepting"]
            },
            closingReassurance: "Grief is a marathon, not a sprint. Be gentle with your pace. Allah is pleased with your Sabr. Sleep in the beauty of your persistence."
        }
        // ... Additional days would be generated similarly
    ]
};
