// Contexto de Web Audio compartido por efectos y música.

let ctx: AudioContext | null = null;

export function audioContext(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Los navegadores solo habilitan el audio después de una interacción del usuario.
for (const type of ['keydown', 'pointerdown'] as const) {
  window.addEventListener(type, () => void audioContext(), { passive: true });
}
