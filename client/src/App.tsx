import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QuranTimerProvider } from "@/contexts/QuranTimerContext";
import { useSettings } from "@/hooks/use-settings";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PrayerTab from "@/pages/PrayerTab";
import ForYou from "@/pages/ForYou";
import Quran from "@/pages/Quran";
import SurahView from "@/pages/SurahView";
import Favorites from "@/pages/Favorites";
import Qibla from "@/pages/Qibla";
import Kalimas from "@/pages/Kalimas";
import UmrahGuide from "@/pages/UmrahGuide";
import HajjGuide from "@/pages/HajjGuide";
import More from "@/pages/More";
import Coach from "@/pages/Coach";
import MenstrualGuide from "@/pages/MenstrualGuide";
import Duas from "@/pages/Duas";
import LandingPage from "@/pages/LandingPage";
import AuthCallback from "@/pages/AuthCallback";

function AuthenticatedApp() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [hasCheckedNotifications, setHasCheckedNotifications] = useState(false);

  useEffect(() => {
    if (!settingsLoading && settings && !hasCheckedNotifications) {
      const hasSeenPrompt = localStorage.getItem("noor_notification_prompt_seen");
      if (!hasSeenPrompt && settings.prayerNotifications === false) {
        setTimeout(() => setShowNotificationPrompt(true), 1500);
      }
      setHasCheckedNotifications(true);
    }
  }, [settings, settingsLoading, hasCheckedNotifications]);

  const handleCloseNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem("noor_notification_prompt_seen", "true");
  };

  return (
    <QuranTimerProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 text-foreground font-sans">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/prayer" component={PrayerTab} />
          <Route path="/foryou" component={ForYou} />
          <Route path="/quran" component={Quran} />
          <Route path="/surah/:id" component={SurahView} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/qibla" component={Qibla} />
          <Route path="/kalimas" component={Kalimas} />
          <Route path="/umrah" component={UmrahGuide} />
          <Route path="/hajj" component={HajjGuide} />
          <Route path="/more" component={More} />
          <Route path="/coach" component={Coach} />
          <Route path="/menstrual-guide" component={MenstrualGuide} />
          <Route path="/duas" component={Duas} />
          <Route path="/auth/callback" component={AuthCallback} />
          <Route component={NotFound} />
        </Switch>
        <BottomNav />
        {showNotificationPrompt && (
          <NotificationPrompt onClose={handleCloseNotificationPrompt} />
        )}
        <PWAInstallPrompt />
      </div>
    </QuranTimerProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
}

function App() {console.log("App.tsx loaded");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
