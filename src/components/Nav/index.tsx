import { BugIcon, SettingsIcon } from '@icons';
import { Events } from '@shared';
import { emit } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-shell';
import { toggleScroll } from '@utils';
import { useT } from 'talkr';
import NavItem from './NavItem';

const mailto = `mailto:contact@shar3.app?subject=%5BShar3%5D%20Issue%20Report&body=Hi%20Shar3%20Support%20Team%2C%0A%0AI%E2%80%99m%20experiencing%20an%20issue%20with%20the%20app%2C%20and%20I%E2%80%99d%20like%20to%20provide%20some%20details%20to%20help%20you%20resolve%20it.%20Here%E2%80%99s%20the%20information%3A%0A%0A-%20Issue%20description%3A%20(Please%20describe%20the%20issue%20you're%20encountering%20in%20as%20much%20detail%20as%20possible.)%0A-%20Steps%20to%20reproduce%3A%20(What%20actions%20did%20you%20take%20leading%20up%20to%20the%20issue%3F)%0A-%20Device%20Information%3A%0A%20%20-%20Device%2FOS%3A%20(e.g.%2C%20Windows%2011%2C%20macOS%20Ventura)%0A%20%20-%20App%20version%3A%20(e.g.%2C%201.2.3)%0A%20%20-%20App%20sharing%20scope%3A%20(private%20or%20public)%0A%20%20-%20Network%20type%3A%20(e.g.%2C%20Wi-Fi%2C%20Ethernet)%0A%20%20%0AAdditional%20comments%20or%20screenshots%3A%0A(If%20applicable%2C%20please%20attach%20any%20relevant%20screenshots%20or%20files%20to%20help%20us%20understand%20the%20issue%20better.)%0A%0AThank%20you!%0A%0ABest%20regards%2C%20%20%0A%5BYour%20Name%5D`;

const Nav = () => {
  const { T } = useT();

  const showSettings = () => {
    emit(Events.ShowSettings);
    toggleScroll(false);
  };

  return (
    <div className="fixed z-50 w-56 max-w-[90%] h-16 shadow-md -translate-x-1/2 bg-primary rounded-full bottom-6 left-[50vw]">
      <div className="flex justify-around items-center h-full w-full px-3">
        <NavItem key={'nav-bug'} title={T('nav.report_bug')} onClick={() => open(mailto)}>
          <BugIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
        </NavItem>

        {/*<NavItem
          key={'nav-share'}
          title={isPublicShare ? T('nav.share_public') : T('nav.share_private')}
        >
          <NetworkSwitch isPublicShare={isPublicShare} setIsPublicShare={setIsPublicShare} />
        </NavItem>*/}

        <NavItem key={'nav-settings'} title={T('nav.settings')} onClick={showSettings}>
          <SettingsIcon className="w-7 h-7 text-white group-hover:text-slate-300" />
        </NavItem>
      </div>
    </div>
  );
};

export default Nav;
