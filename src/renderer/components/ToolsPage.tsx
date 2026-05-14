import {Button} from '@heroui/react';
import {useOverlayState} from '@heroui/react';
import {SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

import {ToolsCard} from '../../../../src/renderer/mainWindow/components/ToolsCard';
import {AppDispatch} from '../../../../src/renderer/mainWindow/redux/store';
import pIpc from '../PIpc';
import {PythonToolkitActions} from '../reducer';
import PythonToolkitModal from './Python/PythonToolkitModal';
import SettingsModal from './Settings/SettingsModal';
import {PythonIcon} from './SvgIcons';

const title: string = 'Python Toolkit';
const desc: string = 'Manage Python versions, virtual environments, packages, requirements and more.';

export default function ToolsPage() {
  const dispatch = useDispatch<AppDispatch>();

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
          <Button variant="tertiary" onPress={settingsModal.open} isIconOnly>
            <SettingsMinimalistic />
          </Button>
        }
        title={title}
        description={desc}
        onPress={openModal}
        icon={<PythonIcon className="size-full p-0.5 text-yellow-400" />}
      />
      <PythonToolkitModal state={packageManagerModal} />
    </>
  );
}
