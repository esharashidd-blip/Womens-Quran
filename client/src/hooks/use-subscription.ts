import { useState, useEffect, useCallback } from "react";

// Check if running inside native iOS WKWebView
function isNativeApp(): boolean {
  return !!(window as any).webkit?.messageHandlers?.checkSubscription;
}

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for subscription status events from native
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      setIsSubscribed(event.detail.isSubscribed);
      setIsLoading(false);
    };

    window.addEventListener("nativeSubscriptionStatus", handler as EventListener);

    // Check subscription status on mount
    if (isNativeApp()) {
      (window as any).webkit.messageHandlers.checkSubscription.postMessage({});
    } else {
      // Not in native app (web browser) - treat as subscribed (no paywall on web)
      setIsSubscribed(true);
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener("nativeSubscriptionStatus", handler as EventListener);
    };
  }, []);

  const showPaywall = useCallback(() => {
    if (isNativeApp()) {
      (window as any).webkit.messageHandlers.showPaywall.postMessage({});
    }
  }, []);

  const restorePurchases = useCallback(() => {
    if (isNativeApp()) {
      setIsLoading(true);
      (window as any).webkit.messageHandlers.restorePurchases.postMessage({});
    }
  }, []);

  const checkStatus = useCallback(() => {
    if (isNativeApp()) {
      (window as any).webkit.messageHandlers.checkSubscription.postMessage({});
    }
  }, []);

  return {
    isSubscribed: isSubscribed ?? false,
    isLoading,
    showPaywall,
    restorePurchases,
    checkStatus,
  };
}
