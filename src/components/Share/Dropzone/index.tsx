import useHotkeys from "@reecelucas/react-use-hotkeys";
import { Translator } from "@shared";
import { getSettings } from "@utils";
import DropdownPlaceholder from "../Placeholder";

interface DropzoneProps {
	T: Translator;
	isDirectory?: boolean;
	openExplorer: (isDirectory: boolean) => Promise<void>;
	checkConnection: () => boolean;
}

const Dropzone = ({
	T,
	isDirectory = true,
	openExplorer,
	checkConnection,
}: DropzoneProps) => {
	useHotkeys(
		isDirectory ? ["Control+d", "Meta+d"] : ["Control+f", "Meta+f"],
		() => {
			if (getSettings()?.shortcuts !== false) {
				openExplorer(isDirectory);
			}
		},
	);

	const onActivateInput = (
		event:
			| React.MouseEvent<HTMLInputElement, MouseEvent>
			| React.KeyboardEvent<HTMLLabelElement>,
	): void => {
		if (checkConnection()) {
			event?.preventDefault();
			openExplorer(isDirectory);
		}
	};

	return (
		<div
			className={`relative flex items-center justify-center w-full rounded-lg transition-all h-[35vh] border-2 border-gray-300 border-dashed dark:border-gray-600 dark:hover:border-gray-500 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700`}
		>
			<label
				tabIndex={1}
				onKeyDown={(event) => {
					if (["Enter", "Space"].includes(event?.code)) {
						onActivateInput(event);
					}
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
					onClick={onActivateInput}
				/>
			</label>
		</div>
	);
};

export default Dropzone;
