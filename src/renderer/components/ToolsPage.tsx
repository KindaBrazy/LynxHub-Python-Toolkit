import {Button} from '@heroui/react';
import {useOverlayState} from '@heroui/react';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

import {ToolsCard} from '../../../../src/renderer/mainWindow/components/ToolsCard';
import {AppDispatch} from '../../../../src/renderer/mainWindow/redux/store';
import {setActivePage} from '../DataHolder';
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

  const handleOpen = () => {
    pIpc.getAssociates().then(associates => dispatch(PythonToolkitActions.setAssociates(associates || [])));
    if (setActivePage) {
      setActivePage('python-toolkit', 'Python Toolkit');
    } else {
      packageManagerModal.open();
    }
  };

  return (
    <>
      <SettingsModal state={settingsModal} />
      <ToolsCard
        footer={
          <LynxTooltip delay={300} content="Settings">
            <Button variant="tertiary" onPress={settingsModal.open} isIconOnly>
              <SettingsMinimalistic />
            </Button>
          </LynxTooltip>
        }
        title={title}
        description={desc}
        onPress={handleOpen}
        icon={<PythonIcon className="size-full p-0.5 text-yellow-400" />}
      />
      <PythonToolkitModal state={packageManagerModal} />
    </>
  );
}
