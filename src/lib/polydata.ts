/**
 * Polydata — fetches real subject & PDF data directly from GitHub manifests.
 * Mirrors how polypmna.dpdns.org works: client-side fetch, no Convex dependency.
 */

const NOTES_BASE = "https://raw.githubusercontent.com/nandurpm/poly-pmna-pdf-files/main";
const DIPLOMA_BASE = "https://raw.githubusercontent.com/nandurpm/diploma-notes/main";

/* ─── Types ─── */

export interface SubjectEntry {
  code: string;
  name: string;
  programme: string;
  programmeCode: string;
  programmeSlug: string;
  semester: string;
  semesterNumber: number;
  type: string;
}

export interface PdfSubject {
  code: string;
  title: string;
  revision: string;
  version: string;
  status: string;
  pdfUrl: string;
  bytes: number;
  sha256: string;
  pages: number;
  source: string;
}

export interface QuestionPaperDoc {
  revision: string;
  documentType: string;
  department: string;
  semester: string;
  courseCode: string;
  courseName: string;
  path: string;
  pdfUrl: string;
  sourceUrl: string;
  bytes: number;
  pages: number;
  status: string;
}

export interface ProgrammeInfo {
  name: string;
  code: string;
  slug: string;
  semesterCount: number;
  subjectCount: number;
}

/* ─── Cached data ─── */

let _subjectsCache: SubjectEntry[] | null = null;
let _pdfCache: PdfSubject[] | null = null;
let _papersCache: QuestionPaperDoc[] | null = null;
let _programmesCache: ProgrammeInfo[] | null = null;

/* ─── Fetch helpers ─── */

async function fetchJSON<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${url}`);
  return resp.json();
}

/* ─── Public API ─── */

/** All subjects from diploma-notes (2485 entries for Rev 2026) */
export async function getAllSubjects(): Promise<SubjectEntry[]> {
  if (_subjectsCache) return _subjectsCache;
  const data = await fetchJSON<{ subjects: SubjectEntry[] }>(
    `${DIPLOMA_BASE}/assets/data/revision-2026-subjects-lite.json`
  );
  _subjectsCache = data.subjects;
  return _subjectsCache;
}

/** All published PDFs from poly-pmna-pdf-files manifest */
export async function getAllPdfs(): Promise<PdfSubject[]> {
  if (_pdfCache) return _pdfCache;
  const data = await fetchJSON<{ subjects: PdfSubject[] }>(
    `${NOTES_BASE}/manifests/notes-2026.json`
  );
  _pdfCache = (data.subjects || []).filter((s) => s.status === "published");
  return _pdfCache;
}

/** Question papers from SITTTR manifest */
export async function getQuestionPapers(): Promise<QuestionPaperDoc[]> {
  if (_papersCache) return _papersCache;
  const data = await fetchJSON<{ documents: QuestionPaperDoc[] }>(
    `${NOTES_BASE}/manifests/sitttr-2026.json`
  );
  _papersCache = (data.documents || []).filter((d) => d.status === "published");
  return _papersCache;
}

/** Programme (department) list with counts */
export async function getProgrammes(): Promise<ProgrammeInfo[]> {
  if (_programmesCache) return _programmesCache;
  const subjects = await getAllSubjects();
  const map = new Map<string, ProgrammeInfo>();
  for (const s of subjects) {
    const code = s.programmeCode;
    if (!map.has(code)) {
      map.set(code, {
        name: s.programme,
        code,
        slug: s.programmeSlug,
        semesterCount: 0,
        subjectCount: 0,
      });
    }
    const info = map.get(code)!;
    info.subjectCount++;
  }
  // Count semesters per programme
  for (const info of map.values()) {
    const sems = new Set(
      subjects
        .filter((s) => s.programmeCode === info.code)
        .map((s) => s.semesterNumber)
    );
    info.semesterCount = sems.size;
  }
  _programmesCache = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  return _programmesCache;
}

/** Subjects for a specific programme and semester */
export async function getSubjectsForProgramme(
  programmeCode: string,
  semester?: number
): Promise<SubjectEntry[]> {
  const all = await getAllSubjects();
  return all.filter(
    (s) =>
      s.programmeCode === programmeCode &&
      (semester === undefined || s.semesterNumber === semester)
  );
}

/** PDF info for a subject code */
export async function getPdfForCode(code: string): Promise<PdfSubject | null> {
  const all = await getAllPdfs();
  return all.find((p) => p.code === code) || null;
}

/** Lesson HTML page URL (from diploma-notes) */
export function getLessonUrl(code: string): string {
  return `${DIPLOMA_BASE}/revision-2026-content/lessons/lessons-${code}.html`;
}

/** Direct PDF download URL */
export function getPdfDownloadUrl(code: string): string {
  return `${NOTES_BASE}/notes/2026/${code}/v1/${code}.pdf`;
}

/** Question papers for a specific subject code */
export async function getPapersForCode(code: string): Promise<QuestionPaperDoc[]> {
  const all = await getQuestionPapers();
  return all.filter((p) => p.courseCode.startsWith(code));
}

/** All question papers for a programme */
export async function getPapersForProgramme(
  programmeSlug: string
): Promise<QuestionPaperDoc[]> {
  const all = await getQuestionPapers();
  return all.filter((p) => p.department.toLowerCase() === programmeSlug.toLowerCase());
}

/** Get the 6 main polytechnic departments for the landing page */
export async function getMainDepartments(): Promise<
  { name: string; abbr: string; programmes: ProgrammeInfo[] }[]
> {
  const programmes = await getProgrammes();
  // Map common abbreviations
  const mainDepts = [
    { name: "Computer Science & Engineering", abbr: "CSE", keywords: ["computer"] },
    { name: "Civil Engineering", abbr: "CE", keywords: ["civil"] },
    { name: "Mechanical Engineering", abbr: "ME", keywords: ["mechanical"] },
    { name: "Electronics Engineering", abbr: "ECE", keywords: ["electronics"] },
    { name: "Electrical & Electronics", abbr: "EEE", keywords: ["electrical"] },
    { name: "Automobile Engineering", abbr: "AE", keywords: ["automobile"] },
  ];

  return mainDepts.map((dept) => ({
    name: dept.name,
    abbr: dept.abbr,
    programmes: programmes.filter((p) =>
      dept.keywords.some((k) => p.name.toLowerCase().includes(k))
    ),
  }));
}

/** Stats for the landing page */
export async function getStats(): Promise<{
  totalSubjects: number;
  totalPdfs: number;
  totalPapers: number;
  totalProgrammes: number;
}> {
  const [subjects, pdfs, papers] = await Promise.all([
    getAllSubjects(),
    getAllPdfs(),
    getQuestionPapers(),
  ]);
  const programmeCodes = new Set(subjects.map((s) => s.programmeCode));
  return {
    totalSubjects: subjects.length,
    totalPdfs: pdfs.length,
    totalPapers: papers.length,
    totalProgrammes: programmeCodes.size,
  };
}
