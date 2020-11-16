import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbCollapseModule, NgbDropdownModule, NgbModalModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule } from "@ngx-translate/core";
import { FormlyFieldChunkedFileAccessorDirective } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file-accessor.directive";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { NgxFilesizeModule } from "ngx-filesize";
import { UploadxModule } from "ngx-uploadx";
import { PipesModule } from "../pipes/pipes.module";
import { LoginFormComponent } from "./auth/login-form/login-form.component";
import { LoginModalComponent } from "./auth/login-modal/login-modal.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { EmptyListComponent } from "./misc/empty-list/empty-list.component";
import { ReadOnlyModeComponent } from "./misc/read-only-mode/read-only-mode.component";
import { UsernameComponent } from "./misc/username/username.component";

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbTooltipModule,
    NgxFilesizeModule,
    PipesModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    FormlyModule,
    UploadxModule
  ],
  declarations: [
    EmptyListComponent,
    FooterComponent,
    FormlyFieldChunkedFileAccessorDirective,
    FormlyFieldChunkedFileComponent,
    HeaderComponent,
    LoginFormComponent,
    LoginModalComponent,
    ReadOnlyModeComponent,
    UsernameComponent
  ],
  exports: [
    EmptyListComponent,
    FontAwesomeModule,
    FooterComponent,
    FormlyFieldChunkedFileComponent,
    FormsModule,
    HeaderComponent,
    LoginFormComponent,
    LoginModalComponent,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbTooltipModule,
    PipesModule,
    ReactiveFormsModule,
    ReadOnlyModeComponent,
    UsernameComponent
  ]
})
export class ComponentsModule {}
