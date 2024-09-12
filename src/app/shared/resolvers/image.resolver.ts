import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, ResolveFn } from "@angular/router";
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ImageApiService } from '@shared/services/api/classic/images/image/image-api.service';
import { ImageInterface } from '../interfaces/image.interface';
import { SetImage } from '@app/store/actions/image.actions';
import { MainState } from '@app/store/state';

export const ImageResolver: ResolveFn<ImageInterface | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ImageInterface | null> => {
  const service = inject(ImageApiService);
  const router = inject(Router);
  const location = inject(Location);
  const store$ = inject(Store<MainState>);

  const id = route.paramMap.get('imageId');
  const skipThumbnails = route.data['skipThumbnails'] || false;

  return service.getImage(id, { skipThumbnails }).pipe(
    tap(image => {
      store$.dispatch(new SetImage(image));
    }),
    catchError(() => {
      router.navigateByUrl('/404', { skipLocationChange: true }).then(() => {
        location.replaceState(state.url);
      });
      return EMPTY;
    })
  );
};
