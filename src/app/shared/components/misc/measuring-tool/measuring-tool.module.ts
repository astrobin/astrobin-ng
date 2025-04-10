import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "@shared/pipes/pipes.module";

import { ExportMeasurementModalComponent } from "./export-measurement-modal/export-measurement-modal.component";
import { MeasurementPresetModule } from "./measurement-preset.module";
import {
  CalculateDistancePipe,
  CalculateLabelPositionPipe,
  FormatCoordinatesCompactPipe,
  GetCelestialDistancePipe,
  GetMidpointPipe,
  IsOutsideImageBoundariesPipe,
  MathAbsPipe,
  MathMaxPipe,
  MathMinPipe
} from "./measuring-tool-pipes";
import { MeasuringToolComponent } from "./measuring-tool.component";
import { SaveMeasurementModalComponent } from "./save-measurement-modal/save-measurement-modal.component";

@NgModule({
  declarations: [
    MeasuringToolComponent,
    SaveMeasurementModalComponent,
    ExportMeasurementModalComponent,
    // Custom pipes for template optimization
    CalculateDistancePipe,
    FormatCoordinatesCompactPipe,
    GetCelestialDistancePipe,
    MathMinPipe,
    MathMaxPipe,
    MathAbsPipe,
    GetMidpointPipe,
    CalculateLabelPositionPipe,
    IsOutsideImageBoundariesPipe
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FontAwesomeModule,
    FormsModule,
    NgbTooltipModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    FormlySelectModule,
    MeasurementPresetModule,
    PipesModule
  ],
  exports: [MeasuringToolComponent]
})
export class MeasuringToolModule {}
