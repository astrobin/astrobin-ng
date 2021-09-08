import { Directive, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { map, withLatestFrom } from "rxjs/operators";

@Directive()
export class BaseComponentDirective implements OnDestroy {
  destroyedSubject = new Subject();
  destroyed$ = this.destroyedSubject.asObservable();

  constructor(public readonly store$: Store) {}

  ngOnDestroy(): void {
    this.destroyedSubject.next();
  }

  get currentUser$(): Observable<UserInterface> {
    return this.store$.select(selectCurrentUser);
  }

  get currentUserProfile$(): Observable<UserProfileInterface> {
    return this.store$.select(selectCurrentUserProfile);
  }

  get currentUserWrapper$(): Observable<{ user: UserInterface; userProfile: UserProfileInterface }> {
    return this.currentUser$.pipe(
      withLatestFrom(this.currentUserProfile$),
      map(([user, userProfile]) => ({
        user,
        userProfile
      }))
    );
  }
}
