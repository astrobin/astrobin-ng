import { NgModule } from "@angular/core";
import { ConstellationsPageComponent } from "./pages/constellations-page/constellations-page.component";
import { SharedModule } from "@shared/shared.module";
import { RouterModule } from "@angular/router";
import { routes } from "@features/explore/explore.routing";

@NgModule({
  declarations: [ConstellationsPageComponent],
  imports: [RouterModule.forChild(routes), SharedModule]
})
export class ExploreModule {}
