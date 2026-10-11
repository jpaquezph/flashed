// Preferencias del jugador. Se guardan en localStorage cuando está disponible.

export type Lang = 'es' | 'en';

export interface Settings {
  lang: Lang;
  sfxMuted: boolean;
  musicMuted: boolean;
}

const KEY = 'flashed.settings';

function load(): Settings {
  const defaults: Settings = { lang: 'es', sfxMuted: false, musicMuted: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // sin almacenamiento: se usan los valores por defecto
  }
  return defaults;
}

export const settings: Settings = load();

export function saveSettings(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // sin almacenamiento: la preferencia dura lo que dure la sesión
  }
}
