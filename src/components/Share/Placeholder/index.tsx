import Kbd from '@components/Kbd';
import { FileIcon, FolderIcon } from '@icons';
import { Events, Settings, Translator } from '@shared';
import { listen } from '@tauri-apps/api/event';
import { type } from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';

interface DropdownPlaceholderProps {
  getSettings: () => Settings | null;
  T: Translator;
  isDirectory: boolean;
}

const DropdownPlaceholder = ({ getSettings, T, isDirectory }: DropdownPlaceholderProps) => {
  const [showShortcuts, setShowSettings] = useState(getSettings()?.shortcuts ?? true);

  useEffect(() => {
    const listenSettings = listen<Settings>(Events.SettingsUpdated, ({ payload }) =>
      setShowSettings(payload.shortcuts)
    );

    return () => {
      listenSettings.then((f) => f());
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {isDirectory ? (
        <FolderIcon className="text-gray-400 w-12 h-12" strokeWidth={1.5} />
      ) : (
        <FileIcon className="text-gray-400 w-12 h-12" strokeWidth={1.5} />
      )}
      <p className="mt-4 text-sm sm:text-base text-center text-gray-500 dark:text-gray-400">
        <span className="font-semibold block">{T('generic.click_select')}</span>
        {T(isDirectory ? 'generic.or_drag.directory' : 'generic.or_drag.file')}
      </p>
      {showShortcuts !== false ? (
        <p className="text-center mt-3">
          <span className="text-gray-500 dark:text-gray-400">
            {type() === 'macos' ? (
              <>
                <Kbd>Cmd</Kbd> + <Kbd>{isDirectory ? 'D' : 'F'}</Kbd>
              </>
            ) : (
              <>
                <Kbd>Ctrl</Kbd> + <Kbd>{isDirectory ? 'D' : 'F'}</Kbd>
              </>
            )}
          </span>
        </p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default DropdownPlaceholder;
