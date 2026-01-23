import {CardData} from '@lynx_common/types/plugins/modules';

export let allCardsExt: CardData[] = [];

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
