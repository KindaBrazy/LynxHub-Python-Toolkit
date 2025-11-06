import {Avatar, Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../src/cross/CrossUtils';
import {useCardsState} from '../../../../../../src/renderer/src/App/Redux/Reducer/CardsReducer';
import {Add_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {ModulesThatSupportPython} from '../../../../cross/CrossExtConstants';
import {allCardsExt} from '../../../DataHolder';
import pIpc from '../../../PIpc';
import {PythonToolkitActions, usePythonToolkitState} from '../../../reducer';

type Props = {
  folder: string;
  type: 'python' | 'venv' | 'conda';
};

type Item = {id: string; title: string; avatarUrl: string | undefined};

export default function Venv_Associate({folder, type}: Props) {
  const associates = usePythonToolkitState('associates');
  const installedCards = useCardsState('installedCards');

  const [associated, setAssociated] = useState<Item[]>([]);
  const [canBeAssociate, setCanBeAssociate] = useState<Item[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Map card IDs to their titles
    const cardTitleMap = new Map(allCardsExt.map(card => [card.id, card.title]));
    const cardAvatarMap = new Map(allCardsExt.map(card => [card.id, extractGitUrl(card.repoUrl).avatarUrl]));

    // Get installed cards that exist in the map and attach avatar/title
    const installedCardsWithTitles: Item[] = installedCards
      .filter(card => cardTitleMap.has(card.id))
      .map(card => {
        const id = card.id;
        const avatarUrl = cardAvatarMap.get(id);
        const title = cardTitleMap.get(id) || '';

        return {
          avatarUrl,
          title,
          id,
        };
      });

    // Collect associate IDs for a quick lookup
    const associateIds = new Set(associates.map(item => item.id));

    // Determine new items that can be added (only supported modules)
    const newItemsToAdd = installedCardsWithTitles.filter(
      card => !associateIds.has(card.id) && ModulesThatSupportPython.includes(card.id),
    );
    setCanBeAssociate(newItemsToAdd);

    // Filter associates that match the current folder and are still installed
    const activeAssociatesWithTitles = associates
      .filter(item => item.dir === folder && installedCards.some(card => card.id === item.id))
      .map(item => {
        const id = item.id;
        const avatarUrl = cardAvatarMap.get(id);
        const title = cardTitleMap.get(id) || '';

        return {
          avatarUrl,
          title,
          id,
        };
      });

    setAssociated(activeAssociatesWithTitles);
  }, [associates]);

  const refreshAssociates = useCallback(() => {
    pIpc.getAssociates().then(associates => dispatch(PythonToolkitActions.setAssociates(associates || [])));
  }, []);

  const add = (id: string) => {
    pIpc.addAssociate({id, dir: folder, type});
    refreshAssociates();
  };

  const remove = (id: string) => {
    pIpc.removeAssociate(id);
    refreshAssociates();
  };

  return (
    <>
      <div className="flex flex-row justify-between w-full">
        <div className="w-full flex flex-row gap-x-1 gap-y-2 items-center flex-wrap">
          {isEmpty(associated) ? (
            <Chip variant="flat">Not Associated</Chip>
          ) : (
            associated.map(item => (
              <Chip
                variant="flat"
                color="success"
                className="p-2"
                key={`${item.id}_associated`}
                onClose={() => remove(item.id)}
                startContent={<Avatar className="size-5" src={item.avatarUrl} />}>
                {item.title}
              </Chip>
            ))
          )}
        </div>
        <Dropdown size="sm" className="border-1 border-foreground/10">
          <DropdownTrigger>
            <Button size="sm" radius="full" variant="flat" isIconOnly>
              <Add_Icon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu variant="flat" items={canBeAssociate} emptyContent="Nothing available to associate.">
            {item => (
              <DropdownItem
                onPress={() => add(item.id)}
                key={`${item.id}_canBeAssociate`}
                startContent={<Avatar className="size-6" src={item.avatarUrl} />}>
                {item.title}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
}
