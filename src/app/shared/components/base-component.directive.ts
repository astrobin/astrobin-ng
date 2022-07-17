import { Directive, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { distinctUntilKeyChanged, map, switchMap, tap } from "rxjs/operators";

@Directive()
export class BaseComponentDirective implements OnDestroy {
  title: string;
  destroyedSubject = new Subject();
  destroyed$ = this.destroyedSubject.asObservable();
  currentUser$: Observable<UserInterface> = this.store$.select(selectCurrentUser);
  currentUserProfile$: Observable<UserProfileInterface> = this.store$.select(selectCurrentUserProfile);
  currentUserWrapper$: Observable<{ user: UserInterface; userProfile: UserProfileInterface }> = this.currentUser$.pipe(
    distinctUntilKeyChanged("id"),
    switchMap(user =>
      this.currentUserProfile$.pipe(
        distinctUntilKeyChanged("id"),
        map(userProfile => ({
          user,
          userProfile
        }))
      )
    )
  );

  constructor(public readonly store$: Store) {}

  ngOnDestroy(): void {
    this.destroyedSubject.next();
  }
}
