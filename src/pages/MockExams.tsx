import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

type Exam = {
  _id: string;
  title: string;
  subjectId: string;
  semester: number;
  questionCount: number;
  durationMinutes: number;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
};

export default function MockExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Show exams by semester
  const [selectedSem, setSelectedSem] = useState<number | null>(null);

  const semesters = useQuery(api.mockExams.listBySemester, selectedSem !== null ? { semester: selectedSem } : "skip");
  const allExamIds = [2, 3, 4, 5, 6].map((s) => ({ sem: s, exams: useQuery(api.mockExams.listBySemester, { semester: s }) }));
  const allExams = allExamIds.flatMap((e) => e.exams ?? []);

  const filteredExams = selectedSem !== null
    ? (semesters ?? [])
    : allExams;

  const submitAttempt = useMutation(api.mockExams.submitAttempt);

  const startExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentQ(0);
    setAnswers(new Array(exam.questions.length).fill(null));
    setSubmitted(false);
    setScore(0);
  };

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const finishExam = async () => {
    if (!activeExam || !user) return;
    let s = 0;
    for (let i = 0; i < activeExam.questions.length; i++) {
      if (answers[i] === activeExam.questions[i].correctIndex) s++;
    }
    setScore(s);
    setSubmitted(true);
    try {
      await submitAttempt({
        userId: user._id,
        mockExamId: activeExam._id as any,
        answers: answers.map((a) => a ?? -1),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Exam view
  if (activeExam) {
    const q = activeExam.questions[currentQ];
    const answered = answers.filter((a) => a !== null).length;
    const total = activeExam.questions.length;

    if (submitted) {
      const percentage = Math.round((score / total) * 100);
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
              <button onClick={() => { setActiveExam(null); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4" /> Back to Exams
              </button>
            </div>
          </nav>
          <div className="flex-1 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }} className="text-center max-w-md w-full">
              <div className="flex justify-center mb-4">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${percentage >= 60 ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                  <Trophy className={`h-10 w-10 ${percentage >= 60 ? "text-emerald-600" : "text-rose-600"}`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Exam Complete!</h2>
              <p className="mt-2 text-muted-foreground">You scored {score} out of {total}</p>
              <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-4xl font-bold text-foreground">{percentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {percentage >= 80 ? "Excellent work! 🌟" : percentage >= 60 ? "Good job! Keep practicing. 💪" : "Keep studying, you'll get there! 📚"}
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {score} Correct</span>
                  <span className="flex items-center gap-1 text-rose-600"><XCircle className="h-4 w-4" /> {total - score} Wrong</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                <button onClick={() => startExam(activeExam)} className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer">
                  <RotateCcw className="h-4 w-4" /> Retake
                </button>
                <button onClick={() => setActiveExam(null)} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all cursor-pointer">
                  All Exams
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <button onClick={() => { setActiveExam(null); setCurrentQ(0); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Exit
            </button>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {activeExam.durationMinutes} min</span>
              <span className="font-medium text-foreground">{answered}/{total}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-border">
            <motion.div className="h-full bg-primary" initial={false} animate={{ width: `${((currentQ + 1) / total) * 100}%` }} transition={{ duration: 0.3, ease }} />
          </div>
        </nav>

        <div className="flex-1 mx-auto max-w-2xl px-4 py-8">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease }}>
            <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {total}</p>
            <h3 className="text-lg font-semibold text-foreground leading-relaxed mb-6">{q.question}</h3>
            <div className="space-y-2.5">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => selectAnswer(currentQ, oi)}
                  className={`w-full text-left rounded-xl border px-5 py-4 text-sm transition-all cursor-pointer ${
                    answers[currentQ] === oi
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-current text-xs font-bold mr-3 shrink-0">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
            <button disabled={currentQ === 0} onClick={() => setCurrentQ((c) => c - 1)} className="rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Previous
            </button>
            {currentQ === total - 1 ? (
              <button onClick={finishExam} disabled={answered < total} className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                Submit Exam
              </button>
            ) : (
              <button onClick={() => setCurrentQ((c) => c + 1)} className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Exam listing
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
                <FileText className="h-4 w-4 text-rose-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">Mock Exams</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {/* Semester filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setSelectedSem(null)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${selectedSem === null ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"}`}>
            All
          </button>
          {[2, 3, 4, 5, 6].map((s) => (
            <button key={s} onClick={() => setSelectedSem(s)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${selectedSem === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"}`}>
              Semester {s}
            </button>
          ))}
        </div>

        {/* Exam cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredExams.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-border/60 bg-card p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                {selectedSem !== null ? `No exams available for Semester ${selectedSem} yet.` : "No exams available yet."}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">Check back later or browse other semesters.</p>
            </div>
          )}
          {filteredExams.map((exam) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="group rounded-xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => startExam(exam as Exam)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] text-muted-foreground bg-muted/70 rounded-md px-2 py-0.5">
                  Sem {exam.semester}
                </span>
              </div>
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{exam.title}</h3>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {exam.questionCount} Qs</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.durationMinutes} min</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Start Exam →</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
