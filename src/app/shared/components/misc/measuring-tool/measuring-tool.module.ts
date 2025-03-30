import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MeasuringToolComponent } from "./measuring-tool.component";
import { MeasurementPresetModule } from "./measurement-preset.module";
import { SaveMeasurementModalComponent } from "./save-measurement-modal/save-measurement-modal.component";

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
    ReactiveFormsModule,
    MeasurementPresetModule
  ],
  exports: [MeasuringToolComponent]
})
export class MeasuringToolModule {}
