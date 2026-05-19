import {Dropdown, Label} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {isWin} from '@lynx_common/utils';
import {Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';

import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import pIpc from '../../../PIpc';

type Props = {
  python: PythonInstallation;
  updateDefault: (installFolder: string, type: 'isDefault' | 'isLynxHubDefault') => void;
};

export default function SetDefault({python, updateDefault}: Props) {
  if (!isWin) return null;

  const makeDefault = () => {
    const confirmed = window.confirm(
      `Set Python ${python.version} as the system default?\n\nTarget path:\n${python.installFolder}\n\nThis updates` +
        ` the Python directory used at the front of PATH for system-default detection. Existing terminals may need` +
        ` to be restarted before they see the change.`,
    );

    if (!confirmed) return;

    pIpc
      .setDefaultPython(python.installFolder)
      .then(() => {
        topToast.success(`Python ${python.version} is now the system default.`);
        updateDefault(python.installFolder, 'isDefault');
      })
      .catch(error => {
        topToast.danger(`Failed to set ${python.version} as system default. Please try again later.`);
        console.error(error);
      });
  };

  const makeLynxDefault = () => {
    const confirmed = window.confirm(
      `Set Python ${python.version} as the LynxHub default?\n\nTarget path:\n${python.installFolder}\n\nThis` +
        ` changes the PATH used by LynxHub-run tools so new Python package operations use this installation first.`,
    );

    if (!confirmed) return;

    const showFailedToast = () => {
      topToast.danger(`Failed to set ${python.version} as LynxHub default. Please try again later.`);
    };

    pIpc
      .replacePythonPath(python.installFolder)
      .then(result => {
        if (result) {
          topToast.success(`Python ${python.version} is now the default for LynxHub.`);
          updateDefault(python.installFolder, 'isLynxHubDefault');
        } else {
          showFailedToast();
        }
      })
      .catch(e => {
        console.log(e);
        showFailedToast();
      });
  };

  return (
    <>
      <Dropdown.Item id="system-default" onPress={makeDefault} textValue="Set as System Default">
        {python.isDefault ? <Refresh className="size-4" /> : <CheckRead size={16} />}
        <Label>
          Set as <span className="font-bold text-LynxPurple">System Default</span>
        </Label>
      </Dropdown.Item>
      <Dropdown.Item id="lynxhub-default" onPress={makeLynxDefault} textValue="Set as LynxHub Default">
        {python.isLynxHubDefault ? <Refresh className="size-4" /> : <CheckRead size={16} />}
        <Label>
          Set as <span className="font-bold text-accent">LynxHub Default</span>
        </Label>
      </Dropdown.Item>
    </>
  );
}
