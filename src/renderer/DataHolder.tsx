import {CardData} from '../../../src/cross/plugin/ModuleTypes';

export let allCardsExt: CardData[] = [];

export const setCards = (cards: CardData[]) => {
  allCardsExt = cards;
};
