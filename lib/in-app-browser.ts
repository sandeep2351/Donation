/**
 * In-app browsers (WhatsApp, Instagram, Facebook, etc.) often route `upi://` incorrectly
 * (e.g. opening WhatsApp). UPI Pay should be used from Chrome, Safari, or Samsung Internet.
 */
export function isEmbeddedBrowserLikelyBreakingUpi(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /WhatsApp|FBAV|FBAN|Instagram|Line\/|TikTok|Snapchat/i.test(ua);
}

/**
 * Laptops / desktop browsers (macOS, Windows, Linux) have no real UPI stack. Clicking `upi://`
 * may open the wrong app (e.g. WhatsApp if it registered the scheme) or do nothing useful.
 * UPI Pay + QR scan are meant for phones (Android / iPhone).
 */
export function isLikelyDesktopWithoutNativeUpi(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return false;
  if (/iPhone|iPad|iPod/i.test(ua)) return false;
  // Desktop-class OS (MacBook, PC, Linux desktop)
  if (/Macintosh|Mac OS X|Windows NT|Win64|X11|Linux x86|CrOS/i.test(ua)) return true;
  return false;
}
