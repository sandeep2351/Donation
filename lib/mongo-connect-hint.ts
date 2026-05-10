/**
 * Map MongoDB driver / DNS errors to a safe API response (no secrets).
 * `querySrv EREFUSED` = resolver blocked SRV lookup for `mongodb+srv://` URIs.
 */
export function mongoConnectErrorResponse(error: unknown): {
  status: number;
  body: { error: string; hint?: string };
} | null {
  const msg = error instanceof Error ? error.message : String(error);
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const syscall =
    error && typeof error === 'object' && 'syscall' in error
      ? String((error as { syscall?: string }).syscall)
      : '';

  const isSrvDns =
    syscall === 'querySrv' ||
    msg.includes('querySrv') ||
    msg.includes('_mongodb._tcp');

  if (isSrvDns) {
    return {
      status: 503,
      body: {
        error: 'Database unreachable: DNS refused the MongoDB SRV lookup.',
        hint:
          'Your network or DNS (VPN, Pi-hole, corporate Wi‑Fi, or ISP) blocked resolving mongodb+srv. Fixes: try another network or disable filtering; in MongoDB Atlas → Connect → Drivers choose the standard mongodb:// connection string (lists host:27017 nodes, no SRV); ensure the Atlas cluster is not paused and your IP is allowed in Network Access.',
      },
    };
  }

  if (code === 'ENOTFOUND' || msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
    return {
      status: 503,
      body: {
        error: 'Database unreachable: could not resolve MongoDB hostname.',
        hint: 'Check MONGODB_URI, internet connection, and Atlas cluster hostname. Try ping or nslookup from the same machine running Next.js.',
      },
    };
  }

  if (
    code === 'ECONNREFUSED' ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connection refused')
  ) {
    return {
      status: 503,
      body: {
        error: 'Database unreachable: connection refused.',
        hint: 'Atlas may be blocking your IP (Network Access → IP allowlist). For local dev add 0.0.0.0/0 temporarily or your current IP.',
      },
    };
  }

  return null;
}
