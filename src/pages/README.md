# Pages

## Purpose

Contains lazily loaded route-level React screens for the public resource site and authenticated student features.

## Contents

- `Landing.tsx` — public entry.
- `CurriculumBrowser.tsx` and `SubjectDetail.tsx` — curriculum navigation.
- `LessonViewer.tsx` and `PDFViewer.tsx` — content viewers.
- `QuestionPapers.tsx` and `ResourceHub.tsx` — resources.
- `AskAI.tsx`, `MockExams.tsx`, and `StudentTools.tsx` — interactive tools.
- `Auth.tsx`, `Dashboard.tsx`, and `NotFound.tsx` — route support.

## Responsibilities

Route composition belongs here; reusable controls and data adapters belong in sibling folders.

## Important Notes

Protected pages must remain wrapped by `RequireAuth` in `src/main.tsx`.
