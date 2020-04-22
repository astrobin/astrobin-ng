import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/account/account.routing";
import { LoggedInPageComponent } from "@features/account/pages/logged-in-page/logged-in-page.component";
import { ComponentsModule } from "@lib/components/components.module";
import { AuthGuardService } from "@lib/services/guards/auth-guard.service";
import { TranslateModule } from "@ngx-translate/core";
import { LoggedOutPageComponent } from "./pages/logged-out-page/logged-out-page.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";

@NgModule({
  declarations: [LoginPageComponent, LoggedInPageComponent, LoggedOutPageComponent],
  imports: [CommonModule, ComponentsModule, RouterModule.forChild(routes), TranslateModule.forChild()],
  providers: [AuthGuardService]
})
export class AccountModule {}
