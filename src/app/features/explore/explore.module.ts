import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { exploreRoutes } from "@features/explore/explore.routing";
import { SharedModule } from "@shared/shared.module";

import { IotdTpArchiveItemComponent } from "./component/iotd-tp-archive-item/iotd-tp-archive-item.component";
import { AstrophotographersListPageComponent } from "./pages/astrophotographers-list-page/astrophotographers-list-page.component";
import { ConstellationsPageComponent } from "./pages/constellations-page/constellations-page.component";
import { IotdTpArchivePageComponent } from "./pages/iotd-tp-archive-page/iotd-tp-archive-page.component";

@NgModule({
  declarations: [
    ConstellationsPageComponent,
    IotdTpArchivePageComponent,
    IotdTpArchiveItemComponent,
    AstrophotographersListPageComponent
  ],
  imports: [RouterModule.forChild(exploreRoutes), SharedModule, FormsModule]
})
export class ExploreModule {}
