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
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import {
  AUTO_COMPLETE_ONLY_FILTERS_TOKEN,
  SEARCH_FILTERS_TOKEN
} from "@features/search/injection-tokens/search-filter.tokens";
import { SearchService } from "@features/search/services/search.service";
import { TranslateService } from "@ngx-translate/core";


@NgModule({
  declarations: [
    SearchPageComponent,
    SearchBarComponent,
    SearchSubjectFilterComponent,
    SearchTelescopeFilterComponent,
    SearchCameraFilterComponent,
    SearchFilterEditorModalComponent,
    SearchFilterSelectionModalComponent
  ],
  imports: [
    RouterModule.forChild(searchRoutes),
    SharedModule,
    StoreModule.forFeature(searchFeatureKey, searchReducer)
  ],
  providers: [
    SearchService,
    {
      provide: SEARCH_FILTERS_TOKEN,
      useFactory: (translateService: TranslateService) => ({
        [translateService.instant("Subject")]: SearchSubjectFilterComponent,
        [translateService.instant("Telescope")]: SearchTelescopeFilterComponent,
        [translateService.instant("Camera")]: SearchCameraFilterComponent
      }),
      deps: [TranslateService]
    },
    {
      provide: AUTO_COMPLETE_ONLY_FILTERS_TOKEN,
      useValue: [
        SearchCameraFilterComponent,
        SearchTelescopeFilterComponent
      ]
    }
  ]
})
export class SearchModule {
}
