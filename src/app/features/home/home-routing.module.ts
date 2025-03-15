import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ImageResolver } from "@core/resolvers/image.resolver";
import { HomePageGuard } from "./guards/home-page.guard";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    canActivate: [HomePageGuard],
    resolve: {
      image: ImageResolver
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
