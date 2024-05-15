import { Injectable } from "@angular/core";
import { AuthGroupInterface } from "@shared/interfaces/auth-group.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";
import { UserServiceInterface } from "@shared/services/user.service-interface";
import { Observable } from "rxjs";
import { selectUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadingService } from "@shared/services/loading.service";
import { GroupInterface } from "@shared/interfaces/group.interface";

@Injectable({
  providedIn: "root"
})
export class UserService extends BaseService implements UserServiceInterface {
  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  getUser$(userId: UserInterface["id"]): Observable<UserInterface> {
    return this.store$.select(selectUser, userId);
  }

  isInGroup(user: UserInterface, name: string): boolean {
    if (!user || !user.groups) {
      return false;
    }
    return user.groups.filter((group: AuthGroupInterface) => group.name === name).length > 0;
  }

  isInAstroBinGroup(user: UserInterface, name: string): boolean {
    if (!user || !user.astrobinGroups) {
      return false;
    }

    return user.astrobinGroups.filter((group: GroupInterface) => group.name === name).length > 0;
  }
}
