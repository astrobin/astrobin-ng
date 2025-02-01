import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { searchRoutes } from "@features/search/search.routing";
import { searchFeatureKey, searchReducer } from "@features/search/state/state.reducer";
import { SearchPageComponent } from "./pages/search/search.page.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { SearchSubjectsFilterComponent } from "./components/filters/search-subject-filter/search-subjects-filter.component";
import { SearchFilterEditorModalComponent } from "./components/filters/search-filter-editor-modal/search-filter-editor-modal.component";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchFilterSelectionModalComponent } from "@features/search/components/filters/search-filter-selection-modal/search-filter-selection-modal.component";
import { SearchService } from "@core/services/search.service";
import { SearchTelescopeTypesFilterComponent } from "@features/search/components/filters/search-telescope-types-filter/search-telescope-types-filter.component";
import { SearchCameraTypesFilterComponent } from "@features/search/components/filters/search-camera-types-filter/search-camera-types-filter.component";
import { SearchAcquisitionMonthsFilterComponent } from "@features/search/components/filters/search-acquisition-months-filter/search-acquisition-months-filter.component";
import { SearchRemoteSourceFilterComponent } from "@features/search/components/filters/search-remote-source-filter/search-remote-source-filter.component";
import { SearchAcquisitionTypeFilterComponent } from "@features/search/components/filters/search-acquisition-type-filter/search-acquisition-type-filter.component";
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
import { SearchTelescopeWeightFilterComponent } from "@features/search/components/filters/search-telescope-weight-filter/search-telescope-weight-filter.component";
import { SearchMountWeightFilterComponent } from "@features/search/components/filters/search-mount-weight-filter/search-mount-weight-filter.component";
import { SearchMountMaxPayloadFilterComponent } from "@features/search/components/filters/search-mount-max-payload-filter/search-mount-max-payload-filter.component";
import { SearchTelescopeFocalLengthFilterComponent } from "@features/search/components/filters/search-telescope-focal-length-filter/search-telescope-focal-length-filter.component";
import { SearchIntegrationTimeFilterComponent } from "@features/search/components/filters/search-integration-time-filter/search-integration-time-filter.component";
import { SearchFilterTypesFilterComponent } from "@features/search/components/filters/search-filter-types-filter/search-filter-types-filter.component";
import { SearchSizeFilterComponent } from "@features/search/components/filters/search-size-filter/search-size-filter.component";
import { SearchDatePublishedFilterComponent } from "@features/search/components/filters/search-date-published-filter/search-date-published-filter.component";
import { SearchDateAcquiredFilterComponent } from "@features/search/components/filters/search-date-acquired-filter/search-date-acquired-filter.component";
import { SearchSubjectTypeFilterComponent } from "@features/search/components/filters/search-subject-type-filter/search-subject-type-filter.component";
import { SearchMoonPhaseFilterComponent } from "@features/search/components/filters/search-moon-phase-filter/search-moon-phase-filter.component";
import { SearchCoordsFilterComponent } from "@features/search/components/filters/search-coords-filter/search-coords-filter.component";
import { SearchImageSizeFilterComponent } from "@features/search/components/filters/search-image-size-filter/search-image-size-filter.component";
import { SearchGroupsFilterComponent } from "@features/search/components/filters/search-groups-filter/search-groups-filter.component";
import { SearchPersonalFiltersFilterComponent } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.component";
import { LoadSaveSearchModalComponent } from './components/filters/load-save-search-modal/load-save-search-modal.component';
import { SearchTextFilterComponent } from "@features/search/components/filters/search-text-filter/search-text-filter.component";
import { SearchMountFilterComponent } from "@features/search/components/filters/search-mount-filter/search-mount-filter.component";
import { SearchFilterFilterComponent } from "@features/search/components/filters/search-filter-filter/search-filter-filter.component";
import { SearchAccessoryFilterComponent } from "@features/search/components/filters/search-accessory-filter/search-accessory-filter.component";
import { SearchSoftwareFilterComponent } from "@features/search/components/filters/search-software-filter/search-software-filter.component";
import { SearchUsersFilterComponent } from "@features/search/components/filters/search-users-filter/search-users-filter.component";
import { SearchSensorFilterComponent } from "@features/search/components/filters/search-sensor-filter/search-sensor-filter.component";
import { SearchCollaborationFilterComponent } from "@features/search/components/filters/search-collaboration-filter/search-collaboration-filter.component";

const allFilterComponents = [
  SearchTextFilterComponent,
  SearchSubjectsFilterComponent,
  SearchTelescopeFilterComponent,
  SearchSensorFilterComponent,
  SearchCameraFilterComponent,
  SearchMountFilterComponent,
  SearchFilterFilterComponent,
  SearchAccessoryFilterComponent,
  SearchSoftwareFilterComponent,
  SearchTelescopeTypesFilterComponent,
  SearchCameraTypesFilterComponent,
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
  SearchTelescopeDiameterFilterComponent,
  SearchTelescopeWeightFilterComponent,
  SearchMountWeightFilterComponent,
  SearchMountMaxPayloadFilterComponent,
  SearchTelescopeFocalLengthFilterComponent,
  SearchIntegrationTimeFilterComponent,
  SearchFilterTypesFilterComponent,
  SearchSizeFilterComponent,
  SearchDatePublishedFilterComponent,
  SearchDateAcquiredFilterComponent,
  SearchAcquisitionTypeFilterComponent,
  SearchMoonPhaseFilterComponent,
  SearchCoordsFilterComponent,
  SearchImageSizeFilterComponent,
  SearchGroupsFilterComponent,
  SearchPersonalFiltersFilterComponent,
  SearchUsersFilterComponent,
  SearchCollaborationFilterComponent
];

@NgModule({
  declarations: [
    SearchPageComponent,
    SearchBarComponent,
    SearchFilterEditorModalComponent,
    SearchFilterSelectionModalComponent,
    ...allFilterComponents,
    LoadSaveSearchModalComponent
  ],
  imports: [
    RouterModule.forChild(searchRoutes),
    SharedModule,
    StoreModule.forFeature(searchFeatureKey, searchReducer)
  ]
})
export class SearchModule {
  constructor(searchService: SearchService) {
    searchService.registerAllFilters(allFilterComponents);
    searchService.registerAutoCompleteFilters([SearchTextFilterComponent]);
  }
}
