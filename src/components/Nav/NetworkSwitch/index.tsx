import { Events } from '@shared';
import { emit } from '@tauri-apps/api/event';
import { getSettings } from '@utils';
import { useState } from 'react';

const NetworkSwitch = () => {
  const [isChecked, setIsChecked] = useState(getSettings()?.publicShare ?? false);

  const handleCheckboxChange = () => {
    // TODO tauri confirm in case something is being shared
    emit(Events.UpdateSettings, {
      publicShare: !isChecked
    }).then(() => {
      setIsChecked((checked) => {
        return !checked;
      });
    });
  };

  return (
    <>
      <label className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="sr-only"
          />
          <div className="block h-10 w-20 rounded-full bg-primaryHover"></div>
          <div
            className={`bg-primary transition-[left] absolute top-1 flex h-8 w-8 items-center justify-center rounded-full ${isChecked ? 'left-[2.75rem]' : 'left-1'}`}
          >
            <span
              className={`absolute transition-opacity ${isChecked ? 'opacity-0' : 'opacity-100'}`}
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
              className={`absolute transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`}
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
