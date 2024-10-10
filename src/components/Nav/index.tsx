import { SettingsIcon } from '@icons';
import { Events } from '@shared';
import { emit } from '@tauri-apps/api/event';
import { toggleScroll } from '@utils';

const Nav = () => {
  const showSettings = () => {
    emit(Events.ShowSettings);
    toggleScroll(false);
  };

  return (
    <nav
      onClick={showSettings}
      tabIndex={1}
      onKeyDown={(event) => {
        if (['Enter', 'Space'].includes(event?.code)) {
          showSettings();
        }
      }}
      className="group fixed flex cursor-pointer justify-center items-center z-50 w-14 h-14 shadow-md bg-primary rounded-full bottom-5 right-6"
    >
      <SettingsIcon className="w-7 h-7 text-white group-hover:text-slate-300 transition-transform group-hover:rotate-[360deg]" />
    </nav>
  );
};

export default Nav;
