import {CardData} from '../../../src/cross/plugin/ModuleTypes';
import rendererIpc from '../../../src/renderer/main_window/services/RendererIpc';

export let allCardsExt: CardData[] = [];
export let rIpc: typeof rendererIpc;

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
export const setRendererIpc = ipc => (rIpc = ipc);
