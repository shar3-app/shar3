import Button from '@components/Button';
import { Locale, Locales } from '@shared';
import { useState } from 'react';
import { useT } from 'talkr';

interface LanguageSelectorProps {
  position?: 'top' | 'bottom';
  onChange: (locale: Locale) => void;
}

const LanguageSelector = ({ position = 'top', onChange }: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { T, setLocale, locale } = useT();

  const closeSelector = () => {
    setOpen(false);
    setTimeout(() => document.removeEventListener('click', closeSelector));
  };

  const openSelector = () => {
    if (open) return;
    setOpen(true);
    setTimeout(() => document.addEventListener('click', closeSelector));
  };

  const selectLocale = (lang: string) => {
    setLocale(lang);
    onChange(lang as Locale);
    setOpen(false);
  };

  return (
    <div className="flex relative w-fit">
      <Button onClick={openSelector}>{T(`locales.${locale}`)}</Button>
      <div
        className={`${open ? null : 'hidden'} ${position === 'top' ? 'bottom-12' : 'top-12'} absolute font-medium shadow-2xl z-50 left-1/2 [transform:translateX(-50%);] text-base list-none bg-white divide-y divide-gray-100 rounded-lg dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600`}
      >
        <ul role="none">
          {Object.keys(Locales).map((_, idx) => {
            const lang = Locales[idx];

            return (
              <li key={lang}>
                <span
                  tabIndex={locale === lang ? -1 : 1}
                  onClick={() => selectLocale(lang as Locale)}
                  onKeyDown={(event) => {
                    if (['Enter', 'Space'].includes(event?.code)) selectLocale(lang as Locale);
                  }}
                  className={`${locale === lang ? 'hidden' : ''} text-left cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white`}
                  role="menuitem"
                >
                  <div className="inline-flex items-center">{T(`locales.${lang}`)}</div>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LanguageSelector;
