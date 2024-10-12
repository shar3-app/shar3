import { Locale, Theme } from '../types';

export interface Settings {
  locale: Locale;
  //publicShare: boolean;
  theme: Theme;
  auth: {
    enabled: boolean;
    username: string;
    password: string;
  } | null;
  shortcuts: boolean;
}
