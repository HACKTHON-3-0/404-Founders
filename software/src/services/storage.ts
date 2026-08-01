import { getSessionUserEmail } from './auth';

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

function getStorageKey(key: string): string {
  const sessionEmail = getSessionUserEmail();
  return sessionEmail ? `${key}:${sessionEmail}` : key;
}

export function loadControlMode(): 'eye' | 'joystick' {
  const stored = localStorage.getItem(getStorageKey(CONTROL_MODE_KEY));
  return stored === 'eye' || stored === 'joystick' ? stored : 'joystick';
}

export function saveControlMode(value: 'eye' | 'joystick') {
  localStorage.setItem(getStorageKey(CONTROL_MODE_KEY), value);
}

export function loadMedications(): Medication[] {
  try {
    const stored = localStorage.getItem(getStorageKey(MEDICATIONS_KEY));
    if (!stored) return [];
    return JSON.parse(stored) as Medication[];
  } catch {
    return [];
  }
}

export function saveMedications(items: Medication[]) {
  localStorage.setItem(getStorageKey(MEDICATIONS_KEY), JSON.stringify(items));
}

export function loadFallAlert(): boolean {
  return localStorage.getItem(getStorageKey(FALL_ALERT_KEY)) === 'true';
}

export function saveFallAlert(value: boolean) {
  localStorage.setItem(getStorageKey(FALL_ALERT_KEY), value.toString());
}

export function loadGpsCoords(): [number, number] {
  const stored = localStorage.getItem(getStorageKey(GPS_COORDS_KEY));
  if (!stored) return [37.7749, -122.4194];
  try {
    return JSON.parse(stored) as [number, number];
  } catch {
    return [37.7749, -122.4194];
  }
}

export function saveGpsCoords(coords: [number, number]) {
  localStorage.setItem(getStorageKey(GPS_COORDS_KEY), JSON.stringify(coords));
}

export function loadBatteryPct(): number {
  const stored = localStorage.getItem(getStorageKey(BATTERY_KEY));
  const parsed = Number(stored);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) return parsed;
  return 81;
}

export function saveBatteryPct(value: number) {
  localStorage.setItem(getStorageKey(BATTERY_KEY), value.toString());
}
