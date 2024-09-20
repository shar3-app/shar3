import { OsType, type } from "@tauri-apps/api/os";
import { useEffect, useState } from "react";

const useOsType = (): OsType | null => {
	const [osType, setOsType] = useState<OsType | null>(null);

	useEffect(() => {
		type().then(setOsType);
	}, []);

	return osType;
};

export default useOsType;
