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

  bihar: {
    id: 'bihar',
    name: 'Bihar Kosi-Gandak Flood Plain (Patna & North Bihar)',
    state: 'Bihar',
    riverBasin: 'Kosi River & Gandak Floodplain (Ganga Confluence Zone)',
    center: [25.594, 85.137],
    zoom: 11,
    bounds: [
      [25.480, 84.980],
      [25.720, 85.320],
    ],
    areaKm2: 285.0,
    disasterDate: '18 Sep 2024 Kosi-Gandak Breach (Sentinel-1 Emergency SAR)',
    satelliteSensor: 'Sentinel-1C C-SAR (Interferometric Wide Swath)',
    orbitPass: 'Descending Track 041',
    sarPolarization: 'VV + VH Dual-Pol',
    rainfall24hMm: 382,
    epicenter: [25.600, 85.050], // Hajipur / Sonepur confluence — Gandak-Ganga junction
    description:
      'Catastrophic riverine inundation after simultaneous Kosi embankment breach (Supaul) and Gandak spill at Hajipur. Floodwaters inundated Muzaffarpur, Samastipur, Darbhanga districts. 42 lakh population affected. NDRF teams deployed from Patna, Vaishali, and Muzaffarpur.',
    shelters: [
      {
        id: 'bih_sh_1',
        name: 'NDRF 9th Battalion Patna Advance Base',
        type: 'ndrf_base',
        coordinates: [25.609, 85.178],
        capacity: 2000,
        currentOccupancy: 380,
        medicalStaff: 62,
        floodSafe: true,
        contact: '+91 612 222 4567',
        supplies: { foodPacks: 18000, waterLiters: 72000, ambulances: 14, rescueBoats: 28 },
      },
      {
        id: 'bih_sh_2',
        name: 'Patna Medical College & Hospital (PMCH)',
        type: 'hospital',
        coordinates: [25.619, 85.135],
        capacity: 2500,
        currentOccupancy: 2100,
        medicalStaff: 320,
        floodSafe: true,
        contact: '+91 612 267 2331',
        supplies: { foodPacks: 6000, waterLiters: 22000, ambulances: 28, rescueBoats: 4 },
      },
      {
        id: 'bih_sh_3',
        name: 'Gandhi Maidan Flood Relief Mega Camp',
        type: 'shelter',
        coordinates: [25.610, 85.143],
        capacity: 8000,
        currentOccupancy: 5400,
        medicalStaff: 48,
        floodSafe: true,
        contact: '+91 612 222 5001',
        supplies: { foodPacks: 35000, waterLiters: 120000, ambulances: 10, rescueBoats: 12 },
      },
      {
        id: 'bih_sh_4',
        name: 'Nalanda Medical College Hospital',
        type: 'hospital',
        coordinates: [25.624, 85.165],
        capacity: 1200,
        currentOccupancy: 980,
        medicalStaff: 175,
        floodSafe: true,
        contact: '+91 612 267 7788',
        supplies: { foodPacks: 4500, waterLiters: 15000, ambulances: 16, rescueBoats: 3 },
      },
      {
        id: 'bih_sh_5',
        name: 'Patna Airport IAF Helipad (Lok Nayak Jai Prakash)',
        type: 'helipad',
        coordinates: [25.591, 85.088],
        capacity: 1500,
        currentOccupancy: 290,
        medicalStaff: 35,
        floodSafe: true,
        contact: '+91 612 222 6800',
        supplies: { foodPacks: 22000, waterLiters: 80000, ambulances: 18, rescueBoats: 22 },
      },
      {
        id: 'bih_sh_6',
        name: 'Danapur Cantonment NDRF Depot & Staging Area',
        type: 'ndrf_base',
        coordinates: [25.622, 85.045],
        capacity: 3000,
        currentOccupancy: 640,
        medicalStaff: 52,
        floodSafe: true,
        contact: '+91 612 272 1234',
        supplies: { foodPacks: 25000, waterLiters: 90000, ambulances: 20, rescueBoats: 35 },
      },
    ],
    roadNetwork: {
      nodes: [
        { id: 'bih_epicenter',   coordinates: [25.600, 85.050], name: 'Hajipur Gandak-Ganga Confluence' },
        { id: 'bih_pmch',        coordinates: [25.619, 85.135], name: 'PMCH Patna' },
        { id: 'bih_gandhi',      coordinates: [25.610, 85.143], name: 'Gandhi Maidan Relief Camp' },
        { id: 'bih_airport',     coordinates: [25.591, 85.088], name: 'Patna Airport Helipad' },
        { id: 'bih_danapur',     coordinates: [25.622, 85.045], name: 'Danapur NDRF Depot' },
        { id: 'bih_ndrf_base',   coordinates: [25.609, 85.178], name: 'NDRF 9th Bn Patna' },
        { id: 'bih_rajendranagar', coordinates: [25.558, 85.105], name: 'Rajendra Nagar NH-83 Junction' },
        { id: 'bih_hajipur_nh',  coordinates: [25.683, 85.213], name: 'Hajipur NH-31 Mahatma Gandhi Setu' },
      ],
      edges: [
        { id: 'be1', from: 'bih_epicenter',  to: 'bih_airport',      type: 'highway',  distanceKm: 5.2, lanes: 4, baseSpeedKmh: 50 },
        { id: 'be2', from: 'bih_airport',    to: 'bih_gandhi',       type: 'arterial', distanceKm: 3.8, lanes: 4, baseSpeedKmh: 40 },
        { id: 'be3', from: 'bih_gandhi',     to: 'bih_pmch',         type: 'arterial', distanceKm: 1.2, lanes: 4, baseSpeedKmh: 35 },
        { id: 'be4', from: 'bih_pmch',       to: 'bih_ndrf_base',    type: 'arterial', distanceKm: 3.5, lanes: 4, baseSpeedKmh: 40 },
        { id: 'be5', from: 'bih_danapur',    to: 'bih_airport',      type: 'highway',  distanceKm: 3.9, lanes: 6, baseSpeedKmh: 60 },
        { id: 'be6', from: 'bih_epicenter',  to: 'bih_hajipur_nh',   type: 'bridge',   distanceKm: 9.8, lanes: 4, baseSpeedKmh: 45 },
        { id: 'be7', from: 'bih_hajipur_nh', to: 'bih_ndrf_base',    type: 'highway',  distanceKm: 6.5, lanes: 4, baseSpeedKmh: 50 },
        { id: 'be8', from: 'bih_rajendranagar', to: 'bih_airport',   type: 'highway',  distanceKm: 4.1, lanes: 6, baseSpeedKmh: 55 },
      ],
    },
  },
};

