import { NgModule } from "@angular/core";
import { ConstellationsPageComponent } from "./pages/constellations-page/constellations-page.component";
import { SharedModule } from "@shared/shared.module";
import { RouterModule } from "@angular/router";
import { exploreRoutes } from "@features/explore/explore.routing";
import { SearchModule } from "@features/search/search.module";
import { IotdTpArchivePageComponent } from "./pages/iotd-tp-archive-page/iotd-tp-archive-page.component";
import { IotdTpArchiveItemComponent } from "./component/iotd-tp-archive-item/iotd-tp-archive-item.component";

@NgModule({
  declarations: [
    ConstellationsPageComponent,
    IotdTpArchivePageComponent,
    IotdTpArchiveItemComponent
  ],
  imports: [
    RouterModule.forChild(exploreRoutes),
    SharedModule,
    SearchModule
  ]
})
export class ExploreModule {
}
