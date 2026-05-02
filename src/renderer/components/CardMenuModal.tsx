import {Button} from '@heroui-v3/react';
import {useCardOverlayState} from '@lynx/components/card/useCardOverlayState';
import {UseCardStoreType} from '@lynx/plugins/extensions/types';
import {useInstalledCard} from '@lynx/utils/hooks';
import {useMemo, useState} from 'react';

import {DepsModalKey} from '../consts';
import pIpc from '../PIpc';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';

type Props = {useCardStore: UseCardStoreType; useCardOverlayState: typeof useCardOverlayState};

export default function CardMenuModal({useCardOverlayState, useCardStore}: Props) {
  const id = useCardStore(state => state.id);
  const title = useCardStore(state => state.title);

  const webUI = useInstalledCard(id);

  const state = useCardOverlayState(DepsModalKey);

  const [pythonPath, setPythonPath] = useState<string>('');

  const handleDeselect = () => {
    pIpc.removeAssociate(id);
    setPythonPath('');
  };

  const actionButtons = useMemo(() => {
    return pythonPath
      ? [
          <Button size="sm" key="reloacte_venv" variant="danger-soft" className="min-w-32!" onPress={handleDeselect}>
            Deselect
          </Button>,
        ]
      : [];
  }, [pythonPath]);

  return (
    <PackageManagerModal
      id={id}
      state={state}
      pythonPath={pythonPath}
      projectPath={webUI?.dir}
      setPythonPath={setPythonPath}
      actionButtons={actionButtons}
      title={`${title} Dependencies`}
    />
  );
}
