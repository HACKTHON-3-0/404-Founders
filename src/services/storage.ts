export type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

const CONTROL_MODE_KEY = 'wheelchair:controlMode';
const MEDICATIONS_KEY = 'wheelchair:medications';
const FALL_ALERT_KEY = 'wheelchair:fallAlert';
const GPS_COORDS_KEY = 'wheelchair:gpsCoords';
const BATTERY_KEY = 'wheelchair:batteryPct';

export function loadControlMode(): 'eye' | 'joystick' {
  return (localStorage.getItem(CONTROL_MODE_KEY) as 'eye' | 'joystick') ?? 'joystick';
}

export function saveControlMode(value: 'eye' | 'joystick') {
  localStorage.setItem(CONTROL_MODE_KEY, value);
}

export function loadMedications(): Medication[] {
  try {
    const stored = localStorage.getItem(MEDICATIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Medication[];
  } catch {
    return [];
  }
}

export function saveMedications(items: Medication[]) {
  localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(items));
}

export function loadFallAlert(): boolean {
  return localStorage.getItem(FALL_ALERT_KEY) === 'true';
}

export function saveFallAlert(value: boolean) {
  localStorage.setItem(FALL_ALERT_KEY, value.toString());
}

export function loadGpsCoords(): [number, number] {
  const stored = localStorage.getItem(GPS_COORDS_KEY);
  if (!stored) return [37.7749, -122.4194];
  try {
    return JSON.parse(stored) as [number, number];
  } catch {
    return [37.7749, -122.4194];
  }
}

export function saveGpsCoords(coords: [number, number]) {
  localStorage.setItem(GPS_COORDS_KEY, JSON.stringify(coords));
}

export function loadBatteryPct(): number {
  const stored = localStorage.getItem(BATTERY_KEY);
  const parsed = Number(stored);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) return parsed;
  return 81;
}

export function saveBatteryPct(value: number) {
  localStorage.setItem(BATTERY_KEY, value.toString());
}
