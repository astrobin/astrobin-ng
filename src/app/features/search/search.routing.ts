import { Routes } from "@angular/router";
import { SearchPageComponent } from "@features/search/pages/search/search.page.component";
import { ImageResolver } from "@core/resolvers/image.resolver";

export const searchRoutes: Routes = [
  {
    path: "",
    component: SearchPageComponent,
    resolve: {
      image: ImageResolver
    }
  }
];
