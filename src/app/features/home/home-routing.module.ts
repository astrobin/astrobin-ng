import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ImageResolver } from "@core/resolvers/image.resolver";
import { GalleryExperienceGuard } from "@core/services/guards/gallery-experience-guard.service";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    canActivate: [GalleryExperienceGuard],
    resolve: {
      image: ImageResolver
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
