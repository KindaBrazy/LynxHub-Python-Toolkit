import {Button, Description, Popover} from '@heroui/react';
import {useCardOverlayState} from '@lynx/components/card/useCardOverlayState';
import {UseCardStoreType} from '@lynx/plugins/extensions/types';
import {useInstalledCard} from '@lynx/utils/hooks';
import {Unplug} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';

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
  const [pythonVersion, setPythonVersion] = useState<string>('');

  useEffect(() => {
    if (pythonPath) {
      pIpc.getPythonVersion(pythonPath).then(version => {
        setPythonVersion(`${version.major}.${version.minor}.${version.patch}`);
      });
    }
  }, [pythonPath]);

  const handleDeselect = () => {
    pIpc.removeAssociate(id);
    setPythonPath('');
  };

  const actionButtons = useMemo(() => {
    return pythonPath ? (
      <Popover>
        <Button size="sm" variant="tertiary" className="h-7 text-warning/70">
          <Unplug />
          Unassign Selected Python
        </Button>
        <Popover.Content className="max-w-xs">
          <Popover.Dialog className="flex flex-col">
            <Popover.Heading className="text-warning">Unassign {title}</Popover.Heading>
            <Description>
              This action will deselect {pythonVersion} for {title}.
            </Description>
            <Description>Are you sure?</Description>
            <Button size="sm" className="mt-2" variant="danger-soft" onPress={handleDeselect} fullWidth>
              Unassign
            </Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    ) : null;
  }, [pythonPath, pythonVersion]);

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
