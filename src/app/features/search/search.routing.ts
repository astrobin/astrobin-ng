import { Routes } from "@angular/router";
import { ImageResolver } from "@core/resolvers/image.resolver";
import { SearchPageComponent } from "@features/search/pages/search/search.page.component";

export const searchRoutes: Routes = [
  {
    path: "",
    component: SearchPageComponent,
    resolve: {
      image: ImageResolver
    }
  }
];
