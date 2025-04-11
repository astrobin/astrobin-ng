import { Routes } from "@angular/router";
import { AuthGuardService } from "@core/services/guards/auth-guard.service";
import { LoggedInPageComponent } from "@features/account/pages/logged-in-page/logged-in-page.component";
import { LoggingInPageComponent } from "@features/account/pages/logging-in-page/logging-in-page.component";
import { LoggingOutPageComponent } from "@features/account/pages/logging-out-page/logging-out-page.component";
import { LoginPageComponent } from "@features/account/pages/login-page/login-page.component";

export const routes: Routes = [
  { path: "login", component: LoginPageComponent },
  { path: "logged-in", component: LoggedInPageComponent, canActivate: [AuthGuardService] },
  { path: "logging-in", component: LoggingInPageComponent },
  { path: "logging-out", component: LoggingOutPageComponent }
];
