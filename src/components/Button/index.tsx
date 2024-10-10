import { ComponentProps } from 'react';

const Button = ({ className, children, ...props }: ComponentProps<'button'>) => {
  return (
    <button
      type="button"
      className={`w-fit text-white bg-primary hover:bg-primaryHover font-medium rounded-md px-3.5 py-2 text-center inline-flex items-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
