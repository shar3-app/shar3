export enum Events {
  Share = 'share',
  StopSharing = 'stop-sharing',
  UpdateHistory = 'update-history',
  UpdateSettings = 'update-settings',
  SettingsUpdated = 'settings-updated',
  SetHistory = 'set-history',
  ShowSettings = 'show-settings'
}

export enum TrackEvent {
  Error = 'error',
  Share = 'share'
}

export enum ErrorEvent {
  Serve = 'SERVE',
  UpdateUrl = 'UPDATE-URL',
  StopServe = 'STOP-SERVE',
  LocalStorage = 'LOCALSTORAGE',
  CopyQR = 'COPY-QR',
  CopyUrl = 'COPY-URL',
  GetSettings = 'GET-SETTINGS'
}
