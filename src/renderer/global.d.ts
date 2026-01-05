import {PythonVenvSelectItem} from '../cross/CrossExtTypes';

declare global {
  interface Window {
    selectedPV: PythonVenvSelectItem & {id: string};
    lynxVersion: string | undefined;
  }
}
