import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OwnerAuth } from '../services/owner-auth';

export const ownerAuthGuard: CanActivateFn = () => {
  const auth = inject(OwnerAuth);
  const router = inject(Router);
  if (auth.unlocked()) return true;
  return router.createUrlTree(['/family-tracker/unlock']);
};