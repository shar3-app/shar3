import { useLocalStorage } from '@hooks';
import { Events, History, LocalStorage } from '@shared';
import { emit } from '@tauri-apps/api/event';
import {
  ACTIONS as JoyrideActions,
  default as JoyrideComponent,
  type CallBackProps
} from 'react-joyride';
import { useT } from 'talkr';
import JoyrideTooltip from './JoyrideTooltip';
import { steps } from './steps';

enum JoyrideSteps {
  Welcome,
  ShareArea,
  ShareScope,
  ShareHistory
}

const Joyride = () => {
  const { value: joyrideState, setValue: setJoyrideState } = useLocalStorage(
    LocalStorage.Joyride,
    false
  );
  const { T } = useT();

  const handleJoyride = ({ action, index }: CallBackProps) => {
    if (action === JoyrideActions.START && index === JoyrideSteps.Welcome) {
      const currentDate = new Date();
      const dummyHistory: History = [
        {
          path: '/Users/shar3/some/dummy/folder',
          isDirectory: true,
          sharedAt: currentDate.setHours(currentDate.getHours() - 8)
        },
        {
          path: '/Users/shar3/some/dummy/folder/file.txt',
          isDirectory: false,
          sharedAt: currentDate.setHours(currentDate.getHours() - 25)
        }
      ];
      emit(Events.SetHistory, dummyHistory);
    } else if (action === JoyrideActions.RESET) {
      emit(Events.SetHistory, []);
      setJoyrideState(true);
    }
  };

  return (
    !joyrideState && (
      <JoyrideComponent
        continuous
        scrollToFirstStep
        run={true}
        steps={steps(T)}
        callback={handleJoyride}
        tooltipComponent={JoyrideTooltip}
        floaterProps={{
          hideArrow: true
        }}
      />
    )
  );
};

export default Joyride;
