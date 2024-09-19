import { useLocalStorage } from "@hooks";
import {
  Events,
  History,
  LoaderState,
  Settings,
  SharePayload,
  Translator,
} from "@shared";
import { open } from "@tauri-apps/api/dialog";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { noConnectionError } from "@utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Dropzone from "./Dropzone";
import Shared from "./Shared";

interface ShareProps {
  setHistory: Dispatch<SetStateAction<History>>;
  isConnected: boolean;
  T: Translator;
}

const Share = ({ setHistory, isConnected, T }: ShareProps) => {
  const [shared, setShared] = useState<string | null>(null);
  const { getValue: getSettings } = useLocalStorage<Settings | null>(
    "settings",
  );

  useEffect(() => {
    const listenShare = listen<string>(Events.Share, ({ payload }) =>
      serve(payload),
    );
    const listenDrop = listen<string>(
      "tauri://file-drop",
      ({ payload: [path] }) => appWindow.setFocus().then(() => serve(path)),
    );

    return () => {
      listenShare.then((f) => f());
      listenDrop.then((f) => f());
    };
  }, []);

  const checkConnection = (): boolean => {
    if (!isConnected) {
      noConnectionError(T);
    }

    return isConnected;
  };

  const updateSharedUrl = ({
    path,
    url,
    success,
    isDirectory,
  }: SharePayload): void => {
    setLoading(false);

    if (success) {
      setShared(url);
      setHistory((currHistory) => [
        {
          path,
          isDirectory,
          sharedAt: Date.now(),
        },
        ...currHistory.filter((hi) => hi.path !== path),
      ]);
    } else {
      // TODO error control
    }
  };

  const stopSharing = () => {
    setLoading(true);
    invoke<boolean>("stop")
      .then((status) => {
        if (status) {
          setShared(null);
        } else {
          // TODO error
          alert("error");
        }
      })
      .catch(() => {
        alert("error");
        // TODO catch and stop loader
      })
      .finally(() => setLoading(false));
  };

  const openExplorer = async (isDirectory: boolean) => {
    if (checkConnection()) {
      const selected = (await open({
        multiple: false,
        directory: isDirectory,
      })) as string | null;

      serve(selected);
    }
  };

  const serve = (path: string | null) => {
    if (path) {
      setLoading();
      invoke<SharePayload>("serve", {
        path,
        isPublic: getSettings()?.publicShare,
      })
        .then((payload) => {
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
    <div className="flex gap-6">
      <Dropzone
        T={T}
        openExplorer={openExplorer}
        checkConnection={checkConnection}
      />
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
