import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  BookOpen,
  Search,
  GraduationCap,
  FileText,
  Building2,
  ArrowRight,
  Compass,
  Library,
  Layers,
  BarChart3,
  Bookmark,
  ExternalLink,
  Star,
  Sparkles,
  GitBranch,
  Bot,
  ClipboardList,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import {
  getAllSubjects,
  getAllPdfs,
  getQuestionPapers,
  getProgrammes,
  getPdfDownloadUrl,
  getLessonUrl,
  type SubjectEntry,
  type PdfSubject,
  type ProgrammeInfo,
} from "@/lib/polydata";

/* ─── Helpers ─── */
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Quick Links ─── */
const quickLinks = [
  { label: "Syllabus", desc: "View full curriculum", icon: FileText, href: "/curriculum" },
  { label: "Question Papers", desc: "SITTTR model papers", icon: Library, href: "/question-papers" },
  { label: "Exam Schedule", desc: "Current exam timetable", icon: Bookmark, href: "/student-tools" },
  { label: "CGPA Calculator", desc: "Calculate your GPA", icon: BarChart3, href: "/student-tools" },
  { label: "Ask POLY AI", desc: "Instant study help", icon: Bot, href: "/ask-ai" },
  { label: "Mock Exams", desc: "Practice with MCQ tests", icon: ClipboardList, href: "/mock-exams" },
  { label: "Resource Hub", desc: "Revision archives & official links", icon: ExternalLink, href: "/resources" },
];

/* ─── Department icons ─── */
const deptIcons: Record<string, typeof Layers> = {
  CSE: Layers, CE: Building2, ME: Compass, ECE: Sparkles, EEE: BarChart3, AE: GitBranch,
};
const deptColors: Record<string, string> = {
  CSE: "from-blue-500 to-indigo-600", CE: "from-emerald-500 to-teal-600",
  ME: "from-orange-500 to-red-500", ECE: "from-violet-500 to-purple-600",
  EEE: "from-amber-500 to-yellow-500", AE: "from-rose-500 to-pink-600",
};

