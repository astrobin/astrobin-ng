import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { searchRoutes } from "@features/search/search.routing";
import { searchFeatureKey, searchReducer } from "@features/search/state/state.reducer";
import { SearchPageComponent } from "./pages/search/search.page.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { SearchSubjectFilterComponent } from "./components/filters/search-subject-filter/search-subject-filter.component";
import { SearchFilterEditorModalComponent } from "./components/filters/search-filter-editor-modal/search-filter-editor-modal.component";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";


@NgModule({
  declarations: [
    SearchPageComponent,
    SearchBarComponent,
    SearchSubjectFilterComponent,
    SearchTelescopeFilterComponent,
    SearchFilterEditorModalComponent
  ],
  imports: [
    RouterModule.forChild(searchRoutes),
    SharedModule,
    StoreModule.forFeature(searchFeatureKey, searchReducer)
  ]
})
export class SearchModule {
}
