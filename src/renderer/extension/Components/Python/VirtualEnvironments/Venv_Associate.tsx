import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@nextui-org/react';
import {Divider} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {PYTHON_SUPPORTED_AI} from '../../../../../cross/extension/CrossExtConstants';
import {useCardsState} from '../../../../src/App/Redux/AI/CardsReducer';
import {Add_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {allCardsExt} from '../../../DataHolder';
import pIpc from '../../../PIpc';

type Props = {
  pythonPath: string;
};

type Item = {id: string; title: string};

export default function Venv_Associate({pythonPath}: Props) {
  const [associated, setAssociated] = useState<Item[]>([]);
  const [itemsToAdd, setItemsToAdd] = useState<Item[]>([]);

  const installedCards = useCardsState('installedCards');

  useEffect(() => {
    if (pythonPath) getAssociated();
  }, [pythonPath]);

  const getAssociated = useCallback(() => {
    pIpc.getAIVenvs().then(aiVenvs => {
      if (!aiVenvs) return;

      const cardTitleMap = new Map(allCardsExt.map(card => [card.id, card.title]));

      const installedCardsWithTitles: Item[] = installedCards
        .filter(card => cardTitleMap.has(card.id))
        .map(card => ({
          title: cardTitleMap.get(card.id)!,
          id: card.id,
        }));

      const aiVenvIds = new Set(aiVenvs.map(aiVenv => aiVenv.id));

      const newItemsToAdd = installedCardsWithTitles.filter(
        card => !aiVenvIds.has(card.id) && PYTHON_SUPPORTED_AI.includes(card.id),
      );

      setItemsToAdd(newItemsToAdd);

      const activeAiVenvsWithTitles = aiVenvs
        .filter(aiVenv => aiVenv.path === pythonPath && installedCards.some(card => card.id === aiVenv.id))
        .map(aiVenv => ({
          title: cardTitleMap.get(aiVenv.id)!,
          id: aiVenv.id,
        }));

      setAssociated(activeAiVenvsWithTitles);
    });
  }, [pythonPath, installedCards]);

  const add = (id: string) => {
    pIpc.addAIVenv(id, pythonPath);
    getAssociated();
  };

  const remove = (id: string) => {
    pIpc.removeAIVenv(id);
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
        <Dropdown size="sm" className="border-1 border-foreground-200">
          <DropdownTrigger>
            <Button size="sm" variant="flat" isIconOnly>
              <Add_Icon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu variant="faded" items={itemsToAdd}>
            {item => (
              <DropdownItem key={item.id} onPress={() => add(item.id)}>
                {item.title}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
}
