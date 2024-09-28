import { ComponentProps } from 'react';

const TextInput = ({ className, ...props }: ComponentProps<'input'>) => {
  return (
    <input
      className={`${className} bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
      {...props}
    />
  );
};

export default TextInput;
