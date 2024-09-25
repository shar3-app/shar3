import { Events, History } from '@shared';
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
  ShareArea,
  ShareScope,
  ShareHistory
}

const Joyride = () => {
  const { T } = useT();

  const handleJoyride = ({ action, index }: CallBackProps) => {
    console.log(action, index);

    if (action === JoyrideActions.START && index === JoyrideSteps.ShareArea) {
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
    }
  };

  return (
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
  );
};

export default Joyride;
