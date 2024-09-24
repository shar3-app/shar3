import { BugIcon, SettingsIcon } from '@icons';
import { Events } from '@shared';
import { emit } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/shell';
import { toggleScroll } from '@utils';
import { useT } from 'talkr';
import NavItem from './NavItem';
import NetworkSwitch from './NetworkSwitch';

const Nav = () => {
  const { T } = useT();
  const showSettings = () => {
    emit(Events.ShowSettings);
    toggleScroll(false);
  };

  return (
    <div className="fixed z-50 w-56 max-w-[90%] h-16 shadow-md -translate-x-1/2 bg-primary rounded-full bottom-6 left-[50vw]">
      <div className="flex justify-around items-center h-full w-full px-3">
        <NavItem
          key={'nav-bug'}
          title={T('nav.report_bug')}
          onClick={() => open('https://github.com/shar3-app/shar3/issues/new')}
        >
          <BugIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
        </NavItem>

        <NavItem key={'nav-share'} title={T('nav.share')}>
          <NetworkSwitch />
        </NavItem>

        <NavItem key={'nav-settings'} title={T('nav.settings')} onClick={showSettings}>
          <SettingsIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
        </NavItem>
      </div>
    </div>
  );
};

export default Nav;
