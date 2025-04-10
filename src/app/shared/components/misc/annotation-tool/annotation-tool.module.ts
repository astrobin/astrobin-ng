import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModalModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule } from "@ngx-translate/core";
import { DirectivesModule } from "@shared/directives/directives.module";

import { AnnotationToolComponent } from "./annotation-tool.component";
import { AnnotationService } from "./services/annotation.service";

@NgModule({
  declarations: [AnnotationToolComponent],
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
export class AnnotationToolModule {}
