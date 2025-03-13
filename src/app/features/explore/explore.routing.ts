import { Routes } from "@angular/router";
import { ConstellationsPageComponent } from "@features/explore/pages/constellations-page/constellations-page.component";
import { IotdTpArchivePageComponent } from "@features/explore/pages/iotd-tp-archive-page/iotd-tp-archive-page.component";
import { AstrophotographersListPageComponent } from "@features/explore/pages/astrophotographers-list-page/astrophotographers-list-page.component";

export const exploreRoutes: Routes = [
  {
    path: "constellations",
    component: ConstellationsPageComponent
  },
  {
    path: "iotd-tp-archive",
    component: IotdTpArchivePageComponent
  },
  {
    path: "astrophotographers-list",
    component: AstrophotographersListPageComponent
  }
];
