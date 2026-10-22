import React, { createContext, useContext, useState, useEffect } from 'react';

const CivilContext = createContext(null);

// INVESTOR SAFE PROJECT PLAN (Pembulatan Ke Atas & Cost Escalation Buffer)
const TEMBALANG_PROJECT = [
    {
        id: 'prj-tembalang-01',
        code: 'TKS-KOS-TBL-001-SAFE',
        name: 'Pembangunan Rumah Kos Eksekutif Tembalang 3 Lantai (24 Kamar En-Suite) - Safe Investor Plan',
        client: 'Investor Properti Tembalang / Pemilik Lahan',
        location: 'Koridor Tembalang / Banyumanik, Kota Semarang (Radius UNDIP/POLINES)',
        contractValue: 2580000000, // Rp 2.580.000.000 (CAPEX + 10% Safety Buffer / Pembulatan Ke Atas)
        baseCapex: 2346000000, // Baseline Proposal
        safetyBuffer: 234000000, // Reserve Fund 10%
        startDate: '2026-05-01',
        endDate: '2027-04-30',
        progressPhysical: 43.7, // Fase 1 selesai 100% (6 kamar aktif)
        progressFinancial: 43.7,
        status: 'Fase 1 Selesai & Beroperasi',
        type: 'Konstruksi Hunian Vertikal 3 Lantai (KDB 65%)',
        landArea: '200 m² (10 m × 20 m)',
        buildingArea: '384 m² (3 lantai × 128 m²)',
        ratePerSqm: 'Rp 5.500.000 / m² (Pembulatan Ke Atas)',
        capacity: '24 Kamar En-Suite + Parkir 28 Motor',
        concreteVolume: '126.9 m³ (Mutu K-250 / f\'c 20 MPa)',
        steelWeight: '12.7 Ton (Rasio 100 kg/m³)',
        foundation: '24 Titik Pondasi Telapak 160 × 160 × 30 cm + Buffer Strauss Pile',
        wallMaterial: 'Bata Ringan AAC 100 mm',
        netYieldSafe: '14.5% / tahun',
        paybackSafe: '7.8 Tahun'
    }
];

