import type { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type { LoadImageFailure } from "@app/store/actions/image.actions";
import { LoadImage } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import type { MainState } from "@app/store/state";
import type { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import { combineLatest, Observable } from "rxjs";
import type { Observer } from "rxjs";
import { filter, map } from "rxjs/operators";

import type { AuthService } from "../auth.service";

@Injectable({
  providedIn: "root"
})
export class ImageOwnerGuardService extends BaseService {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public loadingService: LoadingService,
    public authService: AuthService,
    public imageApiService: ImageApiService,
    public router: Router,
    public location: Location
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const onSuccess = (observer: Observer<boolean>) => {
      observer.next(true);
      observer.complete();
    };

    const onError = (observer: Observer<boolean>, redirectTo: string) => {
      this.router.navigateByUrl(redirectTo, { skipLocationChange: true }).then(() => {
        observer.next(false);
        observer.complete();
        this.location.replaceState(state.url);
      });
    };

    return new Observable<boolean>(observer => {
      this.authService.isAuthenticated$().subscribe(authenticated => {
        if (!authenticated) {
          observer.next(false);
          observer.complete();
          return;
        }

        const imageId = route.params["imageId"];

        this.store$.dispatch(new LoadImage({ imageId: imageId, options: { skipThumbnails: true } }));

        combineLatest([
          this.store$.select(selectCurrentUser).pipe(filter(user => !!user)),
          this.store$.select(selectImage, imageId).pipe(filter(image => !!image))
        ])
          .pipe(map(([currentUser, image]) => currentUser.id === image.user || currentUser.isSuperUser))
          .subscribe(canActivate => {
            if (canActivate) {
              onSuccess(observer);
            } else {
              onError(observer, "/permission-denied");
            }
          });

        this.actions$
          .pipe(
            ofType(AppActionTypes.LOAD_IMAGE_FAILURE),
            filter((action: LoadImageFailure) => action.payload.imageId === imageId)
          )
          .subscribe(error => {
            onError(observer, "/404");
          });
      });
    });
  }
}
