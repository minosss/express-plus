import type { QueryParams } from '../../api/types.js';
import { atom } from 'jotai';

export const queryAtom = atom<QueryParams | null>(null);

export const openQueryAtom = atom(
  (get) => get(queryAtom)?.id != null && get(queryAtom)?.kind != null,
);
