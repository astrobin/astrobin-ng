import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import {
  CreateToggleProperty,
  CreateTogglePropertyFailure,
  CreateTogglePropertySuccess,
  DeleteToggleProperty,
  DeleteTogglePropertyFailure,
  DeleteTogglePropertySuccess,
  LoadToggleProperty,
  LoadTogglePropertyFailure,
  LoadTogglePropertySuccess
} from "@app/store/actions/toggle-property.actions";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";

@Injectable()
export class TogglePropertyEffects {
  LoadToggleProperty: Observable<LoadTogglePropertySuccess | LoadTogglePropertyFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_TOGGLE_PROPERTY),
      map((action: LoadToggleProperty) => action.payload.toggleProperty),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap((toggleProperty: Partial<TogglePropertyInterface>) =>
        this.commonApiService.getToggleProperty(toggleProperty).pipe(
          map(toggleProperty => new LoadTogglePropertySuccess({ toggleProperty })),
          catchError(() => of(new LoadTogglePropertyFailure({ toggleProperty })))
        )
      )
    )
  );

  LoadTogglePropertySuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_TOGGLE_PROPERTY_SUCCESS),
        map(() => {
          this.loadingService.setLoading(false);
          return void 0;
        })
      ),
    { dispatch: false }
  );

  LoadTogglePropertyFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_TOGGLE_PROPERTY_FAILURE),
        map(() => {
            this.loadingService.setLoading(false);
            return void 0;
          }
        )
      ),
    { dispatch: false }
  );

  CreateToggleProperty: Observable<CreateTogglePropertySuccess | CreateTogglePropertyFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY),
      map((action: CreateToggleProperty) => action.payload.toggleProperty),
      mergeMap((toggleProperty: Partial<TogglePropertyInterface>) =>
        this.commonApiService.createToggleProperty(toggleProperty).pipe(
          map(toggleProperty => new CreateTogglePropertySuccess({ toggleProperty })),
          catchError(() => of(new CreateTogglePropertyFailure({ toggleProperty })))
        )
      )
    )
  );

  CreateTogglePropertySuccess: Observable<void> = createEffect(
    () => this.actions$.pipe(
      ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
      map(() => {
          return void 0;
        }
      )),
    { dispatch: false }
  );

  CreateTogglePropertyFailure: Observable<void> = createEffect(
    () => this.actions$.pipe(
      ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_FAILURE),
      map(() => {
          return void 0;
        }
      )),
    { dispatch: false }
  );

  DeleteToggleProperty: Observable<DeleteTogglePropertySuccess | DeleteTogglePropertyFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY),
      map((action: DeleteToggleProperty) => action.payload.toggleProperty),
      mergeMap((toggleProperty: Partial<TogglePropertyInterface>) =>
        this.commonApiService.deleteToggleProperty(toggleProperty.id).pipe(
          map(() => new DeleteTogglePropertySuccess({ togglePropertyId: toggleProperty.id })),
          catchError(() => of(new DeleteTogglePropertyFailure({ toggleProperty })))
        )
      )
    )
  );

  DeleteTogglePropertySuccess: Observable<void> = createEffect(
    () => this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
      map(() => {
          return void 0;
        }
      )),
    { dispatch: false }
  );

  DeleteTogglePropertyFailure: Observable<void> = createEffect(
    () => this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE),
      map(() => {
          return void 0;
        }
      )),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly loadingService: LoadingService,
    public readonly commonApiService: CommonApiService
  ) {
  }
}
