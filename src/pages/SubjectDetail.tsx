import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft, BookOpen, FileText, Library, Download,
  Clock, Star, ChevronRight, Brain,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const tabs = [
  { id: "materials", label: "Study Materials", icon: BookOpen },
  { id: "papers", label: "Question Papers", icon: FileText },
  { id: "mocks", label: "Mock Exams", icon: Brain },
] as const;

export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"materials" | "papers" | "mocks">("materials");

  const subject = useQuery(api.subjects.get, subjectId ? { id: subjectId as Id<"subjects"> } : "skip");
  const materials = useQuery(api.materials.listBySubject, subjectId ? { subjectId: subjectId as Id<"subjects"> } : "skip");
  const papers = useQuery(api.questionPapers.listBySubject, subjectId ? { subjectId: subjectId as Id<"subjects"> } : "skip");
  const exams = useQuery(api.mockExams.listBySubject, subjectId ? { subjectId: subjectId as Id<"subjects"> } : "skip");

  const typeBadge = (type: string) => {
    const s: Record<string, string> = {
      notes: "bg-blue-50 text-blue-600",
      syllabus: "bg-emerald-50 text-emerald-600",
      paper: "bg-violet-50 text-violet-600",
    };
    const l: Record<string, string> = { notes: "Notes", syllabus: "Syllabus", paper: "Paper" };
    return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${s[type] ?? s.notes}`}>{l[type] ?? type}</span>;
  };

  const examBadge = (type: string) => {
    const s: Record<string, string> = { mid: "bg-blue-50 text-blue-600 border-blue-200", end: "bg-rose-50 text-rose-600 border-rose-200", supply: "bg-amber-50 text-amber-600 border-amber-200" };
    const l: Record<string, string> = { mid: "Mid", end: "End", supply: "Supply" };
    return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${s[type] ?? s.mid}`}>{l[type] ?? type}</span>;
  };

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-foreground truncate">{subject.name}</h1>
            <p className="text-xs text-muted-foreground">Semester {subject.semester}</p>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-5xl flex gap-1 px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-6">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease }}>

          {/* Materials */}
          {activeTab === "materials" && (
            <div className="space-y-2">
              {(!materials || materials.length === 0) && <EmptyState text="No study materials available yet." />}
              {materials?.map((m, i) => (
                <div key={m._id} className="group flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{m.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {typeBadge(m.type)}
                        {m.pageCount && <span className="text-[11px] text-muted-foreground">{m.pageCount} pages</span>}
                        <span className="flex items-center gap-0.5 text-[11px] text-amber-500"><Star className="h-3 w-3" /> {m.stars}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-pointer">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Papers */}
          {activeTab === "papers" && (
            <div className="space-y-2">
              {(!papers || papers.length === 0) && <EmptyState text="No question papers available yet." />}
              {papers?.map((p) => (
                <div key={p._id} className="group flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {examBadge(p.examType)}
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {p.year}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-pointer">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mock Exams */}
          {activeTab === "mocks" && (
            <div className="grid sm:grid-cols-2 gap-3">
              {(!exams || exams.length === 0) && <div className="sm:col-span-2"><EmptyState text="No mock exams available yet." /></div>}
              {exams?.map((exam) => (
                <div key={exam._id} className="group rounded-xl border border-border/50 bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <Brain className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] text-muted-foreground bg-muted/70 rounded-md px-2 py-0.5">Sem {exam.semester}</span>
                  </div>
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{exam.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{exam.questionCount} Questions</span>
                    <span>{exam.durationMinutes} min</span>
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Start <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}
