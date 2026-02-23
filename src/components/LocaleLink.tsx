"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LinkProps } from "next/link"
import type { ComponentProps } from "react"

interface LocaleLinkProps extends Omit<LinkProps, 'href'>, Omit<ComponentProps<'a'>, 'href' | 'onClick'> {
  href: string
}

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const pathname = usePathname()
  
  // Extract locale from current path (e.g., /en/dashboard -> en)
  const locale = pathname?.split('/')[1] || 'en'
  
  // Add locale prefix if href starts with / but doesn't already have locale
  const localeHref = href.startsWith('/') && !href.startsWith(`/${locale}`)
    ? `/${locale}${href}`
    : href

  return <Link href={localeHref} {...props} />
}