// INVESTOR SAFE BOQ DATA (Pembulatan Ke Atas & Safety Margin) - Total Rp 2.580.000.000
const TEMBALANG_BOQ = [
    { id: 'b1', category: 'Pekerjaan Persiapan', code: '1.1', item: 'Penyelidikan Tanah (2 Titik Sondir + 1 Boring Dangkal)', volume: 1, unit: 'Ls', price: 8000000, progress: 100 },
    { id: 'b2', category: 'Pekerjaan Persiapan', code: '1.2', item: 'Pengurusan KRK, PBG SIMBG & Retribusi Kota Semarang', volume: 1, unit: 'Ls', price: 32000000, progress: 100 },
    { id: 'b3', category: 'Pekerjaan Tanah', code: '2.1', item: 'Galian Tanah Pondasi Telapak 24 Titik (78 m³)', volume: 78.0, unit: 'm³', price: 100000, progress: 100 },
    { id: 'b4', category: 'Pekerjaan Tanah', code: '2.2', item: 'Urug Pasir, Pemadatan & Lantai Kerja', volume: 12.0, unit: 'm³', price: 300000, progress: 100 },
    { id: 'b5', category: 'Pekerjaan Struktur', code: '2.3', item: 'Beton Pondasi Telapak 160x160x30cm (K-250 Adhimix)', volume: 18.4, unit: 'm³', price: 1250000, progress: 100 },
    { id: 'b6', category: 'Pekerjaan Struktur', code: '2.4', item: 'Pembesian Pondasi & Sloof (D12 & D14 Krakatau Steel)', volume: 2.1, unit: 'Ton', price: 16000000, progress: 100 },
    { id: 'b7', category: 'Pekerjaan Struktur', code: '3.1', item: 'Beton Utama K-250 (Kolom 250x250, Balok 200x400, Pelat Lt 2 & 3)', volume: 126.9, unit: 'm³', price: 1250000, progress: 43.7 },
    { id: 'b8', category: 'Pekerjaan Struktur', code: '3.2', item: 'Pembesian Ulir D12 & D14 (Rasio 100 kg/m³ + Waste 5%)', volume: 12.7, unit: 'Ton', price: 16000000, progress: 43.7 },
    { id: 'b9', category: 'Pekerjaan Struktur', code: '3.3', item: 'Bekisting Kolom, Balok & Pelat (Kayu Lapis 18mm & Pipe Support)', volume: 720, unit: 'm²', price: 180000, progress: 43.7 },
    { id: 'b10', category: 'Pekerjaan Arsitektur', code: '4.1', item: 'Dinding Bata Ringan AAC 100 mm Citicon', volume: 850, unit: 'm²', price: 150000, progress: 25.0 },
    { id: 'b11', category: 'Pekerjaan Arsitektur', code: '4.2', item: 'Plesteran & Acian Mortar Utama MU-380', volume: 1700, unit: 'm²', price: 75000, progress: 25.0 },
    { id: 'b12', category: 'Pekerjaan Arsitektur', code: '4.3', item: 'Keramik Granit Tile 60x60 Monalisa', volume: 384, unit: 'm²', price: 240000, progress: 25.0 },
    { id: 'b13', category: 'Pekerjaan Arsitektur', code: '4.4', item: 'Waterproofing Pelat Lantai & Roof 2 Lapis (Sika/Fosroc)', volume: 256, unit: 'm²', price: 110000, progress: 50.0 },
    { id: 'b14', category: 'Pekerjaan MEP', code: '5.1', item: 'Sanitair Kloset TOTO, Shower & Water Heater Ariston (24 Unit)', volume: 24, unit: 'Set', price: 5200000, progress: 25.0 },
    { id: 'b15', category: 'Pekerjaan MEP', code: '5.2', item: 'Instalasi Listrik 1.300VA per Kamar & Smart Lock RFID (24 Unit)', volume: 24, unit: 'Set', price: 3500000, progress: 25.0 },
    { id: 'b16', category: 'Pekerjaan MEP', code: '5.3', item: 'Piping Air Bersih/Kotor & Septic Tank Biofilter 45m²', volume: 1, unit: 'Ls', price: 50000000, progress: 50.0 },
    { id: 'b17', category: 'Furnitur', code: '6.1', item: 'Furnitur Kamar (Springbed, Meja, Lemari, AC 1/2 PK Sharp) (24 Unit)', volume: 24, unit: 'Set', price: 9000000, progress: 25.0 },
    { id: 'b18', category: 'Fasilitas & Kontingensi', code: '7.1', item: 'Parkir Motor 45m², Lobi, Dapur Komunal & Rooftop Jemuran', volume: 1, unit: 'Ls', price: 30000000, progress: 32.0 },
    { id: 'b19', category: 'Fasilitas & Kontingensi', code: '7.2', item: 'Cadangan Kontingensi Safety Buffer Investor (12%)', volume: 1, unit: 'Ls', price: 276000000, progress: 40.0 }
];

// INTEGRATED S-CURVE DATA
const TEMBALANG_S_CURVE = {
    labels: ['Bulan 1', 'Bulan 2', 'Bulan 3', 'Bulan 4', 'Bulan 5', 'Bulan 6', 'Bulan 7', 'Bulan 8', 'Bulan 9', 'Bulan 10', 'Bulan 11', 'Bulan 12'],
    planCumulative: [5, 12, 22, 35, 43.7, 52, 60, 68, 76, 84, 92, 100],
    actualCumulative: [5, 13, 23, 36, 43.7, null, null, null, null, null, null, null],
    planPeriodic: [5, 7, 10, 13, 8.7, 8.3, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0],
    actualPeriodic: [5, 8, 10, 13, 7.7, null, null, null, null, null, null, null]
};

// INTEGRATED MATERIAL PRICES (Semarang Market 2026 - Pembulatan Ke Atas Buffer)
const TEMBALANG_MATERIALS = [
    { id: 'm1', name: 'Beton Ready Mix K-250 (Adhimix)', category: 'Beton', unit: 'm³', currentPrice: 1250000, prevPrice: 1150000, trend: 'up' },
    { id: 'm2', name: 'Besi Beton Ulir D12 & D14 (Krakatau Steel)', category: 'Baja', unit: 'Kg', currentPrice: 16000, prevPrice: 14500, trend: 'up' },
    { id: 'm3', name: 'Bata Ringan AAC 100 mm (Citicon)', category: 'Dinding', unit: 'm²', currentPrice: 150000, prevPrice: 135000, trend: 'up' },
    { id: 'm4', name: 'Semen Mortar MU-380 (Perekat AAC)', category: 'Perekat', unit: 'Sak (40kg)', currentPrice: 90000, prevPrice: 85000, trend: 'up' },
    { id: 'm5', name: 'Pasir Pasang Progo Super', category: 'Agregat', unit: 'm³', currentPrice: 300000, prevPrice: 280000, trend: 'up' },
    { id: 'm6', name: 'Batu Belah 15/20 Pondasi', category: 'Pondasi', unit: 'm³', currentPrice: 240000, prevPrice: 220000, trend: 'up' }
];

