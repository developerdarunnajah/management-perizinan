-- SKEMA DATABASE PERIZINAN (FINAL)

-- 1. Tabel Pengguna
DROP TABLE IF EXISTS pengguna;
CREATE TABLE pengguna (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    kata_sandi TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    peran TEXT NOT NULL CHECK (peran IN ('operator_ppdb', 'operator_asrama', 'operator_perizinan', 'ndalem')),
    aktif BOOLEAN DEFAULT 1,
    dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Asrama
DROP TABLE IF EXISTS asrama;
CREATE TABLE asrama (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_asrama TEXT NOT NULL,
    kapasitas INTEGER NOT NULL DEFAULT 0,
    dibuat_oleh INTEGER,
    dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
    dihapus_pada DATETIME DEFAULT NULL,
    FOREIGN KEY (dibuat_oleh) REFERENCES pengguna(id)
);

-- 3. Tabel Santri
DROP TABLE IF EXISTS santri;
CREATE TABLE santri (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nis TEXT UNIQUE,
    nama_lengkap TEXT NOT NULL,
    jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
    foto_url TEXT,
    nama_wali TEXT,
    nomor_wali TEXT,
    id_asrama INTEGER,
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'lulus', 'boyong')),
    
    dibuat_oleh INTEGER,
    diubah_oleh INTEGER,
    dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
    diubah_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
    dihapus_pada DATETIME DEFAULT NULL,
    
    FOREIGN KEY (id_asrama) REFERENCES asrama(id),
    FOREIGN KEY (dibuat_oleh) REFERENCES pengguna(id)
);

-- 4. Tabel Perizinan
DROP TABLE IF EXISTS perizinan;
CREATE TABLE perizinan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_santri INTEGER NOT NULL,
    alasan TEXT NOT NULL,
    status TEXT DEFAULT 'MENUNGGU' CHECK (status IN ('MENUNGGU', 'DISETUJUI', 'DITOLAK', 'KEMBALI', 'TERLAMBAT')),
    catatan_ndalem TEXT,
    
    waktu_pengajuan DATETIME DEFAULT CURRENT_TIMESTAMP,
    diajukan_oleh INTEGER,
    
    waktu_disetujui DATETIME,
    disetujui_oleh INTEGER,
    tenggat_waktu DATETIME, -- Deadline
    
    waktu_kembali DATETIME, -- Realisasi
    dicatat_kembali_oleh INTEGER,
    
    dibatalkan_pada DATETIME DEFAULT NULL,
    
    FOREIGN KEY (id_santri) REFERENCES santri(id),
    FOREIGN KEY (diajukan_oleh) REFERENCES pengguna(id)
);

-- 5. Tabel Aturan Sanksi
DROP TABLE IF EXISTS aturan_sanksi;
CREATE TABLE aturan_sanksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    min_menit INTEGER NOT NULL,
    max_menit INTEGER NOT NULL,
    hukuman TEXT NOT NULL,
    dibuat_oleh INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_santri_nama ON santri(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_santri_status ON santri(status);