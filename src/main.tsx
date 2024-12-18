import { ThemeProvider } from '@components/ThemeProvider';
import { TooltipProvider } from '@components/Tooltip';
import { Locale, Settings } from '@shared';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Talkr } from 'talkr';
import App from './App';
import de from './i18n/de.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import fr from './i18n/fr.json';
import './styles.css';

let locale: Locale = 'en';
try {
  const saved = localStorage.getItem('settings');
  if (saved !== null) {
    const settings: Settings = JSON.parse(saved);
    locale = settings.locale;
  }
} catch {
  locale = 'en';
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={150}>
        <Talkr languages={{ en, es, de, fr }} defaultLanguage={locale || 'en'}>
          <App />
        </Talkr>
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
);

//postMessage({ payload: 'removeLoading' }, '*')
