import {CardData} from '../../../src/renderer/src/App/Modules/types';

export let allCardsExt: CardData[] = [];

export const setCards = (cards: CardData[]) => {
  allCardsExt = cards;
};
