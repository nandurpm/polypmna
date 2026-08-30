import { ExternalLink, ArrowLeft, BookOpen, Archive, Brain, Calendar, FileText, HelpCircle, ShieldCheck, Wrench } from "lucide-react";
import { Link, useNavigate } from "react-router";

const DPDNS_BASE = "https://polypmna.dpdns.org";

const resourceGroups = [
  {
    title: "Curriculum and materials",
    icon: BookOpen,
    items: [
      { label: "Revision 2026", description: "Browse the latest Kerala Polytechnic curriculum and subjects.", href: `${DPDNS_BASE}/revision-2026.html` },
      { label: "Revision 2021", description: "Open the complete Revision 2021 department archive.", href: `${DPDNS_BASE}/revision-2021.html` },
      { label: "2015 Materials", description: "Access the archived Revision 2015 subject materials.", href: `${DPDNS_BASE}/materials-2015.html` },
      { label: "Model Question Papers", description: "Browse Revision 2026 and Revision 2021 model papers.", href: `${DPDNS_BASE}/model-question-papers.html` },
    ],
  },
  {
    title: "Study and practice",
    icon: Brain,
    items: [
      { label: "Mock Exams", description: "Practice daily quizzes and mock examinations.", href: `${DPDNS_BASE}/daily-quiz.html` },
      { label: "Ask POLY AI", description: "Find subjects, lessons, notes, and study guidance.", href: "/ask-ai" },
      { label: "Student Tools", description: "Use the timetable, calculator, and academic utilities.", href: `${DPDNS_BASE}/tools.html` },
      { label: "Help and Contact", description: "Get help with the POLY PMNA study resources.", href: `${DPDNS_BASE}/contact.html` },
    ],
  },
  {
    title: "Official academic resources",
    icon: Archive,
    items: [
      { label: "SITTTR Revision 2021 papers", description: "Official SITTTR model-question-paper archive.", href: "https://www.sitttrkerala.ac.in/index.php?r=site%2Fdiploma-modelqp&scheme=REV2021" },
      { label: "SITTTR Revision 2015 papers", description: "Official SITTTR Revision 2015 model papers.", href: "https://www.sitttrkerala.ac.in/index.php?r=site%2Fdiploma-modelqp&scheme=REV2015" },
      { label: "SITTTR Revision 2026 lab manuals", description: "Official laboratory manuals for the current revision.", href: "https://www.sitttrkerala.ac.in/index.php?r=site%2Fdiploma-lab-manual&scheme=REV2026" },
      { label: "SITTTR academic calendar", description: "Official diploma academic-calendar resources.", href: "https://www.sitttrkerala.ac.in/index.php?r=site%2Fspecial-docs&id=27" },
    ],
  },
  {
    title: "Site information",
    icon: ShieldCheck,
    items: [
      { label: "About POLY PMNA", description: "Learn about the project and its study resources.", href: `${DPDNS_BASE}/about.html` },
      { label: "Privacy", description: "Read the privacy policy.", href: `${DPDNS_BASE}/privacy.html` },
      { label: "Terms", description: "Read the terms of use.", href: `${DPDNS_BASE}/terms.html` },
      { label: "Disclaimer", description: "Review the educational-resource disclaimer.", href: `${DPDNS_BASE}/disclaimer.html` },
    ],
  },
];

export default function ResourceHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="w-full flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-10">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">POLY PMNA Resource Hub</span>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className="max-w-5xl mb-8">
          <p className="text-sm font-medium text-primary/80 mb-1">Complete study access</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All POLY PMNA resources in one place</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Use the repository-native study pages for subjects, notes, lessons, and papers, or open the established POLY PMNA and official SITTTR archives for older revisions and additional academic resources.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <BookOpen className="h-4 w-4" /> Study home
            </Link>
            <Link to="/question-papers" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <FileText className="h-4 w-4" /> Question papers
            </Link>
            <Link to="/student-tools" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <Wrench className="h-4 w-4" /> Student tools
            </Link>
            <Link to="/mock-exams" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <Calendar className="h-4 w-4" /> Mock exams
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resourceGroups.map((group) => {
            const Icon = group.icon;
            return (
              <section key={group.title}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">{group.title}</h2>
                </div>
                <div className="grid gap-2">
                  {group.items.map((item) => item.href.startsWith("/") ? (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium group-hover:text-primary transition-colors">{item.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                      </span>
                      <Brain className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                  ) : (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30">
                      <span className="min-w-0"><span className="block text-sm font-medium transition-colors group-hover:text-primary">{item.label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span></span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
          <HelpCircle className="mr-1 inline h-3.5 w-3.5 text-primary" />
          PDF notes and lesson links in the study home and subject pages use the published GitHub manifests directly, so the resource URLs remain available independently of the GitHub Pages frontend deployment.
        </div>
      </main>
    </div>
  );
}
