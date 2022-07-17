import { Directive, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { distinctUntilKeyChanged, map, switchMap, tap } from "rxjs/operators";

@Directive()
export class BaseComponentDirective implements OnInit, OnDestroy {
  title: string;
  destroyedSubject = new Subject();
  destroyed$ = this.destroyedSubject.asObservable();

  currentUser$: Observable<UserInterface | null>;
  currentUserProfile$: Observable<UserProfileInterface | null>;
  currentUserWrapper$: Observable<{ user: UserInterface | null; userProfile: UserProfileInterface | null }>;

  constructor(public readonly store$: Store) {
    this.currentUser$ = this.store$.select(selectCurrentUser).pipe(distinctUntilKeyChanged("id"));
    this.currentUserProfile$ = this.store$.select(selectCurrentUserProfile).pipe(distinctUntilKeyChanged("id"));
    this.currentUserWrapper$ = this.store$.select(selectCurrentUser).pipe(
      distinctUntilKeyChanged("id"),
      switchMap(user =>
        this.store$.select(selectCurrentUserProfile).pipe(
          distinctUntilKeyChanged("id"),
          map(userProfile => ({
            user,
            userProfile
          }))
        )
      )
    );
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroyedSubject.next();
  }
}
