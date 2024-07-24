import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { searchRoutes } from "@features/search/search.routing";
import { searchFeatureKey, searchReducer } from "@features/search/state/state.reducer";


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(searchRoutes),
    SharedModule,
    StoreModule.forFeature(searchFeatureKey, searchReducer)
  ]
})
export class SearchModule {
}
