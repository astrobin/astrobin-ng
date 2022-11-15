import { Directive, OnDestroy, OnInit } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { distinctUntilKeyChangedOrNull } from "@shared/services/utils/utils.service";

@Directive()
export class BaseComponentDirective implements OnInit, OnDestroy {
  title: string;
  destroyedSubject = new ReplaySubject<void>(1);
  destroyed$ = this.destroyedSubject.asObservable();

  currentUser$: Observable<UserInterface | null>;
  currentUserProfile$: Observable<UserProfileInterface | null>;
  currentUserWrapper$: Observable<{ user: UserInterface | null; userProfile: UserProfileInterface | null }>;

  constructor(public readonly store$: Store) {
    this.currentUser$ = this.store$
      .select(selectCurrentUser)
      .pipe(takeUntil(this.destroyed$), distinctUntilKeyChangedOrNull("id"));

    this.currentUserProfile$ = this.store$
      .select(selectCurrentUserProfile)
      .pipe(takeUntil(this.destroyed$), distinctUntilKeyChangedOrNull("id"));

    this.currentUserWrapper$ = this.store$.select(selectCurrentUser).pipe(
      takeUntil(this.destroyed$),
      switchMap(user =>
        this.store$.select(selectCurrentUserProfile).pipe(
          map(userProfile => ({
            user,
            userProfile
          }))
        )
      )
    );
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.destroyedSubject.complete();
  }
}
