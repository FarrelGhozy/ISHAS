'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileImage,
  Layers3,
  MapPin,
  Plus,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { FloorRecord } from '@/features/pengelola/model';
import {
  ManagerHeading,
  ManagerScope,
} from '@/features/pengelola/components/manager-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function LocationManagementPage() {
  const buildings = useMockStore((state) => state.buildings);
  const areas = useMockStore((state) => state.areas);
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0].id);
  const [createOpen, setCreateOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [areaFloor, setAreaFloor] = useState<FloorRecord | null>(null);
  const [buildingName, setBuildingName] = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [floorName, setFloorName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [areaZone, setAreaZone] = useState('');
  const [feedback, setFeedback] = useState('');
  const selectedBuilding =
    buildings.find((item) => item.id === selectedBuildingId) ?? buildings[0];
  const totalFloors = buildings.reduce(
    (total, building) => total + building.floors.length,
    0,
  );
  const availablePlans = buildings.reduce(
    (total, building) =>
      total + building.floors.filter((floor) => floor.planFile).length,
    0,
  );

  function uploadPlan(buildingId: string, floorId: string, fileName: string) {
    if (!fileName) return;
    mockStoreActions.updateFloorPlan(buildingId, floorId, fileName);
    setFeedback(
      `${fileName} tersimpan sebagai versi denah baru untuk simulasi lokal.`,
    );
  }

  return (
    <>
      <ManagerHeading
        title="Gedung & Denah"
        description="Kelola struktur lokasi dan unggah denah milik pesantren sebelum Asesor mencatat titik temuan."
        action={
          <button
            className="primary-button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus /> Tambah gedung
          </button>
        }
      />
      <ManagerScope compact />
      <div className="location-source-banner">
        <UploadCloud />
        <div>
          <b>Denah berasal dari Pengelola Pesantren</b>
          <p>
            Unggah satu JPG, PNG, atau PDF untuk setiap gedung dan lantai. Jika
            belum tersedia, assessment tetap berjalan menggunakan Daftar Area.
          </p>
        </div>
        <span className="status status-blue">Data dummy</span>
      </div>
      {feedback ? (
        <div className="admin-feedback">
          <CheckCircle2 /> {feedback}
        </div>
      ) : null}
      <div className="location-stats">
        <article>
          <Building2 />
          <span>
            <b>{buildings.length} gedung</b>
            <small>Master lokasi aktif</small>
          </span>
        </article>
        <article>
          <Layers3 />
          <span>
            <b>{totalFloors} lantai</b>
            <small>{areas.length} area terdaftar</small>
          </span>
        </article>
        <article>
          <FileImage />
          <span>
            <b>{availablePlans} denah</b>
            <small>
              {totalFloors - availablePlans} lantai belum memiliki denah
            </small>
          </span>
        </article>
      </div>
      <div className="location-management-layout">
        <aside className="surface location-building-list">
          <div className="surface-head">
            <div>
              <h2>Daftar gedung</h2>
              <p>Pilih gedung untuk mengatur lantai dan denah</p>
            </div>
          </div>
          {buildings.map((building) => (
            <button
              key={building.id}
              className={building.id === selectedBuilding.id ? 'active' : ''}
              onClick={() => setSelectedBuildingId(building.id)}
            >
              <span>
                <Building2 />
              </span>
              <div>
                <b>{building.name}</b>
                <small>
                  {building.code} · {building.floors.length} lantai
                </small>
              </div>
              <ChevronRight />
            </button>
          ))}
        </aside>
        <section className="surface location-floor-panel">
          <div className="surface-head">
            <div>
              <p className="section-kicker">{selectedBuilding.code}</p>
              <h2>{selectedBuilding.name}</h2>
              <p>
                Setiap pembaruan denah membuat versi baru agar temuan lama tetap
                menunjuk gambar yang digunakan saat assessment.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setFloorOpen(true)}
            >
              <Plus /> Tambah lantai
            </button>
          </div>
          <div className="location-floor-list">
            {selectedBuilding.floors.map((floor) => {
              const floorAreas = areas.filter(
                (area) =>
                  area.buildingId === selectedBuilding.id &&
                  area.floor === floor.name,
              );
              return (
                <article key={floor.id}>
                  <div className="location-floor-head">
                    <span>
                      <Layers3 />
                    </span>
                    <div>
                      <b>{floor.name}</b>
                      <small>
                        {floor.id} · {floorAreas.length} area terdaftar
                      </small>
                    </div>
                    <span
                      className={`status ${floor.planFile ? 'status-green' : 'status-amber'}`}
                    >
                      {floor.planFile ? <FileCheck2 /> : <AlertTriangle />}
                      {floor.planFile ? 'Denah tersedia' : 'Belum ada denah'}
                    </span>
                  </div>
                  {floor.planFile ? (
                    <div className="location-plan-file">
                      <FileImage />
                      <span>
                        <b>{floor.planFile}</b>
                        <small>
                          {floor.planVersion} · {floor.uploadedAt}
                        </small>
                        <small>{floor.uploadedBy}</small>
                      </span>
                    </div>
                  ) : (
                    <DataState
                      variant="empty"
                      title="Denah belum diunggah"
                      description="Daftar Area tetap dapat digunakan oleh Asesor."
                      compact
                    />
                  )}
                  <div className="location-area-list">
                    <div>
                      <b>Area pada lantai ini</b>
                      <button onClick={() => setAreaFloor(floor)}>
                        <Plus /> Tambah area
                      </button>
                    </div>
                    {floorAreas.length ? (
                      <p>
                        {floorAreas.map((area) => (
                          <span key={area.id}>{area.name}</span>
                        ))}
                      </p>
                    ) : (
                      <small>
                        Belum ada area. Asesor belum dapat memilih lokasi
                        spesifik.
                      </small>
                    )}
                  </div>
                  <label className="assessment-upload-button location-upload-button">
                    <Upload />{' '}
                    {floor.planFile ? 'Unggah versi baru' : 'Unggah denah'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,.pdf"
                      onChange={(event) =>
                        uploadPlan(
                          selectedBuilding.id,
                          floor.id,
                          event.target.files?.[0]?.name ?? '',
                        )
                      }
                    />
                  </label>
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <section className="surface location-data-flow">
        <div className="surface-head">
          <div>
            <h2>Alur sumber data</h2>
            <p>Siapa membuat data dan kapan data dipakai</p>
          </div>
        </div>
        <div>
          {[
            ['1', 'Pengelola', 'Mendaftarkan gedung, lantai, area, dan denah.'],
            ['2', 'Asesor', 'Memilih area dan mencatat temuan serta bukti.'],
            [
              '3',
              'Sistem',
              'Menghitung kategori risiko dari konfigurasi Published.',
            ],
            [
              '4',
              'Pengelola',
              'Menjalankan tindak lanjut dan mengunggah bukti.',
            ],
          ].map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <b>{title}</b>
                <p>{description}</p>
              </div>
              {number !== '4' ? <ArrowRight /> : <CheckCircle2 />}
            </article>
          ))}
        </div>
      </section>

      {createOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="building-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Master lokasi</p>
                <h2 id="building-create-title">Tambah gedung pesantren</h2>
                <p>Gedung baru dimulai dengan satu lantai tanpa denah.</p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                aria-label="Tutup form gedung"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const result = mockStoreActions.addBuilding({
                  institutionCode: 'PSN-0018',
                  code: buildingCode,
                  name: buildingName,
                });
                if (!result.ok) return;
                setSelectedBuildingId(result.data);
                setFeedback(`${buildingName} ditambahkan sebagai data dummy.`);
                setBuildingName('');
                setBuildingCode('');
                setCreateOpen(false);
              }}
            >
              <div className="admin-form-grid">
                <label>
                  Nama gedung
                  <input
                    required
                    value={buildingName}
                    onChange={(event) => setBuildingName(event.target.value)}
                    placeholder="Contoh: Gedung Tahfidz"
                  />
                </label>
                <label>
                  Kode gedung
                  <input
                    required
                    value={buildingCode}
                    onChange={(event) => setBuildingCode(event.target.value)}
                    placeholder="Contoh: GD-THF"
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCreateOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <Plus /> Simpan gedung dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}

      {floorOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="floor-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">{selectedBuilding.name}</p>
                <h2 id="floor-create-title">Tambah lantai</h2>
                <p>
                  Denah dan area dapat ditambahkan setelah lantai tersimpan.
                </p>
              </div>
              <button
                onClick={() => setFloorOpen(false)}
                aria-label="Tutup form lantai"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const result = mockStoreActions.addFloor(
                  selectedBuilding.id,
                  floorName,
                );
                if (!result.ok) return;
                setFeedback(
                  `${floorName} ditambahkan pada ${selectedBuilding.name}.`,
                );
                setFloorName('');
                setFloorOpen(false);
              }}
            >
              <label className="manager-followup-note">
                Nama lantai
                <input
                  required
                  value={floorName}
                  onChange={(event) => setFloorName(event.target.value)}
                  placeholder="Contoh: Lantai 3"
                />
              </label>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setFloorOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <Plus /> Simpan lantai dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}

      {areaFloor ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="area-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">
                  {selectedBuilding.name} · {areaFloor.name}
                </p>
                <h2 id="area-create-title">Tambah area</h2>
                <p>
                  Area menjadi pilihan lokasi utama ketika denah tidak tersedia.
                </p>
              </div>
              <button
                onClick={() => setAreaFloor(null)}
                aria-label="Tutup form area"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const result = mockStoreActions.addArea({
                  institutionCode: 'PSN-0018',
                  buildingId: selectedBuilding.id,
                  floor: areaFloor.name,
                  name: areaName,
                  zone: areaZone,
                });
                if (!result.ok) return;
                setFeedback(
                  `${areaName} ditambahkan sebagai area observasi dummy.`,
                );
                setAreaName('');
                setAreaZone('');
                setAreaFloor(null);
              }}
            >
              <div className="admin-form-grid">
                <label>
                  Nama area
                  <input
                    required
                    value={areaName}
                    onChange={(event) => setAreaName(event.target.value)}
                    placeholder="Contoh: Tangga Timur"
                  />
                </label>
                <label>
                  Zona/blok
                  <input
                    required
                    value={areaZone}
                    onChange={(event) => setAreaZone(event.target.value)}
                    placeholder="Contoh: Blok B"
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setAreaFloor(null)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <MapPin /> Simpan area dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}
    </>
  );
}
