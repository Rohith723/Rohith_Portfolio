import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'family-tracker:unlocked';

/**
 * IMPORTANT — read this before relying on it:
 * This is a client-side-only gate. The passcode hash lives in the compiled
 * JS bundle, so anyone determined enough (view-source, dev tools, brute
 * force) can eventually get past it. It's meant to stop casual snooping
 * and search-engine/URL-guessing exposure — NOT to be real access control.
 * For genuine security, put this behind a real backend with server-side
 * auth (e.g. ASP.NET Core Identity + a proper login endpoint) instead.
 *
 * To set your own passcode: pick a passphrase, then run in any browser console:
 *   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-passphrase'))
 *     .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
 * and paste the resulting hex string into PASSCODE_HASH below.
 */
const PASSCODE_HASH =
  'e2454a136b7d0fd5c01014a2171caaf2ca1421ad079a65633c2cf76dec4e27cf'; // sha256("password") — CHANGE THIS

@Injectable({ providedIn: 'root' })
export class OwnerAuth {
  readonly unlocked = signal(sessionStorage.getItem(SESSION_KEY) === 'true');

  async tryUnlock(passcode: string): Promise<boolean> {
    const hash = await this.sha256(passcode);
    const ok = hash === PASSCODE_HASH;
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      this.unlocked.set(true);
    }
    return ok;
  }

  lock() {
    sessionStorage.removeItem(SESSION_KEY);
    this.unlocked.set(false);
  }

  private async sha256(text: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}