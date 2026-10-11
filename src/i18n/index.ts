import { TOUCH } from '../device';
import { settings, saveSettings, type Lang } from '../settings';
import { es } from './es';
import { en } from './en';

const DICTS: Record<Lang, Record<string, string>> = { es, en };

/**
 * Devuelve el texto de la clave en el idioma activo. Los parámetros reemplazan {nombre}.
 * En dispositivos táctiles, si existe `<clave>.touch` se usa esa variante ("tocá" en lugar de una tecla).
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = DICTS[settings.lang];
  let text = (TOUCH ? (dict[`${key}.touch`] ?? DICTS.es[`${key}.touch`]) : undefined) ?? dict[key] ?? DICTS.es[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) text = text.replace(`{${name}}`, String(value));
  }
  return text;
}

export function toggleLang(): void {
  settings.lang = settings.lang === 'es' ? 'en' : 'es';
  saveSettings();
}
