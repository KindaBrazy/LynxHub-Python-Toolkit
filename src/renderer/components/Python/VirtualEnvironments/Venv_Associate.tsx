import {Avatar, Button, Chip, CloseButton, Dropdown, Label} from '@heroui-v3/react';
import {extractGitUrl, getFallbackString} from '@lynx_common/utils';
import {isEmpty} from 'lodash-es';
import {Plus} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useCardsState} from '../../../../../../src/renderer/mainWindow/redux/reducers/cards';
import {ModulesThatSupportPython} from '../../../../cross/CrossExtConstants';
import {allCardsExt} from '../../../DataHolder';
import pIpc from '../../../PIpc';
import {PythonToolkitActions, usePythonToolkitState} from '../../../reducer';
import {cacheUrl} from '../../../Utils';

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
    const cardAvatarMap = new Map(allCardsExt.map(card => [card.id, cacheUrl(extractGitUrl(card.repoUrl).avatarUrl)]));

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
            <Chip variant="soft">Not Associated</Chip>
          ) : (
            associated.map(item => (
              <Chip variant="soft" color="success" key={`${item.id}_associated`}>
                <Avatar className="size-5">
                  <Avatar.Image alt={item.title} src={item.avatarUrl} />
                  <Avatar.Fallback className="text-xs">{getFallbackString(item.title)}</Avatar.Fallback>
                </Avatar>
                {item.title}
                <CloseButton onPress={() => remove(item.id)} />
              </Chip>
            ))
          )}
        </div>
        <Dropdown>
          <Button size="sm" variant="tertiary" className="shrink-0" isIconOnly>
            <Plus />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu items={canBeAssociate} renderEmptyState={() => <span>Nothing available to associate!</span>}>
              {item => (
                <Dropdown.Item textValue={item.title} onPress={() => add(item.id)}>
                  <Avatar className="size-5">
                    <Avatar.Image alt={item.title} src={item.avatarUrl} />
                    <Avatar.Fallback className="text-xs">{getFallbackString(item.title)}</Avatar.Fallback>
                  </Avatar>
                  <Label>{item.title}</Label>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </>
  );
}
