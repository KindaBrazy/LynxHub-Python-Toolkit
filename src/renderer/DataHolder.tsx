import {CardData} from '@lynx_cross/types/plugins/module';

import rendererIpc from '../../../src/renderer/main_window/ipc';

export let allCardsExt: CardData[] = [];
export let rIpc: typeof rendererIpc;

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
export const setRendererIpc = ipc => (rIpc = ipc);
