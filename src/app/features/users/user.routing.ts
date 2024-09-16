import { Routes } from "@angular/router";
import { UserGalleryComponent } from "@features/users/pages/gallery/user-gallery.component";
import { UserResolver } from "@features/users/resolvers/user.resolver";

export const userRoutes: Routes = [
  {
    path: ":username",
    component: UserGalleryComponent,
    resolve: {
      userData: UserResolver,
    }
  }
];
