import { Routes } from "@angular/router";
import { ConstellationsPageComponent } from "@features/explore/pages/constellations-page/constellations-page.component";

export const exploreRoutes: Routes = [
  {
    path: "constellations",
    component: ConstellationsPageComponent
  }
];
