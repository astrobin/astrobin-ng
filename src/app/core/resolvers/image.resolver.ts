import { Location } from "@angular/common";
import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { SetImage } from "@app/store/actions/image.actions";
import type { MainState } from "@app/store/state";
import type { ImageInterface } from "@core/interfaces/image.interface";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { EMPTY, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";

export const ImageResolver: ResolveFn<ImageInterface | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ImageInterface | null> => {
  const service = inject(ImageApiService);
  const router = inject(Router);
  const location = inject(Location);
  const store$ = inject(Store<MainState>);

  let id = route.paramMap.get("imageId");
  const skipThumbnails = route.data["skipThumbnails"] || false;

  if (!id) {
    id = route.queryParamMap.get("i");
  }

  if (!id) {
    return of(null);
  }

  return service.getImage(id, { skipThumbnails }).pipe(
    tap(image => {
      store$.dispatch(new SetImage(image));
    }),
    catchError(() => {
      router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
        location.replaceState(state.url);
      });
      return EMPTY;
    })
  );
};
