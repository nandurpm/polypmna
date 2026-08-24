import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  LogOut,
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  Download,
  Users,
  BarChart3,
  Building2,
  Hash,
  ArrowRight,
  MessageCircle,
  Library,
  Layers,
} from "lucide-react";
import {
  type LucideIcon,
  BookMarked,
  Compass,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                  DATA                                      */
/* -------------------------------------------------------------------------- */

const departments = [
  {
    name: "Computer Engineering",
    icon: Layers,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    iconColor: "text-blue-600",
    semesters: [
      { num: 2, subjects: ["Problem Solving & Programming", "Fundamentals of Electrical & Electronics Engg"] },
      { num: 3, subjects: ["Computer Organisation", "Programming in C", "Database Management Systems", "Digital Computer Fundamentals", "Web Technology Lab"] },
      { num: 4, subjects: ["Object Oriented Programming", "Computer Communication and Networks", "Data Structures"] },
      { num: 5, subjects: ["Project Management & Software Engineering", "Embedded System & Real-time OS", "Operating System", "Virtualization & Cloud Computing"] },
      { num: 6, subjects: ["Introduction to IoT", "Machine Learning", "Cyber Security", "Web Application Development", "Mobile App Development"] },
    ],
  },
  {
    name: "Civil Engineering",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    iconColor: "text-emerald-600",
    semesters: [
      { num: 2, subjects: ["Engineering Mechanics", "Basic Survey"] },
      { num: 3, subjects: ["Advanced Surveying", "Concrete Technology", "Building Construction & Materials", "Theory of Structures"] },
      { num: 4, subjects: ["Geotechnical Engineering", "Hydraulics & Irrigation Engineering", "Estimating & Costing"] },
      { num: 5, subjects: ["Transportation Engineering", "Design of Steel & RCC Structures", "Construction Management & Safety", "Habitat Technology"] },
      { num: 6, subjects: ["Public Health Engineering", "Environmental Engineering", "Quantity Surveying", "Construction Planning", "Remote Sensing & GIS"] },
    ],
  },
  {
    name: "Mechanical Engineering",
    icon: Compass,
    color: "from-orange-500 to-red-500",
    bgLight: "bg-orange-50",
    iconColor: "text-orange-600",
    semesters: [
      { num: 2, subjects: ["Manufacturing Technology", "Engineering Mechanics"] },
      { num: 3, subjects: ["Strength of Materials", "Material Science & Metrology", "Machine Tools", "Fundamentals of Electrical Engineering"] },
      { num: 4, subjects: ["Thermal Engineering", "Fluid Mechanics & Hydraulic Machines", "Automobile Engineering", "Industrial Engineering"] },
      { num: 5, subjects: ["Industrial Management & Safety", "Design of Machine Elements", "Refrigeration & Air Conditioning", "Modern Production Processes"] },
      { num: 6, subjects: ["Mechatronics", "CNC Programming", "Composite Materials", "Energy Conservation", "Total Quality Management"] },
    ],
  },
  {
    name: "Electronics Engineering",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    iconColor: "text-violet-600",
    semesters: [
      { num: 2, subjects: ["Engineering Mechanics", "Fundamentals of Electrical Engg"] },
      { num: 3, subjects: ["Electric Circuits & Networks", "Principles of Electronic Communication", "Electronic Circuits", "Digital Electronics", "Fundamentals of C Programming"] },
      { num: 4, subjects: ["Microcontroller & Applications", "Electronic Measurements & Instrumentation", "Linear Integrated Circuits"] },
      { num: 5, subjects: ["Industrial Management & Safety", "Embedded Systems", "Industrial Automation", "Digital Communication"] },
      { num: 6, subjects: ["Verilog HDL & PLC", "VLSI Design", "Robotics & Automation", "IoT & Edge Computing", "Advanced Communication Systems"] },
    ],
  },
  {
    name: "Electrical & Electronics",
    icon: BarChart3,
    color: "from-amber-500 to-yellow-500",
    bgLight: "bg-amber-50",
    iconColor: "text-amber-600",
    semesters: [
      { num: 2, subjects: ["Elementary Concepts of Electrical System"] },
      { num: 3, subjects: ["Analog & Digital Circuits", "DC Machines & Traction Motors", "Fundamentals of Electric Circuits", "Electrical & Electronics Measuring Instruments"] },
      { num: 4, subjects: ["Power Electronics Devices & Circuits", "Electrical Installation Design & Estimation", "Induction Machines"] },
      { num: 5, subjects: ["Industrial Management & Safety", "Synchronous Machines & FHP Motors", "Electricity Generation, Transmission & Distribution", "Switchgear & Protection"] },
      { num: 6, subjects: ["Microcontroller & PLC", "Renewable Energy Systems", "Electric Drives", "Power System Analysis", "Smart Grid Technology"] },
    ],
  },
  {
    name: "Automobile Engineering",
    icon: GraduationCap,
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    iconColor: "text-rose-600",
    semesters: [
      { num: 2, subjects: ["Engineering Mechanics"] },
      { num: 3, subjects: ["Fundamentals of Fluid Mechanics", "Manufacturing Technology for Automobile Components", "Automobile Electrical & Electronics Systems", "Internal Combustion Engines"] },
      { num: 4, subjects: ["Heat Power Engineering", "Material Science & Strength of Materials", "Automobile Chassis & Transmission"] },
      { num: 5, subjects: ["Industrial Management & Safety", "Design of Automotive Components", "Vehicle Diagnostics & Service", "Two & Three Wheeler Technology"] },
      { num: 6, subjects: ["Electric & Hybrid Vehicles", "Automobile Fault Diagnosis", "Emission Control & Testing", "Two Wheeler Technology", "Advanced Engine Technology"] },
    ],
  },
];

const quickActions = [
  { label: "Subject Search", desc: "Browse all departments & subjects", icon: Search, color: "bg-indigo-100 text-indigo-600", href: "#departments" },
  { label: "Study Notes", desc: "Chapter-wise notes & materials", icon: BookOpen, color: "bg-emerald-100 text-emerald-600", href: "#notes" },
  { label: "Ask POLY AI", desc: "AI-powered doubt clearing", icon: Brain, color: "bg-amber-100 text-amber-600", href: "#ai" },
  { label: "Mock Exams", desc: "Practice tests & assessments", icon: FileText, color: "bg-rose-100 text-rose-600", href: "#mock" },
  { label: "Question Papers", desc: "Previous year papers with solutions", icon: Library, color: "bg-violet-100 text-violet-600", href: "#papers" },
  { label: "Tools", desc: "CGPA calculator & utilities", icon: Calendar, color: "bg-cyan-100 text-cyan-600", href: "#tools" },
];

const stats = [
  { label: "Departments", value: "6", icon: Building2 },
  { label: "Study Notes", value: "250+", icon: BookMarked },
  { label: "AI Assistant", value: "24/7", icon: Brain },
  { label: "Mock Tests", value: "100+", icon: BarChart3 },
];

/* -------------------------------------------------------------------------- */
/*                              ANIMATION                                      */
/* -------------------------------------------------------------------------- */

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* -------------------------------------------------------------------------- */
/*                            COMPONENTS                                      */
/* -------------------------------------------------------------------------- */

function DepartmentCard({
  dept,
  onClick,
}: {
  dept: (typeof departments)[number];
  onClick: () => void;
}) {
  const Icon = dept.icon;
  const totalSubjects = dept.semesters.reduce((a, s) => a + s.subjects.length, 0);

  return (
    <motion.button
      variants={fadeIn}
      className="group relative w-full text-left rounded-2xl border border-border/60 bg-card p-6 shadow-sm
                 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Gradient glow */}
      <div
        className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${dept.color} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
      />

      <div className="relative flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${dept.bgLight} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${dept.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
            {dept.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {dept.semesters.length} semesters · {totalSubjects} subjects
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {dept.semesters.map((s) => (
              <span
                key={s.num}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                Sem {s.num}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </motion.button>
  );
}

function FeatureHighlight({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300"
    >
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${color} mb-4 transition-transform duration-300 group-hover:scale-105`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground text-[15px]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             MAIN DASHBOARD                                 */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [selectedSem, setSelectedSem] = useState<number | null>(null);

  const dept = selectedDept !== null ? departments[selectedDept] : null;

  const filteredSemesters = useMemo(() => {
    if (!dept) return [];
    if (selectedSem !== null) {
      return dept.semesters.filter((s) => s.num === selectedSem);
    }
    return dept.semesters;
  }, [dept, selectedSem]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: { dept: string; semester: number; subject: string }[] = [];
    for (const d of departments) {
      for (const s of d.semesters) {
        for (const subj of s.subjects) {
          if (subj.toLowerCase().includes(q)) {
            results.push({ dept: d.name, semester: s.num, subject: subj });
          }
        }
      }
    }
    return results;
  }, [search]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ──────────────────────── NAVIGATION ──────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[15px] font-semibold text-foreground tracking-tight">
              Polytechnic Study Materials
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search subjects, notes, question papers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) {
                    setSelectedDept(null);
                    setSelectedSem(null);
                  }
                }}
                className="w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground
                           placeholder:text-muted-foreground/70 outline-none transition-all
                           focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                {user?.name || user?.email?.split("@")[0] || "Student"}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex h-9 items-center gap-2 rounded-lg border border-border/60 px-3 text-sm text-muted-foreground
                         transition-all hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ──────────────────────── MOBILE SEARCH ──────────────────────── */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subjects, notes, question papers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) {
                setSelectedDept(null);
                setSelectedSem(null);
              }
            }}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground
                       placeholder:text-muted-foreground/70 outline-none transition-all
                       focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* ──────────────────────── SEARCH RESULTS ──────────────────────── */}
      {search.trim() && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Search Results
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({searchResults.length} {searchResults.length === 1 ? "result" : "results"})
                </span>
              </h2>
              <button
                onClick={() => setSearch("")}
                className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Clear search
              </button>
            </div>
            {searchResults.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No results found for "{search}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try searching for a different subject name</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {searchResults.map((r, i) => (
                  <motion.div
                    key={`${r.dept}-${r.semester}-${r.subject}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="group flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-3.5 hover:border-primary/20 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{r.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.dept} · Semester {r.semester}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ──────────────────────── HERO ──────────────────────── */}
      {!search.trim() && (
        <section className="relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/[0.06] to-accent/[0.04] blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-primary/[0.04] to-transparent blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
              {/* Greeting */}
              <motion.div variants={fadeIn}>
                <p className="text-sm font-medium text-primary/80 mb-1">
                  {greetingTime()}, {user?.name || "Student"}
                </p>
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight max-w-2xl"
              >
                Your Study Hub for{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Kerala Polytechnic
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
              >
                Notes, question papers, mock exams, and AI-powered doubt clearing — everything you need for Revision 2026 & 2021 syllabus.
              </motion.p>

              {/* Stats */}
              <motion.div
                variants={fadeIn}
                className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ──────────────────────── QUICK ACTIONS ──────────────────────── */}
      {!search.trim() && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {quickActions.map((action) => (
              <motion.a
                key={action.label}
                href={action.href}
                variants={fadeIn}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border/50 bg-card p-5 text-center
                           shadow-sm hover:shadow-md hover:border-primary/15 transition-all duration-300"
                onClick={(e) => {
                  if (action.href.startsWith("#")) {
                    e.preventDefault();
                    const el = document.getElementById(action.href.slice(1));
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} transition-transform duration-300 group-hover:scale-110`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{action.desc}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── DEPARTMENTS ──────────────────────── */}
      {!search.trim() && (
        <section id="departments" className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 scroll-mt-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Browse by Department</h2>
                <p className="text-sm text-muted-foreground">Select a department to explore subjects</p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {departments.map((deptItem, i) => (
                <DepartmentCard
                  key={deptItem.name}
                  dept={deptItem}
                  onClick={() => {
                    setSelectedDept(i);
                    setSelectedSem(null);
                    setSearch("");
                  }}
                />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── DEPARTMENT SUBJECTS ──────────────────────── */}
      {dept && !search.trim() && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 scroll-mt-20">
          <motion.div
            key={dept.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedDept(null);
                    setSelectedSem(null);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${dept.bgLight}`}>
                  <dept.icon className={`h-5 w-5 ${dept.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{dept.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {dept.semesters.reduce((a, s) => a + s.subjects.length, 0)} subjects across{" "}
                    {dept.semesters.length} semesters
                  </p>
                </div>
              </div>
            </div>

            {/* Semester tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
              <button
                onClick={() => setSelectedSem(null)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  selectedSem === null
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}
              >
                All Semesters
              </button>
              {dept.semesters.map((s) => (
                <button
                  key={s.num}
                  onClick={() => setSelectedSem(s.num)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    selectedSem === s.num
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  Semester {s.num}
                </button>
              ))}
            </div>

            {/* Subjects */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSemesters.map((semester) =>
                semester.subjects.map((subject, si) => (
                  <motion.div
                    key={`${semester.num}-${subject}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.03, duration: 0.3 }}
                    className="group flex items-center gap-3.5 rounded-xl border border-border/50 bg-card px-5 py-4
                               shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-110">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Hash className="h-3 w-3" />
                        Semester {semester.num}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── FEATURE HIGHLIGHTS ──────────────────────── */}
      {!search.trim() && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Everything You Need</h2>
                <p className="text-sm text-muted-foreground">Comprehensive tools for your polytechnic journey</p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <FeatureHighlight
                icon={BookOpen}
                title="Chapter-wise Study Notes"
                desc="Comprehensive notes covering every topic in the Kerala Polytechnic syllabus — Revision 2026 & 2021."
                color="bg-emerald-100 text-emerald-600"
              />
              <FeatureHighlight
                icon={Brain}
                title="Ask POLY AI"
                desc="Stuck on a concept? Our AI assistant explains topics in simple language and helps you learn faster."
                color="bg-amber-100 text-amber-600"
              />
              <FeatureHighlight
                icon={FileText}
                title="Mock Exams & Tests"
                desc="Practice with chapter-wise and semester-wise mock tests to ace your exams with confidence."
                color="bg-rose-100 text-rose-600"
              />
              <FeatureHighlight
                icon={Library}
                title="Previous Year Papers"
                desc="Access a curated collection of previous year question papers with solutions for all departments."
                color="bg-violet-100 text-violet-600"
              />
              <FeatureHighlight
                icon={MessageCircle}
                title="Revision 2026 & 2021"
                desc="Study materials aligned with the latest Kerala Polytechnic curriculum and revised syllabus."
                color="bg-cyan-100 text-cyan-600"
              />
              <FeatureHighlight
                icon={Calendar}
                title="Student Tools"
                desc="CGPA calculator, attendance tracker, exam timetable planner, and more utilities for students."
                color="bg-indigo-100 text-indigo-600"
              />
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── AI ASSISTANT CTA ──────────────────────── */}
      {!search.trim() && (
        <section id="ai" className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary/95 to-[oklch(0.35_0.15_270)] p-8 sm:p-10"
          >
            {/* Decorative orbs */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-card/[0.06] blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/[0.12] blur-3xl" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-card/15 backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ask POLY AI</h3>
                <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed max-w-lg">
                  Your personal AI study buddy — ask doubts, get explanations, practice problems, and understand concepts in Malayalam or English.
                </p>
              </div>
              <button className="shrink-0 flex items-center gap-2 rounded-xl bg-card/15 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white
                                 hover:bg-card/25 transition-all duration-300 cursor-pointer">
                Try Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── QUESTION PAPERS ──────────────────────── */}
      {!search.trim() && (
        <section id="papers" className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 scroll-mt-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <Library className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Question Papers</h2>
                <p className="text-sm text-muted-foreground">Previous year papers with answer keys</p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {["Semester 2", "Semester 3", "Semester 4", "Semester 5"].map((sem) => (
                <motion.a
                  key={sem}
                  variants={fadeIn}
                  href="#"
                  className="group flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4
                             shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-transform duration-300 group-hover:scale-110">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{sem}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">All departments</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── TOOLS ──────────────────────── */}
      {!search.trim() && (
        <section id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 scroll-mt-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Student Tools</h2>
                <p className="text-sm text-muted-foreground">Useful utilities for your academic journey</p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: "CGPA Calculator", desc: "Calculate your GPA and CGPA", icon: BarChart3 },
                { title: "Attendance Tracker", desc: "Track your attendance", icon: Clock },
                { title: "Exam Timetable", desc: "Plan your exam schedule", icon: Calendar },
                { title: "Study Planner", desc: "Organize your study routine", icon: Compass },
              ].map((tool) => (
                <motion.a
                  key={tool.title}
                  variants={fadeIn}
                  href="#"
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-6
                             shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 transition-transform duration-300 group-hover:scale-110">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── RECENT ACTIVITY ──────────────────────── */}
      {!search.trim() && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Recently Added</h2>
                <p className="text-sm text-muted-foreground">Fresh study materials and updates</p>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: "Programming in C — Chapter 5: Arrays & Pointers", dept: "Computer Engineering", time: "2 hours ago", type: "notes" },
                { title: "Mock Test: Data Structures — Mid Semester", dept: "Computer Engineering", time: "5 hours ago", type: "mock" },
                { title: "Previous Year: Database Management Systems — Dec 2024", dept: "Computer Engineering", time: "1 day ago", type: "paper" },
                { title: "Strength of Materials — Unit 3: Shear Force & Bending Moment", dept: "Mechanical Engineering", time: "1 day ago", type: "notes" },
                { title: "Mock Test: Engineering Mechanics — End Semester", dept: "Civil Engineering", time: "2 days ago", type: "mock" },
                { title: "Digital Electronics — Revision Notes", dept: "Electronics Engineering", time: "3 days ago", type: "notes" },
              ].map((item, i) => {
                const typeColors: Record<string, string> = {
                  notes: "bg-emerald-50 text-emerald-600",
                  mock: "bg-rose-50 text-rose-600",
                  paper: "bg-violet-50 text-violet-600",
                };
                return (
                  <motion.div
                    key={i}
                    variants={fadeIn}
                    className="group flex items-start gap-3.5 rounded-xl border border-border/50 bg-card px-5 py-4
                               shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-110">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${typeColors[item.type]}`}>
                          {item.type === "notes" ? "Notes" : item.type === "mock" ? "Mock Test" : "Question Paper"}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.dept}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* ──────────────────────── FOOTER ──────────────────────── */}
      <footer className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <BookOpen className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground/80 tracking-tight">
                Polytechnic Study Materials
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Revision 2026 & 2021 · Notes · Mock Exams · AI Assistant · Question Papers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
