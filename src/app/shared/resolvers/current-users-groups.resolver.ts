import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { catchError, filter, first, map, switchMap } from "rxjs/operators";
import { GroupApiService } from "@shared/services/api/classic/groups/group-api.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { GroupInterface } from "@shared/interfaces/group.interface";

@Injectable({
  providedIn: "root"
})
export class CurrentUsersGroupsResolver implements Resolve<GroupInterface[]> {
  constructor(private readonly store$: Store<State>, private readonly groupApiService: GroupApiService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.store$.select(selectCurrentUser).pipe(
      filter((currentUser: UserInterface) => !!currentUser),
      map((currentUser: UserInterface) => currentUser.id),
      switchMap((currentUserId: number) => this.groupApiService.getAll(currentUserId)),
      first(),
      catchError(() => [])
    );
  }
}
