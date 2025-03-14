import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/account/account.routing";
import { LoggedInPageComponent } from "@features/account/pages/logged-in-page/logged-in-page.component";
import { SharedModule } from "@shared/shared.module";
import { LoggingOutPageComponent } from "./pages/logging-out-page/logging-out-page.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";
import { LoggingInPageComponent } from "@features/account/pages/logging-in-page/logging-in-page.component";
import { SettingsPageComponent } from "./pages/settings-page/settings-page.component";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    LoginPageComponent, 
    LoggedInPageComponent, 
    LoggingInPageComponent, 
    LoggingOutPageComponent,
    SettingsPageComponent
  ],
  imports: [
    RouterModule.forChild(routes), 
    SharedModule,
    NgbNavModule
  ]
})
export class AccountModule {
}
