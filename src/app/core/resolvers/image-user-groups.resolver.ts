import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { catchError, filter, first, map, switchMap, take, tap } from "rxjs/operators";
import { GroupApiService } from "@core/services/api/classic/groups/group-api.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { UserInterface } from "@core/interfaces/user.interface";
import { GroupInterface } from "@core/interfaces/group.interface";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import { ImageInterface } from "@core/interfaces/image.interface";

@Injectable({
  providedIn: "root"
})
export class ImageUserGroupsResolver  {
  constructor(private readonly store$: Store<MainState>, private readonly groupApiService: GroupApiService) {
  }

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
