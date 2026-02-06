import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { waitForFonts, downloadCanvasImage, shareCanvasImage } from "@/utils/canvas-utils";

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

    // Use HALF resolution for preview - 4x faster!
    const dpr = Math.min(window.devicePixelRatio || 2, 2);
    const width = 540;  // Half of Instagram Story width
    const height = 960; // Half of Instagram Story height

    // Scale canvas for preview
    canvas.width = width * dpr;
    canvas.height = height * dpr;

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

    // Styling - scaled for half resolution
    const padding = 60;

    // Header with decorative elements
    ctx.fillStyle = theme.accentColor;
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "1px";
    ctx.fillText("WOMEN'S QURAN", width / 2, 70);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 40, 85);
    ctx.lineTo(width / 2 + 40, 85);
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arabic Text - larger and more prominent
    ctx.fillStyle = theme.textColor;
    ctx.font = "bold 45px 'Amiri', serif";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    wrapText(ctx, arabicText, width / 2, height / 2 - 125, width - (padding * 2), 75);

    // English Translation
    ctx.direction = "ltr";
    ctx.font = "italic 19px 'Playfair Display', serif";
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.9;
    wrapText(ctx, `"${translationText}"`, width / 2, height / 2 + 75, width - (padding * 2), 34);
    ctx.globalAlpha = 1;

    // Footer reference
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(`${surahName} • Ayah ${ayahNumber}`, width / 2, height - 70);

    // Subtle watermark
    ctx.font = "10px 'Inter', sans-serif";
    ctx.globalAlpha = 0.4;
    ctx.fillText("Women's Quran App", width / 2, height - 40);
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

  // Trigger generation when modal opens - wait for fonts first
  const handleOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      await waitForFonts();
      generateImageInternal();
    }
  };

  // Regenerate when background style changes
  useEffect(() => {
    if (isOpen) {
      generateImageInternal();
    }
  }, [bgStyle, isOpen]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const success = await downloadCanvasImage(canvas, `womens-quran-${surahName}-${ayahNumber}.png`);
    if (success) {
      toast({ title: "Saved!", description: "Image saved successfully" });
    } else {
      toast({ title: "Error", description: "Failed to save image", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const success = await shareCanvasImage(canvas);
    if (!success) {
      toast({ title: "Share cancelled", description: "You can try saving instead" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10 transition-colors">
          <Share2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md max-h-[95vh] overflow-y-auto bg-white/98 backdrop-blur-xl border-white/20 p-3 sm:p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center font-serif text-lg sm:text-xl text-primary-dark">Share Verse</DialogTitle>
          <DialogDescription className="text-center text-xs">Customize before sharing</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 items-center pb-2">
          {/* Preview */}
          <div className="relative shadow-lg rounded-2xl overflow-hidden w-full bg-gradient-to-br from-gray-50 to-gray-100 p-1.5">
            <div className="relative w-full aspect-[9/16] overflow-hidden rounded-xl bg-white">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Theme Picker */}
          <div className="w-full">
            <p className="text-[10px] font-medium text-muted-foreground text-center mb-2 uppercase tracking-wide">Theme</p>
            <div className="grid grid-cols-5 gap-2">
              {themes.map((theme, i) => (
                <button
                  key={i}
                  onClick={() => setBgStyle(i)}
                  className={`relative group flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${
                    bgStyle === i
                      ? 'bg-primary/10'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md transition-all ${
                      bgStyle === i ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradient.start} 0%, ${theme.gradient.end} 100%)`
                    }}
                  >
                    {bgStyle === i && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] font-medium transition-colors ${
                    bgStyle === i ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            {/* Native Share - Opens iOS share sheet */}
            <Button
              onClick={handleNativeShare}
              className="w-full gap-2 rounded-xl h-11 sm:h-12 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-xl active:scale-[0.98] transition-all font-semibold text-sm"
            >
              <Share2 className="w-4 h-4" /> Share
            </Button>

            {/* Download */}
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full gap-2 rounded-xl h-10 sm:h-11 border-primary/20 hover:bg-primary/5 hover:text-primary active:scale-[0.98] transition-all text-sm"
            >
              <Download className="w-4 h-4" /> Save to Photos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
