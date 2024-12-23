import {Button} from '@nextui-org/react';
import {isNil} from 'lodash';
import {observer} from 'mobx-react-lite';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {CardsDataManager, useCardData} from '../../src/App/Components/Cards/CardsDataManager';
import {DropDownSectionType} from '../../src/App/Utils/Types';
import {useInstalledCard} from '../../src/App/Utils/UtilHooks';
import {Refresh3_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons4';
import pIpc from '../PIpc';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';
import {Python_Icon} from './SvgIcons';

type Props = {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
};

const CardMenu = observer(({addMenu}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const cardData = useCardData() as CardsDataManager | null;
  const webUI = useInstalledCard(cardData?.id || '');

  const [pythonPath, setPythonPath] = useState<string>('');
  const [isLocatingVenv, setIsLocatingVenv] = useState<boolean>(false);

  const onPress = useCallback(() => {
    setIsOpen(true);
    if (cardData) cardData.setMenuIsOpen(false);
  }, [cardData]);

  useEffect(() => {
    if (isOpen && cardData) {
      pIpc.getAIVenv(cardData.id).then(folder => {
        if (isNil(folder)) {
          pIpc
            .findAIVenv(cardData.id, webUI?.dir)
            .then(result => {
              setPythonPath(result);
            })
            .catch(console.log);
        } else {
          setPythonPath(folder);
        }
      });
    }
  }, [isOpen, webUI, cardData]);

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
    if (cardData) {
      setIsLocatingVenv(true);
      pIpc
        .locateAIVenv(cardData.id)
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
    <PackageManagerModal
      size="4xl"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      id={cardData?.id || ''}
      pythonPath={pythonPath}
      locateVenv={locateVenv}
      projectPath={webUI?.dir}
      isLocating={isLocatingVenv}
      actionButtons={actionButtons}
      title={`${cardData?.title} Dependencies`}
    />
  );
});

export default CardMenu;
