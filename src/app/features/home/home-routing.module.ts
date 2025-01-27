import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ImageResolver } from "@shared/resolvers/image.resolver";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    resolve: {
      image: ImageResolver
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
