import { useLocalStorage } from "@hooks";
import {
  History,
  LoaderState,
  Settings,
  SharePayload,
  Translator,
} from "@shared";
import { open } from "@tauri-apps/api/dialog";
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { noConnectionError } from "@utils";
import { Dispatch, SetStateAction, useState } from "react";
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
    null,
  );

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
        }
      })
      // TODO catch and stop loader
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
      invoke<SharePayload>("serve", { path, window: appWindow })
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

  // TODO check not working
  const onDrop = (files: FileList | null) => {
    if (files?.length) {
      setLoading();
      //serve(files[0].path);
    } else {
      setLoading(false);
      // TODO path upload error
    }
  };

  return !shared ? (
    <div className="flex gap-6">
      <Dropzone
        T={T}
        getSettings={getSettings}
        openExplorer={openExplorer}
        checkConnection={checkConnection}
        onDrop={onDrop}
      />
      <Dropzone
        T={T}
        isDirectory={false}
        getSettings={getSettings}
        openExplorer={openExplorer}
        checkConnection={checkConnection}
        onDrop={onDrop}
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
