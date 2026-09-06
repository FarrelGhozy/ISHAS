'use client';

import { ResearchInstrumentsPage } from '@/features/peneliti/pages/instruments-page';
import { ResearchDataPage } from '@/features/peneliti/pages/research-data-page';
import { ResearchScoringPage } from '@/features/peneliti/pages/scoring-page';
import { ResearchValidationPage } from '@/features/peneliti/pages/validation-page';
import { ResearchVersionsPage } from '@/features/peneliti/pages/versions-page';

export function ResearcherSection({ section }: { section: string }) {
  if (section === 'instruments') return <ResearchInstrumentsPage />;
  if (section === 'versions') return <ResearchVersionsPage />;
  if (section === 'scoring') return <ResearchScoringPage />;
  if (section === 'validation') return <ResearchValidationPage />;
  if (section === 'research') return <ResearchDataPage />;
  return null;
}
