import { useConnection, useLocalStorage } from '@hooks';
import { Events, LoaderState, LocalStorage, SharePayload } from '@shared';
import { invoke } from '@tauri-apps/api/core';
import { emit, listen, TauriEvent } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { open } from '@tauri-apps/plugin-dialog';
import { getSettings, noConnectionError } from '@utils';
import { useEffect, useState } from 'react';
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
      // TODO error control
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
          // TODO error
          alert('error');
        }
      })
      .catch(() => {
        alert('error');
        // TODO catch and stop loader
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
      setLoading();
      invoke<SharePayload>('serve', {
        path,
        isPublic: getSettings()?.publicShare
      })
        .then((payload) => {
          setIsSharing(true);
          updateSharedUrl(payload);
        })
        // TODO add catch
        .finally(() => setLoading(false));
    } else {
      // TODOerror
    }
  };

  /* TODO check old usage

  const onShare = (_, path: any) => {
    if (!path.canceled && path.filePaths?.length && checkConnection()) {
      setLoading(true);
      onUpload(path.filePaths[0]);
    }
    };*/

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
