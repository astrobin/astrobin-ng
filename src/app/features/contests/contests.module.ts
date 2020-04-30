import { NgModule } from "@angular/core";
import { SharedModule } from "@shared/shared.module";
import { ContestsRoutingModule } from "./contests-routing.module";
import { ContestsListComponent } from "./pages/contests-list/contests-list.component";

@NgModule({
  declarations: [ContestsListComponent],
  imports: [ContestsRoutingModule, SharedModule]
})
export class ContestsModule {}
