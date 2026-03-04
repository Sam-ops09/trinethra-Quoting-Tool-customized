import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw, X, Maximize2, Minimize2, Lock, InfoIcon } from "lucide-react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The API endpoint to fetch the PDF from, e.g. `/api/quotes/123/pdf` */
  pdfUrl: string;
  /** Filename used when downloading, e.g. `Quote-QUO-2026-0001.pdf` */
  filename: string;
  /** Title shown in the dialog header */
  title?: string;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  filename,
  title = "PDF Preview",
}: PdfPreviewDialogProps) {
  const canGeneratePdf = useFeatureFlag("pdf_generation");
  const hasLogoEnabled = useFeatureFlag("pdf_logo");
  const hasHeaderFooterEnabled = useFeatureFlag("pdf_headerFooter");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(pdfUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Document not found"
            : `Failed to load PDF (${response.status})`
        );
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      setObjectUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to load PDF");
    } finally {
      setLoading(false);
    }
  }, [pdfUrl]);

  // Fetch when dialog opens
  useEffect(() => {
    if (open) {
      fetchPdf();
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
      setError(null);
      setIsFullscreen(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pdfUrl]);

  const handleDownload = () => {
    if (!objectUrl) return;
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          // Reset base dialog padding & layout
          "!p-0 !gap-0 flex flex-col overflow-hidden",
          // Mobile-first: near-fullscreen on small devices
          "w-[calc(100vw-16px)] h-[calc(100dvh-16px)]",
          // Override the default max-w-lg
          isFullscreen
            ? "!max-w-[calc(100vw-16px)] sm:!max-w-[calc(100vw-16px)]"
            : "!max-w-[calc(100vw-16px)] sm:!max-w-3xl md:!max-w-4xl lg:!max-w-5xl",
          // Responsive heights
          isFullscreen
            ? "sm:h-[calc(100dvh-16px)]"
            : "sm:h-[85vh] md:h-[88vh]",
          // Max height safety
          "!max-h-[calc(100dvh-16px)]",
          // Rounding
          "rounded-lg",
        ].join(" ")}
      >
        {/* Header */}
        <DialogHeader className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-xs sm:text-sm font-semibold truncate flex-1 min-w-0">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Fullscreen toggle — hidden on mobile since we're already near-fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setIsFullscreen((f) => !f)}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
              {canGeneratePdf && objectUrl && (
                <Button
                  size="sm"
                  className="h-7 text-[11px] sm:text-xs gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden xs:inline">Download</span>
                  <span className="xs:hidden">Save</span>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
 
        {/* Content area — fills remaining space */}
        <div className="flex-1 min-h-0 bg-muted/30 relative">
          {!canGeneratePdf ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Feature Locked</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6 font-['Open_Sans']">
                PDF generation is currently disabled for your account. Please contact your administrator to enable this feature.
              </p>
              <Alert className="max-w-md bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
                  This includes quotes, invoices, and other document previews.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-primary" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Generating PDF...
                  </p>
                </div>
              )}
 
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
                  <X className="h-8 w-8 sm:h-10 sm:w-10 text-destructive/60" />
                  <p className="text-xs sm:text-sm text-destructive font-medium text-center">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={fetchPdf}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}
 
              {objectUrl && !loading && !error && (
                <iframe
                  src={objectUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="PDF Preview"
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
