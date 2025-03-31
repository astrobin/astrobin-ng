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
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    MeasuringToolComponent,
    SaveMeasurementModalComponent
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
