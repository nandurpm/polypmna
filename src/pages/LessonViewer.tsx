/*
 * ============================================================
 * FILE: LessonViewer.tsx
 * PURPOSE: Loads revision-aware HTML lessons in an embedded viewer with loading and recovery states.
 * ============================================================
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ExternalLink, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { getLessonUrl, type Revision } from "@/lib/polydata";


export default function LessonViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";
  const title = searchParams.get("title") || "Lesson";
  const requestedRevision = searchParams.get("revision");
  const revision: Revision = requestedRevision === "2021" || requestedRevision === "2015" || requestedRevision === "2026" ? requestedRevision : "2026";
  const lessonUrl = searchParams.get("url") || (code ? getLessonUrl(code, revision) : "");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (!lessonUrl) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);
    fetch(lessonUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((html) => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [lessonUrl]);

  if (!lessonUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground mb-4">No lesson available for this subject</p>
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
        <a
          href={lessonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Full Page
        </a>
      </nav>

      {/* Lesson content */}
      <div className="flex-1 bg-white overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Fetching lesson content...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="mx-auto h-10 w-10 text-orange-400 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Could not load lesson</p>
              <p className="text-xs text-muted-foreground mb-4">
                The lesson content could not be loaded. You can try opening it directly.
              </p>
              <a
                href={lessonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all"
              >
                <ExternalLink className="h-4 w-4" /> Open in New Tab
              </a>
            </div>
          </div>
        )}
        {htmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
