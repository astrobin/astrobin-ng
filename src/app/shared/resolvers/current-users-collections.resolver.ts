import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { catchError, filter, first, map, switchMap } from "rxjs/operators";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { CollectionApiService } from "@shared/services/api/classic/collections/collection-api.service";

@Injectable({
  providedIn: "root"
})
export class CurrentUsersCollectionsResolver implements Resolve<CollectionInterface[]> {
  constructor(private readonly store$: Store<State>, private readonly collectionApiService: CollectionApiService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.store$.select(selectCurrentUser).pipe(
      filter((currentUser: UserInterface) => !!currentUser),
      map((currentUser: UserInterface) => currentUser.id),
      switchMap((currentUserId: number) => this.collectionApiService.getAll(currentUserId)),
      first(),
      catchError(() => [])
    );
  }
}
