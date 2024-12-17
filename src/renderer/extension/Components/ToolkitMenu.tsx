import {Button} from '@nextui-org/react';
import {isNil} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {useCardData} from '../../src/App/Components/Cards/CardsDataManager';
import {DropDownSectionType} from '../../src/App/Utils/Types';
import {useInstalledCard} from '../../src/App/Utils/UtilHooks';
import {Refresh3_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons4';
import pIpc from '../PIpc';
import {Python_Icon} from './SvgIcons';
import PackageManagerModal from './ToolsPage/PackagePython/PackageManagerModal';

type Props = {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
};

export default function ToolkitMenu({addMenu}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {setMenuIsOpen, title, id} = useCardData();
  const webUI = useInstalledCard(id);

  const [pythonPath, setPythonPath] = useState<string>('');
  const [isLocatingVenv, setIsLocatingVenv] = useState<boolean>(false);

  const onPress = useCallback(() => {
    setIsOpen(true);
    setMenuIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      pIpc.getAIVenv(id).then(folder => {
        console.log('getAIVenv', folder);
        if (isNil(folder)) {
          pIpc
            .findAIVenv(id, webUI?.dir)
            .then(result => {
              console.log('findAIVenv', result);
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
    setIsLocatingVenv(true);
    pIpc
      .locateAIVenv(id)
      .then(result => {
        setPythonPath(result);
      })
      .catch(console.error)
      .finally(() => {
        setIsLocatingVenv(false);
      });
  };

  const actionButtons = useMemo(() => {
    return pythonPath
      ? [
          <Button
            size="sm"
            variant="flat"
            key="reloacte_venv"
            onPress={locateVenv}
            isLoading={isLocatingVenv}
            startContent={!isLocatingVenv && <Refresh3_Icon />}>
            {!isLocatingVenv && 'Relocate'}
          </Button>,
        ]
      : [];
  }, [pythonPath, isLocatingVenv]);

  return (
    <PackageManagerModal
      size="4xl"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      pythonPath={pythonPath}
      locateVenv={locateVenv}
      isLocating={isLocatingVenv}
      actionButtons={actionButtons}
      title={`${title} Dependencies`}
    />
  );
}
