import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  FileText,
  ExternalLink,
  Loader2,
  Layers,
  Clock,
  Star,
} from "lucide-react";
import {
  getPdfForCode,
  getLessonUrl,
  getPdfDownloadUrl,
  type PdfSubject,
} from "@/lib/polydata";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

function cleanTitle(raw: string): string {
  return raw
    .replace(/^Course \d+[A-Z]?\s*[—–-]\s*/i, "")
    .replace(/^\d+[A-Z]?\s*[—–-]\s*/i, "")
    .replace(/\s*\|\s*Revision\s*\d+\s*\|\s*POLY PMNA/gi, "")
    .replace(/\s*\|\s*REV\d+\s*\|\s*POLY PMNA/gi, "")
    .replace(/\s*\|\s*POLY PMNA/gi, "")
    .trim();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<PdfSubject | null>(null);
  const [loading, setLoading] = useState(true);

  const code = subjectId || "";

  const loadPdf = useCallback(async () => {
    if (!code) { setLoading(false); return; }
    try {
      const data = await getPdfForCode(code);
      setPdf(data);
    } catch (e) {
      console.error("Failed to load PDF info:", e);
    }
    setLoading(false);
  }, [code]);

  useEffect(() => { loadPdf(); }, [loadPdf]);

  const title = pdf ? cleanTitle(pdf.title) : `Subject ${code}`;
  const lessonUrl = getLessonUrl(code);
  const pdfUrl = getPdfDownloadUrl(code);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">{title}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        {/* Subject info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-primary font-medium">Code: {code}</span>
            {pdf && (
              <span className="text-xs text-muted-foreground">· {pdf.pages} pages · {formatBytes(pdf.bytes)}</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">{title}</h1>
        </motion.div>

        {/* Action cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {/* Study Notes PDF */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Study Notes</h3>
                <p className="text-[11px] text-muted-foreground">
                  {pdf ? `${pdf.pages} pages · Revision 2026` : "PDF notes"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Complete study notes covering all units of this subject, generated from the official Kerala Polytechnic syllabus.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to={`/pdf?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}&code=${code}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Eye className="h-3.5 w-3.5" /> Read Online
              </Link>
              <a
                href={pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </a>
            </div>
          </motion.div>

          {/* Lesson Page */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Lesson Content</h3>
                <p className="text-[11px] text-muted-foreground">Interactive HTML lesson</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Read the full lesson in your browser — covers all chapters with diagrams, examples, and explanations.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to={`/lesson?code=${code}&title=${encodeURIComponent(title)}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-xs font-medium text-white hover:bg-violet-600 transition-all"
              >
                <Eye className="h-3.5 w-3.5" /> Read Lesson
              </Link>
              <a
                href={lessonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open Full
              </a>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">More Resources</h3>
                <p className="text-[11px] text-muted-foreground">Additional study aids</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Access mock exams, question papers, and AI-powered help for this subject.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/mock-exams")}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                Take Mock Exam
              </button>
              <button
                onClick={() => navigate("/question-papers")}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                Question Papers
              </button>
            </div>
          </motion.div>
        </div>

        {/* File info */}
        {pdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-2">File Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Pages</p>
                <p className="font-medium text-foreground">{pdf.pages}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="font-medium text-foreground">{formatBytes(pdf.bytes)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Revision</p>
                <p className="font-medium text-foreground">{pdf.revision}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Code</p>
                <p className="font-medium text-foreground">{code}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
