import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { PipesModule } from "@shared/pipes/pipes.module";

import { MeasuringToolComponent } from "./measuring-tool.component";
import { MeasurementPresetModule } from "./measurement-preset.module";
import { SaveMeasurementModalComponent } from "./save-measurement-modal/save-measurement-modal.component";
import { ExportMeasurementModalComponent } from "./export-measurement-modal/export-measurement-modal.component";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { CalculateDistancePipe, CalculateLabelPositionPipe, FormatCoordinatesCompactPipe, GetCelestialDistancePipe, GetMidpointPipe, MathAbsPipe, MathMaxPipe, MathMinPipe } from "./measuring-tool-pipes";

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
    CalculateLabelPositionPipe
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
export class MeasuringToolModule {
}
