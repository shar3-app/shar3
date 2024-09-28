import { useLocalStorage } from '@hooks';
import { Events, LocalStorage } from '@shared';
import { emit } from '@tauri-apps/api/event';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Dispatch, SetStateAction } from 'react';
import { useT } from 'talkr';

interface NetworkSwitchProps {
  isPublicShare: boolean;
  setIsPublicShare: Dispatch<SetStateAction<boolean>>;
}

const NetworkSwitch = ({ isPublicShare, setIsPublicShare }: NetworkSwitchProps) => {
  const { T } = useT();
  const { getValue: isSharing } = useLocalStorage(LocalStorage.Sharing, false);

  const handleCheckboxChange = () => {
    if (isSharing()) {
      confirm(T('nav.share_warning_message'), {
        title: T('nav.share_warning_title'),
        okLabel: T('nav.share_warning_ok'),
        cancelLabel: T('nav.share_warning_cancel'),
        kind: 'warning'
      }).then((value) => {
        if (value) {
          emit(Events.StopSharing);
          updateCheckbox();
        }
      });
    } else {
      updateCheckbox();
    }
  };

  const updateCheckbox = () => {
    setIsPublicShare((isPublic) => {
      emit(Events.UpdateSettings, {
        publicShare: !isPublic
      });
      return !isPublic;
    });
  };

  return (
    <>
      <label id="share-scope" className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="checkbox"
            checked={isPublicShare}
            onChange={handleCheckboxChange}
            className="sr-only"
          />
          <div className="block h-10 w-20 rounded-full bg-primaryHover"></div>
          <div
            className={`bg-primary transition-[left] absolute top-1 flex h-8 w-8 items-center justify-center rounded-full ${isPublicShare ? 'left-[2.75rem]' : 'left-1'}`}
          >
            <span
              className={`absolute transition-opacity ${isPublicShare ? 'opacity-0' : 'opacity-100'}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18.364 19.364a9 9 0 0 0 -9.721 -14.717m-2.488 1.509a9 9 0 0 0 -.519 13.208" />
                <path d="M15.536 16.536a5 5 0 0 0 -3.536 -8.536m-3 1a5 5 0 0 0 -.535 7.536" />
                <path d="M12 12a1 1 0 1 0 1 1" />
                <path d="M3 3l18 18" />
              </svg>
            </span>
            <span
              className={`absolute transition-opacity ${isPublicShare ? 'opacity-100' : 'opacity-0'}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18.364 19.364a9 9 0 1 0 -12.728 0" />
                <path d="M15.536 16.536a5 5 0 1 0 -7.072 0" />
                <path d="M12 13m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              </svg>
            </span>
          </div>
        </div>
      </label>
    </>
  );
};

export default NetworkSwitch;
