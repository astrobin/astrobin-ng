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
import { SearchTelescopeTypeFilterComponent } from "@features/search/components/filters/search-telescope-type-filter/search-telescope-type-filter.component";
import { SearchCameraTypeFilterComponent } from "@features/search/components/filters/search-camera-type-filter/search-camera-type-filter.component";
import { SearchAcquisitionMonthsFilterComponent } from "@features/search/components/filters/search-acquisition-months-filter/search-acquisition-months-filter.component";
import { SearchRemoteSourceFilterComponent } from "@features/search/components/filters/search-remote-source-filter/search-remote-source-filter.component";
import { SearchSubjectTypeFilterComponent } from "@features/search/components/filters/search-subject-type-filter/search-subject-type-filter.component";
import { SearchColorOrMonoFilterComponent } from "@features/search/components/filters/search-color-or-mono-filter/search-color-or-mono-filter.component";
import { SearchModifiedCameraFilterComponent } from "@features/search/components/filters/search-modified-camera-filter/search-modified-camera-filter.component";
import { SearchAnimatedFilterComponent } from "@features/search/components/filters/search-animated-filter/search-animated-filter.component";
import { SearchVideoFilterComponent } from "@features/search/components/filters/search-video-filter/search-video-filter.component";
import { SearchAwardFilterComponent } from "@features/search/components/filters/search-award-filter/search-award-filter.component";
import { SearchCountryFilterComponent } from "@features/search/components/filters/search-country-filter/search-country-filter.component";
import { SearchDataSourceFilterComponent } from "@features/search/components/filters/search-data-source-filter/search-data-source-filter.component";
import { SearchMinimumDataFilterComponent } from "@features/search/components/filters/search-minimum-data-filter/search-minimum-data-filter.component";
import { SearchConstellationFilterComponent } from "@features/search/components/filters/search-constellation-filter/search-constellation-filter.component";
import { SearchBortleScaleFilterComponent } from "@features/search/components/filters/search-bortle-scale-filter/search-bortle-scale-filter.component";
import { SearchLicenseFilterComponent } from "@features/search/components/filters/search-license-filter/search-license-filter.component";
import { SearchCameraPixelSizeFilterComponent } from "@features/search/components/filters/search-camera-pixel-size-filter/search-camera-pixel-size-filter.component";
import { SearchFieldRadiusFilterComponent } from "@features/search/components/filters/search-field-radius-filter/search-field-radius-filter.component";
import { SearchPixelScaleFilterComponent } from "@features/search/components/filters/search-pixel-scale-filter/search-pixel-scale-filter.component";
import { SearchTelescopeDiameterFilterComponent } from "@features/search/components/filters/search-telescope-diameter-filter/search-telescope-diameter-filter.component";


const allFilterComponents = [
  SearchSubjectFilterComponent,
  SearchTelescopeFilterComponent,
  SearchCameraFilterComponent,
  SearchTelescopeTypeFilterComponent,
  SearchCameraTypeFilterComponent,
  SearchAcquisitionMonthsFilterComponent,
  SearchRemoteSourceFilterComponent,
  SearchSubjectTypeFilterComponent,
  SearchColorOrMonoFilterComponent,
  SearchModifiedCameraFilterComponent,
  SearchAnimatedFilterComponent,
  SearchVideoFilterComponent,
  SearchAwardFilterComponent,
  SearchCountryFilterComponent,
  SearchDataSourceFilterComponent,
  SearchMinimumDataFilterComponent,
  SearchConstellationFilterComponent,
  SearchBortleScaleFilterComponent,
  SearchLicenseFilterComponent,
  SearchCameraPixelSizeFilterComponent,
  SearchFieldRadiusFilterComponent,
  SearchPixelScaleFilterComponent,
  SearchTelescopeDiameterFilterComponent
];

@NgModule({
  declarations: [
    SearchPageComponent,
    SearchBarComponent,
    SearchFilterEditorModalComponent,
    SearchFilterSelectionModalComponent,
    ...allFilterComponents
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
      useValue: allFilterComponents
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
