import type { HistoryList } from '../../types';
import { atom } from 'jotai';

export const openSearchAtom = atom(false);

export const historyListAtom = atom<HistoryList>([]);
