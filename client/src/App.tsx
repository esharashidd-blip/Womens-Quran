import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Quran from "@/pages/Quran";
import SurahView from "@/pages/SurahView";
import Favorites from "@/pages/Favorites";
import Prayer from "@/pages/Prayer";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/quran" component={Quran} />
        <Route path="/surah/:id" component={SurahView} />
        <Route path="/favorites" component={Favorites} />
        <Route component={NotFound} />
        <Route path="/prayer" component={Prayer} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
