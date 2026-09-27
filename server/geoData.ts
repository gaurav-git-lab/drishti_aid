/**
 * DRISHTI-AID Geographical Scenarios & Reference Data
 * Expanded 250 km² regional disaster area coverage:
 * 1. Mumbai Metropolitan Flood Basin (Mithi River, Kurla, BKC, Dharavi & Greater Suburbs)
 * 2. Chennai Metropolitan Basin (Adyar, Chembarambakkam, Saidapet, Kotturpuram & Coastal Plain)
 * 3. Kerala Periyar Regional Basin (Periyar River, Aluva Hub, Cochin Airport Plain & Lowlands)
 */

export interface DisasterScenario {
  id: string;
  name: string;
  state: string;
  riverBasin: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  areaKm2: number;
  disasterDate: string;
  satelliteSensor: string;
  orbitPass: string;
  sarPolarization: string;
  rainfall24hMm: number;
  epicenter: [number, number];
  shelters: ShelterPoint[];
  roadNetwork: RoadNetwork;
  description: string;
}

export interface ShelterPoint {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'ndrf_base' | 'helipad';
  coordinates: [number, number]; // [lat, lng]
  capacity: number;
  currentOccupancy: number;
  medicalStaff: number;
  floodSafe: boolean;
  contact: string;
  supplies: {
    foodPacks: number;
    waterLiters: number;
    ambulances: number;
    rescueBoats: number;
  };
}

export interface RoadNode {
  id: string;
  coordinates: [number, number];
  name?: string;
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  type: 'highway' | 'arterial' | 'local' | 'bridge';
  distanceKm: number;
  lanes: number;
  baseSpeedKmh: number;
}

export interface RoadNetwork {
  nodes: RoadNode[];
  edges: RoadEdge[];
}

