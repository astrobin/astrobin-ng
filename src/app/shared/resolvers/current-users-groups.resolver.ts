import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { EMPTY, Observable } from "rxjs";
import { catchError, filter, first, map, switchMap } from "rxjs/operators";
import { ImageInterface } from "../interfaces/image.interface";
import { GroupApiService } from "@shared/services/api/classic/groups/group-api.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Location } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class CurrentUsersGroupsResolver implements Resolve<ImageInterface> {
  constructor(
    private readonly store$: Store<State>,
    private readonly groupApiService: GroupApiService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.store$.select(selectCurrentUser).pipe(
      filter((currentUser: UserInterface) => !!currentUser),
      map((currentUser: UserInterface) => currentUser.id),
      switchMap((currentUserId: number) => this.groupApiService.getAll(currentUserId)),
      catchError(err => {
        this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
          this.location.replaceState(state.url);
        });
        return EMPTY;
      }),
      first()
    );
  }
}
