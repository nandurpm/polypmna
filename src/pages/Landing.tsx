import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Search,
  GraduationCap,
  ChevronRight,
  Clock,
  FileText,
  Building2,
  Calendar,
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
} from "lucide-react";

/* ─── Animation ─── */

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeIn = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease },
  }),
};

/* ─── Data ─── */

const departments = [
  { name: "Computer Engineering", abbr: "CSE", icon: Layers, color: "from-blue-500 to-indigo-600", semesters: [2, 3, 4, 5, 6], totalSubjects: 18 },
  { name: "Civil Engineering", abbr: "CE", icon: Building2, color: "from-emerald-500 to-teal-600", semesters: [2, 3, 4, 5, 6], totalSubjects: 16 },
  { name: "Mechanical Engineering", abbr: "ME", icon: Compass, color: "from-orange-500 to-red-500", semesters: [2, 3, 4, 5, 6], totalSubjects: 18 },
  { name: "Electronics Engineering", abbr: "ECE", icon: Sparkles, color: "from-violet-500 to-purple-600", semesters: [2, 3, 4, 5, 6], totalSubjects: 17 },
  { name: "Electrical & Electronics", abbr: "EEE", icon: BarChart3, color: "from-amber-500 to-yellow-500", semesters: [2, 3, 4, 5, 6], totalSubjects: 16 },
  { name: "Automobile Engineering", abbr: "AE", icon: GitBranch, color: "from-rose-500 to-pink-600", semesters: [2, 3, 4, 5, 6], totalSubjects: 15 },
];

const recentMaterials = [
  { title: "Programming in C — Unit 5: Arrays & Pointers", subject: "Programming in C", dept: "Computer Engineering", semester: 3, type: "notes", time: "2 hours ago" },
  { title: "Database Management Systems — Chapter 4: Normalization", subject: "Database Management Systems", dept: "Computer Engineering", semester: 3, type: "notes", time: "5 hours ago" },
  { title: "Engineering Mechanics — Previous Year Question Paper 2024", subject: "Engineering Mechanics", dept: "Civil Engineering", semester: 2, type: "paper", time: "1 day ago" },
  { title: "Strength of Materials — Unit 3: Shear Force & Bending Moment", subject: "Strength of Materials", dept: "Mechanical Engineering", semester: 3, type: "notes", time: "1 day ago" },
];

const featuredMaterials = [
  { title: "Data Structures — Complete Study Guide", subject: "Data Structures", dept: "Computer Engineering", semester: 4, type: "notes", pages: 48, stars: 124 },
  { title: "Object Oriented Programming with C++", subject: "Object Oriented Programming", dept: "Computer Engineering", semester: 4, type: "notes", pages: 36, stars: 98 },
  { title: "Digital Electronics — Simplified Notes", subject: "Digital Electronics", dept: "Electronics Engineering", semester: 3, type: "notes", pages: 42, stars: 87 },
  { title: "Fluid Mechanics — All Units Covered", subject: "Fluid Mechanics & Hydraulic Machines", dept: "Mechanical Engineering", semester: 4, type: "notes", pages: 55, stars: 76 },
  { title: "Theory of Structures — Quick Revision Notes", subject: "Theory of Structures", dept: "Civil Engineering", semester: 3, type: "notes", pages: 32, stars: 65 },
  { title: "Power Electronics Devices & Circuits", subject: "Power Electronics", dept: "Electrical & Electronics", semester: 4, type: "notes", pages: 40, stars: 58 },
];

const quickLinks = [
  { label: "Syllabus", desc: "View full curriculum", icon: FileText, href: "/question-papers" },
  { label: "Question Papers", desc: "Previous years with solutions", icon: Library, href: "/question-papers" },
  { label: "Exam Schedule", desc: "Current exam timetable", icon: Calendar, href: "/student-tools" },
  { label: "CGPA Calculator", desc: "Calculate your GPA", icon: BarChart3, href: "/student-tools" },
  { label: "Ask POLY AI", desc: "Instant study help", icon: Bot, href: "/ask-ai" },
  { label: "Mock Exams", desc: "Practice with MCQ tests", icon: ClipboardList, href: "/mock-exams" },
];

