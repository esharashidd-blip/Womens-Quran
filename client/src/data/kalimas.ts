export interface Kalima {
    id: number;
    name: string;
    arabic: string;
    transliteration: string;
    meaning: string;
    audioUrl?: string; // Optional as per requirement
}

export const KALIMAS: Kalima[] = [
    {
        id: 1,
        name: "First Kalma: Tayyibah",
        arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُولُ اللّٰهِ",
        transliteration: "La ilaha illallahu Muhammadu Rasoolullah",
        meaning: "There is no God but Allah, [and] Muhammad is the messenger of Allah.",
    },
    {
        id: 2,
        name: "Second Kalma: Shahadah",
        arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lahu wa ash-hadu anna Muhammadan 'abduhu wa Rasuluhu",
        meaning: "I bear witness that there is no God but Allah, He is alone, He has no partner, and I bear witness that Muhammad is His servant and His messenger.",
    },
    {
        id: 3,
        name: "Third Kalma: Tamjeed",
        arabic: "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ",
        transliteration: "Subhanallahi wal hamdu lillahi wa la ilaha illallahu wallahu Akbar, wa la hawla wa la quwwata illa billahil 'Aliyyil 'Azim",
        meaning: "Glory be to Allah, and all praise be to Allah, and there is no God but Allah, and Allah is the Greatest. And there is no might nor power except with Allah, the Most High, the Most Great.",
    },
    {
        id: 4,
        name: "Fourth Kalma: Tawheed",
        arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا، ذُو الْجَلَالِ وَالْإِكْرَامِ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu yuhyi wa yumitu wa huwa hayyun la yamutu abadan abada, Dhul-Jalali wal-Ikram, biyadihil khayru wa huwa 'ala kulli shay'in qadir",
        meaning: "There is no God but Allah, He is alone, He has no partner. For Him is the kingdom and for Him is the praise. He gives life and causes death, and He is ever-living, He never dies. Possessor of Majesty and Honor. In His hand is all good, and He has power over all things.",
    },
    {
        id: 5,
        name: "Fifth Kalma: Astaghfar",
        arabic: "أَسْتَغْفِرُ اللّٰهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ، إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ",
        transliteration: "Astaghfirullah Rabbi min kulli dhanbin adhnabtuhu 'amdan aw khata'an sirran aw 'alaniyatan wa atubu ilayhi minadh-dhanbilladhi a'lamu wa minadh-dhanbilladhi la a'lamu, innaka anta 'allamul ghuyubi wa sattarul 'uyubi wa ghaffarudh-dhunubi wa la hawla wa la quwwata illa billahil 'Aliyyil 'Azim",
        meaning: "I seek forgiveness from Allah, my Lord, from every sin I committed knowingly or unknowingly, secretly or openly, and I turn to Him from the sin that I know and from the sin that I do not know. Indeed You, You are the Knower of the unseen, and the Concealer of flaws, and the Forgiver of sins. And there is no might nor power except with Allah, the Most High, the Most Great.",
    },
    {
        id: 6,
        name: "Sixth Kalma: Radde Kufr",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ، تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْكِذْبِ وَالْغِيبَةِ وَالْبِدْعَةِ وَالنَّمِيمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِي كُلِّهَا، وَأَسْلَمْتُ وَأَقُولُ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُولُ اللّٰهِ",
        transliteration: "Allahumma inni a'udhu bika min an ushrika bika shay'an wa ana a'lamu bihi, wa astaghfiruka lima la a'lamu bihi, tubtu 'anhu wa tabarra'tu minal kufri wash-shirki wal kidhbi wal ghibati wal bid'ati wan namimati wal fawahishi wal buhtani wal ma'asi kulliha, wa aslamtu wa aqulu la ilaha illallahu Muhammadu Rasoolullah",
        meaning: "O Allah, I seek refuge in You from associating anything with You while I know it, and I seek Your forgiveness for what I do not know. I have repented from it and I have disassociated myself from disbelief, and polytheism, and lying, and backbiting, and innovation, and slander, and lewdness, and calumny, and all sins. And I have submitted, and I say: There is no God but Allah, Muhammad is the messenger of Allah.",
    }
];
