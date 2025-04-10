import { Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import type { MainState } from "@app/store/state";
import { GroupInterface } from "@core/interfaces/group.interface";
import type { ImageInterface } from "@core/interfaces/image.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { GroupApiService } from "@core/services/api/classic/groups/group-api.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { catchError, filter, first, map, switchMap, take, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ImageUserGroupsResolver {
  constructor(private readonly store$: Store<MainState>, private readonly groupApiService: GroupApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    const imageId = route.paramMap.get("imageId");
    return this.store$.select(selectImage, imageId).pipe(
      filter(image => !!image),
      take(1),
      tap((image: ImageInterface) => this.store$.dispatch(new LoadUser({ id: image.user }))),
      switchMap(image => this.store$.select(selectUser, image.user)),
      filter((user: UserInterface) => !!user),
      map((user: UserInterface) => user.id),
      switchMap((userId: number) => this.groupApiService.getAll(userId)),
      first(),
      catchError(() => [])
    );
  }
}
