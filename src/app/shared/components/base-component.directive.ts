import { Directive, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { filter, map, withLatestFrom } from "rxjs/operators";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";

@Directive()
export class BaseComponentDirective implements OnDestroy {
  title: string;
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

  getContentType$(
    appLabel: ContentTypeInterface["appLabel"],
    model: ContentTypeInterface["model"]
  ): Observable<ContentTypeInterface | null> {
    return this.store$.select(selectContentType, { appLabel, model }).pipe(filter(contentType => !!contentType));
  }
}
