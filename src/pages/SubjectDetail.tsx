import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  Star,
} from "lucide-react";
import {
  getLessonUrl,
  getModelPaperUrl,
  getPdfDownloadUrl,
  getPdfForCode,
  getRevisionSubjects,
  getSyllabusUrl,
  type CurriculumSubject,
  type PdfSubject,
  type Revision,
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

function isRevision(value: string | null): value is Revision {
  return value === "2026" || value === "2021" || value === "2015";
}

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<PdfSubject | null>(null);
  const [subject, setSubject] = useState<CurriculumSubject | null>(null);
  const [loading, setLoading] = useState(true);

  const code = subjectId || "";
  const selectedRevision = searchParams.get("revision");
  const revision: Revision = isRevision(selectedRevision) ? selectedRevision : "2026";
  const programme = searchParams.get("programme") || "";

  const loadSubject = useCallback(async () => {
    if (!code) {
      setLoading(false);
      return;
    }
    try {
      const [revisionSubjects, pdfData] = await Promise.all([
        getRevisionSubjects(revision),
        revision === "2026" ? getPdfForCode(code) : Promise.resolve(null),
      ]);
      const match = revisionSubjects.find((item) => item.code === code && (!programme || item.programmeCode === programme))
        || revisionSubjects.find((item) => item.code === code)
        || null;
      setSubject(match);
      setPdf(pdfData);
    } catch (error) {
      console.error("Failed to load subject resources:", error);
    } finally {
      setLoading(false);
    }
  }, [code, programme, revision]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSubject(); }, [loadSubject]);

  const title = subject?.name || (pdf ? cleanTitle(pdf.title) : `Subject ${code}`);
  const notesUrl = subject?.notesUrl || (revision === "2026" ? getPdfDownloadUrl(code) : "");
  const lessonUrl = subject?.lessonUrl || getLessonUrl(code, revision);
  const syllabusUrl = subject?.syllabusUrl || getSyllabusUrl(code, revision);
  const modelPaperUrl = subject?.modelPaperUrl || (revision === "2015" ? "" : getModelPaperUrl(code, revision));
  const hasPublishedNotes = Boolean(pdf || subject?.notesUrl);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></button>
            <div className="flex min-w-0 items-center gap-2"><BookOpen className="h-4 w-4 shrink-0 text-primary" /><span className="truncate text-sm font-semibold">{title}</span></div>
          </div>
          <span className="hidden rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary sm:block">Revision {revision}</span>
        </div>
      </nav>

      <main className="container py-6 sm:py-8">
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="mb-6">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Code: {code}</span>
            {subject && <><span>·</span><span>{subject.programme}</span><span>·</span><span>{subject.semester}</span><span>·</span><span>{subject.type}</span></>}
            {pdf && <><span>·</span><span>{pdf.pages} pages · {formatBytes(pdf.bytes)}</span></>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Revision-aware resources for this subject. Official links open the corresponding SITTTR or maintained archive page.</p>
        </motion.header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hasPublishedNotes && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><FileText className="h-5 w-5" /></div><div><h2 className="text-sm font-semibold">Study Notes</h2><p className="text-[11px] text-muted-foreground">{pdf ? `${pdf.pages} pages · ` : "Archive PDF · "}Revision {revision}</p></div></div>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">Download the published subject PDF. Revision 2026 notes are maintained in the POLY PMNA notes archive; Revision 2015 syllabus PDFs come from the archive mapping.</p>
              <div className="flex gap-2"><Link to={`/pdf?url=${encodeURIComponent(notesUrl)}&title=${encodeURIComponent(title)}&code=${code}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"><BookOpen className="h-3.5 w-3.5" /> Read online</Link><a href={notesUrl} download target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><Download className="h-3.5 w-3.5" /> Download</a></div>
            </motion.section>
          )}

          {lessonUrl && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600"><Layers className="h-5 w-5" /></div><div><h2 className="text-sm font-semibold">Lesson Content</h2><p className="text-[11px] text-muted-foreground">Published HTML lesson</p></div></div>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">Read the maintained lesson page in the browser. The card is hidden when the upstream lesson file is unavailable.</p>
              <div className="flex gap-2"><Link to={`/lesson?code=${encodeURIComponent(code)}&revision=${revision}&title=${encodeURIComponent(title)}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700"><BookOpen className="h-3.5 w-3.5" /> Read lesson</Link><a href={lessonUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Open full</a></div>
            </motion.section>
          )}

          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"><Star className="h-5 w-5" /></div><div><h2 className="text-sm font-semibold">Official Resources</h2><p className="text-[11px] text-muted-foreground">SITTTR curriculum pages</p></div></div>
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">Open the syllabus and model-paper pages for this course. Availability depends on the selected revision and the official archive.</p>
            <div className="flex flex-col gap-2"><a href={syllabusUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><FileText className="h-3.5 w-3.5" /> Syllabus</a>{modelPaperUrl && <a href={modelPaperUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Model paper</a>}</div>
          </motion.section>
        </div>

        <section className="mt-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">More study tools</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Use question papers, mock exams, and POLY AI to revise this subject.</p>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => navigate("/question-papers")} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted">Question papers</button><button onClick={() => navigate("/mock-exams")} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted">Mock exams</button><button onClick={() => navigate("/ask-ai")} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Ask POLY AI</button></div>
        </section>
      </main>
    </div>
  );
}
