import {Button} from '@nextui-org/react';
import {isNil} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {CardsDataManager} from '../../src/App/Components/Cards/CardsDataManager';
import {DropDownSectionType} from '../../src/App/Utils/Types';
import {useInstalledCard} from '../../src/App/Utils/UtilHooks';
import {Refresh3_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons4';
import pIpc from '../PIpc';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';
import {Python_Icon} from './SvgIcons';
import UIProvider from './UIProvider';

type Props = {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
  context: CardsDataManager;
};

const CardMenu = ({addMenu, context}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const webUI = useInstalledCard(context.id);

  const [pythonPath, setPythonPath] = useState<string>('');
  const [isLocatingVenv, setIsLocatingVenv] = useState<boolean>(false);

  const onPress = useCallback(() => {
    setIsOpen(true);
    context.setMenuIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      pIpc.getAIVenv(context.id).then(folder => {
        if (isNil(folder)) {
          pIpc
            .findAIVenv(context.id, webUI?.dir)
            .then(result => {
              setPythonPath(result);
            })
            .catch(console.log);
        } else {
          setPythonPath(folder);
        }
      });
    }
  }, [isOpen, webUI]);

  useEffect(() => {
    const sections = [
      {
        key: 'python_toolkit',
        items: [
          {
            onPress,
            className: 'cursor-default',
            key: 'python_deps',
            startContent: <Python_Icon className="size-3" />,
            title: 'Dependencies',
          },
        ],
        showDivider: true,
      },
    ];

    addMenu(sections, 0);
  }, []);

  const locateVenv = () => {
    if (context) {
      setIsLocatingVenv(true);
      pIpc
        .locateAIVenv(context.id)
        .then(result => {
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
            {!isLocatingVenv && 'Relocate'}
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
        setIsOpen={setIsOpen}
        pythonPath={pythonPath}
        locateVenv={locateVenv}
        projectPath={webUI?.dir}
        isLocating={isLocatingVenv}
        actionButtons={actionButtons}
        title={`${context.title} Dependencies`}
      />
    </UIProvider>
  );
};

export default CardMenu;
