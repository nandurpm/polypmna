import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Brain,
  FileText,
  Search,
  ArrowRight,
  Building2,
  Library,
  Calendar,
  Sparkles,
  GraduationCap,
  Users,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
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

const features = [
  { icon: BookOpen, title: "Study Notes", desc: "Chapter-wise notes for every subject in the Kerala Polytechnic syllabus.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Brain, title: "Ask POLY AI", desc: "AI-powered doubt clearing — understand concepts in simple language.", color: "bg-amber-100 text-amber-600" },
  { icon: FileText, title: "Mock Exams", desc: "Practice with chapter-wise and semester-wise mock tests.", color: "bg-rose-100 text-rose-600" },
  { icon: Library, title: "Question Papers", desc: "Previous year papers with solutions for all departments.", color: "bg-violet-100 text-violet-600" },
  { icon: Calendar, title: "Student Tools", desc: "CGPA calculator, attendance tracker, and study planner.", color: "bg-cyan-100 text-cyan-600" },
  { icon: Search, title: "Subject Search", desc: "Quickly find any subject across all departments and semesters.", color: "bg-indigo-100 text-indigo-600" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.002_240)]">
      {/* ──── NAV ──── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              POLY<span className="text-primary">PMNA</span>
            </span>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground
                       hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* ──── HERO ──── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 -right-48 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/[0.07] to-accent/[0.05] blur-3xl" />
          <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-primary/[0.04] to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeIn} className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Revision 2026 & 2021 Syllabus
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
            >
              The Complete Study Hub for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Kerala Polytechnic
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              Notes, question papers, mock exams, AI-powered doubt clearing, and student tools — everything a polytechnic student needs, in one place.
            </motion.p>

            <motion.div variants={fadeIn} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground
                           hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-white px-7 py-3.5 text-sm font-medium text-foreground
                           hover:border-primary/20 hover:shadow-sm transition-all duration-300 cursor-pointer"
              >
                Explore Features
              </button>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={fadeIn} className="mt-12 flex items-center justify-center gap-6 sm:gap-8 text-muted-foreground/60">
              <div className="flex items-center gap-2 text-xs">
                <GraduationCap className="h-4 w-4" />
                <span>6 Departments</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-4 w-4" />
                <span>5000+ Students</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-4 w-4" />
                <span>All Semesters</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ──── FEATURES ──── */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              A comprehensive platform designed specifically for Kerala Polytechnic students.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeIn}
                className="group rounded-2xl border border-border/50 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color} mb-4 transition-transform duration-300 group-hover:scale-105`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground text-[15px]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ──── DEPARTMENTS ──── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <motion.div variants={fadeIn} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              All Departments Covered
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Study materials for every polytechnic engineering department.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Computer", color: "from-blue-500 to-indigo-600" },
              { name: "Civil", color: "from-emerald-500 to-teal-600" },
              { name: "Mechanical", color: "from-orange-500 to-red-500" },
              { name: "Electronics", color: "from-violet-500 to-purple-600" },
              { name: "EEE", color: "from-amber-500 to-yellow-500" },
              { name: "Automobile", color: "from-rose-500 to-pink-600" },
            ].map((dept) => (
              <motion.div
                key={dept.name}
                variants={fadeIn}
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-border/50 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${dept.color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-sm text-foreground">{dept.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ──── CTA ──── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary/95 to-[oklch(0.35_0.15_270)] p-10 sm:p-12 text-center"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/[0.12] blur-3xl" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to Ace Your Exams?</h2>
            <p className="mt-3 text-white/80 max-w-md mx-auto">
              Join thousands of polytechnic students using POLY PMNA to study smarter, not harder.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary
                         hover:bg-white/90 transition-all duration-300 shadow-sm cursor-pointer"
            >
              Get Started — It's Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-border/60 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground tracking-tight">
                  POLY<span className="text-primary">PMNA</span>
                </p>
                <p className="text-xs text-muted-foreground">Kerala Polytechnic Study Hub</p>
              </div>
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
