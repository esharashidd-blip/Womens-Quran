import { useEffect, useState } from "react";
import { useQiblaDirection } from "@/hooks/use-prayer-times";
import { Loader2, Compass, Navigation, Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Qibla() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { data: qibla, isLoading } = useQiblaDirection(coords?.lat ?? null, coords?.lng ?? null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setPermissionDenied(false);
        },
        () => setPermissionDenied(true)
      );
    }
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const qiblaAngle = qibla?.direction || 0;
  const rotationAngle = qiblaAngle - heading;

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 md:px-8 max-w-lg mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-serif text-center mb-6">Qibla Direction</h1>

      {permissionDenied ? (
        <Card className="bg-accent/30 border-white/50 p-6 rounded-2xl text-center">
          <Compass className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Location permission is required to show Qibla direction
          </p>
          <Button onClick={requestLocation} data-testid="button-request-location">
            <Navigation className="w-4 h-4 mr-2" /> Enable Location
          </Button>
        </Card>
      ) : !coords || isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
          <p className="text-muted-foreground">Finding your location...</p>
        </div>
      ) : (
        <>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-8 rounded-full w-72 h-72 flex items-center justify-center relative">
            <div
              className="absolute inset-4 rounded-full border-4 border-primary/30 flex items-center justify-center"
              style={{ transform: `rotate(${rotationAngle}deg)`, transition: "transform 0.3s ease-out" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-primary" />
              </div>
              <Landmark className="w-16 h-16 text-primary" />
            </div>
          </Card>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Qibla Direction</p>
            <p className="text-3xl font-serif text-foreground" data-testid="text-qibla-angle">
              {Math.round(qiblaAngle)}°
            </p>
            <p className="text-xs text-muted-foreground">
              Point the arrow towards the Kaaba
            </p>
          </div>

          <Card className="mt-6 bg-white/60 border-white/50 p-4 rounded-xl w-full">
            <p className="text-xs text-muted-foreground text-center">
              For best results, hold your device flat and rotate until the arrow points up
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
