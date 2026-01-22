import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { Moon, Star, Book, Heart, Compass, Clock, Volume2, VolumeX, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { signInWithEmail, signUpWithEmail, signInWithApple } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element for Surah Ash-Sharh recitation by Mishary Rashid Alafasy
    const audio = new Audio("https://archive.org/download/mishari_rashid_al_afasy/094.ogg");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    // Start from 36 seconds as requested for the best part of the recitation
    audio.currentTime = 36;

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    // Attempt to autoplay
    const playAudio = async () => {
      try {
        await audio.play();
        setIsMuted(false);
      } catch (error) {
        console.log("Autoplay blocked or failed:", error);
        setIsMuted(true); // Fallback to muted/paused state if blocked
        setIsPlaying(false);
      }
    };

    playAudio();

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link to verify your account.",
        });
      } else {
        await signInWithEmail(email, password);
        // Redirect happens automatically via auth state change
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      await signInWithApple();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Apple sign-in failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-primary/10 flex flex-col">
      {/* Audio control button */}
      <button
        onClick={toggleAudio}
        className={`fixed top-4 right-1 z-50 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-sm shadow-md hover-elevate ${isPlaying ? 'bg-primary/20' : 'bg-white/80 animate-pulse'}`}
        data-testid="button-toggle-audio"
        aria-label={isPlaying ? "Pause nasheed" : "Play nasheed"}
      >
        {isPlaying ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
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

        {!showEmailForm ? (
          <>
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
              {/* Apple Sign In */}
              <Button
                onClick={handleAppleSignIn}
                className="w-full h-12 rounded-2xl text-base font-medium bg-black hover:bg-gray-800 text-white shadow-lg"
                data-testid="button-apple-login"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </Button>

              {/* Email Sign In */}
              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full h-12 rounded-2xl text-base font-medium border-2"
                data-testid="button-email-login"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Email
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Sign up or log in to continue
              </p>
            </div>
          </>
        ) : (
          /* Email Form */
          <Card className="w-full bg-white/90 backdrop-blur-sm border-white/50 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom duration-500">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-serif text-foreground">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isSignUp ? "Sign up with your email" : "Sign in to your account"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
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
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl text-base font-medium shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isSignUp ? "Sign Up" : "Sign In"
                )}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  ← Back to options
                </button>
              </div>
            </form>
          </Card>
        )}
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