// Generator for any city scenario with realistic bounds, shelters, and roads
export function createScenarioForCity(
  id: string,
  name: string,
  state: string,
  riverBasin: string,
  center: [number, number],
  bounds: [[number, number], [number, number]],
  rainfall24hMm: number = 320,
  areaKm2: number = 220
): DisasterScenario {
  const [lat, lng] = center;
  const dLat = (bounds[1][0] - bounds[0][0]) * 0.25;
  const dLng = (bounds[1][1] - bounds[0][1]) * 0.25;

  const shelters: ShelterPoint[] = [
    {
      id: `${id}_sh_1`,
      name: `${name} Central High-Ground Relief Camp`,
      type: 'shelter',
      coordinates: [lat + dLat * 0.45, lng - dLng * 0.55],
      capacity: 3500,
      currentOccupancy: 820,
      medicalStaff: 28,
      floodSafe: true,
      contact: '+91 11 2345 6701',
      supplies: { foodPacks: 12000, waterLiters: 40000, ambulances: 8, rescueBoats: 6 },
    },
    {
      id: `${id}_sh_2`,
      name: `${name} District Civil Hospital & Trauma Center`,
      type: 'hospital',
      coordinates: [lat - dLat * 0.55, lng + dLng * 0.45],
      capacity: 1200,
      currentOccupancy: 950,
      medicalStaff: 140,
      floodSafe: true,
      contact: '+91 11 2345 6702',
      supplies: { foodPacks: 4500, waterLiters: 16000, ambulances: 14, rescueBoats: 3 },
    },
    {
      id: `${id}_sh_3`,
      name: `${name} Lowland Emergency Medical Station`,
      type: 'hospital',
      coordinates: [lat + dLat * 0.15, lng + dLng * 0.25],
      capacity: 450,
      currentOccupancy: 410,
      medicalStaff: 40,
      floodSafe: false,
      contact: '+91 11 2345 6703',
      supplies: { foodPacks: 1500, waterLiters: 6000, ambulances: 4, rescueBoats: 4 },
    },
    {
      id: `${id}_sh_4`,
      name: `${name} University Campus Relief Hub`,
      type: 'shelter',
      coordinates: [lat + dLat * 0.85, lng + dLng * 0.75],
      capacity: 4000,
      currentOccupancy: 500,
      medicalStaff: 22,
      floodSafe: true,
      contact: '+91 11 2345 6704',
      supplies: { foodPacks: 15000, waterLiters: 50000, ambulances: 6, rescueBoats: 5 },
    },
    {
      id: `${id}_sh_5`,
      name: `${name} NDRF Rapid Deployment & Helipad Base`,
      type: 'ndrf_base',
      coordinates: [lat - dLat * 0.85, lng - dLng * 0.75],
      capacity: 800,
      currentOccupancy: 120,
      medicalStaff: 35,
      floodSafe: true,
      contact: '+91 11 2345 6705',
      supplies: { foodPacks: 8000, waterLiters: 30000, ambulances: 10, rescueBoats: 16 },
    },
  ];

  const roadNetwork: RoadNetwork = {
    nodes: [
      { id: `${id}_n1`, coordinates: [lat, lng], name: `${name} River Basin Hub` },
      { id: `${id}_n2`, coordinates: shelters[0].coordinates, name: shelters[0].name },
      { id: `${id}_n3`, coordinates: shelters[1].coordinates, name: shelters[1].name },
      { id: `${id}_n4`, coordinates: shelters[2].coordinates, name: shelters[2].name },
      { id: `${id}_n5`, coordinates: shelters[3].coordinates, name: shelters[3].name },
      { id: `${id}_n6`, coordinates: shelters[4].coordinates, name: shelters[4].name },
    ],
    edges: [
      { id: `${id}_e1`, from: `${id}_n1`, to: `${id}_n2`, type: 'highway', distanceKm: 2.8, lanes: 4, baseSpeedKmh: 50 },
      { id: `${id}_e2`, from: `${id}_n1`, to: `${id}_n3`, type: 'arterial', distanceKm: 3.5, lanes: 4, baseSpeedKmh: 40 },
      { id: `${id}_e3`, from: `${id}_n2`, to: `${id}_n5`, type: 'highway', distanceKm: 4.2, lanes: 6, baseSpeedKmh: 60 },
      { id: `${id}_e4`, from: `${id}_n3`, to: `${id}_n6`, type: 'highway', distanceKm: 3.8, lanes: 4, baseSpeedKmh: 55 },
      { id: `${id}_e5`, from: `${id}_n1`, to: `${id}_n4`, type: 'local', distanceKm: 1.5, lanes: 2, baseSpeedKmh: 30 },
      { id: `${id}_e6`, from: `${id}_n4`, to: `${id}_n5`, type: 'arterial', distanceKm: 3.1, lanes: 4, baseSpeedKmh: 45 },
    ],
  };

  return {
    id,
    name: `${name} Basin`,
    state,
    riverBasin,
    center,
    zoom: 12,
    bounds,
    areaKm2,
    disasterDate: 'Active Cloudburst & Monsoon Event (Sentinel-1 SAR Pass)',
    satelliteSensor: 'Sentinel-1C C-SAR (Interferometric Wide)',
    orbitPass: 'Ascending Track 116',
    sarPolarization: 'VV + VH Dual-Pol',
    rainfall24hMm,
    epicenter: [lat + dLat * 0.1, lng + dLng * 0.1],
    shelters,
    roadNetwork,
    description: `High-density urban flood scenario along ${riverBasin} in ${name}, ${state}. Synthetic Aperture Radar microwave backscatter detection active.`,
  };
}

