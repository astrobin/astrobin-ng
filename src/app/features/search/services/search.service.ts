import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { ComponentRef, Inject, Injectable, Type, ViewContainerRef } from "@angular/core";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { map, tap } from "rxjs/operators";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";
import { AUTO_COMPLETE_ONLY_FILTERS_TOKEN, SEARCH_FILTERS_TOKEN } from "@features/search/injection-tokens/search-filter.tokens";
import { DynamicSearchFilterLoaderService } from "@features/search/services/dynamic-search-filter-loader.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { CameraService } from "@features/equipment/services/camera.service";
import { DateService } from "@shared/services/date.service";
import { Month } from "@shared/enums/month.enum";
import { MatchType } from "@features/search/enums/match-type.enum";
import { AcquisitionType, DataSource, LicenseOptions, RemoteSource, SolarSystemSubjectType, SubjectType } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { ColorOrMono } from "@features/equipment/types/sensor.interface";
import { SensorService } from "@features/equipment/services/sensor.service";
import { CountryService } from "@shared/services/country.service";
import { SearchMinimumDataFilterValue } from "@features/search/components/filters/search-minimum-data-filter/search-minimum-data-filter.value";
import { SearchAwardFilterValue } from "@features/search/components/filters/search-award-filter/search-award-filter.value";
import { ConstellationsService } from "@features/explore/services/constellations.service";
import { BortleScale } from "@shared/interfaces/deep-sky-acquisition.interface";
import { FilterType } from "@features/equipment/types/filter.interface";
import { FilterService } from "@features/equipment/services/filter.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SearchPersonalFiltersFilterValue } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.value";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { SearchPaginatedApiResultInterface } from "@shared/services/api/interfaces/search-paginated-api-result.interface";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

export enum SearchAutoCompleteType {
  TEXT = "text",
  SEARCH_FILTER = "search_filter",
  SUBJECTS = "subjects",
  TELESCOPE = "telescope",
  CAMERA = "camera",
  TELESCOPE_TYPES = "telescope_types",
  CAMERA_TYPES = "camera_types",
  ACQUISITION_MONTHS = "acquisition_months",
  REMOTE_SOURCE = "remote_source",
  SUBJECT_TYPE = "subject_type",
  COLOR_OR_MONO = "color_or_mono",
  MODIFIED_CAMERA = "modified_camera",
  ANIMATED = "animated",
  VIDEO = "video",
  AWARD = "award",
  COUNTRY = "country",
  DATA_SOURCE = "data_source",
  MINIMUM_DATA = "minimum_data",
  CONSTELLATION = "constellation",
  BORTLE_SCALE = "bortle_scale",
  LICENSES = "licenses",
  CAMERA_PIXEL_SIZE = "camera_pixel_size",
  FIELD_RADIUS = "field_radius",
  PIXEL_SCALE = "pixel_scale",
  TELESCOPE_DIAMETER = "telescope_diameter",
  TELESCOPE_WEIGHT = "telescope_weight",
  MOUNT_WEIGHT = "mount_weight",
  MOUNT_MAX_PAYLOAD = "mount_max_payload",
  TELESCOPE_FOCAL_LENGTH = "telescope_focal_length",
  INTEGRATION_TIME = "integration_time",
  FILTER_TYPES = "filter_types",
  SIZE = "size",
  DATE_PUBLISHED = "date_published",
  DATE_ACQUIRED = "date_acquired",
  ACQUISITION_TYPE = "acquisition_type",
  MOON_PHASE = "moon_phase",
  COORDS = "coords",
  IMAGE_SIZE = "image_size",
  GROUPS = "groups",
  PERSONAL_FILTERS = "personal_filters"
}

export interface SearchAutoCompleteItem {
  type: SearchAutoCompleteType;
  label: string;
  value?: any;
  minimumSubscription?: PayableProductInterface;
}

