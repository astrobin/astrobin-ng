import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { notFound404Routes } from "@features/not-found-404/not-found-404.routing";
import { SharedModule } from "@shared/shared.module";

import { NotFound404PageComponent } from "./pages/not-found-404-page/not-found-404-page.component";

@NgModule({
  declarations: [NotFound404PageComponent],
  imports: [RouterModule.forChild(notFound404Routes), SharedModule]
})
export class NotFound404Module {}
