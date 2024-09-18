import useHotkeys from "@reecelucas/react-use-hotkeys";
import { LoaderState, Settings, Translator } from "@shared";
import { emit } from "@tauri-apps/api/event";
import DropdownPlaceholder from "../Placeholder";

interface DropzoneProps {
  T: Translator;
  getSettings: () => Settings | null;
  isDirectory?: boolean;
  openExplorer: (isDirectory: boolean) => Promise<void>;
  checkConnection: () => boolean;
  onDrop: (files: FileList | null) => void;
}

const Dropzone = ({
  T,
  isDirectory = true,
  getSettings,
  openExplorer,
  checkConnection,
  onDrop,
}: DropzoneProps) => {
  useHotkeys(
    isDirectory ? ["Control+d", "Meta+d"] : ["Control+f", "Meta+f"],
    () => {
      if (getSettings()?.shortcuts !== false) {
        openExplorer(isDirectory);
      }
    },
  );

  const onActivateInput = (event: any): void => {
    event?.preventDefault();
    openExplorer(isDirectory);
  };

  return (
    <div
      className={`relative flex items-center justify-center w-full rounded-lg transition-all h-[35vh] border-2 border-gray-300 border-dashed dark:border-gray-600 dark:hover:border-gray-500 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700`}
    >
      <label
        tabIndex={1}
        onKeyDown={(event) => {
          if (["Enter", "Space"].includes(event?.code))
            openExplorer(isDirectory);
        }}
        htmlFor="dropzone-file"
        className="relative flex flex-col items-center px-4 justify-center w-full h-full cursor-pointer"
      >
        <DropdownPlaceholder
          getSettings={getSettings}
          T={T}
          isDirectory={isDirectory}
        />
        <input
          id="dropzone-file"
          tabIndex={-1}
          type="file"
          title={""}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-0"
          onChange={(event) => onDrop((event?.target as any)?.files)}
          onClick={onActivateInput}
          onDrop={(event) => {
            if (checkConnection()) {
              emit(LoaderState.Loading);
            } else {
              event?.preventDefault();
            }
          }}
        />
      </label>
    </div>
  );
};

export default Dropzone;
