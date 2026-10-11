# FLASHED — The Party Photographer

Juego arcade 2D de navegador hecho con Phaser 3, TypeScript y Vite. Sos un fotógrafo de eventos: conseguí las fotos del trabajo esquivando invitados, muebles y, sobre todo, los láseres del show, que te queman el sensor de la cámara.

Estado actual: campaña completa de siete escenarios encadenados: *Noche de alabanza*, *Cumpleaños infantil*, *Cumpleaños de 15*, *Boda*, *Discoteca*, *Recital* y la pelea final *Contra el DJ*. Todos con láseres, tarjeta de memoria y objetivos especiales; entre niveles se elige un accesorio.

## Requisitos

- Node.js 20 o superior.

## Instalación y uso

```bash
npm install
npm run dev        # servidor de desarrollo con recarga
npm run build      # typecheck + compilación a dist/
npm run preview    # sirve el contenido de dist/
```

`dist/` es estático: se puede subir a cualquier hosting sin backend.

## Controles

| Tecla | Acción |
| --- | --- |
| WASD / flechas | Moverse |
| Espacio | Sacar foto |
| E | Salir por la puerta al cumplir el mínimo / usar el consumible equipado |
| Esc | Pausa |
| M | Efectos de sonido sí/no |
| N | Música sí/no |
| L (en el menú) | Idioma español / inglés |

## Estructura

```
src/
  main.ts                 Configuración de Phaser
  settings.ts             Preferencias (idioma, sonido)
  config/
    constants.ts          Balance: movimiento, fotografía, puntaje, tiempos
    scenarios/            Un archivo de configuración por evento + orden de campaña
  art/                    Arte vectorial generado por código (SVG → texturas)
    character.ts          Generador de personajes: looks + poses → spritesheet
    looks.ts              Vestuario por evento
    church.ts, birthday.ts, venues.ts, ui.ts   Fondos, utilería e íconos
  game/                   Player, Guests, PhotoSystem, LaserSystem, Upgrades, Collision, Hud, Campaign
  scenes/                 Boot, Menu, Levels, Cutscenes, Intro, Game, Result, Upgrade
  audio/                  Efectos (Sfx) y música por escenario (Music), sintetizados con Web Audio
  i18n/                   Textos en español e inglés
```

### Agregar un escenario

1. Crear `src/config/scenarios/<evento>.ts` con un `ScenarioConfig` (fondo, música, utilería, invitados, actores, momentos, objetivos, láseres y dificultad).
2. Sumarlo a `CAMPAIGN` en `src/config/scenarios/index.ts`.
3. Definir su vestuario en `src/art/looks.ts` y su arte en `src/art/`, y registrarlos en `src/art/index.ts`.

### Accesorios

Al ganar un nivel se ofrecen tres accesorios al azar (`src/game/Upgrades.ts`) y se elige uno, que dura toda la partida: cotillón protector, bebida para el DJ, flash mejorado, gran angular, zapatillas, correa de cámara y tarjeta extra. Para sumar uno nuevo alcanza con agregarlo a `UPGRADES`, dibujar su ícono en `src/art/ui.ts` y cargar sus textos `up.<id>.name` y `up.<id>.desc`.

### Jefe final

Un escenario con `boss` cambia las reglas: las fotos en las que sale el jefe le sacan vida (el doble de cerca). La vida se divide en tres fases, cada una con su propio tramo de láseres; en la segunda el jefe se mueve detrás de la cabina y en la tercera baja a la pista y persigue al fotógrafo: si lo alcanza, le pega y le quema una parte del sensor.

### Flash al iluminador

En todos los escenarios menos la pelea final, una foto en la que sale quien maneja las luces (`hazards.lasers.operator`) mientras los láseres están avisando o encendidos los apaga y adelanta el descanso. Gasta un disparo de la tarjeta.

### Momentos y salida

Los momentos del evento empiezan a los pocos segundos. Si un objetivo ligado a un momento queda sin cumplir, el momento vuelve a darse más adelante. Para salir hay que llegar al mínimo de fotos y cumplir los tres objetivos del evento; recién ahí se ilumina la puerta. La tarjeta tiene 10 disparos: si se llena antes, se pierde.

### Teléfonos

En dispositivos táctiles (`src/device.ts`) el juego agrega una palanca y botones (`src/game/TouchControls.ts`), todas las pantallas responden al toque y, con el teléfono en vertical, se pide girarlo. `?touch` fuerza ese modo en una computadora.

### Otras pantallas y mandos

El juego mantiene su proporción 16:9 y se centra en cualquier pantalla (franjas negras donde sobra). Los teléfonos rasterizan el arte a 3× y las tabletas y computadoras a 4× (`RS` en `src/config/constants.ts`). `src/gamepad.ts` traduce los botones de un mando a teclas: palanca o cruceta para moverse, A foto/aceptar, B o X interactuar, Y reintentar, Start pausa. Enter también dispara y, con el trabajo terminado en la puerta, sirve para salir (controles remotos de TV).

### Música y cinemáticas

`src/audio/Music.ts` define una pista por escenario: compás, acordes, batería y voces con su instrumento (órgano, cajita de música, 808, cuerdas, guitarra distorsionada, etc.). `src/scenes/Cutscenes.ts` tiene la cinemática inicial (antes del primer evento) y la final (después del jefe); las dos se saltan con Espacio.

### Personajes a pedido

Los spritesheets de cada evento se generan al entrar a su pantalla de objetivos (`useCharacters` en `src/art/index.ts`) y se descartan al pasar al siguiente. Cada vestuario se reparte como un mazo de dos copias: en una escena nadie aparece más de dos veces.

### Tarjeta de memoria

Cada escenario fija en `objectives.cardCapacity` cuántos disparos entran en la tarjeta. Todos los disparos cuentan, también los que salen vacíos o repetidos; si se llena sin haber llegado al mínimo de fotos válidas, se pierde el trabajo.

### Láseres

Cada escenario define en `hazards.lasers` sus emisores, la zona que barren, el corredor siempre transitable y una lista de tramos (`waves`) con los patrones (`hSweep`, `vSweep`, `diag`, `combo`), el descanso, la advertencia y el ritmo. Con `lasers: null` el escenario no tiene láseres.

### Reemplazar el arte

Todas las texturas se generan en `src/art/index.ts`. Cada personaje es un spritesheet con celdas de 44 × 64 unidades (punto de apoyo de los pies en 22, 60), mirando a la derecha, con los frames listados en `FRAMES` de `character.ts`. Para usar arte dibujado alcanza con cargar una textura con la misma clave y los mismos nombres de frame.

## Ayudas para probar

- `?scene=Game` salta directo a la partida; `&level=2` elige el evento.
- `?canvas` fuerza el renderizador Canvas 2D.
- `?scene=Prologue` y `?scene=Ending` abren las cinemáticas.
- `__flashed` en la consola del navegador expone la instancia de Phaser y `__flashedRun()` el estado de la partida.
