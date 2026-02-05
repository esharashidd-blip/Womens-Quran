import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { Moon, Star, Book, Heart, Compass, Clock, Volume2, VolumeX, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { login, signUp } = useAuth();

  useEffect(() => {
    const audio = new Audio("https://archive.org/download/Muhammad-AlMuqit-nasheed/I%20Am%20Resistant%20-%20Muhammad%20Al%20Muqit.ogg");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsMuted(true);
      } else {
        audioRef.current.play().then(() => {
          setIsMuted(false);
        }).catch(() => {
          console.log("Audio playback failed");
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUp(email, password, { first_name: firstName });
        setSuccessMessage("Check your email to confirm your account!");
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-primary/10 flex flex-col">
        <button
          onClick={toggleAudio}
          className={`fixed top-4 right-4 z-50 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-sm shadow-md ${isPlaying ? 'bg-primary/20' : 'bg-white/80'}`}
          aria-label={isPlaying ? "Pause nasheed" : "Play nasheed"}
        >
          {isPlaying ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/40 flex items-center justify-center shadow-lg">
              <Moon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif text-foreground">Noor</h1>
          </div>

          <Card className="w-full bg-white/90 backdrop-blur-sm border-white/50 p-6 rounded-3xl">
            <div className="flex gap-2 mb-6">
              <Button
                variant={!isSignUp ? "default" : "outline"}
                className="flex-1 rounded-xl"
                onClick={() => { setIsSignUp(false); setError(""); setSuccessMessage(""); }}
              >
                Sign In
              </Button>
              <Button
                variant={isSignUp ? "default" : "outline"}
                className="flex-1 rounded-xl"
                onClick={() => { setIsSignUp(true); setError(""); setSuccessMessage(""); }}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="firstName">Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Your name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sister@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {successMessage && (
                <p className="text-sm text-green-600 text-center">{successMessage}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {isSignUp ? "Create Account" : "Sign In"}
                  </>
                )}
              </Button>
            </form>

            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground"
              onClick={() => setShowAuthForm(false)}
            >
              Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-primary/10 flex flex-col">
      <button
        onClick={toggleAudio}
        className={`fixed top-4 right-4 z-50 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-sm shadow-md hover-elevate ${isPlaying ? 'bg-primary/20' : 'bg-white/80 animate-pulse'}`}
        data-testid="button-toggle-audio"
        aria-label={isPlaying ? "Pause nasheed" : "Play nasheed"}
      >
        {isPlaying ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
        <div className="text-center mb-8 animate-in fade-in duration-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/40 flex items-center justify-center shadow-lg">
            <Moon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-serif text-foreground">Noor</h1>
          <p className="text-muted-foreground text-sm mt-1">Your Islamic Companion</p>
        </div>

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

        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <Button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setShowAuthForm(true);
            }}
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

      <div className="text-center pb-8 px-6">
        <p className="text-xs text-muted-foreground/60">
          Made with love for Muslim sisters everywhere
        </p>
      </div>
    </div>
  );
}
