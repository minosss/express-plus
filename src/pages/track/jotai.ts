import {atom} from 'jotai';
import type {Track} from '../../types';

export const trackListAtom = atom<Track[]>([]);