const TEMBALANG_DAILY_LOGS = [
    {
        id: 'log-tbl-101',
        projectId: 'prj-tembalang-01',
        date: '2026-08-04',
        weather: { morning: 'Cerah', afternoon: 'Berawan', evening: 'Cerah' },
        manpower: { mandor: 2, tukangBatu: 6, tukangBesi: 8, tukangKayu: 4, pekerja: 14 },
        equipment: [
            { name: 'Excavator PC75 (Galian Pondasi & Sloof)', status: 'Beroperasi (7 Jam)' },
            { name: 'Stamper Kuda Pemadat Tanah dasar', status: 'Beroperasi (5 Jam)' },
            { name: 'Bar Bender & Bar Cutter D12/D14', status: 'Beroperasi (8 Jam)' }
        ],
        materials: [
            { name: 'Bata Ringan AAC 100 mm', qty: '20 m³', supplier: 'PT Citicon Nusantara' },
            { name: 'Semen Mortar Perekat AAC', qty: '40 Sak', supplier: 'Mortar Utama MU-380' },
            { name: 'Besi Beton Ulir D12 & D14', qty: '2.5 Ton', supplier: 'PT Krakatau Steel' }
        ],
        workDetails: 'Pemasangan dinding bata ringan AAC lantai dasar (zona lobi & kamar 101-106). Penyiapan stek kolom D14 (600mm) diselang-seling untuk sambungan Fase 2. Pemadatan tanah lantai kerja parkir motor 45 m².',
        issues: 'Kedalaman tanah keras hasil sondir titik 1 sesuai pada kedalaman -2.2 meter. Daya dukung lempung Tembalang terverifikasi 140 kPa.',
        supervisor: 'Ir. Ahmad Zaelani, ST. (Site Manager TKS-KOS-TBL-001)',
        photos: [
            { id: 'p-tbl-1', title: 'Pasangan Dinding Bata Ringan AAC Lt 1', category: 'In Progress', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80' },
            { id: 'p-tbl-2', title: 'Pemeriksaan Stek Kolom D14 Lt 2', category: 'In Progress', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' }
        ]
    },
    {
        id: 'log-tbl-102',
        projectId: 'prj-tembalang-01',
        date: '2026-08-02',
        weather: { morning: 'Cerah', afternoon: 'Hujan Gerimis', evening: 'Cerah' },
        manpower: { mandor: 2, tukangBatu: 8, tukangBesi: 10, tukangKayu: 6, pekerja: 16 },
        equipment: [
            { name: 'Concrete Pump Truck', status: 'Selesai Pengecoran (4 Jam)' },
            { name: 'Concrete Vibrator Mekanis', status: 'Beroperasi (5 Jam)' }
        ],
        materials: [
            { name: 'Beton Ready Mix K-250', qty: '42.3 m³', supplier: 'PT Adhimix Precast Semarang' }
        ],
        workDetails: 'Pengecoran pelat lantai 2 tebal 120 mm (Grid 4.0m x 7.5m) dan balok induk 200x400mm. Uji genang waterproofing 2 lapis dilaksanakan 24 jam sebelum pemasangan atap sementara.',
        issues: 'Hujan gerimis pada akhir pengecoran; permukaan pelat langsung ditutup terpal sintetis untuk menjaga hidrasi semen.',
        supervisor: 'Budi Santoso, ST. (Pelaksana Sipil)',
        photos: [
            { id: 'p-tbl-3', title: 'Pengecoran Pelat Lantai 2 Mutu K-250', category: 'In Progress', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80' }
        ]
    }
];

const TEMBALANG_CASHFLOW = [
    {
        id: 'cf-tbl-1',
        projectId: 'prj-tembalang-01',
        date: '2026-05-05',
        type: 'IN',
        category: 'Modal Awal Fase 1 (Ekuitas Investor)',
        amount: 1150000000,
        description: 'Setoran Modal Awal Fase 1 Pekerjaan Struktur & 6 Kamar Aktif Lt 1 (Dengan Safety Buffer)',
        status: 'Lunas',
        proof: 'Kwitansi-Modal-Fase1.pdf'
    },
    {
        id: 'cf-tbl-2',
        projectId: 'prj-tembalang-01',
        date: '2026-05-10',
        type: 'OUT',
        category: 'Perizinan & Persiapan (KRK, PBG & Sondir)',
        amount: 40000000,
        description: 'Biaya Uji Soil Test 2 Titik Sondir, KRK, PBG SIMBG & Retribusi Kota Semarang (Rounded)',
        status: 'Lunas',
        proof: 'Retribusi-PBG-Semarang.pdf'
    },
    {
        id: 'cf-tbl-3',
        projectId: 'prj-tembalang-01',
        date: '2026-06-01',
        type: 'OUT',
        category: 'Pekerjaan Struktur & Pondasi Telapak',
        amount: 495000000,
        description: 'Pengadaan Beton K-250 126.9m³ & Pembesian 12.7 Ton Pondasi Telapak 160x160cm (Safe Buffer)',
        status: 'Lunas',
        proof: 'INV-Adhimix-Krakatau.pdf'
    },
    {
        id: 'cf-tbl-4',
        projectId: 'prj-tembalang-01',
        date: '2026-07-01',
        type: 'OUT',
        category: 'Arsitektur & Finishing 6 Kamar Lt 1',
        amount: 345000000,
        description: 'Pasangan Dinding AAC, Keramik, Plafond & Plumbing 6 Kamar Mandi Dalam',
        status: 'Lunas',
        proof: 'INV-Finishing-Lt1.pdf'
    },
    {
        id: 'cf-tbl-5',
        projectId: 'prj-tembalang-01',
        date: '2026-07-15',
        type: 'OUT',
        category: 'Pengadaan Furnitur 6 Kamar Lt 1',
        amount: 54000000,
        description: 'Pengadaan AC, Water Heater, Springbed, Meja Belajar & Smart Lock 6 Unit (Rp9M/Set)',
        status: 'Lunas',
        proof: 'INV-Furnitur-Lt1.pdf'
    },
    {
        id: 'cf-tbl-6',
        projectId: 'prj-tembalang-01',
        date: '2026-08-01',
        type: 'IN',
        category: 'Pemasukan Termyn Sewa Kos (6 Kamar)',
        amount: 59850000,
        description: 'Penerimaan Uang Sewa Tahun 1 (6 Kamar x Rp 1.750.000/bln x 6 Bln, Okupansi 95%)',
        status: 'Lunas',
        proof: 'Kwitansi-Sewa-Kos-Tahun1.pdf'
    },
    {
        id: 'cf-tbl-7',
        projectId: 'prj-tembalang-01',
        date: '2026-08-04',
        type: 'OUT',
        category: 'Operasional Lapangan (OPEX Bulan Agustus)',
        amount: 8000000,
        description: 'Gaji Caretaker Rp2.5M, Kebersihan Rp1.2M, Internet 100Mbps Rp700K, Utilitas Rp1.5M, Maintenance Rp1.5M, Admin Rp600K',
        status: 'Lunas',
        proof: 'OPEX-Agustus-2026.pdf'
    }
];

const TEMBALANG_SITE_PHOTOS = [
    {
        id: 'ph-tbl-01',
        projectId: 'prj-tembalang-01',
        date: '2026-08-04',
        title: 'Tampak Depan Fasad Tropical Modern Industrial',
        category: 'Struktur & Fasad',
        stage: 'In Progress',
        location: 'Sisi Barat Koridor Tembalang',
        description: 'Aplikasi secondary skin kawat anyam baja & roster beton penghalau sinar matahari sore.',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'ph-tbl-02',
        projectId: 'prj-tembalang-01',
        date: '2026-08-03',
        title: 'Kamar Mandi Dalam 1.5 x 1.5 m En-Suite',
        category: 'Finishing Arsitektur',
        stage: 'In Progress',
        location: 'Kamar 102 - Lantai 1',
        description: 'Lengkap dengan Kloset Duduk, Shower, dan Ariston Water Heater Listrik.',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'ph-tbl-03',
        projectId: 'prj-tembalang-01',
        date: '2026-08-02',
        title: 'Interior Kamar Eksekutif 12 m² Full Furnished',
        category: 'Interior & Furnitur',
        stage: 'In Progress',
        location: 'Kamar 101 - Lantai 1',
        description: 'Springbed 120x200cm, Meja Belajar Minimalis, Lemari Pakaian, AC 1/2 PK, & Smart Lock RFID.',
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'ph-tbl-04',
        projectId: 'prj-tembalang-01',
        date: '2026-08-01',
        title: 'Area Dapur Komunal & Parkir 28 Motor',
        category: 'Fasilitas Bersama',
        stage: 'Before',
        location: 'Lantai Dasar (Luas 128 m²)',
        description: 'Parkir 45 m² kapasitas 28 motor + pos jaga dan lobi penerima.',
        url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80'
    }
];

export function CivilProvider({ children }) {
    const [projects, setProjects] = useState(TEMBALANG_PROJECT);
    const [boqItems, setBoqItems] = useState(TEMBALANG_BOQ);
    const [sCurveData, setSCurveData] = useState(TEMBALANG_S_CURVE);
    const [materials, setMaterials] = useState(TEMBALANG_MATERIALS);
    const [dailyLogs, setDailyLogs] = useState(TEMBALANG_DAILY_LOGS);
    const [cashFlow, setCashFlow] = useState(TEMBALANG_CASHFLOW);
    const [sitePhotos, setSitePhotos] = useState(TEMBALANG_SITE_PHOTOS);

    // Save state
    useEffect(() => {
        localStorage.setItem('civil_projects_v4_safe', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('civil_boq_v4_safe', JSON.stringify(boqItems));
    }, [boqItems]);

    useEffect(() => {
        localStorage.setItem('civil_daily_logs_v4_safe', JSON.stringify(dailyLogs));
    }, [dailyLogs]);

    useEffect(() => {
        localStorage.setItem('civil_cashflow_v4_safe', JSON.stringify(cashFlow));
    }, [cashFlow]);

    useEffect(() => {
        localStorage.setItem('civil_site_photos_v4_safe', JSON.stringify(sitePhotos));
    }, [sitePhotos]);

    // Dynamic actions for full interactivity
    const addProject = (project) => {
        const newProj = { ...project, id: `prj-${Date.now()}` };
        setProjects(prev => [newProj, ...prev]);
    };

    const addBoqItem = (item) => {
        const newItem = { ...item, id: `boq-${Date.now()}` };
        setBoqItems(prev => [...prev, newItem]);
    };

    const updateBoqItem = (id, updated) => {
        setBoqItems(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    };

    const deleteBoqItem = (id) => {
        setBoqItems(prev => prev.filter(item => item.id !== id));
    };

    const addDailyLog = (log) => {
        const newLog = { ...log, id: `log-${Date.now()}` };
        setDailyLogs(prev => [newLog, ...prev]);
    };

    const addCashFlow = (item) => {
        const newItem = { ...item, id: `cf-${Date.now()}` };
        setCashFlow(prev => [newItem, ...prev]);
    };

    const addSitePhoto = (photo) => {
        const newPhoto = { ...photo, id: `ph-${Date.now()}` };
        setSitePhotos(prev => [newPhoto, ...prev]);
    };

    const deleteDailyLog = (id) => {
        setDailyLogs(prev => prev.filter(item => item.id !== id));
    };

    const deleteCashFlow = (id) => {
        setCashFlow(prev => prev.filter(item => item.id !== id));
    };

    const deleteSitePhoto = (id) => {
        setSitePhotos(prev => prev.filter(item => item.id !== id));
    };

    return (
        <CivilContext.Provider value={{
            projects,
            boqItems,
            sCurveData,
            materials,
            dailyLogs,
            cashFlow,
            sitePhotos,
            addProject,
            addBoqItem,
            updateBoqItem,
            deleteBoqItem,
            addDailyLog,
            addCashFlow,
            addSitePhoto,
            deleteDailyLog,
            deleteCashFlow,
            deleteSitePhoto
        }}>
            {children}
        </CivilContext.Provider>
    );
}

export function useCivil() {
    const context = useContext(CivilContext);
    if (!context) {
        throw new Error('useCivil must be used within a CivilProvider');
    }
    return context;
}
