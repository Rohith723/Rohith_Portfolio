import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { LocationService } from '../../../services/location';

type Status = 'idle' | 'requesting' | 'sharing' | 'denied' | 'not-found';

@Component({
  selector: 'app-join',
  imports: [],
  templateUrl: './join.html',
  styleUrl: './join.css',
})
export class Join {
  private readonly id: string;
  protected readonly status = signal<Status>('idle');
  protected readonly errorMessage = signal('');

  protected readonly member = computed(() => this.location.members().find((m) => m.id === this.id));

  constructor(route: ActivatedRoute, protected readonly location: LocationService, meta: Meta) {
    meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
    this.id = route.snapshot.paramMap.get('id') ?? '';
    if (!this.location.getMember(this.id)) {
      this.status.set('not-found');
    } else if (this.location.getMember(this.id)?.sharing) {
      this.status.set('sharing');
    }
  }

  async allow() {
    this.status.set('requesting');
    try {
      await this.location.startSharing(this.id);
      this.status.set('sharing');
    } catch (err) {
      this.status.set('denied');
      this.errorMessage.set(
        err instanceof GeolocationPositionError
          ? 'Location permission was denied in the browser.'
          : 'Something went wrong requesting your location.'
      );
    }
  }

  stop() {
    this.location.stopSharing(this.id);
    this.status.set('idle');
  }
}