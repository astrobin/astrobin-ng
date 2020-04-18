import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/login/login.routing";
import { ComponentsModule } from "@lib/components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { LoginPageComponent } from "./pages/login-page/login-page.component";

@NgModule({
  declarations: [LoginPageComponent],
  imports: [CommonModule, ComponentsModule, RouterModule.forChild(routes), TranslateModule.forChild()]
})
export class LoginModule {}
