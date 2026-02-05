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
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

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

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `noor-verse-${surahName}-${ayahNumber}.png`, { type: 'image/png' });

      // Try to copy to clipboard first (works great for Instagram on iOS)
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast({
            title: "Image copied!",
            description: "Paste it directly into Instagram or any app",
          });
        }
      } catch (clipboardErr) {
        // Clipboard failed, continue to share API
      }

      // Check if file sharing is supported (iOS 15.4+)
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
            console.error("Share failed", err);
            // Fallback to download
            handleDownload();
            toast({
              title: "Image saved",
              description: "Open Instagram and upload from your camera roll",
            });
          }
        }
      } else {
        // No file sharing, save to downloads
        handleDownload();
        toast({
          title: "Image saved",
          description: "Open Instagram and upload from your camera roll",
        });
      }
    }, 'image/png', 1.0); // High quality
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
          <div className="flex gap-3 w-full">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 gap-2 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary h-11"
            >
              <Download className="w-4 h-4" /> Save
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-primary to-rose-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all h-11"
            >
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
