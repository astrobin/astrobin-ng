import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { ComponentRef, Injectable, Type, ViewContainerRef } from "@angular/core";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { map, tap } from "rxjs/operators";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { SearchFilterCategory, SearchFilterComponentInterface } from "@core/interfaces/search-filter-component.interface";
import { DynamicSearchFilterLoaderService } from "@features/search/services/dynamic-search-filter-loader.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { CameraService } from "@features/equipment/services/camera.service";
import { DateService } from "@core/services/date.service";
import { Month } from "@core/enums/month.enum";
import { MatchType } from "@features/search/enums/match-type.enum";
import { AcquisitionType, DataSource, LicenseOptions, RemoteSource, SolarSystemSubjectType, SubjectType } from "@core/interfaces/image.interface";
import { ImageService } from "@core/services/image/image.service";
import { ColorOrMono, SensorInterface } from "@features/equipment/types/sensor.interface";
import { SensorService } from "@features/equipment/services/sensor.service";
import { CountryService } from "@core/services/country.service";
import { SearchMinimumDataFilterValue } from "@features/search/components/filters/search-minimum-data-filter/search-minimum-data-filter.value";
import { SearchAwardFilterValue } from "@features/search/components/filters/search-award-filter/search-award-filter.value";
import { ConstellationsService } from "@features/explore/services/constellations.service";
import { BortleScale } from "@core/interfaces/deep-sky-acquisition.interface";
import { FilterInterface, FilterType } from "@features/equipment/types/filter.interface";
import { FilterService } from "@features/equipment/services/filter.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchPersonalFiltersFilterValue } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.value";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { UtilsService } from "@core/services/utils/utils.service";
import { SearchPaginatedApiResultInterface } from "@core/services/api/interfaces/search-paginated-api-result.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { COMMON_OBJECTS } from "@core/services/solution/solution.service";
import { SearchTelescopeFilterComponent } from "@features/search/components/filters/search-telescope-filter/search-telescope-filter.component";
import { SearchSensorFilterComponent } from "@features/search/components/filters/search-sensor-filter/search-sensor-filter.component";
import { SearchCameraFilterComponent } from "@features/search/components/filters/search-camera-filter/search-camera-filter.component";
import { SearchMountFilterComponent } from "@features/search/components/filters/search-mount-filter/search-mount-filter.component";
import { SearchFilterFilterComponent } from "@features/search/components/filters/search-filter-filter/search-filter-filter.component";
import { SearchAccessoryFilterComponent } from "@features/search/components/filters/search-accessory-filter/search-accessory-filter.component";
import { SearchSoftwareFilterComponent } from "@features/search/components/filters/search-software-filter/search-software-filter.component";
import { SearchSubjectsFilterComponent } from "@features/search/components/filters/search-subject-filter/search-subjects-filter.component";
import { SearchTelescopeTypesFilterComponent } from "@features/search/components/filters/search-telescope-types-filter/search-telescope-types-filter.component";
import { SearchCameraTypesFilterComponent } from "@features/search/components/filters/search-camera-types-filter/search-camera-types-filter.component";
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
import { SearchFilterTypesFilterComponent } from "@features/search/components/filters/search-filter-types-filter/search-filter-types-filter.component";
import { SearchAcquisitionTypeFilterComponent } from "@features/search/components/filters/search-acquisition-type-filter/search-acquisition-type-filter.component";
import { SearchPersonalFiltersFilterComponent } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.component";
import { SearchUsersFilterComponent } from "@features/search/components/filters/search-users-filter/search-users-filter.component";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { SearchAutoCompleteItem } from "@features/search/interfaces/search-auto-complete-item.interface";
import { CookieService } from "ngx-cookie";

export const SEARCH_SETTINGS_SIMPLE_MODE_COOKIE = "astrobin-search-settings-simple-mode";

@Injectable({
  providedIn: "root"
})
export class SearchService extends BaseService {
  static readonly DEFAULT_PAGE_SIZE = 100;

