import { NgModule } from "@angular/core";
import { ConstellationsPageComponent } from "./pages/constellations-page/constellations-page.component";
import { SharedModule } from "@shared/shared.module";
import { RouterModule } from "@angular/router";
import { exploreRoutes } from "@features/explore/explore.routing";
import { IotdTpArchivePageComponent } from "./pages/iotd-tp-archive-page/iotd-tp-archive-page.component";
import { IotdTpArchiveItemComponent } from "./component/iotd-tp-archive-item/iotd-tp-archive-item.component";
import { AstrophotographersListPageComponent } from "./pages/astrophotographers-list-page/astrophotographers-list-page.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    ConstellationsPageComponent,
    IotdTpArchivePageComponent,
    IotdTpArchiveItemComponent,
    AstrophotographersListPageComponent
  ],
  imports: [
    RouterModule.forChild(exploreRoutes),
    SharedModule,
    FormsModule
  ]
})
export class ExploreModule {
}
