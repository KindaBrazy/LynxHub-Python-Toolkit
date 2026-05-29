import type {ExtensionRendererApi} from '@lynx/plugins/extensions/types/api';
import type {CardData} from '@lynx_common/types/plugins/modules';

type ToastType = ExtensionRendererApi['toast'];
export let allCardsExt: CardData[] = [];
export let toastHolder: ToastType | undefined;

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
export const setToast = (t: ToastType) => (toastHolder = t);
