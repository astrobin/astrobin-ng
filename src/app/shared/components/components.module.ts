import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { formlyValidationConfig } from "@app/formly.config";
import { ObjectsInFieldComponent } from "@app/shared/components/misc/objects-in-field/objects-in-field.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { FORMLY_CONFIG, FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { BreadcrumbComponent } from "@shared/components/misc/breadcrumb/breadcrumb.component";
import { CameraComponent } from "@shared/components/misc/camera/camera.component";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { FormlyFieldImageCropperComponent } from "@shared/components/misc/formly-field-image-cropper/formly-field-image-cropper.component";
import { FormlyFieldNgSelectComponent } from "@shared/components/misc/formly-field-ng-select/formly-field-ng-select.component";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { FullscreenImageViewerComponent } from "@shared/components/misc/fullscreen-image-viewer/fullscreen-image-viewer.component";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { LoadingIndicatorComponent } from "@shared/components/misc/loading-indicator/loading-indicator.component";
import { RefreshButtonComponent } from "@shared/components/misc/refresh-button/refresh-button.component";
import { TelescopeComponent } from "@shared/components/misc/telescope/telescope.component";
import { TextLoadingIndicatorComponent } from "@shared/components/misc/text-loading-indicator/text-loading-indicator.component";
import { PipesModule } from "@shared/pipes/pipes.module";
import { NgWizardModule } from "ng-wizard";
import { NgxFilesizeModule } from "ngx-filesize";
import { ImageCropperModule } from "ngx-image-cropper";
import { NgxImageZoomModule } from "ngx-image-zoom";
import { UploadxModule } from "ngx-uploadx";
import { LoginFormComponent } from "./auth/login-form/login-form.component";
import { LoginModalComponent } from "./auth/login-modal/login-modal.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { EmptyListComponent } from "./misc/empty-list/empty-list.component";
import { ReadOnlyModeComponent } from "./misc/read-only-mode/read-only-mode.component";
import { UsernameComponent } from "./misc/username/username.component";
import { FormlyWrapperComponent } from "@shared/components/misc/formly-wrapper/formly-wrapper.component";
import { FormlyFieldGoogleMapComponent } from "@shared/components/misc/formly-field-google-map/formly-field-google-map.component";
import { ToggleButtonComponent } from "@shared/components/misc/toggle-button/toggle-button.component";
import { NgToggleModule } from "ng-toggle-button";
import { FormlyFieldCKEditorComponent } from "@shared/components/misc/formly-field-ckeditor/formly-field-ckeditor.component";
import { FileValueAccessorDirective } from "@shared/components/misc/formly-field-file/file-value-accessor.directive";
import { FormlyFieldFileComponent } from "@shared/components/misc/formly-field-file/formly-field-file.component";
import { UsernameService } from "@shared/components/misc/username/username.service";

const modules = [
  CommonModule,
  FontAwesomeModule,
  FormsModule,
  FormlySelectModule,
  ImageCropperModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule,
  NgSelectModule,
  NgToggleModule,
  NgxFilesizeModule,
  NgxImageZoomModule,
  NgWizardModule,
  PipesModule,
  ReactiveFormsModule,
  RouterModule,
  TranslateModule,
  FormlyModule,
  UploadxModule
];

const components = [
  BreadcrumbComponent,
  CameraComponent,
  EmptyListComponent,
  FileValueAccessorDirective,
  FooterComponent,
  FormlyFieldChunkedFileComponent,
  FormlyFieldCKEditorComponent,
  FormlyFieldFileComponent,
  FormlyFieldGoogleMapComponent,
  FormlyFieldImageCropperComponent,
  FormlyFieldNgSelectComponent,
  FormlyFieldStepperComponent,
  FormlyWrapperComponent,
  FullscreenImageViewerComponent,
  HeaderComponent,
  ImageComponent,
  LoadingIndicatorComponent,
  LoginFormComponent,
  LoginModalComponent,
  ObjectsInFieldComponent,
  ReadOnlyModeComponent,
  RefreshButtonComponent,
  TelescopeComponent,
  TextLoadingIndicatorComponent,
  ToggleButtonComponent,
  UsernameComponent
];

const services = [UsernameService];

@NgModule({
  imports: modules,
  declarations: components,
  exports: components,
  providers: [
    {
      provide: FORMLY_CONFIG,
      useFactory: formlyValidationConfig,
      multi: true,
      deps: [TranslateService]
    },
    ...services
  ]
})
export class ComponentsModule {}
