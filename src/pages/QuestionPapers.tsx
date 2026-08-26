import { useState, useMemo, useEffect, useCallback, useDeferredValue } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  FileText,
  ExternalLink,
  Library,
  Filter,
  Loader2,
  Building2,
} from "lucide-react";
import { getQuestionPapers, type QuestionPaperDoc } from "@/lib/polydata";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function QuestionPapers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<QuestionPaperDoc[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const paperData = await getQuestionPapers();
      setPapers(paperData);
    } catch (e) {
      console.error("Failed to load papers:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Unique departments from papers
  const departments = useMemo(() => {
    const depts = new Set(papers.map((p) => p.department));
    return Array.from(depts).sort();
  }, [papers]);

  // Normalize each paper once, then defer filtering so typing stays responsive.
  const indexedPapers = useMemo(
    () => papers.map((paper) => ({
      paper,
      searchText: `${paper.courseCode} ${paper.courseName.replace(/-/g, " ")} ${paper.department}`.toLocaleLowerCase(),
    })),
    [papers]
  );
  const deferredSearch = useDeferredValue(search);

  // Filtered papers. All matches remain in the DOM; content-visibility lets the browser
  // skip layout/paint work for rows outside the viewport.
  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLocaleLowerCase();
    return indexedPapers
      .filter(({ paper, searchText }) => !selectedDept || paper.department === selectedDept)
      .filter(({ searchText }) => !q || searchText.includes(q))
      .map(({ paper }) => paper);
  }, [indexedPapers, selectedDept, deferredSearch]);

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
              <Library className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Question Papers</span>
              {!loading && <span className="text-xs text-muted-foreground">({papers.length})</span>}
            </div>
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-20">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading question papers from SITTTR...
          </div>
        ) : (
          <>
            {/* Department filter */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <button
                onClick={() => setSelectedDept(null)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedDept === null
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({papers.length})
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    selectedDept === dept
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Papers list */}
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No question papers found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try a different filter or search</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filtered.map((paper, i) => (
                  <div
                    key={`${paper.courseCode}-${paper.department}-${paper.path || i}`}
                    style={{ contentVisibility: "auto", containIntrinsicSize: "64px" }}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/20 hover:shadow-sm transition-all"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {paper.courseName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">{paper.department}</span>
                        {paper.bytes > 0 && (
                          <span className="text-[11px] text-muted-foreground/60">· {formatBytes(paper.bytes)}</span>
                        )}
                        {paper.pages > 0 && (
                          <span className="text-[11px] text-muted-foreground/60">· {paper.pages} pages</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        to={`/pdf?url=${encodeURIComponent(paper.pdfUrl)}&title=${encodeURIComponent(paper.courseName)}&code=${paper.courseCode}`}
                        className="flex h-8 items-center gap-1 rounded-lg bg-primary/10 px-2.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="h-3 w-3" /> View
                      </Link>
                      <a
                        href={paper.pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </a>
                      {paper.sourceUrl && (
                        <a
                          href={paper.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> SITTTR
                        </a>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
