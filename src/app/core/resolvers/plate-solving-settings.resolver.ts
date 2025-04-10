import { Location } from "@angular/common";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, Router } from "@angular/router";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { MainState } from "@app/store/state";
import { FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { PlateSolvingSettingsInterface } from "@core/interfaces/plate-solving-settings.interface";
import { PlateSolvingSettingsApiService } from "@core/services/api/classic/platesolving/settings/plate-solving-settings-api.service";
import { ImageService } from "@core/services/image/image.service";
import { select, Store } from "@ngrx/store";
import { EMPTY, Observable } from "rxjs";
import { catchError, filter, map, switchMap, take } from "rxjs/operators";

export const PlateSolvingSettingsResolver: ResolveFn<PlateSolvingSettingsInterface | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<PlateSolvingSettingsInterface | null> => {
  const plateSolvingApiService = inject(PlateSolvingSettingsApiService);
  const router = inject(Router);
  const location = inject(Location);
  const store$ = inject(Store<MainState>);
  const imageService = inject(ImageService);
  const revisionLabel = route.queryParamMap.get("r") || FINAL_REVISION_LABEL;

  return store$.pipe(
    select(selectImage, route.paramMap.get("imageId")),
    filter(image => !!image),
    take(1),
    map(image => {
      return imageService.getRevision(image!, revisionLabel)!.solution;
    }),
    switchMap(solution => (solution ? plateSolvingApiService.getSettings(solution!.id) : EMPTY)),
    catchError(err => {
      router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
        location.replaceState(state.url);
      });
      return EMPTY;
    })
  );
};
