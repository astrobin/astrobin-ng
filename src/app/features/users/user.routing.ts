import { Routes } from "@angular/router";
import { UserGalleryPageComponent } from "@features/users/pages/gallery/user-gallery-page.component";
import { UserResolver } from "@features/users/resolvers/user.resolver";
import { ImageResolver } from "@shared/resolvers/image.resolver";

export const userRoutes: Routes = [
  {
    path: ":username",
    component: UserGalleryPageComponent,
    resolve: {
      userData: UserResolver,
      image: ImageResolver
    }
  }
];
