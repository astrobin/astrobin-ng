import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { combineLatest, Observable, Observer } from "rxjs";
import { filter, map } from "rxjs/operators";
import { AuthService } from "../auth.service";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { LoadImage } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { All, AppActionTypes } from "@app/store/actions/app.actions";

@Injectable()
export class ImageOwnerGuardService extends BaseService implements CanActivate {
  constructor(
    public readonly store$: Store<State>,
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

        this.store$.dispatch(new LoadImage(imageId));

        combineLatest([
          this.store$.select(selectCurrentUser).pipe(
            filter(user => !!user),
            map(user => user.id)
          ),
          this.store$.select(selectImage, imageId).pipe(filter(image => !!image))
        ])
          .pipe(map(result => result[0] === result[1].user))
          .subscribe(canActivate => {
            if (canActivate) {
              onSuccess(observer);
            } else {
              onError(observer, "/permission-denied");
            }
          });

        this.actions$.pipe(ofType(AppActionTypes.LOAD_IMAGE_FAILURE)).subscribe(error => {
          onError(observer, "/404");
        });
      });
    });
  }
}
