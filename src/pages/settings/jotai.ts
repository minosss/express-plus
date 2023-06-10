import { atom } from 'jotai';

export const openSettingsAtom = atom(false);
export const openClearModalAtom = atom(false);

export type ColorScheme = 'auto' | 'light' | 'dark';
export const colorSchemeAtom = atom<ColorScheme>('auto');
