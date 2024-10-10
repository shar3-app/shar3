import { Tooltip } from 'flowbite-react';
import { ComponentProps } from 'react';

const NavItem = ({ title, children, onClick, className, ...props }: ComponentProps<'div'>) => {
  return (
    <div
      className={`cursor-pointer inline-flex flex-col h-full items-center rounded-l-full rounded-r-full justify-center group ${className ?? ''}`}
      onClick={onClick}
      {...props}
    >
      {title ? (
        <Tooltip content={title} arrow={false} className="!-top-10" placement="right">
          <button type="button" className="p-1 h-full rounded-full">
            {children}
            <span className="sr-only">{title}</span>
          </button>
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
};

export default NavItem;
