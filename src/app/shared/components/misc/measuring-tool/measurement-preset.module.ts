import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";

import { MeasurementPresetApiService } from "./services/measurement-preset-api.service";
import { MeasurementPresetEffects } from "./store/measurement-preset.effects";
import { measurementPresetReducer } from "./store/measurement-preset.reducer";

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule,
    StoreModule.forFeature("measurementPreset", measurementPresetReducer),
    EffectsModule.forFeature([MeasurementPresetEffects])
  ],
  providers: [MeasurementPresetApiService],
  exports: []
})
export class MeasurementPresetModule {}
