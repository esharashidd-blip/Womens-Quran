import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, RefreshCw } from "lucide-react";
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

  const backgrounds = [
    "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)", // Pink gradient
    "linear-gradient(135deg, #FFF1EB 0%, #ACE0F9 100%)", // Pastel Sunset
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", // Lavender
    "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", // Cloudy White
    "#2A2A2A", // Dark
  ];

  const textColors = [
    "#4A4A4A",
    "#4A4A4A",
    "#4A4A4A",
    "#333333",
    "#FFFFFF"
  ];

  const generateImageInternal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution
    const dpr = window.devicePixelRatio || 1;
    const width = 1080;
    const height = 1920; // Instagram Story size
    
    canvas.width = width;
    canvas.height = height;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (bgStyle === 0) {
      gradient.addColorStop(0, "#FCE4EC");
      gradient.addColorStop(1, "#F8BBD0");
    } else if (bgStyle === 1) {
      gradient.addColorStop(0, "#FFF1EB");
      gradient.addColorStop(1, "#ACE0F9");
    } else if (bgStyle === 2) {
      gradient.addColorStop(0, "#e0c3fc");
      gradient.addColorStop(1, "#8ec5fc");
    } else if (bgStyle === 3) {
      gradient.addColorStop(0, "#fdfbfb");
      gradient.addColorStop(1, "#ebedee");
    } else {
      ctx.fillStyle = "#2A2A2A";
    }
    
    if (bgStyle !== 4) ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Styling
    const padding = 100;
    const textColor = textColors[bgStyle];
    
    // Header
    ctx.fillStyle = bgStyle === 4 ? "#D4AF37" : "#B5838D";
    ctx.font = "bold 40px 'Lato'";
    ctx.textAlign = "center";
    ctx.fillText("WOMEN'S QURAN APP", width / 2, 150);

    // Decorative Line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, 180);
    ctx.lineTo(width / 2 + 100, 180);
    ctx.strokeStyle = bgStyle === 4 ? "#D4AF37" : "#B5838D";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Arabic Text
    ctx.fillStyle = textColor;
    ctx.font = "80px 'Amiri'";
    ctx.direction = "rtl";
    wrapText(ctx, arabicText, width / 2, height / 2 - 200, width - (padding * 2), 140);
    
    // English Text
    ctx.direction = "ltr";
    ctx.font = "italic 40px 'Playfair Display'";
    ctx.fillStyle = textColor; // Use same color or slightly lighter
    wrapText(ctx, `"${translationText}"`, width / 2, height / 2 + 200, width - (padding * 2), 70);

    // Footer
    ctx.font = "30px 'Lato'";
    ctx.fillStyle = bgStyle === 4 ? "#AAA" : "#888";
    ctx.fillText(`${surahName} • Ayah ${ayahNumber}`, width / 2, height - 150);
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
      const file = new File([blob], 'quote.png', { type: 'image/png' });
      
      if (navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: 'Quran Verse',
            text: `${surahName} ${ayahNumber}`,
          });
        } catch (err) {
          console.error("Share failed", err);
        }
      } else {
        handleDownload(); // Fallback
      }
    });
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

        <div className="flex flex-col gap-6 items-center my-4">
          <div className="relative shadow-2xl rounded-2xl overflow-hidden w-full aspect-[9/16] max-h-[400px]">
            <canvas ref={canvasRef} className="w-full h-full object-contain bg-gray-100" />
          </div>

          <div className="flex gap-2 justify-center">
            {backgrounds.map((_, i) => (
              <button
                key={i}
                onClick={() => { setBgStyle(i); generateImage(); }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${bgStyle === i ? 'border-primary scale-110' : 'border-transparent'}`}
                style={{ background: backgrounds[i] }}
              />
            ))}
          </div>

          <div className="flex gap-4 w-full">
             <Button onClick={handleDownload} variant="outline" className="flex-1 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
              <Download className="w-4 h-4" /> Save
            </Button>
            <Button onClick={handleShare} className="flex-1 gap-2 bg-gradient-to-r from-primary to-rose-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