  searchCompleteSubject: Subject<SearchPaginatedApiResultInterface<any>> =
    new Subject<SearchPaginatedApiResultInterface<any>>();
  searchComplete$: Observable<SearchPaginatedApiResultInterface<any>>;

  simpleModeChanges$: Observable<boolean>;

  private _autoCompleteItemsLimit = 15;
  private _autoCompleteTelescopeCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteSensorCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteCameraCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteMountCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteFilterCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteAccessoryCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteSoftwareCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteOnlyFilters: Type<SearchFilterComponentInterface>[] = [];
  private _simpleMode: boolean;
  private _simpleModeChangesSubject: Subject<boolean> = new Subject();

  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly dynamicSearchFilterLoaderService: DynamicSearchFilterLoaderService,
    public readonly telescopeService: TelescopeService,
    public readonly cameraService: CameraService,
    public readonly dateService: DateService,
    public readonly imageService: ImageService,
    public readonly sensorService: SensorService,
    public readonly countryService: CountryService,
    public readonly constellationService: ConstellationsService,
    public readonly filterService: FilterService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal,
    public readonly commonApiService: CommonApiService,
    public readonly searchFilterService: SearchFilterService,
    public readonly cookieService: CookieService
  ) {
    super(loadingService);

    this.searchComplete$ = this.searchCompleteSubject.asObservable();
    this._simpleMode = this.cookieService.get(SEARCH_SETTINGS_SIMPLE_MODE_COOKIE) === "true";
    this.simpleModeChanges$ = this._simpleModeChangesSubject.asObservable();
  }

  private _allFiltersTypes: Type<SearchFilterComponentInterface>[] = [];

  get allFiltersTypes(): Type<SearchFilterComponentInterface>[] {
    return this._allFiltersTypes;
  }

  get autoCompleteOnlyFiltersTypes(): Type<SearchFilterComponentInterface>[] {
    return this._autoCompleteOnlyFilters;
  }

  registerAllFilters(filters: Type<SearchFilterComponentInterface>[]) {
    this._allFiltersTypes = filters;
  }

  registerAutoCompleteFilters(filters: Type<SearchFilterComponentInterface>[]) {
    this._autoCompleteOnlyFilters = filters;
  }

  modelToParams(model: SearchModelInterface): string {
    if (model.page === undefined) {
      model = { ...model, page: 1 };
    }

    if (model.pageSize === undefined) {
      model = { ...model, pageSize: SearchService.DEFAULT_PAGE_SIZE };
    }

    if (model.text?.value === undefined) {
      model = {
        ...model,
        text: {
          value: "",
          matchType: MatchType.ALL,
          onlySearchInTitlesAndDescriptions: this.isSimpleMode()
        }
      };
    }

    const queryString = UtilsService.toQueryString(model);
    const compressedQueryString = UtilsService.compressQueryString(queryString);
    return encodeURIComponent(compressedQueryString);
  }

  paramsToModel(params: string): SearchModelInterface {
    const decompressedParams = UtilsService.decompressQueryString(params);
    const parsedParams = UtilsService.parseQueryString(decodeURIComponent(decompressedParams));

    // Convert JSON strings back to objects where applicable
    Object.keys(parsedParams).forEach(key => {
      if (typeof parsedParams[key] === "string") {
        try {
          parsedParams[key] = JSON.parse(parsedParams[key]);
        } catch (error) {
          // If JSON parsing fails, keep the value as string
        }
      }
    });

    return parsedParams;
  }

  instantiateFilterComponent(
    componentType: Type<SearchFilterComponentInterface>,
    value: any,
    filterContainer: ViewContainerRef
  ): ComponentRef<SearchFilterComponentInterface> {
    return this.dynamicSearchFilterLoaderService.loadComponent(componentType, value, filterContainer);
  }

  getFilterComponentTypeByKey(key: string): Type<SearchFilterComponentInterface> {
    return this.allFiltersTypes.find(filterType => (filterType as any).key === key);
  }

  getKeyByFilterComponentType(componentType: Type<SearchFilterComponentInterface>): string {
    return (componentType as any).key;
  }

  humanizeSearchFilterCategory(category: SearchFilterCategory): string {
    switch (category) {
      case SearchFilterCategory.DATETIME:
        return this.translateService.instant("Date and time");
      case SearchFilterCategory.FILE_ATTRIBUTES:
        return this.translateService.instant("File attributes");
      case SearchFilterCategory.EQUIPMENT:
        return this.translateService.instant("Equipment");
      case SearchFilterCategory.EQUIPMENT_ATTRIBUTES:
        return this.translateService.instant("Equipment attributes");
      case SearchFilterCategory.SKY_AND_SUBJECTS:
        return this.translateService.instant("Sky and subjects");
      case SearchFilterCategory.ACQUISITION_ATTRIBUTES:
        return this.translateService.instant("Acquisition attributes");
      case SearchFilterCategory.GENERAL:
        return this.translateService.instant("General");
    }
  }

  magicAutocomplete$(query: string): Observable<SearchAutoCompleteItem> {
    const normalizeLabel = (label: string) => label.toLowerCase().replace(/\s/g, "");
    const normalizedQuery = normalizeLabel(query);
    const observables$ = this.autoCompleteMethods(query)
      .filter(filter => filter.key !== SearchAutoCompleteType.USERS)
      .map(filter => filter.method);

    let foundItem: SearchAutoCompleteItem;

    return forkJoin(observables$).pipe(
      map((results: SearchAutoCompleteItem[][]) => {
        results.forEach(group => {
          group.forEach(item => {
            if (item.type !== SearchAutoCompleteType.TEXT) {
              const normalizedLabel = normalizeLabel(item.label);
              if (
                normalizedLabel === normalizedQuery ||
                (
                  item.aliases &&
                  item.aliases.some(alias => normalizeLabel(alias) === normalizedQuery)
                )
              ) {
                foundItem = item;
              }
            }
          });
        });

        return foundItem;
      })
    );
  }

  autoCompleteMethods(query: string): { key: SearchAutoCompleteType, method: Observable<SearchAutoCompleteItem[]> }[] {
    return [
      {
        key: SearchAutoCompleteType.SEARCH_FILTER,
        method: this.autoCompleteSearchFilters$(query)
      },
      {
        key: SearchTelescopeFilterComponent.key,
        method: this.autoCompleteTelescopes$(query)
      },
      {
        key: SearchSensorFilterComponent.key,
        method: this.autoCompleteSensors$(query)
      },
      {
        key: SearchCameraFilterComponent.key,
        method: this.autoCompleteCameras$(query)
      },
      {
        key: SearchMountFilterComponent.key,
        method: this.autoCompleteMounts$(query)
      },
      {
        key: SearchFilterFilterComponent.key,
        method: this.autoCompleteFilters$(query)
      },
      {
        key: SearchAccessoryFilterComponent.key,
        method: this.autoCompleteAccessories$(query)
      },
      {
        key: SearchSoftwareFilterComponent.key,
        method: this.autoCompleteSoftware$(query)
      },
      {
        key: SearchSubjectsFilterComponent.key,
        method: this.autoCompleteSubjects$(query)
      },
      {
        key: SearchTelescopeTypesFilterComponent.key,
        method: this.autoCompleteTelescopeTypes$(query)
      },
      {
        key: SearchCameraTypesFilterComponent.key,
        method: this.autoCompleteCameraTypes$(query)
      },
      {
        key: SearchAcquisitionMonthsFilterComponent.key,
        method: this.autoCompleteMonths$(query)
      },
      {
        key: SearchRemoteSourceFilterComponent.key,
        method: this.autoCompleteRemoteSources$(query)
      },
      {
        key: SearchSubjectTypeFilterComponent.key,
        method: this.autoCompleteSubjectTypes$(query)
      },
      {
        key: SearchColorOrMonoFilterComponent.key,
        method: this.autoCompleteColorOrMono$(query)
      },
      {
        key: SearchModifiedCameraFilterComponent.key,
        method: this.autoCompleteModifiedCamera$(query)
      },
      {
        key: SearchAnimatedFilterComponent.key,
        method: this.autoCompleteAnimated$(query)
      },
      {
        key: SearchVideoFilterComponent.key,
        method: this.autoCompleteVideos$(query)
      },
      {
        key: SearchAwardFilterComponent.key,
        method: this.autoCompleteAward$(query)
      },
      {
        key: SearchCountryFilterComponent.key,
        method: this.autoCompleteCountries$(query)
      },
      {
        key: SearchDataSourceFilterComponent.key,
        method: this.autoCompleteDataSources$(query)
      },
      {
        key: SearchMinimumDataFilterComponent.key,
        method: this.autoCompleteMinimumData$(query)
      },
      {
        key: SearchConstellationFilterComponent.key,
        method: this.autoCompleteConstellations$(query)
      },
      {
        key: SearchBortleScaleFilterComponent.key,
        method: this.autoCompleteBortleScale$(query)
      },
      {
        key: SearchLicenseFilterComponent.key,
        method: this.autoCompleteLicenseOptions$(query)
      },
      {
        key: SearchFilterTypesFilterComponent.key,
        method: this.autoCompleteFilterTypes$(query)
      },
      {
        key: SearchAcquisitionTypeFilterComponent.key,
        method: this.autoCompleteAcquisitionTypes$(query)
      },
      {
        key: SearchPersonalFiltersFilterComponent.key,
        method: this.autoCompletePersonalFilters$(query)
      },
      {
        key: SearchUsersFilterComponent.key,
        method: this.autoCompleteUsers$(query)
      },
      {
        key: SearchAutoCompleteType.TEXT,
        method: this.autoCompleteFreeText$(query)
      },
      {
        key: SearchAutoCompleteType.COLLABORATION,
        method: this.autoCompleteCollaboration$(query)
      }
    ];
  }

  autoCompleteFreeText$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (!query) {
      return of([]);
    }

    return of([
      {
        type: SearchAutoCompleteType.TEXT,
        label: query,
        value: {
          value: query,
          matchType: query.includes(" ") ? MatchType.ALL : undefined
        }
      }
    ]);
  }

  autoCompleteSearchFilters$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      this.allFiltersTypes
        .filter(filterType => !this.autoCompleteOnlyFiltersTypes.includes(filterType))
        .filter(filterType =>
          this.searchFilterService.humanizeSearchAutoCompleteType((filterType as any).key)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .map(filterType => {
          return {
            type: SearchAutoCompleteType.SEARCH_FILTER,
            label: this.searchFilterService.humanizeSearchAutoCompleteType((filterType as any).key),
            value: (filterType as any).key,
            minimumSubscription: (filterType as any).minimumSubscription
          };
        })
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteSubjects$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (!query) {
      return of([]);
    }

    const messierRange = Array.from({ length: 110 }, (_, i) => i + 1);
    const ngcRange = Array.from({ length: 7840 }, (_, i) => i + 1);
    const icRange = Array.from({ length: 5386 }, (_, i) => i + 1);
    const sh2Range = Array.from({ length: 313 }, (_, i) => i + 1);
    const ldnRange = Array.from({ length: 1802 }, (_, i) => i + 1);
    const lbnRange = Array.from({ length: 1125 }, (_, i) => i + 1);
    const vdbRange = Array.from({ length: 159 }, (_, i) => i + 1);

    const subjects = [
      ...messierRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `M ${i}`
      })),
      ...ngcRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `NGC ${i}`
      })),
      ...icRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `IC ${i}`
      })),
      ...sh2Range.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `Sh2-${i}`
      })),
      ...ldnRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `LDN ${i}`
      })),
      ...lbnRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `LBN ${i}`
      })),
      ...vdbRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label: `VDB ${i}`
      }))
    ];

    subjects.push(
      ...COMMON_OBJECTS.map(label => ({
        type: SearchAutoCompleteType.SUBJECTS,
        label
      }))
    );

    return new Observable<SearchAutoCompleteItem[]>(subscriber => {
      const normalizedQuery = query.replace(/\s+/g, "").toLowerCase();
      const filteredSubjects = subjects
        .filter(subject => subject.label.replace(/\s+/g, "").toLowerCase().includes(normalizedQuery))
        .map(subjects => (
          {
            ...subjects,
            value: {
              value: [subjects.label],
              matchType: null
            }
          }
        ))
        .slice(0, this._autoCompleteItemsLimit);
      subscriber.next(filteredSubjects);
      subscriber.complete();
    });
  }

  autoCompleteTelescopes$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteTelescopeCache[query]) {
      return of(this._autoCompleteTelescopeCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.TELESCOPE, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<TelescopeInterface>) => {
            return response.results.map(telescope => {
              const label = `${telescope.brandName || this.translateService.instant("(DIY)")} ${telescope.name}`;
              const value = {
                id: telescope.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.TELESCOPE,
                label,
                value: {
                  value: [value],
                  exactMatch: true,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.TELESCOPE)
              };
            });
          }),
          tap(items => {
            this._autoCompleteTelescopeCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteSensors$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteSensorCache[query]) {
      return of(this._autoCompleteSensorCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.SENSOR, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<SensorInterface>) => {
            return response.results.map(sensor => {
              const label = `${sensor.brandName || this.translateService.instant("(DIY)")} ${sensor.name}`;
              const value = {
                id: sensor.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.SENSOR,
                label,
                value: {
                  value: [value],
                  exactMatch: true,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.SENSOR)
              };
            });
          }),
          tap(items => {
            this._autoCompleteSensorCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteCameras$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteCameraCache[query]) {
      return of(this._autoCompleteCameraCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.CAMERA, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<CameraInterface>) => {
            return response.results.map(camera => {
              const label = `${camera.brandName || this.translateService.instant("(DIY)")} ${camera.name}`;
              const value = {
                id: camera.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.CAMERA,
                label,
                value: {
                  value: [value],
                  exactMatch: true,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.CAMERA)
              };
            });
          }),
          tap(items => {
            this._autoCompleteCameraCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteMounts$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteMountCache[query]) {
      return of(this._autoCompleteMountCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.MOUNT, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<MountInterface>) => {
            return response.results.map(mount => {
              const label = `${mount.brandName || this.translateService.instant("(DIY)")} ${mount.name}`;
              const value = {
                id: mount.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.MOUNT,
                label,
                value: {
                  value: [value],
                  exactMatch: true,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.MOUNT)
              };
            });
          }),
          tap(items => {
            this._autoCompleteMountCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteFilters$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteFilterCache[query]) {
      return of(this._autoCompleteFilterCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.FILTER, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<FilterInterface>) => {
            return response.results.map(filter => {
              const label = `${filter.brandName || this.translateService.instant("(DIY)")} ${filter.name}`;
              const value = {
                id: filter.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.FILTER,
                label,
                value: {
                  value: [value],
                  exactMatch: false,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.FILTER)
              };
            });
          }),
          tap(items => {
            this._autoCompleteFilterCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteAccessories$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteAccessoryCache[query]) {
      return of(this._autoCompleteFilterCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.ACCESSORY, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<AccessoryInterface>) => {
            return response.results.map(accessory => {
              const label = `${accessory.brandName || this.translateService.instant("(DIY)")} ${accessory.name}`;
              const value = {
                id: accessory.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.ACCESSORY,
                label,
                value: {
                  value: [value],
                  exactMatch: false,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.ACCESSORY)
              };
            });
          }),
          tap(items => {
            this._autoCompleteFilterCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteSoftware$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteSoftwareCache[query]) {
      return of(this._autoCompleteFilterCache[query]);
    }

    return new Observable<SearchAutoCompleteItem[]>(observer => {
      observer.next(null); // Indicates loading.

      this.equipmentApiService
        .findAllEquipmentItems(EquipmentItemType.SOFTWARE, {
          query,
          limit: this._autoCompleteItemsLimit
        })
        .pipe(
          map((response: PaginatedApiResultInterface<SoftwareInterface>) => {
            return response.results.map(software => {
              const label = `${software.brandName || this.translateService.instant("(DIY)")} ${software.name}`;
              const value = {
                id: software.id,
                name: label
              };

              return {
                type: SearchAutoCompleteType.SOFTWARE,
                label,
                value: {
                  value: [value],
                  exactMatch: false,
                  matchType: null
                },
                minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.SOFTWARE)
              };
            });
          }),
          tap(items => {
            this._autoCompleteFilterCache[query] = items;
          })
        ).subscribe(items => {
        observer.next(items);
        observer.complete();
      });
    });
  }

  autoCompleteTelescopeTypes$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(TelescopeType)
        .map(type => ({
          type,
          humanized: this.telescopeService.humanizeType(type)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.TELESCOPE_TYPES,
          label: item.humanized,
          value: {
            value: [item.type],
            matchType: null
          },
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.TELESCOPE_TYPES)
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteCameraTypes$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(CameraType)
        .map(type => ({
          type,
          humanized: this.cameraService.humanizeType(type)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.CAMERA_TYPES,
          label: item.humanized,
          value: {
            value: [item.type],
            matchType: null
          },
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.CAMERA_TYPES)
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteMonths$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(Month)
        .map(month => ({
          month,
          humanized: this.dateService.humanizeMonth(month)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.ACQUISITION_MONTHS,
          label: item.humanized,
          value: {
            value: [item.month],
            matchType: null
          }
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteRemoteSources$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.entries(RemoteSource)
        .filter(([_, humanized]) => this._autoCompleteMatch(query, humanized))
        .map(([source, humanized]) => ({
          type: SearchAutoCompleteType.REMOTE_SOURCE,
          label: humanized,
          value: source
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteSubjectTypes$(query: string): Observable<SearchAutoCompleteItem[]> {
    const aliases = {
      [SubjectType.DEEP_SKY]: ["DSO", this.translateService.instant("Deep sky")],
      [SubjectType.SOLAR_SYSTEM]: [this.translateService.instant("Solar system")],
      [SubjectType.NORTHERN_LIGHTS]: [this.translateService.instant("Aurora")],
      [SubjectType.GEAR]: [this.translateService.instant("Equipment")],
      [SolarSystemSubjectType.MOON]: [this.translateService.instant("Moon")]
    };

    // Process SubjectType entries
    const subjectTypeItems = Object.values(SubjectType)
      .map(type => ({
        type,
        humanized: this.imageService.humanizeSubjectType(type)
      }))
      .filter(item => this._autoCompleteMatch(query, item.humanized))
      .map(item => ({
        type: SearchAutoCompleteType.SUBJECT_TYPE,
        label: item.humanized,
        aliases: aliases[item.type],
        value: item.type
      }));

    // Process SolarSystemSubjectType entries
    const solarSystemSubjectTypeItems = Object.values(SolarSystemSubjectType)
      .map(type => ({
        type,
        humanized: this.imageService.humanizeSolarSystemSubjectType(type)
      }))
      .filter(item => this._autoCompleteMatch(query, item.humanized))
      .map(item => ({
        type: SearchAutoCompleteType.SUBJECT_TYPE,
        label: item.humanized,
        aliases: aliases[item.type],
        value: item.type
      }));

    // Concatenate both arrays and return as an observable
    const autoCompleteItems = [...subjectTypeItems, ...solarSystemSubjectTypeItems].slice(
      0,
      this._autoCompleteItemsLimit
    );
    return of(autoCompleteItems);
  }

  autoCompleteColorOrMono$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(ColorOrMono)
        .map(type => ({
          type,
          humanized: this.sensorService.humanizeColorOrMono(type)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.COLOR_OR_MONO,
          label: item.humanized,
          value: {
            value: [item.type],
            matchType: null
          }
        }))
    );
  }

  autoCompleteModifiedCamera$(query: string): Observable<SearchAutoCompleteItem[]> {
    return this._autoCompleteYesNo$(query, SearchAutoCompleteType.MODIFIED_CAMERA).pipe(
      map(value => (
        value.map(item => ({
            ...item,
            minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.MODIFIED_CAMERA)
          })
        )
      ))) as Observable<SearchAutoCompleteItem[]>;
  }

  autoCompleteAnimated$(query: string): Observable<SearchAutoCompleteItem[]> {
    return this._autoCompleteYesNo$(query, SearchAutoCompleteType.ANIMATED).pipe(
      map(value => (
        value.map(item => ({
            ...item,
            minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.ANIMATED)
          })
        )
      ))) as Observable<SearchAutoCompleteItem[]>;
  }

  autoCompleteVideos$(query: string): Observable<SearchAutoCompleteItem[]> {
    return this._autoCompleteYesNo$(query, SearchAutoCompleteType.VIDEO).pipe(
      map(value => (
        value.map(item => ({
            ...item,
            minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.VIDEO)
          })
        )
      ))) as Observable<SearchAutoCompleteItem[]>;
  }

  autoCompleteAward$(query: string): Observable<SearchAutoCompleteItem[]> {
    const awardTypes: { [key: string]: string[] } = {
      [SearchAwardFilterValue.IOTD]: ["IOTD", this.translateService.instant("Image of the day")],
      [SearchAwardFilterValue.TOP_PICK]: ["TP", this.translateService.instant("Top Pick")],
      [SearchAwardFilterValue.TOP_PICK_NOMINATION]: ["TPN", this.translateService.instant("Top Pick Nomination")]
    };

    return of(
      Object.entries(awardTypes)
        .filter(([_, humanized]) => humanized.some(x => this._autoCompleteMatch(query, x)))
        .map(([award, humanized]) => ({
          type: SearchAutoCompleteType.AWARD,
          label: humanized[1],
          value: [award],
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.AWARD)
        }))
    );
  }

  autoCompleteCountries$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      this.countryService
        .getCountries(this.translateService.currentLang)
        .filter(country => this._autoCompleteMatch(query, country.name))
        .map(country => ({
          type: SearchAutoCompleteType.COUNTRY,
          label: country.name,
          value: country.code,
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.COUNTRY)
        }))
    );
  }

  autoCompleteDataSources$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(DataSource)
        .map(source => ({
          source,
          humanized: this.imageService.humanizeDataSource(source)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.DATA_SOURCE,
          label: item.humanized,
          value: item.source,
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.DATA_SOURCE)
        }))
    );
  }

  autoCompleteMinimumData$(query: string): Observable<SearchAutoCompleteItem[]> {
    const values = [
      { [SearchMinimumDataFilterValue.TELESCOPES]: this.translateService.instant("Imaging telescopes or lenses") },
      { [SearchMinimumDataFilterValue.CAMERAS]: this.translateService.instant("Imaging cameras") },
      { [SearchMinimumDataFilterValue.ACQUISITION_DETAILS]: this.translateService.instant("Acquisition details") },
      { [SearchMinimumDataFilterValue.ASTROMETRY]: this.translateService.instant("Astrometry") }
    ];

    return of(
      values
        .map(item => ({
          type: SearchAutoCompleteType.MINIMUM_DATA,
          label: Object.values(item)[0],
          value: Object.keys(item)[0],
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.MINIMUM_DATA)
        }))
        .filter(item => this._autoCompleteMatch(query, item.label))
    );
  }

  autoCompleteConstellations$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      this.constellationService
        .getConstellations(this.translateService.currentLang)
        .filter(constellation =>
          this._autoCompleteMatch(query, `${constellation.name} (${constellation.id})`)
        )
        .map(constellation => ({
          type: SearchAutoCompleteType.CONSTELLATION,
          label: `${constellation.name} (${constellation.id})`,
          value: constellation.id,
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.CONSTELLATION)
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteBortleScale$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(BortleScale)
        .map(scale => ({
          scale,
          humanized: this.imageService.humanizeBortleScale(scale as BortleScale)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.BORTLE_SCALE,
          label: item.humanized,
          value: {
            min: item.scale,
            max: BortleScale.NINE
          },
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.BORTLE_SCALE)
        }))
    );
  }

  autoCompleteLicenseOptions$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(LicenseOptions)
        .map(option => ({
          option,
          humanized: this.imageService.humanizeLicenseOption(option)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.LICENSES,
          label: item.humanized,
          value: [item.option],
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.LICENSES)
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteFilterTypes$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(FilterType)
        .map(type => ({
          type,
          humanized: this.filterService.humanizeType(type)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.FILTER_TYPES,
          label: item.humanized,
          value: {
            value: [item.type],
            matchType: null
          },
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.FILTER_TYPES)
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteAcquisitionTypes$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(AcquisitionType)
        .map(type => ({
          type,
          humanized: this.imageService.humanizeAcquisitionType(type)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.ACQUISITION_TYPE,
          label: item.humanized,
          value: item.type,
          minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.ACQUISITION_TYPE)
        }))
    );
  }

  autoCompletePersonalFilters$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(SearchPersonalFiltersFilterValue)
        .map(type => ({
          type,
          humanized: this.searchFilterService.humanizePersonalFilter(type)
        }))
        .filter(item => this._autoCompleteMatch(query, item.humanized))
        .map(item => ({
          type: SearchAutoCompleteType.PERSONAL_FILTERS,
          label: item.humanized,
          value: {
            value: [item.type],
            matchType: null
          }
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteUsers$(query: string): Observable<SearchAutoCompleteItem[]> {
    return this.commonApiService.findUserProfiles(query).pipe(
      map((userProfiles: UserProfileInterface[]) =>
        userProfiles
          .map(userProfile => {
            const name = userProfile.realName ? `${userProfile.realName} (${userProfile.username})` : userProfile.username;
            return ({
              type: SearchAutoCompleteType.USERS,
              label: name,
              value: {
                value: [{
                  id: userProfile.user,
                  name
                }],
                matchType: null
              }
            });
          })
          .slice(0, this._autoCompleteItemsLimit)
      )
    );
  }

  autoCompleteCollaboration$(query: string): Observable<SearchAutoCompleteItem[]> {
    return this._autoCompleteYesNo$(query, SearchAutoCompleteType.COLLABORATION).pipe(
      map(value => (
        value.map(item => ({
            ...item,
            minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.COLLABORATION)
          })
        )
      ))) as Observable<SearchAutoCompleteItem[]>;
  }

  isSimpleMode(): boolean {
    return this._simpleMode;
  }

  setSimpleMode(value: boolean): void {
    this._simpleMode = value;
    this.cookieService.put(SEARCH_SETTINGS_SIMPLE_MODE_COOKIE, value.toString());
    this._simpleModeChangesSubject.next(value);
  }

  private _autoCompleteMatch(query: string, candidate: string): boolean {
    if (!query) {
      return false;
    }

    const normalizationFunction = (value: string) => value.replace(/\s+/g, "").toLowerCase();
    const normalizedQuery = normalizationFunction(query);
    const normalizedCandidate = normalizationFunction(candidate);
    return normalizedCandidate.includes(normalizedQuery);
  }

  private _autoCompleteYesNo$(query: string, type: SearchAutoCompleteType): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.values(["Y", "N"])
        .map(type => ({
          type,
          humanized: type === "Y" ? this.translateService.instant("Yes") : this.translateService.instant("No")
        }))
        .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          type,
          label: item.humanized,
          value: item.type === "Y"
        }))
    );
  }

  private _getMinimumSubscription(key: SearchAutoCompleteType): PayableProductInterface {
    return (
      this.allFiltersTypes.find(filterType => (filterType as any).key === key) as any
    ).minimumSubscription;
  }
}
