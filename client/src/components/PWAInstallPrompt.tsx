import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem("noor-pwa-prompt-seen");
    if (hasSeenPrompt) return;

    // Check if we're in a WKWebView (iOS app wrapper)
    const ua = navigator.userAgent;
    const isWKWebView = ua.includes('iPhone') && !ua.includes('Safari/');

    // Don't show prompt if already in WKWebView app
    if (isWKWebView) return;

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return;

    if (isIOSDevice) {
      setIsIOS(true);
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem("noor-pwa-prompt-seen", "true");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("noor-pwa-prompt-seen", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center animate-in fade-in duration-300" onClick={handleDismiss}>
      <Card 
        className="w-full max-w-lg bg-background border-t border-white/50 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg">Add Noor to Home Screen</h3>
              <p className="text-sm text-muted-foreground">Quick access to your prayers</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isIOS ? (
          <div className="bg-accent/30 rounded-2xl p-4 space-y-3">
            <p className="text-sm text-foreground">To install Noor on your iPhone:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Install Noor on your device for the best experience. Get quick access to prayer times, Quran, and more - even offline.
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDismiss} className="flex-1 rounded-xl">
            Maybe Later
          </Button>
          {!isIOS && deferredPrompt && (
            <Button onClick={handleInstall} className="flex-1 rounded-xl gap-2" data-testid="button-install-pwa">
              <Download className="w-4 h-4" />
              Install App
            </Button>
          )}
          {isIOS && (
            <Button onClick={handleDismiss} className="flex-1 rounded-xl">
              Got It
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
