import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModalModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { DirectivesModule } from "@shared/directives/directives.module";
import { FormlyModule } from "@ngx-formly/core";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";

import { AnnotationToolComponent } from "./annotation-tool.component";
import { AnnotationService } from "./services/annotation.service";

@NgModule({
  declarations: [
    AnnotationToolComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FontAwesomeModule,
    FormsModule,
    NgbTooltipModule,
    NgbModalModule,
    ReactiveFormsModule,
    DirectivesModule,
    FormlyModule,
    FormlyBootstrapModule
  ],
  exports: [AnnotationToolComponent],
  providers: [AnnotationService]
})
export class AnnotationToolModule {
}
