import {Button} from '@heroui/react';
import {isNil} from 'lodash';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useInstalledCard} from '../../src/App/Utils/UtilHooks';
import {Refresh3_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons4';
import pIpc from '../PIpc';
import {PythonToolkitActions, usePythonToolkitState} from '../reducer';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';
import UIProvider from './UIProvider';

export default function CardMenuModal() {
  const {isOpen, context} = usePythonToolkitState('menuModal');
  const webUI = useInstalledCard(context.id);

  const dispatch = useDispatch();

  const [pythonPath, setPythonPath] = useState<string>('');
  const [isLocatingVenv, setIsLocatingVenv] = useState<boolean>(false);

  const onOpenChange = (value: boolean) => {
    if (!value) dispatch(PythonToolkitActions.closeMenuModal());
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

  const actionButtons = useMemo(() => {
    return pythonPath
      ? [
          <Button
            size="sm"
            variant="flat"
            key="reloacte_venv"
            onPress={locateVenv}
            className="!min-w-32"
            isLoading={isLocatingVenv}
            startContent={!isLocatingVenv && <Refresh3_Icon />}>
            {!isLocatingVenv && 'Change Venv'}
          </Button>,
        ]
      : [];
  }, [pythonPath, isLocatingVenv]);

  return (
    <UIProvider>
      <PackageManagerModal
        size="4xl"
        isOpen={isOpen}
        id={context.id}
        pythonPath={pythonPath}
        locateVenv={locateVenv}
        setIsOpen={onOpenChange}
        projectPath={webUI?.dir}
        isLocating={isLocatingVenv}
        actionButtons={actionButtons}
        title={`${context.title} Dependencies`}
      />
    </UIProvider>
  );
}
