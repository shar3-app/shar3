'use client';

import {
  Content,
  Provider,
  Root,
  Trigger,
  type TooltipProps as RadixTooltipProps
} from '@radix-ui/react-tooltip';
import { ComponentPropsWithoutRef, ElementRef, forwardRef, ReactNode } from 'react';

const TooltipProvider = Provider;

const RadixTooltip = Root;

const TooltipTrigger = Trigger;

const TooltipContent = forwardRef<
  ElementRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Content
    ref={ref}
    sideOffset={sideOffset}
    className="z-50 overflow-hidden rounded-md bg-popover px-3 py-2 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
    {...props}
  />
));
TooltipContent.displayName = Content.displayName;

interface TooltipProps extends RadixTooltipProps {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const Tooltip = ({
  children,
  content,
  side = 'bottom',
  align = 'center',
  ...props
}: TooltipProps) => {
  return (
    <RadixTooltip {...props}>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </RadixTooltip>
  );
};

export { Tooltip, TooltipProvider };
