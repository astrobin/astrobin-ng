import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { ComponentRef, Inject, Injectable, Type, ViewContainerRef } from "@angular/core";
import { Observable, of } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { map } from "rxjs/operators";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { SearchFilterComponentInterface } from "@features/search/interfaces/search-filter-component.interface";
import {
  AUTO_COMPLETE_ONLY_FILTERS_TOKEN,
  SEARCH_FILTERS_TOKEN
} from "@features/search/injection-tokens/search-filter.tokens";
import { DynamicSearchFilterLoaderService } from "@features/search/services/dynamic-search-filter-loader.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { CameraService } from "@features/equipment/services/camera.service";
import { DateService } from "@shared/services/date.service";
import { Month } from "@shared/enums/month.enum";
import { MatchType } from "@features/search/enums/match-type.enum";
import { RemoteSource, SolarSystemSubjectType, SubjectType } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { ColorOrMono } from "@features/equipment/types/sensor.interface";
import { SensorService } from "@features/equipment/services/sensor.service";

export enum SearchAutoCompleteType {
  SEARCH_FILTER = "search_filter",
  SUBJECT = "subject",
  TELESCOPE = "telescope",
  CAMERA = "camera",
  TELESCOPE_TYPE = "telescope_type",
  CAMERA_TYPE = "camera_type",
  ACQUISITION_MONTHS = "acquisition_months",
  REMOTE_SOURCE = "remote_source",
  SUBJECT_TYPE = "subject_type",
  COLOR_OR_MONO = "color_or_mono",
  MODIFIED_CAMERA = "modified_camera",
  ANIMATED = "animated",
}

export interface SearchAutoCompleteItem {
  type: SearchAutoCompleteType;
  label: string;
  value?: any;
}

@Injectable({
  providedIn: "root"
})
export class SearchService extends BaseService {
  private _autoCompleteItemsLimit = 15;

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
    public readonly sensorService: SensorService
  ) {
    super(loadingService);
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
      case SearchAutoCompleteType.SEARCH_FILTER:
        return this.translateService.instant("Search filters");
      case SearchAutoCompleteType.SUBJECT:
        return this.translateService.instant("Subjects");
      case SearchAutoCompleteType.SUBJECT_TYPE:
        return this.translateService.instant("Subject types");
      case SearchAutoCompleteType.TELESCOPE:
        return this.translateService.instant("Telescopes & lenses");
      case SearchAutoCompleteType.CAMERA:
        return this.translateService.instant("Cameras");
      case SearchAutoCompleteType.TELESCOPE_TYPE:
        return this.translateService.instant("Telescope types");
      case SearchAutoCompleteType.CAMERA_TYPE:
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
        return this.translateService.instant("Animated images");
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
            value: (filterType as any).key
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
        type: SearchAutoCompleteType.SUBJECT,
        label: `M ${i}`
      })),
      ...ngcRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
        label: `NGC ${i}`
      })),
      ...icRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
        label: `IC ${i}`
      })),
      ...sh2Range.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
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
        type: SearchAutoCompleteType.SUBJECT,
        label
      }))
    );

    return new Observable<SearchAutoCompleteItem[]>(subscriber => {
      const normalizedQuery = query.replace(/\s+/g, "").toLowerCase();
      const filteredSubjects = subjects
        .filter(subject => subject.label.replace(/\s+/g, "").toLowerCase().includes(normalizedQuery))
        .map(subjects => ({ ...subjects, value: subjects.label }))
        .slice(0, this._autoCompleteItemsLimit);
      subscriber.next(filteredSubjects);
      subscriber.complete();
    });
  }

  autoCompleteTelescopes$(query: string): Observable<SearchAutoCompleteItem[]> {
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
              value
            };
          });
        })
      );
  }

  autoCompleteCameras$(query: string): Observable<SearchAutoCompleteItem[]> {
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
              value
            };
          });
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
        .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          type: SearchAutoCompleteType.TELESCOPE_TYPE,
          label: item.humanized,
          value: item.type
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
        .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          type: SearchAutoCompleteType.CAMERA_TYPE,
          label: item.humanized,
          value: item.type
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
        .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          type: SearchAutoCompleteType.ACQUISITION_MONTHS,
          label: item.humanized,
          value: {
            months: [item.month],
            matchType: null
          }
        }))
        .slice(0, this._autoCompleteItemsLimit)
    );
  }

  autoCompleteRemoteSources$(query: string): Observable<SearchAutoCompleteItem[]> {
    return of(
      Object.entries(RemoteSource)
        .filter(([_, humanized]) => humanized.toLowerCase().includes(query.toLowerCase()))
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
      .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
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
      .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
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
        .filter(item => item.humanized.toLowerCase().includes(query.toLowerCase()))
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
    return this._autoCompleteYesNo$(query, SearchAutoCompleteType.MODIFIED_CAMERA);
  }

  autoCompleteAnimated$(query: string): Observable<SearchAutoCompleteItem[]> {
    return this._autoCompleteYesNo$(query, SearchAutoCompleteType.ANIMATED);
  }

  _autoCompleteYesNo$(query: string, type: SearchAutoCompleteType): Observable<SearchAutoCompleteItem[]> {
    return of(Object.values(["Y", "N"])
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
}
