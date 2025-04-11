import { Routes } from "@angular/router";
import { GalleryExperienceGuard } from "@core/services/guards/gallery-experience-guard.service";
import { AstrophotographersListPageComponent } from "@features/explore/pages/astrophotographers-list-page/astrophotographers-list-page.component";
import { ConstellationsPageComponent } from "@features/explore/pages/constellations-page/constellations-page.component";
import { IotdTpArchivePageComponent } from "@features/explore/pages/iotd-tp-archive-page/iotd-tp-archive-page.component";

export const exploreRoutes: Routes = [
  {
    path: "constellations",
    component: ConstellationsPageComponent
  },
  {
    path: "iotd-tp-archive",
    component: IotdTpArchivePageComponent,
    canActivate: [GalleryExperienceGuard],
    data: {
      galleryExperienceGuard: {
        redirectOnlyWithImageParam: true
      }
    }
  },
  {
    path: "astrophotographers-list",
    component: AstrophotographersListPageComponent
  }
];