/* ─── Main ─── */
export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [pdfs, setPdfs] = useState<PdfSubject[]>([]);
  const [papers, setPapers] = useState<{ courseCode: string; courseName: string; pdfUrl: string }[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeInfo[]>([]);

  const loadData = useCallback(async () => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    try {
      const [subjs, pdfData, paperData, progs] = await Promise.all([
        getAllSubjects(),
        getAllPdfs(),
        getQuestionPapers(),
        getProgrammes(),
      ]);
      setSubjects(subjs);
      setPdfs(pdfData);
      setPapers(paperData);
      setProgrammes(progs);
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const departments = useMemo(() => {
    const main = [
      { abbr: "CSE", name: "Computer Science & Engineering", keywords: ["computer"] },
      { abbr: "CE", name: "Civil Engineering", keywords: ["civil"] },
      { abbr: "ME", name: "Mechanical Engineering", keywords: ["mechanical"] },
      { abbr: "ECE", name: "Electronics Engineering", keywords: ["electronics"] },
      { abbr: "EEE", name: "Electrical & Electronics", keywords: ["electrical"] },
      { abbr: "AE", name: "Automobile Engineering", keywords: ["automobile"] },
    ];
    return main.map((d) => {
      const progs = programmes.filter((p) =>
        d.keywords.some((k) => p.name.toLowerCase().includes(k))
      );
      const subCount = progs.reduce((a, p) => a + p.subjectCount, 0);
      const semCount = Math.max(...progs.map((p) => p.semesterCount), 0);
      return { ...d, programmes: progs, subjectCount: subCount, semesterCount: semCount };
    });
  }, [programmes]);

  const featuredPdfs = useMemo(() => {
    return pdfs.slice(0, 18).map((p) => ({
      code: p.code,
      title: cleanTitle(p.title),
      pages: p.pages,
      size: formatBytes(p.bytes),
      pdfUrl: p.pdfUrl,
    }));
  }, [pdfs]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return subjects
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.includes(q) ||
          s.programme.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [search, subjects]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Polytechnic Study Materials
            </span>
          </div>
          <div className="hidden md:flex flex-1 max-w-xl mx-6 lg:mx-10">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search subjects, codes, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/curriculum")}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer"
            >
              Open Study Space
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden w-full px-4 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subjects, codes, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* ─── Search Results ─── */}
      {search.trim() ? (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Search Results
              <span className="ml-2 text-sm font-normal text-muted-foreground">({searchResults.length})</span>
            </h2>
            <button onClick={() => setSearch("")} className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer">Clear</button>
          </div>
          {searchResults.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No results for &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {searchResults.map((r) => {
                const pdf = pdfs.find((p) => p.code === r.code);
                return (
                  <div key={`${r.code}-${r.programmeCode}`} className="group rounded-xl border border-border bg-card p-3 hover:border-primary/20 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.programme} · {r.semester} · Code: {r.code}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {pdf && (
                            <Link to={`/pdf?url=${encodeURIComponent(pdf.pdfUrl)}&title=${encodeURIComponent(cleanTitle(pdf.title))}&code=${r.code}`} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors">
                              <Eye className="h-3 w-3" /> View Notes ({pdf.pages}p)
                            </Link>
                          )}
                          {pdf && (
                            <a href={getPdfDownloadUrl(r.code)} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                              <Download className="h-3 w-3" /> Download
                            </a>
                          )}
                          {getLessonUrl(r.code) && (
                            <Link to={`/lesson?code=${r.code}&title=${encodeURIComponent(r.name)}`} className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-1 text-[11px] font-medium text-violet-600 hover:bg-violet-500/20 transition-colors">
                              <FileText className="h-3 w-3" /> Lesson
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full px-4 sm:px-6 lg:px-10">
          {/* Hero */}
          <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/[0.05] blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/[0.04] blur-3xl" />
            </div>
            <div className="relative grid items-center gap-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
              <div>
              <p className="text-sm font-medium text-primary/80 mb-1.5">{greeting()}, Student</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                Your Polytechnic Study Space
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {loading ? "Loading study materials..." : (
                  <>Browse <strong>{subjects.length.toLocaleString()}</strong> subjects across <strong>{programmes.length}</strong> departments,
                  access <strong>{pdfs.length.toLocaleString()}</strong> study notes, <strong>{papers.length.toLocaleString()}</strong> question papers,
                  and lesson content — all organized by department and semester.</>
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => navigate("/curriculum")} className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer">
                  Browse Complete Directory
                </button>
                <button onClick={() => navigate("/question-papers")} className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:border-primary/20 transition-all cursor-pointer">
                  Question Papers
                </button>
                <button onClick={() => navigate("/ask-ai")} className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:border-primary/20 transition-all cursor-pointer">
                  Ask POLY AI
                </button>
              </div>
              {!loading && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {[
                    { label: "Departments", value: programmes.length, icon: Building2 },
                    { label: "Subjects", value: subjects.length.toLocaleString(), icon: BookOpen },
                    { label: "Study Notes", value: pdfs.length.toLocaleString(), icon: FileText },
                    { label: "Question Papers", value: papers.length.toLocaleString(), icon: Library },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 text-sm">
                      <stat.icon className="h-4 w-4 text-primary/60" />
                      <span className="font-semibold text-foreground">{stat.value}</span>
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
              </div>
              <aside className="hidden sm:block rounded-2xl border border-primary/10 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">Directory at a glance</p>
                    <h2 className="mt-1 text-lg font-semibold">Three revision pathways</h2>
                  </div>
                  <GitBranch className="h-5 w-5 text-primary/70" />
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    ["2026", "Current curriculum", "2,485 subjects"],
                    ["2021", "Full archive", "44 departments"],
                    ["2015", "Official archive", "21 departments"],
                  ].map(([year, label, count]) => (
                    <div key={year} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{year}</span>
                      <span className="min-w-0 flex-1 text-xs font-medium text-foreground">{label}</span>
                      <span className="text-[11px] text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/curriculum")} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80">
                  Explore every department <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </aside>
            </div>
          </section>

          {/* Departments */}
          <section id="departments" className="pb-8 scroll-mt-20">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Browse by Department</h2>
              <button onClick={() => navigate("/curriculum")} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
                All revisions and departments <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading departments...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {departments.map((dept) => {
                  const Icon = deptIcons[dept.abbr] || Layers;
                  return (
                    <button
                      key={dept.abbr}
                      onClick={() => navigate("/curriculum")}
                      className="group relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/15 hover:bg-card/80 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${deptColors[dept.abbr]} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">{dept.abbr}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{dept.semesterCount} sems · {dept.subjectCount} subj</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Study Resources */}
          <section className="pb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bookmark className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Study Resources</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { icon: Layers, label: "Subjects", desc: `Browse all ${subjects.length.toLocaleString()} subjects across departments`, color: "from-blue-500/15 to-indigo-500/10 text-blue-500", count: `${subjects.length.toLocaleString()} Subjects`, href: "/curriculum" },
                { icon: FileText, label: "Study Notes", desc: `Download PDF notes for ${pdfs.length.toLocaleString()} subjects`, color: "from-emerald-500/15 to-teal-500/10 text-emerald-500", count: `${pdfs.length.toLocaleString()} PDFs`, href: "/curriculum" },
                { icon: Library, label: "Question Papers", desc: `SITTTR model question papers — ${papers.length.toLocaleString()} available`, color: "from-violet-500/15 to-purple-500/10 text-violet-500", count: `${papers.length.toLocaleString()} Papers`, href: "/question-papers" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/15 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => navigate(card.href)}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{card.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                  <p className="text-[11px] text-primary/80 font-medium mt-2.5">{card.count}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Study Notes */}
          <section className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Star className="h-4 w-4 text-primary" /></div>
                <h2 className="text-base font-semibold">Study Notes — Ready to Download</h2>
              </div>
              <button onClick={() => navigate("/dashboard")} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading study notes...
              </div>
            ) : featuredPdfs.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">No study notes available yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {featuredPdfs.map((mat) => (
                  <div
                    key={mat.code}
                    className="group rounded-xl border border-border bg-card p-4 hover:border-primary/15 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                        Notes
                      </span>
                      <span className="text-[11px] text-muted-foreground">{mat.pages}p · {mat.size}</span>
                    </div>
                    <h3 className="font-medium text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{mat.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Code: {mat.code}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        to={`/pdf?url=${encodeURIComponent(mat.pdfUrl)}&title=${encodeURIComponent(mat.title)}&code=${mat.code}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <a
                        href={mat.pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                      <Link
                        to={`/lesson?code=${mat.code}&title=${encodeURIComponent(mat.title)}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" /> Lesson
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Academic Access */}
          <section className="pb-12">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Compass className="h-4 w-4 text-primary" /></div>
              <h2 className="text-base font-semibold">Quick Academic Access</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {quickLinks.map((link) => (
                <div
                  key={link.label}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/15 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(link.href)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary/80 transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary group-hover:scale-105">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{link.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-border bg-muted/30">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10"><BookOpen className="h-3 w-3 text-primary" /></div>
              <span className="text-xs font-semibold text-foreground/80 tracking-tight">Polytechnic Study Materials</span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              Revision 2026 &amp; 2021 · Kerala Polytechnic Curriculum · {loading ? "..." : `${subjects.length.toLocaleString()} subjects · ${pdfs.length.toLocaleString()} PDFs`}
              <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
