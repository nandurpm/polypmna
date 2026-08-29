/*
 * ============================================================
 * FILE: seed.ts
 * PURPOSE: Imports curriculum manifests from GitHub and seeds normalized departments, subjects, and materials into Convex.
 * ============================================================
 */

import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Department code prefix mapping (Kerala Polytechnic convention)
const deptByPrefix: Record<string, string> = {
  // Semester 2 common subjects
  "20": "CE", "21": "CE", "22": "CE",
  "23": "ME", "24": "ME", "25": "ME",
  "26": "ECE", "27": "ECE", "28": "ECE",
  "29": "EEE", "30": "EEE", "31": "EEE",
  "32": "AE", "33": "AE", "34": "AE",
  "35": "CSE", "36": "CSE", "37": "CSE",
};

// Subject code to department mapping for Rev 2026
const codeToDept: Record<string, string> = {
  // CSE subjects
  "8011": "CSE", "8012": "CSE", "8013": "CSE", "8014": "CSE", "8015": "CSE",
  "8021": "CSE", "8022": "CSE", "8023": "CSE", "8024": "CSE", "8025": "CSE",
  "8031": "CSE", "8032": "CSE", "8033": "CSE", "8034": "CSE", "8035": "CSE",
  "8041": "CSE", "8042": "CSE", "8043": "CSE", "8044": "CSE", "8045": "CSE",
  "8051": "CSE", "8052": "CSE", "8053": "CSE", "8054": "CSE", "8055": "CSE",
  // CE subjects
  "3011": "CE", "3012": "CE", "3013": "CE", "3014": "CE", "3015": "CE",
  "3021": "CE", "3022": "CE", "3023": "CE", "3024": "CE", "3025": "CE",
  "3031": "CE", "3032": "CE", "3033": "CE", "3034": "CE", "3035": "CE",
  "3041": "CE", "3042": "CE", "3043": "CE", "3044": "CE", "3045": "CE",
  "3051": "CE", "3052": "CE", "3053": "CE", "3054": "CE", "3055": "CE",
  // ME subjects
  "4011": "ME", "4012": "ME", "4013": "ME", "4014": "ME", "4015": "ME",
  "4021": "ME", "4022": "ME", "4023": "ME", "4024": "ME", "4025": "ME",
  "4031": "ME", "4032": "ME", "4033": "ME", "4034": "ME", "4035": "ME",
  "4041": "ME", "4042": "ME", "4043": "ME", "4044": "ME", "4045": "ME",
  "4051": "ME", "4052": "ME", "4053": "ME", "4054": "ME", "4055": "ME",
  // ECE subjects
  "5011": "ECE", "5012": "ECE", "5013": "ECE", "5014": "ECE", "5015": "ECE",
  "5021": "ECE", "5022": "ECE", "5023": "ECE", "5024": "ECE", "5025": "ECE",
  "5031": "ECE", "5032": "ECE", "5033": "ECE", "5034": "ECE", "5035": "ECE",
  "5041": "ECE", "5042": "ECE", "5043": "ECE", "5044": "ECE", "5045": "ECE",
  "5051": "ECE", "5052": "ECE", "5053": "ECE", "5054": "ECE", "5055": "ECE",
  // EEE subjects
  "6011": "EEE", "6012": "EEE", "6013": "EEE", "6014": "EEE", "6015": "EEE",
  "6021": "EEE", "6022": "EEE", "6023": "EEE", "6024": "EEE", "6025": "EEE",
  "6031": "EEE", "6032": "EEE", "6033": "EEE", "6034": "EEE", "6035": "EEE",
  "6041": "EEE", "6042": "EEE", "6043": "EEE", "6044": "EEE", "6045": "EEE",
  "6051": "EEE", "6052": "EEE", "6053": "EEE", "6054": "EEE", "6055": "EEE",
  // AE subjects
  "7011": "AE", "7012": "AE", "7013": "AE", "7014": "AE", "7015": "AE",
  "7021": "AE", "7022": "AE", "7023": "AE", "7024": "AE", "7025": "AE",
  "7031": "AE", "7032": "AE", "7033": "AE", "7034": "AE", "7035": "AE",
  "7041": "AE", "7042": "AE", "7043": "AE", "7044": "AE", "7045": "AE",
  "7051": "AE", "7052": "AE", "7053": "AE", "7054": "AE", "7055": "AE",
  // Semester 2 subjects by prefix
  "2011": "CE", "2012": "CE", "2018": "CE", "2019": "CE",
  "2021": "ME", "2022": "ME", "2028": "ME", "2029": "ME",
  "2031": "EEE", "2032": "EEE", "2038": "EEE", "2039": "EEE",
  "2041": "ECE", "2042": "ECE", "2048": "ECE", "2049": "ECE",
  "2051": "AE", "2052": "AE", "2058": "AE", "2059": "AE",
  "2061": "CSE", "2062": "CSE", "2068": "CSE", "2069": "CSE",
};

function getDept(code: string): string {
  if (codeToDept[code]) return codeToDept[code];
  const prefix2 = code.substring(0, 2);
  if (deptByPrefix[prefix2]) return deptByPrefix[prefix2];
  return "CSE"; // default
}

function getSemester(code: string): number {
  const num = parseInt(code);
  if (num < 2000) return 1;
  if (num < 3000) return 2;
  if (num < 4000) return 3;
  if (num < 5000) return 4;
  if (num < 6000) return 5;
  if (num < 7000) return 6;
  if (num < 8000) return 5;
  return 4;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^Course \d+[A-Z]?\s*[—–-]\s*/i, "")
    .replace(/^\d+[A-Z]?\s*[—–-]\s*/i, "")
    .replace(/\s*\|\s*Revision\s*\d+\s*\|\s*POLY PMNA/gi, "")
    .replace(/\s*\|\s*REV\d+\s*\|\s*POLY PMNA/gi, "")
    .replace(/\s*\|\s*POLY PMNA/gi, "")
    .replace(/\d+[A-Z]?\s*$/, (m) => m.trim())
    .trim();
}

