import Button from '@components/Button';
import { TooltipRenderProps } from 'react-joyride';
import { useT } from 'talkr';

const JoyrideTooltip = ({
  backProps,
  index,
  isLastStep,
  primaryProps,
  step,
  tooltipProps
}: TooltipRenderProps) => {
  const { T } = useT();

  return (
    <div
      className="bg-gray-900 border-2 border-gray-700 text-white text-sm rounded-lg"
      {...tooltipProps}
    >
      <header>{step.title && <h3>{step.title}</h3>}</header>
      <main className="py-4 px-5">{step.content && <div>{step.content}</div>}</main>
      <footer className="flex justify-end gap-2 bg-gray-700 p-1.5">
        {index > 0 && (
          <Button
            className="p-0 bg-transparent hover:bg-transparent hover:text-primary text-white"
            {...backProps}
          >
            {T('joyride.back')}
          </Button>
        )}
        <Button
          className={`py-0.5 px-2 !outline-0 ${index === 0 ? 'w-full justify-center' : ''}`}
          {...primaryProps}
        >
          {!isLastStep ? T(index === 0 ? 'joyride.start' : 'joyride.next') : T('joyride.finish')}
        </Button>
      </footer>
    </div>
  );
};

export default JoyrideTooltip;
