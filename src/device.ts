// Detección del dispositivo. En teléfonos y tabletas el juego suma controles táctiles
// y todas las pantallas responden al toque; en computadora no cambia nada.

/** ?touch en la dirección fuerza el modo táctil (para probarlo desde una computadora). */
export const TOUCH =
  new URLSearchParams(location.search).has('touch') ||
  (navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches);

/** Tableta: pantalla táctil cuyo lado corto mide al menos 600 px CSS. */
export const TABLET = TOUCH && Math.min(screen.width, screen.height) >= 600;

/** Al girar el teléfono o cambiar el tamaño de la ventana, vuelve a encajar el juego en pantalla. */
export function keepFitted(refit: () => void): void {
  const later = () => [60, 350, 900].forEach((ms) => window.setTimeout(refit, ms));
  window.addEventListener('orientationchange', later);
  window.addEventListener('resize', later);
  window.visualViewport?.addEventListener('resize', later);
}

/** En el primer toque se intenta pasar a pantalla completa y fijar la orientación horizontal. */
export function enterFullscreenLandscape(): void {
  if (!TOUCH) return;
  const go = () => {
    const root = document.documentElement;
    if (document.fullscreenElement || !root.requestFullscreen) return;
    root
      .requestFullscreen()
      .then(() => (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.('landscape'))
      .catch(() => undefined); // No todos los navegadores lo permiten: queda el aviso de girar el teléfono.
  };
  window.addEventListener('touchend', go, { once: true });
}
