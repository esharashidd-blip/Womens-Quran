import { useSubscription } from "@/hooks/use-subscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Crown } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
  featureName: string;
}

export function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { isSubscribed, isLoading, showPaywall } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-6 md:px-8 max-w-lg mx-auto flex flex-col items-center justify-center">
      <Card className="p-8 bg-white/80 border-white/50 rounded-3xl text-center space-y-5 w-full">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
          <Crown className="w-8 h-8 text-pink-500" />
        </div>

        <div>
          <h2 className="text-xl font-serif mb-2 text-gray-900">Premium Feature</h2>
          <p className="text-sm text-gray-600">
            {featureName} is available with a premium subscription.
            Unlock full access to strengthen your faith journey.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={showPaywall}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-semibold shadow-md shadow-pink-200"
          >
            <Lock className="w-4 h-4 mr-2" />
            Unlock Premium
          </Button>
        </div>
      </Card>
    </div>
  );
}
