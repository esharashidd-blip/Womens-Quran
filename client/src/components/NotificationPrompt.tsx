import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

interface NotificationPromptProps {
  onClose: () => void;
}

export function NotificationPrompt({ onClose }: NotificationPromptProps) {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const [isRequesting, setIsRequesting] = useState(false);

  // Check if we're in a WKWebView (iOS app wrapper)
  const isWKWebView = () => {
    const ua = navigator.userAgent;
    return ua.includes('iPhone') && !ua.includes('Safari/');
  };

  // Don't show notification prompt in WKWebView or if not supported
  if (isWKWebView() || !("Notification" in window)) {
    onClose();
    return null;
  }

  const handleEnableNotifications = async () => {
    setIsRequesting(true);

    try {
      if ("Notification" in window && Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          updateSettings.mutate({ prayerNotifications: true });
        } else {
          updateSettings.mutate({ prayerNotifications: false });
        }
      }
    } catch (err) {
      console.error("Notification permission error:", err);
      updateSettings.mutate({ prayerNotifications: false });
    } finally {
      setIsRequesting(false);
      onClose();
    }
  };

  const handleSkip = () => {
    updateSettings.mutate({ prayerNotifications: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-background border-white/50 rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            data-testid="button-close-notification-prompt"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-xl font-serif">Prayer Time Reminders</h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Would you like to receive gentle notifications when it's time to pray?
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="w-full rounded-xl"
            data-testid="button-enable-notifications"
          >
            {isRequesting ? "Requesting..." : "Yes, remind me"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full rounded-xl"
            data-testid="button-skip-notifications"
          >
            Maybe later
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          You can change this anytime in Settings
        </p>
      </Card>
    </div>
  );
}
