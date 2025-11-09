import {PythonVenvSelectItem} from '../../cross/CrossExtTypes';
import pIpc from '../PIpc';

export function fetchAndSetPythonVenvs(
  setList: (list: PythonVenvSelectItem[]) => void,
  setIsLoading: (loading: boolean) => void,
  onSelected?: (item: PythonVenvSelectItem) => void,
) {
  return Promise.all([pIpc.getInstalledPythons(false), pIpc.getVenvs()])
    .then(([pythons, venvs]) => {
      const pythonItems: PythonVenvSelectItem[] = pythons.map(python => ({
        condaName: python.installationType === 'conda' ? python.condaName : undefined,
        version: python.version,
        dir: python.installFolder,
        type: python.installationType === 'conda' ? 'conda' : 'python',
        isDefault: python.isLynxHubDefault ? 'lynx' : python.isDefault ? 'system' : undefined,
      }));
      const venvItems: PythonVenvSelectItem[] = venvs.map(venv => ({
        condaName: venv.name,
        version: venv.pythonVersion,
        dir: venv.folder,
        type: 'venv',
      }));

      const combined = [...pythonItems, ...venvItems];
      setList(combined);

      if (onSelected && combined.length > 0) {
        onSelected(combined[0]);
      }
    })
    .catch(console.warn)
    .finally(() => setIsLoading(false));
}
