import { Location } from "@angular/common";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { EMPTY, Observable } from "rxjs";
import { catchError, filter, map, switchMap, take } from "rxjs/operators";
import { PlateSolvingSettingsApiService } from "@shared/services/api/classic/platesolving/settings/plate-solving-settings-api.service";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { MainState } from "@app/store/state";
import { PlateSolvingAdvancedSettingsInterface } from "@shared/interfaces/plate-solving-advanced-settings.interface";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";

export const PlateSolvingAdvancedSettingsResolver: ResolveFn<PlateSolvingAdvancedSettingsInterface | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<PlateSolvingAdvancedSettingsInterface | null> => {
  const plateSolvingApiService = inject(PlateSolvingSettingsApiService);
  const router = inject(Router);
  const location = inject(Location);
  const store$ = inject(Store<MainState>);
  const imageService = inject(ImageService);
  const revisionLabel = route.queryParamMap.get("r") || FINAL_REVISION_LABEL;

  return store$.pipe(
    select(selectImage, route.paramMap.get('imageId')),
    filter(image => !!image && !!image.solution),
    take(1),
    map(image => {
      return imageService.getRevision(image!, revisionLabel)!.solution;
    }),
    switchMap(solution => solution ? plateSolvingApiService.getAdvancedSettings(solution!.id) : EMPTY),
    catchError(err => {
      router.navigateByUrl('/404', { skipLocationChange: true }).then(() => {
        location.replaceState(state.url);
      });
      return EMPTY;
    })
  );
};
