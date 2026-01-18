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
      month: { en: string };
      weekday: { en: string };
    };
  };
}

export function usePrayerTimes(city: string = "Mecca", country: string = "Saudi Arabia") {
  return useQuery({
    queryKey: ["prayer-times", city, country],
    queryFn: async () => {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`
      );
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const data = await res.json();
      return data.data as PrayerData;
    },
  });
}
