import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { OwnerAuth } from '../../../services/owner-auth';

@Component({
  selector: 'app-gate',
  imports: [],
  templateUrl: './gate.html',
  styleUrl: './gate.css',
})
export class Gate {
  protected readonly passcode = signal('');
  protected readonly error = signal(false);
  protected readonly checking = signal(false);

  constructor(private auth: OwnerAuth, private router: Router, meta: Meta) {
    meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  async submit() {
    this.checking.set(true);
    this.error.set(false);
    const ok = await this.auth.tryUnlock(this.passcode());
    this.checking.set(false);
    if (ok) {
      this.router.navigateByUrl('/family-tracker');
    } else {
      this.error.set(true);
      this.passcode.set('');
    }
  }
}