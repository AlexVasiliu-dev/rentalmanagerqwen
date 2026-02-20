export const i18n = {
  defaultLocale: 'ro',
  locales: ['en', 'ro'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
