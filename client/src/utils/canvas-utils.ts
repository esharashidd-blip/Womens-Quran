// Canvas utilities for optimized quote generation

export interface CanvasConfig {
  width: number;
  height: number;
  dpr?: number;
  isPreview?: boolean;
}

/**
 * Wait for fonts to load before rendering canvas
 * Prevents fallback fonts and improves text measurement accuracy
 */
export async function waitForFonts(): Promise<void> {
  if (!('fonts' in document)) {
    // Fallback for browsers without Font Loading API
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  try {
    await document.fonts.ready;
  } catch (error) {
    console.warn('Font loading check failed:', error);
  }
}

/**
 * Get optimized canvas dimensions based on use case
 */
export function getCanvasDimensions(isPreview: boolean = false): CanvasConfig {
  const dpr = window.devicePixelRatio || 2;

  if (isPreview) {
    // Smaller resolution for preview - much faster rendering
    return {
      width: 540,  // Half of Instagram Story width
      height: 960, // Half of Instagram Story height
      dpr: Math.min(dpr, 2), // Cap at 2x for preview
      isPreview: true
    };
  }

  // Full resolution for final export
  return {
    width: 1080,
    height: 1920,
    dpr: Math.min(dpr, 2), // Cap at 2x even for export
    isPreview: false
  };
}

/**
 * Setup canvas with proper dimensions and DPR scaling
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  config: CanvasConfig
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const { width, height, dpr = 2 } = config;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.scale(dpr, dpr);
  return ctx;
}

/**
 * Download canvas as image with proper iOS support
 */
export async function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      // Try Web Share API first (works on iOS)
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          await navigator.share({ files: [file] });
          resolve(true);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            resolve(false); // User cancelled
            return;
          }
        }
      }

      // Fallback to download link (works on desktop, some Android browsers)
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(true);
      } catch (error) {
        console.error('Download failed:', error);
        resolve(false);
      }
    }, 'image/png', 0.95);
  });
}

/**
 * Share canvas image via native share sheet
 */
export async function shareCanvasImage(
  canvas: HTMLCanvasElement
): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Try native iOS share if available
        if ((window as any).webkit?.messageHandlers?.shareImage) {
          try {
            (window as any).webkit.messageHandlers.shareImage.postMessage({
              image: base64data
            });
            resolve(true);
            return;
          } catch (err) {
            console.error("Native bridge failed:", err);
          }
        }

        // Fallback to Web Share API
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'womens-quran.png', { type: 'image/png' })] })) {
          try {
            const file = new File([blob], 'womens-quran.png', { type: 'image/png' });
            await navigator.share({ files: [file] });
            resolve(true);
            return;
          } catch (err: any) {
            if (err.name === 'AbortError') {
              resolve(false); // User cancelled
              return;
            }
          }
        }

        resolve(false);
      };
      reader.readAsDataURL(blob);
    }, 'image/png', 0.95);
  });
}
