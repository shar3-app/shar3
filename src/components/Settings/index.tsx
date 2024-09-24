import Button from '@components/Button';
import { useLocalStorage, useTheme } from '@hooks';
import { Events, Locale, LocalStorage, Settings } from '@shared';
import { emit, listen } from '@tauri-apps/api/event';
import { debounce, toggleScroll } from '@utils';
import { Modal } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useT } from 'talkr';
import SettingsCheckbox from './Checkbox';
import LanguageSelector from './LanguageSelector';
import TextInput from './TextInput';

const defaultSettings: Settings = {
  locale: 'en',
  publicShare: false,
  theme: 'dark',
  auth: null,
  shortcuts: true
};

const SettingsModal = () => {
  const [visibility, setVisibility] = useState(false);
  const [_, setHistoryClicks] = useState(0);
  const { value: settings, setValue: setSettings } = useLocalStorage<Settings>(
    LocalStorage.Settings,
    defaultSettings
  );
  const { setTheme } = useTheme();
  const { T } = useT();

  useEffect(() => {
    const listenSettings = listen<Partial<Settings>>(
      Events.UpdateSettings,
      ({ payload: newSettings }) =>
        setSettings((currentSettings) => ({
          ...currentSettings,
          ...newSettings
        }))
    );
    const listenShow = listen(Events.ShowSettings, () => setVisibility(true));

    return () => {
      listenSettings.then((f) => f());
      listenShow.then((f) => f());
    };
  }, []);

  const handleChange = (key: keyof Settings, value: any) => {
    if (key === 'theme') {
      setTheme(value);
    }

    setSettings((currentSettings) => {
      const newSettings = {
        ...(currentSettings ?? {}),
        [key]: value ?? null
      };
      emit(Events.SettingsUpdated, newSettings);

      return newSettings;
    });
  };

  const clearHistory = () => {
    setHistoryClicks((clicks) => {
      if (clicks) {
        toast.success(T('settings.clean_history_success'));
        emit(Events.SetHistory, []);
        return 0;
      } else {
        toast.message(T('settings.clean_history_confirm'));
        return 1;
      }
    });
  };

  const close = () => {
    setVisibility(false);
    toggleScroll(true);
  };

  return (
    <Modal
      dismissible
      show={visibility}
      onClose={close}
      theme={{
        header: {
          base: 'flex items-center justify-between rounded-t border-b p-5 dark:border-gray-600',
          close: {
            base: 'ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white [outline:none] border-none'
          }
        }
      }}
    >
      <Modal.Header>{T('settings.title')}</Modal.Header>
      <Modal.Body>
        <SettingsSections title="settings.general_settings">
          <SettingsCheckbox
            label={T('settings.dark_theme')}
            isChecked={settings.theme === 'dark'}
            onChange={(event) => handleChange('theme', event.target.checked ? 'dark' : 'light')}
          />
          <SettingsCheckbox
            label={T('settings.shortcuts')}
            isChecked={settings.shortcuts}
            onChange={(event) => handleChange('shortcuts', event.target.checked)}
          />
        </SettingsSections>

        <SettingsSections title="settings.auth">
          <SettingsCheckbox
            isChecked={settings.auth?.enabled}
            onChange={(event) =>
              handleChange('auth', {
                enabled: event.target.checked,
                username: settings.auth?.username,
                password: settings.auth?.password
              })
            }
          />
          {settings.auth?.enabled && (
            <>
              <fieldset>
                <TextInput
                  className="mb-2"
                  name="username"
                  placeholder={T('settings.auth_username')}
                  value={settings.auth?.username ?? ''}
                  onChange={debounce(
                    (event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange('auth', {
                        enabled: settings.auth?.enabled,
                        username: event.target.value || null,
                        password: settings.auth?.password
                      }),
                    750
                  )}
                />
                <TextInput
                  name="password"
                  placeholder={T('settings.auth_password')}
                  value={settings.auth?.password ?? ''}
                  onChange={debounce(
                    (event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange('auth', {
                        enabled: settings.auth?.enabled,
                        password: event.target.value || null,
                        username: settings.auth?.username
                      }),
                    750
                  )}
                />
                {((settings.auth?.username && !settings.auth?.password) ||
                  (settings.auth?.password && !settings.auth?.username)) && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500 font-medium">
                    {T('settings.auth_warning')}
                  </p>
                )}
              </fieldset>
            </>
          )}
        </SettingsSections>

        <SettingsSections title="settings.other_settings">
          <Button onClick={clearHistory}>{T('settings.clean_history')}</Button>
        </SettingsSections>

        <SettingsSections title="settings.language" className="!mb-0">
          <LanguageSelector onChange={(locale: Locale) => handleChange('locale', locale)} />
        </SettingsSections>
      </Modal.Body>
    </Modal>
  );
};

const SettingsSections = ({ title, children, className, ...props }: any) => {
  const { T } = useT();

  return (
    <section className={`space-y-4 mb-8 ${className}`} {...props}>
      <h4 className="text-md font-semibold text-gray-900 dark:text-white">{T(title)}</h4>
      {children}
    </section>
  );
};

export default SettingsModal;
