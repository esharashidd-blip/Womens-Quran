import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sun, Moon, Bed, Car, Shield, Heart, HandHeart, Sparkles, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";

interface Dua {
  title: string;
  arabic: string;
  translation: string;
  category: string;
}

const DUAS_DATA: Dua[] = [
  // Morning Adhkar
  { category: "morning", title: "Upon Waking - Praising Allah", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", translation: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection." },
  { category: "morning", title: "Morning Remembrance", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـٰهَ إِلَّا اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", translation: "We have entered the morning and the whole kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, having no partner." },
  { category: "morning", title: "Seeking Allah's Refuge - Morning", arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", translation: "O Allah, by Your grace we have reached the morning, by Your grace we reach the evening, by Your grace we live and die, and unto You is the resurrection." },
  { category: "morning", title: "Master of Seeking Forgiveness", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", translation: "O Allah, You are my Lord. There is no god but You. You created me and I am Your servant. I uphold Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your blessings upon me, and I confess my sins. Forgive me, for none forgives sins but You." },
  { category: "morning", title: "Glorifying Allah - 100 Times", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", translation: "Glory be to Allah and praise Him. (Say 100 times - sins forgiven even if like sea foam)" },
  { category: "morning", title: "Protection from All Harm", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", translation: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm. He is the All-Hearing, All-Knowing. (Say 3 times)" },
  { category: "morning", title: "Contentment with Allah", arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet. (Say 3 times)" },
  { category: "morning", title: "Seeking Guidance and Wellbeing", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", translation: "O Allah, I ask You for pardon and well-being in this life and the next." },
  { category: "morning", title: "Entering the Day Under Protection", arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ", translation: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no god but You. (Say 3 times)" },

  // Evening Adhkar
  { category: "evening", title: "Evening Remembrance", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـٰهَ إِلَّا اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", translation: "We have entered the evening and the whole kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, having no partner." },
  { category: "evening", title: "Seeking Refuge - Evening", arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", translation: "O Allah, by Your grace we have reached the evening, by Your grace we reach the morning, by Your grace we live and die, and unto You is our final destination." },
  { category: "evening", title: "Evening Protection", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "I seek refuge in the perfect words of Allah from the evil of what He has created. (Say 3 times)" },
  { category: "evening", title: "Night-time Safety", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا", translation: "O Allah, I ask You for the good of this night and the good that is in it, and I seek refuge in You from its evil and the evil in it." },
  { category: "evening", title: "Evening Glorification", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", translation: "Glory be to Allah and praise Him, as many as His creation, as pleasing to Himself, as the weight of His Throne, and as much as the ink of His words." },
  { category: "evening", title: "Seeking Refuge from Evil", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ", translation: "O Allah, I seek refuge in You from anxiety and sorrow, and I seek refuge in You from weakness and laziness." },

  // Sleep & Waking
  { category: "sleep", title: "Before Sleeping", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", translation: "In Your name, O Allah, I die and I live." },
  { category: "sleep", title: "Entrusting Yourself to Allah", arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ", translation: "O Allah, I submit my soul to You, I entrust my affairs to You, I turn my back to You, out of hope and fear of You." },
  { category: "sleep", title: "Seeking Protection While Sleeping", arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants. (Say 3 times)" },
  { category: "sleep", title: "Ayat Al-Kursi Before Sleep", arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", translation: "Allah - there is no god except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. (Recite full Ayat Al-Kursi)" },
  { category: "sleep", title: "Three Quls Before Sleep", arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas, then blow into your palms and wipe over your body. (Repeat 3 times)" },
  { category: "sleep", title: "Upon Waking from Sleep", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", translation: "All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection." },
  { category: "sleep", title: "Waking from Bad Dream", arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", translation: "I seek refuge in Allah from the accursed Satan. (Spit lightly to your left 3 times and change your sleeping position)" },
  { category: "sleep", title: "Unable to Sleep", arabic: "اللَّهُمَّ غَارَتِ النُّجُومُ، وَهَدَأَتِ الْعُيُونُ، وَأَنْتَ حَيٌّ قَيُّومٌ، لَا تَأْخُذُكَ سِنَةٌ وَلَا نَوْمٌ", translation: "O Allah, the stars have set and eyes have rested. You are the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes You." },

  // Anxiety, Sadness & Stress
  { category: "anxiety", title: "For Anxiety and Sorrow", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debt and being overpowered by others." },
  { category: "anxiety", title: "When Distressed", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ", translation: "There is no god but Allah, the Great, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens and earth, Lord of the Noble Throne." },
  { category: "anxiety", title: "Dua of Yunus (AS)", arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", translation: "There is no god but You, glory be to You. Indeed, I have been among the wrongdoers." },
  { category: "anxiety", title: "Entrusting Affairs to Allah", arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَٰهَ إِلَّا أَنْتَ", translation: "O Allah, it is Your mercy that I hope for. Do not leave me to myself even for the blink of an eye. Rectify all my affairs. There is no god but You." },
  { category: "anxiety", title: "Relief from Hardship", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", translation: "Allah is sufficient for us, and He is the best disposer of affairs." },
  { category: "anxiety", title: "Seeking Patience", arabic: "اللَّهُمَّ اجْعَلْ لِي مِنْ أَمْرِي فَرَجًا وَمَخْرَجًا", translation: "O Allah, grant me relief and a way out from my difficulty." },
  { category: "anxiety", title: "When Overwhelmed", arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", translation: "O Ever-Living, O Self-Sustaining, by Your mercy I seek help." },
  { category: "anxiety", title: "Trusting Allah's Plan", arabic: "قَدَّرَ اللَّهُ وَمَا شَاءَ فَعَلَ", translation: "Allah has decreed and what He wills, He does." },
  { category: "anxiety", title: "When Feeling Depressed", arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ", translation: "O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand. Your command over me is ever executed, and Your decree over me is just." },

  // Forgiveness & Repentance
  { category: "forgiveness", title: "Seeking Forgiveness", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", translation: "I seek forgiveness from Allah, the Magnificent, there is no god but He, the Ever-Living, the Self-Sustaining, and I repent to Him." },
  { category: "forgiveness", title: "Complete Repentance", arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ", translation: "My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful." },
  { category: "forgiveness", title: "Asking for Pardon", arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", translation: "O Allah, You are Forgiving and love forgiveness, so forgive me." },
  { category: "forgiveness", title: "Forgiveness for All Sins", arabic: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ", translation: "O Allah, forgive me all my sins, the small and great, the first and last, the open and secret." },
  { category: "forgiveness", title: "Dua of Adam (AS)", arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", translation: "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy upon us, we will surely be among the losers." },
  { category: "forgiveness", title: "Constant Istighfar", arabic: "أَسْتَغْفِرُ اللَّهَ", translation: "I seek forgiveness from Allah. (Say frequently throughout the day)" },
  { category: "forgiveness", title: "Repentance with Hope", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْكَرِيمِ", translation: "O Allah, You are my Lord. There is no god but You. Upon You I rely, and You are the Lord of the Noble Throne." },

  // Gratitude
  { category: "gratitude", title: "Thanking Allah", arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "All praise is due to Allah, Lord of all the worlds." },
  { category: "gratitude", title: "Gratitude for Blessings", arabic: "الْحَمْدُ لِلَّهِ عَلَىٰ كُلِّ حَالٍ", translation: "Praise be to Allah in every circumstance." },
  { category: "gratitude", title: "Acknowledging Favors", arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ", translation: "O Allah, whatever blessing I or any of Your creation have risen upon, it is from You alone, without partner. So for You is all praise and to You all thanks." },
  { category: "gratitude", title: "Gratitude for Good News", arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ", translation: "Praise be to Allah, by whose grace all good things are completed." },
  { category: "gratitude", title: "Gratitude After Eating", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", translation: "Praise be to Allah who fed me this and provided it for me without any power or might from me." },
  { category: "gratitude", title: "Thanking for Health", arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَىٰ كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا", translation: "Praise be to Allah who has spared me from what He has afflicted you with and preferred me greatly over much of His creation." },

  // Protection
  { category: "protection", title: "Seeking Refuge in Allah's Words", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "I seek refuge in the perfect words of Allah from the evil of what He created." },
  { category: "protection", title: "Protection from Evil Eye", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", translation: "I seek refuge in the perfect words of Allah from every devil and poisonous creature, and from every evil eye." },
  { category: "protection", title: "Morning/Evening Protection", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", translation: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm. He is the All-Hearing, All-Knowing." },
  { category: "protection", title: "Protection from Harm", arabic: "اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي", translation: "O Allah, protect me from in front of me, from behind me, from my right, from my left, and from above me." },
  { category: "protection", title: "Seeking Allah's Protection", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَعَذَابِ الْقَبْرِ", translation: "O Allah, I seek refuge in You from disbelief, poverty, and the punishment of the grave." },
  { category: "protection", title: "Protection for Family", arabic: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", translation: "I seek protection for you in the perfect words of Allah from every devil, poisonous creature, and every evil eye." },
  { category: "protection", title: "Against Enemies", arabic: "اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ", translation: "O Allah, we place You before them and seek refuge in You from their evil." },

  // Travel
  { category: "travel", title: "Starting a Journey", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ", translation: "Glory to Him who has subjected this to us, and we could not have done it ourselves. And indeed, to our Lord we will return." },
  { category: "travel", title: "Travel Protection", arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ", translation: "O Allah, we ask You for righteousness and piety in this journey, and deeds that please You." },
  { category: "travel", title: "Seeking Easy Journey", arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ", translation: "O Allah, make this journey easy for us and shorten its distance for us." },
  { category: "travel", title: "Entering a Town", arabic: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الْأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا", translation: "O Allah, Lord of the seven heavens and all they shade, Lord of the seven earths and all they carry, I ask You for the good of this town and the good of its people." },
  { category: "travel", title: "Returning from Travel", arabic: "آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ", translation: "We are returning, repenting, worshipping, and praising our Lord." },
  { category: "travel", title: "Leaving Home", arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", translation: "In the name of Allah, I put my trust in Allah. There is no power or might except with Allah." },

  // After Prayer
  { category: "afterprayer", title: "After Salam - Istighfar", arabic: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ", translation: "I seek forgiveness from Allah. (Say 3 times)" },
  { category: "afterprayer", title: "After Prayer - Peace", arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", translation: "O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honor." },
  { category: "afterprayer", title: "Tahlil After Prayer", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He is over all things competent." },
  { category: "afterprayer", title: "SubhanAllah 33 times", arabic: "سُبْحَانَ اللَّهِ", translation: "Glory be to Allah. (Say 33 times after each prayer)" },
  { category: "afterprayer", title: "Alhamdulillah 33 times", arabic: "الْحَمْدُ لِلَّهِ", translation: "Praise be to Allah. (Say 33 times after each prayer)" },
  { category: "afterprayer", title: "Allahu Akbar 33 times", arabic: "اللَّهُ أَكْبَرُ", translation: "Allah is the Greatest. (Say 33 times after each prayer)" },
  { category: "afterprayer", title: "Completing 100", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "There is no god but Allah alone, without partner. To Him belongs dominion and praise, and He is over all things competent. (Say once to complete 100)" },
  { category: "afterprayer", title: "Ayat Al-Kursi After Prayer", arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", translation: "Allah - there is no god except Him, the Ever-Living, the Sustainer. (Recite full Ayat Al-Kursi after every obligatory prayer)" },
  { category: "afterprayer", title: "Protection After Fajr/Maghrib", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "There is no god but Allah alone, without partner. To Him belongs dominion and praise. He gives life and causes death, and He is over all things competent. (Say 10 times after Fajr and Maghrib)" },
  { category: "afterprayer", title: "Seeking Guidance After Prayer", arabic: "اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me to remember You, thank You, and worship You in the best manner." },
];

const DUAS_CATEGORIES = [
  { id: "morning", title: "Morning Adhkar", icon: Sun, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "evening", title: "Evening Adhkar", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "sleep", title: "Sleep & Waking", icon: Bed, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "anxiety", title: "Anxiety & Stress", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  { id: "forgiveness", title: "Forgiveness", icon: HandHeart, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "gratitude", title: "Gratitude", icon: Sparkles, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: "protection", title: "Protection", icon: Shield, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "travel", title: "Travel", icon: Car, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: "afterprayer", title: "After Prayer", icon: Moon, color: "text-pink-500", bg: "bg-pink-50" },
];

export default function Duas() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    if (categoryParam && DUAS_CATEGORIES.some(c => c.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const category = DUAS_CATEGORIES.find(c => c.id === selectedCategory);

  const filteredDuas = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return DUAS_DATA.filter(dua =>
      dua.title.toLowerCase().includes(query) ||
      dua.translation.toLowerCase().includes(query) ||
      dua.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const categoryDuas = useMemo(() => {
    if (!selectedCategory) return [];
    return DUAS_DATA.filter(dua => dua.category === selectedCategory);
  }, [selectedCategory]);

  const isSearching = searchQuery.trim().length > 0;

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-6 md:px-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
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
            {category ? `${categoryDuas.length} duas` : `${DUAS_DATA.length} supplications`}
          </p>
        </div>
      </div>

      {!selectedCategory && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search duas (e.g. anxiety, forgiveness, sleep...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12 rounded-2xl bg-white/80 border-pink-100 focus:border-primary focus:ring-primary/20"
            data-testid="input-search-duas"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
              onClick={clearSearch}
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {isSearching ? (
        <div className="space-y-4">
          {filteredDuas.length === 0 ? (
            <Card className="bg-white/60 border-white/50 p-6 rounded-2xl text-center">
              <p className="text-muted-foreground">No duas found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try different keywords</p>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{filteredDuas.length} result{filteredDuas.length !== 1 ? 's' : ''} found</p>
              {filteredDuas.map((dua, index) => {
                const cat = DUAS_CATEGORIES.find(c => c.id === dua.category);
                return (
                  <Card key={index} className="bg-white/80 border-white/50 p-5 rounded-2xl" data-testid={`card-search-result-${index}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cat?.bg} ${cat?.color}`}>
                        {cat?.title}
                      </span>
                      <span className="text-sm font-medium text-foreground">{dua.title}</span>
                    </div>
                    <p className="text-xl font-arabic text-right mb-3 leading-loose" dir="rtl">
                      {dua.arabic}
                    </p>
                    <p className="text-sm text-muted-foreground italic">{dua.translation}</p>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      ) : !selectedCategory ? (
        <div className="grid grid-cols-2 gap-3">
          {DUAS_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = DUAS_DATA.filter(d => d.category === cat.id).length;
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
                <p className="text-xs text-muted-foreground">{count} duas</p>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {categoryDuas.map((dua, index) => (
            <Card key={index} className="bg-white/80 border-white/50 p-5 rounded-2xl" data-testid={`card-dua-${index}`}>
              <p className="text-sm font-medium text-primary mb-3">{dua.title}</p>
              <p className="text-xl font-arabic text-right mb-4 leading-loose" dir="rtl">
                {dua.arabic}
              </p>
              <p className="text-sm text-muted-foreground italic">{dua.translation}</p>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && !selectedCategory && (
        <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Use the search bar to find duas by keyword, or browse by category above.
          </p>
        </Card>
      )}
    </div>
  );
}
