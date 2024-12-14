import {useEffect} from 'react';

import {DropDownSectionType} from '../../src/App/Utils/Types';
import {Python_Icon} from './SvgIcons';

type Props = {
  addMenu: (sections: DropDownSectionType[], index?: number) => void;
};

export default function ToolkitMenu({addMenu}: Props) {
  useEffect(() => {
    const sections = [
      {
        key: 'python_toolkit',
        items: [
          {
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

  return <></>;
}
