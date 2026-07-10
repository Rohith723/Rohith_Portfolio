import { Injectable, signal } from '@angular/core';

export interface FamilyMember {
  id: string;
  name: string;
  consented: boolean;
  sharing: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  updatedAt?: string;
}

const STORAGE_KEY = 'family-tracker:members';

/**
 * Demo-grade location store.
 *
 * IMPORTANT: this persists to the browser's localStorage, so it only works
 * when the owner and the family member use the SAME browser/device (handy
 * for demoing the consent flow end-to-end). For real multi-device tracking
 * you'd swap this for HTTP calls to a backend (a natural fit for ASP.NET
 * Core Web API + SignalR, given the rest of the stack) that stores each
 * member's last known position and pushes live updates to the owner.
 */
@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly members = signal<FamilyMember[]>(this.load());
  private watchIds = new Map<string, number>();

  private load(): FamilyMember[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(members: FamilyMember[]) {
    this.members.set(members);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }

  /** Owner: invite a new family member. Returns the shareable join id. */
  addMember(name: string): string {
    const id = crypto.randomUUID();
    const member: FamilyMember = { id, name, consented: false, sharing: false };
    this.persist([...this.members(), member]);
    return id;
  }

  getMember(id: string): FamilyMember | undefined {
    return this.members().find((m) => m.id === id);
  }

  /** Owner: revoke a member's access and stop any active tracking for them. */
  removeMember(id: string) {
    this.stopSharing(id);
    this.persist(this.members().filter((m) => m.id !== id));
  }

  private updateMember(id: string, patch: Partial<FamilyMember>) {
    this.persist(this.members().map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  /**
   * Family member: explicitly grant consent and start sharing live location.
   * This is only ever triggered by the member themself, on their own device,
   * via the browser's native geolocation permission prompt — never silently.
   */
  startSharing(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.updateMember(id, {
            consented: true,
            sharing: true,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            updatedAt: new Date().toISOString(),
          });
          resolve();
        },
        (err) => {
          this.updateMember(id, { consented: false, sharing: false });
          reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
      );
      this.watchIds.set(id, watchId);
    });
  }

  /** Family member: stop sharing at any time. Consent can be withdrawn instantly. */
  stopSharing(id: string) {
    const watchId = this.watchIds.get(id);
    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
      this.watchIds.delete(id);
    }
    this.updateMember(id, { sharing: false });
  }
}