export const SCENARIOS: Record<string, DisasterScenario> = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai Central Basin (Mithi River & Kurla Corridor)',
    state: 'Maharashtra',
    riverBasin: 'Mithi River Catchment & Mahim Creek',
    center: [19.068, 72.875],
    zoom: 12,
    bounds: [
      [18.995, 72.795],
      [19.141, 72.955],
    ],
    areaKm2: 250.0,
    disasterDate: '26 July Cloudburst Event (Simulated T+4h SAR Pass)',
    satelliteSensor: 'Sentinel-1C C-SAR (Interferometric Wide)',
    orbitPass: 'Ascending Track 089',
    sarPolarization: 'VV + VH Dual-Pol',
    rainfall24hMm: 448,
    epicenter: [19.066, 72.874], // Kurla West / Mithi River bend
    description: 'High-density urban flood scenario along Mithi River affecting Kurla, Bandra-Kurla Complex (BKC), Sion, and Kalina.',
    shelters: [
      {
        id: 'mum_sh_1',
        name: 'BKC MMRDA Ground High-Ground Relief Camp',
        type: 'shelter',
        coordinates: [19.062, 72.862],
        capacity: 3500,
        currentOccupancy: 820,
        medicalStaff: 24,
        floodSafe: true,
        contact: '+91 22 2659 4000',
        supplies: { foodPacks: 12000, waterLiters: 40000, ambulances: 8, rescueBoats: 6 },
      },
      {
        id: 'mum_sh_2',
        name: 'Lokmanya Tilak Municipal General Hospital (Sion)',
        type: 'hospital',
        coordinates: [19.038, 72.861],
        capacity: 1400,
        currentOccupancy: 1100,
        medicalStaff: 180,
        floodSafe: true,
        contact: '+91 22 2407 6381',
        supplies: { foodPacks: 4000, waterLiters: 15000, ambulances: 18, rescueBoats: 4 },
      },
      {
        id: 'mum_sh_3',
        name: 'Bhabha Hospital (Kurla West)',
        type: 'hospital',
        coordinates: [19.071, 72.884],
        capacity: 500,
        currentOccupancy: 420,
        medicalStaff: 45,
        floodSafe: false, // At risk of perimeter flooding
        contact: '+91 22 2503 6211',
        supplies: { foodPacks: 1500, waterLiters: 5000, ambulances: 3, rescueBoats: 2 },
      },
      {
        id: 'mum_sh_4',
        name: 'University of Mumbai Kalina Campus Shelter',
        type: 'shelter',
        coordinates: [19.074, 72.863],
        capacity: 4000,
        currentOccupancy: 450,
        medicalStaff: 15,
        floodSafe: true,
        contact: '+91 22 2654 3000',
        supplies: { foodPacks: 10000, waterLiters: 35000, ambulances: 5, rescueBoats: 4 },
      },
      {
        id: 'mum_sh_5',
        name: 'Asian Heart Institute BKC',
        type: 'hospital',
        coordinates: [19.065, 72.859],
        capacity: 350,
        currentOccupancy: 280,
        medicalStaff: 90,
        floodSafe: true,
        contact: '+91 22 6698 6666',
        supplies: { foodPacks: 2000, waterLiters: 8000, ambulances: 6, rescueBoats: 1 },
      },
      {
        id: 'mum_sh_6',
        name: 'Sardar Vallabhbhai Patel High School Camp (Chunabhatti)',
        type: 'shelter',
        coordinates: [19.052, 72.879],
        capacity: 1200,
        currentOccupancy: 310,
        medicalStaff: 10,
        floodSafe: true,
        contact: '+91 22 2405 1200',
        supplies: { foodPacks: 3500, waterLiters: 12000, ambulances: 2, rescueBoats: 2 },
      },
      {
        id: 'mum_sh_7',
        name: 'NDRF 5th Battalion Tactical Outpost (Sion Fort)',
        type: 'ndrf_base',
        coordinates: [19.046, 72.863],
        capacity: 800,
        currentOccupancy: 120,
        medicalStaff: 30,
        floodSafe: true,
        contact: '+91 22 2404 0101',
        supplies: { foodPacks: 8000, waterLiters: 25000, ambulances: 12, rescueBoats: 22 },
      },
      {
        id: 'mum_sh_8',
        name: 'Guru Nanak College GTB Nagar Relief Center',
        type: 'shelter',
        coordinates: [19.034, 72.865],
        capacity: 2200,
        currentOccupancy: 190,
        medicalStaff: 12,
        floodSafe: true,
        contact: '+91 22 2407 1098',
        supplies: { foodPacks: 6000, waterLiters: 18000, ambulances: 4, rescueBoats: 3 },
      },
      {
        id: 'mum_sh_9',
        name: 'Santacruz Sports Ground Helipad & Evac Hub',
        type: 'helipad',
        coordinates: [19.088, 72.852],
        capacity: 2000,
        currentOccupancy: 140,
        medicalStaff: 18,
        floodSafe: true,
        contact: '+91 22 2611 7733',
        supplies: { foodPacks: 9000, waterLiters: 30000, ambulances: 10, rescueBoats: 8 },
      },
      {
        id: 'mum_sh_10',
        name: 'Vidyavihar Somaiya Vidyavihar University Safe Zone',
        type: 'shelter',
        coordinates: [19.075, 72.898],
        capacity: 5000,
        currentOccupancy: 800,
        medicalStaff: 35,
        floodSafe: true,
        contact: '+91 22 6728 3000',
        supplies: { foodPacks: 15000, waterLiters: 50000, ambulances: 8, rescueBoats: 5 },
      },
      {
        id: 'mum_sh_11',
        name: 'Rajawadi Municipal Hospital Ghatkopar',
        type: 'hospital',
        coordinates: [19.082, 72.905],
        capacity: 650,
        currentOccupancy: 590,
        medicalStaff: 110,
        floodSafe: true,
        contact: '+91 22 2509 4140',
        supplies: { foodPacks: 3000, waterLiters: 12000, ambulances: 10, rescueBoats: 3 },
      },
      {
        id: 'mum_sh_12',
        name: 'SCLR Elevated Staging Area (Emergency Node)',
        type: 'shelter',
        coordinates: [19.068, 72.883],
        capacity: 900,
        currentOccupancy: 210,
        medicalStaff: 8,
        floodSafe: true,
        contact: '+91 22 2504 9090',
        supplies: { foodPacks: 2500, waterLiters: 9000, ambulances: 4, rescueBoats: 4 },
      },
      {
        id: 'mum_sh_13',
        name: 'Kohinoor Hospital (Kurla West)',
        type: 'hospital',
        coordinates: [19.068, 72.891],
        capacity: 250,
        currentOccupancy: 195,
        medicalStaff: 55,
        floodSafe: true,
        contact: '+91 22 6755 6755',
        supplies: { foodPacks: 1200, waterLiters: 4500, ambulances: 5, rescueBoats: 2 },
      },
      {
        id: 'mum_sh_14',
        name: 'Dharavi Transit Camp Community Center',
        type: 'shelter',
        coordinates: [19.043, 72.854],
        capacity: 1800,
        currentOccupancy: 950,
        medicalStaff: 14,
        floodSafe: false, // In flood fringe
        contact: '+91 22 2401 3322',
        supplies: { foodPacks: 3000, waterLiters: 10000, ambulances: 3, rescueBoats: 5 },
      },
      {
        id: 'mum_sh_15',
        name: 'Chembur Municipal School Disaster Center',
        type: 'shelter',
        coordinates: [19.062, 72.903],
        capacity: 1500,
        currentOccupancy: 240,
        medicalStaff: 11,
        floodSafe: true,
        contact: '+91 22 2528 1111',
        supplies: { foodPacks: 4500, waterLiters: 16000, ambulances: 4, rescueBoats: 2 },
      },
      {
        id: 'mum_sh_16',
        name: 'Bandra Reclamation High-Ground Camp',
        type: 'shelter',
        coordinates: [19.049, 72.836],
        capacity: 3200,
        currentOccupancy: 480,
        medicalStaff: 20,
        floodSafe: true,
        contact: '+91 22 2640 4455',
        supplies: { foodPacks: 8000, waterLiters: 30000, ambulances: 6, rescueBoats: 4 },
      },
      {
        id: 'mum_sh_17',
        name: 'Lilavati Hospital & Research Centre',
        type: 'hospital',
        coordinates: [19.051, 72.830],
        capacity: 450,
        currentOccupancy: 390,
        medicalStaff: 140,
        floodSafe: true,
        contact: '+91 22 2675 1000',
        supplies: { foodPacks: 2200, waterLiters: 9000, ambulances: 9, rescueBoats: 1 },
      },
      {
        id: 'mum_sh_18',
        name: 'Kurla Station Skywalk Transit Node',
        type: 'shelter',
        coordinates: [19.066, 72.880],
        capacity: 600,
        currentOccupancy: 380,
        medicalStaff: 6,
        floodSafe: false,
        contact: '+91 22 2503 1122',
        supplies: { foodPacks: 1500, waterLiters: 4000, ambulances: 1, rescueBoats: 3 },
      },
      {
        id: 'mum_sh_19',
        name: 'Vakola Police Training Ground Camp',
        type: 'shelter',
        coordinates: [19.083, 72.863],
        capacity: 2500,
        currentOccupancy: 340,
        medicalStaff: 16,
        floodSafe: true,
        contact: '+91 22 2665 8900',
        supplies: { foodPacks: 7000, waterLiters: 24000, ambulances: 5, rescueBoats: 4 },
      },
      {
        id: 'mum_sh_20',
        name: 'Juhu Airfield Logistics & Helidrop Center',
        type: 'helipad',
        coordinates: [19.098, 72.833],
        capacity: 4500,
        currentOccupancy: 200,
        medicalStaff: 40,
        floodSafe: true,
        contact: '+91 22 2614 0022',
        supplies: { foodPacks: 20000, waterLiters: 65000, ambulances: 15, rescueBoats: 12 },
      },
    ],
    roadNetwork: {
      nodes: [
        { id: 'n_epicenter', coordinates: [19.066, 72.874], name: 'Kurla West Epicenter' },
        { id: 'n_bkc_e', coordinates: [19.064, 72.868], name: 'BKC East Junction' },
        { id: 'n_bkc_c', coordinates: [19.062, 72.862], name: 'BKC Center' },
        { id: 'n_bkc_w', coordinates: [19.058, 72.854], name: 'BKC Connector' },
        { id: 'n_sion_n', coordinates: [19.051, 72.866], name: 'Sion Koliwada North' },
        { id: 'n_sion_h', coordinates: [19.038, 72.861], name: 'Sion Hospital Circle' },
        { id: 'n_dharavi_e', coordinates: [19.044, 72.856], name: 'Dharavi 90ft Rd' },
        { id: 'n_bandra_e', coordinates: [19.053, 72.842], name: 'Kalanagar Junction' },
        { id: 'n_bandra_w', coordinates: [19.049, 72.836], name: 'Bandra Reclamation' },
        { id: 'n_kalina_s', coordinates: [19.072, 72.868], name: 'Kalina CST Road' },
        { id: 'n_kalina_u', coordinates: [19.074, 72.863], name: 'Mumbai Univ Gate' },
        { id: 'n_santacruz_e', coordinates: [19.082, 72.856], name: 'Western Express Kalina Flyover' },
        { id: 'n_santacruz_hub', coordinates: [19.088, 72.852], name: 'Santacruz Sports Ground' },
        { id: 'n_sclr_w', coordinates: [19.067, 72.876], name: 'SCLR Kurla Bridge Entry' },
        { id: 'n_sclr_c', coordinates: [19.068, 72.883], name: 'SCLR Midpoint Flyover' },
        { id: 'n_sclr_e', coordinates: [19.070, 72.894], name: 'SCLR Amar Mahal Exit' },
        { id: 'n_vidyavihar', coordinates: [19.075, 72.898], name: 'Somaiya Campus Hub' },
        { id: 'n_rajawadi', coordinates: [19.082, 72.905], name: 'Rajawadi Hospital Gate' },
        { id: 'n_chembur_w', coordinates: [19.062, 72.895], name: 'Tilak Nagar Road' },
        { id: 'n_chembur_c', coordinates: [19.062, 72.903], name: 'Chembur Naka' },
        { id: 'n_kurla_stn', coordinates: [19.066, 72.880], name: 'Kurla Station Rd' },
        { id: 'n_chunabhatti', coordinates: [19.052, 72.879], name: 'Eastern Express Chunabhatti' },
        { id: 'n_gtb_nagar', coordinates: [19.034, 72.865], name: 'GTB Nagar Circle' },
        { id: 'n_vakola', coordinates: [19.083, 72.863], name: 'Vakola Bridge' },
        { id: 'n_juhu', coordinates: [19.098, 72.833], name: 'Juhu Logistics Terminal' },
      ],
      edges: [
        { id: 'e1', from: 'n_epicenter', to: 'n_sclr_w', type: 'arterial', distanceKm: 0.35, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e2', from: 'n_sclr_w', to: 'n_bkc_e', type: 'arterial', distanceKm: 0.9, lanes: 4, baseSpeedKmh: 45 },
        { id: 'e3', from: 'n_bkc_e', to: 'n_bkc_c', type: 'highway', distanceKm: 0.7, lanes: 6, baseSpeedKmh: 55 },
        { id: 'e4', from: 'n_bkc_c', to: 'n_bkc_w', type: 'highway', distanceKm: 0.85, lanes: 6, baseSpeedKmh: 55 },
        { id: 'e5', from: 'n_bkc_w', to: 'n_bandra_e', type: 'arterial', distanceKm: 1.1, lanes: 4, baseSpeedKmh: 45 },
        { id: 'e6', from: 'n_bandra_e', to: 'n_bandra_w', type: 'arterial', distanceKm: 0.8, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e7', from: 'n_bkc_e', to: 'n_sion_n', type: 'local', distanceKm: 1.5, lanes: 2, baseSpeedKmh: 30 },
        { id: 'e8', from: 'n_sion_n', to: 'n_sion_h', type: 'arterial', distanceKm: 1.4, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e9', from: 'n_sion_h', to: 'n_gtb_nagar', type: 'local', distanceKm: 0.6, lanes: 2, baseSpeedKmh: 35 },
        { id: 'e10', from: 'n_bkc_w', to: 'n_dharavi_e', type: 'local', distanceKm: 1.6, lanes: 2, baseSpeedKmh: 25 },
        { id: 'e11', from: 'n_dharavi_e', to: 'n_sion_h', type: 'local', distanceKm: 0.9, lanes: 2, baseSpeedKmh: 30 },
        { id: 'e12', from: 'n_sclr_w', to: 'n_kalina_s', type: 'arterial', distanceKm: 0.95, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e13', from: 'n_kalina_s', to: 'n_kalina_u', type: 'arterial', distanceKm: 0.6, lanes: 4, baseSpeedKmh: 45 },
        { id: 'e14', from: 'n_kalina_u', to: 'n_santacruz_e', type: 'highway', distanceKm: 1.1, lanes: 6, baseSpeedKmh: 60 },
        { id: 'e15', from: 'n_santacruz_e', to: 'n_santacruz_hub', type: 'arterial', distanceKm: 0.8, lanes: 4, baseSpeedKmh: 45 },
        { id: 'e16', from: 'n_santacruz_hub', to: 'n_juhu', type: 'highway', distanceKm: 2.3, lanes: 6, baseSpeedKmh: 50 },
        { id: 'e17', from: 'n_sclr_w', to: 'n_sclr_c', type: 'bridge', distanceKm: 0.8, lanes: 6, baseSpeedKmh: 65 },
        { id: 'e18', from: 'n_sclr_c', to: 'n_sclr_e', type: 'bridge', distanceKm: 1.2, lanes: 6, baseSpeedKmh: 65 },
        { id: 'e19', from: 'n_sclr_e', to: 'n_vidyavihar', type: 'arterial', distanceKm: 0.7, lanes: 4, baseSpeedKmh: 45 },
        { id: 'e20', from: 'n_vidyavihar', to: 'n_rajawadi', type: 'arterial', distanceKm: 1.0, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e21', from: 'n_sclr_e', to: 'n_chembur_w', type: 'arterial', distanceKm: 0.9, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e22', from: 'n_chembur_w', to: 'n_chembur_c', type: 'arterial', distanceKm: 0.85, lanes: 4, baseSpeedKmh: 40 },
        { id: 'e23', from: 'n_sclr_w', to: 'n_kurla_stn', type: 'local', distanceKm: 0.5, lanes: 2, baseSpeedKmh: 20 },
        { id: 'e24', from: 'n_kurla_stn', to: 'n_chunabhatti', type: 'local', distanceKm: 1.6, lanes: 2, baseSpeedKmh: 25 },
        { id: 'e25', from: 'n_chunabhatti', to: 'n_sion_n', type: 'arterial', distanceKm: 1.4, lanes: 4, baseSpeedKmh: 45 },
        { id: 'e26', from: 'n_kalina_s', to: 'n_vakola', type: 'arterial', distanceKm: 1.3, lanes: 4, baseSpeedKmh: 40 },
      ],
    },
  },

  chennai: {
    id: 'chennai',
    name: 'Chennai Adyar River & Chembarambakkam Basin (2015 Scenario)',
    state: 'Tamil Nadu',
    riverBasin: 'Adyar River Basin & Saidapet / Kotturpuram Corridor',
    center: [13.018, 80.222],
    zoom: 12,
    bounds: [
      [12.945, 80.145],
      [13.091, 80.299],
    ],
    areaKm2: 250.0,
    disasterDate: '01 Dec 2015 Historic Deluge (Simulated Sentinel-1 SAR)',
    satelliteSensor: 'Sentinel-1A SAR (StripMap 10m)',
    orbitPass: 'Descending Track 121',
    sarPolarization: 'VV Co-Polarized',
    rainfall24hMm: 494,
    epicenter: [13.015, 80.220], // Saidapet Bridge / Adyar River
    description: 'Catastrophic riverine flooding after 29,000 cusecs Chembarambakkam reservoir release into the Adyar river channel.',
    shelters: [
      {
        id: 'chn_sh_1',
        name: 'Anna University Guindy Relief Base',
        type: 'shelter',
        coordinates: [13.012, 80.235],
        capacity: 4500,
        currentOccupancy: 620,
        medicalStaff: 40,
        floodSafe: true,
        contact: '+91 44 2235 7004',
        supplies: { foodPacks: 16000, waterLiters: 55000, ambulances: 12, rescueBoats: 8 },
      },
      {
        id: 'chn_sh_2',
        name: 'Govt Royapettah Hospital Evac Center',
        type: 'hospital',
        coordinates: [13.053, 80.258],
        capacity: 1200,
        currentOccupancy: 980,
        medicalStaff: 130,
        floodSafe: true,
        contact: '+91 44 2848 3051',
        supplies: { foodPacks: 5000, waterLiters: 20000, ambulances: 14, rescueBoats: 3 },
      },
      {
        id: 'chn_sh_3',
        name: 'Saidapet Sub-Registrar Office Camp',
        type: 'shelter',
        coordinates: [13.020, 80.218],
        capacity: 800,
        currentOccupancy: 640,
        medicalStaff: 8,
        floodSafe: false, // Low-lying Saidapet
        contact: '+91 44 2435 0101',
        supplies: { foodPacks: 1800, waterLiters: 6000, ambulances: 2, rescueBoats: 4 },
      },
      {
        id: 'chn_sh_4',
        name: 'IIT Madras Indoor Stadium Relief Hub',
        type: 'shelter',
        coordinates: [12.991, 80.233],
        capacity: 5000,
        currentOccupancy: 410,
        medicalStaff: 28,
        floodSafe: true,
        contact: '+91 44 2257 8000',
        supplies: { foodPacks: 18000, waterLiters: 60000, ambulances: 8, rescueBoats: 6 },
      },
      {
        id: 'chn_sh_5',
        name: 'Apollo Speciality Hospital Nandanam',
        type: 'hospital',
        coordinates: [13.029, 80.237],
        capacity: 400,
        currentOccupancy: 310,
        medicalStaff: 85,
        floodSafe: true,
        contact: '+91 44 2433 6114',
        supplies: { foodPacks: 2200, waterLiters: 9000, ambulances: 8, rescueBoats: 2 },
      },
      {
        id: 'chn_sh_6',
        name: 'Tamil Nadu Dr. M.G.R. Medical Univ',
        type: 'hospital',
        coordinates: [13.010, 80.218],
        capacity: 700,
        currentOccupancy: 480,
        medicalStaff: 95,
        floodSafe: true,
        contact: '+91 44 2235 3574',
        supplies: { foodPacks: 3500, waterLiters: 14000, ambulances: 7, rescueBoats: 3 },
      },
      {
        id: 'chn_sh_7',
        name: 'Tambaram Air Force Base Helipad Support',
        type: 'helipad',
        coordinates: [12.983, 80.178],
        capacity: 3500,
        currentOccupancy: 190,
        medicalStaff: 32,
        floodSafe: true,
        contact: '+91 44 2239 5555',
        supplies: { foodPacks: 25000, waterLiters: 80000, ambulances: 15, rescueBoats: 16 },
      },
      {
        id: 'chn_sh_8',
        name: 'Kotturpuram Community High Hall',
        type: 'shelter',
        coordinates: [13.018, 80.244],
        capacity: 1100,
        currentOccupancy: 780,
        medicalStaff: 9,
        floodSafe: false,
        contact: '+91 44 2445 9012',
        supplies: { foodPacks: 2000, waterLiters: 7000, ambulances: 2, rescueBoats: 5 },
      },
    ],
    roadNetwork: {
      nodes: [
        { id: 'c_epicenter', coordinates: [13.015, 80.220], name: 'Saidapet Maraimalai Bridge' },
        { id: 'c_guindy_c', coordinates: [13.007, 80.213], name: 'Guindy Kathipara Flyover' },
        { id: 'c_anna_univ', coordinates: [13.012, 80.235], name: 'Anna University Circle' },
        { id: 'c_iit', coordinates: [12.991, 80.233], name: 'IIT Madras Main Gate' },
        { id: 'c_nandanam', coordinates: [13.029, 80.237], name: 'Nandanam Signal' },
        { id: 'c_kottur', coordinates: [13.018, 80.244], name: 'Kotturpuram High Rd' },
        { id: 'c_royapettah', coordinates: [13.053, 80.258], name: 'Royapettah High Rd' },
        { id: 'c_mgr_univ', coordinates: [13.010, 80.218], name: 'MGR Medical Hub' },
        { id: 'c_airport_rd', coordinates: [12.985, 80.183], name: 'GST Road Airport Corridor' },
      ],
      edges: [
        { id: 'ce1', from: 'c_epicenter', to: 'c_guindy_c', type: 'highway', distanceKm: 1.2, lanes: 6, baseSpeedKmh: 50 },
        { id: 'ce2', from: 'c_epicenter', to: 'c_anna_univ', type: 'arterial', distanceKm: 1.7, lanes: 4, baseSpeedKmh: 45 },
        { id: 'ce3', from: 'c_anna_univ', to: 'c_iit', type: 'arterial', distanceKm: 2.4, lanes: 4, baseSpeedKmh: 50 },
        { id: 'ce4', from: 'c_anna_univ', to: 'c_kottur', type: 'local', distanceKm: 1.1, lanes: 2, baseSpeedKmh: 30 },
        { id: 'ce5', from: 'c_kottur', to: 'c_nandanam', type: 'arterial', distanceKm: 1.5, lanes: 4, baseSpeedKmh: 40 },
        { id: 'ce6', from: 'c_nandanam', to: 'c_royapettah', type: 'arterial', distanceKm: 3.2, lanes: 6, baseSpeedKmh: 50 },
        { id: 'ce7', from: 'c_guindy_c', to: 'c_mgr_univ', type: 'local', distanceKm: 0.7, lanes: 2, baseSpeedKmh: 35 },
        { id: 'ce8', from: 'c_guindy_c', to: 'c_airport_rd', type: 'highway', distanceKm: 3.5, lanes: 6, baseSpeedKmh: 60 },
      ],
    },
  },

  kerala: {
    id: 'kerala',
    name: 'Kerala Periyar River & Aluva Hub (2018 Great Flood)',
    state: 'Kerala',
    riverBasin: 'Periyar River Catchment & Cochin Airport Plain',
    center: [10.108, 76.355],
    zoom: 12,
    bounds: [
      [10.035, 76.280],
      [10.181, 76.430],
    ],
    areaKm2: 250.0,
    disasterDate: '16 August 2018 Dam Inflow Crest (Simulated SAR)',
    satelliteSensor: 'Sentinel-1B SAR C-band',
    orbitPass: 'Ascending Track 034',
    sarPolarization: 'VV + VH Cross-Pol',
    rainfall24hMm: 398,
    epicenter: [10.105, 76.353], // Aluva Manappuram / Shiva Temple on Periyar
    description: 'Severe inundation across Aluva town, CIAL airport access routes, and low-lying island colonies following Idukki dam spill.',
    shelters: [
      {
        id: 'ker_sh_1',
        name: 'UC College Aluva Elevated Campus Center',
        type: 'shelter',
        coordinates: [10.125, 76.335],
        capacity: 3800,
        currentOccupancy: 710,
        medicalStaff: 32,
        floodSafe: true,
        contact: '+91 484 260 3633',
        supplies: { foodPacks: 14000, waterLiters: 48000, ambulances: 8, rescueBoats: 7 },
      },
      {
        id: 'ker_sh_2',
        name: 'Aluva District Hospital Command Node',
        type: 'hospital',
        coordinates: [10.109, 76.358],
        capacity: 600,
        currentOccupancy: 540,
        medicalStaff: 75,
        floodSafe: false, // Low-lying water edge
        contact: '+91 484 262 4040',
        supplies: { foodPacks: 2500, waterLiters: 9000, ambulances: 6, rescueBoats: 4 },
      },
      {
        id: 'ker_sh_3',
        name: 'Rajagiri Hospital Chunangamvely',
        type: 'hospital',
        coordinates: [10.088, 76.375],
        capacity: 550,
        currentOccupancy: 380,
        medicalStaff: 110,
        floodSafe: true,
        contact: '+91 484 290 5000',
        supplies: { foodPacks: 3200, waterLiters: 12000, ambulances: 12, rescueBoats: 3 },
      },
      {
        id: 'ker_sh_4',
        name: 'Cochin International Airport (CIAL) Terminal 3 Hub',
        type: 'helipad',
        coordinates: [10.152, 76.392],
        capacity: 6000,
        currentOccupancy: 450,
        medicalStaff: 45,
        floodSafe: true,
        contact: '+91 484 261 0115',
        supplies: { foodPacks: 30000, waterLiters: 95000, ambulances: 20, rescueBoats: 15 },
      },
      {
        id: 'ker_sh_5',
        name: 'St. Xavier’s College for Women Aluva',
        type: 'shelter',
        coordinates: [10.103, 76.347],
        capacity: 2200,
        currentOccupancy: 950,
        medicalStaff: 18,
        floodSafe: false,
        contact: '+91 484 260 0300',
        supplies: { foodPacks: 5000, waterLiters: 18000, ambulances: 4, rescueBoats: 5 },
      },
    ],
    roadNetwork: {
      nodes: [
        { id: 'k_epicenter', coordinates: [10.105, 76.353], name: 'Aluva Periyar Bridge' },
        { id: 'k_aluva_stn', coordinates: [10.108, 76.358], name: 'Aluva Metro & Railway' },
        { id: 'k_uc_college', coordinates: [10.125, 76.335], name: 'UC College Junction' },
        { id: 'k_cial_turn', coordinates: [10.142, 76.375], name: 'CIAL Airport Road Highway' },
        { id: 'k_cial_hub', coordinates: [10.152, 76.392], name: 'CIAL Heliport' },
        { id: 'k_rajagiri', coordinates: [10.088, 76.375], name: 'Rajagiri Medical Circle' },
        { id: 'k_kalamassery', coordinates: [10.055, 76.325], name: 'Kalamassery Toll Plaza' },
      ],
      edges: [
        { id: 'ke1', from: 'k_epicenter', to: 'k_aluva_stn', type: 'arterial', distanceKm: 0.6, lanes: 4, baseSpeedKmh: 35 },
        { id: 'ke2', from: 'k_epicenter', to: 'k_uc_college', type: 'arterial', distanceKm: 2.8, lanes: 4, baseSpeedKmh: 45 },
        { id: 'ke3', from: 'k_aluva_stn', to: 'k_cial_turn', type: 'highway', distanceKm: 4.1, lanes: 6, baseSpeedKmh: 60 },
        { id: 'ke4', from: 'k_cial_turn', to: 'k_cial_hub', type: 'highway', distanceKm: 2.1, lanes: 6, baseSpeedKmh: 60 },
        { id: 'ke5', from: 'k_aluva_stn', to: 'k_rajagiri', type: 'arterial', distanceKm: 3.2, lanes: 4, baseSpeedKmh: 40 },
        { id: 'ke6', from: 'k_epicenter', to: 'k_kalamassery', type: 'highway', distanceKm: 4.8, lanes: 6, baseSpeedKmh: 55 },
      ],
    },
  },
};
