import { trackEvent } from '@aptabase/tauri';
import { useConnection, useLocalStorage } from '@hooks';
import { ErrorEvent, Events, LoaderState, LocalStorage, SharePayload } from '@shared';
import { invoke } from '@tauri-apps/api/core';
import { emit, listen, TauriEvent } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { open } from '@tauri-apps/plugin-dialog';
import { getSettings, noConnectionError, trackError } from '@utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useT } from 'talkr';
import Dropzone from './Dropzone';
import Shared from './Shared';
const appWindow = getCurrentWebviewWindow();

const Share = () => {
  const [shared, setShared] = useState<string | null>(null);
  const { setValue: setIsSharing } = useLocalStorage(LocalStorage.Sharing, false);
  const isConnected = useConnection();
  const { T } = useT();

  useEffect(() => {
    const listenShare = listen<string>(Events.Share, ({ payload }) => serve(payload));
    const listenClose = listen(TauriEvent.WINDOW_CLOSE_REQUESTED, () => {
      setIsSharing(false);
      stopSharing();
    });
    const listenStop = listen(Events.StopSharing, () => {
      setIsSharing(false);
      stopSharing();
    });
    const listenDrop = getCurrentWebview().onDragDropEvent(async ({ payload }) => {
      if (payload.type === 'over') {
        await appWindow.setFocus();
      } else if (payload.type === 'drop' && !!payload.paths[0]) {
        serve(payload.paths[0]);
      }
    });

    setIsSharing(!!shared);

    return () => {
      listenShare.then((f) => f());
      listenStop.then((f) => f());
      listenDrop.then((f) => f());
      listenClose.then((f) => f());
    };
  }, []);

  const checkConnection = (): boolean => {
    if (!isConnected) {
      noConnectionError(T);
    }

    return isConnected;
  };

  const updateSharedUrl = ({ path, url, success, isDirectory }: SharePayload): void => {
    setLoading(false);

    if (success) {
      setShared(url);
      emit(Events.UpdateHistory, [
        {
          path,
          isDirectory,
          sharedAt: Date.now()
        }
      ]);
    } else {
      toast.error(T('toasts.sharing_error'));
      trackError(ErrorEvent.UpdateUrl, { path, url, success, isDirectory });
    }
  };

  const stopSharing = () => {
    setLoading(true);
    invoke<boolean>('stop')
      .then((status) => {
        if (status) {
          setIsSharing(false);
          setShared(null);
        } else {
          toast.error(T('toasts.sharing_error'));
          trackError(ErrorEvent.StopServe, false);
        }
      })
      .catch((error) => {
        toast.error(T('toasts.sharing_error'));
        trackError(ErrorEvent.StopServe, error);
      })
      .finally(() => setLoading(false));
  };

  const openExplorer = async (isDirectory: boolean) => {
    if (checkConnection()) {
      const selected = (await open({
        multiple: false,
        directory: isDirectory
      })) as string | null;

      serve(selected);
    }
  };

  const serve = (path: string | null) => {
    if (path) {
      const settings = getSettings();
      const hasAuth =
        settings?.auth?.enabled && !!settings?.auth?.username && !!settings?.auth?.password;
      setLoading();
      invoke<SharePayload>('serve', {
        path,
        isPublic: settings?.publicShare,
        username: hasAuth ? settings?.auth?.username : null,
        password: hasAuth ? settings?.auth?.password : null
      })
        .then((payload) => {
          trackEvent('share', {
            path
          });
          setIsSharing(true);
          updateSharedUrl(payload);
        })
        .catch((error) => {
          toast.error(T('toasts.sharing_error'));
          trackError(ErrorEvent.Serve, error);
        })
        .finally(() => setLoading(false));
    } else {
      toast.error(T('toasts.sharing_error'));
    }
  };

  const setLoading = (state = true): void => {
    emit(state ? LoaderState.Loading : LoaderState.StopLoading);
  };

  return !shared ? (
    <div id="share-area" className="flex gap-6">
      <Dropzone T={T} openExplorer={openExplorer} checkConnection={checkConnection} />
      <Dropzone
        T={T}
        isDirectory={false}
        openExplorer={openExplorer}
        checkConnection={checkConnection}
      />
    </div>
  ) : (
    <div
      className={`relative flex items-center justify-center w-full rounded-lg transition-all border-2 border-gray-300 border-dashed dark:border-gray-600 bg-gray-50 dark:bg-gray-800`}
    >
      <Shared shared={shared} onStop={stopSharing} T={T} />
    </div>
  );
};

export default Share;
