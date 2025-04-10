import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import {
  CreateToggleProperty,
  DeleteToggleProperty,
  LoadToggleProperties,
  LoadToggleProperty,
  CreateTogglePropertyFailure,
  CreateTogglePropertySuccess,
  DeleteTogglePropertyFailure,
  DeleteTogglePropertySuccess,
  LoadTogglePropertiesFailure,
  LoadTogglePropertiesSuccess,
  LoadTogglePropertyFailure,
  LoadTogglePropertySuccess
} from "@app/store/actions/toggle-property.actions";
import { MainState } from "@app/store/state";
import { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { LoadingService } from "@core/services/loading.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { catchError, map, mergeMap, tap } from "rxjs/operators";

@Injectable()
export class TogglePropertyEffects {
  LoadToggleProperty: Observable<LoadTogglePropertySuccess | LoadTogglePropertyFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_TOGGLE_PROPERTY),
      map((action: LoadToggleProperty) => action.payload.toggleProperty),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap((toggleProperty: Partial<TogglePropertyInterface>) =>
        this.commonApiService.getToggleProperty(toggleProperty).pipe(
          map(createdToggleProperty =>
            createdToggleProperty !== null
              ? new LoadTogglePropertySuccess({ toggleProperty: createdToggleProperty })
              : new LoadTogglePropertyFailure({ toggleProperty })
          ),
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
        })
      ),
    { dispatch: false }
  );

  LoadToggleProperties: Observable<LoadTogglePropertiesSuccess | LoadTogglePropertiesFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_TOGGLE_PROPERTIES),
      map((action: LoadToggleProperties) => action.payload.toggleProperties),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap((toggleProperties: Partial<TogglePropertyInterface>[]) =>
        this.commonApiService.getToggleProperties(toggleProperties).pipe(
          map(response => {
            if (response !== null && Array.isArray(response)) {
              return new LoadTogglePropertiesSuccess({ toggleProperties: response });
            }
            return new LoadTogglePropertiesFailure({ toggleProperties });
          }),
          catchError(() => of(new LoadTogglePropertiesFailure({ toggleProperties })))
        )
      )
    )
  );

  LoadTogglePropertiesSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_TOGGLE_PROPERTIES_SUCCESS),
        map(() => {
          this.loadingService.setLoading(false);
          return void 0;
        })
      ),
    { dispatch: false }
  );

  LoadTogglePropertiesFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_TOGGLE_PROPERTIES_FAILURE),
        map(() => {
          this.loadingService.setLoading(false);
          return void 0;
        })
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
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
        map(() => {
          return void 0;
        })
      ),
    { dispatch: false }
  );

  CreateTogglePropertyFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_FAILURE),
        map(() => {
          return void 0;
        })
      ),
    { dispatch: false }
  );

  DeleteToggleProperty: Observable<DeleteTogglePropertySuccess | DeleteTogglePropertyFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY),
      map((action: DeleteToggleProperty) => action.payload.toggleProperty),
      mergeMap((toggleProperty: Partial<TogglePropertyInterface>) =>
        this.commonApiService.deleteToggleProperty(toggleProperty.id).pipe(
          map(() => new DeleteTogglePropertySuccess({ toggleProperty })),
          catchError(() => of(new DeleteTogglePropertyFailure({ toggleProperty })))
        )
      )
    )
  );

  DeleteTogglePropertySuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
        map(() => {
          return void 0;
        })
      ),
    { dispatch: false }
  );

  DeleteTogglePropertyFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE),
        map(() => {
          return void 0;
        })
      ),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly loadingService: LoadingService,
    public readonly commonApiService: CommonApiService
  ) {}
}
