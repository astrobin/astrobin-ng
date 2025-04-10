import { Injectable } from "@angular/core";
import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import type { MainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { Observable } from "rxjs";

@Injectable()
export class FullscreenImageEffects {
  showFullscreenImage$: Observable<ShowFullscreenImage> = createEffect(
    () => this.actions$.pipe(ofType(AppActionTypes.SHOW_FULLSCREEN_IMAGE)),
    { dispatch: false }
  );

  hideFullscreenImage$: Observable<HideFullscreenImage> = createEffect(
    () => this.actions$.pipe(ofType(AppActionTypes.HIDE_FULLSCREEN_IMAGE)),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly windowRef: WindowRefService
  ) {}
}
