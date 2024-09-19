import { BugIcon, DonateIcon, SettingsIcon } from "@icons";
import { Translator } from "@shared";
import { open } from "@tauri-apps/api/shell";
import NavItem from "./NavItem";

interface NavProps {
  toggleSettings: (state: boolean) => void;
  T: Translator;
  isConnected: boolean;
}

const Nav = ({ toggleSettings, T }: NavProps) => {
  return (
    <div className="fixed z-50 w-56 max-w-[90%] h-16 shadow-md -translate-x-1/2 bg-primary rounded-full bottom-6 left-[50vw]">
      <div className="flex justify-around items-center h-full w-full px-2">
        <NavItem
          key={"nav-bug"}
          title={T("nav.report_bug")}
          icon={
            <BugIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
          }
          onClick={() => open("https://github.com/shar3-app/shar3/issues/new")}
        />

        <NavItem
          key={"nav-support"}
          title={T("nav.support")}
          icon={
            <DonateIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
          }
          onClick={() => open("https://buymeacoffee.com/davru")}
        />

        <NavItem
          key={"nav-settings"}
          title={T("nav.settings")}
          icon={
            <SettingsIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
          }
          onClick={() => toggleSettings(true)}
        />
      </div>
    </div>
  );
};

export default Nav;
