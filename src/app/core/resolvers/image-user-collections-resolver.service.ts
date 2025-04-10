import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { CollectionApiService } from "@core/services/api/classic/collections/collection-api.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { catchError, filter, first, map, switchMap, take, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ImageUserCollectionsResolver {
  constructor(private readonly store$: Store<MainState>, private readonly collectionApiService: CollectionApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    const imageId = route.paramMap.get("imageId");
    return this.store$.select(selectImage, imageId).pipe(
      filter((image: ImageInterface) => !!image),
      take(1),
      tap((image: ImageInterface) => this.store$.dispatch(new LoadUser({ id: image.user }))),
      switchMap((image: ImageInterface) => this.store$.select(selectUser, image.user)),
      filter((currentUser: UserInterface) => !!currentUser),
      take(1),
      map((currentUser: UserInterface) => currentUser.id),
      switchMap((currentUserId: number) => this.collectionApiService.getAll({ user: currentUserId })),
      first(),
      catchError(() => [])
    );
  }
}
