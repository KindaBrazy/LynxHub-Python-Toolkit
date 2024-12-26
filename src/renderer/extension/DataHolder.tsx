import {CardData} from '../src/App/Modules/types';

export let allCardsExt: CardData[] = [];

export const setCards = (cards: CardData[]) => {
  allCardsExt = cards;
};
