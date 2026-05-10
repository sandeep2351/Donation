'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';

/** Next Link with hydration tolerance when browser extensions mutate `<a>` (e.g. `rtrvr-*` attrs). */
export default function StableLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} suppressHydrationWarning />;
}
