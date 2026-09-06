import type { AnswerState, AssessmentIndicator } from '@/mocks/seed/asesor';

export type AssessmentCompleteness = {
  complete: boolean;
  progress: number;
  missingIndicatorIds: string[];
  missingAnswerIds: string[];
  missingEvidenceIds: string[];
  missingLocationIds: string[];
  missingNaReasonIds: string[];
};

function isAnswerComplete(
  indicator: AssessmentIndicator,
  answer: AnswerState | undefined,
) {
  if (!answer?.value) return false;
  if (answer.value === 'N/A' && !answer.note.trim()) return false;
  if (indicator.evidenceRequired && !answer.evidenceName) return false;
  if (indicator.locationRequired && !answer.areaId) return false;
  return true;
}

export function calculateAssessmentCompleteness(
  indicators: AssessmentIndicator[],
  answers: Record<string, AnswerState>,
): AssessmentCompleteness {
  const requiredIndicators = indicators.filter(
    (indicator) => indicator.required,
  );
  const missingAnswerIds: string[] = [];
  const missingEvidenceIds: string[] = [];
  const missingLocationIds: string[] = [];
  const missingNaReasonIds: string[] = [];

  for (const indicator of requiredIndicators) {
    const answer = answers[indicator.id];
    if (!answer?.value) missingAnswerIds.push(indicator.id);
    if (answer?.value === 'N/A' && !answer.note.trim()) {
      missingNaReasonIds.push(indicator.id);
    }
    if (indicator.evidenceRequired && !answer?.evidenceName) {
      missingEvidenceIds.push(indicator.id);
    }
    if (indicator.locationRequired && !answer?.areaId) {
      missingLocationIds.push(indicator.id);
    }
  }

  const completeCount = requiredIndicators.filter((indicator) =>
    isAnswerComplete(indicator, answers[indicator.id]),
  ).length;
  const missingIndicatorIds = [
    ...new Set([
      ...missingAnswerIds,
      ...missingEvidenceIds,
      ...missingLocationIds,
      ...missingNaReasonIds,
    ]),
  ];

  return {
    complete: missingIndicatorIds.length === 0,
    progress:
      requiredIndicators.length === 0
        ? 100
        : Math.round((completeCount / requiredIndicators.length) * 100),
    missingIndicatorIds,
    missingAnswerIds,
    missingEvidenceIds,
    missingLocationIds,
    missingNaReasonIds,
  };
}
