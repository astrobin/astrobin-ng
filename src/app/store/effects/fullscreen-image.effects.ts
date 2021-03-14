import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";

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
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly windowRef: WindowRefService
  ) {}
}
