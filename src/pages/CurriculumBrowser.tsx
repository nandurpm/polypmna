import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  getRevisionSubjects,
  type CurriculumSubject,
  type Revision,
} from "@/lib/polydata";

const revisions: { id: Revision; label: string; description: string }[] = [
  { id: "2026", label: "Revision 2026", description: "Current curriculum and published notes" },
  { id: "2021", label: "Revision 2021", description: "Full archived department catalogue" },
  { id: "2015", label: "Revision 2015", description: "Official archive with syllabus PDFs" },
];

const PAGE_SIZE = 72;

function revisionBadge(revision: Revision) {
  if (revision === "2026") return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  if (revision === "2021") return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export default function CurriculumBrowser() {
  const navigate = useNavigate();
  const [revision, setRevision] = useState<Revision>("2026");
  const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [semester, setSemester] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setQuery("");
    setDepartment("all");
    setSemester("all");
    setVisibleCount(PAGE_SIZE);
    getRevisionSubjects(revision)
      .then((data) => {
        if (active) setSubjects(data);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load this revision.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);

  const departments = useMemo(
    () => Array.from(new Set(subjects.map((subject) => subject.programme))).sort((a, b) => a.localeCompare(b)),
    [subjects],
  );
  const semesters = useMemo(
    () => Array.from(new Set(subjects.map((subject) => subject.semesterNumber))).filter(Boolean).sort((a, b) => a - b),
    [subjects],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return subjects.filter((subject) => {
      const matchesDepartment = department === "all" || subject.programme === department;
      const matchesSemester = semester === "all" || subject.semesterNumber === Number(semester);
      const haystack = `${subject.code} ${subject.name} ${subject.programme} ${subject.type}`.toLowerCase();
      return matchesDepartment && matchesSemester && (!needle || haystack.includes(needle));
    });
  }, [department, query, semester, subjects]);

  const visible = filtered.slice(0, visibleCount);
  const activeRevision = revisions.find((item) => item.id === revision)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-semibold">Complete Curriculum Directory</span>
            </div>
          </div>
          <Link to="/" className="hidden text-xs text-muted-foreground hover:text-primary sm:block">Home</Link>
        </div>
      </nav>

      <main className="container py-6 sm:py-8">
        <header className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                POLY PMNA study directory
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Every department. Every revision.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Browse the upstream syllabus manifests by revision, department, semester, and subject. Each card only shows resources that are mapped for that revision.
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 px-4 py-3 text-left lg:min-w-52">
              <p className="text-2xl font-bold">{loading ? "—" : subjects.length.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">subjects in {activeRevision.label}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {revisions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRevision(item.id)}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${revision === item.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}
                aria-pressed={revision === item.id}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
        </header>

        <section className="mb-5 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-label="Curriculum filters">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_150px_auto]">
            <label className="relative block">
              <span className="sr-only">Search subjects</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search subject name, code, or type..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label>
              <span className="sr-only">Department</span>
              <select value={department} onChange={(event) => { setDepartment(event.target.value); setVisibleCount(PAGE_SIZE); }} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50">
                <option value="all">All departments ({departments.length})</option>
                {departments.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Semester</span>
              <select value={semester} onChange={(event) => { setSemester(event.target.value); setVisibleCount(PAGE_SIZE); }} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50">
                <option value="all">All semesters</option>
                {semesters.map((value) => <option key={value} value={value}>Semester {value}</option>)}
              </select>
            </label>
            <div className="flex items-center justify-end rounded-xl bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              {loading ? "Loading..." : `${filtered.length.toLocaleString()} match${filtered.length === 1 ? "" : "es"}`}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Could not load {activeRevision.label}: {error}. Please retry after refreshing the page.
          </div>
        )}
        {loading ? (
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 font-medium">No subjects match those filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another department, semester, or search term.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((subject, index) => (
                <article key={`${subject.revision}-${subject.programmeCode}-${subject.code}-${subject.semesterNumber}-${index}`} className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${revisionBadge(subject.revision)}`}>{subject.revision}</span>
                        <span className="text-[11px] text-muted-foreground">{subject.code}</span>
                      </div>
                      <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5">{subject.name}</h2>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{subject.programme} · {subject.semester} · {subject.type}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Link to={`/subject/${encodeURIComponent(subject.code)}?revision=${subject.revision}&programme=${encodeURIComponent(subject.programmeCode)}`} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90">
                      <BookOpen className="h-3 w-3" /> Details
                    </Link>
                    {subject.notesUrl && (
                      <a href={subject.notesUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">
                        <Download className="h-3 w-3" /> {subject.revision === "2015" ? "Syllabus PDF" : "Notes"}
                      </a>
                    )}
                    {subject.lessonUrl && (
                      <Link to={`/lesson?code=${encodeURIComponent(subject.code)}&revision=${subject.revision}&title=${encodeURIComponent(subject.name)}`} className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-500/20">
                        <Layers className="h-3 w-3" /> Lesson
                      </Link>
                    )}
                    {subject.syllabusUrl && (
                      <a href={subject.syllabusUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted">
                        <FileText className="h-3 w-3" /> Syllabus
                      </a>
                    )}
                    {subject.modelPaperUrl && (
                      <a href={subject.modelPaperUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted">
                        <ExternalLink className="h-3 w-3" /> Model paper
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-primary/30 hover:bg-muted">
                  Load more ({(filtered.length - visibleCount).toLocaleString()} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
