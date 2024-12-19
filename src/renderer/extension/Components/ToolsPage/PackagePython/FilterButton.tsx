import {Button} from '@nextui-org/react';
import {Filter_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';

export default function FilterButton() {
  return (
    <Button size="sm" variant="flat" isIconOnly>
      <Filter_Icon />
    </Button>
  );
}
