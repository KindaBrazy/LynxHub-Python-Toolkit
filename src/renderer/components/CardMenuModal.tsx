import {Button} from '@heroui/react';
import {UseOverlayStateReturn} from '@heroui-v3/react';
import {useInstalledCard} from '@lynx/utils/hooks';
import {useMemo, useState} from 'react';

import pIpc from '../PIpc';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';

type Props = {id: string; title: string; state: UseOverlayStateReturn};

export default function CardMenuModal({state, id, title}: Props) {
  const webUI = useInstalledCard(id);

  const [pythonPath, setPythonPath] = useState<string>('');

  const handleDeselect = () => {
    pIpc.removeAssociate(id);
    setPythonPath('');
  };

  const actionButtons = useMemo(() => {
    return pythonPath
      ? [
          <Button
            size="sm"
            variant="flat"
            color="danger"
            key="reloacte_venv"
            className="min-w-32!"
            onPress={handleDeselect}>
            Deselect
          </Button>,
        ]
      : [];
  }, [pythonPath]);

  return (
    <PackageManagerModal
      id={id}
      size="4xl"
      state={state}
      pythonPath={pythonPath}
      projectPath={webUI?.dir}
      setPythonPath={setPythonPath}
      actionButtons={actionButtons}
      title={`${title} Dependencies`}
    />
  );
}
