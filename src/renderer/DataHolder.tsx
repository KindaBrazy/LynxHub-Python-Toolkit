import {CardData} from '@lynx_cross/types/plugins/modules';

export let allCardsExt: CardData[] = [];

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
