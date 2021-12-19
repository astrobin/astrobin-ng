import { Routes } from "@angular/router";
import { LoggedInPageComponent } from "@features/account/pages/logged-in-page/logged-in-page.component";
import { LoggingOutPageComponent } from "@features/account/pages/logging-out-page/logging-out-page.component";
import { LoginPageComponent } from "@features/account/pages/login-page/login-page.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";

export let routes: Routes;
routes = [
  { path: "login", component: LoginPageComponent },
  { path: "logged-in", component: LoggedInPageComponent, canActivate: [AuthGuardService] },
  { path: "logging-out", component: LoggingOutPageComponent }
];
