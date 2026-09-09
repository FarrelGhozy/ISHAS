'use client';

import { useState } from 'react';
import { FollowUpPage } from '@/features/pengelola/pages/follow-up-page';
import { LocationManagementPage } from '@/features/pengelola/pages/locations-page';
import { RecommendationsPage } from '@/features/pengelola/pages/recommendations-page';
import { ReportsPage } from '@/features/pengelola/pages/reports-page';
import { ResultsPage } from '@/features/pengelola/pages/results-page';
import { RiskMapPage } from '@/features/pengelola/pages/risk-map-page';

export function ManagerSection({
  section,
  onNavigate,
}: {
  section: string;
  onNavigate: (section: string) => void;
}) {
  const [focusedRecommendationId, setFocusedRecommendationId] = useState<
    string | null
  >(null);

  function openRelatedAction(nextSection: string, recommendationId: string) {
    setFocusedRecommendationId(recommendationId);
    onNavigate(nextSection);
  }

  if (section === 'results') return <ResultsPage />;
  if (section === 'locations') return <LocationManagementPage />;
  if (section === 'risk-map') {
    return (
      <RiskMapPage onNavigate={onNavigate} onOpenAction={openRelatedAction} />
    );
  }
  if (section === 'recommendations') {
    return <RecommendationsPage initialSelectedId={focusedRecommendationId} />;
  }
  if (section === 'follow-up') {
    return <FollowUpPage initialSelectedId={focusedRecommendationId} />;
  }
  if (section === 'reports') return <ReportsPage />;
  return null;
}
