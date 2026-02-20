import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {inter} from '@/app/fonts';
import '../globals.css';
import Providers from '@/components/Providers';

export function generateStaticParams() {
  return [
    {locale: 'en'},
    {locale: 'ro'}
  ];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
