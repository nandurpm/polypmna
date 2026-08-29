/*
 * ============================================================
 * FILE: polydata.ts
 * PURPOSE: Normalizes curriculum, PDF, question-paper, and programme manifests from the project’s public educational sources.
 * ============================================================
 */

/*
 * Polydata — fetches real subject and document data directly from the
 * maintained diploma-notes and poly-pmna-pdf-files manifests.
 */

const NOTES_BASE = "https://raw.githubusercontent.com/nandurpm/poly-pmna-pdf-files/main";
const DIPLOMA_BASE = "https://raw.githubusercontent.com/nandurpm/diploma-notes/main";
const SITTTR_BASE = "https://www.sitttrkerala.ac.in";

export type Revision = "2026" | "2021" | "2015";

// These syllabus records exist, but the corresponding published lesson files do not.
const MISSING_LESSON_CODES = new Set(["3302", "3359"]);
// The upstream Revision 2021 repository currently publishes four lesson pages.
const REVISION_2021_LESSON_CODES = new Set(["1001", "1002", "1003", "1004"]);

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
  revision?: Revision;
}

export interface CurriculumSubject {
  revision: Revision;
  code: string;
  name: string;
  programme: string;
  programmeCode: string;
  programmeSlug: string;
  semester: string;
  semesterNumber: number;
  type: string;
  syllabusUrl?: string;
  modelPaperUrl?: string;
  notesUrl?: string;
  lessonUrl?: string;
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

interface Revision2021Record {
  revision: string;
  code: string;
  name: string;
  department: string;
  semester: string;
  type: string;
  assetCode?: string;
}

interface Revision2015Record {
  programmeCode: string;
  semester: number;
  code: string;
  name: string;
  syllabusUrl?: string | null;
  modelQuestionPaperUrl?: string | null;
  modelAvailable?: boolean;
}

interface Revision2015Manifest {
  revision: string;
  programmes: { code: string; name: string }[];
  subjects: Revision2015Record[];
}

interface Revision2015PdfManifest {
  base: string;
  links: Record<string, { department: string; code: string; syllabus?: string; modelQuestionPaper?: string }>;
}

/* ─── Cached data ─── */
let _subjectsCache: SubjectEntry[] | null = null;
let _pdfCache: PdfSubject[] | null = null;
let _papersCache: QuestionPaperDoc[] | null = null;
let _programmesCache: ProgrammeInfo[] | null = null;
const _curriculumCache = new Map<Revision, CurriculumSubject[]>();

/* ─── Fetch helpers ─── */
async function fetchJSON<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${url}`);
  return resp.json();
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function semesterNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function currentSitttrUrl(route: string, code: string, revision: Revision): string {
  const scheme = `REV${revision}`;
  return `${SITTTR_BASE}/index.php?r=${route}&course=${encodeURIComponent(code)}&scheme=${scheme}`;
}

/** Convert legacy SITTTR source routes in older manifests to current pages. */
function normalizeSitttrSourceUrl(sourceUrl: string): string {
  if (!sourceUrl) return sourceUrl;
  try {
    const url = new URL(sourceUrl);
    const route = url.searchParams.get("r");
    const course = url.searchParams.get("course");
    if (route === "site/diploma-model-question-paper-show") {
      return `${SITTTR_BASE}/index.php?r=site%2Fdiploma-modelqp-courses-show&course=${encodeURIComponent(course || "")}`;
    }
    if (route === "site/diploma-lab-manual-show") {
      return `${SITTTR_BASE}/index.php?r=site%2Fdiploma-lab-manual-courses-show&course=${encodeURIComponent(course || "")}`;
    }
    if (route === "site/diploma-syllabus-show") {
      return `${SITTTR_BASE}/index.php?r=site%2Fdiploma-syllabus&scheme=REV2026`;
    }
  } catch {
    // Keep malformed third-party URLs unchanged so callers can still display them.
  }
  return sourceUrl;
}

function curriculum2026(subjects: SubjectEntry[]): CurriculumSubject[] {
  return subjects.map((subject) => ({
    ...subject,
    revision: "2026",
    syllabusUrl: currentSitttrUrl("site%2Fdiploma-syllabus-course-contents", subject.code, "2026"),
    modelPaperUrl: currentSitttrUrl("site%2Fdiploma-modelqp-courses-show", subject.code, "2026"),
    notesUrl: getPdfDownloadUrl(subject.code),
    lessonUrl: getLessonUrl(subject.code, "2026") || undefined,
  }));
}

async function curriculum2021(): Promise<CurriculumSubject[]> {
  const data = await fetchJSON<{ subjects: Revision2021Record[] }>(
    `${DIPLOMA_BASE}/assets/data/revision-2021-subjects.json`,
  );
  return data.subjects.map((subject) => ({
    revision: "2021",
    code: subject.code,
    name: subject.name,
    programme: subject.department,
    programmeCode: slugify(subject.department),
    programmeSlug: slugify(subject.department),
    semester: subject.semester,
    semesterNumber: semesterNumber(subject.semester),
    type: subject.type,
    syllabusUrl: currentSitttrUrl("site%2Fdiploma-syllabus-course-contents", subject.code, "2021"),
    modelPaperUrl: currentSitttrUrl("site%2Fdiploma-modelqp-courses-show", subject.code, "2021"),
    lessonUrl: getLessonUrl(subject.code, "2021") || undefined,
  }));
}

async function curriculum2015(): Promise<CurriculumSubject[]> {
  const [data, pdfManifest] = await Promise.all([
    fetchJSON<Revision2015Manifest>(`${DIPLOMA_BASE}/assets/data/revision-2015-subjects.json`),
    fetchJSON<Revision2015PdfManifest>(`${DIPLOMA_BASE}/assets/data/revision-2015-pdf-links.json`),
  ]);
  const programmeNames = new Map(data.programmes.map((p) => [p.code, p.name]));
  return data.subjects.map((subject) => {
    const programme = programmeNames.get(subject.programmeCode) || subject.programmeCode;
    const mapping = pdfManifest.links[`${subject.programmeCode}|${subject.code}`];
    const direct = (path?: string) => (path ? `${pdfManifest.base}${path}` : undefined);
    return {
      revision: "2015",
      code: subject.code,
      name: subject.name,
      programme,
      programmeCode: subject.programmeCode,
      programmeSlug: slugify(programme),
      semester: `Semester ${subject.semester}`,
      semesterNumber: subject.semester,
      type: "Course",
      syllabusUrl: direct(mapping?.syllabus) || subject.syllabusUrl || undefined,
      modelPaperUrl: direct(mapping?.modelQuestionPaper) || subject.modelQuestionPaperUrl || undefined,
      notesUrl: direct(mapping?.syllabus),
    };
  });
}

/* ─── Public API ─── */

/** All Revision 2026 subjects from diploma-notes. */
export async function getAllSubjects(): Promise<SubjectEntry[]> {
  if (_subjectsCache) return _subjectsCache;
  const data = await fetchJSON<{ subjects: SubjectEntry[] }>(
    `${DIPLOMA_BASE}/assets/data/revision-2026-subjects-lite.json`,
  );
  _subjectsCache = data.subjects.map((subject) => ({ ...subject, revision: "2026" }));
  return _subjectsCache;
}

/** All subjects for one revision, with revision-specific resources attached. */
export async function getRevisionSubjects(revision: Revision): Promise<CurriculumSubject[]> {
  const cached = _curriculumCache.get(revision);
  if (cached) return cached;
  const subjects = revision === "2026"
    ? curriculum2026(await getAllSubjects())
    : revision === "2021"
      ? await curriculum2021()
      : await curriculum2015();
  _curriculumCache.set(revision, subjects);
  return subjects;
}

/** Published Revision 2026 study-note PDFs. */
export async function getAllPdfs(): Promise<PdfSubject[]> {
  if (_pdfCache) return _pdfCache;
  const data = await fetchJSON<{ subjects: PdfSubject[] }>(`${NOTES_BASE}/manifests/notes-2026.json`);
  _pdfCache = (data.subjects || []).filter((s) => s.status === "published");
  return _pdfCache;
}

/** Published Revision 2026 question papers from the SITTTR manifest. */
export async function getQuestionPapers(): Promise<QuestionPaperDoc[]> {
  if (_papersCache) return _papersCache;
  const data = await fetchJSON<{ documents: QuestionPaperDoc[] }>(`${NOTES_BASE}/manifests/sitttr-2026.json`);
  _papersCache = (data.documents || [])
    .filter((d) => d.status === "published")
    .map((d) => ({ ...d, sourceUrl: normalizeSitttrSourceUrl(d.sourceUrl) }));
  return _papersCache;
}

/** Revision 2026 programme list with counts. */
export async function getProgrammes(): Promise<ProgrammeInfo[]> {
  if (_programmesCache) return _programmesCache;
  const subjects = await getAllSubjects();
  const map = new Map<string, ProgrammeInfo>();
  for (const subject of subjects) {
    const code = subject.programmeCode;
    if (!map.has(code)) {
      map.set(code, {
        name: subject.programme,
        code,
        slug: subject.programmeSlug,
        semesterCount: 0,
        subjectCount: 0,
      });
    }
    map.get(code)!.subjectCount++;
  }
  for (const info of map.values()) {
    info.semesterCount = new Set(
      subjects.filter((s) => s.programmeCode === info.code).map((s) => s.semesterNumber),
    ).size;
  }
  _programmesCache = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  return _programmesCache;
}

export async function getSubjectsForProgramme(programmeCode: string, semester?: number): Promise<SubjectEntry[]> {
  const all = await getAllSubjects();
  return all.filter((s) => s.programmeCode === programmeCode && (semester === undefined || s.semesterNumber === semester));
}

export async function getPdfForCode(code: string): Promise<PdfSubject | null> {
  const all = await getAllPdfs();
  return all.find((p) => p.code === code) || null;
}

/** Lesson HTML URL, only for files known to be published upstream. */
export function getLessonUrl(code: string, revision: Revision = "2026"): string {
  if (revision === "2015") return "";
  if (revision === "2021") {
    return REVISION_2021_LESSON_CODES.has(code)
      ? `${DIPLOMA_BASE}/revision-2021-content/lessons/lessons-${code}.html`
      : "";
  }
  if (MISSING_LESSON_CODES.has(code)) return "";
  return `${DIPLOMA_BASE}/revision-2026-content/lessons/lessons-${code}.html`;
}

export function getSyllabusUrl(code: string, revision: Revision): string {
  return currentSitttrUrl("site%2Fdiploma-syllabus-course-contents", code, revision);
}

export function getModelPaperUrl(code: string, revision: Revision): string {
  return currentSitttrUrl("site%2Fdiploma-modelqp-courses-show", code, revision);
}

export function getPdfDownloadUrl(code: string): string {
  return `${NOTES_BASE}/notes/2026/${code}/v1/${code}.pdf`;
}

export async function getPapersForCode(code: string): Promise<QuestionPaperDoc[]> {
  const all = await getQuestionPapers();
  return all.filter((p) => p.courseCode.startsWith(code));
}

export async function getPapersForProgramme(programmeSlug: string): Promise<QuestionPaperDoc[]> {
  const all = await getQuestionPapers();
  return all.filter((p) => p.department.toLowerCase() === programmeSlug.toLowerCase());
}

/** Kept for the existing landing-page highlight; the full directory is revision-aware. */
export async function getMainDepartments(): Promise<{ name: string; abbr: string; programmes: ProgrammeInfo[] }[]> {
  const programmes = await getProgrammes();
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
    programmes: programmes.filter((p) => dept.keywords.some((k) => p.name.toLowerCase().includes(k))),
  }));
}

export async function getStats(): Promise<{ totalSubjects: number; totalPdfs: number; totalPapers: number; totalProgrammes: number }> {
  const [subjects, pdfs, papers] = await Promise.all([getAllSubjects(), getAllPdfs(), getQuestionPapers()]);
  return {
    totalSubjects: subjects.length,
    totalPdfs: pdfs.length,
    totalPapers: papers.length,
    totalProgrammes: new Set(subjects.map((s) => s.programmeCode)).size,
  };
}
