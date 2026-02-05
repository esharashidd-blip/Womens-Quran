import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

interface QuoteGeneratorProps {
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
}

export function QuoteGenerator({ surahName, ayahNumber, arabicText, translationText }: QuoteGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgStyle, setBgStyle] = useState(0);
  const { toast } = useToast();

  const themes = [
    {
      name: "Rose",
      gradient: { start: "#FCE4EC", end: "#F8BBD0" },
      textColor: "#4A4A4A",
      accentColor: "#B5838D"
    },
    {
      name: "Sunset",
      gradient: { start: "#FFF1EB", end: "#FFE5E5" },
      textColor: "#4A4A4A",
      accentColor: "#E8A598"
    },
    {
      name: "Lavender",
      gradient: { start: "#E8E4F3", end: "#D4C5F9" },
      textColor: "#4A4A4A",
      accentColor: "#9B7EDE"
    },
    {
      name: "Mint",
      gradient: { start: "#E8F5E9", end: "#C8E6C9" },
      textColor: "#2E5339",
      accentColor: "#66BB6A"
    },
    {
      name: "Night",
      gradient: { start: "#1A1A2E", end: "#16213E" },
      textColor: "#FFFFFF",
      accentColor: "#D4AF37"
    }
  ];

  const generateImageInternal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution for Retina displays
    const dpr = window.devicePixelRatio || 2;
    const width = 1080;
    const height = 1920; // Instagram Story size

    // Scale canvas for high-DPI displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Don't set inline styles - let CSS handle display size
    // The canvas will render at high res but display at container size

    // Scale context to match DPR
    ctx.scale(dpr, dpr);

    // Get current theme
    const theme = themes[bgStyle];

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.gradient.start);
    gradient.addColorStop(1, theme.gradient.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Styling
    const padding = 120;

    // Header with decorative elements
    ctx.fillStyle = theme.accentColor;
    ctx.font = "bold 36px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "3px";
    ctx.fillText("NOOR", width / 2, 140);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, 170);
    ctx.lineTo(width / 2 + 80, 170);
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arabic Text - larger and more prominent
    ctx.fillStyle = theme.textColor;
    ctx.font = "bold 90px 'Amiri', serif";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    wrapText(ctx, arabicText, width / 2, height / 2 - 250, width - (padding * 2), 150);

    // English Translation
    ctx.direction = "ltr";
    ctx.font = "italic 38px 'Playfair Display', serif";
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.9;
    wrapText(ctx, `"${translationText}"`, width / 2, height / 2 + 150, width - (padding * 2), 68);
    ctx.globalAlpha = 1;

    // Footer reference
    ctx.font = "28px 'Inter', sans-serif";
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(`${surahName} • Ayah ${ayahNumber}`, width / 2, height - 140);

    // Subtle watermark
    ctx.font = "20px 'Inter', sans-serif";
    ctx.globalAlpha = 0.4;
    ctx.fillText("Women's Quran App", width / 2, height - 80);
    ctx.globalAlpha = 1;
  };

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Debounced version of generateImage to prevent UI blocking
  const generateImage = useCallback(
    debounce(generateImageInternal, 150),
    [bgStyle, arabicText, translationText, surahName, ayahNumber]
  );

  // Trigger generation when modal opens
  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTimeout(generateImageInternal, 100);
    }
  };

  // Regenerate when background style changes
  useEffect(() => {
    if (isOpen) {
      generateImageInternal();
    }
  }, [bgStyle, isOpen]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `quran-verse-${surahName}-${ayahNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "Downloaded", description: "Image saved to your device." });
  };

  const handleInstagramShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Convert to base64 for native bridge
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Try to use native bridge if available (iOS app)
        if ((window as any).webkit?.messageHandlers?.shareToInstagramStories) {
          try {
            (window as any).webkit.messageHandlers.shareToInstagramStories.postMessage({
              image: base64data,
              backgroundTopColor: themes[bgStyle].gradient.start,
              backgroundBottomColor: themes[bgStyle].gradient.end
            });
            toast({ title: "Opening Instagram Stories..." });
            return;
          } catch (err) {
            console.error("Native bridge failed:", err);
          }
        }

        // Fallback: Copy to clipboard + download
        try {
          if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
          }
        } catch (clipboardErr) {
          console.error("Clipboard failed:", clipboardErr);
        }

        // Always download as backup
        handleDownload();

        toast({
          title: "Ready for Instagram!",
          description: "Image saved. Open Instagram Stories and paste or upload from camera roll.",
          duration: 5000,
        });
      };
      reader.readAsDataURL(blob);
    }, 'image/png', 1.0);
  };

  const handleSocialShare = async (platform: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Try to use native bridge if available (iOS app)
        if ((window as any).webkit?.messageHandlers?.shareToSocial) {
          try {
            (window as any).webkit.messageHandlers.shareToSocial.postMessage({
              platform: platform,
              image: base64data,
              text: `${surahName} • Ayah ${ayahNumber} - From Noor App`
            });
            toast({ title: `Opening ${platform}...` });
            return;
          } catch (err) {
            console.error("Native bridge failed:", err);
          }
        }

        // Fallback to download
        handleDownload();
        toast({
          title: "Image saved",
          description: `Open ${platform} and share from your camera roll`,
        });
      };
      reader.readAsDataURL(blob);
    }, 'image/png', 1.0);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `noor-verse-${surahName}-${ayahNumber}.png`, { type: 'image/png' });

      // Check if file sharing is supported
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title: 'Quran Verse',
            text: `${surahName} • Ayah ${ayahNumber}`,
          });
          toast({ title: "Shared successfully" });
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            handleDownload();
          }
        }
      } else {
        handleDownload();
        toast({
          title: "Image saved",
          description: "Upload from your camera roll to share",
        });
      }
    }, 'image/png', 1.0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 transition-colors">
          <Share2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl text-primary-dark">Share Verse</DialogTitle>
          <DialogDescription className="text-center">Customize your card before sharing</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 items-center my-4">
          {/* Preview */}
          <div className="relative shadow-2xl rounded-3xl overflow-hidden w-full bg-gradient-to-br from-gray-50 to-gray-100 p-2">
            <div className="relative w-full aspect-[9/16] overflow-hidden rounded-2xl bg-white">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Theme Picker */}
          <div className="w-full">
            <p className="text-xs font-medium text-muted-foreground text-center mb-3 uppercase tracking-wide">Choose Theme</p>
            <div className="grid grid-cols-5 gap-3">
              {themes.map((theme, i) => (
                <button
                  key={i}
                  onClick={() => setBgStyle(i)}
                  className={`relative group flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                    bgStyle === i
                      ? 'bg-primary/10 scale-105'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full shadow-md transition-all ${
                      bgStyle === i ? 'ring-2 ring-primary ring-offset-2' : 'group-hover:scale-110'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradient.start} 0%, ${theme.gradient.end} 100%)`
                    }}
                  >
                    {bgStyle === i && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${
                    bgStyle === i ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            {/* Instagram Stories - Primary CTA */}
            <Button
              onClick={handleInstagramShare}
              className="w-full gap-2 rounded-xl h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z"/>
              </svg>
              Share to Instagram Stories
            </Button>

            {/* Other Social Platforms */}
            <div className="grid grid-cols-3 gap-2">
              {/* WhatsApp */}
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                className="flex-col h-20 rounded-xl border-green-200 hover:bg-green-50 hover:text-green-600 gap-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-[10px] font-medium">WhatsApp</span>
              </Button>

              {/* iMessage */}
              <Button
                onClick={() => handleSocialShare('imessage')}
                variant="outline"
                className="flex-col h-20 rounded-xl border-blue-200 hover:bg-blue-50 hover:text-blue-600 gap-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.67-.33-3.82-.91l-.27-.15-2.8.6.6-2.8-.15-.27A7.938 7.938 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                <span className="text-[10px] font-medium">iMessage</span>
              </Button>

              {/* Snapchat */}
              <Button
                onClick={() => handleSocialShare('snapchat')}
                variant="outline"
                className="flex-col h-20 rounded-xl border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600 gap-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.12-.063-.176-.01-.224.165-.435.42-.479 3.266-.54 4.73-3.863 4.79-4.014.016-.015.031-.029.046-.029.179-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105-.046-.286-.105-.704-.165-1.212l-.015-.135c-.105-1.679-.24-3.76.359-5.073 1.663-3.65 4.958-3.91 5.948-3.821z"/>
                </svg>
                <span className="text-[10px] font-medium">Snapchat</span>
              </Button>
            </div>

            {/* Download and More */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary h-11"
              >
                <Download className="w-4 h-4" /> Save
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary h-11"
              >
                <Share2 className="w-4 h-4" /> More
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
