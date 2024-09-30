import { open } from '@tauri-apps/plugin-shell';
import { ComponentProps } from 'react';

const Link = ({ children, href, className, ...props }: ComponentProps<'a'>) => {
  const onHref = () => open(href ?? '#');

  return (
    <a
      tabIndex={1}
      {...props}
      role="button"
      className={`cursor-pointer ${className}`}
      onClick={onHref}
    >
      {children}
    </a>
  );
};

export default Link;
