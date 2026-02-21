'use client';

import {useLocale} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {routing} from '@/i18n-routing';
import {Globe} from 'lucide-react';

const localeNames: Record<string, string> = {
  en: 'English',
  ro: 'Română'
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(newLocale: string) {
    startTransition(() => {
      // Get current path without locale
      const currentPath = window.location.pathname;
      // Remove old locale prefix
      const pathWithoutLocale = currentPath.replace(/^\/(en|ro)/, '');
      // Navigate with new locale
      router.push(`/${newLocale}${pathWithoutLocale}`);
    });
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <select
          value={locale}
          onChange={(e) => onSelectChange(e.target.value)}
          disabled={isPending}
          className="bg-transparent text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
        >
          {routing.locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeNames[loc]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
