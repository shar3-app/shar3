type TParams = {
  count?: number;
  [key: string]: any;
};

export type Translator = (key: string, params?: TParams) => string;

export const Locales = ['en', 'es', 'de', 'fr'] as const;
export type Locale = (typeof Locales)[number];
