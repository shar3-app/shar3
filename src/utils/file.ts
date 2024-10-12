import { type } from '@tauri-apps/plugin-os';

export const getFileName = (path: string) =>
  path.slice(path.lastIndexOf(type() === 'windows' ? '\\' : '/') + 1);
