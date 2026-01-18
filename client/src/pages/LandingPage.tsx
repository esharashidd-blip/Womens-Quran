import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Moon, Star, Book, Heart, Compass, Clock, Volume2, VolumeX } from "lucide-react";

export default function LandingPage() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create and play Quran audio when the page loads
    // Using Surah Al-Alaq (96:1-5) - corresponds to the hadith about learning
    const audio = new Audio("https://cdn.islamic.network/quran/audio/128/ar.alafasy/5820.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    
    // Attempt to autoplay
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        // Autoplay blocked - user needs to interact first
        console.log("Autoplay blocked, waiting for user interaction");
      }
    };
    
    playAudio();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      
      // Try to play if not already playing
      if (!isMuted && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleLogin = () => {
    // Stop audio before navigating
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-primary/10 flex flex-col">
      {/* Audio control button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover-elevate"
        data-testid="button-toggle-audio"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-primary" />}
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-in fade-in duration-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/40 flex items-center justify-center shadow-lg">
            <Moon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-serif text-foreground">Noor</h1>
          <p className="text-muted-foreground text-sm mt-1">Your Islamic Companion</p>
        </div>

        {/* Features icons row */}
        <div className="flex items-center justify-center gap-6 mb-8 animate-in fade-in duration-1000 delay-200">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">Prayer</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">Quran</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">For You</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">Qibla</span>
          </div>
        </div>

        {/* Quote Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-6 rounded-3xl mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-serif text-lg text-foreground leading-relaxed italic" data-testid="text-quote">
                "The best of you are those who learn the Qur'an and teach it."
              </p>
              <p className="text-sm text-muted-foreground mt-2">— Bukhari 6478</p>
            </div>
          </div>
        </Card>

        {/* Auth buttons */}
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <Button 
            onClick={handleLogin}
            className="w-full h-12 rounded-2xl text-base font-medium shadow-lg shadow-primary/20"
            data-testid="button-login"
          >
            Get Started
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Sign up or log in to continue
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 px-6">
        <p className="text-xs text-muted-foreground/60">
          Made with love for Muslim sisters everywhere
        </p>
      </div>
    </div>
  );
}
