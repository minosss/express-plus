import { useSetAtom, useAtom, atom } from 'jotai';
import { queryAtom } from './jotai';

export const openKindSelectAtom = atom(false);

export function useKindSelect() {
  const [opened, setOpened] = useAtom(openKindSelectAtom);
  const setQuery = useSetAtom(queryAtom);

  const openKindSelect = () => {
    setOpened(true);
  };

  const onSelectKind = (value: string) => {
    setOpened(false);
    setQuery((query) => (query ? { ...query, kind: value } : query));
  };

  return {
    opened,
    setOpened,
    openKindSelect,
    onSelectKind,
  };
}
