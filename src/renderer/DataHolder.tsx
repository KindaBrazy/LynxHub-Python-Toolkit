import {CardData} from '@lynx_cross/types/plugins/modules';
import rendererIpc from '@lynx_shared/ipc';

export let allCardsExt: CardData[] = [];
export let rIpc: typeof rendererIpc;

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
export const setRendererIpc = ipc => (rIpc = ipc);
