import {useCallback, useEffect, useState} from 'react';

import {useCardData} from '../../src/App/Components/Cards/CardsDataManager';
import {DropDownSectionType} from '../../src/App/Utils/Types';
import {Python_Icon} from './SvgIcons';
import PackageManagerModal from './ToolsPage/PackagePython/PackageManagerModal';
import RequirementsBtn from './ToolsPage/PackagePython/Requirements/RequirementsModal_Btn';

type Props = {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
};

export default function ToolkitMenu({addMenu}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {setMenuIsOpen, title} = useCardData();

  const onPress = useCallback(() => {
    setIsOpen(true);
    setMenuIsOpen(false);
  }, []);

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

  return (
    <PackageManagerModal
      size="3xl"
      pythonPath=""
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={`${title} Dependencies`}
    />
  );
}
