import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgbCollapseModule, NgbDropdownModule, NgbModalModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { PipesModule } from "../pipes/pipes.module";
import { SharedModule } from "../shared.module";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { LoginModalComponent } from "./auth/login-modal/login-modal.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbTooltipModule,
    PipesModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
  ],
  declarations: [
    FooterComponent,
    HeaderComponent,
    LoginModalComponent,
  ],
  exports: [
    FormsModule,
    FooterComponent,
    HeaderComponent,
    LoginModalComponent,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbTooltipModule,
    PipesModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  entryComponents: [
    LoginModalComponent,
  ],
})
export class ComponentsModule {
}
