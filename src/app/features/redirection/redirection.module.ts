import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RedirectGuard } from "@features/redirection/guards/redirect-guard.service";
import { routes } from "@features/redirection/redirection.routing";
import { SharedModule } from "@shared/shared.module";
import { RedirectionPageComponent } from "./pages/redirection-page/redirection-page.component";

@NgModule({
  declarations: [RedirectionPageComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  providers: [RedirectGuard]
})
export class RedirectionModule {}
