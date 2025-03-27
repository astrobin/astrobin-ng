import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/account/account.routing";
import { LoggedInPageComponent } from "@features/account/pages/logged-in-page/logged-in-page.component";
import { SharedModule } from "@shared/shared.module";
import { LoggingOutPageComponent } from "./pages/logging-out-page/logging-out-page.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";
import { LoggingInPageComponent } from "@features/account/pages/logging-in-page/logging-in-page.component";

@NgModule({
  declarations: [
    LoginPageComponent, 
    LoggedInPageComponent, 
    LoggingInPageComponent, 
    LoggingOutPageComponent
  ],
  imports: [
    RouterModule.forChild(routes), 
    SharedModule
  ]
})
export class AccountModule {
}
