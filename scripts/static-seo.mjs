export const SITE_ORIGIN = "https://gptcperinthalmanna.dpdns.org";

export const PUBLIC_ROUTES = {
  "/": {
    title: "POLY PMNA — Kerala Polytechnic Study Materials",
    description: "Explore Kerala Polytechnic curriculum, engineering subjects, lessons, PDFs, question papers, mock exams, study tools, and Ask POLY AI.",
    heading: "Kerala Polytechnic study materials",
  },
  "/curriculum": {
    title: "Kerala Polytechnic Curriculum — POLY PMNA",
    description: "Browse Kerala Polytechnic revisions, departments, semesters, subjects, syllabus links, lessons, and study notes.",
    heading: "Kerala Polytechnic curriculum",
  },
  "/question-papers": {
    title: "Polytechnic Question Papers — POLY PMNA",
    description: "Search Kerala Polytechnic question papers by department, subject, semester, revision, and examination year.",
    heading: "Kerala Polytechnic question papers",
  },
  "/resources": {
    title: "Polytechnic Study Resources — POLY PMNA",
    description: "Find Kerala Polytechnic notes, lessons, PDFs, question papers, mock exams, and practical study resources.",
    heading: "Polytechnic study resources",
  },
  "/student-tools": {
    title: "Polytechnic Student Tools — POLY PMNA",
    description: "Use practical tools for Kerala Polytechnic study, calculations, revision, and exam preparation.",
    heading: "Polytechnic student tools",
  },
  "/mock-exams": {
    title: "Polytechnic Mock Exams — POLY PMNA",
    description: "Practise Kerala Polytechnic mock exams with subject-focused questions and authenticated scoring.",
    heading: "Kerala Polytechnic mock exams",
  },
  "/ask-ai": {
    title: "Ask POLY AI — Kerala Polytechnic Study Assistant",
    description: "Ask questions about Kerala Polytechnic subjects, engineering concepts, formulas, programming, practical topics, and exam preparation.",
    heading: "Ask POLY AI",
  },
};

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderRouteHtml(template, route, config) {
  const canonical = `${SITE_ORIGIN}${route === "/" ? "/" : route}`;
  const title = escapeHtml(config.title);
  const description = escapeHtml(config.description);
  const content = `<main id="seo-content"><h1>${escapeHtml(config.heading)}</h1><p>${description}</p><nav aria-label="Study pages"><a href="/curriculum">Curriculum</a> <a href="/question-papers">Question papers</a> <a href="/resources">Resources</a> <a href="/mock-exams">Mock exams</a> <a href="/student-tools">Student tools</a> <a href="/ask-ai">Ask POLY AI</a></nav></main>`;

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}
