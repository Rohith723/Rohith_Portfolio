import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location';
import { OwnerAuth } from '../../services/owner-auth';

@Component({
  selector: 'app-family-tracker',
  imports: [DecimalPipe],
  templateUrl: './family-tracker.html',
  styleUrl: './family-tracker.css',
})
export class FamilyTracker {
  protected readonly newName = signal('');
  protected readonly copiedId = signal<string | null>(null);

  constructor(
    protected readonly location: LocationService,
    private auth: OwnerAuth,
    private router: Router,
    meta: Meta
  ) {
    // This page is not linked from the site nav or sitemap — keep it out of
    // search results too, since it's meant to be reached only via a direct
    // link you send yourself.
    meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  lock() {
    this.auth.lock();
    this.router.navigateByUrl('/family-tracker/unlock');
  }

  addMember() {
    const name = this.newName().trim();
    if (!name) return;
    this.location.addMember(name);
    this.newName.set('');
  }

  joinUrl(id: string): string {
    return `${window.location.origin}/family-tracker/join/${id}`;
  }

  async copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(this.joinUrl(id));
      this.copiedId.set(id);
      setTimeout(() => this.copiedId.set(null), 1800);
    } catch {
      // Clipboard permission denied — the link is still visible for manual copy.
    }
  }

  remove(id: string) {
    this.location.removeMember(id);
  }

  minutesAgo(iso?: string): string {
    if (!iso) return 'never';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 min ago';
    return `${mins} min ago`;
  }

  mapUrl(lat?: number, lng?: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}
