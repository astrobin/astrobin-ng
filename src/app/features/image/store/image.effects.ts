import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, mergeMap } from "rxjs/operators";
import {
  CreateDeepSkyAcquisitionPreset,
  CreateDeepSkyAcquisitionPresetSuccess,
  CreateSolarSystemAcquisitionPreset,
  CreateSolarSystemAcquisitionPresetSuccess,
  DeleteDeepSkyAcquisitionPreset,
  DeleteDeepSkyAcquisitionPresetSuccess,
  DeleteSolarSystemAcquisitionPreset,
  DeleteSolarSystemAcquisitionPresetSuccess,
  FindDeepSkyAcquisitionPresetsSuccess,
  FindSolarSystemAcquisitionPresetsSuccess,
  ImageActionTypes
} from "@features/image/store/image.actions";
import { All } from "@app/store/actions/app.actions";
import { DeepSkyAcquisitionPresetApiService } from "@shared/services/api/classic/astrobin/deep-sky-acquisition-preset/deep-sky-acquisition-preset-api.service";
import { SolarSystemAcquisitionPresetApiService } from "@shared/services/api/classic/astrobin/solar-system-acquisition-preset/solar-system-acquisition-preset-api.service";

@Injectable()
export class ImageEffects {
  /*********************************************************************************************************************
   * Deep sky acquisition presets
   ********************************************************************************************************************/

  FindDeepSkyAcquisitionPresets: Observable<FindDeepSkyAcquisitionPresetsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(ImageActionTypes.FIND_DEEP_SKY_ACQUISITION_PRESETS),
      mergeMap(() =>
        this.deepSkyAcquisitionPresetApiService
          .getAll()
          .pipe(map(presets => new FindDeepSkyAcquisitionPresetsSuccess({ presets })))
      )
    )
  );

  CreateDeepSkyAcquisitionPreset: Observable<CreateDeepSkyAcquisitionPresetSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(ImageActionTypes.CREATE_DEEP_SKY_ACQUISITION_PRESET),
      map((action: CreateDeepSkyAcquisitionPreset) => action.payload.presetItems),
      mergeMap(presetItems =>
        this.deepSkyAcquisitionPresetApiService
          .create(presetItems)
          .pipe(map(savedPresetItems => new CreateDeepSkyAcquisitionPresetSuccess({ presetItems: savedPresetItems })))
      )
    )
  );

  // UpdateDeepSkyAcquisitionPreset: Observable<UpdateDeepSkyAcquisitionPresetSuccess> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(ImageActionTypes.UPDATE_DEEP_SKY_ACQUISITION_PRESET),
  //     map((action: UpdateDeepSkyAcquisitionPreset) => action.payload.preset),
  //     mergeMap(preset =>
  //       this.deepSkyAcquisitionPresetApiService
  //         .update(preset)
  //         .pipe(map(updatedPreset => new UpdateDeepSkyAcquisitionPresetSuccess({ preset: updatedPreset })))
  //     )
  //   )
  // );

  DeleteDeepSkyAcquisitionPreset: Observable<DeleteDeepSkyAcquisitionPresetSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(ImageActionTypes.DELETE_DEEP_SKY_ACQUISITION_PRESET),
      map((action: DeleteDeepSkyAcquisitionPreset) => action.payload.presetItems),
      mergeMap(presetItems =>
        this.deepSkyAcquisitionPresetApiService
          .delete(presetItems)
          .pipe(map(() => new DeleteDeepSkyAcquisitionPresetSuccess({ presetItems })))
      )
    )
  );

  /*********************************************************************************************************************
   * Solar system acquisition presets
   ********************************************************************************************************************/

  FindSolarSystemAcquisitionPresets: Observable<FindSolarSystemAcquisitionPresetsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(ImageActionTypes.FIND_SOLAR_SYSTEM_ACQUISITION_PRESETS),
      mergeMap(() =>
        this.solarSystemAcquisitionPresetApiService
          .getAll()
          .pipe(map(presets => new FindSolarSystemAcquisitionPresetsSuccess({ presetItems: presets })))
      )
    )
  );

  CreateSolarSystemAcquisitionPreset: Observable<CreateSolarSystemAcquisitionPresetSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(ImageActionTypes.CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET),
      map((action: CreateSolarSystemAcquisitionPreset) => action.payload.presetItems),
      mergeMap(preset =>
        this.solarSystemAcquisitionPresetApiService
          .create(preset)
          .pipe(map(savedPreset => new CreateSolarSystemAcquisitionPresetSuccess({ presetItems: savedPreset })))
      )
    )
  );

  // UpdateSolarSystemAcquisitionPreset: Observable<UpdateSolarSystemAcquisitionPresetSuccess> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(ImageActionTypes.UPDATE_SOLAR_SYSTEM_ACQUISITION_PRESET),
  //     map((action: UpdateSolarSystemAcquisitionPreset) => action.payload.preset),
  //     mergeMap(preset =>
  //       this.solarSystemAcquisitionPresetApiService
  //         .update(preset)
  //         .pipe(map(updatedPreset => new UpdateSolarSystemAcquisitionPresetSuccess({ preset: updatedPreset })))
  //     )
  //   )
  // );

  DeleteSolarSystemAcquisitionPreset: Observable<DeleteSolarSystemAcquisitionPresetSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(ImageActionTypes.DELETE_SOLAR_SYSTEM_ACQUISITION_PRESET),
      map((action: DeleteSolarSystemAcquisitionPreset) => action.payload.presetItems),
      mergeMap(presetItems =>
        this.solarSystemAcquisitionPresetApiService
          .delete(presetItems)
          .pipe(map(() => new DeleteSolarSystemAcquisitionPresetSuccess({ presetItems })))
      )
    )
  );

  constructor(
    public readonly actions$: Actions<All>,
    public readonly deepSkyAcquisitionPresetApiService: DeepSkyAcquisitionPresetApiService,
    public readonly solarSystemAcquisitionPresetApiService: SolarSystemAcquisitionPresetApiService
  ) {
  }
}
