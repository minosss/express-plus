declare global {
  // ignore the error: chrome not found
  const chrome: any;
  const clients: any;
}

export interface Track {
  id: string;
  kind: string;
  phone?: string;
  state: string;
  context?: string;
  updatedAt: string;
  createdAt: string;
  tags?: string[];
}

export type TrackList = Track[];

export interface QueryHistory {
  id: string;
  kind: string;
  phone?: string;
  createdAt: number;
}

export type QueryHistoryList = QueryHistory[];

export enum MessageKind {
  // data
  Track = 'track',
  GetTrack = 'get_track',
  DeleteTrack = 'delete_track',
  PutTrack = 'put_track',
  Settings = 'settings',
  PutSettings = 'post_settings',
  History = 'history',
  // api
  Auto = 'auto',
  Query = 'query',
  //
  RefreshCookies = 'refresh_cookies',
  //
  ResetAlarm = 'reset_alarm',
  // @deprecated
  Clear = 'clear',
  ClearTrack = 'clear_track',
  ClearHistory = 'clear_history',
}

export interface ExtensionMessage {
  kind: MessageKind;
  data?: any;
}

export enum SettingsKind {
  EnableFilterDelivered = 'enableFilterDelivered',
  AutoInterval = 'autoInterval',
}

export type Settings = Record<SettingsKind, any>;
