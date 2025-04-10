import { Routes } from "@angular/router";
import { ImageResolver } from "@core/resolvers/image.resolver";
import { GalleryExperienceGuard } from "@core/services/guards/gallery-experience-guard.service";
import { UserGalleryPageComponent } from "@features/users/pages/gallery/user-gallery-page.component";
import { UserResolver } from "@features/users/resolvers/user.resolver";

export const userRoutes: Routes = [
  {
    path: ":username",
    component: UserGalleryPageComponent,
    canActivate: [GalleryExperienceGuard],
    resolve: {
      userData: UserResolver,
      image: ImageResolver
    }
  }
];
