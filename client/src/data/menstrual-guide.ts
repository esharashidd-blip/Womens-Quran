export interface MenstrualDayContent {
    dayNumber: number;
    title: string;
    reassurance: {
        title: string;
        content: string;
    };
    islamicGuidance: {
        title: string;
        content: string;
    };
    spiritualConnection: {
        title: string;
        duas: { arabic: string; translation: string }[];
        dhikr: string[];
        suggestions: { text: string; audioUrl?: string }[];
    };
    reflection: {
        title: string;
        content: string;
        audioUrl?: string;
    };
    selfCare: {
        title: string;
        content: string;
    };
    closing: {
        dua: string;
        affirmation: string;
    };
}

export const MENSTRUAL_GUIDE_DATA: MenstrualDayContent[] = [
    {
        dayNumber: 1,
        title: "Honoring Your Rhythm",
        reassurance: {
            title: "Gentle Welcome",
            content: "Assalamu alaikum, dear sister. Today, as your body enters its period of rest, know that you are in a state of worship through your obedience to Allah's design. There is no guilt in resting; there is only mercy in His decree. Take a deep breath and set the intention: 'I rest today because Allah has invited me to, and I will seek Him in new ways.'"
        },
        islamicGuidance: {
            title: "The Permission to Rest",
            content: "Menstruation is a natural, healthy process created by Allah. During this time, you are exempt from Salat (prayer) and Sawm (fasting) out of Allah's mercy. This isn't a 'break' from your faith, but a change in how you practice it. You are still a beloved servant, and your heart remains connected to Him."
        },
        spiritualConnection: {
            title: "Staying Connected",
            duas: [
                {
                    arabic: "اللَّهُمَّ لَكَ الْحَمْدُ كُلُّهُ",
                    translation: "O Allah, to You belongs all praise."
                }
            ],
            dhikr: ["SubhanAllah (100x)", "Alhamdulillah (100x)"],
            suggestions: [
                { text: "Listen to Surah Ar-Rahman", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Surah-Ar-Rahman.mp3" },
                { text: "Read the translation of Surah Maryam" }
            ]
        },
        reflection: {
            title: "The Cycle of Creation",
            content: "Just as the moon has phases and the seasons change, your body follows a divine rhythm. In the natural world, winter is a time of quiet and internal growth. Your cycle is your private winter. It is a time to pull back from the outward noise and listen to the inward whispers of your soul. Allah created this rhythm to teach us about renewal—that after every period of release, there is a new beginning.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Gentle Movement",
            content: "Listen to what your body needs. If you feel heavy, allow yourself to lie down. If you feel stagnant, a slow, five-minute walk or gentle stretching can help release tension. Hydrate with warm teas like ginger or raspberry leaf."
        },
        closing: {
            dua: "Ya Allah, accept my rest as an act of worship and keep my heart inclined towards You.",
            affirmation: "My body is an amanah, and I honor it with rest."
        }
    },
    {
        dayNumber: 2,
        title: "The Mercy in Silence",
        reassurance: {
            title: "Quiet Connection",
            content: "The absence of formal prayer can sometimes feel like a void, but it is actually a space Allah has cleared for you to speak to Him in your own words. You don't need a prayer mat to be heard. He is closer to you than your jugular vein, even now."
        },
        islamicGuidance: {
            title: "What is Encouraged",
            content: "While formal prayer is paused, almost every other door of worship remains wide open. You can recite Dhikr, make long personal Duas, attend Islamic classes, read Tafsir (exegesis), and listen to the beautiful recitation of the Quran. Your tongue can remain moist with the remembrance of Allah."
        },
        spiritualConnection: {
            title: "Heartfelt Talk",
            duas: [
                {
                    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
                    translation: "O Ever Living, O Sustainer, in Your Mercy I seek relief."
                }
            ],
            dhikr: ["La ilaha illa Allah", "Astaghfirullah"],
            suggestions: [
                { text: "Journal your Duas" },
                { text: "Listen to a lecture by a female scholar", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3" }
            ]
        },
        reflection: {
            title: "The Prophet's Kindness",
            content: "Our beloved Prophet (SAW) was incredibly tender with his wives during their cycles. He would lean in Aisha's (RA) lap and recite Quran while she was menstruating. This shows us that there is no 'spiritual impurity' in the person, only a ritual state. You are beloved and close to the Sunnah in your period of rest.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Nurturing the Soul",
            content: "Light a scented candle or use calming essential oils like lavender. Creating a peaceful environment helps your nervous system feel safe and supported during hormonal shifts."
        },
        closing: {
            dua: "Ya Allah, let my tongue never tire of Your remembrance.",
            affirmation: "I am always worthy of speaking to my Creator."
        }
    },
    {
        dayNumber: 3,
        title: "Deepening the Bond",
        reassurance: {
            title: "Soulful Nourishment",
            content: "Today, focus on the quality of your presence. Without the structure of the five daily prayers, you have the opportunity to linger in conversation with Allah throughout the day. Every task done with His name is an act of devotion."
        },
        islamicGuidance: {
            title: "Seeking Knowledge",
            content: "Many scholars encourage using this time to deepen your understanding of the Quran's meanings. Reading the translation and reflection (Tafsir) is highly rewarded and keeps the light of the Quran in your home and heart."
        },
        spiritualConnection: {
            title: "Reflective State",
            duas: [
                {
                    arabic: "رَبِّ زِدْنِي عِلْمًا",
                    translation: "My Lord, increase me in knowledge."
                }
            ],
            dhikr: ["SubhanAllahi wa bihamdihi", "SubhanAllahil 'Adheem"],
            suggestions: [
                { text: "Read the story of Prophet Yusuf (AS)" },
                { text: "Research one Name of Allah", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3" }
            ]
        },
        reflection: {
            title: "The Wisdom of Hajar",
            content: "Hajar (AS) ran between Safa and Marwa in a state of physical struggle and desperation. She didn't have formal prayer in those moments; she had her trust (Tawakkul) and her actions. Sometimes, the greatest worship is simply persevering through physical discomfort with a heart that trusts that relief is coming.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Warmth and Comfort",
            content: "Use a heating pad or a warm water bottle for cramps. Physical comfort is not an indulgence; it is a way to care for the vessel Allah gave you."
        },
        closing: {
            dua: "Ya Allah, illuminate my heart with the light of knowledge and patience.",
            affirmation: "I am patient with my body and trust in Allah's timing."
        }
    },
    {
        dayNumber: 4,
        title: "Emotional Sanctuary",
        reassurance: {
            title: "Validating Feelings",
            content: "Hormonal changes can bring waves of emotion—sadness, irritation, or fatigue. Don't fight these feelings; observe them with compassion. Allah knows the 'struggle within the soul,' and HE rewards your patience with yourself."
        },
        islamicGuidance: {
            title: "Mercy Over Perfection",
            content: "Islam does not expect you to be a robot. If you feel too tired for even extra Dhikr, your sleep with the intention of resting to gain strength is also rewarded. Islam is ease, not hardship."
        },
        spiritualConnection: {
            title: "Seeking Sakina",
            duas: [
                {
                    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ السَّكِينَةَ",
                    translation: "O Allah, I ask You for tranquility."
                }
            ],
            dhikr: ["La hawla wala quwwata illa billah"],
            suggestions: [
                { text: "Listen to a 'Sakina' meditation", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3" },
                { text: "Sit in nature for 10 minutes" }
            ]
        },
        reflection: {
            title: "The Strength of Maryam",
            content: "When Maryam (AS) was in the greatest pain of labor, she wished she were forgotten. Allah did not scold her for her pain or her words. Instead, He provided her with fresh dates and a stream of water. He met her physical and emotional needs first. Your pain is not a lack of faith; it is a part of the human experience that Allah meets with compassion.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Emotional Release",
            content: "If you feel the need to cry, let it out. Tears are a mercy from Allah. Spend time journaling your thoughts to move them out of your body and onto paper."
        },
        closing: {
            dua: "Ya Allah, grant me peace in my heart and strength in my body.",
            affirmation: "I allow myself to feel without judgment."
        }
    },
    {
        dayNumber: 5,
        title: "The Art of Surrender",
        reassurance: {
            title: "Letting Go",
            content: "Today is about surrendering the need to 'do' and embracing the need to 'be.' You are a human being, not a human doing. Your value in the eyes of Allah is who you are, not just the number of tasks you complete."
        },
        islamicGuidance: {
            title: "Serving Others",
            content: "Did you know that serving your family, being kind to a neighbor, or even smiling with a heavy heart are all heavy on the scales? Small, consistent acts of Khair (good) are beloved to Allah."
        },
        spiritualConnection: {
            title: "Presence of Heart",
            duas: [
                {
                    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
                    translation: "Sufficient for us is Allah, and He is the best Disposer of affairs."
                }
            ],
            dhikr: ["Hasbunallah"],
            suggestions: [
                { text: "Call a loved one just to check in" },
                { text: "Make a small donation (Sadaqah)", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3" }
            ]
        },
        reflection: {
            title: "The Tree in Winter",
            content: "A tree in winter looks dead from the outside, but inside, its roots are growing deeper into the earth. It is preparing for the explosion of life that is spring. Your cycle is your root-growing time. You are building the internal strength you will need for the active weeks ahead.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Mindful Nutrition",
            content: "Eat foods that nourish your blood and energy. Dark leafy greens, lentils, and dark chocolate can provide necessary minerals and a gentle mood boost."
        },
        closing: {
            dua: "Ya Allah, help me to surrender to Your Will with a beautiful patience.",
            affirmation: "I am rooted in faith, even in my quietest moments."
        }
    },
    {
        dayNumber: 6,
        title: "Grateful Healing",
        reassurance: {
            title: "Body Gratitude",
            content: "As you near the end of this phase, take a moment to thank Allah for a body that functions, that heals itself, and that houses your beautiful soul. Every ache you have endured is a purification."
        },
        islamicGuidance: {
            title: "Purification and Reward",
            content: "The Prophet (SAW) said that no fatigue, illness, or even the prick of a thorn befalls a Muslim except that Allah expiates some of their sins for it. Every cramp and headache you've had this week has been a source of cleansing for you."
        },
        spiritualConnection: {
            title: "Praising the Healer",
            duas: [
                {
                    arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
                    translation: "Praise be to Allah in every condition."
                }
            ],
            dhikr: ["Alhamdulillah"],
            suggestions: [
                { text: "Write down 3 things you are grateful for today" },
                { text: "Listen to an uplifting Nasheed", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3" }
            ]
        },
        reflection: {
            title: "The Sustainer's Care",
            content: "Al-Muqit is the One who gives every creation exactly what it needs to survive and thrive. He gave you this cycle because it is necessary for your health and vitality. He provides the hormones that balance you and the rest that restores you. You are perfectly cared for by the King of all kings.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Restorative Sleep",
            content: "Go to bed 30 minutes earlier tonight. Sleep is the ultimate healer provided by Allah."
        },
        closing: {
            dua: "Ya Allah, I thank You for the gift of health and the gift of rest.",
            affirmation: "I am grateful for the wisdom of my body."
        }
    },
    {
        dayNumber: 7,
        title: "Transitioning with Grace",
        reassurance: {
            title: "Gentle Return",
            content: "As you prepare to return to your formal prayers, do so with a heart that is refreshed. You haven't been 'away' from Allah; you've just been with Him in a different room. Step back into your Salat with newfound appreciation."
        },
        islamicGuidance: {
            title: "The Ghusl Renewal",
            content: "The act of Ghusl (ritual bath) is a beautiful renewal. As the water washes over you, imagine it washing away not just physical traces, but any spiritual sluggishness. You are emerging fresh and ready to stand before your Lord again."
        },
        spiritualConnection: {
            title: "Fresh Start",
            duas: [
                {
                    arabic: "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
                    translation: "O Allah, make me of those who repent and make me of those who purify themselves."
                }
            ],
            dhikr: ["Allahu Akbar"],
            suggestions: [
                { text: "Prepare your prayer space" },
                { text: "Choose a beautiful scent for your return to prayer", audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3" }
            ]
        },
        reflection: {
            title: "The Eternal Flow",
            content: "Faith is not a flat line; it is a circle. Like your cycle, it has highs and lows, periods of action and periods of rest. Today marks the end of one phase and the beginning of another. Carry the peace you found in your rest into the movement of your prayers. You are a woman of faith, in every single phase.",
            audioUrl: "https://www.islamic-relief.org.uk/wp-content/uploads/2018/11/Intro-Audio.mp3"
        },
        selfCare: {
            title: "Self-Reflection",
            content: "Take a few minutes to think about what this week taught you. What will you do differently next month to make your period even more restful and connected?"
        },
        closing: {
            dua: "Ya Allah, let my first prayer back be full of Khushoo (devotion) and love.",
            affirmation: "I am renewed and ready to stand before my Lord."
        }
    }
];
