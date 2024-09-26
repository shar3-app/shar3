import LanguageSelector from '@components/Settings/LanguageSelector';
import { Translator } from '@shared';
import { Step } from 'react-joyride';
import Logo from '../../icon.png';

export const steps: (T: Translator) => Step[] = (T) => [
  {
    target: 'body',
    content: (
      <div className="w-72 px-5 py-3">
        <figure className="flex flex-col justify-center items-center gap-1">
          <img src={Logo} width={60} />
          <span className="text-base font-bold">Shar3</span>
        </figure>
        <main className="mt-7 text-center">
          <p>
            {T('joyride.welcome', {
              steps: 3
            })}
          </p>
          <div className="flex flex-col gap-1 items-center mt-5">
            <span className="mb-1">{T('joyride.welcome_language')}</span>
            <LanguageSelector position={'bottom'} onChange={(a) => console.log(a)} />
          </div>
        </main>
      </div>
    ),
    showProgress: true,
    disableBeacon: true,
    disableOverlayClose: true,
    hideCloseButton: true,
    placement: 'center'
  },
  {
    target: '#share-area',
    content: <div className="w-64">{T('joyride.steps.1')}</div>,
    disableBeacon: true,
    disableOverlayClose: true,
    hideCloseButton: true,
    placement: 'bottom'
  },
  {
    target: '#share-scope',
    content: (
      <div className="w-72 flex flex-col gap-2">
        <p className="mb-2">{T('joyride.steps.2')}</p>
        <p dangerouslySetInnerHTML={{ __html: T('joyride.steps.2_1') }} />
        <p dangerouslySetInnerHTML={{ __html: T('joyride.steps.2_2') }} />
      </div>
    ),
    disableBeacon: true,
    disableOverlayClose: true,
    disableScrolling: true,
    hideCloseButton: true,
    placement: 'top'
  },
  {
    target: '#share-history',
    content: <div className="w-64">{T('joyride.steps.3')}</div>,
    disableBeacon: true,
    disableOverlayClose: true,
    disableScrolling: true,
    hideCloseButton: true,
    placement: 'top'
  }
];
