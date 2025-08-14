import {Avatar, Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {Divider} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {useCardsState} from '../../../../../../src/renderer/src/App/Redux/Reducer/CardsReducer';
import {Add_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {PYTHON_SUPPORTED_AI} from '../../../../cross/CrossExtConstants';
import {allCardsExt} from '../../../DataHolder';
import pIpc from '../../../PIpc';

type Props = {
  folder: string;
};

type Item = {id: string; title: string};
type ItemAvatar = Item & {avatarUrl: string | undefined};

export default function Venv_Associate({folder}: Props) {
  const [associated, setAssociated] = useState<Item[]>([]);
  const [itemsToAdd, setItemsToAdd] = useState<ItemAvatar[]>([]);

  const installedCards = useCardsState('installedCards');

  useEffect(() => {
    if (folder) getAssociated();
  }, [folder]);

  const getAssociated = useCallback(() => {
    pIpc.getAssociates().then(associates => {
      const associateList = associates || [];

      const cardTitleMap = new Map(allCardsExt.map(card => [card.id, card.title]));

      const installedCardsWithTitles: ItemAvatar[] = installedCards
        .filter(card => cardTitleMap.has(card.id))
        .map(card => {
          const avatarUrl = window.localStorage.getItem(`${card.id}-card-dev-img`) || undefined;
          return {
            avatarUrl,
            title: cardTitleMap.get(card.id)!,
            id: card.id,
          };
        });

      const associateIds = new Set(associateList.map(item => item.id));

      // TODO: add or remove supported modules
      const newItemsToAdd = installedCardsWithTitles.filter(
        card => !associateIds.has(card.id) && PYTHON_SUPPORTED_AI.includes(card.id),
      );

      setItemsToAdd(newItemsToAdd);

      const activeAssociatesWithTitles = associateList
        .filter(aiVenv => aiVenv.dir === folder && installedCards.some(card => card.id === aiVenv.id))
        .map(aiVenv => ({
          title: cardTitleMap.get(aiVenv.id)!,
          id: aiVenv.id,
        }));

      setAssociated(activeAssociatesWithTitles);
    });
  }, [folder, installedCards]);

  const add = (id: string) => {
    pIpc.addAssociate({id, dir: folder, type: 'venv'});
    getAssociated();
  };

  const remove = (id: string) => {
    pIpc.removeAssociate(id);
    getAssociated();
  };

  return (
    <>
      <Divider variant="dashed" className="!my-0">
        <div className="flex flex-row items-center gap-x-2">
          <span className="text-small font-bold">Associated AI</span>
        </div>
      </Divider>
      <div className="flex flex-row justify-between w-full">
        <div className="w-full flex flex-row gap-x-1 gap-y-2 items-center flex-wrap">
          {isEmpty(associated) ? (
            <Chip size="sm" radius="sm" variant="dot" color="default" className="animate-appearance-in">
              Not Associated
            </Chip>
          ) : (
            associated.map(item => (
              <Chip
                size="sm"
                radius="sm"
                key={item.id}
                variant="dot"
                color="success"
                onClose={() => remove(item.id)}
                className="animate-appearance-in">
                {item.title}
              </Chip>
            ))
          )}
        </div>
        <Dropdown size="sm" className="border-1 border-foreground/10">
          <DropdownTrigger>
            <Button size="sm" variant="flat" isIconOnly>
              <Add_Icon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu variant="flat" items={itemsToAdd}>
            {item => (
              <DropdownItem
                key={item.id}
                onPress={() => add(item.id)}
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
