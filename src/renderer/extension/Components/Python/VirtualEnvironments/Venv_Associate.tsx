import {Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@nextui-org/react';
import {Divider} from 'antd';
import {compact, isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';

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

  const getAssociated = useCallback(() => {
    pIpc.getAIVenvs().then(data => {
      if (data) {
        const actives = compact(data.map(item => (item.path === pythonPath ? item.id : null)));
        setAssociated(
          compact(
            actives.map(item => {
              const card = allCardsExt.find(card => card.id === item);
              return card ? {title: card.title, id: card.id} : null;
            }),
          ),
        );
      }
    });
  }, [pythonPath]);

  useEffect(() => {
    if (pythonPath) getAssociated();
  }, [pythonPath]);

  const installedCards = useCardsState('installedCards');

  const titles: Item[] = useMemo(() => {
    return compact(
      installedCards.map(card => {
        const title = allCardsExt.find(item => item.id === card.id)?.title;
        return title ? {title, id: card.id} : null;
      }),
    ).filter(item => !associated.some(card => card.id === item.id));
  }, [installedCards, associated]);

  const add = (id: string) => {
    console.log('adding', id);
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
          <span>Associated AI</span>
        </div>
      </Divider>
      <div className="flex flex-row justify-between w-full">
        <div className="w-full flex flex-row gap-x-1 gap-y-2 items-center flex-wrap">
          {isEmpty(associated) ? (
            <Chip size="sm" radius="sm" variant="dot" color="default">
              Not Associated
            </Chip>
          ) : (
            associated.map(item => (
              <Chip size="sm" radius="sm" key={item.id} variant="dot" color="success" onClose={() => remove(item.id)}>
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
          <DropdownMenu items={titles} variant="faded">
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
