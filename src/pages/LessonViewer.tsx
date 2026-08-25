import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const DIPLOMA_BASE = "https://raw.githubusercontent.com/nandurpm/diploma-notes/main";

export default function LessonViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";
  const title = searchParams.get("title") || "Lesson";
  const lessonUrl = searchParams.get("url") || (code ? `${DIPLOMA_BASE}/revision-2026-content/lessons/lessons-${code}.html` : "");

  if (!lessonUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground mb-4">No lesson available for this subject</p>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0"
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

      {/* Lesson iframe */}
      <div className="flex-1 bg-white overflow-hidden">
        <iframe
          src={lessonUrl}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
