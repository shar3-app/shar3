import { StopIcon } from '@icons';
import { Translator } from '@shared';

interface StopShareProps {
  onStop: () => void;
  T: Translator;
}

const StopShare = ({ onStop, T }: StopShareProps) => {
  return (
    <span className="group absolute flex h-6 w-6 hover:w-auto hover:h-auto top-3.5 right-3 justify-end transition-all text-white items-center font-semibold text-xs sm:text-sm">
      <span className="pointer-events-none group-hover:hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
      <span
        onClick={onStop}
        className="relative inline-flex h-6 rounded-full w-full group-hover:px-1.5 bg-red-500 transition-all items-center justify-center cursor-pointer"
      >
        <StopIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:w-4 group-hover:h-4 group-hover:mr-1 fill-white" />
        <p className="hidden group-hover:block uppercase mr-1">{T('generic.stop_share')}</p>
      </span>
    </span>
  );
};

export default StopShare;
