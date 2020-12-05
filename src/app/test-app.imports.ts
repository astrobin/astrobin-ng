import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { formlyConfig } from "@app/formly.config";
import { FontAwesomeTestingModule } from "@fortawesome/angular-fontawesome/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormlyBootstrapModule } from "@ngx-formly/bootstrap";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule } from "@ngx-translate/core";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { PipesModule } from "@shared/pipes/pipes.module";
import { NgxFilesizeModule } from "ngx-filesize";
import { TimeagoModule } from "ngx-timeago";
import { ToastrModule } from "ngx-toastr";
import { UploadxModule } from "ngx-uploadx";

const formlyFieldComponents = [FormlyFieldChunkedFileComponent];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeTestingModule,
    FormlyModule.forRoot(formlyConfig),
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    UploadxModule
  ],
  declarations: formlyFieldComponents,
  exports: formlyFieldComponents
})
export class FormlyTypesTestModule {}

export const testAppImports = [
  CommonModule,
  FontAwesomeTestingModule,
  HttpClientTestingModule,
  FormlyModule.forRoot(formlyConfig),
  FormlyBootstrapModule,
  FormlyTypesTestModule,
  NgbModule,
  NgxFilesizeModule,
  PipesModule,
  ReactiveFormsModule,
  RouterTestingModule,
  TimeagoModule.forRoot(),
  ToastrModule.forRoot(),
  TranslateModule.forRoot(),
  UploadxModule
];
