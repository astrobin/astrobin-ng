import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ImageResolver } from "@core/resolvers/image.resolver";
import { GalleryExperienceGuard } from "@core/services/guards/gallery-experience-guard.service";

import { HomeComponent } from "./pages/home/home.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    canActivate: [GalleryExperienceGuard],
    resolve: {
      image: ImageResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
