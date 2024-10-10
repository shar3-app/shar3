import { Settings } from '@shared';
import { createStore } from '@tauri-apps/plugin-store';

export const defaultSettings: Settings = {
  locale: 'en',
  theme: 'dark',
  auth: {
    enabled: false,
    username: 'username',
    password: 'password'
  },
  shortcuts: true
};

const settingsStore = await createStore('settings.bin', {
  autoSave: 1 as unknown as boolean
});

export const saveSettings = (value: Settings) => {
  Object.keys(value).forEach(async (key) => {
    await settingsStore.set(key, value[key as keyof Settings]);
  });
};

export const updateSettings = async <T extends keyof Settings>(key: T, value: Settings[T]) => {
  await settingsStore.set(key, value);
};

export const onSettingChanges = async (
  key: keyof Settings,
  callback: (value: unknown) => void
): Promise<any> => {
  return await settingsStore.onKeyChange(key, callback);
};

export const getSetting = async (key: keyof Settings): Promise<any> => {
  return await settingsStore.get(key);
};

export const getSettings = async (): Promise<Settings> => {
  const entries = await settingsStore.entries();
  return {
    ...defaultSettings,
    ...(Object.fromEntries(entries ?? []) as unknown as Settings)
  };
};
