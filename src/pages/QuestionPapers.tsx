import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ArrowLeft,
  Library,
  Download,
  FileText,
  Calendar,
  Search,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function QuestionPapers() {
  const navigate = useNavigate();
  const [selectedSem, setSelectedSem] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Fetch all papers (we'll filter client-side for simplicity)
  const allPapers = useQuery(api.questionPapers.recent, { limit: 200 });
  const subjects = useQuery(api.subjects.listAll);

  const subjectMap = useMemo(() => {
    if (!subjects) return new Map<string, string>();
    return new Map(subjects.map((s) => [s._id, s.name]));
  }, [subjects]);

  const filteredPapers = useMemo(() => {
    if (!allPapers) return [];
    let papers = allPapers;

    if (selectedYear) {
      papers = papers.filter((p) => p.year === selectedYear);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      papers = papers.filter((p) => {
        const subjectName = subjectMap.get(p.subjectId) ?? "";
        return (
          p.title.toLowerCase().includes(q) ||
          subjectName.toLowerCase().includes(q)
        );
      });
    }

    return papers.sort((a, b) => b.year - a.year);
  }, [allPapers, selectedYear, search, subjectMap]);

  const years = useMemo(() => {
    if (!allPapers) return [];
    const yearSet = new Set(allPapers.map((p) => p.year));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [allPapers]);

  const examTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      mid: "bg-blue-50 text-blue-600 border-blue-200",
      end: "bg-rose-50 text-rose-600 border-rose-200",
      supply: "bg-amber-50 text-amber-600 border-amber-200",
    };
    const labels: Record<string, string> = {
      mid: "Mid Semester",
      end: "End Semester",
      supply: "Supplementary",
    };
    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[type] ?? styles.mid}`}>
        {labels[type] ?? type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Library className="h-4 w-4 text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">Question Papers</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{filteredPapers.length} papers</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search papers by subject name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card py-2.5 pl-10 pr-4 text-sm text-foreground
                     placeholder:text-muted-foreground/60 outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/15 transition-all"
          />
        </div>

        {/* Year filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setSelectedYear(null)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${selectedYear === null ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"}`}>
            All Years
          </button>
          {years.map((y) => (
            <button key={y} onClick={() => setSelectedYear(y)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${selectedYear === y ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"}`}>
              {y}
            </button>
          ))}
        </div>

        {/* Paper list */}
        <div className="space-y-2">
          {filteredPapers.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
              <Library className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No question papers found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
          {filteredPapers.map((paper, i) => (
            <motion.div
              key={paper._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.25 }}
              className="group flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4
                       hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {paper.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {examTypeBadge(paper.examType)}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {paper.year}
                    </span>
                  </div>
                </div>
              </div>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground
                           hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-pointer">
                <Download className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
