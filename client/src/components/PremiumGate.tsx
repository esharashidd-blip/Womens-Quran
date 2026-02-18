import { useSubscription } from "@/hooks/use-subscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, MessageCircle, Sparkles, Heart } from "lucide-react";

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
    <div className="min-h-[50vh] px-4 pt-6 md:px-8 max-w-lg mx-auto flex flex-col items-center justify-center">
      <Card className="p-8 bg-white/80 border-white/50 rounded-3xl text-center space-y-5 w-full">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
          <Crown className="w-8 h-8 text-pink-500" />
        </div>

        <div>
          <h2 className="text-xl font-serif mb-2 text-gray-900">Your Personal Islamic Life Coach</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            A safe, private space to talk through anything on your heart — relationships, anxiety, faith, family — with compassionate guidance rooted in Quran and Sunnah.
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Talk anytime, judgement-free</p>
              <p className="text-xs text-gray-500">Ask anything, day or night</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Personalised advice for sisters</p>
              <p className="text-xs text-gray-500">Guidance tailored to your situation</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Rooted in Quran & Sunnah</p>
              <p className="text-xs text-gray-500">Faith-based wisdom you can trust</p>
            </div>
          </div>
        </div>

        <Button
          onClick={showPaywall}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-semibold shadow-md shadow-pink-200"
        >
          Start Your Journey
        </Button>
      </Card>
    </div>
  );
}
