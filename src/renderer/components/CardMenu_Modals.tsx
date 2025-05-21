import {Button} from '@heroui/react';
import {isNil} from 'lodash';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useInstalledCard} from '../../../../src/renderer/src/App/Utils/UtilHooks';
import pIpc from '../PIpc';
import {ContextType, PythonToolkitActions} from '../reducer';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';
import UIProvider from './UIProvider';

type Props = {isOpen: boolean; context: ContextType; show: string};

export default function CardMenu_Modals({isOpen, context, show}: Props) {
  const webUI = useInstalledCard(context.id);

  const dispatch = useDispatch();

  const [pythonPath, setPythonPath] = useState<string>('');
  const [isLocatingVenv, setIsLocatingVenv] = useState<boolean>(false);

  const onOpenChange = (value: boolean) => {
    if (!value) dispatch(PythonToolkitActions.closeMenuModal({tabID: context.tabID}));
  };

  useEffect(() => {
    if (isOpen) {
      pIpc.getAIVenv(context.id).then(folder => {
        if (isNil(folder)) {
          pIpc
            .findAIVenv(context.id, webUI?.dir)
            .then(result => {
              pIpc.checkAIVenvEnabled();
              setPythonPath(result);
            })
            .catch(console.log);
        } else {
          setPythonPath(folder);
          pIpc.checkAIVenvEnabled();
        }
      });
    } else {
      setPythonPath('');
    }
  }, [isOpen, webUI, context]);

  const locateVenv = () => {
    if (context) {
      setIsLocatingVenv(true);
      pIpc
        .locateAIVenv(context.id)
        .then(result => {
          pIpc.checkAIVenvEnabled();
          setPythonPath(result);
        })
        .catch(console.error)
        .finally(() => {
          setIsLocatingVenv(false);
        });
    }
  };

  const handleDeselect = () => {
    pIpc.removeAIVenv(context.id);
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
            className="!min-w-32"
            onPress={handleDeselect}>
            Deselect
          </Button>,
        ]
      : [];
  }, [pythonPath, isLocatingVenv]);

  return (
    <UIProvider>
      <PackageManagerModal
        size="4xl"
        show={show}
        isOpen={isOpen}
        id={context.id}
        pythonPath={pythonPath}
        locateVenv={locateVenv}
        setIsOpen={onOpenChange}
        projectPath={webUI?.dir}
        isLocating={isLocatingVenv}
        setPythonPath={setPythonPath}
        actionButtons={actionButtons}
        title={`${context.title} Dependencies`}
      />
    </UIProvider>
  );
}
