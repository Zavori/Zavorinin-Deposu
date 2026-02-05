import { FootballGame } from './core/FootballGame.js';
import { getUIRefs } from './ui/dom.js';
import { renderAll } from './ui/render.js';
import { bindUIEvents, bindDynamicEvents } from './ui/events.js';

const game = new FootballGame();
const ui = getUIRefs();

renderAll(game, ui);
bindUIEvents(game, ui);
bindDynamicEvents(game, ui);
