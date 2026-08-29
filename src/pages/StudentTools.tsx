/*
 * ============================================================
 * FILE: StudentTools.tsx
 * PURPOSE: Provides browser-local CGPA, attendance, timetable, and study-planning utilities.
 * ============================================================
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Calendar,
  Compass,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const tools = [
  { id: "cgpa", label: "CGPA Calculator", desc: "Calculate your GPA and cumulative GPA", icon: BarChart3, color: "bg-blue-100 text-blue-600" },
  { id: "attendance", label: "Attendance Tracker", desc: "Track your attendance percentage", icon: Clock, color: "bg-emerald-100 text-emerald-600" },
  { id: "timetable", label: "Exam Timetable", desc: "Plan your exam schedule", icon: Calendar, color: "bg-amber-100 text-amber-600" },
  { id: "planner", label: "Study Planner", desc: "Organize your study routine", icon: Compass, color: "bg-violet-100 text-violet-600" },
];

const gradePoints: Record<string, number> = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, F: 0 };

/* ── CGPA Calculator ── */
function CGPACalculator() {
  const [subjects, setSubjects] = useState<{ name: string; credits: number; grade: string }[]>([
    { name: "", credits: 3, grade: "A" },
  ]);

  const addSubject = () => setSubjects([...subjects, { name: "", credits: 3, grade: "A" }]);
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string | number) => {
    const updated = [...subjects];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[i] as any)[field] = value;
    setSubjects(updated);
  };

  const result = (() => {
    let totalPoints = 0, totalCredits = 0;
    for (const s of subjects) {
      const gp = gradePoints[s.grade] ?? 0;
      totalPoints += gp * s.credits;
      totalCredits += s.credits;
    }
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "—";
  })();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="space-y-3 mb-4">
        {subjects.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={s.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Subject name"
              className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30"
            />
            <select
              value={s.credits}
              onChange={(e) => update(i, "credits", parseInt(e.target.value))}
              className="w-16 rounded-lg border border-border/60 bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-primary/30"
            >
              {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={s.grade}
              onChange={(e) => update(i, "grade", e.target.value)}
              className="w-20 rounded-lg border border-border/60 bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-primary/30"
            >
              {Object.keys(gradePoints).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {subjects.length > 1 && (
              <button onClick={() => removeSubject(i)} className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addSubject} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer mb-4">
        <Plus className="h-3.5 w-3.5" /> Add Subject
      </button>
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
        <p className="text-xs text-muted-foreground">Your GPA</p>
        <p className="text-3xl font-bold text-foreground mt-1">{result}</p>
      </div>
    </div>
  );
}

/* ── Attendance Tracker ── */
function AttendanceTracker() {
  const [total, setTotal] = useState(60);
  const [attended, setAttended] = useState(50);

  const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : "0";
  const needFor75 = Math.max(0, Math.ceil(total * 0.75) - attended);
  const safeToBunk = Math.max(0, Math.floor((attended - total * 0.75) / 0.75));

  const isAbove75 = parseFloat(percentage) >= 75;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Total Classes</label>
          <input type="number" value={total} onChange={(e) => setTotal(parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/30" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Classes Attended</label>
          <input type="number" value={attended} onChange={(e) => setAttended(parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/30" />
        </div>
      </div>
      <div className="text-center mb-6">
        <p className="text-xs text-muted-foreground">Attendance</p>
        <p className={`text-4xl font-bold mt-1 ${isAbove75 ? "text-emerald-600" : "text-rose-600"}`}>{percentage}%</p>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${isAbove75 ? "bg-emerald-500" : "bg-rose-500"}`}
            style={{ width: `${Math.min(100, parseFloat(percentage))}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Need for 75%</p>
          <p className="text-lg font-bold text-foreground">{needFor75 > 0 ? needFor75 : "✓ Met"}</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Safe to skip</p>
          <p className="text-lg font-bold text-foreground">{safeToBunk}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Exam Timetable ── */
function ExamTimetable() {
  const [exams, setExams] = useState<{ subject: string; date: string; time: string }[]>([
    { subject: "", date: "", time: "" },
  ]);
  const addExam = () => setExams([...exams, { subject: "", date: "", time: "" }]);
  const removeExam = (i: number) => setExams(exams.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string) => {
    const updated = [...exams];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[i] as any)[field] = value;
    setExams(updated);
  };

  const sorted = [...exams].filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="space-y-2 mb-4">
        {exams.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={e.subject} onChange={(ev) => update(i, "subject", ev.target.value)} placeholder="Subject"
              className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30" />
            <input type="date" value={e.date} onChange={(ev) => update(i, "date", ev.target.value)}
              className="rounded-lg border border-border/60 bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-primary/30" />
            <input type="time" value={e.time} onChange={(ev) => update(i, "time", ev.target.value)}
              className="rounded-lg border border-border/60 bg-background px-2 py-2 text-sm text-foreground outline-none focus:border-primary/30" />
            {exams.length > 1 && (
              <button onClick={() => removeExam(i)} className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addExam} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer mb-4">
        <Plus className="h-3.5 w-3.5" /> Add Exam
      </button>
      {sorted.length > 0 && sorted[0].subject && (
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <p className="text-xs text-muted-foreground mb-2">Upcoming</p>
          {sorted.map((e, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{e.subject}</span>
              <span className="text-xs text-muted-foreground ml-auto">{e.date} {e.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Study Planner ── */
function StudyPlanner() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const update = (day: string, value: string) => setSchedule({ ...schedule, [day]: value });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="space-y-3">
        {days.map((day) => (
          <div key={day} className="flex items-start gap-3">
            <span className="w-24 shrink-0 text-xs font-medium text-foreground pt-2">{day}</span>
            <textarea
              value={schedule[day] ?? ""}
              onChange={(e) => update(day, e.target.value)}
              placeholder="What to study..."
              rows={2}
              className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30 resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function StudentTools() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => activeTool ? setActiveTool(null) : navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <BarChart3 className="h-4 w-4 text-cyan-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">Student Tools</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6 mx-auto">
        {activeTool === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease }}
                  onClick={() => setActiveTool(tool.id)}
                  className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 text-left
                           shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
            <h2 className="text-lg font-bold text-foreground mb-4">{tools.find((t) => t.id === activeTool)?.label}</h2>
            {activeTool === "cgpa" && <CGPACalculator />}
            {activeTool === "attendance" && <AttendanceTracker />}
            {activeTool === "timetable" && <ExamTimetable />}
            {activeTool === "planner" && <StudyPlanner />}
          </motion.div>
        )}
      </div>
    </div>
  );
}
