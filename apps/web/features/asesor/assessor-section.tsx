'use client';

import { AssignmentsPage } from '@/features/asesor/pages/assignments-page';
import { EvidencePage } from '@/features/asesor/pages/evidence-page';
import { HistoryPage } from '@/features/asesor/pages/history-page';
import { NewAssessmentPage } from '@/features/asesor/pages/new-assessment-page';

export function AssessorSection({ section }: { section: string }) {
  if (section === 'assignments') return <AssignmentsPage />;
  if (section === 'new-assessment') return <NewAssessmentPage />;
  if (section === 'evidence') return <EvidencePage />;
  if (section === 'history') return <HistoryPage />;
  return null;
}
