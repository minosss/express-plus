import {atom} from 'jotai';
import {QueryParams} from '../../api/types.js';

export const queryAtom = atom<QueryParams | null>(null);

export const openQueryAtom = atom(
	(get) => get(queryAtom)?.id != null && get(queryAtom)?.kind != null
);
