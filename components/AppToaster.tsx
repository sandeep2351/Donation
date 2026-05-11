'use client';

import { Toaster } from '@/components/ui/toaster';

/** Global Radix toasts — mounted once in root layout (admin, site, donate, contact). */
export function AppToaster() {
  return <Toaster />;
}
