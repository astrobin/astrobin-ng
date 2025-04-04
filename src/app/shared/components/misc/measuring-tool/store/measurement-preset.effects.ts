import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap } from "rxjs/operators";
import { MeasurementPresetApiService } from "../services/measurement-preset-api.service";
import {
  CreateMeasurementPreset,
  CreateMeasurementPresetFailure,
  CreateMeasurementPresetSuccess,
  DeleteMeasurementPreset,
  DeleteMeasurementPresetFailure,
  DeleteMeasurementPresetSuccess,
  LoadMeasurementPresets,
  LoadMeasurementPresetsFailure,
  LoadMeasurementPresetsSuccess,
  MeasurementPresetActionTypes
} from "./measurement-preset.actions";

@Injectable()
export class MeasurementPresetEffects {

  loadMeasurementPresets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS),
      switchMap((action: LoadMeasurementPresets) =>
        this.measurementPresetApiService.getMeasurementPresets(action.payload.userId).pipe(
          map(presets => new LoadMeasurementPresetsSuccess({ presets })),
          catchError(error => of(new LoadMeasurementPresetsFailure({ error })))
        )
      )
    )
  );

  createMeasurementPreset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET),
      mergeMap((action: CreateMeasurementPreset) => {
        return this.measurementPresetApiService.createMeasurementPreset(action.payload.preset).pipe(
          map(preset => {
            return new CreateMeasurementPresetSuccess({ preset });
          }),
          catchError(error => {
            console.error('MeasurementPresetEffects: API call failed:', error);
            return of(new CreateMeasurementPresetFailure({ error }));
          })
        );
      })
    )
  );

  deleteMeasurementPreset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET),
      mergeMap((action: DeleteMeasurementPreset) =>
        this.measurementPresetApiService.deleteMeasurementPreset(action.payload.presetId).pipe(
          map(() => new DeleteMeasurementPresetSuccess({ presetId: action.payload.presetId })),
          catchError(error => of(new DeleteMeasurementPresetFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private measurementPresetApiService: MeasurementPresetApiService
  ) {}
}
