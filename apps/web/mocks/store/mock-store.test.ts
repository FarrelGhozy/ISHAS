import { beforeEach, describe, expect, test } from 'bun:test';
import { calculateAssessmentCompleteness } from '@/mocks/processors/assessment';
import {
  mockStoreActions,
  getMockStateForTest,
} from '@/mocks/store/mock-store';
import {
  selectAssessmentLocations,
  selectRiskWorkspaceData,
  validateSeedRelations,
} from '@/mocks/store/selectors';
import { createInitialMockState } from '@/mocks/store/state';

describe('shared mock store', () => {
  beforeEach(() => {
    mockStoreActions.resetMockData();
  });

  test('seed awal memiliki relasi ID yang valid', () => {
    expect(validateSeedRelations(createInitialMockState())).toEqual([]);
  });

  test('progress menghitung jawaban, bukti, lokasi, dan alasan N/A', () => {
    const state = createInitialMockState();
    const answers = Object.fromEntries(
      state.indicators.map((indicator) => [
        indicator.id,
        {
          value: indicator.options.some((option) => option.value === 'N/A')
            ? 'N/A'
            : indicator.options[0].value,
          note: '',
          evidenceName: indicator.evidenceRequired ? 'bukti.jpg' : '',
          areaId: indicator.locationRequired ? 'AREA-001' : '',
          planPoint: null,
        },
      ]),
    );

    const incomplete = calculateAssessmentCompleteness(
      state.indicators,
      answers,
    );
    expect(incomplete.complete).toBe(false);
    expect(incomplete.missingNaReasonIds.length).toBeGreaterThan(0);

    for (const answer of Object.values(answers)) {
      if (answer.value === 'N/A') answer.note = 'Tidak berlaku pada area ini.';
    }
    const complete = calculateAssessmentCompleteness(state.indicators, answers);
    expect(complete.complete).toBe(true);
    expect(complete.progress).toBe(100);
  });

  test('area baru Pengelola tersedia pada penugasan Asesor di institution yang sama', () => {
    const stateBefore = getMockStateForTest();
    const assignment = stateBefore.assignments.find(
      (item) => item.id === 'ASM-0261',
    )!;
    const result = mockStoreActions.addArea({
      institutionCode: assignment.institutionCode,
      buildingId: 'BLD-001',
      floor: 'Lantai 1',
      name: 'Tangga Timur',
      zone: 'Blok A',
    });
    expect(result.ok).toBe(true);

    const locations = selectAssessmentLocations(
      getMockStateForTest(),
      assignment,
    );
    expect(
      locations.some((location) => location.label.includes('Tangga Timur')),
    ).toBe(true);
  });

  test('filter risiko menjaga daftar temuan dan area tetap konsisten', () => {
    const filtered = selectRiskWorkspaceData(getMockStateForTest(), {
      assessmentId: 'ASM-0254',
      buildingId: 'Semua gedung',
      floor: 'Semua lantai',
      riskLevel: 'Tinggi',
      workStatus: 'Belum ditindaklanjuti',
    });
    const areaIds = new Set(filtered.findings.map((finding) => finding.areaId));

    expect(filtered.findings.length).toBeGreaterThan(0);
    expect(
      filtered.findings.every(
        (finding) =>
          finding.assessmentId === 'ASM-0254' &&
          finding.level === 'Tinggi' &&
          finding.status === 'Belum ditindaklanjuti',
      ),
    ).toBe(true);
    expect(filtered.areas.every((area) => areaIds.has(area.id))).toBe(true);
  });

  test('publikasi hanya mengunci Draft yang lolos validasi', () => {
    const initial = getMockStateForTest();
    const draft = initial.instrumentVersions.find(
      (version) => version.status === 'Draft',
    )!;
    const rejected = mockStoreActions.publishInstrumentVersion(draft.id);
    expect(rejected.ok).toBe(false);

    for (const item of initial.validationItems) {
      mockStoreActions.completeValidationItem(item.id);
    }
    const published = mockStoreActions.publishInstrumentVersion(draft.id);
    expect(published.ok).toBe(true);
    expect(
      getMockStateForTest().instrumentVersions.find(
        (version) => version.id === draft.id,
      )?.status,
    ).toBe('Published');
    expect(getMockStateForTest().indicatorsByVersion[draft.id].length).toBe(
      getMockStateForTest().builderDimensions.reduce(
        (total, dimension) => total + dimension.indicators.length,
        0,
      ),
    );
  });

  test('finalisasi mengunci assessment dan membentuk output lintas role', () => {
    const state = getMockStateForTest();
    const assignmentId = 'ASM-0261';
    for (const indicator of state.indicators) {
      mockStoreActions.updateAssessmentAnswer(assignmentId, indicator.id, {
        value: indicator.answerType === 'boolean' ? 'Tidak' : '2',
        note: 'Temuan uji otomatis.',
        evidenceName: indicator.evidenceRequired ? 'bukti-uji.jpg' : '',
        areaId: indicator.locationRequired ? 'AREA-001' : '',
      });
    }

    const finalized = mockStoreActions.finalizeAssessment(assignmentId);
    expect(finalized.ok).toBe(true);

    const after = getMockStateForTest();
    expect(
      after.assignments.find((assignment) => assignment.id === assignmentId)
        ?.status,
    ).toBe('Final');
    expect(
      after.periodResults.some((result) => result.id === assignmentId),
    ).toBe(true);
    expect(
      after.recommendations.some((item) => item.source.includes(assignmentId)),
    ).toBe(true);
    expect(
      after.notifications.some(
        (item) =>
          item.role === 'pengelola' && item.targetPath === '/pengelola/hasil',
      ),
    ).toBe(true);
    expect(
      mockStoreActions.updateAssessmentAnswer(
        assignmentId,
        after.indicators[0].id,
        { value: '4' },
      ).ok,
    ).toBe(false);
    expect(mockStoreActions.updateEvidence('EV-001', 'pengganti.jpg').ok).toBe(
      false,
    );
  });

  test('input PIC dan tenggat tersimpan persis pada tindak lanjut', () => {
    const result = mockStoreActions.updateRecommendation('REC-2026-002', {
      owner: 'Pimpinan Pesantren',
      dueDate: '2026-10-01',
      status: 'Berjalan',
      note: 'Jadwalkan inspeksi bersama teknisi tersertifikasi.',
      evidenceName: 'jadwal-inspeksi.pdf',
    });
    expect(result.ok).toBe(true);
    const recommendation = getMockStateForTest().recommendations.find(
      (item) => item.id === 'REC-2026-002',
    );
    expect(recommendation?.owner).toBe('Pimpinan Pesantren');
    expect(recommendation?.dueDate).toBe('2026-10-01');
    expect(recommendation?.status).toBe('Berjalan');
    expect(recommendation?.lastNote).toBe(
      'Jadwalkan inspeksi bersama teknisi tersertifikasi.',
    );
    expect(recommendation?.completionEvidence).toBe('jadwal-inspeksi.pdf');
  });
});
