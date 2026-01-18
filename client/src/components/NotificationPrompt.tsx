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

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          updateSettings.mutate({ prayerNotifications: true });
        }
      }
    } catch (err) {
      console.error("Notification permission error:", err);
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
