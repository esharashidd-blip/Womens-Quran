import { useQuery } from "@tanstack/react-query";

// Types for Al Quran Cloud API
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
}

export interface SurahDetail {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Array<{
    number: number;
    text: string;
    numberInSurah: number;
    translation?: string; // We'll merge translation here
  }>;
}

const BASE_URL = "https://api.alquran.cloud/v1";

export function useSurahs() {
  return useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/surah`);
      if (!res.ok) throw new Error("Failed to fetch Surahs");
      const data = await res.json();
      return data.data as Surah[];
    },
  });
}

export function useSurahDetail(number: number) {
  return useQuery({
    queryKey: ["surah", number],
    queryFn: async () => {
      // Fetch both Arabic (Quran Uthmani) and English (Asad)
      const res = await fetch(`${BASE_URL}/surah/${number}/editions/quran-uthmani,en.asad`);
      if (!res.ok) throw new Error("Failed to fetch Surah details");
      const data = await res.json();
      
      // Merge the two editions
      const arabic = data.data[0];
      const english = data.data[1];
      
      const merged: SurahDetail = {
        number: arabic.number,
        englishName: arabic.englishName,
        englishNameTranslation: arabic.englishNameTranslation,
        revelationType: arabic.revelationType,
        ayahs: arabic.ayahs.map((ayah: Ayah, index: number) => ({
          ...ayah,
          translation: english.ayahs[index].text
        }))
      };
      
      return merged;
    },
    enabled: !!number,
  });
}

export function useRandomVerse() {
  return useQuery({
    queryKey: ["random-verse"],
    queryFn: async () => {
      // Get a random ayah. Using 'quran-uthmani,en.asad' 
      // Note: The random endpoint usually returns one edition at a time or we might need to chain requests.
      // Simpler approach: Fetch a random ayah ID (1-6236) then fetch specific editions for it.
      
      const randomId = Math.floor(Math.random() * 6236) + 1;
      const res = await fetch(`${BASE_URL}/ayah/${randomId}/editions/quran-uthmani,en.asad`);
      if (!res.ok) throw new Error("Failed to fetch random verse");
      const data = await res.json();
      
      const arabic = data.data[0];
      const english = data.data[1];
      
      return {
        surah: arabic.surah,
        ayahNumber: arabic.numberInSurah,
        arabicText: arabic.text,
        translationText: english.text
      };
    },
    staleTime: 1000 * 60 * 60, // Keep random verse for 1 hour
  });
}
