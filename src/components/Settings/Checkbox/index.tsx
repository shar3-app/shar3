import { ChangeEventHandler, useId } from 'react';

interface SettingsCheckboxProps {
  label?: string;
  isChecked: boolean | null | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const SettingsCheckbox = ({ label, isChecked, onChange }: SettingsCheckboxProps) => {
  const id = useId();

  return (
    <>
      <label key={id} className="relative flex items-center cursor-pointer">
        <input type="checkbox" checked={!!isChecked} className="sr-only peer" onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-2 peer-focus:outline-dashed peer-focus:outline-gray-900 dark:peer-focus:outline-white dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        {label ? (
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>
        ) : (
          <></>
        )}
      </label>
    </>
  );
};

export default SettingsCheckbox;
