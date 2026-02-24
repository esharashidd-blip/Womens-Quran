import { Switch, Route, useLocation } from "wouter";
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
import { Skeleton } from "@/components/ui/skeleton";
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

import MenstrualGuide from "@/pages/MenstrualGuide";
import Duas from "@/pages/Duas";
import LandingPage from "@/pages/LandingPage";
import AuthCallback from "@/pages/AuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";

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

          <Route path="/menstrual-guide" component={MenstrualGuide} />
          <Route path="/duas" component={Duas} />
          <Route path="/auth/callback" component={AuthCallback} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfUse} />
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
  const [location] = useLocation();

  // Public routes accessible without authentication
  if (location === "/privacy") {
    return <PrivacyPolicy />;
  }
  if (location === "/terms") {
    return <TermsOfUse />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 px-4 pt-6 max-w-lg mx-auto space-y-5">
        {/* Header skeleton */}
        <div className="text-center space-y-2 pt-2">
          <Skeleton className="h-8 w-48 mx-auto rounded-full" />
          <Skeleton className="h-4 w-36 mx-auto rounded-full" />
          <Skeleton className="h-3 w-28 mx-auto rounded-full" />
        </div>
        {/* Location button skeleton */}
        <Skeleton className="h-10 w-52 mx-auto rounded-full" />
        {/* Prayer card skeleton */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-accent/10 border border-white/50 p-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-40 mx-auto rounded-full" />
          <div className="grid grid-cols-5 gap-2 pt-5 border-t border-white/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-6 rounded-full" />
                <Skeleton className="h-2 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        {/* Streak card skeleton */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-accent/10 border border-white/50 p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
            </div>
            <Skeleton className="w-14 h-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full mt-3 rounded-full" />
        </div>
        {/* Quote card skeleton */}
        <div className="rounded-2xl bg-white/40 border border-white/50 p-5 space-y-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
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
