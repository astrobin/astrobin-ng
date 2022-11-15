import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ImageTestPageComponent } from "@features/dev/image-test-page/image-test-page.component";
import { NestedCommentsTestPageComponent } from "@features/dev/nested-comments-test-page/nested-comments-test-page.component";

const routes: Routes = [
  {
    path: "image",
    component: ImageTestPageComponent
  },
  {
    path: "nested-comments",
    component: NestedCommentsTestPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRoutingModule {
}
