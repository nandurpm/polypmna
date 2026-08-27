const SOURCES = {
  notes: "https://raw.githubusercontent.com/nandurpm/poly-pmna-pdf-files/main/manifests/notes-2026.json",
  papers: "https://raw.githubusercontent.com/nandurpm/poly-pmna-pdf-files/main/manifests/sitttr-2026.json",
  subjects2026: "https://raw.githubusercontent.com/nandurpm/diploma-notes/main/assets/data/revision-2026-subjects-lite.json",
  subjects2021: "https://raw.githubusercontent.com/nandurpm/diploma-notes/main/assets/data/revision-2021-subjects.json",
  subjects2015: "https://raw.githubusercontent.com/nandurpm/diploma-notes/main/assets/data/revision-2015-subjects.json",
};

const timeoutMs = Number(process.env.RESOURCE_CHECK_TIMEOUT_MS || 20_000);

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { "User-Agent": "POLY-PMNA-resource-health/1.0", ...(init.headers || {}) },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(name, url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`${name} manifest returned HTTP ${response.status}`);
  const data = await response.json();
  console.log(`PASS manifest ${name}: HTTP ${response.status}`);
  return data;
}

async function checkUrl(name, url) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
      });
      if (response.ok || response.status === 206) {
        console.log(`PASS resource ${name}: HTTP ${response.status}`);
        return;
      }
      if (attempt === 2) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (attempt === 2) throw new Error(`${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function chooseSample(items, index) {
  if (!Array.isArray(items) || items.length === 0) throw new Error(`${index} list is empty`);
  return items[Math.min(index, items.length - 1)];
}

const failures = [];
async function runCheck(name, fn) {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${message}`);
    console.error(`FAIL ${name}: ${message}`);
  }
}

const [notes, papers, subjects2026, subjects2021, subjects2015] = await Promise.all([
  fetchJson("notes", SOURCES.notes),
  fetchJson("papers", SOURCES.papers),
  fetchJson("subjects2026", SOURCES.subjects2026),
  fetchJson("subjects2021", SOURCES.subjects2021),
  fetchJson("subjects2015", SOURCES.subjects2015),
]);

const publishedNotes = (notes.subjects || []).filter((item) => item.status === "published" && item.pdfUrl);
const publishedPapers = (papers.documents || []).filter((item) => item.status === "published" && item.pdfUrl);
const subjects2026List = subjects2026.subjects || [];
const subjects2021List = subjects2021.subjects || [];
const subjects2015List = subjects2015.subjects || [];

for (const [name, list] of [
  ["notes", publishedNotes],
  ["papers", publishedPapers],
  ["subjects2026", subjects2026List],
  ["subjects2021", subjects2021List],
  ["subjects2015", subjects2015List],
]) {
  await runCheck(`${name} non-empty`, async () => {
    if (list.length === 0) throw new Error("no records found");
    console.log(`PASS dataset ${name}: ${list.length} records`);
  });
}

for (const [index, item] of [
  ["notes-first", chooseSample(publishedNotes, 0)],
  ["notes-middle", chooseSample(publishedNotes, Math.floor(publishedNotes.length / 2))],
  ["notes-last", chooseSample(publishedNotes, publishedNotes.length - 1)],
  ["papers-first", chooseSample(publishedPapers, 0)],
  ["papers-middle", chooseSample(publishedPapers, Math.floor(publishedPapers.length / 2))],
  ["papers-last", chooseSample(publishedPapers, publishedPapers.length - 1)],
]) {
  await runCheck(index, () => checkUrl(index, item.pdfUrl));
}

for (const item of [
  { name: "lesson-1001", url: "https://raw.githubusercontent.com/nandurpm/diploma-notes/main/revision-2026-content/lessons/lessons-1001.html" },
  { name: "lesson-1002", url: "https://raw.githubusercontent.com/nandurpm/diploma-notes/main/revision-2026-content/lessons/lessons-1002.html" },
]) {
  await runCheck(item.name, () => checkUrl(item.name, item.url));
}

console.log(`Checked ${publishedNotes.length} published notes, ${publishedPapers.length} published papers, ${subjects2026List.length} Revision 2026 subjects, ${subjects2021List.length} Revision 2021 subjects, and ${subjects2015List.length} Revision 2015 subjects.`);
if (failures.length > 0) {
  console.error(`Resource health failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("Resource health passed.");
}
