import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ContestsListComponent } from "@features/contests/pages/contests-list/contests-list.component";

const routes: Routes = [
  {
    path: "",
    component: ContestsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContestsRoutingModule {}
