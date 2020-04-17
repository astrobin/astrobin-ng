import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbCollapseModule, NgbDropdownModule, NgbModalModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "../pipes/pipes.module";
import { LoginModalComponent } from "./auth/login-modal/login-modal.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { EmptyListComponent } from "./misc/empty-list/empty-list.component";

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbTooltipModule,
    PipesModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [EmptyListComponent, FooterComponent, HeaderComponent, LoginModalComponent],
  exports: [
    EmptyListComponent,
    FontAwesomeModule,
    FooterComponent,
    FormsModule,
    HeaderComponent,
    LoginModalComponent,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbTooltipModule,
    PipesModule,
    ReactiveFormsModule
  ],
  entryComponents: [LoginModalComponent]
})
export class ComponentsModule {}
