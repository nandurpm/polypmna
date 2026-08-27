import { useEffect } from "react";
import { useLocation } from "react-router";
import { getRuntimeBasePath } from "../lib/siteBase";

type SeoConfig = {
  title: string;
  description: string;
  index: boolean;
};

const DEFAULT_SEO: SeoConfig = {
  title: "POLY PMNA — Kerala Polytechnic Study Materials",
  description: "Explore Kerala Polytechnic curriculum, engineering subjects, lessons, PDFs, question papers, mock exams, study tools, and Ask POLY AI.",
  index: true,
};

const SEO_BY_ROUTE: Record<string, SeoConfig> = {
  "/ask-ai": {
    title: "Ask POLY AI — Kerala Polytechnic Study Assistant",
    description: "Ask focused questions about Kerala Polytechnic subjects, engineering concepts, formulas, programming, practical topics, and exam preparation.",
    index: true,
  },
  "/curriculum": {
    title: "Kerala Polytechnic Curriculum — POLY PMNA",
    description: "Browse Kerala Polytechnic revisions, departments, semesters, subjects, syllabus links, lessons, and study notes.",
    index: true,
  },
  "/question-papers": {
    title: "Polytechnic Question Papers — POLY PMNA",
    description: "Search and study Kerala Polytechnic question papers by department, subject, semester, revision, and examination year.",
    index: true,
  },
  "/resources": {
    title: "Polytechnic Study Resources — POLY PMNA",
    description: "Find Kerala Polytechnic notes, lessons, PDFs, question papers, mock exams, and practical study resources.",
    index: true,
  },
  "/student-tools": {
    title: "Polytechnic Student Tools — POLY PMNA",
    description: "Use practical tools for Kerala Polytechnic study, calculations, revision, and exam preparation.",
    index: true,
  },
  "/mock-exams": {
    title: "Polytechnic Mock Exams — POLY PMNA",
    description: "Practise Kerala Polytechnic mock exams with authenticated server-side scoring and subject-focused questions.",
    index: true,
  },
  "/subject": {
    title: "Polytechnic Subject Details — POLY PMNA",
    description: "View Kerala Polytechnic subject details, revision information, notes, lessons, and related resources.",
    index: true,
  },
  "/dashboard": {
    title: "Study Dashboard — POLY PMNA",
    description: "Open your POLY PMNA study dashboard and access saved Kerala Polytechnic resources.",
    index: false,
  },
  "/auth": {
    title: "Sign in — POLY PMNA",
    description: "Sign in to access personalized POLY PMNA study features.",
    index: false,
  },
  "/pdf": {
    title: "Study PDF — POLY PMNA",
    description: "Read a POLY PMNA Polytechnic study document.",
    index: false,
  },
  "/lesson": {
    title: "Polytechnic Lesson — POLY PMNA",
    description: "Read a POLY PMNA Polytechnic lesson.",
    index: false,
  },
};

function getSeo(pathname: string): SeoConfig {
  const matchingRoute = Object.keys(SEO_BY_ROUTE).find((route) => pathname === route || pathname.startsWith(`${route}/`));
  return matchingRoute ? SEO_BY_ROUTE[matchingRoute] : DEFAULT_SEO;
}

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeo(location.pathname);
    const basePath = getRuntimeBasePath().replace(/\/$/, "");
    const canonicalUrl = new URL(`${basePath}${location.pathname}${location.search}`, window.location.origin).toString();

    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("robots", seo.index ? "index,follow" : "noindex,nofollow");
    setProperty("og:title", seo.title);
    setProperty("og:description", seo.description);
    setProperty("og:url", canonicalUrl);
    setProperty("og:type", "website");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location.pathname, location.search]);

  return null;
}
