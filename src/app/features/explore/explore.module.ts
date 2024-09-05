import { NgModule } from "@angular/core";
import { ConstellationsPageComponent } from "./pages/constellations-page/constellations-page.component";
import { SharedModule } from "@shared/shared.module";
import { RouterModule } from "@angular/router";
import { exploreRoutes } from "@features/explore/explore.routing";
import { SSRExcludeModule } from "ngx-ssr-exclude";
import { SearchModule } from "@features/search/search.module";

@NgModule({
  declarations: [ConstellationsPageComponent],
  imports: [
    RouterModule.forChild(exploreRoutes),
    SharedModule,
    SearchModule,
    SSRExcludeModule
  ]
})
export class ExploreModule {
}
