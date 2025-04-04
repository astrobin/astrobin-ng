import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { measurementPresetReducer } from './store/measurement-preset.reducer';
import { MeasurementPresetEffects } from './store/measurement-preset.effects';
import { MeasurementPresetApiService } from './services/measurement-preset-api.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule,
    StoreModule.forFeature('measurementPreset', measurementPresetReducer),
    EffectsModule.forFeature([MeasurementPresetEffects])
  ],
  providers: [
    MeasurementPresetApiService
  ],
  exports: []
})
export class MeasurementPresetModule { }