@Injectable({
  providedIn: "root"
})
export class SearchService extends BaseService {
  searchCompleteSubject: Subject<SearchPaginatedApiResultInterface<any>> =
    new Subject<SearchPaginatedApiResultInterface<any>>();
  searchComplete$: Observable<SearchPaginatedApiResultInterface<any>>;
  private _autoCompleteItemsLimit = 15;
  private _autoCompleteTelescopeCache: { [query: string]: SearchAutoCompleteItem[] } = {};
  private _autoCompleteCameraCache: { [query: string]: SearchAutoCompleteItem[] } = {};

  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly dynamicSearchFilterLoaderService: DynamicSearchFilterLoaderService,
    @Inject(SEARCH_FILTERS_TOKEN) public readonly allFiltersTypes: Type<SearchFilterComponentInterface>[],
    @Inject(AUTO_COMPLETE_ONLY_FILTERS_TOKEN)
    public readonly autoCompleteOnlyFiltersTypes: Type<SearchFilterComponentInterface>[],
    public readonly telescopeService: TelescopeService,
    public readonly cameraService: CameraService,
    public readonly dateService: DateService,
    public readonly imageService: ImageService,
    public readonly sensorService: SensorService,
    public readonly countryService: CountryService,
    public readonly constellationService: ConstellationsService,
    public readonly filterService: FilterService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal
  ) {
    super(loadingService);

    this.searchComplete$ = this.searchCompleteSubject.asObservable();
  }

  modelToParams(model: SearchModelInterface): string {
    if (model.page === undefined) {
      model = { ...model, page: 1 };
    }

    if (model.pageSize === undefined) {
      model = { ...model, pageSize: 100 };
    }

    if (model.text === undefined) {
      model = { ...model, text: "" };
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

  getKeyByFilterComponentInstance(componentInstance: SearchFilterComponentInterface): string {
    return (componentInstance.constructor as any).key;
  }

  humanizeSearchAutoCompleteType(type: SearchAutoCompleteType): string {
    switch (type) {
      case SearchAutoCompleteType.TEXT:
        return this.translateService.instant("Free text");
      case SearchAutoCompleteType.SEARCH_FILTER:
        return this.translateService.instant("Search filters");
      case SearchAutoCompleteType.SUBJECTS:
        return this.translateService.instant("Subjects");
      case SearchAutoCompleteType.SUBJECT_TYPE:
        return this.translateService.instant("Subject type");
      case SearchAutoCompleteType.TELESCOPE:
        return this.translateService.instant("Telescopes or lens");
      case SearchAutoCompleteType.CAMERA:
        return this.translateService.instant("Camera");
      case SearchAutoCompleteType.TELESCOPE_TYPES:
        return this.translateService.instant("Telescope types");
      case SearchAutoCompleteType.CAMERA_TYPES:
        return this.translateService.instant("Camera types");
      case SearchAutoCompleteType.ACQUISITION_MONTHS:
        return this.translateService.instant("Acquisition months");
      case SearchAutoCompleteType.REMOTE_SOURCE:
        return this.translateService.instant("Remote hosting");
      case SearchAutoCompleteType.COLOR_OR_MONO:
        return this.translateService.instant("Color or mono cameras");
      case SearchAutoCompleteType.MODIFIED_CAMERA:
        return this.translateService.instant("Modified cameras");
      case SearchAutoCompleteType.ANIMATED:
        return this.translateService.instant("Animated images (GIF)");
      case SearchAutoCompleteType.VIDEO:
        return this.translateService.instant("Videos");
      case SearchAutoCompleteType.AWARD:
        return this.translateService.instant("IOTD/TP award");
      case SearchAutoCompleteType.COUNTRY:
        return this.translateService.instant("User country");
      case SearchAutoCompleteType.DATA_SOURCE:
        return this.translateService.instant("Data source");
      case SearchAutoCompleteType.MINIMUM_DATA:
        return this.translateService.instant("Minimum data");
      case SearchAutoCompleteType.CONSTELLATION:
        return this.translateService.instant("Constellation");
      case SearchAutoCompleteType.BORTLE_SCALE:
        return this.translateService.instant("Bortle scale");
      case SearchAutoCompleteType.LICENSES:
        return this.translateService.instant("Licenses");
      case SearchAutoCompleteType.CAMERA_PIXEL_SIZE:
        return this.translateService.instant("Camera pixel size");
      case SearchAutoCompleteType.FIELD_RADIUS:
        return this.translateService.instant("Field radius");
      case SearchAutoCompleteType.PIXEL_SCALE:
        return this.translateService.instant("Pixel scale");
      case SearchAutoCompleteType.TELESCOPE_DIAMETER:
        return this.translateService.instant("Telescope diameter");
      case SearchAutoCompleteType.TELESCOPE_WEIGHT:
        return this.translateService.instant("Telescope weight");
      case SearchAutoCompleteType.MOUNT_WEIGHT:
        return this.translateService.instant("Mount weight");
      case SearchAutoCompleteType.MOUNT_MAX_PAYLOAD:
        return this.translateService.instant("Mount max. payload");
      case SearchAutoCompleteType.TELESCOPE_FOCAL_LENGTH:
        return this.translateService.instant("Telescope focal length");
      case SearchAutoCompleteType.INTEGRATION_TIME:
        return this.translateService.instant("Integration time");
      case SearchAutoCompleteType.FILTER_TYPES:
        return this.translateService.instant("Filter types");
      case SearchAutoCompleteType.SIZE:
        return this.translateService.instant("File size");
      case SearchAutoCompleteType.DATE_PUBLISHED:
        return this.translateService.instant("Date published");
      case SearchAutoCompleteType.DATE_ACQUIRED:
        return this.translateService.instant("Date acquired");
      case SearchAutoCompleteType.ACQUISITION_TYPE:
        return this.translateService.instant("Acquisition type");
      case SearchAutoCompleteType.MOON_PHASE:
        return this.translateService.instant("Moon illumination");
      case SearchAutoCompleteType.COORDS:
        return this.translateService.instant("RA/Dec coordinates");
      case SearchAutoCompleteType.IMAGE_SIZE:
        return this.translateService.instant("Width and height");
      case SearchAutoCompleteType.GROUPS:
        return this.translateService.instant("In groups");
      case SearchAutoCompleteType.PERSONAL_FILTERS:
        return this.translateService.instant("Personal filters");
    }
  }

  humanizeMatchType(type: MatchType): string {
    switch (type) {
      case MatchType.ALL:
        return this.translateService.instant("All");
      case MatchType.ANY:
        return this.translateService.instant("Any");
    }
  }

  humanizePersonalFilter(value: SearchPersonalFiltersFilterValue): string {
    switch (value) {
      case SearchPersonalFiltersFilterValue.MY_IMAGES:
        return this.translateService.instant("My images");
      case SearchPersonalFiltersFilterValue.MY_LIKES:
        return this.translateService.instant("My likes");
      case SearchPersonalFiltersFilterValue.MY_BOOKMARKS:
        return this.translateService.instant("My bookmarks");
      case SearchPersonalFiltersFilterValue.MY_FOLLOWED_USERS:
        return this.translateService.instant("My followed users");
    }
  }

  allowFilter$(minimumSubscription: PayableProductInterface): Observable<boolean> {
    return forkJoin([
      this.userSubscriptionService.isLite$(),
      this.userSubscriptionService.isPremium$(),
      this.userSubscriptionService.isUltimate$()
    ]).pipe(
      map(([isLite, isPremium, isUltimate]) => ({
        isLite,
        isPremium,
        isUltimate
      })),
      map(({ isLite, isPremium, isUltimate }) => {
        return (
          (minimumSubscription === null || minimumSubscription === undefined) ||
          (minimumSubscription === PayableProductInterface.LITE && (isLite || isPremium || isUltimate)) ||
          (minimumSubscription === PayableProductInterface.PREMIUM && (isPremium || isUltimate)) ||
          (minimumSubscription === PayableProductInterface.ULTIMATE && isUltimate)
        );
      })
    );
  }

  autoCompleteFreeText$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of([
      {
        type: SearchAutoCompleteType.TEXT,
        label: query
      }
    ]);
  }

  autoCompleteSearchFilters$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      this.allFiltersTypes
        .filter(filterType => !this.autoCompleteOnlyFiltersTypes.includes(filterType))
        .filter(filterType =>
          this.humanizeSearchAutoCompleteType((filterType as any).key)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .map(filterType => {
          return {
            type: SearchAutoCompleteType.SEARCH_FILTER,
            label: this.humanizeSearchAutoCompleteType((filterType as any).key),
            value: (filterType as any).key,
            minimumSubscription: (filterType as any).minimumSubscription
          };
        })
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteSubjects$(query: string): Observable<SearchAutoCompleteItem[]> {
    const messierRange = Array.from({ length: 110 }, (_, i) => i + 1);
    const ngcRange = Array.from({ length: 7840 }, (_, i) => i + 1);
    const icRange = Array.from({ length: 5386 }, (_, i) => i + 1);
    const sh2Range = Array.from({ length: 313 }, (_, i) => i + 1);

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
      }))
    ];

    const commonSubjects = [
      "47 Tuc Cluster",
      "Andromeda Galaxy",
      "Antennae Galaxies",
      "Barbell Nebula",
      "Barnard's Galaxy",
      "Barnard's Merope Nebula",
      "Beehive cluster",
      "Black Eye Galaxy",
      "Blue Snowball",
      "Bode's Galaxy",
      "Bubble Nebula",
      "Butterfly Cluster",
      "California Nebula",
      "Carina Nebula",
      "Cat's Eye Nebula",
      "Centaurus A",
      "Checkmark Nebula",
      "Christmas Tree Cluster",
      "Cigar Galaxy",
      "Cocoon Nebula",
      "Coddington's Nebula",
      "Coma Pinwheel",
      "Cone nebula",
      "Cork Nebula",
      "Crab Nebula",
      "Crescent Nebula",
      "Double cluster",
      "Dumbbell Nebula",
      "Eagle Nebula",
      "Eskimo Nebula",
      "Eta Car Nebula",
      "Evil Eye Galaxy",
      "Filamentary nebula",
      "Fireworks Galaxy",
      "Flame Nebula",
      "Flaming Star Nebula",
      "Gamma Cas nebula",
      "Gamma Cyg nebula",
      "Gem A",
      "Great Cluster in Hercules",
      "Great Orion Nebula",
      "Helix Nebula",
      "Hercules Globular Cluster",
      "Herschel's Jewel Box",
      "Hind's Variable Nebula",
      "Horsehead Nebula",
      "Hourglass Nebula",
      "Hubble's Nebula",
      "Hubble's variable neb",
      "Iris Nebula",
      "Jewel Box",
      "Kappa Crucis Cluster",
      "Lace-work nebula",
      "Lagoon Nebula",
      "Lambda Cen nebula",
      "Little Dumbbell",
      "Lobster Nebula",
      "Lower Sword",
      "Maia Nebula",
      "Mairan's Nebula",
      "Merope Nebula",
      "Monkey Head Nebula",
      "Needle Galaxy",
      "Network nebula",
      "North America Nebula",
      "Omega Centauri",
      "Omega nebula",
      "Omi Per Cloud",
      "Orion Nebula",
      "Owl Cluster",
      "Owl Nebula",
      "Pearl Cluster",
      "Pelican Nebula",
      "Pencil Nebula",
      "Perseus A",
      "Pin-wheel nebula",
      "Praesepe Cluster",
      "Ptolemy's Cluster",
      "Rho Oph Nebula",
      "Rim Nebula",
      "Ring Nebula",
      "Rosette Nebula",
      "Sculptor Filament",
      "Sculptor Galaxy",
      "Siamese Twins",
      "Silver Coin",
      "Small Magellanic Cloud",
      "Small Sgr Star Cloud",
      "Sombrero Galaxy",
      "Southern Pinwheel Galaxy",
      "Southern Pleiades",
      "Star Queen",
      "Stephan's Quintet",
      "Sunflower Galaxy",
      "Swan Nebula",
      "Tarantula Nebula",
      "Tejat Prior",
      "Tet Car Cluster",
      "The Eyes",
      "The Running Man Nebula",
      "The War and Peace Nebula",
      "The Witch Head Nebula",
      "Triangulum Galaxy",
      "Triangulum Pinwheel",
      "Trifid Nebula",
      "Upper Sword",
      "Veil Nebula",
      "Virgo Cluster Pinwheel",
      "Virgo Galaxy",
      "Whale Galaxy",
      "Whirlpool Galaxy",
      "Wild Duck Cluster",
      "Wishing Well Cluster",
      "Witch Head nebula",
      "chi Persei Cluster",
      "h Persei Cluster",
      "Omega Nebula"
    ];

    subjects.push(
      ...commonSubjects.map(label => ({
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

    return this.equipmentApiService
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
                matchType: null
              },
              minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.TELESCOPE)
            };
          });
        }),
        tap(items => {
          this._autoCompleteTelescopeCache[query] = items;
        })
      );
  }

  autoCompleteCameras$(query: string): Observable<SearchAutoCompleteItem[]> {
    if (this._autoCompleteCameraCache[query]) {
      return of(this._autoCompleteCameraCache[query]);
    }

    return this.equipmentApiService
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
                matchType: null
              },
              minimumSubscription: this._getMinimumSubscription(SearchAutoCompleteType.CAMERA)
            };
          });
        }),
        tap(items => {
          this._autoCompleteCameraCache[query] = items;
        })
      );
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
          humanized: this.humanizePersonalFilter(type)
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

  openSubscriptionRequiredModal(minimumSubscription: PayableProductInterface): void {
    const modalRef = this.modalService.open(SubscriptionRequiredModalComponent);
    let value: SimplifiedSubscriptionName;

    switch (minimumSubscription) {
      case PayableProductInterface.LITE:
        value = SimplifiedSubscriptionName.ASTROBIN_LITE;
        break;
      case PayableProductInterface.PREMIUM:
        value = SimplifiedSubscriptionName.ASTROBIN_PREMIUM;
        break;
      case PayableProductInterface.ULTIMATE:
        value = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
        break;
    }

    modalRef.componentInstance.minimumSubscription = value;
  }

  private _autoCompleteMatch(query: string, candidate: string): boolean {
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
