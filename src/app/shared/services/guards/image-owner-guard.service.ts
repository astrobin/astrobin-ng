import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EMPTY, Observable } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { ImageApiService } from "../api/classic/images-app/image/image-api.service";
import { AppContextService } from "../app-context/app-context.service";
import { AuthService } from "../auth.service";

@Injectable()
export class ImageOwnerGuardService extends BaseService implements CanActivate {
  constructor(
    public loadingService: LoadingService,
    public authService: AuthService,
    public appContextService: AppContextService,
    public imageApiService: ImageApiService,
    public router: Router,
    public location: Location
  ) {
    super(loadingService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.authService.isAuthenticated().subscribe(authenticated => {
        if (!authenticated) {
          observer.next(false);
          observer.complete();
          return;
        }

        this.appContextService.context$
          .pipe(
            switchMap(context =>
              this.imageApiService.getImage(+route.params["imageId"]).pipe(map(image => ({ context, image })))
            ),
            catchError(err => {
              this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
                this.location.replaceState(state.url);
              });
              return EMPTY;
            }),
            map(({ context, image }) => image.user === context.currentUser.id)
          )
          .subscribe(canActivate => {
            if (canActivate) {
              observer.next(true);
              observer.complete();
            } else {
              this.router.navigateByUrl("/permission-denied", { skipLocationChange: true }).then(() => {
                observer.next(false);
                observer.complete();
                this.location.replaceState(state.url);
              });
            }
          });
      });
    });
  }
}