// Pre-register all major Indian cities with their precise coordinates and bounding boxes
const PRESET_CITIES: Array<{
  id: string;
  name: string;
  state: string;
  riverBasin: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  rainfallMm: number;
  areaKm2: number;
}> = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'National Capital Region',
    riverBasin: 'Yamuna River Floodplain Basin',
    center: [28.6139, 77.2090],
    bounds: [[28.48, 77.02], [28.78, 77.36]],
    rainfallMm: 340,
    areaKm2: 260,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    riverBasin: 'Vrishabhavathi & Bellandur Lake Basin',
    center: [12.9716, 77.5946],
    bounds: [[12.83, 77.46], [13.14, 77.75]],
    rainfallMm: 290,
    areaKm2: 240,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    riverBasin: 'Hooghly River & Lower Ganga Delta',
    center: [22.5726, 88.3639],
    bounds: [[22.42, 88.24], [22.72, 88.48]],
    rainfallMm: 380,
    areaKm2: 250,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    riverBasin: 'Musi River Catchment Basin',
    center: [17.3850, 78.4867],
    bounds: [[17.25, 78.32], [17.52, 78.62]],
    rainfallMm: 310,
    areaKm2: 230,
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    riverBasin: 'Mula-Mutha River & Khadakwasla Basin',
    center: [18.5204, 73.8567],
    bounds: [[18.42, 73.74], [18.64, 73.98]],
    rainfallMm: 350,
    areaKm2: 220,
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    riverBasin: 'Sabarmati River & Dharoi Basin',
    center: [23.0225, 72.5714],
    bounds: [[22.92, 72.46], [23.14, 72.68]],
    rainfallMm: 280,
    areaKm2: 210,
  },
  {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    riverBasin: 'Periyar Coastal Estuary & Backwaters',
    center: [9.9312, 76.2673],
    bounds: [[9.86, 76.18], [10.06, 76.38]],
    rainfallMm: 460,
    areaKm2: 190,
  },
  {
    id: 'thiruvananthapuram',
    name: 'Thiruvananthapuram',
    state: 'Kerala',
    riverBasin: 'Karamana & Neyyar River Basin',
    center: [8.5241, 76.9366],
    bounds: [[8.42, 76.84], [8.62, 77.04]],
    rainfallMm: 360,
    areaKm2: 200,
  },
  {
    id: 'patna',
    name: 'Patna',
    state: 'Bihar',
    riverBasin: 'Ganges & Son Confluence Floodplain',
    center: [25.5941, 85.1376],
    bounds: [[25.50, 85.02], [25.70, 85.25]],
    rainfallMm: 410,
    areaKm2: 230,
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    state: 'Assam',
    riverBasin: 'Brahmaputra Valley River Basin',
    center: [26.1445, 91.7362],
    bounds: [[26.06, 91.62], [26.24, 91.85]],
    rainfallMm: 490,
    areaKm2: 250,
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    state: 'Odisha',
    riverBasin: 'Mahanadi River Delta & Kuakhai Basin',
    center: [20.2961, 85.8245],
    bounds: [[20.20, 85.72], [20.40, 85.92]],
    rainfallMm: 370,
    areaKm2: 210,
  },
  {
    id: 'surat',
    name: 'Surat',
    state: 'Gujarat',
    riverBasin: 'Tapi River Estuary & Ukai Basin',
    center: [21.1702, 72.8311],
    bounds: [[21.08, 72.72], [21.28, 72.94]],
    rainfallMm: 430,
    areaKm2: 220,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    riverBasin: 'Dravyavati River Basin',
    center: [26.9124, 75.7873],
    bounds: [[26.80, 75.68], [27.02, 75.90]],
    rainfallMm: 220,
    areaKm2: 230,
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    riverBasin: 'Gomti River Floodplain',
    center: [26.8467, 80.9462],
    bounds: [[26.74, 80.84], [26.96, 81.06]],
    rainfallMm: 310,
    areaKm2: 220,
  },
  {
    id: 'indore',
    name: 'Indore',
    state: 'Madhya Pradesh',
    riverBasin: 'Kahn & Saraswati River Catchment',
    center: [22.7196, 75.8577],
    bounds: [[22.62, 75.75], [22.82, 75.96]],
    rainfallMm: 290,
    areaKm2: 210,
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    riverBasin: 'Eastern Ghats Coastal Basin',
    center: [17.6868, 83.2185],
    bounds: [[17.58, 83.10], [17.80, 83.34]],
    rainfallMm: 380,
    areaKm2: 220,
  },
  {
    id: 'srinagar',
    name: 'Srinagar',
    state: 'Jammu & Kashmir',
    riverBasin: 'Jhelum River & Dal Lake Basin',
    center: [34.0837, 74.7973],
    bounds: [[33.98, 74.68], [34.18, 74.92]],
    rainfallMm: 290,
    areaKm2: 200,
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    riverBasin: 'Noyyal River Basin',
    center: [11.0168, 76.9558],
    bounds: [[10.92, 76.85], [11.12, 77.06]],
    rainfallMm: 250,
    areaKm2: 210,
  },
  {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    riverBasin: 'Vaigai River Basin',
    center: [9.9252, 78.1198],
    bounds: [[9.82, 78.02], [10.02, 78.22]],
    rainfallMm: 270,
    areaKm2: 200,
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    riverBasin: 'Ganga & Varuna River Floodplain',
    center: [25.3176, 82.9739],
    bounds: [[25.22, 82.88], [25.42, 83.08]],
    rainfallMm: 390,
    areaKm2: 210,
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab/Haryana',
    riverBasin: 'Sukhna Lake Catchment Basin',
    center: [30.7333, 76.7794],
    bounds: [[30.64, 76.68], [30.82, 76.88]],
    rainfallMm: 280,
    areaKm2: 190,
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    riverBasin: 'Nag & Pili River Catchment',
    center: [21.1458, 79.0882],
    bounds: [[21.05, 78.98], [21.25, 79.18]],
    rainfallMm: 310,
    areaKm2: 220,
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    riverBasin: 'Upper & Lower Lake Catchment',
    center: [23.2599, 77.4126],
    bounds: [[23.16, 77.30], [23.36, 77.52]],
    rainfallMm: 330,
    areaKm2: 210,
  },
  {
    id: 'dehradun',
    name: 'Dehradun',
    state: 'Uttarakhand',
    riverBasin: 'Song & Asan River Valley',
    center: [30.3165, 78.0322],
    bounds: [[30.22, 77.94], [30.40, 78.14]],
    rainfallMm: 440,
    areaKm2: 200,
  },
  {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    riverBasin: 'Sutlej Catchment Basin',
    center: [31.1048, 77.1734],
    bounds: [[31.02, 77.08], [31.18, 77.26]],
    rainfallMm: 380,
    areaKm2: 180,
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    riverBasin: 'Beas & Ravi River Basin',
    center: [31.6340, 74.8723],
    bounds: [[31.54, 74.78], [31.72, 74.98]],
    rainfallMm: 270,
    areaKm2: 200,
  },
  {
    id: 'kanpur',
    name: 'Kanpur',
    state: 'Uttar Pradesh',
    riverBasin: 'Ganges Floodplain Basin',
    center: [26.4499, 80.3319],
    bounds: [[26.35, 80.22], [26.55, 80.44]],
    rainfallMm: 350,
    areaKm2: 230,
  },
  {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    riverBasin: 'Yamuna River Basin',
    center: [27.1767, 78.0081],
    bounds: [[27.08, 77.90], [27.26, 78.10]],
    rainfallMm: 260,
    areaKm2: 210,
  },
];

