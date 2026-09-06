import type { AssessmentIndicator } from '@/mocks/seed/asesor';
import type { BuilderDimension } from '@/mocks/seed/peneliti';

export function buildAssessmentIndicators(
  dimensions: BuilderDimension[],
): AssessmentIndicator[] {
  return dimensions.flatMap((dimension) =>
    dimension.indicators.map((indicator) => ({
      id: indicator.id,
      code: indicator.code,
      dimension: dimension.name,
      title: indicator.title,
      prompt: indicator.prompt,
      answerType: indicator.answerType.startsWith('Likert')
        ? ('likert' as const)
        : ('boolean' as const),
      required: indicator.required,
      evidenceRequired: indicator.evidenceRequired,
      locationRequired: indicator.locationRequired,
      reference: indicator.reference,
      options: indicator.answerType.startsWith('Likert')
        ? indicator.rubrics.map((rubric) => ({
            value: String(rubric.score),
            label: rubric.label,
            description: rubric.description,
          }))
        : [
            {
              value: 'Ya',
              label: 'Ya',
              description: 'Kondisi terpenuhi.',
            },
            {
              value: 'Tidak',
              label: 'Tidak',
              description: 'Kondisi belum terpenuhi.',
            },
            ...(indicator.allowNa
              ? [
                  {
                    value: 'N/A',
                    label: 'N/A',
                    description: 'Tidak berlaku dan wajib diberi alasan.',
                  },
                ]
              : []),
          ],
    })),
  );
}
