import { ComponentProps } from 'react';

interface HistoryRowProps extends ComponentProps<'li'> {
  position: 'even' | 'odd';
}

const HistoryRow = ({ position, children, className, ...props }: HistoryRowProps) => {
  return (
    <li
      tabIndex={1}
      className={`flex py-[1.15rem] border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:cursor-pointer last:rounded-b-md first:rounded-t-md ${
        position === 'even' ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'
      } ${className}`}
      {...props}
    >
      {children}
    </li>
  );
};

export default HistoryRow;
