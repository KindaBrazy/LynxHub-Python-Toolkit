import {CardData} from '../../../src/cross/plugin/ModuleTypes';
import type rendererIpc from '../../../src/renderer/src/App/RendererIpc';

export let allCardsExt: CardData[] = [];
export let rIpc: typeof rendererIpc;

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
export const setRendererIpc = ipc => (rIpc = ipc);