/* ─── Components ─── */

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    notes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    paper: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    syllabus: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  const labels: Record<string, string> = { notes: "Notes", paper: "Question Paper", syllabus: "Syllabus" };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[type] ?? styles.notes}`}>
      {labels[type] ?? type}
    </span>
  );
}

/* ─── Main ─── */

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSem, setSelectedSem] = useState<number | null>(null);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = user?.name || user?.email?.split("@")[0] || "Student";

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return recentMaterials
      .concat(featuredMaterials.map((m) => ({ ...m, time: "", pages: 0, stars: 0 })))
      .filter((m) => m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.dept.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col" style={{ width: "100vw", maxWidth: "100vw" }}>
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
                placeholder="Search subjects, notes, papers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground
                           placeholder:text-muted-foreground/60 outline-none transition-all
                           focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold cursor-pointer"
                onClick={() => navigate("/dashboard")}
                title={name}
              >
                {name[0].toUpperCase()}
              </div>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer"
              >
                Open Study Space
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Mobile Search ─── */}
      <div className="md:hidden w-full px-4 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subjects, notes, papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground
                       placeholder:text-muted-foreground/60 outline-none transition-all
                       focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* ─── Search Results ─── */}
      {search.trim() ? (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center justify-between mb-5">
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
                {searchResults.map((r, i) => (
                  <motion.div
                    key={`${r.title}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => navigate("/question-papers")}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.dept} · Sem {r.semester}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* ─── Main Content (full width) ─── */
        <div className="w-full px-4 sm:px-6 lg:px-10">
          {/* ─── Hero ─── */}
          <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/[0.05] blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/[0.04] blur-3xl" />
            </div>
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="relative">
              <motion.div variants={fadeIn}>
                <p className="text-sm font-medium text-primary/80 mb-1.5">{greeting()}, {name}</p>
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                Your Polytechnic Study Space
              </motion.h1>
              <motion.p variants={fadeIn} className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                Browse subjects, access study materials, review question papers, and track your
                academic progress — all organized by department and semester.
              </motion.p>
              <motion.div variants={fadeIn} className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer">
                  Go to Study Space →
                </button>
                <button onClick={() => { const el = document.getElementById("departments"); el?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:border-primary/20 transition-all cursor-pointer">
                  Browse Departments
                </button>
                <button onClick={() => navigate("/ask-ai")} className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:border-primary/20 transition-all cursor-pointer">
                  Ask POLY AI
                </button>
              </motion.div>
            </motion.div>
          </section>

          {/* ─── Department / Semester Selector ─── */}
          <section id="departments" className="pb-8 scroll-mt-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
              <motion.div variants={fadeIn} className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold">Browse by Department</h2>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  const isActive = selectedDept === dept.abbr;
                  return (
                    <motion.button
                      key={dept.abbr}
                      variants={fadeIn}
                      onClick={() => { setSelectedDept(isActive ? null : dept.abbr); setSelectedSem(null); }}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-300 cursor-pointer overflow-hidden ${isActive ? "border-primary/30 bg-primary/[0.06]" : "border-border bg-card hover:border-primary/15 hover:bg-card/80"}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${dept.color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">{dept.abbr}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{dept.semesters.length} sems · {dept.totalSubjects} subj</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {selectedDept && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-1">Semester:</span>
                  {departments.find((d) => d.abbr === selectedDept)?.semesters.map((s) => (
                    <button key={s} onClick={() => setSelectedSem(selectedSem === s ? null : s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${selectedSem === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"}`}>
                      Semester {s}
                    </button>
                  ))}
                  {selectedSem && (
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="ml-2 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      View subjects <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </section>

          {/* ─── Quick Access Cards ─── */}
          <section className="pb-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
              <motion.div variants={fadeIn} className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Bookmark className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold">Study Resources</h2>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { icon: Layers, label: "Subjects", desc: "Browse all subjects across departments and semesters", color: "from-blue-500/15 to-indigo-500/10 text-blue-500", count: "100+ Subjects", href: "/dashboard" },
                  { icon: FileText, label: "Syllabus", desc: "Complete curriculum for Revision 2026 & 2021", color: "from-emerald-500/15 to-teal-500/10 text-emerald-500", count: "6 Departments", href: "/question-papers" },
                  { icon: Library, label: "Question Papers", desc: "Previous year papers with answer keys and solutions", color: "from-violet-500/15 to-purple-500/10 text-violet-500", count: "200+ Papers", href: "/question-papers" },
                ].map((card) => (
                  <motion.div
                    key={card.label}
                    variants={fadeIn}
                    className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/15 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => navigate(card.href)}
                  >
                    <div className="relative">
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">{card.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                      <p className="text-[11px] text-primary/80 font-medium mt-2.5">{card.count}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ─── Featured Materials ─── */}
          <section className="pb-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
              <motion.div variants={fadeIn} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Star className="h-4 w-4 text-primary" /></div>
                  <h2 className="text-base font-semibold">Featured Materials</h2>
                </div>
                <button onClick={() => navigate("/dashboard")} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
                {featuredMaterials.map((mat) => (
                  <motion.div
                    key={mat.title}
                    variants={fadeIn}
                    className="group rounded-xl border border-border bg-card p-4 hover:border-primary/15 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate("/dashboard")}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <TypeBadge type={mat.type} />
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Star className="h-3 w-3 text-amber-500/70" />{mat.stars}</div>
                    </div>
                    <h3 className="font-medium text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{mat.title}</h3>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground">{mat.dept} · Sem {mat.semester}</p>
                      <p className="text-[11px] text-muted-foreground/70">{mat.pages} pages</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ─── Recently Viewed ─── */}
          <section className="pb-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
              <motion.div variants={fadeIn} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Clock className="h-4 w-4 text-primary" /></div>
                  <h2 className="text-base font-semibold">Recently Viewed</h2>
                </div>
                <button onClick={() => navigate("/dashboard")} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </motion.div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {recentMaterials.map((mat, i) => (
                  <motion.div
                    key={`${mat.title}-${i}`}
                    variants={fadeIn}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/15 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate("/dashboard")}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{mat.title}</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <TypeBadge type={mat.type} />
                        <span className="text-[11px] text-muted-foreground">{mat.dept} · Sem {mat.semester}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{mat.time}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ─── Quick Academic Access ─── */}
          <section className="pb-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
              <motion.div variants={fadeIn} className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Compass className="h-4 w-4 text-primary" /></div>
                <h2 className="text-base font-semibold">Quick Academic Access</h2>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {quickLinks.map((link) => (
                  <motion.div
                    key={link.label}
                    variants={fadeIn}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/15 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(link.href)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary/80 transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary group-hover:scale-105">
                      <link.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">{link.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{link.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="mt-auto w-full border-t border-border bg-muted/30">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10"><BookOpen className="h-3 w-3 text-primary" /></div>
              <span className="text-xs font-semibold text-foreground/80 tracking-tight">Polytechnic Study Materials</span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              Revision 2026 &amp; 2021 · Kerala Polytechnic Curriculum
              <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
