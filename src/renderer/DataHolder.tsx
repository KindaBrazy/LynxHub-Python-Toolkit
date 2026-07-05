import type {ExtensionRendererApi} from '@lynx/plugins/extensions/types/api';
import type {CardData} from '@lynx_common/types/plugins/modules';

type ToastType = ExtensionRendererApi['toast'];
type ActivePageType = ExtensionRendererApi['tabs']['setActivePage'];

export let allCardsExt: CardData[] = [];
export let toastHolder: ToastType | undefined;
export let setActivePage: ActivePageType | undefined;

export const setCards = (cards: CardData[]) => (allCardsExt = cards);
export const setToast = (t: ToastType) => (toastHolder = t);
export const setTheActivePage = (api: ActivePageType) => (setActivePage = api);
