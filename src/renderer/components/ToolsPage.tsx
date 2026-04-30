import {Button} from '@heroui/react';
import {useOverlayState} from '@heroui-v3/react';
import {SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

import {ToolsCard} from '../../../../src/renderer/mainWindow/components/ToolsCard';
import {AppDispatch} from '../../../../src/renderer/mainWindow/redux/store';
import pIpc from '../PIpc';
import {PythonToolkitActions} from '../reducer';
import {cacheUrl} from '../Utils';
import PythonToolkitModal from './Python/PythonToolkitModal';
import SettingsModal from './Settings/SettingsModal';

const title: string = 'Python Toolkit';
const desc: string = 'Manage Python versions, virtual environments, packages, requirements files, and more.';
const iconUrl: string =
  'https://raw.githubusercontent.com/KindaBrazy/LynxHub-Python-Toolkit/refs/heads/metadata/icon.png';

export default function ToolsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const icon = cacheUrl(iconUrl);

  const settingsModal = useOverlayState();
  const packageManagerModal = useOverlayState();

  const openModal = () => {
    packageManagerModal.open();
    pIpc.getAssociates().then(associates => dispatch(PythonToolkitActions.setAssociates(associates || [])));
  };

  return (
    <>
      <SettingsModal state={settingsModal} />
      <ToolsCard
        footer={
          <Button as="div" variant="flat" color="primary" onPress={settingsModal.open} isIconOnly>
            <SettingsMinimalistic className="size-5" />
          </Button>
        }
        // @ts-expect-error Them image url can be undefined
        icon={icon}
        title={title}
        description={desc}
        onPress={openModal}
      />
      <PythonToolkitModal state={packageManagerModal} />
    </>
  );
}
