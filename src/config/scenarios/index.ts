import { birthday } from './birthday';
import { boss } from './boss';
import { church } from './church';
import { concert } from './concert';
import { disco } from './disco';
import { quince } from './quince';
import { wedding } from './wedding';
import type { ScenarioConfig } from './types';

/** Orden de la campaña. Los próximos eventos se agregan a esta lista. */
export const CAMPAIGN: ScenarioConfig[] = [church, birthday, quince, wedding, disco, concert, boss];
