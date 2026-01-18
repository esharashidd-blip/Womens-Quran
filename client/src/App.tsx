import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PrayerTab from "@/pages/PrayerTab";
import ForYou from "@/pages/ForYou";
import Quran from "@/pages/Quran";
import SurahView from "@/pages/SurahView";
import Favorites from "@/pages/Favorites";
import Qibla from "@/pages/Qibla";
import Duas from "@/pages/Duas";
import UmrahGuide from "@/pages/UmrahGuide";
import HajjGuide from "@/pages/HajjGuide";
import More from "@/pages/More";
import LandingPage from "@/pages/LandingPage";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 text-foreground font-sans">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/prayer" component={PrayerTab} />
        <Route path="/foryou" component={ForYou} />
        <Route path="/quran" component={Quran} />
        <Route path="/surah/:id" component={SurahView} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/qibla" component={Qibla} />
        <Route path="/duas" component={Duas} />
        <Route path="/umrah" component={UmrahGuide} />
        <Route path="/hajj" component={HajjGuide} />
        <Route path="/more" component={More} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