// Populate SCENARIOS dictionary
for (const p of PRESET_CITIES) {
  SCENARIOS[p.id] = createScenarioForCity(
    p.id,
    p.name,
    p.state,
    p.riverBasin,
    p.center,
    p.bounds,
    p.rainfallMm,
    p.areaKm2
  );
}

// Dynamic Scenario Resolver: works for ANY city query
export function getScenario(query: string = 'mumbai'): DisasterScenario {
  if (!query) return SCENARIOS.mumbai;
  const cleanKey = query.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

  if (SCENARIOS[cleanKey]) {
    return SCENARIOS[cleanKey];
  }

  // Check matching by name
  const foundKey = Object.keys(SCENARIOS).find(
    (k) =>
      k.toLowerCase() === cleanKey ||
      SCENARIOS[k].name.toLowerCase().includes(cleanKey) ||
      SCENARIOS[k].state.toLowerCase().includes(cleanKey)
  );
  if (foundKey) {
    return SCENARIOS[foundKey];
  }

  // Fallback: Dynamically generate a custom city scenario based on hash-offset or Delhi baseline
  const nameCapitalized = query.charAt(0).toUpperCase() + query.slice(1);
  const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) * 0.05;
  const lngOffset = (((hash * 7) % 100) - 50) * 0.05;
  const centerLat = 20.5937 + latOffset; // Centered around India
  const centerLng = 78.9629 + lngOffset;

  const generated = createScenarioForCity(
    cleanKey,
    nameCapitalized,
    'India',
    `${nameCapitalized} Catchment Basin`,
    [centerLat, centerLng],
    [
      [centerLat - 0.08, centerLng - 0.09],
      [centerLat + 0.08, centerLng + 0.09],
    ],
    310,
    220
  );

  SCENARIOS[cleanKey] = generated;
  return generated;
}
