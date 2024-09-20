import Kbd from "@components/Kbd";
import { useOsType } from "@hooks";
import { FileIcon, FolderIcon } from "@icons";
import { Settings, Translator } from "@shared";

interface DropdownPlaceholderProps {
	getSettings: () => Settings | null;
	T: Translator;
	isDirectory: boolean;
}

const DropdownPlaceholder = ({
	getSettings,
	T,
	isDirectory,
}: DropdownPlaceholderProps) => {
	const osType = useOsType();

	return (
		<div className="flex flex-col items-center justify-center">
			{isDirectory ? (
				<FolderIcon className="text-gray-400 w-12 h-12" strokeWidth={1.5} />
			) : (
				<FileIcon className="text-gray-400 w-12 h-12" strokeWidth={1.5} />
			)}
			<p className="mt-6 text-sm sm:text-base text-center text-gray-500 dark:text-gray-400">
				<span className="font-semibold block">{T("generic.click_select")}</span>
				{T(isDirectory ? "generic.or_drag.directory" : "generic.or_drag.file")}
			</p>
			{getSettings()?.shortcuts !== false ? (
				<p className="text-center mt-4">
					<span className="text-gray-500 dark:text-gray-400">
						{osType === "Darwin" ? (
							<>
								<Kbd>Cmd</Kbd> + <Kbd>{isDirectory ? "D" : "F"}</Kbd>
							</>
						) : (
							<>
								<Kbd>Ctrl</Kbd> + <Kbd>{isDirectory ? "D" : "F"}</Kbd>
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
