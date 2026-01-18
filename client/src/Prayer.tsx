import { useEffect, useState } from "react";

export default function Prayer() {
  const [timings, setTimings] = useState<any>(null);

  useEffect(() => {
    fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=London&country=United%20Kingdom&method=2"
    )
      .then(res => res.json())
      .then(data => setTimings(data.data.timings));
  }, []);

  if (!timings) return <p>Loading prayer times...</p>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Prayer Times</h1>
      <p>Fajr: {timings.Fajr}</p>
      <p>Dhuhr: {timings.Dhuhr}</p>
      <p>Asr: {timings.Asr}</p>
      <p>Maghrib: {timings.Maghrib}</p>
      <p>Isha: {timings.Isha}</p>
    </div>
  );
}