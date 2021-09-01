import { Directive, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";

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
}
