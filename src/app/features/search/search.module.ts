import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { searchRoutes } from "@features/search/search.routing";
import { searchFeatureKey, searchReducer } from "@features/search/state/state.reducer";
import { SearchPageComponent } from "./pages/search/search.page.component";
import { SearchBarComponent } from './components/search-bar/search-bar.component';


@NgModule({
  declarations: [
    SearchPageComponent,
    SearchBarComponent
  ],
  imports: [
    RouterModule.forChild(searchRoutes),
    SharedModule,
    StoreModule.forFeature(searchFeatureKey, searchReducer)
  ]
})
export class SearchModule {
}