export const seedFromGitHub = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("departments").first();
    if (existing) return "already_seeded";

    // Fetch manifest directly via HTTP
    const manifestUrl = "https://raw.githubusercontent.com/nandurpm/poly-pmna-pdf-files/main/manifests/notes-2026.json";
    const resp = await fetch(manifestUrl);
    if (!resp.ok) return "fetch_failed";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manifest = (await resp.json()) as any;

    // Create departments
    const deptData = [
      { name: "Computer Engineering", abbr: "CSE", icon: "layers", color: "from-blue-500 to-indigo-600", sortOrder: 1 },
      { name: "Civil Engineering", abbr: "CE", icon: "building2", color: "from-emerald-500 to-teal-600", sortOrder: 2 },
      { name: "Mechanical Engineering", abbr: "ME", icon: "compass", color: "from-orange-500 to-red-500", sortOrder: 3 },
      { name: "Electronics Engineering", abbr: "ECE", icon: "sparkles", color: "from-violet-500 to-purple-600", sortOrder: 4 },
      { name: "Electrical & Electronics", abbr: "EEE", icon: "barChart3", color: "from-amber-500 to-yellow-500", sortOrder: 5 },
      { name: "Automobile Engineering", abbr: "AE", icon: "graduationCap", color: "from-rose-500 to-pink-600", sortOrder: 6 },
    ];

    const deptIds = new Map<string, Id<"departments">>();
    for (const dept of deptData) {
      const id = await ctx.db.insert("departments", dept);
      deptIds.set(dept.abbr, id);
    }

    // Process subjects from manifest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjects = (manifest.subjects as any[]).filter((s: any) => s.status === "published");
    let subjectCount = 0;
    let materialCount = 0;

    for (const item of subjects) {
      const code: string = item.code;
      const dept = getDept(code);
      const semester = getSemester(code);
      const deptId = deptIds.get(dept);
      if (!deptId) continue;

      const title = cleanTitle(item.title);

      // Insert subject
      const subjectId = await ctx.db.insert("subjects", {
        name: title,
        departmentId: deptId,
        semester,
        code,
      });
      subjectCount++;

      // Insert material (notes PDF)
      await ctx.db.insert("materials", {
        title: `${title} — Study Notes`,
        subjectId,
        type: "notes",
        description: `Rev 2026 study notes for ${title}`,
        pageCount: item.pages ?? 20,
        stars: Math.floor(Math.random() * 50) + 10,
        fileUrl: item.pdfUrl,
        createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
      materialCount++;
    }

    // Seed question papers (sample for first 30 subjects)
    const sampleSubjects = subjects.slice(0, 30);
    for (const item of sampleSubjects) {
      const code: string = item.code;
      const dept = getDept(code);
      const deptId = deptIds.get(dept);
      if (!deptId) continue;

      // Find the subject we just created
      const subjectResults = await ctx.db
        .query("subjects")
        .withIndex("by_department", (q) => q.eq("departmentId", deptId))
        .collect();
      const subject = subjectResults.find((s) => s.code === code);
      if (!subject) continue;

      for (const year of [2023, 2024, 2025]) {
        for (const examType of ["mid", "end", "supply"] as const) {
          if (Math.random() > 0.5) continue;
          const label = examType === "mid" ? "Mid Semester" : examType === "end" ? "End Semester" : "Supplementary";
          await ctx.db.insert("questionPapers", {
            title: `${cleanTitle(item.title)} — ${label} ${year}`,
            subjectId: subject._id,
            year,
            examType,
            createdAt: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
          });
        }
      }
    }

    // Seed mock exams (5 per department)
    const sampleQuestions = [
      { question: "Which data structure uses FIFO (First In, First Out) principle?", options: ["Stack", "Queue", "Tree", "Graph"], correctIndex: 1, explanation: "A Queue follows FIFO." },
      { question: "What is the time complexity of binary search?", options: ["O(n)", "O(n\u00b2)", "O(log n)", "O(1)"], correctIndex: 2, explanation: "Binary search halves the space each step." },
      { question: "What does DDL stand for in databases?", options: ["Data Definition Language", "Data Delivery Language", "Data Design Logic", "Database Design"], correctIndex: 0, explanation: "DDL defines database schemas." },
      { question: "Which gate outputs true only when both inputs are true?", options: ["OR", "AND", "NOT", "XOR"], correctIndex: 1, explanation: "AND gate: true only when both inputs are true." },
      { question: "What is the purpose of a compiler?", options: ["Run code directly", "Translate high-level code to machine code", "Manage memory", "Handle network requests"], correctIndex: 1, explanation: "A compiler translates source code to machine code." },
    ];

    for (const dept of deptData) {
      const deptId = deptIds.get(dept.abbr);
      if (!deptId) continue;
      const deptSubjects = await ctx.db
        .query("subjects")
        .withIndex("by_department", (q) => q.eq("departmentId", deptId))
        .collect();
      for (const subj of deptSubjects.slice(0, 3)) {
        await ctx.db.insert("mockExams", {
          title: `${subj.name} — Practice Test`,
          subjectId: subj._id,
          semester: subj.semester,
          questionCount: 5,
          durationMinutes: 15,
          questions: sampleQuestions,
        });
      }
    }

    return `seeded_${subjectCount}_subjects_${materialCount}_materials`;
  },
});

// Alias for backward compatibility
export const seedAll = seedFromGitHub;

