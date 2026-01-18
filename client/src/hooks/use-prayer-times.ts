import { useQuery } from "@tanstack/react-query";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      month: { en: string; ar: string; number: number };
      weekday: { en: string };
      year: string;
    };
  };
  meta: {
    timezone: string;
  };
}

export function usePrayerTimes(city: string = "Mecca", country: string = "Saudi Arabia") {
  return useQuery({
    queryKey: ["prayer-times", city, country],
    queryFn: async () => {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`
      );
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const data = await res.json();
      return data.data as PrayerData;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function usePrayerTimesByCoords(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["prayer-times-coords", lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error("No coordinates");
      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`
      );
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const data = await res.json();
      return data.data as PrayerData;
    },
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 30,
  });
}

export function useQiblaDirection(lat: number | null, lng: number | null) {
  return useQuery<{ direction: number }>({
    queryKey: ["qibla", lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error("No coordinates");
      const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
      if (!res.ok) throw new Error("Failed to fetch qibla");
      const data = await res.json();
      return data.data;
    },
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
