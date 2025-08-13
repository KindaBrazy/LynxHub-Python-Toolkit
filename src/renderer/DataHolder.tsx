import {CardData} from '@lynx_module/types';

export let allCardsExt: CardData[] = [];

export const setCards = (cards: CardData[]) => {
  allCardsExt = cards;
};
