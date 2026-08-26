import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";

export default function PDFViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Study Material";
  const code = searchParams.get("code") || "";
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        // Keep the original URL for the browser's native PDF viewer. A blob URL
        // passed to a different-origin PDF.js viewer is not reliably readable.
        void blob;
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No PDF URL provided</p>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="flex items-center justify-between border-b border-border bg-background px-4 py-2 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
            {code && <p className="text-[11px] text-muted-foreground">Code: {code}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Reset zoom"
          >
            <Maximize className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Download */}
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>

          {/* Open in new tab */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        </div>
      </nav>

      {/* PDF content */}
      <div className="flex-1 bg-muted/30 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="mx-auto h-10 w-10 text-orange-400 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Could not load PDF</p>
              <p className="text-xs text-muted-foreground mb-4">
                The PDF could not be loaded in the viewer. You can download it directly instead.
              </p>
              <div className="flex items-center justify-center gap-2">
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all"
                >
                  <ExternalLink className="h-4 w-4" /> Open in New Tab
                </a>
              </div>
            </div>
          </div>
        )}
        {pdfViewerUrl && (
          <iframe
            src={pdfViewerUrl}
            className="w-full h-full border-0"
            title={title}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
          />
        )}
      </div>
    </div>
  );
}
