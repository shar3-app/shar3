import { Tooltip } from 'flowbite-react';

interface NavItemProps {
  title: string;
  icon: any;
  onClick?: () => void;
  className?: string;
}

const NavItem = ({ title, icon, onClick, className }: NavItemProps) => {
  return (
    <div
      className={`cursor-pointer inline-flex flex-col h-full items-center rounded-l-full rounded-r-full justify-center group ${className ?? ''}`}
      onClick={onClick}
    >
      <Tooltip content={title} arrow={false} className="!-top-10">
        <button type="button" className="p-1 h-full rounded-full">
          {icon}
          <span className="sr-only">{title}</span>
        </button>
      </Tooltip>
    </div>
  );
};

export default NavItem;
