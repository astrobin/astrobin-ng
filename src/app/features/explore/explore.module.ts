import { NgModule } from "@angular/core";
import { ConstellationsPageComponent } from "./pages/constellations-page/constellations-page.component";
import { SharedModule } from "@shared/shared.module";
import { RouterModule } from "@angular/router";
import { routes } from "@features/explore/explore.routing";
import { SSRExcludeModule } from "ngx-ssr-exclude";

@NgModule({
  declarations: [ConstellationsPageComponent],
  imports: [RouterModule.forChild(routes), SharedModule, SSRExcludeModule]
})
export class ExploreModule {
}
