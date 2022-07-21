import { Injectable } from "@angular/core";
import { UsernameServiceInterface } from "@shared/components/misc/username/username.service-interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadUserProfile } from "@features/account/store/auth.actions";
import { selectUserProfile } from "@features/account/store/auth.selectors";
import { map } from "rxjs/operators";

@Injectable()
export class UsernameService extends BaseService implements UsernameServiceInterface {
  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  getDisplayName$(user: UserInterface): Observable<string> {
    if (!!user.displayName) {
      return of(user.displayName);
    }

    this.store$.dispatch(new LoadUserProfile({ id: user.userProfile }));
    return this.store$.select(selectUserProfile, user.userProfile).pipe(
      map(userProfile => {
        if (userProfile && userProfile.realName) {
          return userProfile.realName;
        }

        return user.username;
      })
    );
  }
}
