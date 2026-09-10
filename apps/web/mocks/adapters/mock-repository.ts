// Adapter repository — kontrak data di depan UI. UI tidak menyentuh store langsung.
// V2-03: pengiriman lapor-cepat diekspos lewat adapter agar validasi + id laporan
// terpusat di satu titik.

import { storeActions, getState, type ActionResult, type ReportActor } from "../store/mock-store";
import {
  selectFindingsByReports,
  selectRecommendationsByReports,
  selectRegisteredInstitutions,
  selectPublicReports,
} from "../store/selectors";

export const mockRepository = {
  registeredInstitutions() {
    return selectRegisteredInstitutions(getState());
  },
  validatedReports(institutionCode: string | null) {
    return selectPublicReports(getState(), institutionCode);
  },
  findingsFor(institutionCode: string | null) {
    return selectFindingsByReports(
      getState(),
      selectPublicReports(getState(), institutionCode),
    );
  },
  recommendationsFor(institutionCode: string | null) {
    return selectRecommendationsByReports(
      getState(),
      selectPublicReports(getState(), institutionCode),
    );
  },
  reset() {
    storeActions.resetMockData();
  },
  submitLaporCepat(
    actor: ReportActor,
    input: {
      institutionCode: string;
      reporterName: string;
      title: string;
      description: string;
      areaId?: string;
      manualLocation?: string;
      evidenceName?: string;
      contact?: string;
      clientRequestId?: string;
    },
  ): ActionResult {
    return storeActions.submitPublicReport(actor, input);
  },
};
