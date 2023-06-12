import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const openSettingsAtom = atom(false);
export const openClearModalAtom = atom(false);

export type ColorScheme = 'auto' | 'light' | 'dark';
export const colorSchemeAtom = atomWithStorage<ColorScheme>('colorScheme', 'auto');
